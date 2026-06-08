import crypto from "crypto";

const TOKEN_SECRET =
  process.env.TOKEN_SECRET ||
  "patron_wings_token_seguro_2026_Bela1997_local_845219_x9";

function verifyToken(token) {
  try {
    if (!token || !token.includes(".")) return null;

    const [base, sig] = token.split(".");
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
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const session = verifyToken(token);

    if (!session || !session.customer_id || !session.celular) {
      return res.status(401).json({ error: "Sesión inválida o vencida" });
    }

    const SUPABASE_URL = "https://defdwzzewzfjuseozwkn.supabase.co";
    const SUPABASE_ANON_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmR3enpld3pmanVzZW96d2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODE4NTMsImV4cCI6MjA4OTM1Nzg1M30.WgVc6PT9rwAEk4yn2i63GyOUl0CTZE6J-7r_2mpumAs";

    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    };

    const rpcRes = await fetch(
      SUPABASE_URL + "/rest/v1/rpc/vip_get_roulette_history",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          p_customer_id: Number(session.customer_id),
          p_limit: 20
        })
      }
    );

    if (!rpcRes.ok) {
      const txt = await rpcRes.text();
      return res.status(500).json({
        ok: false,
        error: "Error obteniendo historial de ruleta",
        detail: txt
      });
    }

    const history = await rpcRes.json();

    return res.status(200).json({
      ok: true,
      history
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "Error inesperado",
      detail: err.message || String(err)
    });
  }
}
