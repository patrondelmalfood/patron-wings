const crypto = require("crypto");

const SUPABASE_URL = "https://defdwzzewzfjuseozwkn.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmR3enpld3pmanVzZW96d2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODE4NTMsImV4cCI6MjA4OTM1Nzg1M30.WgVc6PT9rwAEk4yn2i63GyOUl0CTZE6J-7r_2mpumAs";

const TOKEN_SECRET =
  process.env.TOKEN_SECRET ||
  "patron_wings_token_seguro_2026_Bela1997_local_845219_x9";

function json(res, status, body) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(status).send(JSON.stringify(body));
}

function cleanPhone(value) {
  return String(value || "").replace(/\D/g, "").trim();
}

function base64UrlDecode(value) {
  value = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  while (value.length % 4) value += "=";
  return Buffer.from(value, "base64").toString("utf8");
}

function base64UrlEncode(buffer) {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function verifyJwtHS256(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) {
    throw new Error("Token inválido.");
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  const header = JSON.parse(base64UrlDecode(headerB64));
  if (header.alg !== "HS256") {
    throw new Error("Algoritmo de token no permitido.");
  }

  const expectedSignature = base64UrlEncode(
    crypto
      .createHmac("sha256", TOKEN_SECRET)
      .update(headerB64 + "." + payloadB64)
      .digest()
  );

  if (expectedSignature !== signatureB64) {
    throw new Error("Firma de token inválida.");
  }

  const payload = JSON.parse(base64UrlDecode(payloadB64));

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    throw new Error("Sesión vencida.");
  }

  return payload;
}

function getBearerToken(req) {
  const auth = req.headers.authorization || req.headers.Authorization || "";
  if (!auth.startsWith("Bearer ")) return "";
  return auth.replace("Bearer ", "").trim();
}

function getCustomerIdFromPayload(payload) {
  return (
    payload.customer_id ||
    payload.customerId ||
    payload.id ||
    payload.sub ||
    payload.user_id ||
    payload.userId ||
    null
  );
}

async function supabaseFetch(path, options = {}) {
  const response = await fetch(SUPABASE_URL + path, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      Prefer: "return=representation",
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
      "Error Supabase";

    const err = new Error(msg);
    err.status = response.status;
    err.body = data;
    throw err;
  }

  return data;
}

async function findCustomerIdByPhone(phone) {
  const target = cleanPhone(phone);
  if (!target) return null;

  const rows = await supabaseFetch(
    "/rest/v1/customers?select=id,celular&limit=1000",
    { method: "GET" }
  );

  const found = Array.isArray(rows)
    ? rows.find((c) => cleanPhone(c.celular) === target)
    : null;

  return found?.id || null;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true });
  }

  if (req.method !== "POST") {
    return json(res, 405, {
      ok: false,
      error: "Método no permitido. Usa POST."
    });
  }

  try {
    const token = getBearerToken(req);

    if (!token) {
      return json(res, 401, {
        ok: false,
        error: "Sesión inválida. Vuelve a iniciar sesión."
      });
    }

    let payload;
    try {
      payload = verifyJwtHS256(token);
    } catch (err) {
      return json(res, 401, {
        ok: false,
        error: "Sesión vencida o inválida. Vuelve a iniciar sesión.",
        detail: err.message || String(err)
      });
    }

    let customerId = getCustomerIdFromPayload(payload);

    if (!customerId) {
      const phone =
        payload.celular ||
        payload.phone ||
        payload.telefono ||
        payload.mobile ||
        "";

      customerId = await findCustomerIdByPhone(phone);
    }

    if (!customerId) {
      return json(res, 400, {
        ok: false,
        error: "No se pudo identificar al cliente.",
        detail: "Cierra sesión e inicia sesión nuevamente."
      });
    }

    const result = await supabaseFetch("/rest/v1/rpc/vip_spin_roulette", {
      method: "POST",
      body: JSON.stringify({
        p_customer_id: Number(customerId)
      })
    });

    const spin = Array.isArray(result) ? result[0] : result;

    if (!spin) {
      return json(res, 500, {
        ok: false,
        error: "No se pudo generar la jugada."
      });
    }

    return json(res, 200, {
      ok: true,
      spin
    });
  } catch (err) {
    return json(res, 500, {
      ok: false,
      error: "No se pudo jugar el VIP Slot.",
      detail: err.message || String(err),
      status: err.status || null,
      body: err.body || null
    });
  }
};
