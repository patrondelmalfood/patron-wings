import crypto from "crypto";

const TOKEN_SECRET = "patron_wings_token_seguro_2026_Bela1997_local_845219_x9";

function verifyPassword(password, storedValue) {
  if (!storedValue || !storedValue.includes(":")) return false;

  const [salt, originalHash] = storedValue.split(":");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(originalHash, "hex")
  );
}

function createToken(payload) {
  const json = JSON.stringify(payload);
  const base = Buffer.from(json).toString("base64url");
  const sig = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(base)
    .digest("base64url");

  return `${base}.${sig}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { celular, password } = req.body || {};

    if (!celular || !password) {
      return res.status(400).json({ error: "Falta celular o contraseña" });
    }

    const SUPABASE_URL = "https://defdwzzewzfjuseozwkn.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmR3enpld3pmanVzZW96d2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODE4NTMsImV4cCI6MjA4OTM1Nzg1M30.WgVc6PT9rwAEk4yn2i63GyOUl0CTZE6J-7r_2mpumAs";

    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    };

    const cleanCell = String(celular).replace(/\D/g, "").trim();

    let customerRes;
    try {
      customerRes = await fetch(
        SUPABASE_URL +
          "/rest/v1/customers?select=id,nombre,celular,password_hash&celular=eq." +
          encodeURIComponent(cleanCell) +
          "&limit=1",
        { headers }
      );
    } catch (err) {
      return res.status(500).json({
        error: "Falló conexión al buscar cliente",
        detail: err.message || String(err)
      });
    }

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
      return res.status(401).json({ error: "Celular o contraseña incorrectos" });
    }

    const ok = verifyPassword(String(password), String(customer.password_hash || ""));
    if (!ok) {
      return res.status(401).json({ error: "Celular o contraseña incorrectos" });
    }

    const token = createToken({
      customer_id: customer.id,
      celular: customer.celular,
      ts: Date.now()
    });

    return res.status(200).json({
      ok: true,
      message: "Ingreso correcto",
      token
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error inesperado",
      detail: err.message || String(err)
    });
  }
}
