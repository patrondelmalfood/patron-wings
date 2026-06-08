const SUPABASE_URL = "https://defdwzzewzfjuseozwkn.supabase.co";

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmR3enpld3pmanVzZW96d2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODE4NTMsImV4cCI6MjA4OTM1Nzg1M30.WgVc6PT9rwAEk4yn2i63GyOUl0CTZE6J-7r_2mpumAs";

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function hidePhone(phone) {
  const clean = String(phone || "").replace(/\D/g, "");
  if (!clean) return "";
  if (clean.length <= 4) return clean;
  return "*".repeat(clean.length - 4) + clean.slice(-4);
}

async function supabaseFetch(path, options = {}) {
  const response = await fetch(SUPABASE_URL + path, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json",
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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "Método no permitido. Usa GET."
    });
  }

  try {
    const customers = await supabaseFetch(
      "/rest/v1/customers?select=id,nombre,celular,created_at&limit=5000"
    );

    const cards = await supabaseFetch(
      "/rest/v1/loyalty_cards?select=id,customer_id,sellos_actuales,meta_sellos,premio_pendiente,puntos_disponibles,puntos_ranking,sellos_migrados,puntos_migrados_desde_sellos,puntos_actualizados_at,created_at&limit=5000"
    );

    const customerMap = new Map();

    (Array.isArray(customers) ? customers : []).forEach((customer) => {
      customerMap.set(String(customer.id), customer);
    });

    const rows = [];

    (Array.isArray(cards) ? cards : []).forEach((card) => {
      const customer = customerMap.get(String(card.customer_id)) || null;

      rows.push({
        customer_id: safeNumber(card.customer_id),
        loyalty_card_id: safeNumber(card.id),
        nombre: customer?.nombre || "Cliente sin nombre",
        celular: customer?.celular || "",
        celular_oculto: hidePhone(customer?.celular || ""),

        puntos_ranking: safeNumber(card.puntos_ranking),
        puntos_disponibles: safeNumber(card.puntos_disponibles),

        sellos_actuales: safeNumber(card.sellos_actuales),
        meta_sellos: safeNumber(card.meta_sellos) || 20,
        premio_pendiente: !!card.premio_pendiente,

        sellos_migrados: !!card.sellos_migrados,
        puntos_migrados_desde_sellos: safeNumber(card.puntos_migrados_desde_sellos),
        puntos_actualizados_at: card.puntos_actualizados_at || null,
        created_at: customer?.created_at || card.created_at || null
      });
    });

    const customersWithoutCard = (Array.isArray(customers) ? customers : []).filter((customer) => {
      return !rows.some((row) => String(row.customer_id) === String(customer.id));
    });

    customersWithoutCard.forEach((customer) => {
      rows.push({
        customer_id: safeNumber(customer.id),
        loyalty_card_id: 0,
        nombre: customer.nombre || "Cliente sin nombre",
        celular: customer.celular || "",
        celular_oculto: hidePhone(customer.celular || ""),

        puntos_ranking: 0,
        puntos_disponibles: 0,

        sellos_actuales: 0,
        meta_sellos: 20,
        premio_pendiente: false,

        sellos_migrados: false,
        puntos_migrados_desde_sellos: 0,
        puntos_actualizados_at: null,
        created_at: customer.created_at || null
      });
    });

    const ranking = rows
      .slice()
      .sort((a, b) => {
        if (b.puntos_ranking !== a.puntos_ranking) {
          return b.puntos_ranking - a.puntos_ranking;
        }

        if (b.puntos_disponibles !== a.puntos_disponibles) {
          return b.puntos_disponibles - a.puntos_disponibles;
        }

        return String(a.nombre).localeCompare(String(b.nombre));
      })
      .map((item, index) => ({
        puesto: index + 1,
        posicion: index + 1,
        customer_id: item.customer_id,
        loyalty_card_id: item.loyalty_card_id,
        nombre: item.nombre,
        celular: item.celular,
        celular_oculto: item.celular_oculto,
        puntos_ranking: item.puntos_ranking,
        puntos_disponibles: item.puntos_disponibles,

        sellos_actuales: item.sellos_actuales,
        meta_sellos: item.meta_sellos,
        premio_pendiente: item.premio_pendiente,
        created_at: item.created_at
      }));

    const totalCustomers = rows.length;

    const totalRankingPoints = rows.reduce(
      (sum, item) => sum + safeNumber(item.puntos_ranking),
      0
    );

    const totalAvailablePoints = rows.reduce(
      (sum, item) => sum + safeNumber(item.puntos_disponibles),
      0
    );

    const totalStamps = rows.reduce(
      (sum, item) => sum + safeNumber(item.sellos_actuales),
      0
    );

    let pendingPrizes = [];

    try {
      const pendingRpc = await supabaseFetch(
        "/rest/v1/rpc/vip_admin_get_pending_prizes",
        {
          method: "POST",
          body: JSON.stringify({
            p_limit: 100
          })
        }
      );

      pendingPrizes = Array.isArray(pendingRpc) ? pendingRpc : [];
    } catch {
      const spins = await supabaseFetch(
        "/rest/v1/vip_roulette_spins?select=id,customer_id,prize_name,prize_type,prize_value,prize_status,prize_unique_code,points_cost,points_before,points_after,created_at,expires_at&prize_status=eq.pendiente&order=created_at.desc&limit=100"
      );

      pendingPrizes = (Array.isArray(spins) ? spins : []).map((spin) => {
        const customer = customerMap.get(String(spin.customer_id)) || null;

        return {
          spin_id: spin.id,
          customer_id: spin.customer_id,
          nombre: customer?.nombre || "Cliente",
          celular: customer?.celular || "",
          prize_name: spin.prize_name,
          prize_type: spin.prize_type,
          prize_value: spin.prize_value,
          prize_status: spin.prize_status,
          prize_unique_code: spin.prize_unique_code,
          points_cost: spin.points_cost,
          points_before: spin.points_before,
          points_after: spin.points_after,
          created_at: spin.created_at,
          expires_at: spin.expires_at,
          is_expired: spin.expires_at ? new Date(spin.expires_at) < new Date() : false
        };
      });
    }

    const pendingRoulettePrizes = pendingPrizes.length;

    return res.status(200).json({
      ok: true,

      totalCustomers,
      totalRankingPoints,
      totalAvailablePoints,
      pendingRoulettePrizes,

      totalStamps,
      pendingRewards: pendingRoulettePrizes,

      ranking,
      pendingPrizes,
      pendingRoulettePrizesList: pendingPrizes,

      tables: {
        customers: "customers",
        cards: "loyalty_cards",
        prizes: "vip_roulette_spins"
      }
    });
  } catch (err) {
    return res.status(200).json({
      ok: false,
      error: "Error cargando resumen de clientes VIP.",
      detail: err.message || String(err),
      status: err.status || null,
      body: err.body || null
    });
  }
}
