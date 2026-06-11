import crypto from "crypto";

const TOKEN_SECRET =
  process.env.TOKEN_SECRET ||
  "patron_wings_token_seguro_2026_Bela1997_local_845219_x9";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  "https://defdwzzewzfjuseozwkn.supabase.co";

const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

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

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).json({
      ok: true
    });
  }

  if (req.method !== "GET") {
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
        error: "Sesión inválida o vencida."
      });
    }

    const customerId = Number(getCustomerId(session));

    if (!Number.isFinite(customerId) || customerId <= 0) {
      return res.status(400).json({
        ok: false,
        error: "No se pudo identificar al cliente."
      });
    }

    const statusRows = await supabaseRequest("/rest/v1/rpc/vip_get_roulette_status", {
      method: "POST",
      body: JSON.stringify({
        p_customer_id: customerId
      })
    });

    const status = Array.isArray(statusRows) ? statusRows[0] : statusRows;

    if (!status) {
      return res.status(404).json({
        ok: false,
        error: "No se encontró información VIP del cliente."
      });
    }

    let history = [];

    try {
      const historyRows = await supabaseRequest("/rest/v1/rpc/vip_get_roulette_history", {
        method: "POST",
        body: JSON.stringify({
          p_customer_id: customerId,
          p_limit: 20
        })
      });

      history = Array.isArray(historyRows) ? historyRows : [];
    } catch {
      history = [];
    }

    return res.status(200).json({
      ok: true,
      status,
      history
    });
  } catch (err) {
    console.error("ERROR /api/roulette-status:", err);

    return res.status(500).json({
      ok: false,
      error: "Error obteniendo estado del VIP Slot.",
      detail: err.message || String(err),
      status: err.status || null,
      body: err.body || null
    });
  }
}
