const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_ANON_KEY;

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
    if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
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

async function findExistingTable(supabase, candidates) {
  const errors = [];

  for (const table of candidates) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .limit(1);

    if (!error) {
      return { table, sample: data || [] };
    }

    errors.push({
      table,
      message: error.message
    });
  }

  return { table: null, sample: [], errors };
}

async function loadAllRows(supabase, table) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .limit(5000);

  if (error) throw error;
  return data || [];
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
      error: "Método no permitido. Usa GET."
    });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({
        error: "Faltan variables de entorno de Supabase.",
        detail: "Revisa SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en Vercel."
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false
      }
    });

    const customerTableInfo = await findExistingTable(
      supabase,
      CUSTOMER_TABLE_CANDIDATES
    );

    const cardTableInfo = await findExistingTable(
      supabase,
      CARD_TABLE_CANDIDATES
    );

    if (!customerTableInfo.table || !cardTableInfo.table) {
      return res.status(500).json({
        error: "No pude detectar las tablas de clientes o tarjetas.",
        detail: "Pásame captura del error para ajustar el nombre exacto de tus tablas.",
        detected: {
          customerTable: customerTableInfo.table,
          cardTable: cardTableInfo.table
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

    const customers = await loadAllRows(supabase, customerTableInfo.table);
    const cards = await loadAllRows(supabase, cardTableInfo.table);

    const customerById = new Map();
    const customerByPhone = new Map();

    customers.forEach((c) => {
      const id = String(getFirst(c, ["id", "customer_id", "cliente_id"], "") || "");
      const celular = String(getFirst(c, ["celular", "phone", "telefono", "whatsapp"], "") || "").replace(/\D/g, "");

      if (id) customerById.set(id, c);
      if (celular) customerByPhone.set(celular, c);
    });

    const rows = [];

    cards.forEach((card) => {
      const customerId = String(getFirst(card, ["customer_id", "cliente_id", "clienteId", "user_id"], "") || "");
      const cardPhone = String(getFirst(card, ["celular", "phone", "telefono", "whatsapp"], "") || "").replace(/\D/g, "");

      const customer =
        customerById.get(customerId) ||
        customerByPhone.get(cardPhone) ||
        null;

      const nombre = getFirst(customer, ["nombre", "name", "full_name"], "Cliente sin nombre");
      const celular = String(
        getFirst(customer, ["celular", "phone", "telefono", "whatsapp"], cardPhone || "-")
      );

      const sellosActuales = safeNumber(
        getFirst(card, ["sellos_actuales", "stamps", "sellos", "current_stamps"], 0)
      );

      const metaSellos = safeNumber(
        getFirst(card, ["meta_sellos", "goal_stamps", "meta", "max_stamps"], 20)
      ) || 20;

      const premioPendiente = safeBool(
        getFirst(card, ["premio_pendiente", "reward_pending", "pending_reward"], false)
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

      const exists = rows.some((r) => String(r.celular) === String(celular));

      if (!exists) {
        rows.push({
          nombre: getFirst(customer, ["nombre", "name", "full_name"], "Cliente sin nombre"),
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
    const totalStamps = rows.reduce((sum, item) => sum + safeNumber(item.sellos_actuales), 0);
    const pendingRewards = rows.filter((item) => item.premio_pendiente).length;

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
    return res.status(500).json({
      error: "Error cargando resumen de clientes.",
      detail: err.message || String(err)
    });
  }
};
