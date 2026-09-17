/// <reference path="../pb_data/types.d.ts" />

/**
 * Proxy de microservicios internos (Orchestrator :8088 -> PocketBase)
 * Permite que clientes remotos (Cloudflare, LAN, VPN) consuman servicios
 * de generación de documentos (ZIP DIAN, PDF Copropiedades) sobre HTTPS
 * sin incurrir en errores de Mixed Content ni requerir apertura de puertos internos.
 */

// --- DESCARGA ZIP DIAN ---
routerAdd('POST', '/api/dian/download-zip', (c) => {
  try {
    const rawBody = c.requestInfo()?.body || {};
    
    // Llamar internamente al Orquestador por loopback
    const res = $http.send({
      url: 'http://127.0.0.1:8088/api/dian/download-zip',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rawBody),
      timeout: 120
    });

    if (res.statusCode === 200) {
      const filename = rawBody.filename || 'documento_dian';
      try {
        if (c.response && c.response.Header) {
          c.response.Header().Set('Content-Disposition', 'attachment; filename="' + filename + '.zip"');
          c.response.Header().Set('Access-Control-Allow-Origin', '*');
        }
      } catch (_) {}
      return c.blob(200, 'application/zip', res.raw);
    }

    let errMsg = 'Error en el orquestador generando archivo ZIP.';
    try {
      const parsed = JSON.parse(res.raw);
      if (parsed.error) errMsg = parsed.error;
    } catch (_) {}

    return c.json(res.statusCode || 500, { error: errMsg, message: errMsg });
  } catch (err) {
    console.error('[GRAVY PROXY] Error en /api/dian/download-zip:', err);
    return c.json(500, { error: 'Error interno en proxy de descarga: ' + err.message });
  }
});

// --- GENERACIÓN PDF COPROPIEDADES PH ---
routerAdd('POST', '/api/ph/generate-pdf', (c) => {
  try {
    const rawBody = c.requestInfo()?.body || {};

    const res = $http.send({
      url: 'http://127.0.0.1:8088/api/ph/generate-pdf',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rawBody),
      timeout: 120
    });

    if (res.statusCode === 200) {
      try {
        if (c.response && c.response.Header) {
          c.response.Header().Set('Access-Control-Allow-Origin', '*');
        }
      } catch (_) {}

      if (rawBody.format === 'binary') {
        const filename = rawBody.filename || 'cuenta_cobro';
        try {
          if (c.response && c.response.Header) {
            c.response.Header().Set('Content-Disposition', 'inline; filename="' + filename + '.pdf"');
          }
        } catch (_) {}
        return c.blob(200, 'application/pdf', res.raw);
      }

      let parsed = {};
      try {
        parsed = JSON.parse(res.raw);
      } catch (_) {
        parsed = { raw: res.raw };
      }
      return c.json(200, parsed);
    }

    let errMsg = 'Error en el orquestador generando PDF PH.';
    try {
      const parsed = JSON.parse(res.raw);
      if (parsed.error) errMsg = parsed.error;
    } catch (_) {}

    return c.json(res.statusCode || 500, { error: errMsg, message: errMsg });
  } catch (err) {
    console.error('[GRAVY PROXY] Error en /api/ph/generate-pdf:', err);
    return c.json(500, { error: 'Error interno en proxy de PDF PH: ' + err.message });
  }
});
