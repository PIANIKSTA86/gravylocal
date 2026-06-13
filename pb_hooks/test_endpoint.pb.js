routerAdd("GET", "/test-smtp", (c) => {
  let output = {};
  try {
    const smtpEnabled = getSetting("smtp_enabled", "0");
    output.smtpEnabledSetting = smtpEnabled;
    
    const pbSettings = $app.settings();
    output.pbSmtpBefore = {
      enabled: pbSettings.smtp.enabled,
      host: pbSettings.smtp.host,
      port: pbSettings.smtp.port,
      username: pbSettings.smtp.username
    };
    
    // Run syncSmtpSettings
    if (typeof syncSmtpSettings === 'function') {
      syncSmtpSettings();
      
      const pbSettingsAfter = $app.settings();
      output.pbSmtpAfter = {
        enabled: pbSettingsAfter.smtp.enabled,
        host: pbSettingsAfter.smtp.host,
        port: pbSettingsAfter.smtp.port,
        username: pbSettingsAfter.smtp.username
      };
    } else {
      output.syncSmtpSettingsFound = false;
    }
  } catch(e) {
    output.error = e.message || String(e);
  }
  return c.json(200, output);
});
