/**
 * GRAVY v2.0 — dian_token_sync.js
 * Motor Nativo Node.js para Ingestión y Sincronización Oficial DIAN VPFE.
 * 
 * Diseñado para operar de forma multiplataforma y sin dependencias binarias externas (sin curl.exe).
 * Maneja el ciclo completo de autenticación por Token Único (Magic Link),
 * jar de cookies en memoria, extracción de tokens anti-falsificación y paginación
 * de documentos Recibidos y Emitidos contra catalogo-vpfe.dian.gov.co.
 */

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

class MemoryCookieJar {
  constructor() {
    this.cookies = new Map();
  }

  addFromResponse(res) {
    if (!res || !res.headers) return;
    let cookieList = [];
    if (typeof res.headers.getSetCookie === 'function') {
      cookieList = res.headers.getSetCookie();
    } else {
      const single = res.headers.get('set-cookie');
      if (single) cookieList = [single];
    }

    for (const cStr of cookieList) {
      if (!cStr) continue;
      const parts = cStr.split(';');
      const nameVal = parts[0].trim();
      const eqIdx = nameVal.indexOf('=');
      if (eqIdx > 0) {
        const name = nameVal.substring(0, eqIdx).trim();
        const val = nameVal.substring(eqIdx + 1).trim();
        this.cookies.set(name, val);
      }
    }
  }

  getCookieString() {
    const pairs = [];
    for (const [name, val] of this.cookies.entries()) {
      pairs.push(`${name}=${val}`);
    }
    return pairs.join('; ');
  }

  has(name) {
    return this.cookies.has(name);
  }

  get(name) {
    return this.cookies.get(name);
  }
}

function normalizeUrl(input) {
  if (!input || typeof input !== 'string') return null;
  let trimmed = input.trim().replace(/^["']|["']$/g, '');
  trimmed = trimmed.replace(/\|/g, '%7C');
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const match = trimmed.match(/(https?:\/\/[^\s"'<>]+)/i);
    return match ? match[1] : trimmed;
  }
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (guidRegex.test(trimmed)) {
    return `https://catalogo-vpfe.dian.gov.co/User/AuthToken?token=${encodeURIComponent(trimmed)}`;
  }
  if (trimmed.includes('token=')) {
    const tokenVal = trimmed.split('token=')[1].split('&')[0];
    return `https://catalogo-vpfe.dian.gov.co/User/AuthToken?token=${encodeURIComponent(tokenVal)}`;
  }
  return `https://catalogo-vpfe.dian.gov.co/User/AuthToken?token=${encodeURIComponent(trimmed)}`;
}

async function establishSession(fullUrl, jar) {
  const normUrl = normalizeUrl(fullUrl);
  if (!normUrl) {
    return { success: false, error: 'URL o token inválido.' };
  }

  try {
    // 1. Invocar AuthToken sin seguir redirecciones automáticas para capturar Set-Cookie
    const authRes = await fetch(normUrl, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-CO,es;q=0.9'
      }
    });

    jar.addFromResponse(authRes);

    // 2. Si hay redirección 302/301, seguirla manualmente transportando cookies
    const location = authRes.headers.get('location');
    let homeHtml = '';

    if (location || authRes.status === 302 || authRes.status === 301) {
      let targetUrl = location || 'https://catalogo-vpfe.dian.gov.co/';
      if (targetUrl.startsWith('/')) {
        targetUrl = 'https://catalogo-vpfe.dian.gov.co' + targetUrl;
      }

      const redirectRes = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-CO,es;q=0.9',
          'Cookie': jar.getCookieString()
        }
      });
      jar.addFromResponse(redirectRes);
      homeHtml = await redirectRes.text();
    } else {
      homeHtml = await authRes.text();
    }

    // 3. Validar si obtuvimos la cookie de sesión autenticada de ASP.NET
    if (!jar.has('.AspNet.ApplicationCookie')) {
      return {
        success: false,
        valid: false,
        error: 'El token DIAN es inválido, ya fue utilizado o ha caducado. La DIAN solo permite el uso de este enlace dentro de los 60 minutos posteriores a su emisión.'
      };
    }

    // 4. Extraer nombre del contribuyente desde el HTML
    let contributorName = 'CONTRIBUYENTE';
    const nameMatch = homeHtml.match(/<p class="type-person">[^<]*<\/p>\s*([^\r\n<]+)/i) ||
                      homeHtml.match(/class="user-name">([^<]+)<\/span>/i) ||
                      homeHtml.match(/class="navbar-user-name">([^<]+)<\/span>/i);
    if (nameMatch && nameMatch[1]) {
      contributorName = nameMatch[1].trim();
    }

    return {
      success: true,
      valid: true,
      contributorName: contributorName,
      cookieString: jar.getCookieString()
    };
  } catch (err) {
    return {
      success: false,
      valid: false,
      error: `Error de conexión comunicando con portal DIAN: ${err.message}`
    };
  }
}

async function fetchDianGroup(groupType, jar, startDate, endDate) {
  const isSent = (groupType === 'sent');
  const pageUrl = isSent
    ? 'https://catalogo-vpfe.dian.gov.co/Document/Sent'
    : 'https://catalogo-vpfe.dian.gov.co/Document/Received';
  const filterType = isSent ? '2' : '3';

  // 1. Cargar la página inicial para extraer __RequestVerificationToken
  const pageRes = await fetch(pageUrl, {
    method: 'GET',
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-CO,es;q=0.9',
      'Cookie': jar.getCookieString()
    }
  });

  jar.addFromResponse(pageRes);
  const pageHtml = await pageRes.text();

  const tokenMatch = pageHtml.match(/name="__RequestVerificationToken"\s+type="hidden"\s+value="([^"]+)"/i) ||
                     pageHtml.match(/value="([^"]+)"\s+name="__RequestVerificationToken"/i);
  if (!tokenMatch || !tokenMatch[1]) {
    return { items: [], error: `No se encontró __RequestVerificationToken en ${pageUrl}` };
  }
  const verificationToken = tokenMatch[1];

  let allItems = [];
  let continuationToken = '';
  let pageCount = 0;

  do {
    pageCount++;
    const postParams = new URLSearchParams();
    postParams.append('DocumentKey', '');
    postParams.append('SerieAndNumber', '');
    postParams.append('SenderCode', '');
    postParams.append('ReceiverCode', '');
    postParams.append('StartDate', startDate);
    postParams.append('EndDate', endDate);
    postParams.append('DocumentTypeId', '00');
    postParams.append('Status', '0');
    postParams.append('RadianStatus', '0');
    postParams.append('ReferencesType', '00');
    postParams.append('FilterType', filterType);
    postParams.append('SearchRequested', 'true');
    postParams.append('ContinuationToken', continuationToken);
    postParams.append('__RequestVerificationToken', verificationToken);

    const ajaxRes = await fetch('https://catalogo-vpfe.dian.gov.co/Document/GetDocumentsPageToken', {
      method: 'POST',
      headers: {
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': pageUrl,
        'Cookie': jar.getCookieString()
      },
      body: postParams.toString()
    });

    jar.addFromResponse(ajaxRes);
    const ajaxJson = await ajaxRes.json().catch(() => null);

    if (ajaxJson && Array.isArray(ajaxJson.data)) {
      allItems = allItems.concat(ajaxJson.data);
      continuationToken = ajaxJson.continuationToken || '';
      if (!ajaxJson.hasMore || !continuationToken) {
        break;
      }
    } else {
      break;
    }
  } while (pageCount < 15);

  return { items: allItems };
}

async function main() {
  const args = process.argv.slice(2);
  let action = 'validate';
  let tokenUrl = '';
  let documentGroup = 'all';
  let startDate = '';
  let endDate = '';

  for (const arg of args) {
    if (arg.startsWith('--action=')) action = arg.slice(9);
    else if (arg.startsWith('--token_url=')) tokenUrl = arg.slice(12);
    else if (arg.startsWith('--group=')) documentGroup = arg.slice(8);
    else if (arg.startsWith('--start_date=')) startDate = arg.slice(13);
    else if (arg.startsWith('--end_date=')) endDate = arg.slice(11);
    else if (!tokenUrl && (arg.startsWith('http') || arg.includes('token='))) tokenUrl = arg;
  }

  if (!tokenUrl) {
    console.log(JSON.stringify({ success: false, error: 'Parámetro --token_url requerido.' }));
    return;
  }

  const jar = new MemoryCookieJar();
  const session = await establishSession(tokenUrl, jar);

  if (!session.success) {
    console.log(JSON.stringify(session));
    return;
  }

  if (action === 'validate') {
    console.log(JSON.stringify({
      success: true,
      valid: true,
      message: 'Token DIAN verificado con éxito. Sesión oficial establecida.',
      contributorName: session.contributorName
    }));
    return;
  }

  // Sincronización de documentos
  let receivedItems = [];
  let sentItems = [];

  const todayIso = new Date().toISOString().slice(0, 10);
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const effStartDate = startDate || ninetyDaysAgo;
  const effEndDate = endDate || todayIso;

  if (documentGroup === 'received' || documentGroup === 'all') {
    const recResult = await fetchDianGroup('received', jar, effStartDate, effEndDate);
    receivedItems = recResult.items || [];
  }

  if (documentGroup === 'sent' || documentGroup === 'all') {
    const sentResult = await fetchDianGroup('sent', jar, effStartDate, effEndDate);
    sentItems = sentResult.items || [];
  }

  console.log(JSON.stringify({
    success: true,
    contributorName: session.contributorName,
    startDate: effStartDate,
    endDate: effEndDate,
    documentGroup: documentGroup,
    received: receivedItems,
    sent: sentItems
  }));
}

main().catch(err => {
  console.log(JSON.stringify({
    success: false,
    error: `Fallo inesperado en motor de sincronización DIAN: ${err.message}`
  }));
});
