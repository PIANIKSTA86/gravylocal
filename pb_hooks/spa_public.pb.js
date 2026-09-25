/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — spa_public.pb.js
 * Endpoints públicos y seguros para el Portal Web de Agendamiento de Citas Estéticas.
 * Permite a los clientes consultar tratamientos, disponibilidad de horarios y reservar citas
 * sincronizadas en tiempo real con la agenda y el flujo contable de Pedidos de Venta.
 */

// 1. Configuración pública del Spa
routerAdd("GET", "/api/public/spa/config", (e) => {
  try {
    let cfg = null;
    try {
      const rec = $app.findFirstRecordByFilter("settings", "key = 'spa_beauty_config_v1'");
      if (rec && rec.getString("value")) cfg = JSON.parse(rec.getString("value"));
    } catch (_) {}
    if (!cfg) cfg = {};
    let spaName = cfg.spa_name || "Spa de Belleza y Estética Humana";
    let whatsappNumber = cfg.whatsapp || "573000000000";
    let accentColor = cfg.accent_color || "#8B5CF6";
    let welcomeMsg = cfg.welcome_msg || "Reserva tu sesión de belleza, relajación o cuidado facial en línea de forma fácil y segura.";
    let startHour = parseInt(cfg.start_hour !== undefined ? cfg.start_hour : "8", 10) || 8;
    let endHour = parseInt(cfg.end_hour !== undefined ? cfg.end_hour : "19", 10) || 19;
    let slotInterval = parseInt(cfg.slot_interval !== undefined ? cfg.slot_interval : "60", 10) || 60;
    let companyAddress = cfg.address || "";
    let companyPhone = cfg.phone || "";
    let logo = cfg.logo || "";

    if (!spaName || spaName === "Spa de Belleza y Estética Humana") {
      try {
        const setRec = $app.findFirstRecordByFilter("settings", "key = 'company_name'");
        if (setRec && setRec.getString("value")) spaName = setRec.getString("value");
      } catch (_) {}
    }

    if (!companyPhone) {
      try {
        const setRec = $app.findFirstRecordByFilter("settings", "key = 'company_phone'");
        if (setRec && setRec.getString("value")) {
          companyPhone = setRec.getString("value");
          if (!cfg.whatsapp) {
            whatsappNumber = companyPhone.replace(/\D/g, "");
            if (whatsappNumber.length === 10 && !whatsappNumber.startsWith("57")) {
              whatsappNumber = "57" + whatsappNumber;
            }
          }
        }
      } catch (_) {}
    }

    if (!companyAddress) {
      try {
        const setRec = $app.findFirstRecordByFilter("settings", "key = 'company_address'");
        if (setRec && setRec.getString("value")) companyAddress = setRec.getString("value");
      } catch (_) {}
    }

    if (!logo) {
      try {
        const setRec = $app.findFirstRecordByFilter("settings", "key = 'company_logo'");
        if (setRec && setRec.getString("value")) logo = setRec.getString("value");
      } catch (_) {}
    }

    return e.json(200, {
      name: spaName,
      whatsapp: whatsappNumber,
      phone: companyPhone,
      address: companyAddress,
      welcome_msg: welcomeMsg,
      accent_color: accentColor,
      logo: logo,
      slot_interval: slotInterval,
      start_hour: startHour,
      end_hour: endHour
    });
  } catch (err) {
    return e.json(500, { success: false, message: "Error cargando configuración: " + String(err) });
  }
});

// 2. Catálogo público de servicios estéticos activos
routerAdd("GET", "/api/public/spa/services", (e) => {
  try {
    const list = [];
    let cfg = null;
    try {
      const rec = $app.findFirstRecordByFilter("settings", "key = 'spa_beauty_config_v1'");
      if (rec && rec.getString("value")) cfg = JSON.parse(rec.getString("value"));
    } catch (_) {}
    const servicesCfg = (cfg && cfg.services && typeof cfg.services === "object") ? cfg.services : null;

    if (servicesCfg && Object.keys(servicesCfg).length > 0) {
      // Si el administrador ha configurado productos del inventario para el portal
      for (const prodId of Object.keys(servicesCfg)) {
        const itemCfg = servicesCfg[prodId];
        if (!itemCfg || itemCfg.published !== true) {
          continue; // Servicio no marcado como publicado
        }
        try {
          const p = $app.findRecordById("products", prodId);
          if (!p || !p.getBool("active")) continue;

          const basePrice = p.getFloat("base_price") || 0;
          const ivaRate = p.getFloat("iva_rate") || 19;
          const totalEstimated = Math.round(basePrice * (1 + ivaRate / 100));
          const image = p.getString("image");
          const imageUrl = image ? `/api/files/${p.collection().id}/${p.id}/${image}` : "";
          const duration = parseInt(itemCfg.duration || "60", 10) || 60;
          const category = itemCfg.badge || p.getString("categoria") || "Estética";

          list.push({
            id: p.id,
            name: p.getString("name"),
            code: p.getString("code"),
            description: itemCfg.description_override || p.getString("description") || "Tratamiento estético profesional personalizado.",
            price: basePrice,
            iva_rate: ivaRate,
            total: totalEstimated,
            imageUrl: imageUrl,
            category: category,
            duration: duration
          });
        } catch (_) {}
      }
    } else {
      // Fallback inicial: mostrar servicios de estética/spa o con código SPA
      const products = $app.findRecordsByFilter("products", "active = true", "name", 200, 0) || [];
      for (const p of products) {
        const code = (p.getString("code") || "").toUpperCase();
        const cat = (p.getString("categoria") || "").toLowerCase();
        const name = (p.getString("name") || "").toLowerCase();
        const isSpa = code.startsWith("SPA") || cat.includes("spa") || cat.includes("facial") || cat.includes("estetica") || cat.includes("masaje") || name.includes("facial") || name.includes("masaje") || p.getString("type") === "SERVICIO";
        if (!isSpa) continue;

        const basePrice = p.getFloat("base_price") || 0;
        const ivaRate = p.getFloat("iva_rate") || 19;
        const totalEstimated = Math.round(basePrice * (1 + ivaRate / 100));
        const image = p.getString("image");
        const imageUrl = image ? `/api/files/${p.collection().id}/${p.id}/${image}` : "";

        list.push({
          id: p.id,
          name: p.getString("name"),
          code: p.getString("code"),
          description: p.getString("description") || "Tratamiento estético profesional personalizado.",
          price: basePrice,
          iva_rate: ivaRate,
          total: totalEstimated,
          imageUrl: imageUrl,
          category: p.getString("categoria") || "Estética",
          duration: 60
        });
      }
    }

    return e.json(200, list);
  } catch (err) {
    return e.json(500, { success: false, message: "Error consultando tratamientos: " + String(err) });
  }
});

// 3. Lista pública de Cosmetólogas y Especialistas activas
routerAdd("GET", "/api/public/spa/specialists", (e) => {
  try {
    const stylists = $app.findRecordsByFilter("third_parties", "active = true && type = 'EMPLEADO'", "name", 100, 0) || [];
    const list = stylists.map(s => ({
      id: s.id,
      name: s.getString("name"),
      role: "Especialista en Estética & Cosmetología"
    }));

    return e.json(200, list);
  } catch (err) {
    return e.json(500, { success: false, message: "Error consultando especialistas: " + String(err) });
  }
});

// 4. Consulta de horarios y disponibilidad en tiempo real
routerAdd("GET", "/api/public/spa/availability", (e) => {
  try {
    const info = e.requestInfo();
    const query = info?.query || {};
    const date = String(query.date || "").trim(); // YYYY-MM-DD
    const stylistId = String(query.stylist_id || "").trim();
    const duration = parseInt(query.duration || "60", 10) || 60;

    if (!date) {
      return e.json(400, { success: false, message: "El parámetro de fecha 'date' es obligatorio (YYYY-MM-DD)." });
    }

    // Obtener especialistas disponibles
    let stylists = [];
    if (stylistId) {
      try {
        const single = $app.findRecordById("third_parties", stylistId);
        if (single && single.getBool("active")) stylists = [single];
      } catch (_) {}
    } else {
      stylists = $app.findRecordsByFilter("third_parties", "active = true && type = 'EMPLEADO'", "name", 100, 0) || [];
    }

    if (!stylists.length) {
      return e.json(200, { slots: [] });
    }

    // Configuración de horario de atención
    let cfg = null;
    try {
      const rec = $app.findFirstRecordByFilter("settings", "key = 'spa_beauty_config_v1'");
      if (rec && rec.getString("value")) cfg = JSON.parse(rec.getString("value"));
    } catch (_) {}
    if (!cfg) cfg = {};
    const startHour = parseInt(cfg.start_hour !== undefined ? cfg.start_hour : "8", 10) || 8;
    const endHour = parseInt(cfg.end_hour !== undefined ? cfg.end_hour : "19", 10) || 19;

    // Consultar citas existentes para la fecha seleccionada que no estén canceladas
    const filter = `start_time >= "${date} 00:00" && start_time <= "${date} 23:59" && status != "cancelled"`;
    const appts = $app.findRecordsByFilter("appointments", filter, "start_time", 500, 0) || [];

    const slots = [];
    const pad = (n) => String(n).padStart(2, "0");

    for (let h = startHour; h < endHour; h++) {
      const slotTimeStr = `${pad(h)}:00`;
      const slotStartDT = new Date(`${date}T${slotTimeStr}:00`);
      const slotEndDT = new Date(slotStartDT.getTime() + duration * 60 * 1000);

      // No permitir horarios pasados si la fecha es hoy
      const now = new Date();
      if (slotStartDT <= now) {
        continue;
      }

      // Buscar si alguna especialista está libre en este slot
      let availableStylist = null;

      for (const st of stylists) {
        const stId = st.id;
        const hasConflict = appts.some(a => {
          if (a.getString("stylist_id") !== stId) return false;
          const aStart = new Date(a.getString("start_time").replace(" ", "T") + ":00");
          const aEnd = new Date(a.getString("end_time").replace(" ", "T") + ":00");
          return slotStartDT < aEnd && aStart < slotEndDT;
        });

        if (!hasConflict) {
          availableStylist = st;
          break; // Encontramos especialista disponible
        }
      }

      slots.push({
        time: slotTimeStr,
        available: !!availableStylist,
        stylist_id: availableStylist ? availableStylist.id : null,
        stylist_name: availableStylist ? availableStylist.getString("name") : null
      });
    }

    return e.json(200, { date, slots });
  } catch (err) {
    return e.json(500, { success: false, message: "Error verificando disponibilidad: " + String(err) });
  }
});

// 4.1. ENDPOINTS ADMINISTRATIVOS PARA GESTIÓN DE SPA ONLINE
routerAdd("GET", "/api/gravy/spa-beauty/settings", (e) => {
  const auth = e.requestInfo()?.auth;
  if (!auth) {
    return e.json(401, { message: "No autenticado" });
  }

  try {
    let cfg = null;
    try {
      const rec = $app.findFirstRecordByFilter("settings", "key = 'spa_beauty_config_v1'");
      if (rec && rec.getString("value")) cfg = JSON.parse(rec.getString("value"));
    } catch (_) {}
    if (!cfg) {
      cfg = {
        spa_name: "",
        whatsapp: "",
        welcome_msg: "",
        start_hour: 8,
        end_hour: 19,
        slot_interval: 60,
        services: {}
      };
    }

    if (!cfg.services) cfg.services = {};

    // Obtener los productos ya configurados en cfg.services (pueden ser de cualquier tipo de inventario)
    const configuredMap = new Map();
    for (const prodId of Object.keys(cfg.services)) {
      try {
        const p = $app.findRecordById("products", prodId);
        if (p) {
          const base = p.getFloat("base_price") || 0;
          const iva = p.getFloat("iva_rate") || 19;
          configuredMap.set(p.id, {
            id: p.id,
            code: p.getString("code"),
            name: p.getString("name"),
            description: p.getString("description"),
            type: p.getString("type") || "PRODUCTO",
            base_price: base,
            iva_rate: iva,
            total: Math.round(base * (1 + iva / 100)),
            category: p.getString("categoria") || "General",
            active: p.getBool("active")
          });
        }
      } catch (_) {}
    }

    // Además incorporar productos que sean tipo SERVICIO o código SPA
    const defaultProds = $app.findRecordsByFilter("products", "active = true && (type = 'SERVICIO' || code ~ 'SPA')", "name", 100, 0) || [];
    for (const p of defaultProds) {
      if (!configuredMap.has(p.id)) {
        const base = p.getFloat("base_price") || 0;
        const iva = p.getFloat("iva_rate") || 19;
        configuredMap.set(p.id, {
          id: p.id,
          code: p.getString("code"),
          name: p.getString("name"),
          description: p.getString("description"),
          type: p.getString("type") || "SERVICIO",
          base_price: base,
          iva_rate: iva,
          total: Math.round(base * (1 + iva / 100)),
          category: p.getString("categoria") || "General",
          active: p.getBool("active")
        });
      }
    }

    return e.json(200, {
      config: cfg,
      all_services: Array.from(configuredMap.values())
    });
  } catch (err) {
    return e.json(500, { message: "Error al cargar configuración de Spa: " + String(err) });
  }
});

// 4.2. BÚSQUEDA RÁPIDA DE PRODUCTOS EN EL INVENTARIO PARA INCORPORAR AL SPA
routerAdd("GET", "/api/gravy/spa-beauty/inventory-products", (e) => {
  const auth = e.requestInfo()?.auth;
  if (!auth) {
    return e.json(401, { message: "No autenticado" });
  }

  try {
    const q = String(e.requestInfo()?.query?.q || "").trim().toLowerCase();
    let filter = "active = true";
    if (q) {
      const safeQ = q.replace(/"/g, '\\"');
      filter += ` && (name ~ "${safeQ}" || code ~ "${safeQ}" || categoria ~ "${safeQ}")`;
    }
    const prods = $app.findRecordsByFilter("products", filter, "name", 100, 0) || [];
    const list = prods.map(p => {
      const base = p.getFloat("base_price") || 0;
      const iva = p.getFloat("iva_rate") || 19;
      return {
        id: p.id,
        code: p.getString("code"),
        name: p.getString("name"),
        description: p.getString("description"),
        type: p.getString("type") || "PRODUCTO",
        category: p.getString("categoria") || "General",
        base_price: base,
        iva_rate: iva,
        total: Math.round(base * (1 + iva / 100))
      };
    });

    return e.json(200, list);
  } catch (err) {
    return e.json(500, { message: "Error buscando productos en inventario: " + String(err) });
  }
});

routerAdd("POST", "/api/gravy/spa-beauty/settings", (e) => {
  const auth = e.requestInfo()?.auth;
  if (!auth) {
    return e.json(401, { message: "No autenticado" });
  }

  const isSuper = (typeof auth.isSuperuser === "function" && auth.isSuperuser()) || auth.collection()?.name === "_superusers";
  const role = auth.getString("role") || "viewer";
  if (!isSuper && !["admin", "superadmin", "contador", "auxiliar", "administrador"].includes(role)) {
    return e.json(403, { message: "No tienes permisos para modificar la configuración de Spa" });
  }

  try {
    const body = e.requestInfo()?.body || {};
    const config = body.config;
    if (!config || typeof config !== "object") {
      return e.json(400, { message: "Formato de configuración inválido" });
    }

    try {
      const settingsCol = $app.findCollectionByNameOrId("settings");
      let rec = null;
      try { rec = $app.findFirstRecordByFilter("settings", "key = 'spa_beauty_config_v1'"); } catch (_) {}
      if (rec) {
        rec.set("value", JSON.stringify(config));
        $app.save(rec);
      } else {
        rec = new Record(settingsCol, { key: "spa_beauty_config_v1", value: JSON.stringify(config) });
        $app.save(rec);
      }
    } catch (saveErr) {
      return e.json(500, { message: "Error guardando settings: " + String(saveErr) });
    }
    return e.json(200, { ok: true, message: "Configuración y catálogo de Spa guardados exitosamente." });
  } catch (err) {
    return e.json(500, { message: "Error al guardar configuración de Spa: " + String(err) });
  }
});

routerAdd("POST", "/api/gravy/spa-beauty/quick-service", (e) => {
  const auth = e.requestInfo()?.auth;
  if (!auth) {
    return e.json(401, { message: "No autenticado" });
  }

  const isSuper = (typeof auth.isSuperuser === "function" && auth.isSuperuser()) || auth.collection()?.name === "_superusers";
  const role = auth.getString("role") || "viewer";
  if (!isSuper && !["admin", "superadmin", "contador", "auxiliar", "administrador"].includes(role)) {
    return e.json(403, { message: "No tienes permisos para crear servicios" });
  }

  try {
    const body = e.requestInfo()?.body || {};
    const name = String(body.name || "").trim();
    const basePrice = parseFloat(body.base_price) || 0;
    const ivaRate = parseFloat(body.iva_rate !== undefined ? body.iva_rate : 19) || 0;
    let code = String(body.code || "").trim();
    const description = String(body.description || "").trim();
    const category = String(body.category || "Estética").trim();
    const duration = parseInt(body.duration || "60", 10) || 60;
    const published = body.published !== false;

    if (!name) {
      return e.json(400, { message: "El nombre del servicio es obligatorio" });
    }

    // Generar código automático si no se proporcionó
    if (!code) {
      const count = ($app.findRecordsByFilter("products", "type = 'SERVICIO'", "", 500, 0) || []).length;
      code = `SPA-${String(count + 1).padStart(2, "0")}`;
    }

    // Buscar cuentas por defecto de ingresos y costos
    let incomeAccId = "";
    let costAccId = "";
    try {
      const existing = $app.findRecordsByFilter("products", "type = 'SERVICIO' && income_account_id != ''", "", 1, 0);
      if (existing.length > 0) {
        incomeAccId = existing[0].getString("income_account_id");
        costAccId = existing[0].getString("cost_account_id");
      } else {
        const accs = $app.findRecordsByFilter("accounts", "code = '4135' || code = '4170' || code = '41'", "", 1, 0);
        if (accs.length > 0) incomeAccId = accs[0].id;
      }
    } catch (_) {}

    const prodsCol = $app.findCollectionByNameOrId("products");
    const newProd = new Record(prodsCol, {
      code: code,
      name: name,
      description: description,
      type: "SERVICIO",
      unit: "UND",
      categoria: category,
      base_price: basePrice,
      cost_price: 0,
      iva_rate: ivaRate,
      active: true,
      income_account_id: incomeAccId,
      cost_account_id: costAccId
    });
    $app.save(newProd);

    // Registrar en la configuración de Spa Beauty
    let cfg = null;
    try {
      const rec = $app.findFirstRecordByFilter("settings", "key = 'spa_beauty_config_v1'");
      if (rec && rec.getString("value")) cfg = JSON.parse(rec.getString("value"));
    } catch (_) {}
    if (!cfg) cfg = { services: {} };
    if (!cfg.services) cfg.services = {};
    cfg.services[newProd.id] = {
      published: published,
      duration: duration,
      badge: category,
      description_override: description
    };
    try {
      const settingsCol = $app.findCollectionByNameOrId("settings");
      let rec = null;
      try { rec = $app.findFirstRecordByFilter("settings", "key = 'spa_beauty_config_v1'"); } catch (_) {}
      if (rec) {
        rec.set("value", JSON.stringify(cfg));
        $app.save(rec);
      } else {
        rec = new Record(settingsCol, { key: "spa_beauty_config_v1", value: JSON.stringify(cfg) });
        $app.save(rec);
      }
    } catch (_) {}

    return e.json(201, {
      ok: true,
      message: `Servicio "${name}" creado e incorporado al catálogo exitosamente.`,
      product: {
        id: newProd.id,
        code: code,
        name: name,
        base_price: basePrice,
        iva_rate: ivaRate,
        total: Math.round(basePrice * (1 + ivaRate / 100)),
        category: category,
        duration: duration,
        published: published
      }
    });
  } catch (err) {
    return e.json(500, { message: "Error al crear servicio: " + String(err) });
  }
});

// 5. Agendamiento atómico de cita pública y generación contable
routerAdd("POST", "/api/public/spa/appointments", (e) => {
  try {
    const info = e.requestInfo();
    const body = info?.body || {};

    const docType = String(body.doc_type || "CC").toUpperCase();
    const docNumber = String(body.doc_number || "").trim().toUpperCase();
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const serviceId = String(body.service_id || "").trim();
    let stylistId = String(body.stylist_id || "").trim();
    const startTimeVal = String(body.start_time || "").trim(); // YYYY-MM-DD HH:MM
    const durationMins = parseInt(body.duration || "60", 10) || 60;
    const skinType = String(body.skin_type || "NORMAL").toUpperCase();
    const medical = String(body.medical_conditions || "").trim();
    const allergies = String(body.allergies || "").trim();
    const notes = String(body.notes || "").trim();

    if (!docNumber || !name) {
      return e.json(400, { success: false, message: "El documento de identidad y nombre son requeridos." });
    }
    if (!phone) {
      return e.json(400, { success: false, message: "El número de teléfono/WhatsApp es requerido para la confirmación." });
    }
    if (!serviceId) {
      return e.json(400, { success: false, message: "Debes seleccionar un tratamiento o servicio." });
    }
    if (!startTimeVal) {
      return e.json(400, { success: false, message: "La fecha y hora son obligatorias." });
    }

    // 1. Validar Servicio
    const serviceProd = $app.findRecordById("products", serviceId);
    if (!serviceProd || !serviceProd.getBool("active")) {
      return e.json(404, { success: false, message: "El tratamiento seleccionado no está disponible." });
    }

    // 2. Validar o Asignar Especialista
    const pad = (n) => String(n).padStart(2, "0");
    const startD = new Date(startTimeVal.replace(" ", "T") + ":00");
    const endD = new Date(startD.getTime() + durationMins * 60 * 1000);
    const dateStr = startTimeVal.split(" ")[0];

    const formatDT = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const startTimeStr = formatDT(startD);
    const endTimeStr = formatDT(endD);

    const existingAppts = $app.findRecordsByFilter(
      "appointments",
      `start_time >= "${dateStr} 00:00" && start_time <= "${dateStr} 23:59" && status != "cancelled"`,
      "start_time",
      500,
      0
    ) || [];

    if (!stylistId) {
      // Asignar primera especialista disponible
      const allStylists = $app.findRecordsByFilter("third_parties", "active = true && type = 'EMPLEADO'", "name", 100, 0) || [];
      for (const st of allStylists) {
        const hasConflict = existingAppts.some(a => {
          if (a.getString("stylist_id") !== st.id) return false;
          const aStart = new Date(a.getString("start_time").replace(" ", "T") + ":00");
          const aEnd = new Date(a.getString("end_time").replace(" ", "T") + ":00");
          return startD < aEnd && aStart < endD;
        });
        if (!hasConflict) {
          stylistId = st.id;
          break;
        }
      }
    } else {
      // Verificar si la seleccionada está libre
      const hasConflict = existingAppts.some(a => {
        if (a.getString("stylist_id") !== stylistId) return false;
        const aStart = new Date(a.getString("start_time").replace(" ", "T") + ":00");
        const aEnd = new Date(a.getString("end_time").replace(" ", "T") + ":00");
        return startD < aEnd && aStart < endD;
      });
      if (hasConflict) {
        return e.json(409, { success: false, message: "La especialista seleccionada ya tiene otra cita en ese horario. Por favor selecciona otro turno." });
      }
    }

    if (!stylistId) {
      return e.json(409, { success: false, message: "No hay especialistas disponibles para este horario. Por favor selecciona otra franja." });
    }

    const stylistRecord = $app.findRecordById("third_parties", stylistId);

    // 3. Resolver o Registrar Tercero (Cliente)
    let clientRecord = null;
    try {
      clientRecord = $app.findFirstRecordByFilter("third_parties", `doc_number = "${docNumber}"`);
      // Actualizar teléfono y email si están vacíos
      let tpChanged = false;
      if (!clientRecord.getString("phone") && phone) { clientRecord.set("phone", phone); tpChanged = true; }
      if (!clientRecord.getString("email") && email) { clientRecord.set("email", email); tpChanged = true; }
      if (tpChanged) $app.save(clientRecord);
    } catch (_) {
      const tpCol = $app.findCollectionByNameOrId("third_parties");
      clientRecord = new Record(tpCol, {
        type: "CLIENTE",
        doc_type: docType,
        doc_number: docNumber,
        name: name,
        phone: phone,
        email: email,
        active: true
      });
      $app.save(clientRecord);
    }

    // 4. Resolver o Registrar Expediente Estético (spa_clients)
    let spaClientRecord = null;
    try {
      spaClientRecord = $app.findFirstRecordByFilter("spa_clients", `client_id = "${clientRecord.id}"`);
      let scChanged = false;
      if (skinType && !spaClientRecord.getString("skin_type")) { spaClientRecord.set("skin_type", skinType); scChanged = true; }
      if (medical && !spaClientRecord.getString("medical_conditions")) { spaClientRecord.set("medical_conditions", medical); scChanged = true; }
      if (allergies && !spaClientRecord.getString("allergies")) { spaClientRecord.set("allergies", allergies); scChanged = true; }
      if (scChanged) $app.save(spaClientRecord);
    } catch (_) {
      try {
        const scCol = $app.findCollectionByNameOrId("spa_clients");
        spaClientRecord = new Record(scCol, {
          client_id: clientRecord.id,
          skin_type: skinType,
          medical_conditions: medical,
          allergies: allergies,
          treatment_notes: "Registrado vía portal de agendamiento online."
        });
        $app.save(spaClientRecord);
      } catch (_) {}
    }

    // 5. Generar Pedido de Venta Contable (sales_orders)
    const price = serviceProd.getFloat("base_price") || 0;
    const ivaRate = serviceProd.getFloat("iva_rate") || 19;
    const ivaAmt = Math.round(price * (ivaRate / 100) * 100) / 100;
    const total = price + ivaAmt;

    // Consecutivo de orden
    let orderNum = "PED-" + String(Date.now()).slice(-6);
    try {
      const countOrders = $app.countRecords("sales_orders") || 0;
      orderNum = "PED-" + pad(countOrders + 1);
    } catch (_) {}

    let defaultWh = "";
    try {
      const wh = $app.findFirstRecordByFilter("warehouses", "active = true");
      if (wh) defaultWh = wh.id;
    } catch (_) {}

    let defaultUserId = "";
    try {
      const u = $app.findFirstRecordByFilter("users", "role = 'superadmin' || role = 'admin' || role = 'administrador'");
      if (u) defaultUserId = u.id;
    } catch (_) {}

    const soCol = $app.findCollectionByNameOrId("sales_orders");
    const salesOrder = new Record(soCol, {
      number: orderNum,
      customer_id: clientRecord.id,
      seller_id: stylistId,
      warehouse_id: defaultWh || null,
      date: dateStr,
      due_date: dateStr,
      subtotal: price,
      iva_total: ivaAmt,
      total: total,
      status: "pending",
      user_id: defaultUserId || null,
      notes: `Reserva Online Spa: ${serviceProd.getString("name")} para ${name}`
    });
    $app.save(salesOrder);

    // Línea del pedido
    try {
      const solCol = $app.findCollectionByNameOrId("sales_order_lines");
      const orderLine = new Record(solCol, {
        sales_order_id: salesOrder.id,
        line_order: 1,
        product_id: serviceId,
        description: `Servicio Spa: ${serviceProd.getString("name")} (${name})`,
        qty: 1,
        unit_price: price,
        iva_rate: ivaRate,
        iva_amount: ivaAmt,
        subtotal: price,
        total: total
      });
      $app.save(orderLine);
    } catch (_) {}

    // 6. Crear Cita (appointments)
    const apptsCol = $app.findCollectionByNameOrId("appointments");
    const apptData = {
      client_id: clientRecord.id,
      stylist_id: stylistId,
      service_id: serviceId,
      sales_order_id: salesOrder.id,
      start_time: startTimeStr,
      end_time: endTimeStr,
      status: "pending",
      notes: notes ? `Reserva Online: ${notes}` : "Reserva confirmada en portal web."
    };

    if (spaClientRecord) {
      apptData.spa_client_id = spaClientRecord.id;
    }

    const apptRecord = new Record(apptsCol, apptData);
    $app.save(apptRecord);

    // 7. Generar Enlace de WhatsApp
    let spaPhone = "573000000000";
    try {
      const ph = $app.findFirstRecordByFilter("settings", "key = 'company_phone'");
      if (ph && ph.getString("value")) {
        const clean = ph.getString("value").replace(/\D/g, "");
        if (clean) spaPhone = clean.length === 10 ? "57" + clean : clean;
      }
    } catch (_) {}

    const textMsg = encodeURIComponent(
      `¡Hola! Acabo de agendar una cita estética en su portal web.\n` +
      `📅 Fecha: ${startTimeStr}\n` +
      `💆‍♀️ Tratamiento: ${serviceProd.getString("name")}\n` +
      `👩‍⚕️ Especialista: ${stylistRecord ? stylistRecord.getString("name") : "Asignada"}\n` +
      `👤 Cliente: ${name} (Doc: ${docNumber})\n` +
      `🔖 N° Pedido: ${orderNum}`
    );

    const waUrl = `https://api.whatsapp.com/send?phone=${spaPhone}&text=${textMsg}`;

    return e.json(201, {
      success: true,
      message: "¡Tu cita ha sido agendada con éxito!",
      appointment_id: apptRecord.id,
      order_id: salesOrder.id,
      order_number: orderNum,
      start_time: startTimeStr,
      end_time: endTimeStr,
      service_name: serviceProd.getString("name"),
      stylist_name: stylistRecord ? stylistRecord.getString("name") : "",
      total: total,
      whatsapp_url: waUrl
    });

  } catch (err) {
    return e.json(500, { success: false, message: "Error al procesar el agendamiento: " + String(err) });
  }
});
