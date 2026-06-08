import crypto from "crypto";

const TOKEN_SECRET = process.env.TOKEN_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

function cleanPhone(value) {
  return String(value || "").replace(/\D/g, "").trim();
}

function checkEnv() {
  if (!TOKEN_SECRET) {
    throw new Error("Falta TOKEN_SECRET en variables de entorno.");
  }

  if (!SUPABASE_URL) {
    throw new Error("Falta SUPABASE_URL en variables de entorno.");
  }

  if (!SUPABASE_ANON_KEY) {
    throw new Error("Falta SUPABASE_ANON_KEY en variables de entorno.");
  }
}

function verifyToken(token) {
  try {
    if (!token || !token.includes(".")) return null;

    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [base, sig] = parts;

    const expected = crypto
      .createHmac("sha256", TOKEN_SECRET)
      .update(base)
      .digest("base64url");

    if (sig !== expected) return null;

    const json = Buffer.from(base, "base64url").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getCustomerId(session) {
  return (
    session.customer_id ||
    session.customerId ||
    session.id ||
    session.user_id ||
    session.userId ||
    null
  );
}

async function supabaseRequest(path, options = {}) {
  const response = await fetch(SUPABASE_URL + path, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {})
    }
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const msg =
      data?.message ||
      data?.details ||
      data?.hint ||
      data?.raw ||
      "Error en Supabase";

    const err = new Error(msg);
    err.status = response.status;
    err.body = data;
    throw err;
  }

  return data;
}

async function findCustomerIdByPhone(phone) {
  const celular = cleanPhone(phone);
  if (!celular) return null;

  const rows = await supabaseRequest(
    "/rest/v1/customers?select=id,celular&limit=1000",
    {
      method: "GET"
    }
  );

  const customer = Array.isArray(rows)
    ? rows.find((item) => cleanPhone(item.celular) === celular)
    : null;

  return customer?.id || null;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).json({
      ok: true
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Método no permitido."
    });
  }

  try {
    checkEnv();

    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

    const session = verifyToken(token);

    if (!session) {
      return res.status(401).json({
        ok: false,
        error: "Sesión inválida o vencida. Vuelve a iniciar sesión."
      });
    }

    let customerId = getCustomerId(session);

    if (!customerId) {
      customerId = await findCustomerIdByPhone(
        session.celular ||
          session.phone ||
          session.telefono ||
          session.telefono_cliente ||
          ""
      );
    }

    customerId = Number(customerId);

    if (!Number.isFinite(customerId) || customerId <= 0) {
      return res.status(400).json({
        ok: false,
        error: "No se pudo identificar al cliente."
      });
    }

    const result = await supabaseRequest("/rest/v1/rpc/vip_spin_roulette", {
      method: "POST",
      body: JSON.stringify({
        p_customer_id: customerId
      })
    });

    const spin = Array.isArray(result) ? result[0] : result;

    if (!spin) {
      return res.status(500).json({
        ok: false,
        error: "No se pudo generar la jugada."
      });
    }

    return res.status(200).json({
      ok: true,
      spin
    });
  } catch (err) {
    console.error("ERROR /api/spin-roulette:", err);

    return res.status(500).json({
      ok: false,
      error: "No se pudo jugar el VIP Slot.",
      detail: err.message || String(err),
      status: err.status || null,
      body: err.body || null
    });
  }
}
