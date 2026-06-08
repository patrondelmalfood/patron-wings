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
      "AQUI_DEJA_LA_MISMA_CLAVE_LARGA_QUE_YA_TIENES_EN_TU_ROULETTE_STATUS";

    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    };

    const customerId = Number(session.customer_id);

    const statusRes = await fetch(
      SUPABASE_URL + "/rest/v1/rpc/vip_get_roulette_status",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          p_customer_id: customerId
        })
      }
    );

    if (!statusRes.ok) {
      const txt = await statusRes.text();
      return res.status(500).json({
        ok: false,
        error: "Error obteniendo estado de ruleta",
        detail: txt
      });
    }

    const statusRows = await statusRes.json();
    const status = Array.isArray(statusRows) ? statusRows[0] : statusRows;

    if (!status) {
      return res.status(404).json({
        ok: false,
        error: "No se encontró información VIP del cliente"
      });
    }

    const historyRes = await fetch(
      SUPABASE_URL + "/rest/v1/rpc/vip_get_roulette_history",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          p_customer_id: customerId,
          p_limit: 20
        })
      }
    );

    let history = [];

    if (historyRes.ok) {
      history = await historyRes.json();
    }

    return res.status(200).json({
      ok: true,
      status,
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
