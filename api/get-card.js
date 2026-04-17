import crypto from "crypto";

const TOKEN_SECRET = "patron_wings_token_seguro_2026_Bela1997_local_845219_x9";

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
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmR3enpld3pmanVzZW96d2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODE4NTMsImV4cCI6MjA4OTM1Nzg1M30.WgVc6PT9rwAEk4yn2i63GyOUl0CTZE6J-7r_2mpumAs";

    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    };

    let customerRes;
    try {
      customerRes = await fetch(
        SUPABASE_URL +
          "/rest/v1/customers?select=id,nombre,celular&id=eq." +
          encodeURIComponent(session.customer_id) +
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
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    let cardRes;
    try {
      cardRes = await fetch(
        SUPABASE_URL +
          "/rest/v1/loyalty_cards?select=id,customer_id,sellos_actuales,meta_sellos,premio_pendiente&customer_id=eq." +
          encodeURIComponent(customer.id) +
          "&limit=1",
        { headers }
      );
    } catch (err) {
      return res.status(500).json({
        error: "Falló conexión al buscar tarjeta",
        detail: err.message || String(err)
      });
    }

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
      return res.status(404).json({ error: "Tarjeta no encontrada" });
    }

    return res.status(200).json({
      ok: true,
      customer: {
        id: customer.id,
        nombre: customer.nombre || "",
        celular: customer.celular || ""
      },
      card: {
        id: card.id,
        sellos_actuales: Number(card.sellos_actuales || 0),
        meta_sellos: Number(card.meta_sellos || 10),
        premio_pendiente: !!card.premio_pendiente
      }
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error inesperado",
      detail: err.message || String(err)
    });
  }
}
