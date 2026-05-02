/**
 * ContaCO v2.0 - configuracion.js
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
          <h4 class="font-bold mb-3" style="color:#0D2137">Flujo de configuración</h4>
          <div class="space-y-3 text-sm" style="color:#6B7280">
            <p>La razón social se refleja en la barra superior de la aplicación.</p>
            <p>Las firmas de reportes ahora se administran aquí, junto con los datos generales de la empresa.</p>
            <p>La preferencia de firmas por defecto impacta el Balance de Prueba al abrir el reporte.</p>
            <p>Si agregas más parámetros en base de datos, aparecerán abajo en la tabla de settings detectados.</p>
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

    $('#btn-save-config')?.addEventListener('click', async () => {
      try {
        const payload = CONFIG_FIELDS.map((field) => [field.key, getInputVal(`cfg-${field.key}`).trim()]);
        await Promise.all(payload.map(([key, value]) => API.setSetting(key, value)));
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