export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const celular = String(req.query.celular || "").replace(/\D/g, "").trim();

    if (!celular) {
      return res.status(400).json({ error: "Falta celular" });
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
        encodeURIComponent(celular) +
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

    const cardRes = await fetch(
      SUPABASE_URL +
        "/rest/v1/loyalty_cards?select=id,customer_id,sellos_actuales,meta_sellos,premio_pendiente,puntos_disponibles,puntos_ranking,sellos_migrados,puntos_migrados_desde_sellos,puntos_actualizados_at,ultimo_movimiento_at,created_at&customer_id=eq." +
        encodeURIComponent(customer.id) +
        "&limit=1",
      { headers }
    );

    if (!cardRes.ok) {
      const txt = await cardRes.text();
      return res.status(500).json({
        error: "Error buscando tarjeta VIP",
        detail: txt
      });
    }

    const cardRows = await cardRes.json();
    const card = cardRows && cardRows[0];

    if (!card || !card.id) {
      return res.status(404).json({
        error: "Cliente encontrado, pero sin tarjeta VIP"
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

    if (!status) {
      const puntosDisponibles = Number(card.puntos_disponibles || 0);

      status = {
        customer_id: Number(customer.id),
        loyalty_card_id: Number(card.id),
        nombre: customer.nombre || "",
        celular: customer.celular || "",
        puntos_disponibles: puntosDisponibles,
        puntos_ranking: Number(card.puntos_ranking || 0),
        giros_hoy: 0,
        giros_restantes: puntosDisponibles >= 20 ? 3 : 0,
        costo_giro: 20,
        puede_girar: puntosDisponibles >= 20,
        mensaje: puntosDisponibles >= 20
          ? "Puedes girar la ruleta."
          : "No tienes puntos suficientes. Necesitas 20 puntos para girar."
      };
    }

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
          "&order=created_at.desc&limit=30",
        { headers }
      );

      if (movementsRes.ok) {
        pointMovements = await movementsRes.json();
      }
    } catch {}

    return res.status(200).json({
      ok: true,
      customer: {
        id: Number(customer.id),
        nombre: customer.nombre || "",
        celular: customer.celular || ""
      },
      card: {
        id: Number(card.id),
        customer_id: Number(card.customer_id),

        sellos_actuales: Number(card.sellos_actuales || 0),
        meta_sellos: Number(card.meta_sellos || 20),
        premio_pendiente: !!card.premio_pendiente,

        puntos_disponibles: Number(card.puntos_disponibles || 0),
        puntos_ranking: Number(card.puntos_ranking || 0),
        sellos_migrados: !!card.sellos_migrados,
        puntos_migrados_desde_sellos: Number(card.puntos_migrados_desde_sellos || 0),
        puntos_actualizados_at: card.puntos_actualizados_at || null,
        ultimo_movimiento_at: card.ultimo_movimiento_at || null,
        created_at: card.created_at || null
      },
      status,
      rouletteHistory,
      pointMovements,

      history: rouletteHistory,
      movements: pointMovements
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error inesperado",
      detail: err.message || String(err)
    });
  }
}
