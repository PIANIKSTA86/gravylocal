// GRAVY — Generador Oficial de Licencias, Contratos de Servicios y Términos & Condiciones Legales-Contables
// Arquitectura Standalone Offline-First con jsPDF y AutoTable
// Titularidad: JULIÁN ESPINOSA ARRUBLA (C.C. 1.130.636.393) - Ley 23 de 1982 / DNDA

const form = document.getElementById('licForm');
const previewContent = document.getElementById('previewContent');
const previewBadge = document.getElementById('previewBadge');

// ---------- Formateadores Utilitarios ----------
function fmtCOP(value) {
  const n = Number(value || 0);
  return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
}

function fmtDate(value) {
  if (!value) return '____________________';
  const parts = value.split('-');
  if (parts.length < 3) return value;
  const [y, m, day] = parts;
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${Number(day)} de ${meses[Number(m) - 1]} de ${y}`;
}

function fileSafe(name) {
  return (name || 'Cliente')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .substring(0, 40);
}

// ---------- Numeración de Control Criptográfica (Base 32 Crockford) ----------
const BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function randomBase32(len) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => BASE32[b % 32]).join('');
}

function checksumChar(str) {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum = (sum + str.charCodeAt(i) * (i + 7)) % 32;
  }
  return BASE32[sum];
}

function generateDocNumber(prefix) {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const body = `${prefix}-${yy}${mm}-${randomBase32(5)}`;
  return `GRAVY-${body}-${checksumChar(body)}`;
}

function regenerateControlNumbers() {
  document.getElementById('numLicencia').value = generateDocNumber('LIC');
  document.getElementById('numContrato').value = generateDocNumber('SVC');
  document.getElementById('numTerminos').value = generateDocNumber('TYC');
}

document.getElementById('btnRegenLic').addEventListener('click', () => {
  document.getElementById('numLicencia').value = generateDocNumber('LIC');
  saveToStorage();
  renderPreview();
});

document.getElementById('btnRegenContrato').addEventListener('click', () => {
  document.getElementById('numContrato').value = generateDocNumber('SVC');
  saveToStorage();
  renderPreview();
});

document.getElementById('btnRegenTerminos').addEventListener('click', () => {
  document.getElementById('numTerminos').value = generateDocNumber('TYC');
  saveToStorage();
  renderPreview();
});

// ---------- Obtención y Consolidación de Datos del Formulario ----------
function getData() {
  const fd = new FormData(form);
  const d = Object.fromEntries(fd.entries());
  
  // Extraer todos los módulos seleccionados
  const mods = [];
  form.querySelectorAll('input[name="mod"]:checked').forEach((cb) => {
    mods.push(cb.value);
  });
  d.modulos = mods;
  
  // Fechas y vigencia
  d.fecha_inicio_fmt = fmtDate(d.fecha_inicio);
  d.fecha_firma_fmt = fmtDate(d.fecha_firma);
  
  // Cálculos económicos
  d.valor_licencia_num = Number(d.valor_licencia || 0);
  d.valor_soporte_num = Number(d.valor_soporte || 0);
  d.valor_total_num = d.valor_licencia_num + d.valor_soporte_num;
  
  return d;
}

// ---------- Reglas de Interacción de la UI ----------
const tipoLicenciaSelect = document.getElementById('tipoLicencia');
const renovacionLabel = document.getElementById('renovacionLabel');
const renovacionInput = document.getElementById('renovacion');
const formaPagoSelect = document.getElementById('formaPago');
const perpetuaHint = document.getElementById('perpetuaHint');
const personalizacionSelect = document.getElementById('personalizacion');
const personalizacionDetalle = document.getElementById('personalizacionDetalle');
const personalizacionPropiedad = document.getElementById('personalizacionPropiedad');
const fechaInicioInput = document.getElementById('fechaInicio');
const fechaFirmaInput = document.getElementById('fechaFirma');

// Establecer fecha de hoy si están vacías
const todayIso = new Date().toISOString().split('T')[0];
if (!fechaInicioInput.value) fechaInicioInput.value = todayIso;
if (!fechaFirmaInput.value) fechaFirmaInput.value = todayIso;

function applyLicenseRules() {
  const isPerp = tipoLicenciaSelect.value === 'Perpetua';
  renovacionInput.disabled = isPerp;
  renovacionLabel.style.opacity = isPerp ? '0.5' : '1';
  perpetuaHint.style.display = isPerp ? 'block' : 'none';
  if (isPerp) {
    renovacionInput.value = 'No aplica (Licencia Perpetua de Software)';
    formaPagoSelect.value = 'Pago único (Perpetua)';
  }
}
tipoLicenciaSelect.addEventListener('change', () => {
  applyLicenseRules();
  saveToStorage();
  renderPreview();
});

function applyPersonalizacionRules() {
  const hasCustom = personalizacionSelect.value === 'Sí';
  personalizacionDetalle.disabled = !hasCustom;
  personalizacionPropiedad.disabled = !hasCustom;
  if (!hasCustom) {
    personalizacionDetalle.value = '';
  }
}
personalizacionSelect.addEventListener('change', () => {
  applyPersonalizacionRules();
  saveToStorage();
  renderPreview();
});

// ---------- Presets de Módulos Oficiales de GRAVY ----------
const PRESETS = {
  contable: [
    'Core (Base)',
    'Contabilidad General y PUC',
    'Validación DIAN & Exógena'
  ],
  comercial: [
    'Core (Base)',
    'Contabilidad General y PUC',
    'Comercial & Facturación Electrónica',
    'Inventarios & Kardex Valorizado',
    'Punto de Venta (POS)',
    'Tesorería & Conciliación Bancaria'
  ],
  pyme: [
    'Core (Base)',
    'Contabilidad General y PUC',
    'Validación DIAN & Exógena',
    'Normas Internacionales NIIF',
    'Comercial & Facturación Electrónica',
    'Inventarios & Kardex Valorizado',
    'Tesorería & Conciliación Bancaria',
    'Nómina & Seguridad Social',
    'Nómina Electrónica DIAN'
  ],
  ph: [
    'Core (Base)',
    'Contabilidad General y PUC',
    'Tesorería & Conciliación Bancaria',
    'Propiedad Horizontal (PH)',
    'Gestión Inmobiliaria'
  ],
  logistica: [
    'Core (Base)',
    'Comercial & Facturación Electrónica',
    'Inventarios & Kardex Valorizado',
    'Tesorería & Conciliación Bancaria',
    'Logística & Rutas GPS',
    'Importaciones & Aduanas'
  ],
  full: [
    'Core (Base)',
    'Contabilidad General y PUC',
    'Validación DIAN & Exógena',
    'Normas Internacionales NIIF',
    'Activos Fijos NIIF',
    'Comercial & Facturación Electrónica',
    'Inventarios & Kardex Valorizado',
    'Punto de Venta (POS)',
    'Tesorería & Conciliación Bancaria',
    'CRM & Seguimiento de Ventas',
    'Nómina & Seguridad Social',
    'Nómina Electrónica DIAN',
    'Logística & Rutas GPS',
    'Importaciones & Aduanas',
    'Tienda Virtual Integrada',
    'Propiedad Horizontal (PH)',
    'Gestión Inmobiliaria',
    'Spa Mascotas (Veterinaria)',
    'Spa Belleza Humana'
  ]
};

document.querySelectorAll('.btn-preset').forEach((btn) => {
  btn.addEventListener('click', () => {
    const presetKey = btn.dataset.preset;
    if (presetKey === 'clear') {
      form.querySelectorAll('input[name="mod"]').forEach((cb) => {
        if (cb.value !== 'Core (Base)') cb.checked = false;
      });
    } else if (PRESETS[presetKey]) {
      const selectedList = PRESETS[presetKey];
      form.querySelectorAll('input[name="mod"]').forEach((cb) => {
        cb.checked = selectedList.includes(cb.value);
      });
    }
    saveToStorage();
    renderPreview();
  });
});

// ---------- Vista Previa Reactiva en Tiempo Real ----------
function renderPreview() {
  const d = getData();
  const modCount = d.modulos.length;
  
  previewContent.innerHTML = `
    <div class="preview-metric-card">
      <div class="label">Licencia de Software</div>
      <div class="val-big">${fmtCOP(d.valor_licencia)}</div>
      <div class="sub-val">${d.sw_tipo_licencia} · ${d.sw_modalidad}</div>
    </div>

    <div class="preview-metric-card">
      <div class="label">Soporte y Mantenimiento</div>
      <div class="val-big">${d.valor_soporte_num > 0 ? fmtCOP(d.valor_soporte) : 'Incluido'}</div>
      <div class="sub-val">${d.soporte_facturacion}</div>
    </div>

    <dl class="preview-list">
      <dt>Suscriptor / Licenciatario</dt>
      <dd>${d.cli_razon || '—'}</dd>
      <dd style="font-size:12px;color:#64748B;">NIT: ${d.cli_nit || '—'} · ${d.cli_domicilio || '—'}</dd>

      <dt>Representante Legal</dt>
      <dd>${d.cli_representante || '—'}</dd>
      <dd style="font-size:12px;color:#64748B;">${d.cli_cc_representante || '—'}</dd>

      <dt>Capacidad Contratada</dt>
      <dd>${d.sw_empresas} Empresa(s) / NIT(s) · ${d.sw_usuarios} Usuarios Concurrentes</dd>

      <dt>Régimen Tributario</dt>
      <dd style="font-size:12px;">${d.regimen_iva}</dd>

      <dt>Módulos Habilitados (${modCount})</dt>
      <dd>
        <div class="preview-tags">
          ${d.modulos.map(m => `<span class="preview-tag">${m}</span>`).join('')}
        </div>
      </dd>

      <dt>Personalizaciones</dt>
      <dd>${d.personalizacion === 'Sí' ? (d.personalizacion_detalle || 'Desarrollo a la medida acordado') : 'Software Estándar'}</dd>

      <dt>Trazabilidad Criptográfica</dt>
      <dd style="font-family:monospace;font-size:11.5px;color:#2446B8;">
        LIC: ${d.num_licencia || '—'}<br>
        SVC: ${d.num_contrato || '—'}<br>
        TYC: ${d.num_terminos || '—'}
      </dd>
    </dl>
  `;
}

// ---------- Persistencia Local (LocalStorage Autosave) ----------
const STORAGE_KEY = 'gravy_licenciador_v2_draft';
const saveStatus = document.getElementById('saveStatus');
let saveTimer = null;

function saveToStorage() {
  const d = getData();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    if (saveStatus) {
      saveStatus.textContent = `Borrador guardado localmente · ${new Date().toLocaleTimeString('es-CO')}`;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => { if (saveStatus) saveStatus.textContent = ''; }, 3500);
    }
  } catch (e) {
    console.warn('No se pudo guardar borrador en localStorage', e);
  }
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  try {
    const d = JSON.parse(raw);
    Object.keys(d).forEach((key) => {
      const el = form.querySelector(`[name="${key}"]`);
      if (el && !el.readOnly && el.type !== 'checkbox') {
        el.value = d[key];
      }
    });
    if (Array.isArray(d.modulos)) {
      form.querySelectorAll('input[name="mod"]').forEach((cb) => {
        cb.checked = d.modulos.includes(cb.value);
      });
    }
    if (d.num_licencia) document.getElementById('numLicencia').value = d.num_licencia;
    if (d.num_contrato) document.getElementById('numContrato').value = d.num_contrato;
    if (d.num_terminos) document.getElementById('numTerminos').value = d.num_terminos;
    return true;
  } catch (e) {
    return false;
  }
}

document.getElementById('btnClear').addEventListener('click', () => {
  if (!confirm('¿Restablecer el formulario a sus valores originales? Se perderán los datos locales no exportados.')) return;
  localStorage.removeItem(STORAGE_KEY);
  form.reset();
  regenerateControlNumbers();
  applyLicenseRules();
  applyPersonalizacionRules();
  renderPreview();
});

form.addEventListener('input', () => {
  saveToStorage();
  renderPreview();
});

form.addEventListener('change', () => {
  saveToStorage();
  renderPreview();
});

// ---------- Exportar e Importar JSON ----------
function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

document.getElementById('btnExportarJson').addEventListener('click', () => {
  const d = getData();
  const fn = `Datos_Licencia_GRAVY_${fileSafe(d.cli_razon)}.json`;
  downloadJson(d, fn);
});

document.getElementById('inputImportarJson').addEventListener('change', (ev) => {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      Object.keys(data).forEach((key) => {
        const el = form.querySelector(`[name="${key}"]`);
        if (el && !el.readOnly && el.type !== 'checkbox') {
          el.value = data[key];
        }
      });
      if (Array.isArray(data.modulos || data.mod)) {
        const mods = data.modulos || data.mod;
        form.querySelectorAll('input[name="mod"]').forEach((cb) => {
          cb.checked = mods.includes(cb.value);
        });
      }
      if (data.num_licencia) document.getElementById('numLicencia').value = data.num_licencia;
      if (data.num_contrato) document.getElementById('numContrato').value = data.num_contrato;
      if (data.num_terminos) document.getElementById('numTerminos').value = data.num_terminos;
      applyLicenseRules();
      applyPersonalizacionRules();
      renderPreview();
      saveToStorage();
      alert(`Datos cargados correctamente desde: ${file.name}`);
    } catch (err) {
      alert('Error: el archivo no es un JSON válido del licenciador GRAVY.\n' + err.message);
    } finally {
      ev.target.value = '';
    }
  };
  reader.readAsText(file);
});

// ---------- Carga del Logo Institucional GRAVY ----------
let logoCache = null;
async function loadLogo() {
  if (logoCache) return logoCache;
  try {
    const res = await fetch('assets/gravy-logo.png');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => { logoCache = r.result; resolve(r.result); };
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Logo no disponible en assets/', err);
    return null;
  }
}

// =========================================================================
// MOTOR DE MAQUETACIÓN EDITORIAL PDF (jsPDF + AutoTable)
// =========================================================================

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

function createDoc() {
  const { jsPDF } = window.jspdf;
  return new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
}

function addWatermarkAndHeaderFooter(doc, title, docNum, logoData) {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Marca de agua sutil en el centro
    if (logoData) {
      const wmSize = 110;
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.045 }));
      doc.addImage(logoData, 'PNG', (PAGE_W - wmSize) / 2, (PAGE_H - wmSize) / 2, wmSize, wmSize);
      doc.restoreGraphicsState();
    }

    // Cintillo superior institucional
    if (logoData) {
      doc.addImage(logoData, 'PNG', MARGIN, 8, 10, 10);
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(36, 70, 184); // Azul corporativo
    doc.text(title, MARGIN + (logoData ? 13 : 0), 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Identificador de Control: ${docNum}`, MARGIN + (logoData ? 13 : 0), 16);

    doc.setFontSize(8);
    doc.text(`Página ${i} de ${pageCount}`, PAGE_W - MARGIN, 13, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, 19, PAGE_W - MARGIN, 19);

    // Pie de página con marco legal
    doc.line(MARGIN, 286, PAGE_W - MARGIN, 286);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('GRAVY® — Plataforma Contable Inteligente · Titularidad: Julián Espinosa Arrubla (C.C. 1.130.636.393) · Ley 23/1982', MARGIN, 290);
    doc.text('Validez electrónica amparada por la Ley 527 de 1999', PAGE_W - MARGIN, 290, { align: 'right' });
  }
}

function drawTitleBlock(doc, mainTitle, subtitle, docNum) {
  let y = 28;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(11, 22, 53);
  doc.text(mainTitle, PAGE_W / 2, y, { align: 'center' });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(subtitle, PAGE_W / 2, y, { align: 'center' });

  y += 5;
  doc.setFontSize(8.5);
  doc.setTextColor(36, 70, 184);
  doc.text(`N.° Único de Trazabilidad: ${docNum}`, PAGE_W / 2, y, { align: 'center' });

  y += 7;
  return y;
}

function writeParagraphs(doc, paragraphs, startY) {
  let y = startY;
  const lineHeight = 4.8;
  paragraphs.forEach((p) => {
    if (p.heading) {
      y += 4;
      if (y > 268) { doc.addPage(); y = 26; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(p.heading, MARGIN, y);
      y += 5.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.8);
      doc.setTextColor(30, 41, 59);
    }
    if (p.text) {
      const lines = doc.splitTextToSize(p.text, CONTENT_W);
      lines.forEach((line) => {
        if (y > 275) { doc.addPage(); y = 26; }
        doc.text(line, MARGIN, y);
        y += lineHeight;
      });
      y += 2;
    }
  });
  return y;
}

function drawSignatureBlock(doc, y, d) {
  if (y > 220) { doc.addPage(); y = 26; }
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(30, 41, 59);
  doc.text(`En constancia de entendimiento, aceptación y fuerza vinculante, se suscribe en la ciudad de ${d.ciudad_firma}, el día ${d.fecha_firma_fmt}.`, MARGIN, y);

  y += 22;
  const colW = 75;
  const col2X = PAGE_W - MARGIN - colW;

  // Líneas de firma
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, MARGIN + colW, y);
  doc.line(col2X, y, col2X + colW, y);

  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.text('EL LICENCIANTE / PROVEEDOR', MARGIN, y);
  doc.text('EL LICENCIATARIO / CLIENTE', col2X, y);

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(d.lic_razon, MARGIN, y);
  doc.text(d.cli_razon || 'Nombre o Razón Social', col2X, y);

  y += 4;
  doc.text(`C.C. ${d.lic_nit}`, MARGIN, y);
  doc.text(`NIT / C.C. ${d.cli_nit || 'Identificación'}`, col2X, y);

  y += 4;
  doc.text('Autor y Titular de Derechos Patrimoniales', MARGIN, y);
  doc.text(d.cli_representante ? `Rep. Legal: ${d.cli_representante}` : 'Representante Legal Autorizado', col2X, y);

  return y;
}

// =========================================================================
// DOCUMENTO 1: CONTRATO DE LICENCIA DE USO DE SOFTWARE
// =========================================================================
function buildLicenseDoc(d, logoData) {
  const doc = createDoc();
  let y = drawTitleBlock(doc, 'CONTRATO DE LICENCIA DE USO DE SOFTWARE', `${d.sw_nombre} (Versión ${d.sw_version})`, d.num_licencia);

  const isPerp = d.sw_tipo_licencia === 'Perpetua';

  const clauses = [
    {
      heading: 'MARCO JURÍDICO Y ANTECEDENTES',
      text: `El presente contrato se celebra al amparo del régimen de propiedad intelectual y contratación mercantil de la República de Colombia, especialmente: la Ley 23 de 1982 y la Ley 1915 de 2018 sobre Derechos de Autor; la Decisión Andina 351 de 1993 (Régimen Común sobre Derecho de Autor y Derechos Conexos); el Código de Comercio de Colombia (Arts. 864 y concordantes); la Ley 527 de 1999 sobre Comercio Electrónico y Mensajes de Datos; la Ley 1581 de 2012 de Protección de Datos Personales; y la Ley 1480 de 2011 (Estatuto del Consumidor). Identificado con número de trazabilidad interna ${d.num_licencia}.`
    },
    {
      heading: 'CLÁUSULA PRIMERA. PARTES CONTRATANTES',
      text: `EL LICENCIANTE: JULIÁN ESPINOSA ARRUBLA, mayor de edad, identificado con Cédula de Ciudadanía N.° ${d.lic_nit}, domiciliado en ${d.lic_domicilio}, en su calidad de Autor y Titular Exclusivo de los derechos morales y patrimoniales de autor sobre el software GRAVY®.\n` +
            `EL LICENCIATARIO: ${d.cli_razon}, persona jurídica/natural identificada con NIT/C.C. ${d.cli_nit}, con domicilio principal en ${d.cli_domicilio}, dirección física ${d.cli_direccion || 'reportada en formulario'}, representada legalmente por ${d.cli_representante || 'su representante'}, identificado con ${d.cli_cc_representante || 'C.C.'}.`
    },
    {
      heading: 'CLÁUSULA SEGUNDA. OBJETO Y CONCESIÓN DE LICENCIA',
      text: `EL LICENCIANTE otorga a EL LICENCIATARIO una licencia de uso de software de carácter NO EXCLUSIVO, INTRANSFERIBLE, REVOCABLE y NO SUBLICENCIABLE sobre la plataforma informática "${d.sw_nombre}" (Versión ${d.sw_version}), en modalidad de "${d.sw_tipo_licencia}" y arquitectura de despliegue "${d.sw_modalidad}". La licencia habilita formalmente la operación para un límite máximo de ${d.sw_empresas} empresa(s)/NIT(s) y hasta ${d.sw_usuarios} usuario(s) concurrentes autorizados.`
    },
    {
      heading: 'CLÁUSULA TERCERA. ALCANCE Y MÓDULOS HABILITADOS',
      text: `El derecho de uso conferido comprende estrictamente los módulos funcionales seleccionados que se detallan a continuación. Cualquier módulo, funcionalidad avanzada o conector no listado explícitamente se considerará excluido y requerirá una adenda contractual o cotización independiente.`
    }
  ];

  y = writeParagraphs(doc, clauses, y);

  // Tabla AutoTable con los módulos habilitados
  const modData = d.modulos.map((m, idx) => [
    String(idx + 1),
    m,
    'Habilitado y Licenciado',
    'Conforme a especificaciones de versión'
  ]);

  doc.autoTable({
    startY: y + 2,
    margin: { left: MARGIN, right: MARGIN },
    head: [['#', 'Módulo Habilitado', 'Estado de Licencia', 'Alcance Técnico']],
    body: modData,
    theme: 'grid',
    headStyles: { fillColor: [36, 70, 184], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 70, fontStyle: 'bold' },
      2: { cellWidth: 40, halign: 'center' },
      3: { cellWidth: 'auto' }
    }
  });

  y = doc.lastAutoTable.finalY + 4;

  const clausesPart2 = [
    {
      heading: 'CLÁUSULA CUARTA. DESARROLLOS Y PERSONALIZACIONES A LA MEDIDA',
      text: d.personalizacion === 'Sí'
        ? `El licenciamiento pactado SÍ incluye desarrollos o personalizaciones a la medida según el siguiente alcance técnico: "${d.personalizacion_detalle || 'Detalle acordado en anexo'}". Dichas personalizaciones pertenecen patrimonialmente a ${d.personalizacion_propiedad === 'Licenciante' ? 'JULIÁN ESPINOSA ARRUBLA con licencia de uso concedida al Suscriptor' : 'concesión exclusiva de uso pactada'}, y su mantenimiento se regirá por las condiciones especiales de soporte.`
        : `El software objeto del presente contrato corresponde exclusivamente a la versión estándar de ${d.sw_nombre}. No incluye desarrollos, adaptaciones ni reportes a la medida. Cualquier desarrollo adicional requerido deberá pactarse mediante otrosí o contrato de desarrollo de software independiente.`
    },
    {
      heading: 'CLÁUSULA QUINTA. PROPIEDAD INTELECTUAL Y PROHIBICIONES ESTRICTAS',
      text: `El código fuente, arquitectura, diseño visual, esquemas de bases de datos PocketBase/SQLite, algoritmos locales, marcas, nombres comerciales y documentación técnica son propiedad exclusiva de JULIÁN ESPINOSA ARRUBLA. Queda expresamente prohibido a EL LICENCIATARIO: (i) Descompilar, desensamblar o realizar ingeniería inversa; (ii) Remover menciones de autoría y firmas criptográficas; (iii) Comercializar, revender, arrendar o prestar servicios bajo marca blanca sin autorización expresa; (iv) Eludir los mecanismos de verificación o control de usuarios y módulos.`
    },
    {
      heading: 'CLÁUSULA SEXTA. CONTRAPRESTACIÓN ECONÓMICA Y RÉGIMEN FISCAL',
      text: isPerp
        ? `Por el derecho de uso perpetuo del software, EL LICENCIATARIO pagará la suma única de ${fmtCOP(d.valor_licencia)} (COP). Tratamiento de IVA: ${d.regimen_iva}. El pago no está sujeto a cánones recurrentes por el uso del software, sin perjuicio de los servicios de soporte y actualización que se rigen por el Contrato de Servicios N.° ${d.num_contrato}. Retenciones fiscales conforme a ley mediante envío oportuno del certificado tributario.`
        : `Por el derecho de uso temporal del software, EL LICENCIATARIO pagará la suma de ${fmtCOP(d.valor_licencia)} (COP) bajo modalidad "${d.forma_pago}". Tratamiento de IVA: ${d.regimen_iva}. Las prórrogas se regirán por: "${d.renovacion}". Las retenciones en la fuente procedentes serán aplicadas por el agente retenedor conforme al Estatuto Tributario.`
    },
    {
      heading: 'CLÁUSULA SÉPTIMA. VIGENCIA Y TERMINACIÓN',
      text: isPerp
        ? `La presente licencia rige de manera PERPETUA a partir del ${d.fecha_inicio_fmt}, extinguiéndose únicamente por incumplimiento grave comprobado a las restricciones de propiedad intelectual o impago de la cuota acordada, sin lugar a reembolso.`
        : `La licencia rige a partir del ${d.fecha_inicio_fmt} con vigencia de ${d.duracion_meses} meses, prorrogable automáticamente según lo acordado. Podrá terminarse por mutuo acuerdo o unilateralmente con preaviso escrito de 30 días calendario.`
    },
    {
      heading: 'CLÁUSULA OCTAVA. GARANTÍA TÉCNICA Y LIMITACIÓN DE RESPONSABILIDAD',
      text: `El software se provee bajo la modalidad "tal cual es" (as is). EL LICENCIANTE garantiza que el software cumple con las funcionalidades descritas en el manual de usuario publicado. En ningún caso responderá por lucro cesante, daños indirectos, pérdida de información por omisión de copias de seguridad del cliente, ni fallas derivadas de equipos o infraestructura ajena.`
    },
    {
      heading: 'CLÁUSULA NOVENA. LEY APLICABLE Y JURISDICCIÓN',
      text: `Este contrato se rige íntegramente por las leyes de la República de Colombia. Toda discrepancia derivada del mismo será sometida a los jueces ordinarios de ${d.ciudad_firma}, previa etapa obligatoria de arreglo directo y conciliación de 30 días.`
    }
  ];

  y = writeParagraphs(doc, clausesPart2, y);
  drawSignatureBlock(doc, y, d);
  addWatermarkAndHeaderFooter(doc, 'Contrato de Licencia de Uso de Software — GRAVY', d.num_licencia, logoData);

  return doc;
}

// =========================================================================
// DOCUMENTO 2: CONTRATO DE PRESTACIÓN DE SERVICIOS Y SLA
// =========================================================================
function buildContractDoc(d, logoData) {
  const doc = createDoc();
  let y = drawTitleBlock(doc, 'CONTRATO DE PRESTACIÓN DE SERVICIOS Y NIVELES DE SERVICIO (SLA)', `Soporte, Mantenimiento y Acompañamiento Técnico — ${d.sw_nombre}`, d.num_contrato);

  const isPerp = d.sw_tipo_licencia === 'Perpetua';

  const clauses = [
    {
      heading: 'MARCO JURÍDICO Y ANTECEDENTES',
      text: `El presente contrato se suscribe bajo el régimen de prestación de servicios técnicos y mercantiles del Código Civil (Arts. 2053 y ss.) y Código de Comercio de Colombia, teniendo el carácter de contrato accesorio al Contrato de Licencia de Uso N.° ${d.num_licencia}. Identificado con número de control ${d.num_contrato}.`
    },
    {
      heading: 'CLÁUSULA PRIMERA. PARTES CONTRATANTES',
      text: `EL PRESTADOR: JULIÁN ESPINOSA ARRUBLA, C.C. ${d.lic_nit}, domiciliado en ${d.lic_domicilio}.\n` +
            `EL CLIENTE / SUSCRIPTOR: ${d.cli_razon}, identificado con NIT/C.C. ${d.cli_nit}, representado legalmente por ${d.cli_representante || 'su representante legal'}, identificado con ${d.cli_cc_representante || 'C.C.'}.`
    },
    {
      heading: 'CLÁUSULA SEGUNDA. OBJETO DEL CONTRATO',
      text: `EL PRESTADOR se obliga a prestar en favor de EL CLIENTE los servicios profesionales de mesa de ayuda, mantenimiento correctivo, diagnóstico de incidencias, actualizaciones técnicas del sistema y acompañamiento operativo sobre la plataforma "${d.sw_nombre}".`
    },
    {
      heading: 'CLÁUSULA TERCERA. MATRIZ DE NIVELES DE SERVICIO (SLA) Y TIEMPOS DE RESPUESTA',
      text: `La atención de incidentes y requerimientos se clasifica según su severidad operativa y se compromete bajo los siguientes Acuerdos de Nivel de Servicio (SLA):`
    }
  ];

  y = writeParagraphs(doc, clauses, y);

  // Tabla AutoTable de Niveles de SLA
  const slaData = [
    ['Prioridad 1 (P1)', 'Incidente Crítico', 'Bloqueo total del sistema o caída que impide facturar o registrar operaciones.', d.sla_critico || 'Máximo 4 horas hábiles'],
    ['Prioridad 2 (P2)', 'Solicitud Estándar', 'Dudas de parametrización, inconsistencias menores en reportes o consultas de uso.', d.sla_estandar || 'Máximo 24 horas hábiles'],
    ['Prioridad 3 (P3)', 'Requerimiento de Mejora', 'Sugerencias operativas, solicitudes de nuevos campos o módulos complementarios.', 'Sujeto a viabilidad y cotización técnica']
  ];

  doc.autoTable({
    startY: y + 2,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Nivel', 'Clasificación', 'Descripción del Incidente', 'Compromiso de Respuesta']],
    body: slaData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 32, fontStyle: 'bold' },
      2: { cellWidth: 80 },
      3: { cellWidth: 'auto', fontStyle: 'bold', textColor: [36, 70, 184] }
    }
  });

  y = doc.lastAutoTable.finalY + 4;

  const clausesPart2 = [
    {
      heading: 'CLÁUSULA CUARTA. HORARIOS DE ATENCIÓN Y CANALES HABILITADOS',
      text: `Los servicios de soporte técnico se suministrarán en el horario: "${d.soporte_horario}". Canales oficiales: "${d.soporte_canal}". Todo requerimiento debe registrarse por los canales habilitados para garantizar la trazabilidad de tiempos de atención.`
    },
    {
      heading: 'CLÁUSULA QUINTA. ACTUALIZACIONES DE VERSIÓN Y CAMBIOS DIAN',
      text: `Actualizaciones de versión: ${d.incluye_actualizaciones === 'Sí' ? 'INCLUIDAS sin costo adicional durante la vigencia del contrato, incluyendo ajustes normativos tributarios de la DIAN' : 'NO incluidas en la tarifa estándar; se cotizarán por evento'}. Las actualizaciones se aplicarán conforme al protocolo técnico sin alterar los datos históricos del cliente.`
    },
    {
      heading: 'CLÁUSULA SEXTA. CAPACITACIÓN INICIAL Y TRANSFERENCIA DE CONOCIMIENTO',
      text: `Alcance de capacitación: ${d.incluye_capacitacion}. Dirigida a los usuarios autorizados de EL CLIENTE en los módulos contratados. Sesiones adicionales se facturarán por hora de consultoría.`
    },
    {
      heading: 'CLÁUSULA SÉPTIMA. EXCLUSIONES EXPLÍCITAS DEL SERVICIO',
      text: `No forman parte del soporte: (i) Mantenimiento o reparación de hardware, impresoras o redes locales de EL CLIENTE; (ii) Recuperación de información cuando EL CLIENTE haya omitido realizar copias de respaldo locales periódicas; (iii) Corrección de alteraciones directas a la base de datos efectuadas por terceros sin autorización escrita; (iv) Desarrollos no especificados en el contrato de licencia.`
    },
    {
      heading: 'CLÁUSULA OCTAVA. OBLIGACIONES DE EL CLIENTE',
      text: `EL CLIENTE se compromete a: (i) Permitir acceso remoto seguro (vía AnyDesk/TeamViewer o túnel TLS) para diagnóstico técnico; (ii) Suministrar información clara del error o novedad; (iii) Efectuar copias de seguridad de sus bases de datos con periodicidad diaria o semanal; (iv) Pagar puntualmente las tarifas acordadas.`
    },
    {
      heading: 'CLÁUSULA NOVENA. CONTRAPRESTACIÓN Y CONDICIONES DE PAGO',
      text: d.valor_soporte_num > 0
        ? `Por los servicios de soporte, EL CLIENTE pagará el canon de ${fmtCOP(d.valor_soporte)} (COP) bajo modalidad "${d.soporte_facturacion}". Régimen tributario: ${d.regimen_iva}.`
        : `Los servicios de soporte se encuentran ${d.soporte_facturacion.toLowerCase()}, integrados en la contraprestación del Contrato de Licencia N.° ${d.num_licencia}.`
    },
    {
      heading: 'CLÁUSULA DÉCIMA. CONFIDENCIALIDAD DE LA INFORMACIÓN',
      text: `EL PRESTADOR se compromete a guardar estricta reserva profesional sobre toda la información financiera, contable, inventarios, nómina y comercial a la que tenga acceso accidental o motivado durante las sesiones de soporte técnico, de conformidad con la Ley 1581 de 2012 y el secreto profesional.`
    },
    {
      heading: 'CLÁUSULA UNDÉCIMA. VIGENCIA Y PREAVISO DE TERMINACIÓN',
      text: `Vigencia de ${d.duracion_meses} meses contados a partir del ${d.fecha_inicio_fmt}, prorrogable automáticamente por periodos iguales. Cualquiera de las partes podrá darlo por terminado mediante notificación escrita radicada con un preaviso mínimo de treinta (30) días calendario.`
    }
  ];

  y = writeParagraphs(doc, clausesPart2, y);
  drawSignatureBlock(doc, y, d);
  addWatermarkAndHeaderFooter(doc, 'Contrato de Prestación de Servicios y SLA — GRAVY', d.num_contrato, logoData);

  return doc;
}

// =========================================================================
// DOCUMENTO 3: TÉRMINOS Y CONDICIONES Y DESLINDE CONTABLE-NORMATIVO
// (Incorporación integral de las estipulaciones de legal-center.ts)
// =========================================================================
function buildTermsAndConditionsDoc(d, logoData) {
  const doc = createDoc();
  let y = drawTitleBlock(doc, 'TÉRMINOS Y CONDICIONES DE USO Y CUMPLIMIENTO NORMATIVO', 'Marco Regulatorio Contable, Tributario, Habeas Data y Deslinde Legal — GRAVY', d.num_terminos);

  const chapters = [
    {
      heading: 'CAPÍTULO I. ACEPTACIÓN, CAPACIDAD LEGAL Y PERFECCIONAMIENTO ELECTRÓNICO',
      text: `1.1. Perfeccionamiento y Consentimiento Electrónico: La instalación, descarga, ejecución local o acceso a la plataforma GRAVY® constituye la suscripción de un contrato vinculante entre el Suscriptor y JULIÁN ESPINOSA ARRUBLA (C.C. 1.130.636.393), plenamente válido conforme a la Ley 527 de 1999 sobre Comercio Electrónico y Mensajes de Datos y los Arts. 864 y ss. del Código de Comercio.\n` +
            `1.2. Capacidad Legal: El Suscriptor declara bajo la gravedad de juramento que cuenta con capacidad legal plena y facultades estatutarias suficientes de representación para adquirir obligaciones comerciales en nombre de la entidad que representa.`
    },
    {
      heading: 'CAPÍTULO II. EXENCIÓN DE ASESORÍA PROFESIONAL Y DESLINDE CONTABLE-TRIBUTARIO (LEY 43 DE 1990)',
      text: `2.1. Naturaleza Tecnológica No Profesional: Al igual que el estándar legal de los softwares contables líderes en Colombia, GRAVY es una herramienta informática de automatización transaccional, cálculo matemático y estructuración documental. En ningún caso presta servicios de asesoría contable, consultoría tributaria, auditoría financiera ni representación jurídica.\n` +
            `2.2. Deber Exclusivo del Contador Público y Representante Legal: Conforme a la Ley 43 de 1990 y los Artículos 19, 48 a 60, 200 y 207 del Código de Comercio de Colombia, la fe pública sobre la razonabilidad de los estados financieros, la liquidación de tributos, la causación con partida doble estricta y los inventarios recae de forma personal e intransferible en el Contador Público Titulado y en el Representante Legal de la empresa suscriptora.\n` +
            `2.3. Exoneración por Errores de Parametrización y Liquidación: El Suscriptor es el único sujeto pasivo y obligado tributario frente a la Dirección de Impuestos y Aduanas Nacionales (DIAN), la UGPP y las secretarías de hacienda distritales o municipales. Julián Espinosa Arrubla queda enteramente exonerado por sanciones, multas, intereses moratorios o pliegos de cargos originados por:\n` +
            `  a) Configuración errada del plan de cuentas (PUC), tarifas de retención en la fuente, autorretenciones o bases gravables de IVA e ICA.\n` +
            `  b) Presentación extemporánea o con inconsistencias de declaraciones de impuestos o información exógena distrital o nacional.\n` +
            `  c) Omisión en el registro de novedades laborales o cálculo incorrecto de prestaciones sociales en el módulo de nómina.`
    },
    {
      heading: 'CAPÍTULO III. DOCUMENTOS ELECTRÓNICOS E INTEGRACIÓN DIAN (ESTÁNDAR UBL 2.1)',
      text: `3.1. Generación de Estándares UBL 2.1: GRAVY incorpora módulos para estructurar archivos XML validados bajo las directrices del Anexo Técnico de Factura Electrónica, Nómina Electrónica, Documento Soporte a No Obligados y eventos RADIAN de la DIAN.\n` +
            `3.2. Deberes del Contribuyente respecto a Resoluciones y Certificados: Es responsabilidad exclusiva del Suscriptor tramitar, asociar y renovar ante el portal Muisca de la DIAN los prefijos, números y claves técnicas de sus resoluciones de facturación, así como adquirir y custodiar el Certificado Digital de Firma emitido por una entidad autorizada por la ONAC.\n` +
            `3.3. Obligación Legal de Contingencia (Tipo 03 y 04 DIAN): Si por fallas ajenas a la plataforma (intermitencia de internet o caídas de los servicios de validación previa de la DIAN) no es posible la transmisión en tiempo real, el Suscriptor tiene la obligación legal de emitir facturas en contingencia (talonario o papel) según lo ordena la normativa tributaria.\n` +
            `3.4. Exclusión de Responsabilidad por Fallas de la DIAN: El titular no responderá por demoras, rechazos de paquetes XML o caídas en los servidores informáticos de la DIAN ni de los operadores de telecomunicaciones.`
    },
    {
      heading: 'CAPÍTULO IV. OBLIGACIÓN MERCANTIL DE CONSERVACIÓN DE LIBROS Y RESPALDOS (5 A 10 AÑOS)',
      text: `4.1. Deber Mercantil de Custodia: De acuerdo con los Artículos 48 a 60 del Código de Comercio y el Artículo 616-1 del Estatuto Tributario, los comerciantes están legalmente obligados a conservar los libros de contabilidad, correspondencia comercial y comprobantes justificativos durante al menos 5 años (firmeza tributaria) o 10 años (código mercantil).\n` +
            `4.2. El Software No es un Archivo Notarial Perpetuo: GRAVY es un sistema informático de procesamiento transaccional, no un almacén notarial perpetuo. Es obligación inexcusable del Suscriptor ejecutar copias de seguridad periódicas a través del generador de respaldos del sistema (archivos comprimidos encriptados) y resguardarlas en dispositivos externos seguros fuera del servidor de producción.\n` +
            `4.3. Pérdida de Información por Omisión de Copias: El titular queda exento de toda indemnización por pérdida de registros contables derivada de formateos indebidos, ataques de ransomware, daños físicos en discos o negligencia en las rutinas de respaldo del cliente.`
    },
    {
      heading: 'CAPÍTULO V. POLÍTICA DE PROTECCIÓN DE DATOS PERSONALES (HABEAS DATA - LEY 1581 DE 2012)',
      text: `5.1. Calidad de Encargado del Tratamiento: En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013, respecto de las bases de datos de clientes, empleados y terceros cargadas por el Suscriptor en el software, el Suscriptor ostenta la calidad de Responsable del Tratamiento y JULIÁN ESPINOSA ARRUBLA actúa exclusivamente como Encargado del Tratamiento.\n` +
            `5.2. Autorización de los Titulares: El Suscriptor garantiza que ha obtenido la debida autorización de los titulares de los datos para su almacenamiento y procesamiento contable.\n` +
            `5.3. Deberes de Seguridad: El titular mantendrá medidas técnicas de seguridad para evitar la adulteración, pérdida, consulta o acceso no autorizado a los datos administrados.`
    },
    {
      heading: 'CAPÍTULO VI. SEGURIDAD, INFRAESTRUCTURA Y MODALIDADES DE DESPLIEGUE',
      text: `6.1. Despliegue Local-First (On-Premise): En la modalidad local, la infraestructura física, seguridad de red interna, antivirus, cortafuegos y políticas de acceso recaen al 100% bajo el control de EL CLIENTE.\n` +
            `6.2. Despliegue Cloud (AWS): Cuando opere en modalidad nube, los servicios se alojan en centros de cómputo de Amazon Web Services (AWS) con estándares ISO 27001, con aislamiento lógico estricto por inquilino (*database-per-tenant*) y cifrado de datos en reposo (AES-256) y en tránsito (TLS 1.3). La disponibilidad meta es del 99.5% mensual.`
    },
    {
      heading: 'CAPÍTULO VII. PROPIEDAD INTELECTUAL Y PROHIBICIONES PENALES (LEY 1273 DE 2009)',
      text: `7.1. Derechos de Autor: La estructura de código, base de datos y diseño son propiedad intelectual de JULIÁN ESPINOSA ARRUBLA amparada por la Dirección Nacional de Derecho de Autor (DNDA).\n` +
            `7.2. Delitos Informáticos: Cualquier intento no autorizado de acceso indebido, extracción forzada de algoritmos, alteración de módulos licenciados o vulneración de llaves de control será puesto en conocimiento de la Fiscalía General de la Nación al amparo de la Ley 1273 de 2009.`
    },
    {
      heading: 'CAPÍTULO VIII. LEY APLICABLE Y JURISDICCIÓN',
      text: `Los presentes Términos y Condiciones se rigen por las leyes de la República de Colombia. Cualquier litigio será dirimido por los jueces de la República de Colombia en la jurisdicción fijada en el Contrato de Licencia.`
    }
  ];

  y = writeParagraphs(doc, chapters, y);

  // Bloque formal de aceptación
  if (y > 230) { doc.addPage(); y = 26; }
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`DECLARACIÓN DE CONFORMIDAD: El Representante Legal del Suscriptor manifiesta haber leído, comprendido e incorporado en su totalidad las presentes estipulaciones legales, contables y tributarias a la relación contractual establecida con el titular de GRAVY®.`, MARGIN, y, { maxWidth: CONTENT_W });

  y += 20;
  const colW = 85;
  const colX = (PAGE_W - colW) / 2;
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.5);
  doc.line(colX, y, colX + colW, y);

  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.text('EL LICENCIATARIO / SUSCRIPTOR', PAGE_W / 2, y, { align: 'center' });

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(d.cli_razon || 'Nombre o Razón Social', PAGE_W / 2, y, { align: 'center' });

  y += 4;
  doc.text(`NIT / C.C. ${d.cli_nit || 'Identificación'}`, PAGE_W / 2, y, { align: 'center' });

  y += 4;
  doc.text(d.cli_representante ? `Aceptado por: ${d.cli_representante} (${d.cli_cc_representante || 'C.C.'})` : 'Representante Legal Acreditado', PAGE_W / 2, y, { align: 'center' });

  addWatermarkAndHeaderFooter(doc, 'Términos y Condiciones Legales y Contables — GRAVY', d.num_terminos, logoData);

  return doc;
}

// =========================================================================
// GESTIÓN DE ACCIONES Y DESCARGA INDIVIDUAL / PAQUETE COMPLETO
// =========================================================================

function validateForm() {
  if (!form.reportValidity()) {
    throw new Error('invalid_form');
  }
}

async function handleGenerateDoc(builderFn, defaultNamePrefix) {
  try {
    validateForm();
    const d = getData();
    const logo = await loadLogo();
    const doc = builderFn(d, logo);
    const filename = `${defaultNamePrefix}_GRAVY_${fileSafe(d.cli_razon)}.pdf`;
    doc.save(filename);
    saveToStorage();
  } catch (err) {
    if (err.message === 'invalid_form') return;
    console.error('Error al generar PDF:', err);
    alert('Ocurrió un error al maquetar el documento PDF: ' + err.message);
  }
}

document.getElementById('btnLicencia').addEventListener('click', () => {
  handleGenerateDoc(buildLicenseDoc, '01_Contrato_Licencia');
});

document.getElementById('btnServicios').addEventListener('click', () => {
  handleGenerateDoc(buildContractDoc, '02_Contrato_Servicios');
});

document.getElementById('btnTerminos').addEventListener('click', () => {
  handleGenerateDoc(buildTermsAndConditionsDoc, '03_Terminos_Condiciones');
});

// Descarga en cadena del paquete completo (3 PDFs + JSON)
document.getElementById('btnPaqueteCompleto').addEventListener('click', async () => {
  try {
    validateForm();
    const d = getData();
    const logo = await loadLogo();
    const safeName = fileSafe(d.cli_razon);

    // 1. Licencia
    const docLic = buildLicenseDoc(d, logo);
    docLic.save(`01_Contrato_Licencia_GRAVY_${safeName}.pdf`);

    // 2. Servicios
    await new Promise(r => setTimeout(r, 400));
    const docSvc = buildContractDoc(d, logo);
    docSvc.save(`02_Contrato_Servicios_GRAVY_${safeName}.pdf`);

    // 3. Términos y Condiciones
    await new Promise(r => setTimeout(r, 400));
    const docTyc = buildTermsAndConditionsDoc(d, logo);
    docTyc.save(`03_Terminos_Condiciones_GRAVY_${safeName}.pdf`);

    // 4. JSON de Respaldo
    await new Promise(r => setTimeout(r, 400));
    downloadJson(d, `Datos_Licencia_GRAVY_${safeName}.json`);

    saveToStorage();
    if (saveStatus) {
      saveStatus.textContent = '✓ Paquete completo descargado con éxito (3 PDFs + 1 JSON).';
    }
  } catch (err) {
    if (err.message === 'invalid_form') return;
    console.error('Error generando paquete completo:', err);
    alert('Error al generar paquete completo: ' + err.message);
  }
});

// ---------- Inicialización del Módulo ----------
window.addEventListener('DOMContentLoaded', () => {
  const loaded = loadFromStorage();
  if (!loaded) {
    regenerateControlNumbers();
  } else {
    if (!document.getElementById('numLicencia').value) document.getElementById('numLicencia').value = generateDocNumber('LIC');
    if (!document.getElementById('numContrato').value) document.getElementById('numContrato').value = generateDocNumber('SVC');
    if (!document.getElementById('numTerminos').value) document.getElementById('numTerminos').value = generateDocNumber('TYC');
  }
  applyLicenseRules();
  applyPersonalizacionRules();
  renderPreview();
});
