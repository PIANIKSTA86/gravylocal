/**
 * GRAVY v2.0 — whatsapp-service.js
 * Microservicio de automatización de WhatsApp Web para GRAVY Core Financiero.
 * Proporciona vinculación mediante Código QR en tiempo real, persistencia de sesión
 * y despacho automatizado de documentos PDF (Cotizaciones, Pedidos, Facturas).
 */

const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-extra');
let QRCode = null;
try {
  QRCode = require('qrcode');
} catch (e) {
  console.warn('[GRAVY WHATSAPP] qrcode no disponible:', e.message);
}

const chromePath = 'C:\\Users\\JULIAN\\.cache\\puppeteer\\chrome\\win64-157.0.8103.50\\chrome-win64\\chrome.exe';
const sessionDir = path.resolve(__dirname, '..', 'DatosReferencia', 'whatsapp_session');
const tempDir = path.resolve(__dirname, '..', 'DatosReferencia', 'temp_whatsapp');

if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

let browserInstance = null;
let pageInstance = null;
let connectionStatus = 'DISCONNECTED'; // 'DISCONNECTED' | 'STARTING' | 'SCAN_QR' | 'CONNECTED'
let currentQrCode = null;
let lastQrRef = null;
let lastError = null;
let sessionInfo = null;
let pollTimer = null;
let isInitializing = false;

function formatPhone(phone) {
  let cleaned = String(phone || '').replace(/\D/g, '');
  if (!cleaned) return null;
  // Si tiene 10 dígitos y empieza por 3 (celular Colombia típico)
  if (cleaned.length === 10 && cleaned.startsWith('3')) {
    cleaned = '57' + cleaned;
  }
  return cleaned;
}

async function getStatus() {
  return {
    connected: connectionStatus === 'CONNECTED',
    status: connectionStatus,
    sessionInfo,
    lastError,
    hasQr: !!currentQrCode
  };
}

async function getQr() {
  return {
    qr: currentQrCode,
    status: connectionStatus
  };
}

function startPolling(page) {
  if (pollTimer) clearInterval(pollTimer);

  pollTimer = setInterval(async () => {
    if (!page || page.isClosed()) {
      connectionStatus = 'DISCONNECTED';
      currentQrCode = null;
      if (pollTimer) clearInterval(pollTimer);
      return;
    }

    try {
      const state = await page.evaluate(() => {
        const isConnected = Boolean(
          document.querySelector('#pane-side') ||
          document.querySelector('[data-testid="chat-list-search"]') ||
          document.querySelector('header [data-icon="community"]') ||
          document.querySelector('footer div[contenteditable="true"]')
        );

        const qrRef =
          document.querySelector('canvas[aria-label]')?.parentElement?.getAttribute('data-ref') ||
          document.querySelector('[data-ref]')?.getAttribute('data-ref') ||
          null;

        let nameOrPhone = null;
        if (isConnected) {
          const profileHeader = document.querySelector('header [title]')?.getAttribute('title');
          nameOrPhone = profileHeader || 'GRAVY WhatsApp Bot';
        }

        return { isConnected, qrRef, nameOrPhone };
      });

      if (state.isConnected) {
        if (connectionStatus !== 'CONNECTED') {
          console.log('[GRAVY WHATSAPP] ¡WhatsApp conectado y sesión activa!');
          connectionStatus = 'CONNECTED';
          currentQrCode = null;
          lastQrRef = null;
          sessionInfo = {
            pushname: state.nameOrPhone || 'GRAVY WhatsApp Bot',
            connectedAt: new Date().toISOString()
          };
        }
      } else if (state.qrRef) {
        connectionStatus = 'SCAN_QR';
        if (state.qrRef !== lastQrRef) {
          lastQrRef = state.qrRef;
          console.log('[GRAVY WHATSAPP] Nuevo código QR detectado, generando imagen...');
          if (QRCode) {
            currentQrCode = await QRCode.toDataURL(state.qrRef, { margin: 2, width: 280 });
          } else {
            currentQrCode = state.qrRef;
          }
        }
      } else {
        if (connectionStatus !== 'CONNECTED') {
          connectionStatus = 'STARTING';
        }
      }
    } catch (err) {
      // Ignorar si la página estaba navegando
    }
  }, 2000);
}

async function initWhatsApp(forceRestart = false) {
  if (isInitializing) {
    return { success: true, message: 'Inicialización de WhatsApp en progreso...' };
  }

  if (browserInstance && connectionStatus === 'CONNECTED' && !forceRestart) {
    return { success: true, message: 'WhatsApp ya se encuentra conectado.' };
  }

  if (forceRestart && browserInstance) {
    try {
      if (pollTimer) clearInterval(pollTimer);
      await browserInstance.close();
    } catch (_) {}
    browserInstance = null;
    pageInstance = null;
  }

  isInitializing = true;
  connectionStatus = 'STARTING';
  currentQrCode = null;
  lastQrRef = null;
  lastError = null;

  try {
    console.log('[GRAVY WHATSAPP] Iniciando navegador seguro Chromium...');
    browserInstance = await puppeteer.launch({
      headless: true,
      executablePath: chromePath,
      userDataDir: sessionDir,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run'
      ]
    });

    browserInstance.on('disconnected', () => {
      console.warn('[GRAVY WHATSAPP] Navegador desconectado o cerrado.');
      connectionStatus = 'DISCONNECTED';
      currentQrCode = null;
      if (pollTimer) clearInterval(pollTimer);
    });

    const pages = await browserInstance.pages();
    pageInstance = pages.length > 0 ? pages[0] : await browserInstance.newPage();

    await pageInstance.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    );

    console.log('[GRAVY WHATSAPP] Cargando WhatsApp Web...');
    await pageInstance.goto('https://web.whatsapp.com', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    startPolling(pageInstance);
    isInitializing = false;

    return {
      success: true,
      message: 'Servicio de WhatsApp iniciado. Esperando conexión o lectura de QR.'
    };
  } catch (err) {
    isInitializing = false;
    connectionStatus = 'DISCONNECTED';
    lastError = err.message || String(err);
    console.error('[GRAVY WHATSAPP] Error al inicializar WhatsApp:', err);
    return { success: false, error: lastError };
  }
}

async function logoutWhatsApp() {
  if (pollTimer) clearInterval(pollTimer);

  if (pageInstance && !pageInstance.isClosed()) {
    try {
      await pageInstance.evaluate(async () => {
        try {
          const menuBtn = document.querySelector('header [data-icon="menu"]') || document.querySelector('header [data-icon="more-vert"]');
          if (menuBtn) {
            menuBtn.click();
            await new Promise(r => setTimeout(r, 400));
            const logoutItem = Array.from(document.querySelectorAll('div[role="button"]')).find(el => el.innerText?.toLowerCase().includes('cerrar sesi'));
            if (logoutItem) logoutItem.click();
          }
        } catch (_) {}
      });
    } catch (_) {}
  }

  if (browserInstance) {
    try {
      await browserInstance.close();
    } catch (_) {}
    browserInstance = null;
    pageInstance = null;
  }

  connectionStatus = 'DISCONNECTED';
  currentQrCode = null;
  lastQrRef = null;
  sessionInfo = null;

  return { success: true, message: 'Sesión de WhatsApp cerrada exitosamente.' };
}

async function sendPdfDocument(phone, pdfBufferOrBase64, filename = 'documento.pdf', caption = '') {
  if (connectionStatus !== 'CONNECTED' || !pageInstance || pageInstance.isClosed()) {
    // Si la sesión guardada existe, intentar auto-inicializar antes de fallar
    if (!browserInstance) {
      await initWhatsApp(false);
      await new Promise(r => setTimeout(r, 4000));
    }
    if (connectionStatus !== 'CONNECTED' || !pageInstance) {
      throw new Error('El servicio de WhatsApp no está conectado. Por favor vincula la sesión con código QR desde Configuración.');
    }
  }

  const recipient = formatPhone(phone);
  if (!recipient) {
    throw new Error('El número de WhatsApp del cliente no es válido o no está configurado.');
  }

  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const tempFilePath = path.join(tempDir, `wa_${Date.now()}_${cleanFilename}`);

  try {
    let pdfBuffer = pdfBufferOrBase64;
    if (typeof pdfBufferOrBase64 === 'string') {
      const base64Data = pdfBufferOrBase64.includes(',') ? pdfBufferOrBase64.split(',')[1] : pdfBufferOrBase64;
      pdfBuffer = Buffer.from(base64Data, 'base64');
    }
    fs.writeFileSync(tempFilePath, pdfBuffer);

    console.log(`[GRAVY WHATSAPP] Iniciando despacho de ${cleanFilename} hacia ${recipient}...`);

    // 1. Navegar al chat del destinatario SIN texto en la URL para evitar botones de envío conflictivos en el footer
    const chatUrl = `https://web.whatsapp.com/send?phone=${recipient}`;
    try {
      await pageInstance.evaluate((url) => {
        window.location.href = url;
      }, chatUrl);
    } catch (_) {
      await pageInstance.goto(chatUrl, { waitUntil: 'load', timeout: 35000 }).catch(() => {});
    }

    // 2. Esperar a que el chat cargue o que WhatsApp indique si el número es inválido
    await pageInstance.waitForSelector('footer, div[contenteditable="true"], button[aria-label="Adjuntar"], [data-icon="plus"], div[role="dialog"]', {
      timeout: 35000
    });

    await new Promise(r => setTimeout(r, 1500));

    // 3. Validar si apareció diálogo de número inválido
    const invalidNumberDetected = await pageInstance.evaluate(() => {
      const dialog = document.querySelector('div[role="dialog"]');
      if (!dialog) return null;
      const text = dialog.innerText || '';
      if (text.toLowerCase().includes('no es válido') || text.toLowerCase().includes('invalid') || text.toLowerCase().includes('no está en whatsapp')) {
        const btn = dialog.querySelector('button');
        if (btn) btn.click();
        return text;
      }
      return null;
    });

    if (invalidNumberDetected) {
      throw new Error(`El número telefónico ${phone} no es válido o no tiene WhatsApp activo.`);
    }

    // 4. Localizar y pulsar el botón de adjuntar (+)
    const attachBtnSelector = 'button[aria-label="Adjuntar"], [data-icon="plus"], [data-icon="attach-menu-plus"], div[aria-label="Adjuntar"], [title="Adjuntar"]';
    await pageInstance.waitForSelector(attachBtnSelector, { timeout: 15000 });
    const attachButton = await pageInstance.$(attachBtnSelector);
    if (!attachButton) {
      throw new Error('No se localizó el botón de adjuntos en la interfaz del chat.');
    }
    await attachButton.click();
    console.log('[GRAVY WHATSAPP] Menú de adjuntos desplegado.');

    // 5. Esperar a que el botón de menú "Documento" aparezca
    const docBtnSelector = 'button[role="menuitem"][aria-label="Documento"], button[aria-label="Documento"]';
    await pageInstance.waitForSelector(docBtnSelector, { timeout: 10000 });
    const docButton = await pageInstance.$(docBtnSelector);
    if (!docButton) {
      throw new Error('No se localizó la opción "Documento" en el menú de adjuntos.');
    }

    // 6. Interceptar el selector de archivos nativo y cargar el PDF
    console.log('[GRAVY WHATSAPP] Interceptando selector de archivo para adjuntar PDF...');
    const [fileChooser] = await Promise.all([
      pageInstance.waitForFileChooser({ timeout: 12000 }),
      docButton.click()
    ]);
    await fileChooser.accept([tempFilePath]);
    console.log('[GRAVY WHATSAPP] Archivo PDF cargado en la previsualización de WhatsApp.');

    // 7. Esperar a que renderice la pantalla de previsualización del documento con su botón de envío
    const sendBtnSelector = '[aria-label*="Enviar"], [aria-label*="Send"], [data-icon="send"], span[data-icon="send"]';
    await pageInstance.waitForSelector(sendBtnSelector, { timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));

    // 8. Hacer clic específicamente en el botón de envío del documento
    const sendResult = await pageInstance.evaluate(() => {
      const candidates = Array.from(document.querySelectorAll('div[role="button"], button'));
      const sendBtn = candidates.find(b => {
        const label = (b.getAttribute('aria-label') || '').toLowerCase();
        return label.includes('enviar') || label.includes('send');
      });
      if (sendBtn) {
        sendBtn.click();
        return sendBtn.getAttribute('aria-label') || 'enviado';
      }
      return null;
    });

    console.log(`[GRAVY WHATSAPP] Documento PDF enviado con éxito (acción: ${sendResult}).`);

    // 9. Esperar a que WhatsApp procese la carga del documento
    await new Promise(r => setTimeout(r, 3500));

    // 10. Si se especificó un mensaje de texto / acompañamiento, enviarlo a continuación
    if (caption && caption.trim().length > 0) {
      console.log('[GRAVY WHATSAPP] Despachando mensaje de acompañamiento en el chat...');
      const chatInputSelector = 'footer div[contenteditable="true"]';
      await pageInstance.waitForSelector(chatInputSelector, { timeout: 10000 }).catch(() => null);

      await pageInstance.evaluate((text) => {
        const el = document.querySelector('footer div[contenteditable="true"]');
        if (el) {
          el.focus();
          document.execCommand('insertText', false, text);
        }
      }, caption);

      await new Promise(r => setTimeout(r, 600));
      await pageInstance.keyboard.press('Enter');
      console.log('[GRAVY WHATSAPP] Mensaje de texto despachado.');
      await new Promise(r => setTimeout(r, 2000));
    }

    return {
      success: true,
      recipient,
      filename: cleanFilename,
      timestamp: new Date().toISOString()
    };
  } finally {
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (_) {}
  }
}

module.exports = {
  getStatus,
  getQr,
  initWhatsApp,
  logoutWhatsApp,
  sendPdfDocument,
  formatPhone
};
