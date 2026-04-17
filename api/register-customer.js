import crypto from "crypto";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { nombre, celular, password } = req.body || {};

    if (!nombre || !celular || !password) {
      return res.status(400).json({ error: "Falta nombre, celular o contraseña" });
    }

    if (String(password).length < 4) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 4 caracteres" });
    }

    const SUPABASE_URL = "https://defdwzzewzfjuseozwkn.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmR3enpld3pmanVzZW96d2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODE4NTMsImV4cCI6MjA4OTM1Nzg1M30.WgVc6PT9rwAEk4yn2i63GyOUl0CTZE6J-7r_2mpumAs";

    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    };

    const cleanNombre = String(nombre).trim();
    const cleanCell = String(celular).replace(/\D/g, "").trim();
    const passwordHash = hashPassword(String(password));

    let checkRes;
    try {
      checkRes = await fetch(
        SUPABASE_URL +
          "/rest/v1/customers?select=id&celular=eq." +
          encodeURIComponent(cleanCell),
        { headers }
      );
    } catch (err) {
      return res.status(500).json({
        error: "Falló conexión al validar celular",
        detail: err.message || String(err)
      });
    }

    if (!checkRes.ok) {
      const txt = await checkRes.text();
      return res.status(500).json({
        error: "Error validando celular",
        detail: txt
      });
    }

    const existingRows = await checkRes.json();

    if (Array.isArray(existingRows) && existingRows.length > 0) {
      return res.status(409).json({ error: "Ese celular ya está registrado" });
    }

    let customerRes;
    try {
      customerRes = await fetch(
        SUPABASE_URL + "/rest/v1/customers",
        {
          method: "POST",
          headers: {
            ...headers,
            Prefer: "return=representation"
          },
          body: JSON.stringify([{
            nombre: cleanNombre,
            celular: cleanCell,
            password_hash: passwordHash
          }])
        }
      );
    } catch (err) {
      return res.status(500).json({
        error: "Falló conexión al crear cliente",
        detail: err.message || String(err)
      });
    }

    if (!customerRes.ok) {
      const txt = await customerRes.text();
      return res.status(500).json({
        error: "Error creando cliente",
        detail: txt
      });
    }

    const customerRows = await customerRes.json();
    const customer = customerRows && customerRows[0];

    if (!customer || !customer.id) {
      return res.status(500).json({ error: "Cliente creado sin ID válido" });
    }

    let cardRes;
    try {
      cardRes = await fetch(
        SUPABASE_URL + "/rest/v1/loyalty_cards",
        {
          method: "POST",
          headers: {
            ...headers,
            Prefer: "return=representation"
          },
          body: JSON.stringify([{
            customer_id: customer.id,
            sellos_actuales: 0,
            meta_sellos: 10,
            premio_pendiente: false
          }])
        }
      );
    } catch (err) {
      return res.status(500).json({
        error: "Falló conexión al crear tarjeta",
        detail: err.message || String(err)
      });
    }

    if (!cardRes.ok) {
      const txt = await cardRes.text();
      return res.status(500).json({
        error: "Cliente creado, pero falló la tarjeta",
        detail: txt
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Registro exitoso. Ahora inicia sesión."
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error inesperado",
      detail: err.message || String(err)
    });
  }
}
