const jwt = require("jsonwebtoken");

const SUPABASE_URL = "https://defdwzzewzfjuseozwkn.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmR3enpld3pmanVzZW96d2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODE4NTMsImV4cCI6MjA4OTM1Nzg1M30.WgVc6PT9rwAEk4yn2i63GyOUl0CTZE6J-7r_2mpumAs";

const TOKEN_SECRET =
  process.env.TOKEN_SECRET ||
  "patron_wings_token_seguro_2026_Bela1997_local_845219_x9";

function cleanPhone(value) {
  return String(value || "").replace(/\D/g, "").trim();
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
  const res = await fetch(SUPABASE_URL + path, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const text = await res.text();

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const detail =
      data && typeof data === "object"
        ? data.message || data.details || data.hint || JSON.stringify(data)
        : String(data || "");

    const err = new Error(detail || "Error Supabase");
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}

async function findCustomerIdByPhone(phone) {
  const celular = cleanPhone(phone);
  if (!celular) return null;

  const data = await supabaseFetch(
    "/rest/v1/customers?select=id,celular&celular=eq." +
      encodeURIComponent(celular) +
      "&limit=1",
    { method: "GET" }
  );

  const customer = Array.isArray(data) ? data[0] : null;
  return customer && customer.id ? customer.id : null;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Método no permitido. Usa POST."
    });
  }

  try {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({
        ok: false,
        error: "Sesión inválida. Vuelve a iniciar sesión."
      });
    }

    let payload = null;

    try {
      payload = jwt.verify(token, TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({
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
      return res.status(400).json({
        ok: false,
        error: "No se pudo identificar al cliente para jugar.",
        detail: "El token no trae customer_id/id válido. Cierra sesión e inicia sesión nuevamente."
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
    return res.status(500).json({
      ok: false,
      error: "No se pudo jugar el VIP Slot.",
      detail: err.message || String(err),
      status: err.status || null,
      body: err.body || null
    });
  }
};
