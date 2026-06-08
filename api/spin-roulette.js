import crypto from "crypto";

const TOKEN_SECRET =
  process.env.TOKEN_SECRET ||
  "patron_wings_token_seguro_2026_Bela1997_local_845219_x9";

const SUPABASE_URL = "https://defdwzzewzfjuseozwkn.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImRlZmR3enpld3pmanVzZW96d2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODE4NTMsImV4cCI6MjA4OTM1Nzg1M30.WgVc6PT9rwAEk4yn2i63GyOUl0CTZE6J-7r_2mpumAs";

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

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Método no permitido"
    });
  }

  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

    const session = verifyToken(token);

    if (!session || !session.customer_id || !session.celular) {
      return res.status(401).json({
        ok: false,
        error: "Sesión inválida o vencida. Vuelve a iniciar sesión."
      });
    }

    const customerId = Number(session.customer_id);

    if (!customerId) {
      return res.status(400).json({
        ok: false,
        error: "No se pudo identificar al cliente."
      });
    }

    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    };

    const spinRes = await fetch(
      SUPABASE_URL + "/rest/v1/rpc/vip_spin_roulette",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          p_customer_id: customerId
        })
      }
    );

    const spinText = await spinRes.text();

    let spinData = null;

    try {
      spinData = spinText ? JSON.parse(spinText) : null;
    } catch {
      spinData = null;
    }

    if (!spinRes.ok) {
      return res.status(500).json({
        ok: false,
        error: "No se pudo jugar el VIP Slot.",
        detail: spinText || "Error en Supabase"
      });
    }

    const spin = Array.isArray(spinData) ? spinData[0] : spinData;

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
      error: "Error inesperado al jugar.",
      detail: err.message || String(err)
    });
  }
}
