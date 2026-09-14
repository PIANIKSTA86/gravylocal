/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — products_defaults_hook.pb.js
 * 
 * Salvaguarda contable y tributaria: garantiza que cada producto creado en cualquier
 * módulo del sistema cumpla estrictamente con:
 * - Tarifa de IVA predeterminada (configuración de inventarios / inventory_settings_v1)
 * - Cuenta de ingresos (configuración de facturación / sales_settings_v2)
 * - Cuenta de costo de ventas (configuración de facturación / sales_settings_v2)
 * - Cuenta de inventarios (configuración de facturación / sales_settings_v2), solo si es BIEN
 */

onRecordCreateRequest((e) => {
  const record = e.record;
  if (!record) {
    e.next();
    return;
  }

  try {
    // 1. Obtener configuraciones de Inventarios y Facturación desde settings
    let defaultIvaRate = 19;
    try {
      const invSetting = $app.findFirstRecordByFilter("settings", "key = 'inventory_settings_v1'");
      if (invSetting) {
        const parsed = JSON.parse(invSetting.get("value") || "{}");
        if (parsed.default_iva_rate !== undefined && parsed.default_iva_rate !== null && !isNaN(Number(parsed.default_iva_rate))) {
          defaultIvaRate = Number(parsed.default_iva_rate);
        }
      }
    } catch (_) {}

    let salesAccounts = {};
    try {
      const salesSetting = $app.findFirstRecordByFilter("settings", "key = 'sales_settings_v2'");
      if (salesSetting) {
        const parsed = JSON.parse(salesSetting.get("value") || "{}");
        salesAccounts = parsed?.accounting?.accounts || {};
      }
    } catch (_) {}

    // Helper para buscar cuenta de nivel 5
    const resolveAccountId = (targetCode, defaultPrefix) => {
      const code = String(targetCode || "").trim();
      if (code) {
        try {
          const exact = $app.findFirstRecordByFilter("accounts", "code = '" + code + "' && level = 5 && active = true");
          if (exact) return exact.id;
        } catch (_) {}

        try {
          const pref = $app.findFirstRecordByFilter("accounts", "code ~ '" + code + "%' && level = 5 && active = true");
          if (pref) return pref.id;
        } catch (_) {}
      }

      if (defaultPrefix) {
        try {
          const fb = $app.findFirstRecordByFilter("accounts", "code ~ '" + defaultPrefix + "%' && level = 5 && active = true");
          if (fb) return fb.id;
        } catch (_) {}
      }
      return "";
    };

    // 2. Tarifa de IVA predeterminada
    const currentIva = record.get("iva_rate");
    if (currentIva === null || currentIva === undefined || currentIva === "") {
      record.set("iva_rate", defaultIvaRate);
    }

    // 3. Cuenta de Ingresos (Clase 41)
    const currentIncome = String(record.get("income_account_id") || "").trim();
    if (!currentIncome) {
      const code = salesAccounts.income_fallback_code || salesAccounts.income_account_code || "41359501";
      const accId = resolveAccountId(code, "41");
      if (accId) record.set("income_account_id", accId);
    }

    // 4. Cuenta de Costo de Ventas (Clase 61)
    const currentCost = String(record.get("cost_account_id") || "").trim();
    if (!currentCost) {
      const code = salesAccounts.cost_fallback_code || "61359501";
      const accId = resolveAccountId(code, "61");
      if (accId) record.set("cost_account_id", accId);
    }

    // 5. Cuenta de Inventario (Clase 14) - Solo en el caso de que sea un BIEN
    const productType = String(record.get("type") || "").trim().toUpperCase();
    if (productType === "BIEN") {
      const currentInv = String(record.get("inventory_account_id") || "").trim();
      if (!currentInv) {
        const code = salesAccounts.inventory_fallback_code || salesAccounts.inventory_code || "14350501";
        const accId = resolveAccountId(code, "14");
        if (accId) record.set("inventory_account_id", accId);
      }
    } else {
      // Si es SERVICIO u otro distinto a BIEN, asegurar que no tenga cuenta de inventario
      record.set("inventory_account_id", "");
    }
  } catch (err) {
    console.log("[products_defaults_hook] Advertencia al asignar cuentas/IVA por defecto: " + err);
  }

  e.next();
}, "products");
