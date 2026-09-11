// GRAVY — Generador de Licencia de Uso y Contrato de Servicios
// Genera documentos PDF a partir de los datos capturados en el formulario.

const form = document.getElementById('licForm');
const preview = document.getElementById('preview');

function getData() {
  const fd = new FormData(form);
  const mods = fd.getAll('mod');
  const d = Object.fromEntries(fd.entries());
  d.modulos = mods;
  d.mod = mods;
  return d;
}

function fmtCOP(value) {
  const n = Number(value || 0);
  return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
}

function fmtDate(value) {
  if (!value) return '____________';
  const [y, m, day] = value.split('-');
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${Number(day)} de ${meses[Number(m) - 1]} de ${y}`;
}

// ---------- Numeración de control no consecutiva ----------
// Alfabeto de Crockford (32 símbolos, sin I/L/O/U para evitar confusiones al transcribir).
const BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function randomBase32(len) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => BASE32[b % 32]).join('');
}

// Dígito verificador simple para detectar errores de transcripción del número.
function checksumChar(str) {
  let sum = 0;
  for (let i = 0; i < str.length; i++) sum = (sum + str.charCodeAt(i) * (i + 7)) % 32;
  return BASE32[sum];
}

// Formato: GRAVY-<LIC|SVC>-<AAMM>-<5 caracteres aleatorios>-<checksum>
// El segmento aleatorio (no incremental) impide inferir cuántos contratos existen o predecir el siguiente número.
function generateDocNumber(kind) {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const body = `${kind}-${yy}${mm}-${randomBase32(5)}`;
  return `GRAVY-${body}-${checksumChar(body)}`;
}

function regenerate(kind, inputId) {
  document.getElementById(inputId).value = generateDocNumber(kind);
  renderPreview();
  saveToStorage();
}

document.getElementById('btnRegenLic').addEventListener('click', () => regenerate('LIC', 'numLicencia'));
document.getElementById('btnRegenContrato').addEventListener('click', () => regenerate('SVC', 'numContrato'));

// ---------- Persistencia local (borrador del formulario) ----------
// Evita retipear los datos del cliente al hacer correcciones; nada sale del navegador.
const STORAGE_KEY = 'gravy_licenciador_form_v1';
const saveStatus = document.getElementById('saveStatus');
let saveStatusTimer = null;

function saveToStorage() {
  const fd = new FormData(form);
  const data = {};
  fd.forEach((value, key) => {
    if (key === 'mod') {
      (data.mod || (data.mod = [])).push(value);
    } else {
      data[key] = value;
    }
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  if (saveStatus) {
    saveStatus.textContent = `Borrador guardado localmente · ${new Date().toLocaleTimeString('es-CO')}`;
    clearTimeout(saveStatusTimer);
    saveStatusTimer = setTimeout(() => { saveStatus.textContent = ''; }, 4000);
  }
}

function applyDataToForm(data) {
  form.querySelectorAll('input[name], select[name], textarea[name]').forEach((el) => {
    if (el.name === 'mod' || el.readOnly) return;
    if (el.name in data) el.value = data[el.name];
  });
  form.querySelectorAll('input[name="mod"]').forEach((cb) => {
    cb.checked = Array.isArray(data.mod) && data.mod.includes(cb.value);
  });
  if (data.num_licencia) document.getElementById('numLicencia').value = data.num_licencia;
  if (data.num_contrato) document.getElementById('numContrato').value = data.num_contrato;
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  let data;
  try { data = JSON.parse(raw); } catch { return false; }
  applyDataToForm(data);
  return true;
}

document.getElementById('btnClear').addEventListener('click', () => {
  if (!confirm('¿Borrar el borrador guardado en este navegador? Los campos volverán a sus valores por defecto.')) return;
  localStorage.removeItem(STORAGE_KEY);
  form.reset();
  regenerate('LIC', 'numLicencia');
  regenerate('SVC', 'numContrato');
  applyLicenseTypeRules();
  applyPersonalizacionRules();
  renderPreview();
  if (saveStatus) saveStatus.textContent = 'Borrador eliminado.';
});

loadFromStorage();
if (!document.getElementById('numLicencia').value) regenerate('LIC', 'numLicencia');
if (!document.getElementById('numContrato').value) regenerate('SVC', 'numContrato');

form.addEventListener('input', saveToStorage);
form.addEventListener('change', saveToStorage);

// ---------- Licencia perpetua: la vigencia no admite renovación periódica ----------
const tipoLicenciaSelect = form.querySelector('select[name="sw_tipo_licencia"]');
const renovacionLabel = document.getElementById('renovacionLabel');
const renovacionInput = document.getElementById('renovacion');
const formaPagoSelect = document.getElementById('formaPago');
const perpetuaHint = document.getElementById('perpetuaHint');

function applyLicenseTypeRules() {
  const isPerpetua = tipoLicenciaSelect.value === 'Perpetua';
  renovacionInput.disabled = isPerpetua;
  renovacionLabel.style.opacity = isPerpetua ? 0.5 : 1;
  perpetuaHint.style.display = isPerpetua ? 'block' : 'none';
  if (isPerpetua) {
    renovacionInput.value = 'No aplica (licencia perpetua)';
    formaPagoSelect.value = 'Pago único';
  }
}
tipoLicenciaSelect.addEventListener('change', () => { applyLicenseTypeRules(); saveToStorage(); });
applyLicenseTypeRules();

// ---------- Personalizaciones de software ----------
const personalizacionSelect = document.getElementById('personalizacion');
const personalizacionDetalle = document.getElementById('personalizacionDetalle');

function applyPersonalizacionRules() {
  personalizacionDetalle.disabled = personalizacionSelect.value !== 'Sí';
  if (personalizacionSelect.value !== 'Sí') personalizacionDetalle.value = '';
}
personalizacionSelect.addEventListener('change', () => { applyPersonalizacionRules(); saveToStorage(); });
applyPersonalizacionRules();

// ---------- Exportar / importar datos en JSON (reutilizables en licenciamientos futuros) ----------
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

function exportCurrentDataAsJson(d) {
  downloadJson(d, `Datos_Licencia_${fileSafe(d.cli_razon)}.json`);
}

document.getElementById('btnExportarJson').addEventListener('click', () => {
  exportCurrentDataAsJson(getData());
});

document.getElementById('inputImportarJson').addEventListener('change', (ev) => {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      applyDataToForm(data);
      applyLicenseTypeRules();
      applyPersonalizacionRules();
      renderPreview();
      saveToStorage();
      if (saveStatus) saveStatus.textContent = `Datos cargados desde ${file.name}`;
    } catch (err) {
      alert('El archivo seleccionado no es un JSON válido de este formulario.\n\n' + err.message);
    } finally {
      ev.target.value = '';
    }
  };
  reader.readAsText(file);
});

// ---------- Logo (encabezado + marca de agua) ----------
let logoDataUrlPromise = null;
function loadLogo() {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = fetch('assets/gravy-logo.png')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }))
      .catch((err) => {
        console.warn('No se pudo cargar el logo (se generará el PDF sin logo/marca de agua):', err);
        return null;
      });
  }
  return logoDataUrlPromise;
}

function renderPreview() {
  const d = getData();
  preview.innerHTML = `
    <dl>
      <dt>Licenciatario</dt><dd>${d.cli_razon || '—'}</dd>
      <dt>NIT / C.C.</dt><dd>${d.cli_nit || '—'}</dd>
      <dt>Software</dt><dd>${d.sw_nombre} v${d.sw_version}</dd>
      <dt>Tipo de licencia</dt><dd>${d.sw_tipo_licencia}</dd>
      <dt>Módulos</dt><dd>${d.modulos.length ? d.modulos.join(', ') : '—'}</dd>
      <dt>Personalizaciones</dt><dd>${d.personalizacion === 'Sí' ? (d.personalizacion_detalle || 'Sí (sin detalle)') : 'No'}</dd>
      <dt>Valor</dt><dd>${fmtCOP(d.valor)}</dd>
      <dt>Vigencia contrato</dt><dd>${d.sw_tipo_licencia === 'Perpetua' ? 'Perpetua (sin renovación)' : `${d.duracion_meses} meses desde ${fmtDate(d.fecha_inicio)}`}</dd>
      <dt>Firma</dt><dd>${d.ciudad_firma}, ${fmtDate(d.fecha_firma)}</dd>
      <dt>N.° de Licencia</dt><dd>${d.num_licencia || '—'}</dd>
      <dt>N.° de Contrato de Servicios</dt><dd>${d.num_contrato || '—'}</dd>
    </dl>`;
}
form.addEventListener('input', renderPreview);
renderPreview();

// ---------- PDF helpers ----------

const PAGE_MARGIN = 20;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

function newDoc() {
  const { jsPDF } = window.jspdf;
  return new jsPDF({ unit: 'mm', format: 'a4' });
}

function addHeaderFooter(doc, title, docNumber, logoData) {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Marca de agua: logo grande y muy transparente, centrado en la página.
    if (logoData) {
      const wmSize = 130;
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.06 }));
      doc.addImage(logoData, 'PNG', (PAGE_WIDTH - wmSize) / 2, (297 - wmSize) / 2, wmSize, wmSize);
      doc.restoreGraphicsState();
    }

    // Logo pequeño de encabezado.
    if (logoData) {
      doc.addImage(logoData, 'PNG', PAGE_MARGIN, 5, 11, 11);
    }

    doc.setDrawColor(226, 232, 240);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(title, PAGE_MARGIN + (logoData ? 14 : 0), 9);
    doc.text(`N.° ${docNumber}`, PAGE_MARGIN + (logoData ? 14 : 0), 13);
    doc.text(`Página ${i} de ${pageCount}`, PAGE_WIDTH - PAGE_MARGIN, 10, { align: 'right' });
    doc.line(PAGE_MARGIN, 17, PAGE_WIDTH - PAGE_MARGIN, 17);
    doc.text('Documento generado automáticamente por el módulo Licenciador de GRAVY.', PAGE_MARGIN, 287);
  }
}

// Writes a block of paragraphs, handling pagination and returning the new Y cursor.
function writeParagraphs(doc, paragraphs, startY) {
  let y = startY;
  const lineHeight = 5.2;
  doc.setFontSize(10);
  doc.setTextColor(20, 25, 40);
  paragraphs.forEach((p) => {
    if (p.heading) {
      y += 4;
      if (y > 275) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(p.heading, PAGE_MARGIN, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
    }
    if (p.text) {
      const lines = doc.splitTextToSize(p.text, CONTENT_WIDTH);
      lines.forEach((line) => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(line, PAGE_MARGIN, y);
        y += lineHeight;
      });
      y += 2;
    }
  });
  return y;
}

function drawTitleBlock(doc, mainTitle, subtitle, docNumber) {
  let y = 32;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(mainTitle, PAGE_WIDTH / 2, y, { align: 'center' });
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(subtitle, PAGE_WIDTH / 2, y, { align: 'center' });
  y += 5;
  doc.setFontSize(9);
  doc.text(`Número de control: ${docNumber}`, PAGE_WIDTH / 2, y, { align: 'center' });
  y += 9;
  return y;
}

// ---------- Clause builders ----------

function isPerpetua(d) {
  return d.sw_tipo_licencia === 'Perpetua';
}

function licenseClauses(d) {
  const modulos = d.modulos.length ? d.modulos.join(', ') : 'los definidos en el plan contratado';
  const perpetua = isPerpetua(d);
  return [
    { heading: 'MARCO LEGAL', text:
      `El presente contrato se identifica con el número de control ${d.num_licencia} (asignado por EL LICENCIANTE para trazabilidad interna, sin que constituya una resolución o numeración expedida por autoridad alguna) ` +
      `y se celebra al amparo de la legislación de la República de Colombia, en especial: la Ley 23 de 1982 y la Ley 1915 de 2018 sobre derechos de autor y su aplicación al software; la Decisión Andina 351 de 1993 ` +
      `(Régimen Común sobre Derecho de Autor y Derechos Conexos); el Código Civil (arts. 1494 y ss., 1602 y concordantes sobre obligaciones y fuerza obligatoria de los contratos); el Código de Comercio (arts. 864 y ss.); ` +
      `la Ley 527 de 1999 y el Decreto 2364 de 2012 sobre validez de mensajes de datos y firmas electrónicas; la Ley 1581 de 2012 y el Decreto 1377 de 2013 sobre protección de datos personales (habeas data); ` +
      `y, cuando resulte aplicable, la Ley 1480 de 2011 (Estatuto del Consumidor) y la Ley 1273 de 2009 sobre protección de la información y los datos.` },
    { heading: 'PRIMERA. PARTES', text:
      `EL LICENCIANTE: ${d.lic_razon}, identificado con NIT ${d.lic_nit}, con domicilio en ${d.lic_domicilio}, representado legalmente por ${d.lic_representante || 'su representante legal'}. ` +
      `EL LICENCIATARIO: ${d.cli_razon}, identificado con NIT/C.C. ${d.cli_nit}, con domicilio en ${d.cli_domicilio}, representado legalmente por ${d.cli_representante || 'su representante legal'}.` },
    { heading: 'SEGUNDA. OBJETO', text:
      `EL LICENCIANTE otorga a EL LICENCIATARIO una licencia de uso, no exclusiva e intransferible, sobre el software "${d.sw_nombre}" (versión ${d.sw_version}), modalidad "${d.sw_tipo_licencia}", ` +
      `desplegado bajo la modalidad "${d.sw_modalidad}", habilitado para ${d.sw_empresas} empresa(s)/NIT(s) y hasta ${d.sw_usuarios} usuario(s) concurrente(s), incluyendo los siguientes módulos: ${modulos}.` },
    { heading: 'TERCERA. PROPIEDAD INTELECTUAL', text:
      `El software, su código fuente, estructura, diseño, bases de datos, marcas y demás elementos constitutivos son de propiedad exclusiva de EL LICENCIANTE y se encuentran protegidos por la Ley 23 de 1982, ` +
      `la Decisión Andina 351 de 1993 y demás normas concordantes sobre derechos de autor y propiedad intelectual. La presente licencia no transfiere derecho de propiedad alguno sobre el software a EL LICENCIATARIO.` },
    { heading: 'CUARTA. ALCANCE Y RESTRICCIONES DE USO', text:
      `EL LICENCIATARIO podrá usar el software únicamente para sus fines administrativos, contables y tributarios internos. Queda prohibido: (i) sublicenciar, ceder, arrendar o distribuir el software a terceros; ` +
      `(ii) realizar ingeniería inversa, descompilación o desensamblaje, salvo autorización legal expresa; (iii) exceder el número de empresas y usuarios contratados; (iv) utilizar el software para fines ilícitos o contrarios a la normatividad tributaria vigente.` },
    { heading: 'QUINTA. PERSONALIZACIONES DE SOFTWARE', text: d.personalizacion === 'Sí'
      ? `El presente software SÍ incluye desarrollos o personalizaciones a la medida para EL LICENCIATARIO, con el siguiente alcance: ${d.personalizacion_detalle || 'según se describa en el anexo técnico correspondiente'}. ` +
        `Dichas personalizaciones son propiedad de EL LICENCIANTE salvo pacto expreso en contrario, y su soporte y mantenimiento se rigen por las condiciones especiales acordadas entre las partes, las cuales pueden exceder el alcance estándar del contrato de prestación de servicios asociado.`
      : `El presente software NO incluye desarrollos o personalizaciones a la medida; corresponde exclusivamente a la versión estándar de "${d.sw_nombre}" con los módulos relacionados en la cláusula segunda. Cualquier desarrollo adicional requerido por EL LICENCIATARIO deberá pactarse mediante otrosí o contrato independiente.` },
    { heading: 'SEXTA. CONTRAPRESTACIÓN ECONÓMICA', text: perpetua
      ? `Como contraprestación por la licencia, EL LICENCIATARIO pagará a EL LICENCIANTE un pago único de ${fmtCOP(d.valor)} (COP). Por tratarse de una licencia perpetua, esta contraprestación no está sujeta a renovación periódica ni a pagos recurrentes por el derecho de uso del software, sin perjuicio de los servicios de soporte y mantenimiento pactados en el contrato de prestación de servicios asociado, los cuales se facturan de forma independiente.`
      : `Como contraprestación por la licencia, EL LICENCIATARIO pagará a EL LICENCIANTE la suma de ${fmtCOP(d.valor)} (COP), bajo la modalidad de pago "${d.forma_pago}". La renovación de la licencia se regirá por la siguiente condición: ${d.renovacion}.` },
    { heading: 'SÉPTIMA. VIGENCIA', text: perpetua
      ? `La presente licencia es de carácter PERPETUO: entra en vigor a partir del ${fmtDate(d.fecha_inicio)} y se mantiene vigente de manera indefinida, sin fecha de vencimiento ni necesidad de renovación periódica, durante todo el término de protección de los derechos patrimoniales de autor sobre el software conforme a la legislación colombiana. ` +
        `Lo anterior sin perjuicio de la facultad de EL LICENCIANTE de dar por terminada la licencia en caso de incumplimiento grave de EL LICENCIATARIO, conforme a la cláusula de terminación del presente contrato.`
      : `La presente licencia entra en vigor a partir del ${fmtDate(d.fecha_inicio)} y tendrá una duración de ${d.duracion_meses} meses, prorrogable automáticamente en los términos pactados en la cláusula anterior, salvo aviso de no renovación por cualquiera de las partes.` },
    { heading: 'OCTAVA. PROTECCIÓN DE DATOS', text:
      `El tratamiento de los datos personales y de la información financiera y contable almacenada en el software se realizará conforme a la Ley 1581 de 2012, el Decreto 1377 de 2013 y la política de tratamiento de datos de EL LICENCIANTE. ` +
      `EL LICENCIANTE actúa como encargado del tratamiento respecto de la información cargada por EL LICENCIATARIO en la plataforma.` },
    { heading: 'NOVENA. GARANTÍA Y LIMITACIÓN DE RESPONSABILIDAD', text:
      `EL LICENCIANTE garantiza el funcionamiento del software conforme a sus especificaciones técnicas publicadas. EL LICENCIANTE no será responsable por daños indirectos, lucro cesante o pérdida de información derivados de un uso indebido, ` +
      `de la falta de copias de respaldo por parte de EL LICENCIATARIO, o de causas de fuerza mayor o caso fortuito.` },
    { heading: 'DÉCIMA. TERMINACIÓN', text:
      `El incumplimiento de cualquiera de las obligaciones aquí pactadas, en especial el impago de la contraprestación económica o el uso indebido del software, dará lugar a la terminación unilateral de la licencia por parte de EL LICENCIANTE, previo aviso escrito.${perpetua ? ' En el caso de la licencia perpetua, la terminación por incumplimiento extingue el derecho de uso pero no genera derecho a reembolso del pago único ya efectuado.' : ''}` },
    { heading: 'UNDÉCIMA. LEY APLICABLE Y JURISDICCIÓN', text:
      `El presente contrato se rige por las leyes de la República de Colombia. Cualquier controversia derivada de su interpretación o ejecución será resuelta por los jueces competentes de ${d.ciudad_firma}, sin perjuicio de acudir a mecanismos de arreglo directo o conciliación.` },
  ];
}

function serviceClauses(d) {
  return [
    { heading: 'MARCO LEGAL', text:
      `El presente contrato se identifica con el número de control ${d.num_contrato} (asignado por EL PRESTADOR para trazabilidad interna, sin que constituya una resolución o numeración expedida por autoridad alguna), ` +
      `y es accesorio al contrato de licencia de uso de software identificado con el número ${d.num_licencia}. Se rige por la legislación de la República de Colombia, en especial el Código Civil y el Código de Comercio ` +
      `en materia de obligaciones y contratos mercantiles, la Ley 527 de 1999 sobre mensajes de datos, la Ley 1581 de 2012 y el Decreto 1377 de 2013 sobre protección de datos personales, y la Ley 1273 de 2009 sobre protección de la información.` },
    { heading: 'PRIMERA. PARTES Y ANTECEDENTES', text:
      `Entre ${d.lic_razon}, NIT ${d.lic_nit} (en adelante "EL PRESTADOR"), y ${d.cli_razon}, NIT/C.C. ${d.cli_nit} (en adelante "EL CLIENTE"), se celebra el presente contrato de prestación de servicios de soporte, ` +
      `mantenimiento y acompañamiento sobre el software "${d.sw_nombre}", licenciado mediante contrato independiente de licencia de uso de software.` },
    { heading: 'SEGUNDA. OBJETO DEL CONTRATO', text:
      `EL PRESTADOR se obliga a prestar a EL CLIENTE los servicios de soporte técnico, mantenimiento correctivo, actualizaciones de versión y acompañamiento funcional necesarios para el correcto uso del software licenciado, en los términos aquí descritos.` },
    { heading: 'TERCERA. SERVICIOS INCLUIDOS', text:
      `Los servicios incluidos son: soporte técnico en el horario "${d.soporte_horario}" a través de "${d.soporte_canal}", con un tiempo máximo de respuesta de "${d.soporte_sla}"; ` +
      `actualizaciones de versión del software: ${d.incluye_actualizaciones === 'Sí' ? 'incluidas sin costo adicional durante la vigencia del contrato' : 'no incluidas, se facturarán por separado'}; ` +
      `capacitación inicial al equipo de EL CLIENTE: ${d.incluye_capacitacion === 'Sí' ? 'incluida dentro del alcance del presente contrato' : 'no incluida, disponible como servicio adicional'}.` },
    { heading: 'CUARTA. EXCLUSIONES', text:
      `No se encuentran incluidos dentro del alcance de este contrato: desarrollos a la medida no contemplados en el alcance funcional estándar del software, soporte sobre hardware o infraestructura de EL CLIENTE, ` +
      `recuperación de información por fallas atribuibles a EL CLIENTE, ni la corrección de errores originados por modificaciones no autorizadas al software.` +
      (d.personalizacion === 'Sí'
        ? ` Las personalizaciones descritas en el contrato de licencia asociado (número ${d.num_licencia}) SÍ cuentan con soporte, en los términos y condiciones especiales pactados de forma independiente para dichos desarrollos.`
        : ` El software objeto de este contrato corresponde a la versión estándar, sin personalizaciones a la medida.`) },
    { heading: 'QUINTA. OBLIGACIONES DE EL CLIENTE', text:
      `EL CLIENTE se obliga a: (i) suministrar la información necesaria para la correcta prestación del servicio; (ii) mantener copias de respaldo de su información cuando el despliegue sea local (on-premise); ` +
      `(iii) pagar oportunamente las contraprestaciones pactadas; (iv) reportar oportunamente los incidentes o fallas detectadas a través de los canales dispuestos por EL PRESTADOR.` },
    { heading: 'SEXTA. VIGENCIA Y TERMINACIÓN', text: isPerpetua(d)
      ? `El presente contrato de servicios tendrá una vigencia inicial de ${d.duracion_meses} meses contados a partir del ${fmtDate(d.fecha_inicio)}, prorrogable automáticamente por periodos iguales, con independencia del carácter perpetuo de la licencia de uso de software asociada (número ${d.num_licencia}), la cual no está sujeta a vencimiento. ` +
        `Cualquiera de las partes podrá darlo por terminado con un preaviso escrito de treinta (30) días calendario, sin que ello afecte la vigencia perpetua de la licencia de software.`
      : `El presente contrato tendrá una vigencia de ${d.duracion_meses} meses contados a partir del ${fmtDate(d.fecha_inicio)}, prorrogable automáticamente en los mismos términos del contrato de licencia asociado. ` +
        `Cualquiera de las partes podrá darlo por terminado con un preaviso escrito de treinta (30) días calendario.` },
    { heading: 'SÉPTIMA. CONTRAPRESTACIÓN', text:
      `El valor de los servicios aquí descritos se encuentra incluido dentro de la contraprestación económica pactada en el contrato de licencia de uso de software, por valor de ${fmtCOP(d.valor)}, bajo la modalidad de pago "${d.forma_pago}".` },
    { heading: 'OCTAVA. CONFIDENCIALIDAD', text:
      `Las partes se obligan a mantener reserva sobre toda la información técnica, financiera, contable y comercial a la que tengan acceso con ocasión de la ejecución del presente contrato, ` +
      `y a no divulgarla a terceros sin autorización previa y escrita de la parte titular de dicha información, incluso después de terminado el presente contrato.` },
    { heading: 'NOVENA. LEY APLICABLE Y JURISDICCIÓN', text:
      `El presente contrato se rige por las leyes de la República de Colombia. Las controversias derivadas del mismo serán resueltas por los jueces competentes de ${d.ciudad_firma}.` },
  ];
}

function signatureBlock(doc, y, d) {
  if (y > 240) { doc.addPage(); y = 20; }
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Para constancia, se firma en ${d.ciudad_firma} el ${fmtDate(d.fecha_firma)}.`, PAGE_MARGIN, y);
  y += 20;
  doc.line(PAGE_MARGIN, y, PAGE_MARGIN + 70, y);
  doc.line(PAGE_MARGIN + 100, y, PAGE_MARGIN + 170, y);
  y += 5;
  doc.text(d.lic_razon, PAGE_MARGIN, y);
  doc.text(d.cli_razon, PAGE_MARGIN + 100, y);
  y += 5;
  doc.text('EL LICENCIANTE / PRESTADOR', PAGE_MARGIN, y);
  doc.text('EL LICENCIATARIO / CLIENTE', PAGE_MARGIN + 100, y);
  return y;
}

function buildLicenseDoc(d, logoData) {
  const doc = newDoc();
  let y = drawTitleBlock(doc, 'CONTRATO DE LICENCIA DE USO DE SOFTWARE', `${d.sw_nombre} — versión ${d.sw_version}`, d.num_licencia);
  y = writeParagraphs(doc, licenseClauses(d), y);
  signatureBlock(doc, y, d);
  addHeaderFooter(doc, 'Contrato de Licencia de Uso de Software — GRAVY', d.num_licencia, logoData);
  return doc;
}

function buildContractDoc(d, logoData) {
  const doc = newDoc();
  let y = drawTitleBlock(doc, 'CONTRATO DE PRESTACIÓN DE SERVICIOS', `Soporte y mantenimiento — ${d.sw_nombre}`, d.num_contrato);
  y = writeParagraphs(doc, serviceClauses(d), y);
  signatureBlock(doc, y, d);
  addHeaderFooter(doc, 'Contrato de Prestación de Servicios — GRAVY', d.num_contrato, logoData);
  return doc;
}

function fileSafe(name) {
  return (name || 'documento').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_');
}

function validate() {
  if (!form.reportValidity()) {
    throw new Error('invalid');
  }
}

async function withPdfErrorHandling(fn) {
  try {
    await fn();
  } catch (err) {
    if (err && err.message === 'invalid') return; // reportValidity ya muestra el campo faltante
    console.error('Error generando el PDF:', err);
    alert('No se pudo generar el PDF. Revisa la consola del navegador (F12) para más detalle.\n\n' + (err && err.message ? err.message : err));
  }
}

document.getElementById('btnLicencia').addEventListener('click', () => withPdfErrorHandling(async () => {
  validate();
  const d = getData();
  const logo = await loadLogo();
  buildLicenseDoc(d, logo).save(`Licencia_${fileSafe(d.cli_razon)}.pdf`);
  exportCurrentDataAsJson(d);
}));

document.getElementById('btnContrato').addEventListener('click', () => withPdfErrorHandling(async () => {
  validate();
  const d = getData();
  const logo = await loadLogo();
  buildContractDoc(d, logo).save(`Contrato_Servicios_${fileSafe(d.cli_razon)}.pdf`);
  exportCurrentDataAsJson(d);
}));

document.getElementById('btnAmbos').addEventListener('click', () => withPdfErrorHandling(async () => {
  validate();
  const d = getData();
  const logo = await loadLogo();
  buildLicenseDoc(d, logo).save(`Licencia_${fileSafe(d.cli_razon)}.pdf`);
  buildContractDoc(d, logo).save(`Contrato_Servicios_${fileSafe(d.cli_razon)}.pdf`);
  exportCurrentDataAsJson(d);
}));
