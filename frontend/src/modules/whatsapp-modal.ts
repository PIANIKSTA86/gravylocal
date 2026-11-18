/**
 * GRAVY v2.0 — whatsapp-modal.ts
 * Modal universal interactivo para configuración y envío de documentos por WhatsApp
 * Permite al usuario revisar y editar:
 * - Teléfono del destinatario (con normalización internacional)
 * - Mensaje y comentarios personalizados
 * - Previsualización y validación del PDF adjunto
 * - Estado de conexión y vinculación directa vía QR (OpenWA)
 */

'use strict';

export interface WhatsAppSendOptions {
  docType: 'COTIZACION' | 'PEDIDO' | 'FACTURA';
  docId: string;
  docNumber: string;
  customerName?: string;
  customerPhone?: string;
  total?: number;
  lines?: any[];
  docData?: any;
  onSent?: () => void;
}

/** Abre el modal para escanear QR y vincular la sesión del bot de WhatsApp */
export async function openWhatsAppQrModal(onConnected?: () => void) {
  (window as any).showToast('Iniciando microservicio y generando código QR...', 'info');
  try {
    await (window as any).API.initWhatsApp();
  } catch (err: any) {
    (window as any).showToast('No se pudo iniciar el servicio de WhatsApp: ' + err.message, 'error');
  }

  const modalHtml = `
    <div class="text-center p-4 space-y-4">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mb-1">
        <i class="fab fa-whatsapp text-2xl"></i>
      </div>
      <h3 class="font-bold text-base text-slate-800">Vincular WhatsApp de la Empresa</h3>
      <p class="text-xs text-slate-600 max-w-sm mx-auto">
        Abre WhatsApp en tu teléfono ➔ Menú (o Configuración) ➔ <strong>Dispositivos vinculados</strong> ➔ <strong>Vincular un dispositivo</strong>, y apunta la cámara hacia este código:
      </p>
      <div id="wa-qr-container" class="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl mx-auto shadow-inner" style="min-height:260px; max-width:280px;">
        <i class="fas fa-spinner fa-spin text-3xl text-emerald-600"></i>
        <span class="text-xs text-slate-400 mt-2">Esperando código QR del servidor...</span>
      </div>
      <div id="wa-qr-countdown" class="text-[11px] text-slate-400">Actualizando código automáticamente cada 3 segundos...</div>
    </div>
  `;

  (window as any).openModal('Vincular WhatsApp', modalHtml, '<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>', false);

  const interval = setInterval(async () => {
    const container = document.getElementById('wa-qr-container');
    if (!container) {
      clearInterval(interval);
      return;
    }
    try {
      const st = await (window as any).API.getWhatsAppStatus();
      if (st && st.connected) {
        clearInterval(interval);
        container.innerHTML = `
          <div class="text-emerald-600 text-center py-4">
            <i class="fas fa-circle-check text-4xl mb-2 text-emerald-500"></i>
            <div class="font-bold text-sm text-slate-800">¡WhatsApp Vinculado con Éxito!</div>
            <p class="text-xs text-slate-500 mt-1">El bot ya está listo para enviar documentos.</p>
          </div>
        `;
        (window as any).showToast('¡WhatsApp vinculado exitosamente!', 'success');
        setTimeout(() => {
          (window as any).closeModal();
          if (typeof onConnected === 'function') onConnected();
        }, 1500);
        return;
      }
      const qrRes = await (window as any).API.getWhatsAppQr();
      if (qrRes && qrRes.qr) {
        container.innerHTML = `<img src="${qrRes.qr.startsWith('data:') ? qrRes.qr : 'data:image/png;base64,' + qrRes.qr}" style="width:240px;height:240px;object-fit:contain" alt="Código QR WhatsApp" />`;
      }
    } catch (_) {}
  }, 3000);
}

/** Modal interactivo completo para configurar número, mensaje, comentarios y enviar PDF */
export async function openWhatsAppSendModal(opts: WhatsAppSendOptions) {
  const {
    docType,
    docId,
    docNumber,
    customerName = 'Cliente',
    customerPhone = '',
    total = 0,
    lines = [],
    docData = null,
    onSent
  } = opts;

  const docTitle = docType === 'COTIZACION' ? 'Cotización' : docType === 'FACTURA' ? 'Factura Electrónica' : 'Pedido de Venta';
  const prefix = docType === 'COTIZACION' ? 'COT' : docType === 'FACTURA' ? 'FE' : 'PED';

  // Normalizar número telefónico
  let cleanPhone = String(customerPhone || '').replace(/\D/g, '');
  if (cleanPhone.length === 10 && !cleanPhone.startsWith('57')) {
    cleanPhone = '57' + cleanPhone;
  }

  // Cargar nombre de empresa y configuración de plantillas
  const [compName, tplQuote, tplOrder, tplInvoice] = await Promise.all([
    (window as any).API.getSetting('company_name').catch(() => 'GRAVY S.A.S'),
    (window as any).API.getSetting('whatsapp_template_quote').catch(() => ''),
    (window as any).API.getSetting('whatsapp_template_order').catch(() => ''),
    (window as any).API.getSetting('whatsapp_template_invoice').catch(() => ''),
  ]);

  // Construir mensaje inicial con plantilla
  let template = '';
  if (docType === 'COTIZACION') {
    template = tplQuote || `Hola *{cliente}*, te compartimos tu *Cotización Comercial {numero}* emitida por *{empresa}* por un valor total de *{total}*.\n\nQuedamos atentos a tus comentarios y a tu disposición para concretar tu pedido.`;
  } else if (docType === 'FACTURA') {
    template = tplInvoice || `Hola *{cliente}*, te adjuntamos tu *Factura Electrónica de Venta {numero}* emitida por *{empresa}* por un valor total de *{total}*.\n\n¡Agradecemos tu preferencia y confianza en nuestros servicios!`;
  } else {
    template = tplOrder || `Hola *{cliente}*, confirmamos la recepción y registro de tu *Pedido de Venta {numero}* en *{empresa}* por un valor total de *{total}*.\n\nAdjuntamos el documento detallado para tu control y seguimiento.`;
  }

  const formattedTotal = (window as any).fmt(total);
  const defaultMsg = template
    .replace(/\{cliente\}/g, customerName)
    .replace(/\{numero\}/g, docNumber)
    .replace(/\{total\}/g, formattedTotal)
    .replace(/\{empresa\}/g, compName);

  // Consultar estado inicial del bot
  const botStatus = await (window as any).API.getWhatsAppStatus();
  const isConnected = !!(botStatus && botStatus.connected);

  const modalHtml = `
    <div class="space-y-4 text-slate-700">
      <!-- Indicador de Estado del Bot -->
      <div id="wa-modal-status-banner">
        ${isConnected ? `
          <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
            <span class="flex items-center gap-2">
              <i class="fas fa-circle-check text-emerald-600 text-sm"></i>
              <span><strong>Servicio WhatsApp Conectado:</strong> Sesión activa y lista para enviar documentos.</span>
            </span>
            <span class="badge badge-green text-[10px] font-bold">ONLINE</span>
          </div>
        ` : `
          <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
            <span class="flex items-center gap-2">
              <i class="fas fa-triangle-exclamation text-amber-600 text-sm"></i>
              <span><strong>WhatsApp no conectado en el servidor:</strong> Es necesario vincular el dispositivo.</span>
            </span>
            <button type="button" class="btn btn-outline btn-xs bg-white text-amber-900 border-amber-300 hover:bg-amber-100" id="btn-wa-modal-quick-link">
              <i class="fas fa-qrcode mr-1"></i> Vincular Dispositivo
            </button>
          </div>
        `}
      </div>

      <!-- Datos del Destinatario -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="form-group mb-0">
          <label class="form-label text-xs font-semibold text-slate-700">Cliente / Destinatario</label>
          <input type="text" class="form-input text-xs bg-slate-50 font-medium" value="${(window as any).esc(customerName)}" readonly>
        </div>
        <div class="form-group mb-0">
          <label class="form-label text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span>Número de WhatsApp</span>
            <span class="text-[10px] text-slate-400 font-normal">Con código de país (57 para Colombia)</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-emerald-600 text-xs">
              <i class="fab fa-whatsapp"></i>
            </div>
            <input id="wa-send-phone" type="text" class="form-input text-xs pl-8 font-mono font-bold" value="${cleanPhone}" placeholder="Ej: 573001234567">
          </div>
        </div>
      </div>

      <!-- Mensaje a Enviar -->
      <div class="form-group mb-0">
        <div class="flex items-center justify-between mb-1">
          <label class="form-label text-xs font-semibold text-slate-700 mb-0">Mensaje de Acompañamiento</label>
          <span class="text-[10px] text-slate-400">Texto que acompañará el archivo PDF</span>
        </div>
        <textarea id="wa-send-msg" class="form-input text-xs" rows="4" style="resize:vertical">${(window as any).esc(defaultMsg)}</textarea>
      </div>

      <!-- Comentarios Adicionales Opcionales -->
      <div class="form-group mb-0">
        <label class="form-label text-xs font-semibold text-slate-700">Comentarios Adicionales (Opcional)</label>
        <textarea id="wa-send-extra-comments" class="form-input text-xs" rows="2" placeholder="Agrega notas de entrega, instrucciones bancarias o aclaraciones para este envío..." style="resize:vertical"></textarea>
      </div>

      <!-- Tarjeta del Documento PDF Adjunto -->
      <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-lg flex-shrink-0">
            <i class="fas fa-file-pdf"></i>
          </div>
          <div>
            <div class="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span>${docTitle} #${(window as any).esc(docNumber)}</span>
              <span class="badge ${docType === 'COTIZACION' ? 'badge-blue' : docType === 'FACTURA' ? 'badge-green' : 'badge-purple'} text-[9px]">${prefix}</span>
            </div>
            <div class="text-[11px] text-slate-500">Total: <strong>${formattedTotal}</strong> • Archivo oficial generado en PDF</div>
          </div>
        </div>
        <button type="button" class="btn btn-outline btn-xs text-slate-700 hover:text-indigo-600 border-slate-300 bg-white shadow-2xs" id="btn-wa-modal-preview-pdf">
          <i class="fas fa-eye mr-1 text-slate-500"></i> Previsualizar PDF
        </button>
      </div>

      <!-- Alerta de Error Dinámica -->
      <div id="wa-modal-error" class="hidden p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
        <i class="fas fa-circle-exclamation text-red-500 mt-0.5"></i>
        <div id="wa-modal-error-msg"></div>
      </div>
    </div>
  `;

  const footerHtml = `
    <div class="flex items-center justify-between w-full">
      <button type="button" class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
      <button type="button" class="btn btn-primary btn-sm flex items-center gap-1.5" style="background:#059669;border-color:#047857" id="btn-wa-modal-send">
        <i class="fab fa-whatsapp text-white text-sm"></i>
        <span id="btn-wa-modal-send-txt">Enviar por WhatsApp</span>
      </button>
    </div>
  `;

  (window as any).openModal(`Enviar ${docTitle} por WhatsApp`, modalHtml, footerHtml, false);

  // Vincular eventos internos del modal
  document.getElementById('btn-wa-modal-quick-link')?.addEventListener('click', () => {
    openWhatsAppQrModal(async () => {
      // Re-comprobar estado
      const st = await (window as any).API.getWhatsAppStatus();
      const banner = document.getElementById('wa-modal-status-banner');
      if (banner && st && st.connected) {
        banner.innerHTML = `
          <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
            <span class="flex items-center gap-2">
              <i class="fas fa-circle-check text-emerald-600 text-sm"></i>
              <span><strong>Servicio WhatsApp Conectado:</strong> Sesión activa y lista para enviar documentos.</span>
            </span>
            <span class="badge badge-green text-[10px] font-bold">ONLINE</span>
          </div>
        `;
      }
    });
  });

  // Previsualizar PDF
  document.getElementById('btn-wa-modal-preview-pdf')?.addEventListener('click', async () => {
    try {
      (window as any).showToast('Generando previsualización del PDF...', 'info');
      const pdfBase64 = await _generateDocumentPdfBase64(docType, docId, docData, lines);
      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (err: any) {
      (window as any).showToast('Error al generar previsualización: ' + err.message, 'error');
    }
  });

  // Botón Enviar
  document.getElementById('btn-wa-modal-send')?.addEventListener('click', async () => {
    const errorBox = document.getElementById('wa-modal-error');
    const errorMsg = document.getElementById('wa-modal-error-msg');
    const sendBtn = document.getElementById('btn-wa-modal-send') as HTMLButtonElement;
    const sendTxt = document.getElementById('btn-wa-modal-send-txt');

    if (errorBox) errorBox.classList.add('hidden');

    const phoneInput = (document.getElementById('wa-send-phone') as HTMLInputElement)?.value.trim() || '';
    let targetPhone = phoneInput.replace(/\D/g, '');
    if (targetPhone.length === 10 && !targetPhone.startsWith('57')) {
      targetPhone = '57' + targetPhone;
    }

    if (!targetPhone || targetPhone.length < 8) {
      if (errorBox && errorMsg) {
        errorMsg.textContent = 'Por favor ingresa un número de teléfono/WhatsApp válido con indicativo (Ej: 573001234567).';
        errorBox.classList.remove('hidden');
      }
      return;
    }

    const mainMsg = (document.getElementById('wa-send-msg') as HTMLTextAreaElement)?.value.trim() || '';
    const extraComments = (document.getElementById('wa-send-extra-comments') as HTMLTextAreaElement)?.value.trim() || '';
    
    let finalCaption = mainMsg;
    if (extraComments) {
      finalCaption += `\n\n📌 *Observaciones:* ${extraComments}`;
    }

    try {
      if (sendBtn) sendBtn.disabled = true;
      if (sendTxt) sendTxt.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Generando PDF y enviando...';

      // 1. Generar PDF
      const pdfBase64 = await _generateDocumentPdfBase64(docType, docId, docData, lines);
      const filename = `${docNumber || 'documento'}.pdf`;

      // 2. Enviar por WhatsApp
      await (window as any).API.sendPdfViaWhatsApp(targetPhone, filename, finalCaption, pdfBase64);

      (window as any).showToast(`¡${docTitle} #${docNumber} enviada con éxito por WhatsApp al ${targetPhone}!`, 'success');
      (window as any).closeModal();
      if (typeof onSent === 'function') onSent();
    } catch (err: any) {
      console.error('Error al enviar WhatsApp:', err);
      if (errorBox && errorMsg) {
        errorMsg.textContent = err.message || 'Error al enviar por WhatsApp.';
        errorBox.classList.remove('hidden');
      }
      (window as any).showToast('Error al enviar por WhatsApp: ' + err.message, 'error');
    } finally {
      if (sendBtn) sendBtn.disabled = false;
      if (sendTxt) sendTxt.textContent = 'Enviar por WhatsApp';
    }
  });
}

/** Generador auxiliar de PDF base64 según tipo de documento */
async function _generateDocumentPdfBase64(docType: string, docId: string, docData: any, lines: any[]): Promise<string> {
  const [compName, compNit, compAddress, compPhone, compEmail, compCity] = await Promise.all([
    (window as any).API.getSetting('company_name').catch(() => 'GRAVY S.A.S'),
    (window as any).API.getSetting('company_nit').catch(() => '1130636393-2'),
    (window as any).API.getSetting('company_address').catch(() => ''),
    (window as any).API.getSetting('company_phone').catch(() => ''),
    (window as any).API.getSetting('company_email').catch(() => ''),
    (window as any).API.getSetting('company_city').catch(() => ''),
  ]);

  const company = { name: compName, nit: compNit, address: compAddress, phone: compPhone, email: compEmail, city: compCity };

  if (docType === 'COTIZACION') {
    let quote = docData;
    if (!quote) {
      quote = await (window as any).API.getQuotation(docId);
    }
    let qLines = lines;
    if (!qLines || qLines.length === 0) {
      qLines = await (window as any).API.getQuotationLines(docId);
    }

    const res = await fetch(`${(window as any).pb.baseUrl}/api/orders/generate-pdf`, {
      method: 'POST',
      headers: { ...(window as any).pb.headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: { ...quote, order_type: 'COTIZACION' },
        lines: qLines,
        company,
        format: 'base64'
      })
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || 'No se pudo generar el PDF de la cotización');
    }
    const data = await res.json();
    return data.pdfBase64;
  } else if (docType === 'FACTURA') {
    let inv = docData;
    if (!inv) {
      inv = await (window as any).pb.get('invoices', docId, { expand: 'customer_id,warehouse_id,tx_id' });
    }
    let invLines = lines;
    if (!invLines || invLines.length === 0) {
      invLines = await (window as any).API.getInvoiceLines(docId);
    }

    const invoiceData = {
      ...inv,
      lines: invLines,
      customer: inv.expand?.customer_id,
      company
    };

    const res = await fetch(`${(window as any).pb.baseUrl}/api/dian/generate-pdf`, {
      method: 'POST',
      headers: { ...(window as any).pb.headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: inv.number || 'Factura',
        invoiceData,
        format: 'base64'
      })
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || 'No se pudo generar el PDF de la factura');
    }
    const data = await res.json();
    return data.pdfBase64;
  } else {
    // Pedido
    let ord = docData;
    if (!ord) {
      ord = await (window as any).pb.get('sales_orders', docId, { expand: 'customer_id,warehouse_id' });
    }
    let ordLines = lines;
    if (!ordLines || ordLines.length === 0) {
      ordLines = await (window as any).API.getSalesOrderLines(docId);
    }

    const res = await fetch(`${(window as any).pb.baseUrl}/api/orders/generate-pdf`, {
      method: 'POST',
      headers: { ...(window as any).pb.headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: ord,
        lines: ordLines,
        company,
        format: 'base64'
      })
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || 'No se pudo generar el PDF del pedido');
    }
    const data = await res.json();
    return data.pdfBase64;
  }
}

// Exportar globalmente en window
(window as any).openWhatsAppQrModal = openWhatsAppQrModal;
(window as any).openWhatsAppSendModal = openWhatsAppSendModal;
