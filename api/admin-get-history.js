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
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmR3enpld3pmanVzZW96d2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODE4NTMsImV4cCI6MjA4OTM1Nzg1M30.WgVc6PT9rwAEk4yn2i63GyOUl0CTZE6J-7r_2mpumAs";

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

    const historyRes = await fetch(
      SUPABASE_URL +
        "/rest/v1/loyalty_movements?select=id,tipo,cantidad,nota,created_at&customer_id=eq." +
        encodeURIComponent(customer.id) +
        "&order=created_at.desc&limit=15",
      { headers }
    );

    if (!historyRes.ok) {
      const txt = await historyRes.text();
      return res.status(500).json({
        error: "Error buscando historial",
        detail: txt
      });
    }

    const rows = await historyRes.json();

    return res.status(200).json({
      ok: true,
      customer: {
        id: customer.id,
        nombre: customer.nombre || "",
        celular: customer.celular || ""
      },
      movements: Array.isArray(rows) ? rows.map(item => ({
        id: item.id,
        tipo: item.tipo || "",
        cantidad: Number(item.cantidad || 0),
        nota: item.nota || "",
        created_at: item.created_at || ""
      })) : []
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error inesperado",
      detail: err.message || String(err)
    });
  }
}
