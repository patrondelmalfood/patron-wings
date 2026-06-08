import crypto from "crypto";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "patron_wings_token_seguro_2026_Bela1997_local_845219_x9";

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
    const SUPABASE_ANON_KEY = "TU_SUPABASE_ANON_KEY_AQUI";

    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    };

    const rpcRes = await fetch(
      SUPABASE_URL + "/rest/v1/rpc/vip_get_roulette_status",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          p_customer_id: Number(session.customer_id)
        })
      }
    );

    if (!rpcRes.ok) {
      const txt = await rpcRes.text();
      return res.status(500).json({
        error: "Error obteniendo estado de ruleta",
        detail: txt
      });
    }

    const rows = await rpcRes.json();
    const status = Array.isArray(rows) ? rows[0] : rows;

    if (!status) {
      return res.status(404).json({
        error: "No se encontró información VIP del cliente"
      });
    }

    return res.status(200).json({
      ok: true,
      status
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error inesperado",
      detail: err.message || String(err)
    });
  }
}
