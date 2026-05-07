const SUPABASE_URL = "https://defdwzzewzfjuseozwkn.supabase.co";

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmR3enpld3pmanVzZW96d2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODE4NTMsImV4cCI6MjA4OTM1Nzg1M30.WgVc6PT9rwAEk4yn2i63GyOUl0CTZE6J-7r_2mpumAs";

const CUSTOMER_TABLE = "customers";
const CARD_TABLE = "cards";

function cleanPhone(value) {
  return String(value || "").replace(/\D/g, "").trim();
}

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {})
    }
  });

  const text = await response.text();

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const error = new Error(
      data && data.message
        ? data.message
        : typeof data === "string"
          ? data
          : "Error consultando Supabase"
    );

    error.status = response.status;
    error.body = data;
    throw error;
  }

  return data;
}

async function getCustomerByPhone(celular) {
  const phone = encodeURIComponent(celular);

  const data = await supabaseRequest(
    `${CUSTOMER_TABLE}?select=*&celular=eq.${phone}&limit=1`,
    {
      method: "GET"
    }
  );

  return Array.isArray(data) && data.length ? data[0] : null;
}

async function deleteCardsByCustomerId(customerId) {
  if (!customerId) return 0;

  const id = encodeURIComponent(customerId);

  const deleted = await supabaseRequest(
    `${CARD_TABLE}?customer_id=eq.${id}`,
    {
      method: "DELETE"
    }
  );

  return Array.isArray(deleted) ? deleted.length : 0;
}

async function deleteCardsByPhone(celular) {
  const phone = encodeURIComponent(celular);

  try {
    const deleted = await supabaseRequest(
      `${CARD_TABLE}?celular=eq.${phone}`,
      {
        method: "DELETE"
      }
    );

    return Array.isArray(deleted) ? deleted.length : 0;
  } catch (err) {
    return 0;
  }
}

async function deleteCustomerByPhone(celular) {
  const phone = encodeURIComponent(celular);

  const deleted = await supabaseRequest(
    `${CUSTOMER_TABLE}?celular=eq.${phone}`,
    {
      method: "DELETE"
    }
  );

  return Array.isArray(deleted) ? deleted.length : 0;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({
      ok: false,
      error: "Método no permitido. Usa POST."
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Método no permitido. Usa POST."
    });
  }

  try {
    const celular = cleanPhone(req.body && req.body.celular);

    if (!celular) {
      return res.status(400).json({
        ok: false,
        error: "Falta el celular del cliente."
      });
    }

    const customer = await getCustomerByPhone(celular);

    if (!customer) {
      return res.status(404).json({
        ok: false,
        error: "No encontré ese cliente."
      });
    }

    const customerId = customer.id || customer.customer_id || customer.cliente_id || "";

    const deletedCardsById = await deleteCardsByCustomerId(customerId);
    const deletedCardsByPhone = await deleteCardsByPhone(celular);
    const deletedCustomers = await deleteCustomerByPhone(celular);

    return res.status(200).json({
      ok: true,
      message: "Cliente eliminado correctamente.",
      celular,
      deleted: {
        cardsByCustomerId: deletedCardsById,
        cardsByPhone: deletedCardsByPhone,
        customers: deletedCustomers
      }
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "No se pudo eliminar el cliente.",
      detail: err.message || String(err),
      status: err.status || null,
      body: err.body || null
    });
  }
};
