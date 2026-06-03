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
    const [settings, signatureValues] = await Promise.all([
      pb.listAll('settings', { sort: 'key' }),
      loadSignatureSettings(),
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

      <!-- SECCIÓN DIAN -->
      <div class="bg-white rounded-2xl border p-5 mb-4" style="border-color:#F0F0F0">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h4 class="font-bold" style="color:#0D2137">Facturación Electrónica DIAN</h4>
            <p class="text-sm" style="color:#6B7280">Configuración técnica para la emisión de facturas, notas crédito/débito, nómina electrónica y documento soporte.</p>
          </div>
          ${canEdit ? '<button class="btn btn-secondary btn-sm" id="btn-save-dian"><i class="fas fa-server mr-1"></i> Guardar configuración DIAN</button>' : ''}
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          ['dian_environment', getInputVal('dian-environment').trim()],
          ['dian_nit', getInputVal('dian-nit').trim()],
          ['dian_cltec', getInputVal('dian-cltec').trim()],
          ['dian_software_id', getInputVal('dian-software-id').trim()],
          ['dian_software_pin', getInputVal('dian-software-pin').trim()],
          ['dian_certificate_password', getInputVal('dian-cert-pass').trim()],
        ];
        
        if (uploadedCertBase64) {
          payload.push(['dian_certificate_base64', uploadedCertBase64]);
        }
        
        await Promise.all(payload.map(([key, value]) => API.setSetting(key, value)));
        showToast('Configuración de la DIAN guardada con éxito', 'success');
        renderConfiguracion(c);
      } catch (err: any) {
        showToast(err.message || 'No se pudo guardar la configuración de la DIAN', 'error');
      }
    });

    $('#btn-save-config')?.addEventListener('click', async () => {
      try {
        const payload = CONFIG_FIELDS.map((field) => [field.key, getInputVal(`cfg-${field.key}`).trim()]);
        await Promise.all(payload.map(([key, value]) => API.setSetting(key, value)));
        
        // Guardar o eliminar el logo de la empresa
        if (logoDeleted) {
          await API.setSetting('company_logo', '');
        } else if (uploadedLogoBase64) {
          await API.setSetting('company_logo', uploadedLogoBase64);
        }

        $('#topbar-company').textContent = getInputVal('cfg-company_name').trim();
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
