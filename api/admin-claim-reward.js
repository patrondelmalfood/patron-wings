export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const {
      prize_unique_code,
      codigo,
      code,
      delivered_by,
      entregado_por
    } = req.body || {};

    const prizeCode = String(
      prize_unique_code || codigo || code || ""
    ).trim().toUpperCase();

    const deliveredBy = String(
      delivered_by || entregado_por || "admin"
    ).trim() || "admin";

    if (!prizeCode) {
      return res.status(400).json({
        error: "Falta código del premio",
        detail: "Debes enviar el código generado por la Ruleta VIP. Ej: PDM-260608-D53C65"
      });
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
      SUPABASE_URL + "/rest/v1/rpc/vip_admin_deliver_prize",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          p_prize_unique_code: prizeCode,
          p_delivered_by: deliveredBy
        })
      }
    );

    if (!rpcRes.ok) {
      const txt = await rpcRes.text();

      let mensaje = "No se pudo entregar el premio.";

      if (txt.includes("Código de premio no encontrado")) {
        mensaje = "Código de premio no encontrado.";
      }

      if (txt.includes("no está pendiente")) {
        mensaje = "Este premio ya no está pendiente o ya fue entregado.";
      }

      if (txt.includes("ya venció")) {
        mensaje = "Este premio ya venció.";
      }

      return res.status(400).json({
        ok: false,
        error: mensaje,
        detail: txt
      });
    }

    const rpcRows = await rpcRes.json();
    const delivered = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;

    if (!delivered || !delivered.customer_id) {
      return res.status(500).json({
        ok: false,
        error: "Se procesó la entrega, pero no se recibió información del premio."
      });
    }

    const customerId = Number(delivered.customer_id);

    let card = null;

    try {
      const cardRes = await fetch(
        SUPABASE_URL +
          "/rest/v1/loyalty_cards?select=id,customer_id,sellos_actuales,meta_sellos,premio_pendiente,puntos_disponibles,puntos_ranking,sellos_migrados,puntos_migrados_desde_sellos,puntos_actualizados_at&customer_id=eq." +
          encodeURIComponent(customerId) +
          "&limit=1",
        { headers }
      );

      if (cardRes.ok) {
        const cardRows = await cardRes.json();
        card = cardRows && cardRows[0] ? cardRows[0] : null;
      }
    } catch {}

    let status = null;

    try {
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

      if (statusRes.ok) {
        const statusRows = await statusRes.json();
        status = Array.isArray(statusRows) ? statusRows[0] : statusRows;
      }
    } catch {}

    let rouletteHistory = [];

    try {
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

      if (historyRes.ok) {
        rouletteHistory = await historyRes.json();
      }
    } catch {}

    let pointMovements = [];

    try {
      const movementsRes = await fetch(
        SUPABASE_URL +
          "/rest/v1/vip_point_movements?select=id,customer_id,loyalty_card_id,tipo,puntos,puntos_antes,puntos_despues,puntos_ranking_antes,puntos_ranking_despues,descripcion,referencia,created_at&customer_id=eq." +
          encodeURIComponent(customerId) +
          "&order=created_at.desc&limit=30",
        { headers }
      );

      if (movementsRes.ok) {
        pointMovements = await movementsRes.json();
      }
    } catch {}

    return res.status(200).json({
      ok: true,
      message: "Premio marcado como entregado.",
      delivered,
      customer: {
        id: customerId,
        nombre: delivered.nombre || "",
        celular: delivered.celular || ""
      },
      card: card ? {
        id: card.id,
        customer_id: card.customer_id,
        sellos_actuales: Number(card.sellos_actuales || 0),
        meta_sellos: Number(card.meta_sellos || 20),
        premio_pendiente: !!card.premio_pendiente,
        puntos_disponibles: Number(card.puntos_disponibles || 0),
        puntos_ranking: Number(card.puntos_ranking || 0),
        sellos_migrados: !!card.sellos_migrados,
        puntos_migrados_desde_sellos: Number(card.puntos_migrados_desde_sellos || 0),
        puntos_actualizados_at: card.puntos_actualizados_at || null
      } : null,
      status,
      rouletteHistory,
      pointMovements,
      history: rouletteHistory,
      movements: pointMovements
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "Error inesperado",
      detail: err.message || String(err)
    });
  }
}
