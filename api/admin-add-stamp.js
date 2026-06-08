export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const {
      celular,
      puntos,
      descripcion,
      referencia
    } = req.body || {};

    const cleanCell = String(celular || "").replace(/\D/g, "").trim();
    const puntosAgregar = Math.floor(Number(puntos || 0));

    if (!cleanCell) {
      return res.status(400).json({ error: "Falta celular" });
    }

    if (!puntosAgregar || puntosAgregar <= 0) {
      return res.status(400).json({
        error: "Faltan puntos",
        detail: "Debes enviar una cantidad de puntos mayor a 0."
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

    const customerRes = await fetch(
      SUPABASE_URL +
        "/rest/v1/customers?select=id,nombre,celular&celular=eq." +
        encodeURIComponent(cleanCell) +
        "&limit=1",
      { headers }
    );

    if (!customerRes.ok) {
      const txt = await customerRes.text();
      return res.status(500).json({
        error: "Error buscando cliente",
        detail: txt
      });
    }

    const customerRows = await customerRes.json();
    const customer = customerRows && customerRows[0];

    if (!customer || !customer.id) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    const descripcionFinal =
      String(descripcion || "").trim() ||
      "Puntos por compra: +" + puntosAgregar;

    const referenciaFinal =
      String(referencia || "").trim() ||
      "admin_puntos_" + Date.now();

    const rpcRes = await fetch(
      SUPABASE_URL + "/rest/v1/rpc/vip_admin_add_points",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          p_customer_id: Number(customer.id),
          p_puntos: puntosAgregar,
          p_descripcion: descripcionFinal,
          p_referencia: referenciaFinal
        })
      }
    );

    if (!rpcRes.ok) {
      const txt = await rpcRes.text();
      return res.status(500).json({
        error: "Error sumando puntos",
        detail: txt
      });
    }

    const rpcRows = await rpcRes.json();
    const rpcResult = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;

    const cardRes = await fetch(
      SUPABASE_URL +
        "/rest/v1/loyalty_cards?select=id,customer_id,sellos_actuales,meta_sellos,premio_pendiente,puntos_disponibles,puntos_ranking,sellos_migrados,puntos_migrados_desde_sellos,puntos_actualizados_at&customer_id=eq." +
        encodeURIComponent(customer.id) +
        "&limit=1",
      { headers }
    );

    if (!cardRes.ok) {
      const txt = await cardRes.text();
      return res.status(500).json({
        error: "Se sumaron puntos, pero falló cargar tarjeta",
        detail: txt
      });
    }

    const cardRows = await cardRes.json();
    const card = cardRows && cardRows[0];

    if (!card || !card.id) {
      return res.status(404).json({
        error: "Se sumaron puntos, pero no se encontró la tarjeta VIP"
      });
    }

    let status = null;

    try {
      const statusRes = await fetch(
        SUPABASE_URL + "/rest/v1/rpc/vip_get_roulette_status",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            p_customer_id: Number(customer.id)
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
            p_customer_id: Number(customer.id),
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
          encodeURIComponent(customer.id) +
          "&order=created_at.desc&limit=20",
        { headers }
      );

      if (movementsRes.ok) {
        pointMovements = await movementsRes.json();
      }
    } catch {}

    return res.status(200).json({
      ok: true,
      message: "Se sumaron " + puntosAgregar + " puntos correctamente.",
      customer: {
        id: customer.id,
        nombre: customer.nombre || "",
        celular: customer.celular || ""
      },
      card: {
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
      },
      status,
      rouletteHistory,
      pointMovements,
      result: rpcResult || null
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error inesperado",
      detail: err.message || String(err)
    });
  }
}
