export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { celular, nota } = req.body || {};
    const cleanCell = String(celular || "").replace(/\D/g, "").trim();
    const cleanNote = String(nota || "").trim();

    if (!cleanCell) {
      return res.status(400).json({ error: "Falta celular" });
    }

    if (!cleanNote) {
      return res.status(400).json({ error: "Falta la nota del premio entregado" });
    }

    const SUPABASE_URL = "https://defdwzzewzfjuseozwkn.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmR3enpld3pmanVzZW96d2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODE4NTMsImV4cCI6MjA4OTM1Nzg1M30.WgVc6PT9rwAEk4yn2i63GyOUl0CTZE6J-7r_2mpumAs";

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

    const cardRes = await fetch(
      SUPABASE_URL +
        "/rest/v1/loyalty_cards?select=id,customer_id,sellos_actuales,meta_sellos,premio_pendiente&customer_id=eq." +
        encodeURIComponent(customer.id) +
        "&limit=1",
      { headers }
    );

    if (!cardRes.ok) {
      const txt = await cardRes.text();
      return res.status(500).json({
        error: "Error buscando tarjeta",
        detail: txt
      });
    }

    const cardRows = await cardRes.json();
    const card = cardRows && cardRows[0];

    if (!card || !card.id) {
      return res.status(404).json({ error: "Cliente encontrado, pero sin tarjeta" });
    }

    const updateRes = await fetch(
      SUPABASE_URL +
        "/rest/v1/loyalty_cards?id=eq." +
        encodeURIComponent(card.id),
      {
        method: "PATCH",
        headers: {
          ...headers,
          Prefer: "return=representation"
        },
        body: JSON.stringify({
          premio_pendiente: false
        })
      }
    );

    if (!updateRes.ok) {
      const txt = await updateRes.text();
      return res.status(500).json({
        error: "Error actualizando tarjeta",
        detail: txt
      });
    }

    const movementRes = await fetch(
      SUPABASE_URL + "/rest/v1/loyalty_movements",
      {
        method: "POST",
        headers: {
          ...headers,
          Prefer: "return=representation"
        },
        body: JSON.stringify([{
          customer_id: customer.id,
          tipo: "premio_entregado",
          cantidad: 1,
          nota: cleanNote
        }])
      }
    );

    if (!movementRes.ok) {
      const txt = await movementRes.text();
      return res.status(500).json({
        error: "Se actualizó la tarjeta, pero falló el movimiento",
        detail: txt
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Premio marcado como entregado",
      customer: {
        id: customer.id,
        nombre: customer.nombre || "",
        celular: customer.celular || ""
      },
      card: {
        id: card.id,
        sellos_actuales: Number(card.sellos_actuales || 0),
        meta_sellos: Math.max(20, Number(card.meta_sellos || 20)),
        premio_pendiente: false
      }
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error inesperado",
      detail: err.message || String(err)
    });
  }
}
