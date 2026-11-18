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

// --- GENERACIÓN PDF DIAN (FACTURAS, NOTAS, DOCUMENTO SOPORTE) ---
routerAdd('POST', '/api/dian/generate-pdf', (c) => {
  try {
    const rawBody = c.requestInfo()?.body || {};

    const res = $http.send({
      url: 'http://127.0.0.1:8088/api/dian/generate-pdf',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rawBody),
      timeout: 120
    });

    if (res.statusCode === 200) {
      const filename = rawBody.filename || 'documento_dian';
      try {
        if (c.response && c.response.Header) {
          c.response.Header().Set('Content-Disposition', 'inline; filename="' + filename + '.pdf"');
          c.response.Header().Set('Access-Control-Allow-Origin', '*');
        }
      } catch (_) {}
      return c.blob(200, 'application/pdf', res.raw);
    }

    let errMsg = 'Error en el orquestador generando PDF DIAN.';
    try {
      const parsed = JSON.parse(res.raw);
      if (parsed.error) errMsg = parsed.error;
    } catch (_) {}

    return c.json(res.statusCode || 500, { error: errMsg, message: errMsg });
  } catch (err) {
    console.error('[GRAVY PROXY] Error en /api/dian/generate-pdf:', err);
    return c.json(500, { error: 'Error interno en proxy de PDF DIAN: ' + err.message });
  }
});



// --- WHATSAPP BOT SERVICE PROXIES ---
routerAdd('GET', '/api/whatsapp/status', (c) => {
  try {
    const res = $http.send({
      url: 'http://127.0.0.1:8088/api/whatsapp/status',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 10
    });
    return c.json(res.statusCode || 200, JSON.parse(res.raw || '{}'));
  } catch (err) {
    return c.json(500, { connected: false, error: 'Proxy error WhatsApp status: ' + err.message });
  }
});

routerAdd('GET', '/api/whatsapp/qr', (c) => {
  try {
    const res = $http.send({
      url: 'http://127.0.0.1:8088/api/whatsapp/qr',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 10
    });
    return c.json(res.statusCode || 200, JSON.parse(res.raw || '{}'));
  } catch (err) {
    return c.json(500, { error: 'Proxy error WhatsApp QR: ' + err.message });
  }
});

routerAdd('POST', '/api/whatsapp/init', (c) => {
  try {
    const rawBody = c.requestInfo()?.body || {};
    const res = $http.send({
      url: 'http://127.0.0.1:8088/api/whatsapp/init',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rawBody),
      timeout: 30
    });
    return c.json(res.statusCode || 200, JSON.parse(res.raw || '{}'));
  } catch (err) {
    return c.json(500, { error: 'Proxy error WhatsApp init: ' + err.message });
  }
});

routerAdd('POST', '/api/whatsapp/logout', (c) => {
  try {
    const res = $http.send({
      url: 'http://127.0.0.1:8088/api/whatsapp/logout',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 20
    });
    return c.json(res.statusCode || 200, JSON.parse(res.raw || '{}'));
  } catch (err) {
    return c.json(500, { error: 'Proxy error WhatsApp logout: ' + err.message });
  }
});

routerAdd('POST', '/api/whatsapp/send-pdf', (c) => {
  try {
    const rawBody = c.requestInfo()?.body || {};
    const res = $http.send({
      url: 'http://127.0.0.1:8088/api/whatsapp/send-pdf',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rawBody),
      timeout: 60
    });
    return c.json(res.statusCode || 200, JSON.parse(res.raw || '{}'));
  } catch (err) {
    return c.json(500, { error: 'Proxy error WhatsApp send-pdf: ' + err.message });
  }
});

// --- GENERACIÓN PDF PEDIDOS / COTIZACIONES ---
routerAdd('POST', '/api/orders/generate-pdf', (c) => {
  try {
    const rawBody = c.requestInfo()?.body || {};
    const res = $http.send({
      url: 'http://127.0.0.1:8088/api/orders/generate-pdf',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rawBody),
      timeout: 60
    });

    if (res.statusCode === 200) {
      if (rawBody.format === 'base64') {
        return c.json(200, JSON.parse(res.raw || '{}'));
      }
      const filename = rawBody.filename || 'pedido';
      try {
        if (c.response && c.response.Header) {
          c.response.Header().Set('Content-Disposition', 'inline; filename="' + filename + '.pdf"');
          c.response.Header().Set('Access-Control-Allow-Origin', '*');
        }
      } catch (_) {}
      return c.blob(200, 'application/pdf', res.raw);
    }

    return c.json(res.statusCode || 500, JSON.parse(res.raw || '{}'));
  } catch (err) {
    return c.json(500, { error: 'Proxy error Order generate-pdf: ' + err.message });
  }
});
