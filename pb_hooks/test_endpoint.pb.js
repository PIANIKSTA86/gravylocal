routerAdd("GET", "/test-smtp", (c) => {
  const getSetting = function(key, fallback) {
    try {
      const r = $app.findFirstRecordByFilter("settings", "key = '" + key + "'");
      return r.get("value") || fallback;
    } catch (_) {
      return fallback;
    }
  };

  const syncSmtpSettings = function() {
    const smtpEnabled = getSetting("smtp_enabled", "0") === "1";
    try {
      const pbSettings = $app.settings();
      if (smtpEnabled) {
        const host = getSetting("smtp_host", "");
        const port = parseInt(getSetting("smtp_port", "587"), 10);
        const user = getSetting("smtp_username", "");
        const pass = getSetting("smtp_password", "");
        const senderName = getSetting("smtp_sender_name", "");
        const senderAddr = getSetting("smtp_sender_address", "");
        
        pbSettings.smtp.enabled = true;
        pbSettings.smtp.host = host;
        pbSettings.smtp.port = port;
        pbSettings.smtp.username = user;
        pbSettings.smtp.password = pass;
        pbSettings.smtp.tls = (port === 465);
        pbSettings.meta.senderName = senderName || getSetting("company_name", "GRAVY S.A.S");
        pbSettings.meta.senderAddress = senderAddr || user;
      } else {
        pbSettings.smtp.enabled = false;
      }
      $app.save(pbSettings);
    } catch (err) {
      console.error("Error sync:", err);
    }
  };

  let output = {};
  try {
    const pbSettingsBefore = $app.settings();
    output.pbSmtpBefore = {
      enabled: pbSettingsBefore.smtp.enabled,
      host: pbSettingsBefore.smtp.host,
      port: pbSettingsBefore.smtp.port,
      username: pbSettingsBefore.smtp.username
    };

    syncSmtpSettings();

    const pbSettingsAfter = $app.settings();
    output.pbSmtpAfter = {
      enabled: pbSettingsAfter.smtp.enabled,
      host: pbSettingsAfter.smtp.host,
      port: pbSettingsAfter.smtp.port,
      username: pbSettingsAfter.smtp.username
    };
  } catch(e) {
    output.error = e.message || String(e);
  }
  return c.json(200, output);
});

routerAdd("GET", "/test-dv", (c) => {
  const calcularDV = (nit) => {
    const cleanNit = String(nit || '').replace(/[^0-9]/g, '');
    if (!cleanNit) return '0';
    const pesos = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
    let suma = 0;
    const len = cleanNit.length;
    for (let i = 0; i < len; i++) {
      const digito = parseInt(cleanNit.charAt(len - 1 - i), 10);
      suma += digito * pesos[i];
    }
    const residuo = suma % 11;
    return String(residuo > 1 ? 11 - residuo : residuo);
  };
  
  let companyNitSetting = "";
  try {
    companyNitSetting = $app.findFirstRecordByFilter("settings", "key = 'company_nit'").get("value");
  } catch(e) {}

  return c.json(200, {
    dv_1023908638: calcularDV('1023908638'),
    dv_1023908638_num: calcularDV(1023908638),
    companyNitSetting: companyNitSetting,
    dv_company_nit: calcularDV(companyNitSetting)
  });
});

routerAdd("GET", "/inspect-app", (c) => {
  let keys = [];
  try {
    for (let k in $app) {
      keys.push(k);
    }
    let proto = Object.getPrototypeOf($app);
    if (proto) {
      for (let k in proto) {
        if (!keys.includes(k)) {
          keys.push(k);
        }
      }
      let protoProto = Object.getPrototypeOf(proto);
      if (protoProto) {
        for (let k in protoProto) {
          if (!keys.includes(k)) {
            keys.push(k);
          }
        }
      }
    }
  } catch(e) {
    keys.push("error: " + e.message);
  }
  return c.json(200, { keys: keys });
});

