/**
 * GRAVY v2.0 - configuracion.js
 */
'use strict';

const CONFIG_FIELDS = [
  { key: 'company_name', label: 'Razón social', placeholder: 'Nombre de la empresa' },
  { key: 'company_nit', label: 'NIT', placeholder: '900.123.456-7' },
  { key: 'company_address', label: 'Dirección', placeholder: 'Dirección principal' },
  { key: 'company_phone', label: 'Teléfono', placeholder: '601-555-0100' },
  { key: 'company_email', label: 'Correo', placeholder: 'info@empresa.com', type: 'email' },
  { key: 'smv_year', label: 'SMV del año', placeholder: '2026', type: 'number' },
];

const SIGNATURE_SETTINGS = {
  legalName: ['representante_legal_name', 'legal_representative_name', 'rep_legal_name'],
  legalTitle: ['representante_legal_title', 'legal_representative_title', 'rep_legal_title'],
  accountantName: ['contador_name', 'accountant_name'],
  accountantTitle: ['contador_title', 'accountant_title'],
  accountantLicense: ['contador_license', 'accountant_license'],
  reviewerName: ['revisor_fiscal_name', 'fiscal_reviewer_name'],
  reviewerTitle: ['revisor_fiscal_title', 'fiscal_reviewer_title'],
  reviewerLicense: ['revisor_fiscal_license', 'fiscal_reviewer_license'],
  defaultEnabled: ['trial_show_signatures_default', 'show_signatures_default'],
};

async function getSettingFirst(keys, fallback = '') {
  for (const key of keys) {
    const value = await API.getSetting(key);
    if (value) return value;
  }
  return fallback;
}

async function loadSignatureSettings() {
  const [
    legalName,
    legalTitle,
    accountantName,
    accountantTitle,
    accountantLicense,
    reviewerName,
    reviewerTitle,
    reviewerLicense,
    defaultEnabled,
  ] = await Promise.all([
    getSettingFirst(SIGNATURE_SETTINGS.legalName, ''),
    getSettingFirst(SIGNATURE_SETTINGS.legalTitle, 'Representante Legal'),
    getSettingFirst(SIGNATURE_SETTINGS.accountantName, ''),
    getSettingFirst(SIGNATURE_SETTINGS.accountantTitle, 'Contador'),
    getSettingFirst(SIGNATURE_SETTINGS.accountantLicense, ''),
    getSettingFirst(SIGNATURE_SETTINGS.reviewerName, ''),
    getSettingFirst(SIGNATURE_SETTINGS.reviewerTitle, 'Revisor Fiscal'),
    getSettingFirst(SIGNATURE_SETTINGS.reviewerLicense, ''),
    getSettingFirst(SIGNATURE_SETTINGS.defaultEnabled, '0'),
  ]);
  return {
    legalName,
    legalTitle,
    accountantName,
    accountantTitle,
    accountantLicense,
    reviewerName,
    reviewerTitle,
    reviewerLicense,
    defaultEnabled: String(defaultEnabled).trim() === '1' || String(defaultEnabled).toLowerCase() === 'true',
  };
}

async function saveSignatureSettingsFromForm() {
  if (!can('canWrite')) return showToast('Sin permisos para actualizar firmas', 'error');
  try {
    const payload = [
      [SIGNATURE_SETTINGS.legalName[0], getInputVal('sig-legal-name').trim()],
      [SIGNATURE_SETTINGS.legalTitle[0], getInputVal('sig-legal-title').trim() || 'Representante Legal'],
      [SIGNATURE_SETTINGS.accountantName[0], getInputVal('sig-acc-name').trim()],
      [SIGNATURE_SETTINGS.accountantTitle[0], getInputVal('sig-acc-title').trim() || 'Contador'],
      [SIGNATURE_SETTINGS.accountantLicense[0], getInputVal('sig-acc-license').trim()],
      [SIGNATURE_SETTINGS.reviewerName[0], getInputVal('sig-rev-name').trim()],
      [SIGNATURE_SETTINGS.reviewerTitle[0], getInputVal('sig-rev-title').trim() || 'Revisor Fiscal'],
      [SIGNATURE_SETTINGS.reviewerLicense[0], getInputVal('sig-rev-license').trim()],
      [SIGNATURE_SETTINGS.defaultEnabled[0], getCheckVal('sig-default-enabled') ? '1' : '0'],
    ];
    await Promise.all(payload.map(([k, v]) => API.setSetting(k, v)));
    showToast('Firmas actualizadas correctamente', 'success');
  } catch (err) {
    showToast(err.message || 'No se pudieron guardar las firmas', 'error');
  }
}

async function renderConfiguracion(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando configuración...</div>`;
  try {
    const [settings, signatureValues, terceros, branches, warehouses, users] = await Promise.all([
      pb.listAll('settings', { sort: 'key' }),
      loadSignatureSettings(),
      pb.listAll('third_parties', { sort: 'name' }),
      pb.listAll('branches', { sort: 'code', ignoreBranch: true }),
      pb.listAll('warehouses', { sort: 'name' }),
      pb.listAll('users', { sort: 'name' }),
    ]);
    const byKey = Object.fromEntries(settings.map((row) => [String(row.key || ''), row]));
    const canEdit = can('canWrite');

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Configuración General</h3>
          <p class="text-sm" style="color:#6B7280">Administra los parámetros base de la empresa almacenados en la colección settings.</p>
        </div>
        ${canEdit ? '<button class="btn btn-primary" id="btn-save-config"><i class="fas fa-floppy-disk"></i> Guardar cambios</button>' : ''}
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <div class="xl:col-span-2 bg-white rounded-2xl border p-5" style="border-color:#F0F0F0">
          <h4 class="font-bold mb-4" style="color:#0D2137">Datos generales</h4>
          
          <div class="form-group mb-4">
            <label class="form-label font-semibold" style="color:#1A4B8C"><i class="fas fa-link mr-1"></i> Vincular a un Tercero de la Base de Datos</label>
            <div id="cfg-third-search-wrap" class="relative">
              <input
                id="cfg-third-search"
                class="form-input font-semibold"
                autocomplete="off"
                placeholder="Buscar por NIT o Nombre para rellenar datos..."
                ${canEdit ? '' : 'disabled'}>
              <input id="cfg-third" type="hidden" value="${esc(byKey['company_third_party_id']?.value || '')}">
              <div id="cfg-third-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:200px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:30"></div>
            </div>
            <p class="text-xs mt-1" style="color:#9CA3AF">Si selecciona un tercero, la DIAN leerá los datos del emisor de esta ficha. Los campos de texto a continuación se autocompletarán.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${CONFIG_FIELDS.map((field) => `
              <div class="form-group ${field.key === 'company_address' ? 'md:col-span-2' : ''}">
                <label class="form-label">${esc(field.label)}</label>
                <input
                  id="cfg-${esc(field.key)}"
                  type="${esc(field.type || 'text')}"
                  class="form-input"
                  placeholder="${esc(field.placeholder)}"
                  value="${esc(byKey[field.key]?.value || '')}"
                  ${canEdit ? '' : 'readonly'}>
              </div>`).join('')}
            <div class="form-group md:col-span-2">
              <label class="form-label font-semibold" style="color:#0D2137"><i class="fas fa-calculator mr-1" style="color:#1A4B8C"></i> Cantidad de Decimales</label>
              <select id="cfg-decimal_places" class="form-input" ${canEdit ? '' : 'disabled'}>
                <option value="0" ${String(byKey['decimal_places']?.value || '2') === '0' ? 'selected' : ''}>0 decimales (ej: $ 1.000)</option>
                <option value="1" ${String(byKey['decimal_places']?.value || '2') === '1' ? 'selected' : ''}>1 decimal (ej: $ 1.000,5)</option>
                <option value="2" ${String(byKey['decimal_places']?.value || '2') === '2' ? 'selected' : ''}>2 decimales (ej: $ 1.000,50)</option>
                <option value="3" ${String(byKey['decimal_places']?.value || '2') === '3' ? 'selected' : ''}>3 decimales (ej: $ 1.000,500)</option>
                <option value="4" ${String(byKey['decimal_places']?.value || '2') === '4' ? 'selected' : ''}>4 decimales (ej: $ 1.000,5000)</option>
              </select>
              <p class="text-xs mt-1" style="color:#9CA3AF">Determina la precisión decimal para la visualización y reportes en todos los módulos.</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border p-5" style="border-color:#F0F0F0">
          <h4 class="font-bold mb-3" style="color:#0D2137">Logo de la Empresa</h4>
          <div class="space-y-3 text-sm">
            <div id="cfg-logo-preview-wrap" class="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 gap-2 mb-2 text-center" style="border-color:#E5E7EB; min-height:140px; background:#FAFAFA">
              ${byKey['company_logo']?.value 
                ? `<img id="cfg-logo-preview" src="data:image/png;base64,${byKey['company_logo'].value}" style="max-height:90px; max-width:180px; object-fit:contain" />` 
                : `<i class="fas fa-image text-3xl text-gray-300"></i><span class="text-xs text-gray-400">Sin logotipo comercial</span>`}
            </div>
            ${canEdit ? `
              <div class="flex flex-col gap-2">
                <input id="cfg-logo-file" type="file" accept="image/png, image/jpeg, image/jpg" class="hidden">
                <button type="button" class="btn btn-outline btn-sm w-full" onclick="document.getElementById('cfg-logo-file').click()"><i class="fas fa-upload mr-1"></i> Seleccionar Imagen</button>
                <button type="button" class="btn btn-danger btn-sm w-full ${byKey['company_logo']?.value ? '' : 'hidden'}" id="btn-delete-logo"><i class="fas fa-trash-can mr-1"></i> Eliminar Logo</button>
              </div>
            ` : ''}
            <p class="text-[11px] leading-relaxed" style="color:#9CA3AF">Se recomienda una imagen PNG transparente (escala 3:1) no mayor a 200KB.</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border p-5 mb-4" style="border-color:#F0F0F0">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h4 class="font-bold" style="color:#0D2137">Firmas para Reportes</h4>
            <p class="text-sm" style="color:#6B7280">Configura responsables y preferencia visual para los reportes financieros.</p>
          </div>
          ${canEdit ? '<button class="btn btn-secondary btn-sm" id="btn-save-signatures"><i class="fas fa-signature"></i> Guardar firmas</button>' : ''}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-group md:col-span-2">
            <label class="inline-flex items-center gap-2 text-sm" style="color:#374151">
              <input id="sig-default-enabled" type="checkbox" ${signatureValues.defaultEnabled ? 'checked' : ''} ${canEdit ? '' : 'disabled'}>
              Activar "Mostrar firmas" por defecto en Balance de Prueba
            </label>
          </div>
          <div class="form-group md:col-span-2">
            <label class="form-label">Representante legal - Nombre</label>
            <input id="sig-legal-name" class="form-input" value="${esc(signatureValues.legalName || '')}" placeholder="Nombre completo" ${canEdit ? '' : 'readonly'}>
          </div>
          <div class="form-group md:col-span-2">
            <label class="form-label">Representante legal - Cargo</label>
            <input id="sig-legal-title" class="form-input" value="${esc(signatureValues.legalTitle || 'Representante Legal')}" placeholder="Representante Legal" ${canEdit ? '' : 'readonly'}>
          </div>

          <div class="form-group">
            <label class="form-label">Contador - Nombre</label>
            <input id="sig-acc-name" class="form-input" value="${esc(signatureValues.accountantName || '')}" placeholder="Nombre completo" ${canEdit ? '' : 'readonly'}>
          </div>
          <div class="form-group">
            <label class="form-label">Contador - Cargo</label>
            <input id="sig-acc-title" class="form-input" value="${esc(signatureValues.accountantTitle || 'Contador')}" placeholder="Contador" ${canEdit ? '' : 'readonly'}>
          </div>
          <div class="form-group md:col-span-2">
            <label class="form-label">Contador - Matrícula profesional (opcional)</label>
            <input id="sig-acc-license" class="form-input" value="${esc(signatureValues.accountantLicense || '')}" placeholder="TP 123456-T" ${canEdit ? '' : 'readonly'}>
          </div>

          <div class="form-group">
            <label class="form-label">Revisor fiscal - Nombre</label>
            <input id="sig-rev-name" class="form-input" value="${esc(signatureValues.reviewerName || '')}" placeholder="Nombre completo" ${canEdit ? '' : 'readonly'}>
          </div>
          <div class="form-group">
            <label class="form-label">Revisor fiscal - Cargo</label>
            <input id="sig-rev-title" class="form-input" value="${esc(signatureValues.reviewerTitle || 'Revisor Fiscal')}" placeholder="Revisor Fiscal" ${canEdit ? '' : 'readonly'}>
          </div>
          <div class="form-group md:col-span-2">
            <label class="form-label">Revisor fiscal - Matrícula profesional (opcional)</label>
            <input id="sig-rev-license" class="form-input" value="${esc(signatureValues.reviewerLicense || '')}" placeholder="TP 654321-T" ${canEdit ? '' : 'readonly'}>
          </div>
        </div>
      </div>

      <!-- SECCIÓN DIAN / FACTURACIÓN ELECTRÓNICA -->
      <div class="bg-white rounded-2xl border p-5 mb-4" style="border-color:#F0F0F0">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h4 class="font-bold" style="color:#0D2137">Facturación Electrónica</h4>
            <p class="text-sm" style="color:#6B7280">Configura el método de facturación electrónica (Directo DIAN o Proveedor Tecnológico Facturatech).</p>
          </div>
          ${canEdit ? '<button class="btn btn-secondary btn-sm" id="btn-save-dian"><i class="fas fa-server mr-1"></i> Guardar configuración Facturación</button>' : ''}
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-group md:col-span-2">
            <label class="form-label">Método de Integración</label>
            <select id="einvoice-method" class="form-input" ${canEdit ? '' : 'disabled'}>
              <option value="dian" ${byKey['einvoice_method']?.value === 'dian' || !byKey['einvoice_method']?.value ? 'selected' : ''}>Directo DIAN (Software Propio)</option>
              <option value="facturatech" ${byKey['einvoice_method']?.value === 'facturatech' ? 'selected' : ''}>Proveedor Tecnológico (Facturatech)</option>
            </select>
          </div>

          <!-- CONTENEDOR DIRECTO DIAN -->
          <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3" id="dian-fields-container" style="${(byKey['einvoice_method']?.value === 'dian' || !byKey['einvoice_method']?.value) ? '' : 'display:none'}">
            <div class="form-group">
              <label class="form-label">Ambiente de Destino</label>
              <select id="dian-environment" class="form-input" ${canEdit ? '' : 'disabled'}>
                <option value="2" ${byKey['dian_environment']?.value === '2' ? 'selected' : ''}>Ambiente de Pruebas / Habilitación</option>
                <option value="1" ${byKey['dian_environment']?.value === '1' ? 'selected' : ''}>Ambiente de Producción</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">NIT del Facturador (sin dígito de verificación)</label>
              <input id="dian-nit" class="form-input" value="${esc(byKey['dian_nit']?.value || '')}" placeholder="Ej: 900123456" ${canEdit ? '' : 'readonly'}>
            </div>
            
            <div class="form-group md:col-span-2">
              <label class="form-label">Clave Técnica (DIAN)</label>
              <input id="dian-cltec" class="form-input" value="${esc(byKey['dian_cltec']?.value || '')}" placeholder="Ingrese la clave técnica entregada por la DIAN" ${canEdit ? '' : 'readonly'}>
            </div>
            
            <div class="form-group">
              <label class="form-label">ID del Software Autorizado (Software ID)</label>
              <input id="dian-software-id" class="form-input" value="${esc(byKey['dian_software_id']?.value || '')}" placeholder="UUID del software en el portal DIAN" ${canEdit ? '' : 'readonly'}>
            </div>
            
            <div class="form-group">
              <label class="form-label">PIN del Software</label>
              <input id="dian-software-pin" class="form-input" value="${esc(byKey['dian_software_pin']?.value || '')}" placeholder="Ej: 12345" ${canEdit ? '' : 'readonly'}>
            </div>
            
            <div class="form-group">
              <div class="flex justify-between items-center mb-1">
                <label class="form-label mb-0">Certificado Digital (.p12 / .pfx)</label>
                <span id="dian-cert-status-indicator">
                  ${byKey['dian_certificate_base64']?.value 
                    ? '<span class="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700"><i class="fas fa-check-circle mr-1"></i>Certificado Cargado</span>' 
                    : '<span class="text-xs font-semibold px-2 py-0.5 rounded bg-yellow-100 text-yellow-700"><i class="fas fa-circle-exclamation mr-1"></i>Modo Simulado</span>'}
                </span>
              </div>
              <input id="dian-cert-file" type="file" accept=".p12,.pfx" class="form-input" ${canEdit ? '' : 'disabled'}>
              <p class="text-xs mt-1" style="color:#9CA3AF">Cargue su archivo de firma digital (.p12/.pfx). Si no se carga ninguno, operará en modo simulación.</p>
            </div>
            
            <div class="form-group">
              <label class="form-label">Contraseña del Certificado</label>
              <input id="dian-cert-pass" type="password" class="form-input" value="${esc(byKey['dian_certificate_password']?.value || '')}" placeholder="Contraseña de la firma digital" ${canEdit ? '' : 'readonly'}>
            </div>
          </div>

          <!-- CONTENEDOR FACTURATECH -->
          <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3" id="ftech-fields-container" style="${byKey['einvoice_method']?.value === 'facturatech' ? '' : 'display:none'}">
            <div class="form-group">
              <label class="form-label">Ambiente Facturatech</label>
              <select id="ftech-environment" class="form-input" ${canEdit ? '' : 'disabled'}>
                <option value="2" ${byKey['ftech_environment']?.value === '2' ? 'selected' : ''}>Ambiente de Pruebas / Habilitación</option>
                <option value="1" ${byKey['ftech_environment']?.value === '1' ? 'selected' : ''}>Ambiente de Producción</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Usuario Web Service (NIT del Facturador)</label>
              <input id="ftech-username" class="form-input" value="${esc(byKey['ftech_username']?.value || '')}" placeholder="NIT del Facturador" ${canEdit ? '' : 'readonly'}>
            </div>
            
            <div class="form-group md:col-span-2">
              <label class="form-label">Contraseña Web Service Facturatech</label>
              <input id="ftech-password" type="password" class="form-input" value="${esc(byKey['ftech_password']?.value || '')}" placeholder="Contraseña Web Service provista por soportews@facturatech.co" ${canEdit ? '' : 'readonly'}>
              <p class="text-xs mt-1" style="color:#9CA3AF">Ingrese la contraseña exclusiva para consumo de webservice de Facturatech. Si se deja vacía, funcionará en modo simulación.</p>
            </div>
          </div>

          <!-- PERSONALIZACIÓN DE FACTURA PDF -->
          <div class="md:col-span-2 grid grid-cols-1 gap-3 mt-3 border-t pt-3" style="border-color:#F0F0F0">
            <h5 class="font-bold text-sm" style="color:#0D2137">Personalización de Factura PDF (Carta Estándar)</h5>
            
            <div class="form-group">
              <label class="form-label">Texto de Encabezado (Obligaciones Fiscales - use \n para saltos de línea)</label>
              <textarea id="invoice-header-text" class="form-input h-20" ${canEdit ? '' : 'readonly'} placeholder="Ej: Actividad Económica Principal 6201\nNo somos Gran Contribuyente">${esc(byKey['invoice_header_text']?.value || '')}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Texto de Pie de Página (Normativas legales, resoluciones, observaciones)</label>
              <textarea id="invoice-footer-text" class="form-input h-20" ${canEdit ? '' : 'readonly'} placeholder="Ej: Este documento es la representación gráfica de una Factura Electrónica...">${esc(byKey['invoice_footer_text']?.value || '')}</textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN SMTP -->
      <div class="bg-white rounded-2xl border p-5 mb-4" style="border-color:#F0F0F0">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h4 class="font-bold" style="color:#0D2137"><i class="fas fa-envelope mr-2" style="color:#7F7CFF"></i>Servidor de Correo (SMTP)</h4>
            <p class="text-sm" style="color:#6B7280">Configura las credenciales de correo de la empresa para el envío de notificaciones y facturación.</p>
          </div>
          ${canEdit ? '<button class="btn btn-secondary btn-sm" id="btn-save-smtp"><i class="fas fa-floppy-disk mr-1"></i> Guardar configuración SMTP</button>' : ''}
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-group md:col-span-2">
            <label class="inline-flex items-center gap-2 text-sm" style="color:#374151">
              <input id="smtp-enabled" type="checkbox" ${byKey['smtp_enabled']?.value === '1' ? 'checked' : ''} ${canEdit ? '' : 'disabled'}>
              Activar envío de correos por servidor SMTP propio
            </label>
          </div>
          
          <div class="form-group">
            <label class="form-label">Servidor SMTP (Host)</label>
            <input id="smtp-host" class="form-input" value="${esc(byKey['smtp_host']?.value || '')}" placeholder="Ej: smtp.gmail.com" ${canEdit ? '' : 'readonly'}>
          </div>
          
          <div class="form-group">
            <label class="form-label">Puerto</label>
            <input id="smtp-port" type="number" class="form-input" value="${esc(byKey['smtp_port']?.value || '465')}" placeholder="Ej: 465 o 587" ${canEdit ? '' : 'readonly'}>
          </div>
          
          <div class="form-group">
            <label class="form-label">Usuario SMTP / Correo Remitente</label>
            <input id="smtp-username" type="email" class="form-input" value="${esc(byKey['smtp_username']?.value || '')}" placeholder="Ej: tu_correo@gmail.com" ${canEdit ? '' : 'readonly'}>
          </div>
          
          <div class="form-group">
            <label class="form-label">Contraseña SMTP / Clave de Aplicación</label>
            <input id="smtp-password" type="password" class="form-input" value="${esc(byKey['smtp_password']?.value || '')}" placeholder="Contraseña o clave de aplicación" ${canEdit ? '' : 'readonly'}>
          </div>

          <div class="form-group">
            <label class="form-label">Nombre del Remitente</label>
            <input id="smtp-sender-name" class="form-input" value="${esc(byKey['smtp_sender_name']?.value || '')}" placeholder="Ej: C.R LOS GERANIOS 2" ${canEdit ? '' : 'readonly'}>
          </div>

          <div class="form-group">
            <label class="form-label">Dirección del Remitente (Opcional)</label>
            <input id="smtp-sender-address" type="email" class="form-input" value="${esc(byKey['smtp_sender_address']?.value || '')}" placeholder="Ej: remitente@empresa.com" ${canEdit ? '' : 'readonly'}>
          </div>
        </div>
      </div>

      <!-- SECCIÓN TIENDA VIRTUAL (E-COMMERCE) -->
      <div class="bg-white rounded-2xl border p-5 mb-4" style="border-color:#F0F0F0">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h4 class="font-bold" style="color:#0D2137"><i class="fas fa-store mr-2" style="color:#E11D48"></i>Tienda Virtual (E-commerce)</h4>
            <p class="text-sm" style="color:#6B7280">Configura la bodega predeterminada para validar existencias, lista de precios para el catálogo y el número de WhatsApp receptor de pedidos.</p>
          </div>
          ${canEdit ? '<button class="btn btn-secondary btn-sm" id="btn-save-ecommerce"><i class="fas fa-floppy-disk mr-1"></i> Guardar ajustes tienda</button>' : ''}
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div class="form-group">
            <label class="form-label">Bodega Predeterminada (Stock)</label>
            <select id="cfg-ecommerce-warehouse" class="form-input" ${canEdit ? '' : 'disabled'} style="color-scheme: light;">
              <option value="">Consolidado Global (Todas las Bodegas)</option>
              ${warehouses.map((w: any) => `<option value="${esc(w.id)}" ${byKey['ecommerce_default_warehouse_id']?.value === w.id ? 'selected' : ''}>${esc(w.name)}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Lista de Precios del Catálogo</label>
            <select id="cfg-ecommerce-price-list" class="form-input" ${canEdit ? '' : 'disabled'} style="color-scheme: light;">
              <option value="base_price" ${byKey['ecommerce_price_list']?.value === 'base_price' || !byKey['ecommerce_price_list']?.value ? 'selected' : ''}>Precio Base (General)</option>
              <option value="precio_venta_2" ${byKey['ecommerce_price_list']?.value === 'precio_venta_2' ? 'selected' : ''}>Precio de Venta 2 (Alternativo / Mayorista)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Usuario Responsable del Pedido</label>
            <select id="cfg-ecommerce-user" class="form-input" ${canEdit ? '' : 'disabled'} style="color-scheme: light;">
              ${users.map((u: any) => `<option value="${esc(u.id)}" ${byKey['ecommerce_default_user_id']?.value === u.id ? 'selected' : ''}>${esc(u.name || u.email)} (${esc(u.role)})</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Nombre Comercial de la Tienda</label>
            <input id="cfg-ecommerce-store-name" class="form-input" value="${esc(byKey['ecommerce_store_name']?.value || 'GRAVY')}" placeholder="Ej: GRAVY SAS" ${canEdit ? '' : 'readonly'}>
          </div>

          <div class="form-group md:col-span-2">
            <label class="form-label">Número de WhatsApp (con código de país, sin + o espacios)</label>
            <input id="cfg-ecommerce-whatsapp" class="form-input" value="${esc(byKey['ecommerce_whatsapp_number']?.value || '573000000000')}" placeholder="Ej: 573001234567" ${canEdit ? '' : 'readonly'}>
            <p class="text-xs mt-1" style="color:#9CA3AF">Número de teléfono a donde el cliente enviará el mensaje con el resumen del pedido.</p>
          </div>
        </div>
      </div>

      <!-- SECCIÓN SUCURSALES -->
      <div class="bg-white rounded-2xl border p-5 mb-4" style="border-color:#F0F0F0">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h4 class="font-bold" style="color:#0D2137"><i class="fas fa-building-user mr-2" style="color:#1A4B8C"></i>Sucursales y Centros de Costo</h4>
            <p class="text-sm" style="color:#6B7280">Administra las sucursales del sistema para segmentación de contabilidad e inventarios.</p>
          </div>
          ${canEdit ? '<button type="button" class="btn btn-primary btn-sm" id="btn-cfg-new-branch"><i class="fas fa-plus mr-1"></i> Nueva Sucursal</button>' : ''}
        </div>
        <div class="overflow-x-auto rounded-xl border" style="border-color:#F3F4F6">
          <table class="data-table" id="cfg-branches-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Estado</th>
                ${canEdit ? '<th style="width: 110px">Acciones</th>' : ''}
              </tr>
            </thead>
            <tbody id="cfg-branches-tbody">
              <!-- Cargado dinámicamente -->
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden mt-4" style="border-color:#F0F0F0">
        <div class="p-4 border-b flex items-center justify-between" style="border-color:#F3F4F6">
          <h4 class="font-bold" style="color:#0D2137">Settings detectados</h4>
          <span class="text-xs" style="color:#9CA3AF">${settings.length} registro(s)</span>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead><tr><th>Clave</th><th>Valor</th></tr></thead>
            <tbody>
              ${settings.length ? settings.map((row) => `
                <tr>
                  <td class="font-mono text-xs">${esc(row.key || '')}</td>
                  <td>${esc(String(row.value || ''))}</td>
                </tr>`).join('') : '<tr><td colspan="2" class="text-center py-10" style="color:#9CA3AF">No hay settings registrados.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;

    // Poblar tabla de sucursales
    const bTbody = document.getElementById('cfg-branches-tbody');
    if (bTbody) {
      bTbody.innerHTML = branches.length ? branches.map(b => `
        <tr>
          <td><span class="font-mono font-semibold" style="color:#1A4B8C">${esc(b.code)}</span></td>
          <td class="font-medium">${esc(b.name)}</td>
          <td>${b.active ? '<span class="badge badge-green">Activo</span>' : '<span class="badge badge-gray">Inactivo</span>'}</td>
          ${canEdit ? `
            <td>
              <div class="flex gap-2">
                <button type="button" class="btn btn-outline btn-sm" onclick="window.cfgEditBranch('${esc(b.id)}')"><i class="fas fa-pen"></i></button>
                <button type="button" class="btn btn-danger btn-sm" onclick="window.cfgToggleBranch('${esc(b.id)}', ${b.active ? 'false' : 'true'})"><i class="fas ${b.active ? 'fa-ban' : 'fa-rotate-left'}"></i></button>
              </div>
            </td>` : ''}
        </tr>`).join('') : '<tr><td colspan="4" class="text-center py-6 text-gray-400">No hay sucursales registradas.</td></tr>';
    }

    // Eventos de sucursales
    document.getElementById('btn-cfg-new-branch')?.addEventListener('click', () => {
      (window as any).cfgOpenBranchForm();
    });

    (window as any).cfgOpenBranchForm = function(row = null) {
      if (!canEdit) return showToast('No tienes permisos para gestionar sucursales', 'error');
      openModal(
        row ? 'Editar Sucursal' : 'Nueva Sucursal',
        `<div class="space-y-4 text-sm" style="color:#374151">
          <div class="form-group">
            <label class="form-label">Código de la sucursal <span style="color:#EF4444">*</span></label>
            <input id="bf-code" class="form-input" placeholder="Ej: 01" value="${esc(row?.code || '')}" ${row ? 'readonly style="background-color:#F3F4F6"' : ''}>
          </div>
          <div class="form-group">
            <label class="form-label">Nombre de la sucursal <span style="color:#EF4444">*</span></label>
            <input id="bf-name" class="form-input" placeholder="Ej: Norte / Principal" value="${esc(row?.name || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select id="bf-active" class="form-input">
              <option value="1" ${row?.active !== false ? 'selected' : ''}>Activa</option>
              <option value="0" ${row?.active === false ? 'selected' : ''}>Inactiva</option>
            </select>
          </div>
        </div>`,
        `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
         <button class="btn btn-primary" id="btn-save-branch"><i class="fas fa-floppy-disk mr-1"></i> Guardar</button>`
      );

      document.getElementById('btn-save-branch')?.addEventListener('click', async () => {
        const code = getInputVal('bf-code').trim();
        const name = getInputVal('bf-name').trim();
        const active = getSelectVal('bf-active') === '1';

        if (!code || !name) {
          return showToast('Código y nombre son obligatorios', 'warning');
        }

        const btn = document.getElementById('btn-save-branch') as HTMLButtonElement;
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Guardando...';
        }

        try {
          if (row?.id) {
            await pb.update('branches', row.id, { name, active });
            showToast('Sucursal actualizada correctamente', 'success');
          } else {
            // Validar duplicado
            const existing = await pb.listAll('branches', { filter: `code="${pb.escapeFilterValue(code)}"`, ignoreBranch: true });
            if (existing.length > 0) {
              throw new Error(`Ya existe una sucursal con el código ${code}`);
            }
            await pb.create('branches', { code, name, active });
            showToast('Sucursal creada correctamente', 'success');
          }
          closeModal();
          // Actualizar la pantalla
          renderConfiguracion(c);
          // Actualizar el selector global
          if (typeof (window as any).initGlobalBranchSelector === 'function') {
            await (window as any).initGlobalBranchSelector();
          }
        } catch (err: any) {
          showToast(err.message || 'No se pudo guardar la sucursal', 'error');
        } finally {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-floppy-disk mr-1"></i> Guardar';
          }
        }
      });
    };

    (window as any).cfgEditBranch = async function(id: string) {
      try {
        const branch = await pb.get('branches', id);
        (window as any).cfgOpenBranchForm(branch);
      } catch (err: any) {
        showToast(err.message || 'No se pudo cargar la sucursal', 'error');
      }
    };

    (window as any).cfgToggleBranch = function(id: string, active: boolean) {
      if (!canEdit) return showToast('Sin permisos para actualizar sucursal', 'error');
      confirmDialog(
        active ? 'Reactivar sucursal' : 'Inactivar sucursal',
        active ? '¿Confirmas reactivar esta sucursal?' : '¿Confirmas inactivar esta sucursal?',
        async () => {
          try {
            await pb.update('branches', id, { active });
            showToast('Estado de sucursal actualizado', 'success');
            renderConfiguracion(c);
            if (typeof (window as any).initGlobalBranchSelector === 'function') {
              await (window as any).initGlobalBranchSelector();
            }
          } catch (err: any) {
            showToast(err.message || 'Error al cambiar estado de sucursal', 'error');
          }
        }
      );
    };

    $('#einvoice-method')?.addEventListener('change', (e) => {
      const val = (e.target as HTMLSelectElement).value;
      const dianCont = $('#dian-fields-container');
      const ftechCont = $('#ftech-fields-container');
      if (val === 'dian') {
        if (dianCont) (dianCont as HTMLElement).style.display = 'grid';
        if (ftechCont) (ftechCont as HTMLElement).style.display = 'none';
      } else {
        if (dianCont) (dianCont as HTMLElement).style.display = 'none';
        if (ftechCont) (ftechCont as HTMLElement).style.display = 'grid';
      }
    });

    // Initialize Autocomplete for company third party
    const wrap = $('#cfg-third-search-wrap');
    const hidden = $('#cfg-third') as HTMLInputElement;
    const input = $('#cfg-third-search') as HTMLInputElement;
    const results = $('#cfg-third-results');
    if (wrap && hidden && input && results) {
      const paint = (query = '') => {
        const found = terceros.filter((t: any) => {
          const hay = `${t.doc_number || ''} ${t.name || ''}`.toLowerCase();
          return hay.includes(query.toLowerCase());
        }).slice(0, 30);
        
        if (!found.length) {
          results.innerHTML = '<div class="px-3 py-2 text-xs text-gray-400">Sin resultados</div>';
          return;
        }
        results.innerHTML = found.map((t: any) => `
          <button type="button" data-third-id="${esc(t.id)}" class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors" style="border:none;background:#fff;color:#0D2137;cursor:pointer">
            <div style="font-weight:600">${esc(t.doc_number || 'SIN DOC')}</div>
            <div style="font-size:12px;color:#6B7280">${esc(t.name || '')}</div>
          </button>
        `).join('');
      };
      
      const show = () => { paint(input.value); results.style.display = 'block'; };
      const hide = () => { results.style.display = 'none'; };
      
      const currentThird = terceros.find((t: any) => t.id === hidden.value);
      if (currentThird) {
        input.value = `${currentThird.doc_number || ''} - ${currentThird.name || ''}`;
      }
      
      input.addEventListener('focus', show);
      input.addEventListener('input', () => {
        hidden.value = '';
        paint(input.value);
        results.style.display = 'block';
      });
      
      results.addEventListener('click', (ev) => {
        const btn = (ev.target as HTMLElement).closest('[data-third-id]');
        if (!btn) return;
        const id = btn.getAttribute('data-third-id') || '';
        hidden.value = id;
        const third = terceros.find((t: any) => t.id === id);
        if (third) {
          input.value = `${third.doc_number || ''} - ${third.name || ''}`;
          
          // Auto-fill fields below
          setInputVal('cfg-company_name', third.name || '');
          setInputVal('cfg-company_nit', (third.doc_number || '') + (third.dv ? '-' + third.dv : ''));
          setInputVal('cfg-company_address', third.address || '');
          setInputVal('cfg-company_phone', third.phone || '');
          setInputVal('cfg-company_email', third.email || '');
        } else {
          input.value = '';
        }
        hide();
      });
      
      document.addEventListener('click', (ev) => {
        if (!wrap.contains(ev.target as Node)) hide();
      });
    }

    let uploadedCertBase64: string | null = null;
    const certFileInput = $('#dian-cert-file') as HTMLInputElement | null;
    certFileInput?.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = function (evt) {
        const result = evt.target?.result as string;
        const commaIndex = result.indexOf(',');
        if (commaIndex !== -1) {
          uploadedCertBase64 = result.substring(commaIndex + 1);
          showToast('Certificado leído en memoria. Presione "Guardar configuración DIAN" para registrar.', 'info');
          const indicator = $('#dian-cert-status-indicator');
          if (indicator) {
            indicator.innerHTML = '<span class="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700"><i class="fas fa-spinner fa-spin mr-1"></i>Listo para guardar</span>';
          }
        }
      };
      reader.readAsDataURL(file);
    });

    // Lógica para carga de Logo Comercial de la Empresa
    let uploadedLogoBase64: string | null = null;
    let logoDeleted = false;
    const logoFileInput = $('#cfg-logo-file') as HTMLInputElement | null;
    logoFileInput?.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = function (evt) {
        const result = evt.target?.result as string;
        const commaIndex = result.indexOf(',');
        if (commaIndex !== -1) {
          uploadedLogoBase64 = result.substring(commaIndex + 1);
          logoDeleted = false;
          
          const previewWrap = $('#cfg-logo-preview-wrap');
          if (previewWrap) {
            previewWrap.innerHTML = `<img id="cfg-logo-preview" src="${result}" style="max-height:90px; max-width:180px; object-fit:contain" />`;
          }
          
          const delBtn = $('#btn-delete-logo');
          if (delBtn) delBtn.classList.remove('hidden');
        }
      };
      reader.readAsDataURL(file);
    });

    $('#btn-delete-logo')?.addEventListener('click', () => {
      logoDeleted = true;
      uploadedLogoBase64 = null;
      
      const previewWrap = $('#cfg-logo-preview-wrap');
      if (previewWrap) {
        previewWrap.innerHTML = `<i class="fas fa-image text-3xl text-gray-300"></i><span class="text-xs text-gray-400">Sin logotipo comercial</span>`;
      }
      
      $('#btn-delete-logo')?.classList.add('hidden');
      if (logoFileInput) logoFileInput.value = '';
    });

    $('#btn-save-dian')?.addEventListener('click', async () => {
      if (!canEdit) return showToast('Sin permisos para actualizar configuración', 'error');
      
      try {
        const payload = [
          ['einvoice_method', getInputVal('einvoice-method').trim()],
          ['dian_environment', getInputVal('dian-environment').trim()],
          ['dian_nit', getInputVal('dian-nit').trim()],
          ['dian_cltec', getInputVal('dian-cltec').trim()],
          ['dian_software_id', getInputVal('dian-software-id').trim()],
          ['dian_software_pin', getInputVal('dian-software-pin').trim()],
          ['dian_certificate_password', getInputVal('dian-cert-pass').trim()],
          ['ftech_environment', getInputVal('ftech-environment').trim()],
          ['ftech_username', getInputVal('ftech-username').trim()],
          ['ftech_password', getInputVal('ftech-password').trim()],
          ['invoice_header_text', getInputVal('invoice-header-text')],
          ['invoice_footer_text', getInputVal('invoice-footer-text')],
        ];
        
        if (uploadedCertBase64) {
          payload.push(['dian_certificate_base64', uploadedCertBase64]);
        }
        
        await Promise.all(payload.map(([key, value]) => API.setSetting(key, value)));
        showToast('Configuración de Facturación Electrónica guardada con éxito', 'success');
        renderConfiguracion(c);
      } catch (err: any) {
        showToast(err.message || 'No se pudo guardar la configuración de facturación', 'error');
      }
    });

    $('#btn-save-smtp')?.addEventListener('click', async () => {
      if (!canEdit) return showToast('Sin permisos para actualizar configuración', 'error');
      try {
        const payload = [
          ['smtp_enabled', (document.getElementById('smtp-enabled') as HTMLInputElement)?.checked ? '1' : '0'],
          ['smtp_host', getInputVal('smtp-host').trim()],
          ['smtp_port', getInputVal('smtp-port').trim()],
          ['smtp_username', getInputVal('smtp-username').trim()],
          ['smtp_password', getInputVal('smtp-password').trim()],
          ['smtp_sender_name', getInputVal('smtp-sender-name').trim()],
          ['smtp_sender_address', getInputVal('smtp-sender-address').trim()],
        ];
        await Promise.all(payload.map(([key, value]) => API.setSetting(key, value)));
        showToast('Configuración SMTP guardada con éxito', 'success');
        renderConfiguracion(c);
      } catch (err: any) {
        showToast(err.message || 'No se pudo guardar la configuración SMTP', 'error');
      }
    });

    $('#btn-save-ecommerce')?.addEventListener('click', async () => {
      if (!canEdit) return showToast('Sin permisos para actualizar configuración', 'error');
      try {
        const payload = [
          ['ecommerce_default_warehouse_id', getInputVal('cfg-ecommerce-warehouse').trim()],
          ['ecommerce_price_list', getInputVal('cfg-ecommerce-price-list').trim()],
          ['ecommerce_default_user_id', getInputVal('cfg-ecommerce-user').trim()],
          ['ecommerce_store_name', getInputVal('cfg-ecommerce-store-name').trim()],
          ['ecommerce_whatsapp_number', getInputVal('cfg-ecommerce-whatsapp').trim()],
        ];
        await Promise.all(payload.map(([key, value]) => API.setSetting(key, value)));
        showToast('Configuración de Tienda Virtual guardada con éxito', 'success');
        renderConfiguracion(c);
      } catch (err: any) {
        showToast(err.message || 'No se pudo guardar la configuración de e-commerce', 'error');
      }
    });

    $('#btn-save-config')?.addEventListener('click', async () => {
      try {
        const payload = CONFIG_FIELDS.map((field) => [field.key, getInputVal(`cfg-${field.key}`).trim()]);
        payload.push(['company_third_party_id', getInputVal('cfg-third').trim()]);
        const decVal = getSelectVal('cfg-decimal_places') || '2';
        payload.push(['decimal_places', decVal]);
        await Promise.all(payload.map(([key, value]) => API.setSetting(key, value)));
        if (typeof (window as any).setDecimalPlaces === 'function') {
          (window as any).setDecimalPlaces(decVal);
        }
        
        // Guardar o eliminar el logo de la empresa
        if (logoDeleted) {
          await API.setSetting('company_logo', '');
        } else if (uploadedLogoBase64) {
          await API.setSetting('company_logo', uploadedLogoBase64);
        }

        const newName = getInputVal('cfg-company_name').trim();
        const newNit = getInputVal('cfg-company_nit').trim();

        // 1. Actualizar topbar en pantalla
        $('#topbar-company').textContent = newName;

        // 2. Actualizar localStorage de sesión activa
        const activeCompany = JSON.parse(localStorage.getItem('gravy_active_company') || '{}');
        if (activeCompany) {
          activeCompany.company_name = newName;
          localStorage.setItem('gravy_active_company', JSON.stringify(activeCompany));
        }

        // 3. Sincronizar cambios de datos de empresa al HUB
        const hubUrl = (window as any).HUB_URL || `${window.location.protocol}//${window.location.hostname}:8089`;
        if (activeCompany && activeCompany.company_id) {
          try {
            await fetch(`${hubUrl}/api/hub/sync-tenant-company`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                company_id: activeCompany.company_id,
                name: newName,
                nit: newNit
              })
            });
          } catch (hubErr) {
            console.warn('[GRAVY] Error al sincronizar el nombre de empresa con el HUB:', hubErr);
          }
        }

        showToast('Configuración actualizada correctamente', 'success');
        renderConfiguracion(c);
      } catch (err) {
        showToast(err.message || 'No se pudo guardar la configuración', 'error');
      }
    });

    $('#btn-save-signatures')?.addEventListener('click', saveSignatureSettingsFromForm);
  } catch (err) {
    c.innerHTML = `<div class="bg-white rounded-2xl border p-8 text-center" style="border-color:#F0F0F0"><i class="fas fa-circle-exclamation text-3xl mb-3" style="color:#EF4444"></i><p class="font-semibold" style="color:#374151">No fue posible cargar la configuración</p><p class="text-sm mt-2" style="color:#6B7280">${esc(err.message)}</p></div>`;
  }
}
// --- VITE MIGRATION GLOBALS ---
(window as any).loadSignatureSettings = loadSignatureSettings;
(window as any).SIGNATURE_SETTINGS = SIGNATURE_SETTINGS;
(window as any).saveSignatureSettingsFromForm = saveSignatureSettingsFromForm;
(window as any).renderConfiguracion = renderConfiguracion;
(window as any).CONFIG_FIELDS = CONFIG_FIELDS;
(window as any).getSettingFirst = getSettingFirst;
