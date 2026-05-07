const SUPABASE_URL = "https://defdwzzewzfjuseozwkn.supabase.co";

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmR3enpld3pmanVzZW96d2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODE4NTMsImV4cCI6MjA4OTM1Nzg1M30.WgVc6PT9rwAEk4yn2i63GyOUl0CTZE6J-7r_2mpumAs";

const CUSTOMER_TABLE_CANDIDATES = [
  "customers",
  "clientes",
  "clientes_tarjeta",
  "tarjeta_clientes",
  "vip_customers",
  "clientes_vip",
  "loyalty_customers",
  "pdm_customers"
];

const CARD_TABLE_CANDIDATES = [
  "cards",
  "tarjetas",
  "tarjetas_sellos",
  "customer_cards",
  "vip_cards",
  "loyalty_cards",
  "tarjeta_vip",
  "tarjetas_vip",
  "pdm_cards"
];

function getFirst(obj, keys, fallback = "") {
  for (const key of keys) {
    if (
      obj &&
      obj[key] !== undefined &&
      obj[key] !== null &&
      obj[key] !== ""
    ) {
      return obj[key];
    }
  }
  return fallback;
}

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function safeBool(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

async function supabaseSelect(table, limit = 5000) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=${limit}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json"
    }
  });

  const text = await response.text();

  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  if (!response.ok) {
    const error = new Error(
      json && json.message
        ? json.message
        : typeof json === "string"
          ? json
          : "Error consultando Supabase"
    );

    error.status = response.status;
    error.body = json;
    throw error;
  }

  return Array.isArray(json) ? json : [];
}

async function findExistingTable(candidates) {
  const errors = [];

  for (const table of candidates) {
    try {
      const data = await supabaseSelect(table, 1);

      return {
        table,
        sample: data || []
      };
    } catch (err) {
      errors.push({
        table,
        status: err.status || null,
        message: err.message || String(err),
        body: err.body || null
      });
    }
  }

  return {
    table: null,
    sample: [],
    errors
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "Método no permitido. Usa GET."
    });
  }

  try {
    const customerTableInfo = await findExistingTable(CUSTOMER_TABLE_CANDIDATES);
    const cardTableInfo = await findExistingTable(CARD_TABLE_CANDIDATES);

    if (!customerTableInfo.table || !cardTableInfo.table) {
      return res.status(200).json({
        ok: false,
        error: "No pude detectar automáticamente las tablas de clientes o tarjetas.",
        detected: {
          customers: customerTableInfo.table,
          cards: cardTableInfo.table
        },
        tried: {
          customerTables: CUSTOMER_TABLE_CANDIDATES,
          cardTables: CARD_TABLE_CANDIDATES
        },
        errors: {
          customers: customerTableInfo.errors || [],
          cards: cardTableInfo.errors || []
        }
      });
    }

    const customers = await supabaseSelect(customerTableInfo.table, 5000);
    const cards = await supabaseSelect(cardTableInfo.table, 5000);

    const customerById = new Map();
    const customerByPhone = new Map();

    customers.forEach((customer) => {
      const id = String(
        getFirst(customer, ["id", "customer_id", "cliente_id"], "")
      );

      const celular = String(
        getFirst(customer, ["celular", "phone", "telefono", "whatsapp"], "")
      ).replace(/\D/g, "");

      if (id) customerById.set(id, customer);
      if (celular) customerByPhone.set(celular, customer);
    });

    const rows = [];

    cards.forEach((card) => {
      const customerId = String(
        getFirst(
          card,
          ["customer_id", "cliente_id", "clienteId", "user_id"],
          ""
        )
      );

      const cardPhone = String(
        getFirst(card, ["celular", "phone", "telefono", "whatsapp"], "")
      ).replace(/\D/g, "");

      const customer =
        customerById.get(customerId) ||
        customerByPhone.get(cardPhone) ||
        null;

      const nombre = getFirst(
        customer,
        ["nombre", "name", "full_name"],
        "Cliente sin nombre"
      );

      const celular = String(
        getFirst(
          customer,
          ["celular", "phone", "telefono", "whatsapp"],
          cardPhone || "-"
        )
      );

      const sellosActuales = safeNumber(
        getFirst(
          card,
          ["sellos_actuales", "stamps", "sellos", "current_stamps"],
          0
        )
      );

      const metaSellos =
        safeNumber(
          getFirst(
            card,
            ["meta_sellos", "goal_stamps", "meta", "max_stamps"],
            20
          )
        ) || 20;

      const premioPendiente = safeBool(
        getFirst(
          card,
          ["premio_pendiente", "reward_pending", "pending_reward"],
          false
        )
      );

      rows.push({
        nombre,
        celular,
        sellos_actuales: sellosActuales,
        meta_sellos: metaSellos,
        premio_pendiente: premioPendiente,
        updated_at: getFirst(card, ["updated_at", "updatedAt"], null),
        created_at: getFirst(customer, ["created_at", "createdAt"], null)
      });
    });

    customers.forEach((customer) => {
      const celular = String(
        getFirst(customer, ["celular", "phone", "telefono", "whatsapp"], "")
      );

      const exists = rows.some(
        (item) => String(item.celular) === String(celular)
      );

      if (!exists) {
        rows.push({
          nombre: getFirst(
            customer,
            ["nombre", "name", "full_name"],
            "Cliente sin nombre"
          ),
          celular: celular || "-",
          sellos_actuales: 0,
          meta_sellos: 20,
          premio_pendiente: false,
          updated_at: null,
          created_at: getFirst(customer, ["created_at", "createdAt"], null)
        });
      }
    });

    const ranking = rows
      .sort((a, b) => {
        if (b.sellos_actuales !== a.sellos_actuales) {
          return b.sellos_actuales - a.sellos_actuales;
        }

        return String(a.nombre).localeCompare(String(b.nombre));
      })
      .map((item, index) => ({
        puesto: index + 1,
        ...item
      }));

    const totalCustomers = rows.length;

    const totalStamps = rows.reduce(
      (sum, item) => sum + safeNumber(item.sellos_actuales),
      0
    );

    const pendingRewards = rows.filter(
      (item) => item.premio_pendiente
    ).length;

    return res.status(200).json({
      ok: true,
      tables: {
        customers: customerTableInfo.table,
        cards: cardTableInfo.table
      },
      totalCustomers,
      totalStamps,
      pendingRewards,
      ranking
    });
  } catch (err) {
    return res.status(200).json({
      ok: false,
      error: "Error cargando resumen de clientes.",
      detail: err.message || String(err),
      status: err.status || null,
      body: err.body || null
    });
  }
};
