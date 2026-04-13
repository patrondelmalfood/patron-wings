export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { nombre, celular, correo } = req.body || {};

    if (!nombre || !celular) {
      return res.status(400).json({ error: "Falta nombre o celular" });
    }

    const SUPABASE_URL = "https://defdwzzewzfjusoezwkn.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmR3enpld3pmanVzZW96d2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODE4NTMsImV4cCI6MjA4OTM1Nzg1M30.WgVc6PT9rwAEk4yn2i63GyOUl0CTZE6J-7r_2mpumAs";

    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    };

    const checkRes = await fetch(
      SUPABASE_URL +
        "/rest/v1/customers?select=id&celular=eq." +
        encodeURIComponent(celular),
      { headers }
    );

    if (!checkRes.ok) {
      const txt = await checkRes.text();
      return res.status(500).json({ error: "Error validando celular", detail: txt });
    }

    const existingRows = await checkRes.json();

    if (Array.isArray(existingRows) && existingRows.length > 0) {
      return res.status(409).json({ error: "Ese celular ya está registrado" });
    }

    const customerRes = await fetch(
      SUPABASE_URL + "/rest/v1/customers",
      {
        method: "POST",
        headers: {
          ...headers,
          Prefer: "return=representation"
        },
        body: JSON.stringify([{
          nombre,
          celular,
          correo: correo || null
        }])
      }
    );

    if (!customerRes.ok) {
      const txt = await customerRes.text();
      return res.status(500).json({ error: "Error creando cliente", detail: txt });
    }

    const customerRows = await customerRes.json();
    const customer = customerRows && customerRows[0];

    if (!customer || !customer.id) {
      return res.status(500).json({ error: "Cliente creado sin ID válido" });
    }

    const cardRes = await fetch(
      SUPABASE_URL + "/rest/v1/loyalty_cards",
      {
        method: "POST",
        headers,
        body: JSON.stringify([{
          customer_id: customer.id,
          sellos_actuales: 0,
          meta_sellos: 10,
          premio_pendiente: false
        }])
      }
    );

    if (!cardRes.ok) {
      const txt = await cardRes.text();
      return res.status(500).json({ error: "Cliente creado, pero falló la tarjeta", detail: txt });
    }

    return res.status(200).json({
      ok: true,
      message: "Registro exitoso. Tu tarjeta virtual fue creada."
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error inesperado",
      detail: err.message || String(err)
    });
  }
}
