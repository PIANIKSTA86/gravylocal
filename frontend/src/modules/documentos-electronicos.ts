/**
 * GRAVY v2.0 — documentos-electronicos.ts
 * Centro de Documentos Electrónicos (CDE).
 * Permite cargar archivos XML/ZIP, extraer información de facturas electrónicas de la DIAN
 * (UBL 2.1, incluyendo AttachedDocuments), gestionar reglas de homologación contable,
 * asociar referencias/códigos de productos ERP mediante un buscador dinámico navegable por mouse y teclado,
 * discriminar múltiples tarifas de impuestos (IVA 19%, 5%, etc.) y aplicar retenciones fiscales
 * (ReteFuente, ReteIVA, ReteICA) automáticamente según el perfil fiscal del tercero.
 */

'use strict';

import JSZip from 'jszip';
import { calculateSalePriceFromCost } from './productos';

interface ElecDoc {
  id: string;
  uuid: string;
  number: string;
  document_type: string;
  status: string;
  issue_date: string;
  reception_date?: string;
  supplier_nit: string;
  supplier_name: string;
  customer_nit: string;
  customer_name: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  xml_file?: string;
  pdf_file?: string;
  processed: boolean;
  transaction_id?: string;
  hash?: string;
  import_date: string;
  notes?: string;
  supplier_details?: string;
  user_id: string;
  branch_id?: string;
  expand?: any;
}

export async function renderDocumentosElectronicos(container?: HTMLElement) {
  const getContainer = (window as any).getPageContainer || ((c: any) => c || document.getElementById('page-content'));
  const target = getContainer(container);
  if (!target) return;
  target.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando documentos electrónicos...</div>`;
  try {
    await loadCdePage(target);
  } catch (err: any) {
    target.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message)}</div>`;
  }
}

async function loadCdePage(c: HTMLElement) {
  const [docs, rules, companyNit] = await Promise.all([
    (window as any).pb.listAll('electronic_documents', { sort: '-issue_date', expand: 'transaction_id' }),
    (window as any).pb.listAll('homologation_rules'),
    (window as any).API.getSetting('company_nit').catch(() => '')
  ]);

  const totalCount = docs.length;
  const pendingCount = docs.filter((d: any) => d.status === 'pendiente').length;
  const homologatedCount = docs.filter((d: any) => d.status === 'homologado').length;
  const postedCount = docs.filter((d: any) => d.status === 'contabilizado').length;
  const errorCount = docs.filter((d: any) => d.status === 'error').length;

  c.innerHTML = `
    <!-- KPIs -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Centro de Documentos Electrónicos</h3>
        <p class="text-sm" style="color:#6B7280">Importa facturas electrónicas de compras y servicios (XML/ZIP) y automatiza su homologación y contabilización.</p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-outline" id="btn-cde-config" title="Configurar cuentas predeterminadas y reglas"><i class="fas fa-gear mr-1"></i>Configuración</button>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
      ${cdeKpi('Total Documentos', totalCount, 'fas fa-file-invoice', '#1A4B8C', '#EEF4FF')}
      ${cdeKpi('Pendientes', pendingCount, 'fas fa-clock', '#6B7280', '#F3F4F6')}
      ${cdeKpi('Homologados', homologatedCount, 'fas fa-code-merge', '#0284C7', '#E0F2FE')}
      ${cdeKpi('Contabilizados', postedCount, 'fas fa-circle-check', '#059669', '#ECFDF5')}
      ${cdeKpi('Con Error', errorCount, 'fas fa-circle-xmark', '#EF4444', '#FEF2F2')}
    </div>

    <!-- Drag & Drop Zone -->
    <div id="cde-drop-zone" class="border-2 border-dashed rounded-2xl p-8 mb-5 text-center cursor-pointer transition-all hover:bg-slate-50 flex flex-col items-center justify-center" 
         style="border-color: #CBD5E1; background: #FAFDFE;">
      <i class="fas fa-cloud-arrow-up text-4xl mb-3" style="color: #64748B;"></i>
      <h4 class="font-bold text-sm" style="color: #334155;">Arrastra tus archivos XML o ZIP aquí</h4>
      <p class="text-xs mt-1" style="color: #64748B;">O haz clic para seleccionar archivos desde tu equipo (soporta múltiples XML o ZIP comprimidos)</p>
      <input type="file" id="cde-file-input" multiple accept=".xml,.zip" class="hidden">
    </div>

    <!-- Progress Indicator -->
    <div id="cde-progress-container" class="hidden bg-white border rounded-2xl p-4 mb-5" style="border-color: #F0F0F0;">
      <div class="flex items-center justify-between mb-2">
        <span id="cde-progress-label" class="text-xs font-semibold" style="color: #475569;">Procesando archivos...</span>
        <span id="cde-progress-percent" class="text-xs font-bold" style="color: #1A4B8C;">0%</span>
      </div>
      <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div id="cde-progress-bar" class="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full w-0 transition-all duration-300"></div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-2xl border p-3 mb-4 flex flex-wrap gap-3 items-center" style="border-color:#F0F0F0">
      <input id="cde-q" class="form-input flex-1 min-w-48" placeholder="Buscar por número o proveedor...">
      <select id="cde-status-f" class="form-input" style="max-width:180px">
        <option value="">Todos los estados</option>
        <option value="pendiente">Pendiente</option>
        <option value="homologado">Homologado</option>
        <option value="contabilizado">Contabilizado</option>
        <option value="error">Con Error</option>
      </select>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
      <div class="overflow-x-auto">
        <table class="data-table" id="cde-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Número</th>
              <th>Emisor (Proveedor)</th>
              <th>Fecha Emisión</th>
              <th class="text-right">Subtotal</th>
              <th class="text-right">IVA</th>
              <th class="text-right">Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="cde-tbody">
            ${docs.length ? docs.map(d => renderDocRow(d)).join('') : `<tr><td colspan="9" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-file-invoice mr-2"></i>No hay documentos electrónicos importados.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Attach Event Listeners
  const dropZone = document.getElementById('cde-drop-zone');
  const fileInput = document.getElementById('cde-file-input') as HTMLInputElement;

  dropZone?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', (e: any) => handleFilesSelected(e.target.files, c));
  document.getElementById('btn-cde-config')?.addEventListener('click', () => openCdeSettingsModal(c));

  dropZone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (dropZone) dropZone.style.borderColor = '#7C3AED';
  });

  dropZone?.addEventListener('dragleave', () => {
    if (dropZone) dropZone.style.borderColor = '#CBD5E1';
  });

  dropZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    if (dropZone) dropZone.style.borderColor = '#CBD5E1';
    if (e.dataTransfer?.files) {
      handleFilesSelected(e.dataTransfer.files, c);
    }
  });

  // Filters
  const applyFilter = () => {
    const q = (document.getElementById('cde-q') as HTMLInputElement)?.value.toLowerCase().trim();
    const st = (document.getElementById('cde-status-f') as HTMLSelectElement)?.value;
    const rows = document.querySelectorAll('#cde-tbody tr');

    rows.forEach((tr: any) => {
      if (tr.children.length === 1 && tr.textContent.includes('No hay')) return;
      const text = tr.textContent.toLowerCase();
      const status = tr.dataset.status;

      const matchesQ = !q || text.includes(q);
      const matchesStatus = !st || status === st;

      tr.style.display = (matchesQ && matchesStatus) ? '' : 'none';
    });
  };

  document.getElementById('cde-q')?.addEventListener('input', applyFilter);
  document.getElementById('cde-status-f')?.addEventListener('change', applyFilter);
}

function cdeKpi(title: string, value: any, icon: string, color: string, bg: string) {
  return `
    <div class="stat-card blue" style="background:#fff;border-color:#E5E7EB">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs uppercase font-bold tracking-wider" style="color:#6B7280">${title}</span>
          <h4 class="text-2xl font-extrabold mt-1" style="color:#0D2137">${value}</h4>
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="color:${color};background:${bg}">
          <i class="${icon}"></i>
        </div>
      </div>
    </div>
  `;
}

function renderDocRow(d: ElecDoc) {
  const typeLabels: Record<string, string> = {
    invoice_purchase: 'Compra / Servicio',
    invoice_sale: 'Venta',
    credit_note: 'Nota Crédito',
    debit_note: 'Nota Débito',
    support_document: 'Doc. Soporte',
    payroll: 'Nómina',
    payroll_adjust: 'Ajuste Nómina'
  };

  const statusBadges: Record<string, string> = {
    pendiente: 'badge-gray',
    homologado: 'badge-blue',
    contabilizado: 'badge-green',
    error: 'badge-red'
  };

  const typeIcons: Record<string, string> = {
    invoice_purchase: 'fa-cart-shopping text-blue-500',
    invoice_sale: 'fa-file-invoice text-emerald-500',
    credit_note: 'fa-file-signature text-orange-500',
    debit_note: 'fa-file-lines text-red-500',
    support_document: 'fa-file-contract text-purple-500'
  };

  const txNum = d.expand?.transaction_id?.number || '';

  return `
    <tr data-id="${d.id}" data-status="${d.status}">
      <td class="font-medium text-xs">
        <i class="fas ${typeIcons[d.document_type] || 'fa-file text-slate-500'} mr-2"></i>
        ${typeLabels[d.document_type] || d.document_type}
      </td>
      <td><span class="font-mono font-semibold">${(window as any).esc(d.number)}</span></td>
      <td>
        <div class="font-medium text-xs">${(window as any).esc(d.supplier_name)}</div>
        <div class="text-[10px] text-gray-400">NIT: ${(window as any).esc(d.supplier_nit)}</div>
      </td>
      <td><span class="text-xs">${(window as any).esc(d.issue_date)}</span></td>
      <td class="text-right font-mono text-xs">${(window as any).fmt(d.subtotal)}</td>
      <td class="text-right font-mono text-xs">${(window as any).fmt(d.tax_amount)}</td>
      <td class="text-right font-mono text-xs font-bold" style="color: #1A4B8C;">${(window as any).fmt(d.total)}</td>
      <td>
        <span class="badge ${statusBadges[d.status] || 'badge-gray'} text-xs capitalize">${d.status}</span>
      </td>
      <td>
        <div class="flex items-center gap-1.5">
          <button class="btn btn-outline btn-sm text-[11px] py-1 px-2" title="Ver Detalle XML" onclick="viewDocXmlDetails('${d.id}')">
            <i class="fas fa-eye"></i>
          </button>

          ${d.status !== 'contabilizado' ? `
            <button class="btn btn-primary btn-sm text-[11px] py-1 px-2" title="Homologar y Contabilizar" onclick="openDocHomologationModal('${d.id}')">
              <i class="fas fa-magic"></i> Contabilizar
            </button>
            <button class="btn btn-outline btn-sm text-red-500 hover:bg-red-50 text-[11px] py-1 px-2 transition" title="Eliminar registro no contabilizado" onclick="deleteDocElectronico('${d.id}')">
              <i class="fas fa-trash-can"></i>
            </button>
          ` : `
            <span class="text-xs text-emerald-600 font-semibold" title="Transacción: ${txNum}">
              <i class="fas fa-check-double mr-1"></i>${txNum || 'Listo'}
            </span>
            ${['superadmin', 'administrador', 'admin'].includes(((window as any).pb.currentUser?.role || '').toLowerCase()) ? `
              <button class="btn btn-outline btn-sm text-red-500 hover:bg-red-50 text-[10px] py-0.5 px-1.5 transition ml-1" title="Reversar contabilización" onclick="window.reverseDocContabilization('${d.id}')">
                <i class="fas fa-undo"></i> Reversar
              </button>
            ` : ''}
          `}
        </div>
      </td>
    </tr>
  `;
}

// ──────────────────────────────────────────────────────────
// IMPORTACIÓN & PARSING DE XML
// ──────────────────────────────────────────────────────────

async function handleFilesSelected(files: FileList, c: HTMLElement) {
  if (!files || !files.length) return;

  const progressContainer = document.getElementById('cde-progress-container');
  const progressLabel = document.getElementById('cde-progress-label');
  const progressPercent = document.getElementById('cde-progress-percent');
  const progressBar = document.getElementById('cde-progress-bar');

  progressContainer?.classList.remove('hidden');
  updateProgress(0, 'Iniciando importación...');

  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  const xmlFilesToProcess: { name: string; content: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    updateProgress(0, `Abriendo ${f.name}...`);
    
    if (f.name.endsWith('.zip')) {
      try {
        const zip = await JSZip.loadAsync(f);
        const entries = Object.keys(zip.files).filter(name => name.endsWith('.xml'));
        for (const name of entries) {
          const content = await zip.files[name].async('string');
          xmlFilesToProcess.push({ name, content });
        }
      } catch (err: any) {
        console.error(`Error descompresión ZIP ${f.name}:`, err);
        errorCount++;
      }
    } else if (f.name.endsWith('.xml')) {
      try {
        const content = await readFileAsText(f);
        xmlFilesToProcess.push({ name: f.name, content });
      } catch (err: any) {
        console.error(`Error leyendo XML ${f.name}:`, err);
        errorCount++;
      }
    }
  }

  const totalXmls = xmlFilesToProcess.length;
  if (!totalXmls) {
    updateProgress(100, 'Completado');
    (window as any).showToast('No se encontraron archivos XML válidos para importar', 'warning');
    setTimeout(() => progressContainer?.classList.add('hidden'), 2000);
    return;
  }

  const user = (window as any).pb.currentUser;

  for (let i = 0; i < totalXmls; i++) {
    const item = xmlFilesToProcess[i];
    const pct = Math.round((i / totalXmls) * 100);
    updateProgress(pct, `Procesando ${item.name} (${i + 1}/${totalXmls})...`);

    try {
      const parsedData = parseDianXml(item.content);
      if (!parsedData) {
        errorCount++;
        continue;
      }

      const existing = await (window as any).pb.list('electronic_documents', {
        filter: `uuid = "${(window as any).pb.escapeFilterValue(parsedData.uuid)}"`,
        perPage: 1
      });

      if (existing.items.length) {
        skippedCount++;
        continue;
      }

      const docPayload: Partial<ElecDoc> & { supplier_details?: string } = {
        uuid: parsedData.uuid,
        number: parsedData.number,
        document_type: parsedData.documentType,
        status: 'pendiente',
        issue_date: parsedData.issueDate,
        supplier_nit: parsedData.supplierNit,
        supplier_name: parsedData.supplierName,
        customer_nit: parsedData.customerNit,
        customer_name: parsedData.customerName,
        subtotal: parsedData.subtotal,
        tax_amount: parsedData.taxAmount,
        total: parsedData.total,
        processed: false,
        import_date: (window as any).todayStr(),
        user_id: user?.id || '',
        supplier_details: JSON.stringify(parsedData.supplierDetails)
      };

      const docRecord = await (window as any).pb.create('electronic_documents', docPayload);

      for (const line of parsedData.lines) {
        await (window as any).pb.create('electronic_document_items', {
          document_id: docRecord.id,
          code: line.code,
          unspsc_code: line.unspscCode,
          description: line.description,
          qty: line.qty,
          price: line.price,
          subtotal: line.subtotal
        });
      }

      for (const tax of parsedData.taxes) {
        await (window as any).pb.create('electronic_document_taxes', {
          document_id: docRecord.id,
          tax_type: tax.taxType,
          rate: tax.rate,
          base: tax.base,
          amount: tax.amount
        });
      }

      processedCount++;
    } catch (err) {
      console.error(`Error parseando/guardando XML ${item.name}:`, err);
      errorCount++;
    }
  }

  updateProgress(100, `Importación finalizada. Nuevos: ${processedCount}, Omitidos: ${skippedCount}, Errores: ${errorCount}`);
  (window as any).showToast(`Importación masiva: ${processedCount} nuevos importados, ${skippedCount} duplicados omitidos.`, 'success');
  
  setTimeout(() => {
    progressContainer?.classList.add('hidden');
    loadCdePage(c);
  }, 3500);

  function updateProgress(percent: number, text: string) {
    if (progressPercent) progressPercent.textContent = `${percent}%`;
    if (progressLabel) progressLabel.textContent = text;
    if (progressBar) progressBar.style.width = `${percent}%`;
  }
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function findElement(parent: any, tagName: string): any {
  let el = parent.getElementsByTagName(tagName)[0];
  if (!el) {
    const localName = tagName.split(':').pop() || '';
    el = parent.getElementsByTagName(localName)[0];
    if (!el) {
      el = parent.querySelector(`[localName="${localName}"]`);
    }
  }
  return el;
}

function getElementText(parent: any, tagName: string): string {
  const el = findElement(parent, tagName);
  return el ? el.textContent.trim() : '';
}

function findElementPath(parent: any, tags: string[]): any {
  let curr = parent;
  for (const tag of tags) {
    curr = findElement(curr, tag);
    if (!curr) return null;
  }
  return curr;
}

function getElementPathText(parent: any, tags: string[]): string {
  const el = findElementPath(parent, tags);
  return el ? el.textContent.trim() : '';
}

function parseDianXml(xmlText: string) {
  const parser = new DOMParser();
  let xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  if (xmlDoc.getElementsByTagName('parsererror').length) {
    throw new Error('El archivo XML no tiene un formato válido.');
  }

  let root = xmlDoc.documentElement;
  
  if (root.localName === 'AttachedDocument' || root.tagName.endsWith('AttachedDocument')) {
    const descEl = xmlDoc.getElementsByTagName('cbc:Description')[0] || xmlDoc.getElementsByTagName('Description')[0];
    if (descEl && descEl.textContent) {
      const innerText = descEl.textContent.trim();
      const innerParser = new DOMParser();
      xmlDoc = innerParser.parseFromString(innerText, 'text/xml');
      root = xmlDoc.documentElement;
    }
  }

  const rootName = root.localName || root.tagName.split(':').pop() || '';

  const validTypes = ['Invoice', 'CreditNote', 'DebitNote'];
  if (!validTypes.includes(rootName)) {
    throw new Error(`Tipo de documento XML no soportado: ${rootName}`);
  }

  const uuid = getElementText(xmlDoc, 'cbc:UUID') || getElementText(xmlDoc, 'UUID');
  const number = getElementText(xmlDoc, 'cbc:ID') || getElementText(xmlDoc, 'ID');
  const issueDate = getElementText(xmlDoc, 'cbc:IssueDate') || getElementText(xmlDoc, 'IssueDate');

  if (!uuid || !number) {
    throw new Error('No se pudo extraer el CUFE o el número del documento.');
  }

  let supplierNIT = getElementPathText(xmlDoc, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyTaxScheme', 'cbc:CompanyID']);
  if (!supplierNIT) {
    supplierNIT = getElementPathText(xmlDoc, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyIdentification', 'cbc:ID']);
  }
  
  let supplierName = getElementPathText(xmlDoc, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyLegalEntity', 'cbc:RegistrationName']);
  if (!supplierName) {
    supplierName = getElementPathText(xmlDoc, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyName', 'cbc:Name']);
  }
  if (!supplierName) {
    supplierName = getElementPathText(xmlDoc, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyLegalEntity', 'cbc:Name']);
  }

  const supplierContactEmail = getElementPathText(xmlDoc, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:Contact', 'cbc:ElectronicMail']);
  const supplierContactPhone = getElementPathText(xmlDoc, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:Contact', 'cbc:Telephone']);
  
  let addressLine = getElementPathText(xmlDoc, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PhysicalLocation', 'cac:Address', 'cac:AddressLine', 'cbc:Line']);
  if (!addressLine) {
    addressLine = getElementPathText(xmlDoc, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:RegistrationAddress', 'cac:AddressLine', 'cbc:Line']);
  }
  let cityName = getElementPathText(xmlDoc, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PhysicalLocation', 'cac:Address', 'cbc:CityName']);
  if (!cityName) {
    cityName = getElementPathText(xmlDoc, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:RegistrationAddress', 'cbc:CityName']);
  }
  let deptSubentity = getElementPathText(xmlDoc, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PhysicalLocation', 'cac:Address', 'cbc:CountrySubentity']);
  if (!deptSubentity) {
    deptSubentity = getElementPathText(xmlDoc, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:RegistrationAddress', 'cbc:CountrySubentity']);
  }
  let countryCode = getElementPathText(xmlDoc, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PhysicalLocation', 'cac:Address', 'cac:Country', 'cbc:IdentificationCode']);
  if (!countryCode) {
    countryCode = getElementPathText(xmlDoc, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:RegistrationAddress', 'cac:Country', 'cbc:IdentificationCode']) || 'CO';
  }

  const taxLevelCode = getElementPathText(xmlDoc, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyTaxScheme', 'cbc:TaxLevelCode']);
  let taxRegime = 'COMUN';
  if (taxLevelCode) {
    if (taxLevelCode.includes('O-13')) {
      taxRegime = 'GRAN_CONTR';
    } else if (taxLevelCode.includes('O-48') || taxLevelCode.includes('R-99')) {
      taxRegime = 'NO_RESP';
    } else if (taxLevelCode.includes('O-49')) {
      taxRegime = 'SIMPLIFICADO';
    }
  }

  const supplierIdEl = findElementPath(xmlDoc, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyTaxScheme', 'cbc:CompanyID']) || 
                       findElementPath(xmlDoc, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyIdentification', 'cbc:ID']);
  const dv = supplierIdEl ? supplierIdEl.getAttribute('schemeID') || '' : '';

  let customerNIT = getElementPathText(xmlDoc, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PartyTaxScheme', 'cbc:CompanyID']);
  if (!customerNIT) {
    customerNIT = getElementPathText(xmlDoc, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PartyIdentification', 'cbc:ID']);
  }

  let customerName = getElementPathText(xmlDoc, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PartyLegalEntity', 'cbc:RegistrationName']);
  if (!customerName) {
    customerName = getElementPathText(xmlDoc, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PartyName', 'cbc:Name']);
  }

  const subtotal = parseFloat(getElementPathText(xmlDoc, ['cac:LegalMonetaryTotal', 'cbc:LineExtensionAmount'])) || 0;
  const taxAmount = parseFloat(getElementText(xmlDoc, 'cbc:TaxAmount')) || 0;
  let total = parseFloat(getElementPathText(xmlDoc, ['cac:LegalMonetaryTotal', 'cbc:PayableAmount'])) || 0;
  if (!total) {
    total = parseFloat(getElementPathText(xmlDoc, ['cac:LegalMonetaryTotal', 'cbc:TaxInclusiveAmount'])) || 0;
  }

  let documentType = 'invoice_purchase';
  if (rootName === 'CreditNote') {
    documentType = 'credit_note';
  } else if (rootName === 'DebitNote') {
    documentType = 'debit_note';
  }

  const lines: any[] = [];
  const lineTagName = rootName === 'Invoice' ? 'cac:InvoiceLine' : (rootName === 'CreditNote' ? 'cac:CreditNoteLine' : 'cac:DebitNoteLine');
  const xmlLines = xmlDoc.getElementsByTagName(lineTagName);

  for (let i = 0; i < xmlLines.length; i++) {
    const xLine = xmlLines[i];
    const lineId = getElementText(xLine, 'cbc:ID');
    const description = getElementPathText(xLine, ['cac:Item', 'cbc:Description']);
    const code = getElementPathText(xLine, ['cac:Item', 'cac:SellersItemIdentification', 'cbc:ID']);
    const unspscCode = getElementPathText(xLine, ['cac:Item', 'cac:StandardItemIdentification', 'cbc:ID']);
    
    let qtyEl = xLine.getElementsByTagName('cbc:InvoicedQuantity')[0] || xLine.getElementsByTagName('cbc:CreditedQuantity')[0] || xLine.getElementsByTagName('cbc:DebitedQuantity')[0];
    if (!qtyEl) {
      qtyEl = xLine.querySelector('*[tagName*="Quantity"]');
    }
    const qty = parseFloat(qtyEl?.textContent || '0') || 0;

    const lineSubtotal = parseFloat(getElementText(xLine, 'cbc:LineExtensionAmount')) || 0;
    const price = parseFloat(getElementPathText(xLine, ['cac:Price', 'cbc:PriceAmount'])) || lineSubtotal / (qty || 1);

    lines.push({
      code: code || lineId,
      unspscCode,
      description,
      qty,
      price,
      subtotal: lineSubtotal
    });
  }

  const taxes: any[] = [];
  const docTaxTotals = xmlDoc.getElementsByTagName('cac:TaxTotal');
  for (let i = 0; i < docTaxTotals.length; i++) {
    const dtt = docTaxTotals[i];
    if (dtt.parentNode !== root) continue;

    const subtotals = dtt.getElementsByTagName('cac:TaxSubtotal');
    for (let j = 0; j < subtotals.length; j++) {
      const sub = subtotals[j];
      const code = getElementPathText(sub, ['cac:TaxCategory', 'cac:TaxScheme', 'cbc:ID']);
      const rate = parseFloat(getElementPathText(sub, ['cac:TaxCategory', 'cbc:Percent'])) || 0;
      const base = parseFloat(getElementText(sub, 'cbc:TaxableAmount')) || 0;
      const amount = parseFloat(getElementText(sub, 'cbc:TaxAmount')) || 0;

      let taxType = 'iva';
      if (code === '02') taxType = 'ica';
      else if (code === '03' || code === '04') taxType = 'inc';

      taxes.push({ taxType, rate, base, amount });
    }
  }

  return {
    uuid,
    number,
    documentType,
    issueDate,
    supplierNit: supplierNIT.replace(/[^0-9\-]/g, ''),
    supplierName: supplierName || 'Proveedor Desconocido',
    customerNit: customerNIT.replace(/[^0-9\-]/g, ''),
    customerName: customerName || 'Adquirente',
    subtotal,
    taxAmount,
    total,
    lines,
    taxes,
    supplierDetails: {
      email: supplierContactEmail || '',
      phone: supplierContactPhone || '',
      address: addressLine || '',
      city: cityName || '',
      department: deptSubentity || '',
      country: countryCode || '',
      dv: dv || '',
      tax_regime: taxRegime,
      person_type: (supplierNIT.replace(/[^0-9]/g, '').length >= 9 && (supplierNIT.startsWith('8') || supplierNIT.startsWith('9'))) ? 'JURIDICA' : 'NATURAL'
    }
  };
}

// ──────────────────────────────────────────────────────────
// OPERACIONES DE ELIMINACIÓN
// ──────────────────────────────────────────────────────────

async function deleteDocElectronico(id: string) {
  try {
    const d = await (window as any).pb.get('electronic_documents', id);
    if (d.status === 'contabilizado') {
      return (window as any).showToast('No se puede eliminar un documento que ya fue contabilizado. Reversa la contabilización primero.', 'warning');
    }

    if (!confirm(`¿Estás seguro de eliminar el documento ${d.number} (${d.supplier_name})? Esta acción borrará el registro del grid.`)) {
      return;
    }

    const [items, taxes] = await Promise.all([
      (window as any).pb.listAll('electronic_document_items', { filter: `document_id = "${id}"` }),
      (window as any).pb.listAll('electronic_document_taxes', { filter: `document_id = "${id}"` })
    ]);

    for (const item of items) {
      await (window as any).pb.delete('electronic_document_items', item.id).catch(() => {});
    }
    for (const tax of taxes) {
      await (window as any).pb.delete('electronic_document_taxes', tax.id).catch(() => {});
    }

    await (window as any).pb.delete('electronic_documents', id);

    (window as any).showToast('Documento electrónico eliminado correctamente', 'success');

    renderDocumentosElectronicos();
  } catch (err: any) {
    (window as any).showToast(`Error al eliminar documento: ${err.message}`, 'error');
  }
}

// ──────────────────────────────────────────────────────────
// MODALES: VER DETALLE & HOMOLOGACIÓN AVANZADA CON AUTOCOMPLETES NAVEGABLES
// ──────────────────────────────────────────────────────────

async function viewDocXmlDetails(id: string) {
  try {
    const d = await (window as any).pb.get('electronic_documents', id);
    const items = await (window as any).pb.listAll('electronic_document_items', { filter: `document_id = "${id}"` });
    const taxes = await (window as any).pb.listAll('electronic_document_taxes', { filter: `document_id = "${id}"` });

    const htmlBody = `
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-2 text-xs border-b pb-3">
          <div><strong>CUFE/CUDE:</strong> <span class="font-mono break-all text-[11px]">${d.uuid}</span></div>
          <div><strong>Número:</strong> <span class="font-mono font-bold text-slate-800">${d.number}</span></div>
          <div><strong>Emisor (Proveedor):</strong> ${d.supplier_name} (NIT: ${d.supplier_nit})</div>
          <div><strong>Receptor:</strong> ${d.customer_name} (NIT: ${d.customer_nit})</div>
          <div><strong>Fecha Emisión:</strong> ${d.issue_date}</div>
          <div><strong>Importado:</strong> ${d.import_date}</div>
        </div>

        <div class="font-semibold text-xs text-slate-700">Ítems del XML (${items.length}):</div>
        <div class="border rounded-lg overflow-hidden max-h-56 overflow-y-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b sticky top-0">
              <tr>
                <th class="p-2">Cód. / Ref. XML</th>
                <th class="p-2">Descripción</th>
                <th class="p-2 text-right">Cant.</th>
                <th class="p-2 text-right">Precio Unit.</th>
                <th class="p-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((it: any) => `
                <tr class="border-b hover:bg-slate-50">
                  <td class="p-2 font-mono text-[11px] text-slate-600">${(window as any).esc(it.code || 'N/A')}</td>
                  <td class="p-2">
                    ${(window as any).esc(it.description)}
                    ${it.unspsc_code ? `<span class="text-[9px] text-gray-400 block">UNSPSC: ${it.unspsc_code}</span>` : ''}
                  </td>
                  <td class="p-2 text-right font-mono">${(window as any).fmtN(it.qty)}</td>
                  <td class="p-2 text-right font-mono">${(window as any).fmt(it.price)}</td>
                  <td class="p-2 text-right font-mono font-bold">${(window as any).fmt(it.subtotal)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="grid grid-cols-2 gap-4 pt-2">
          <div>
            <div class="font-semibold text-xs text-slate-700 mb-1">Impuestos declarados:</div>
            <div class="border rounded-lg p-2 text-xs space-y-1 bg-slate-50">
              ${taxes.length ? taxes.map((t: any) => `
                <div class="flex justify-between font-mono">
                  <span>${t.tax_type.toUpperCase()} (${t.rate}%)</span>
                  <span>Base: ${(window as any).fmt(t.base)} | Imp: ${(window as any).fmt(t.amount)}</span>
                </div>
              `).join('') : '<div class="text-gray-400 text-center">Exento de impuestos</div>'}
            </div>
          </div>
          <div class="flex flex-col justify-end items-end space-y-1 text-xs">
            <div>Subtotal: <span class="font-mono font-semibold">${(window as any).fmt(d.subtotal)}</span></div>
            <div>Impuestos: <span class="font-mono font-semibold">${(window as any).fmt(d.tax_amount)}</span></div>
            <div class="text-sm font-bold" style="color: #1A4B8C;">Total: <span class="font-mono">${(window as any).fmt(d.total)}</span></div>
          </div>
        </div>
      </div>
    `;

    (window as any).openModal('Detalles de XML Factura Electrónica', htmlBody, `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`, true);
  } catch (err: any) {
    (window as any).showToast(err.message, 'error');
  }
}

async function findThirdPartyByNit(rawNit: string) {
  if (!rawNit) return null;
  const nitStr = String(rawNit).trim();
  const cleanBase = nitStr.split('-')[0].replace(/[^0-9a-zA-Z]/g, '');
  const cleanDigits = nitStr.replace(/[^0-9a-zA-Z]/g, '');

  try {
    let res = await (window as any).pb.list('third_parties', {
      filter: `doc_number = "${nitStr}" || doc_number = "${cleanBase}" || doc_number = "${cleanDigits}"`,
      perPage: 1
    }).catch(() => ({ items: [] }));
    if (res.items && res.items.length) return res.items[0];

    if (cleanBase) {
      const all = await (window as any).pb.listAll('third_parties', {
        filter: `doc_number ~ "${cleanBase}"`
      }).catch(() => []);
      if (all && all.length) {
        const match = all.find((t: any) => {
          const tNum = (t.doc_number || '').replace(/[^0-9a-zA-Z]/g, '');
          return tNum === cleanBase || tNum === cleanDigits || tNum.includes(cleanBase);
        });
        if (match) return match;
      }
    }
  } catch (err) {
    console.warn('[findThirdPartyByNit] Error al buscar tercero:', err);
  }
  return null;
}

async function openDocHomologationModal(id: string) {
  try {
    const d = await (window as any).pb.get('electronic_documents', id);
    const items = await (window as any).pb.listAll('electronic_document_items', { filter: `document_id = "${id}"` });
    const taxes = await (window as any).pb.listAll('electronic_document_taxes', { filter: `document_id = "${id}"` });

    const NitLimpio = d.supplier_nit.split('-')[0].trim();
    let thirdParty = await findThirdPartyByNit(d.supplier_nit);

    const rules = await (window as any).pb.listAll('homologation_rules');
    const supplierRule = rules.find((r: any) => r.rule_type === 'supplier' && r.key_value === d.supplier_nit);

    const [allAccounts, txTypes, productsList, treasuryAccounts] = await Promise.all([
      (window as any).API.getAccounts(true),
      (window as any).pb.listAll('transaction_types', { filter: 'active=true' }),
      (window as any).pb.listAll('products', { filter: 'active=true', sort: 'name' }),
      (window as any).pb.listAll('bank_accounts', { filter: 'active=true', sort: 'name', expand: 'account_id' }).catch(() => [])
    ]);

    const paymentAccounts = allAccounts.filter((ac: any) => 
      ac.active !== false && 
      (ac.code.startsWith('1105') || ac.code.startsWith('1110') || ac.code.startsWith('1120'))
    ).sort((a: any, b: any) => a.code.localeCompare(b.code));

    const payableAccounts = allAccounts.filter((ac: any) => 
      ac.active !== false && 
      (ac.code.startsWith('22') || ac.code.startsWith('23'))
    ).sort((a: any, b: any) => a.code.localeCompare(b.code));

    const defPayableCode = await (window as any).API.getSetting('cde_default_payable_account').catch(() => '') || '220501';

    const calcSuggestedDueDate = (issueDateStr: string, days = 30) => {
      try {
        const dt = new Date((issueDateStr || (window as any).todayStr()) + 'T12:00:00');
        dt.setDate(dt.getDate() + days);
        return (window as any).getColombiaDateStr(dt);
      } catch {
        return issueDateStr || (window as any).todayStr();
      }
    };
    const suggestedDueDate = calcSuggestedDueDate(d.issue_date || d.date, 30);

    const defExpense = await (window as any).API.getSetting('cde_default_expense_account').catch(() => '') || '519530';
    const defInvAccount = await (window as any).API.getSetting('cde_default_inventory_account').catch(() => '') || '143501';
    const defaultExpenseCode = supplierRule?.account_code || defExpense;
    const isConsolidated = await (window as any).API.getSetting('cde_consolidate_accounting').catch(() => '') === 'true';

    const isThirdPartyExists = !!thirdParty;

    // Perfil Fiscal del Tercero para Retenciones
    const taxRegime = thirdParty?.tax_regime || 'COMUN';
    const isAutoRetenedor = taxRegime === 'AUTORRETENEDOR' || taxRegime === 'REGIMEN_SIMPLE';
    const isGranContribuyente = taxRegime === 'GRAN_CONTR';
    
    let suggestedReteRentaRate = 2.5;
    if (isAutoRetenedor) {
      suggestedReteRentaRate = 0;
    } else if (thirdParty?.person_type === 'NATURAL') {
      suggestedReteRentaRate = 3.5;
    }

    const isPurchaseDoc = d.document_type === 'invoice_purchase' || d.document_type === 'credit_note';

    const resolveInitialAccount = (it: any) => {
      if (it.unspsc_code) {
        const rUnspsc = rules.find((r: any) => r.rule_type === 'unspsc' && r.key_value === it.unspsc_code);
        if (rUnspsc) return rUnspsc.account_code;
      }
      const rKeyword = rules.find((r: any) => r.rule_type === 'keyword' && it.description?.toLowerCase().includes(r.key_value.toLowerCase()));
      if (rKeyword) return rKeyword.account_code;
      return defaultExpenseCode;
    };

    const resolveInitialProductMatch = (it: any) => {
      const ruleKey = `${d.supplier_nit}_${it.code}`;
      const ruleMatch = rules.find((r: any) => r.rule_type === 'keyword' && r.key_value === ruleKey);
      if (ruleMatch) {
        const foundByRule = productsList.find((p: any) => p.code.toLowerCase() === ruleMatch.account_code.toLowerCase());
        if (foundByRule) return foundByRule;
      }

      if (it.code) {
        const exactCode = productsList.find((p: any) => p.code.toLowerCase() === it.code.toLowerCase());
        if (exactCode) return exactCode;
      }

      return null;
    };

    const htmlBody = `
      <div class="space-y-4 text-xs">
        <!-- Encabezado Proveedor -->
        <div class="bg-slate-50 border rounded-xl p-3 grid grid-cols-2 md:grid-cols-4 gap-2">
          <div><span class="text-slate-400 block text-[10px]">PROVEEDOR</span> <strong>${(window as any).esc(d.supplier_name)}</strong> (NIT: ${(window as any).esc(d.supplier_nit)})</div>
          <div><span class="text-slate-400 block text-[10px]">DOCUMENTO NRO</span> <strong class="font-mono">${(window as any).esc(d.number)}</strong></div>
          <div><span class="text-slate-400 block text-[10px]">FECHA EMISIÓN</span> ${d.issue_date}</div>
          <div><span class="text-slate-400 block text-[10px]">VALOR TOTAL</span> <strong class="text-sm font-mono" style="color: #1A4B8C;">${(window as any).fmt(d.total)}</strong></div>
        </div>

        <!-- Alerta de Tercero y Perfil Fiscal -->
        <div id="cde-thirdparty-warning" class="p-3 rounded-xl border flex items-center justify-between ${isThirdPartyExists ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}">
          <div>
            <i class="fas ${isThirdPartyExists ? 'fa-circle-check' : 'fa-circle-exclamation'} mr-2"></i>
            <span>
              ${isThirdPartyExists ? `
                Tercero: <strong>${(window as any).esc(thirdParty.name)}</strong> | Régimen: <span class="badge ${isAutoRetenedor ? 'badge-blue' : 'badge-gray'} uppercase">${taxRegime}</span>
                ${isAutoRetenedor ? `<strong class="ml-1 text-indigo-700">(Exento ReteFuente)</strong>` : ''}
              ` : `El proveedor <strong>${(window as any).esc(d.supplier_name)}</strong> no está registrado en GRAVY.`}
            </span>
          </div>
          ${!isThirdPartyExists ? `
            <button class="btn btn-secondary btn-sm text-xs py-1 px-3" id="btn-cde-create-tp">
              <i class="fas fa-user-plus mr-1"></i> Registrar Tercero Automático
            </button>
          ` : ''}
        </div>

        <!-- Resumen de Impuestos Declarados en el XML (Múltiples Tarifas IVA 5%, 19%, etc.) -->
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div class="font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span><i class="fas fa-percent mr-1 text-indigo-600"></i> Tarifas de Impuestos Declaradas en XML</span>
            <span class="font-mono text-slate-500">Subtotal: ${(window as any).fmt(d.subtotal)} | IVA Total: ${(window as any).fmt(d.tax_amount)}</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
            ${taxes.length ? taxes.map((t: any) => `
              <div class="bg-white p-2 rounded-lg border flex justify-between items-center text-xs font-mono">
                <span class="font-bold text-indigo-900">${t.tax_type.toUpperCase()} (${t.rate}%)</span>
                <span>Base: ${(window as any).fmt(t.base)} <br><strong>Imp: ${(window as any).fmt(t.amount)}</strong></span>
              </div>
            `).join('') : '<div class="text-slate-400 text-xs italic">Sin impuestos declarados (0% Exento)</div>'}
          </div>
        </div>

        <!-- Selección Tipo de Documento ERP & Tipo de Transacción -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border">
          <div>
            <label class="block font-bold text-slate-700 mb-1">1. Clasificación del Documento</label>
            <select id="cde-doc-type-select" class="form-input w-full">
              <option value="invoice_purchase" ${d.document_type === 'invoice_purchase' ? 'selected' : ''}>Factura de Compra / Servicios</option>
              <option value="credit_note" ${d.document_type === 'credit_note' ? 'selected' : ''}>Nota Crédito de Proveedor</option>
              <option value="debit_note" ${d.document_type === 'debit_note' ? 'selected' : ''}>Nota Débito de Proveedor</option>
              <option value="support_document" ${d.document_type === 'support_document' ? 'selected' : ''}>Documento Soporte Electrónico</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">2. Tipo de Comprobante Contable (Serie ERP)</label>
            <select id="cde-tx-type-id" class="form-input w-full">
              ${txTypes.map((t: any) => {
                let isSel = false;
                if (d.document_type === 'credit_note' && (t.prefix === 'NC' || t.name.toLowerCase().includes('crédito'))) isSel = true;
                else if (d.document_type === 'debit_note' && (t.prefix === 'ND' || t.name.toLowerCase().includes('débito'))) isSel = true;
                else if (d.document_type === 'support_document' && (t.prefix === 'DS' || t.name.toLowerCase().includes('soporte'))) isSel = true;
                else if (d.document_type === 'invoice_purchase' && (t.prefix === 'FC' || t.name.toLowerCase().includes('compra'))) isSel = true;
                return `<option value="${t.id}" ${isSel ? 'selected' : ''}>[${t.prefix}] ${t.name}</option>`;
              }).join('')}
            </select>
          </div>
        </div>

        <!-- Selección de Forma de Pago: Contado vs Crédito y Medios de Pago / Cruce -->
        <div class="bg-indigo-50/40 border border-indigo-200 p-3 rounded-xl space-y-3">
          <div class="font-bold text-indigo-900 flex items-center justify-between text-xs">
            <span><i class="fas fa-wallet mr-1 text-indigo-600"></i> Forma y Medio de Pago de la Transacción</span>
            <span class="text-[10px] text-indigo-600 font-normal">Contado o Crédito Comercial</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold mb-1 text-slate-700">Forma de Pago</label>
              <select id="cde-payment-form" class="form-input w-full font-bold text-xs">
                <option value="CREDITO" ${(d.payment_form === '2' || d.payment_method === 'CREDITO') ? 'selected' : ''}>💳 A Crédito (Cuentas por Pagar CxP)</option>
                <option value="CONTADO" ${(d.payment_form === '1' || (d.payment_form !== '2' && d.payment_method !== 'CREDITO')) ? 'selected' : ''}>💵 De Contado (Pago Inmediato)</option>
              </select>
            </div>

            <!-- Modo CONTADO: Selección de Cuentas y Métodos Registrados en Tesorería -->
            <div id="cde-panel-contado" class="${(d.payment_form === '1' || (d.payment_form !== '2' && d.payment_method !== 'CREDITO')) ? '' : 'hidden'}">
              <label class="block font-semibold mb-1 text-slate-700">Cuenta y Método de Pago (Módulo de Tesorería)</label>
              <select id="cde-payment-account-id" class="form-input w-full font-mono text-xs font-semibold">
                ${treasuryAccounts.length ? treasuryAccounts.map((b: any) => {
                  const accCode = b.expand?.account_id?.code || '';
                  const extraNum = b.number ? ` N° ${b.number}` : '';
                  const pucTag = accCode ? ` — PUC: ${accCode}` : '';
                  return `
                    <option value="${b.id}">
                      🏦 ${(window as any).esc(b.name)}${(window as any).esc(extraNum)}${pucTag}
                    </option>
                  `;
                }).join('') : `
                  ${paymentAccounts.map((acc: any) => `
                    <option value="${acc.id}">
                      [${acc.code}] ${acc.name} (${acc.code.startsWith('1105') ? '💵 Efectivo / Caja' : '🏦 Banco / Tarjeta'})
                    </option>
                  `).join('')}
                `}
              </select>
            </div>

            <!-- Modo CRÉDITO: Cuenta CxP / Pasivo, Documento de Cruce y Fecha de Vencimiento -->
            <div id="cde-panel-credito" class="${(d.payment_form === '2' || d.payment_method === 'CREDITO') ? '' : 'hidden'} space-y-2">
              <div>
                <label class="block font-semibold mb-1 text-slate-700">Cuenta Pasivo / CxP (Proveedores 2205 / Gastos 2335)</label>
                <select id="cde-payable-account-code" class="form-input w-full font-mono text-xs font-semibold">
                  ${payableAccounts.map((acc: any) => `
                    <option value="${acc.code}" ${(acc.code === defPayableCode || (acc.code.startsWith('2205') && defPayableCode.startsWith('2205'))) ? 'selected' : ''}>
                      [${acc.code}] ${acc.name}
                    </option>
                  `).join('')}
                </select>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block font-semibold mb-1 text-slate-700">Doc. Cruce CxP</label>
                  <input type="text" id="cde-cross-doc-ref" class="form-input w-full font-mono text-xs font-bold" value="${(window as any).esc(d.number)}">
                </div>
                <div>
                  <label class="block font-semibold mb-1 text-slate-700">F. Vencimiento</label>
                  <input type="date" id="cde-due-date" class="form-input w-full font-mono text-xs" value="${suggestedDueDate}">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel de Retenciones Fiscales (ReteFuente, ReteIVA, ReteICA) -->
        <div class="bg-indigo-50/60 border border-indigo-200 p-3 rounded-xl space-y-2">
          <div class="flex items-center justify-between font-bold text-indigo-900">
            <span><i class="fas fa-hand-holding-dollar mr-1"></i> Retenciones Fiscales a Aplicar (Causación de Compra)</span>
            <span class="text-xs text-indigo-700 font-normal">Auto-deducido por perfil del tercero</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <!-- ReteFuente -->
            <div class="bg-white p-2.5 rounded-lg border border-indigo-100 flex flex-col justify-between space-y-1">
              <div class="flex items-center justify-between">
                <label for="cde-apply-reterenta" class="font-bold cursor-pointer select-none text-slate-700">ReteFuente (Renta)</label>
                <input type="checkbox" id="cde-apply-reterenta" class="w-4 h-4 accent-indigo-600 cursor-pointer" ${suggestedReteRentaRate > 0 ? 'checked' : ''}>
              </div>
              <div class="flex items-center gap-2">
                <input type="number" step="0.1" id="cde-rate-reterenta" class="form-input text-xs w-16 font-bold font-mono" value="${suggestedReteRentaRate}">
                <span class="text-xs font-mono">%</span>
                <span id="cde-val-reterenta" class="font-mono font-bold text-slate-800 ml-auto text-xs">$ 0</span>
              </div>
            </div>

            <!-- ReteIVA -->
            <div class="bg-white p-2.5 rounded-lg border border-indigo-100 flex flex-col justify-between space-y-1">
              <div class="flex items-center justify-between">
                <label for="cde-apply-reteiva" class="font-bold cursor-pointer select-none text-slate-700">ReteIVA (15% del IVA)</label>
                <input type="checkbox" id="cde-apply-reteiva" class="w-4 h-4 accent-indigo-600 cursor-pointer" ${isGranContribuyente ? 'checked' : ''}>
              </div>
              <div class="flex items-center gap-2">
                <input type="number" step="0.1" id="cde-rate-reteiva" class="form-input text-xs w-16 font-bold font-mono" value="15">
                <span class="text-xs font-mono">%</span>
                <span id="cde-val-reteiva" class="font-mono font-bold text-slate-800 ml-auto text-xs">$ 0</span>
              </div>
            </div>

            <!-- ReteICA -->
            <div class="bg-white p-2.5 rounded-lg border border-indigo-100 flex flex-col justify-between space-y-1">
              <div class="flex items-center justify-between">
                <label for="cde-apply-reteica" class="font-bold cursor-pointer select-none text-slate-700">ReteICA (x mil)</label>
                <input type="checkbox" id="cde-apply-reteica" class="w-4 h-4 accent-indigo-600 cursor-pointer">
              </div>
              <div class="flex items-center gap-2">
                <input type="number" step="0.01" id="cde-rate-reteica" class="form-input text-xs w-16 font-bold font-mono" value="9.66">
                <span class="text-xs font-mono">‰</span>
                <span id="cde-val-reteica" class="font-mono font-bold text-slate-800 ml-auto text-xs">$ 0</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-1 border-t border-indigo-200 text-xs font-semibold">
            <span>Total Retenciones: <strong id="cde-total-retenciones-val" class="font-mono text-amber-700">$ 0</strong></span>
            <span>Neto a Pagar Proveedor (CxP): <strong id="cde-neto-cxp-val" class="font-mono text-indigo-900 text-sm font-extrabold">${(window as any).fmt(d.total)}</strong></span>
          </div>
        </div>

        <!-- Checkbox de Contabilización Consolidada per Documento -->
        <div class="form-group flex items-center justify-between bg-indigo-50/70 border border-indigo-200 p-3 rounded-xl">
          <label for="cde-doc-consolidate" class="font-bold text-indigo-950 cursor-pointer flex items-center gap-2 select-none text-xs">
            <input type="checkbox" id="cde-doc-consolidate" class="w-4 h-4 accent-indigo-600 cursor-pointer" ${isConsolidated ? 'checked' : ''}>
            <span>Consolidar contabilización (Un solo asiento contable global para todo el documento)</span>
          </label>
        </div>

        <!-- Panel 1: Consolidado General (Modo Consolidado) -->
        <div id="cde-consolidated-panel" class="${isConsolidated ? '' : 'hidden'} border rounded-xl p-3 bg-white grid grid-cols-1 md:grid-cols-2 gap-3 items-center shadow-sm border-slate-200">
          <div>
            <div class="font-semibold text-slate-800">Consolidado General de Compra / Gasto</div>
            <div class="text-[10px] text-gray-500 mt-0.5">
              Se imputará el subtotal completo (${(window as any).fmt(d.subtotal)}) a una sola cuenta contable global.
            </div>
          </div>
          <div class="relative">
            <label class="block text-[10px] uppercase font-bold text-slate-600 mb-1">Cuenta PUC (Gasto / Activo)</label>
            <input type="text" 
                   class="form-input cde-account-search w-full text-xs font-mono" 
                   id="cde-acc-input-0" 
                   data-index="0" 
                   placeholder="Buscar cuenta PUC por código o nombre..." 
                   value="${defaultExpenseCode}">
            <input type="hidden" id="cde-acc-code-0" value="${defaultExpenseCode}">
            <div class="absolute bg-white border rounded-lg shadow-xl w-full hidden z-50 max-h-40 overflow-y-auto left-0 right-0 top-full mt-1" id="cde-acc-results-0"></div>
          </div>
        </div>

        <!-- Panel 2: Detallado por Ítems -->
        <div id="cde-itemized-panel" class="${isConsolidated ? 'hidden' : ''} space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div class="font-bold text-slate-800 text-sm">
              <i class="fas fa-boxes-stacked mr-1 text-indigo-600"></i> Asignación de Códigos ERP & Buscador Dinámico (${items.length} Ítems)
            </div>
            <div class="flex gap-1.5">
              <button class="btn btn-outline btn-xs py-1 px-2 text-[10px]" id="btn-cde-all-inv" title="Marcar todas las líneas como Inventario / Producto">
                <i class="fas fa-boxes-packing text-indigo-500 mr-1"></i>Todos a Inventario
              </button>
              <button class="btn btn-outline btn-xs py-1 px-2 text-[10px]" id="btn-cde-all-exp" title="Marcar todas las líneas como Servicio / Gasto">
                <i class="fas fa-receipt text-amber-500 mr-1"></i>Todos a Gasto
              </button>
            </div>
          </div>

          <!-- Opción global de Cálculo Automático de Precio 1 para Productos de esta Compra -->
          <div class="border p-3.5 rounded-xl bg-slate-50/80 border-slate-200">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-1">
              <div class="flex items-center gap-2">
                <input type="checkbox" id="cde-auto-calc-price-global" class="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer">
                <label for="cde-auto-calc-price-global" class="form-label mb-0 cursor-pointer font-bold text-gray-800 text-xs select-none">
                  <i class="fas fa-calculator mr-1 text-blue-600"></i> APLICAR FACTOR / MARGEN % PARA CALCULAR PRECIO 1 AUTOMÁTICAMENTE (OPCIONAL)
                </label>
              </div>
              <span id="cde-calc-preview-badge-global" class="text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                Sin cálculo automático
              </span>
            </div>

            <div id="cde-calc-container-global" class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3" style="display:none;">
              <div class="form-group mb-0">
                <label class="form-label text-xs">FACTOR O % MARGEN</label>
                <div class="relative">
                  <input id="cde-margin-factor-global" type="number" min="0" step="0.01" class="form-input text-xs text-right pr-7 font-bold" value="" placeholder="Ej: 30">
                  <span id="cde-margin-unit-label-global" class="absolute right-2.5 top-2 text-xs font-semibold text-gray-400">%</span>
                </div>
              </div>

              <div class="form-group mb-0">
                <label class="form-label text-xs">TIPO DE MARGEN</label>
                <select id="cde-margin-type-global" class="form-input text-xs font-medium">
                  <option value="MARKUP_COST" selected>Margen % sobre Costo (Markup)</option>
                  <option value="MARGIN_SALE">Margen % sobre Venta (Utilidad)</option>
                  <option value="FACTOR">Factor Multiplicador Directo (x N)</option>
                </select>
              </div>

              <div class="form-group mb-0">
                <label class="form-label text-xs">REGLA DE REDONDEO COMERCIAL</label>
                <select id="cde-rounding-type-global" class="form-input text-xs font-medium">
                  <option value="NEAREST_100" selected>A la centena más cercana ($100)</option>
                  <option value="NEAREST_1000">Al millar más cercano ($1,000)</option>
                  <option value="CEIL_100">Techo centena ($100 arriba)</option>
                  <option value="CEIL_1000">Techo millar ($1,000 arriba)</option>
                  <option value="NEAREST_10">A la decena más cercana ($10)</option>
                  <option value="NONE">Sin redondeo (Decimal exacto)</option>
                </select>
              </div>
            </div>
          </div>

          <div class="space-y-3 max-h-80 overflow-y-auto pr-1">
            ${items.map((it: any, index: number) => {
              const matchedProd = resolveInitialProductMatch(it);
              const initialMode = isPurchaseDoc ? 'inventory' : 'expense';
              const suggestedAcc = resolveInitialAccount(it);

              const initialSku = matchedProd ? matchedProd.code : (it.code || '');
              const initialProdText = matchedProd ? `${matchedProd.code} — ${matchedProd.name}` : '';
              const initialProdId = matchedProd ? matchedProd.id : '';

              return `
                <div class="border rounded-xl p-3 bg-white space-y-3 shadow-sm border-slate-200" id="cde-item-card-${index}">
                  <!-- Encabezado del Ítem XML -->
                  <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                    <div class="flex-1">
                      <span class="font-bold text-slate-800 text-xs">${index + 1}. ${(window as any).esc(it.description)}</span>
                      <div class="text-[10px] text-slate-500 font-mono mt-0.5">
                        Cód. Proveedor XML: <strong class="text-slate-700">${(window as any).esc(it.code || 'S/N')}</strong> 
                        ${it.unspsc_code ? ` | UNSPSC: ${it.unspsc_code}` : ''} | 
                        Cant: ${(window as any).fmtN(it.qty)} | Val Unit: ${(window as any).fmt(it.price)} | 
                        <strong>Subtotal: ${(window as any).fmt(it.subtotal)}</strong>
                      </div>
                    </div>
                    <!-- Dropdown de Tipo de Imputación -->
                    <div class="flex items-center gap-1">
                      <label class="text-[10px] font-bold text-slate-500">Destino:</label>
                      <select class="form-input text-xs py-1 px-2.5 font-bold cde-line-type-select ${initialMode === 'inventory' ? 'bg-indigo-50 text-indigo-700 border-indigo-300' : 'bg-amber-50 text-amber-700 border-amber-300'}" 
                              id="cde-line-type-${index}" data-index="${index}">
                        <option value="inventory" ${initialMode === 'inventory' ? 'selected' : ''}>📦 Producto / Inventario (Kardex)</option>
                        <option value="expense" ${initialMode === 'expense' ? 'selected' : ''}>📋 Servicio / Gasto (PUC)</option>
                      </select>
                    </div>
                  </div>

                  <!-- Panel MODO 1: Producto Inventario (Buscador Dinámico & SKU ERP) -->
                  <div id="cde-panel-inventory-${index}" class="${initialMode === 'inventory' ? '' : 'hidden'} space-y-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                      
                      <!-- Campo A: Código / Referencia Interna ERP -->
                      <div>
                        <label class="block text-[10px] uppercase font-bold text-indigo-900 mb-1">
                          <i class="fas fa-barcode mr-1 text-indigo-600"></i> Código / SKU Interno ERP
                        </label>
                        <input type="text" 
                               class="form-input w-full font-mono font-bold text-xs border-indigo-300 focus:border-indigo-600 bg-white" 
                               id="cde-prod-sku-${index}" 
                               placeholder="Ej. REF-1002" 
                               value="${(window as any).esc(initialSku)}">
                      </div>

                      <!-- Campo B: BUSCADOR DINÁMICO de Productos ERP en Vivo (Mouse & Teclado) -->
                      <div class="relative md:col-span-2">
                        <label class="block text-[10px] uppercase font-bold text-indigo-900 mb-1">
                          <i class="fas fa-magnifying-glass mr-1 text-indigo-600"></i> Buscador Dinámico de Producto ERP
                        </label>
                        <input type="text" 
                               class="form-input cde-product-search w-full text-xs bg-white font-medium" 
                               id="cde-prod-input-${index}" 
                               data-index="${index}" 
                               placeholder="Escribe código o nombre para buscar en catálogo ERP en vivo (usar flechas y Enter)..." 
                               value="${(window as any).esc(initialProdText)}">
                        <input type="hidden" id="cde-prod-id-${index}" value="${initialProdId}">
                        <div class="absolute bg-white border rounded-lg shadow-xl w-full hidden z-50 max-h-48 overflow-y-auto left-0 right-0 top-full mt-1" id="cde-prod-results-${index}"></div>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 border-t border-indigo-100">
                      <div class="relative">
                        <label class="block text-[10px] uppercase font-bold text-slate-600 mb-1">Cuenta PUC Inventario</label>
                        <input type="text" 
                               class="form-input cde-account-search w-full text-xs font-mono bg-white" 
                               id="cde-inv-acc-input-${index}" 
                               data-index="${index}" 
                               placeholder="Cuenta de inventario (ej. 143501)" 
                               value="${defInvAccount}">
                        <input type="hidden" id="cde-inv-acc-code-${index}" value="${defInvAccount}">
                        <div class="absolute bg-white border rounded-lg shadow-xl w-full hidden z-50 max-h-40 overflow-y-auto left-0 right-0 top-full mt-1" id="cde-inv-acc-results-${index}"></div>
                      </div>

                      <div class="flex items-center text-[11px] text-indigo-800 bg-white p-2 rounded-lg border border-indigo-200">
                        <i class="fas fa-info-circle text-indigo-500 mr-2 text-sm"></i>
                        <span>Si el producto no existe en el catálogo ERP, se creará automáticamente con el SKU especificado y su costo ${(window as any).fmt(it.price)}.</span>
                      </div>
                    </div>
                  </div>

                  <!-- Panel MODO 2: Cuenta PUC Servicio / Gasto -->
                  <div id="cde-panel-expense-${index}" class="${initialMode === 'expense' ? '' : 'hidden'} space-y-2 bg-amber-50/50 p-3 rounded-xl border border-amber-100 relative">
                    <label class="block text-[10px] uppercase font-bold text-amber-900 mb-1">
                      <i class="fas fa-book-bookmark mr-1 text-amber-600"></i> Cuenta Contable PUC (Gasto / Servicio)
                    </label>
                    <input type="text" 
                           class="form-input cde-account-search w-full text-xs font-mono bg-white" 
                           id="cde-acc-input-${index}" 
                           data-index="${index}" 
                           placeholder="Buscar código PUC (ej. 519530) o nombre..." 
                           value="${suggestedAcc}">
                    <input type="hidden" id="cde-acc-code-${index}" value="${suggestedAcc}">
                    <div class="absolute bg-white border rounded-lg shadow-xl w-full hidden z-50 max-h-40 overflow-y-auto left-0 right-0 top-full mt-1" id="cde-acc-results-${index}"></div>
                  </div>

                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2 border-t">
          <input type="checkbox" id="cde-save-rules" checked class="w-4 h-4 accent-indigo-600">
          <label for="cde-save-rules" class="cursor-pointer font-medium select-none text-slate-700">Recordar estos códigos SKU y cuentas PUC como reglas de homologación automáticas para este proveedor</label>
        </div>
      </div>
    `;

    const htmlFooter = `
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" id="btn-cde-submit-accounting" ${!isThirdPartyExists ? 'disabled' : ''}>
        <i class="fas fa-receipt mr-1"></i> Contabilizar Transacción
      </button>
    `;

    (window as any).openModal('Homologación & Asignación de Códigos ERP', htmlBody, htmlFooter, true);

    // Conmutador interactivo entre Forma de Pago Contado vs Crédito
    const paymentFormSelect = document.getElementById('cde-payment-form') as HTMLSelectElement;
    const panelContado = document.getElementById('cde-panel-contado');
    const panelCredito = document.getElementById('cde-panel-credito');

    paymentFormSelect?.addEventListener('change', () => {
      if (paymentFormSelect.value === 'CONTADO') {
        panelContado?.classList.remove('hidden');
        panelCredito?.classList.add('hidden');
      } else {
        panelCredito?.classList.remove('hidden');
        panelContado?.classList.add('hidden');
      }
    });

    // Conmutador interactivo entre modo Consolidado e Ítems Detallados
    const docConsolidateChk = document.getElementById('cde-doc-consolidate') as HTMLInputElement;
    const consolidatedPanel = document.getElementById('cde-consolidated-panel');
    const itemizedPanel = document.getElementById('cde-itemized-panel');

    docConsolidateChk?.addEventListener('change', () => {
      if (docConsolidateChk.checked) {
        consolidatedPanel?.classList.remove('hidden');
        itemizedPanel?.classList.add('hidden');
      } else {
        itemizedPanel?.classList.remove('hidden');
        consolidatedPanel?.classList.add('hidden');
      }
    });

    // Autocomplete para la cuenta consolidada global
    setupDynamicAccountAutocomplete(
      document.getElementById('cde-acc-input-0') as HTMLInputElement,
      document.getElementById('cde-acc-code-0') as HTMLInputElement,
      document.getElementById('cde-acc-results-0') as HTMLElement,
      allAccounts
    );

    // Cálculo dinámico en vivo de retenciones fiscales
    const updateRetentionsCalculation = () => {
      const docSubtotal = d.subtotal || 0;
      const docTaxesAmount = d.tax_amount || 0;
      const docTotal = d.total || 0;

      const applyRenta = (document.getElementById('cde-apply-reterenta') as HTMLInputElement)?.checked;
      const applyReteIva = (document.getElementById('cde-apply-reteiva') as HTMLInputElement)?.checked;
      const applyReteIca = (document.getElementById('cde-apply-reteica') as HTMLInputElement)?.checked;

      const rateRenta = parseFloat((document.getElementById('cde-rate-reterenta') as HTMLInputElement)?.value || '0') || 0;
      const rateReteIva = parseFloat((document.getElementById('cde-rate-reteiva') as HTMLInputElement)?.value || '0') || 0;
      const rateReteIca = parseFloat((document.getElementById('cde-rate-reteica') as HTMLInputElement)?.value || '0') || 0;

      const valRenterenta = applyRenta ? Math.round(docSubtotal * (rateRenta / 100)) : 0;
      const valReteIva = applyReteIva ? Math.round(docTaxesAmount * (rateReteIva / 100)) : 0;
      const valReteIca = applyReteIca ? Math.round(docSubtotal * (rateReteIca / 1000)) : 0;

      const totalRetenciones = valRenterenta + valReteIva + valReteIca;
      const netoCxP = docTotal - totalRetenciones;

      const elValRenta = document.getElementById('cde-val-reterenta');
      const elValReteIva = document.getElementById('cde-val-reteiva');
      const elValReteIca = document.getElementById('cde-val-reteica');
      const elTotalRet = document.getElementById('cde-total-retenciones-val');
      const elNetoCxP = document.getElementById('cde-neto-cxp-val');

      if (elValRenta) elValRenta.textContent = (window as any).fmt(valRenterenta);
      if (elValReteIva) elValReteIva.textContent = (window as any).fmt(valReteIva);
      if (elValReteIca) elValReteIca.textContent = (window as any).fmt(valReteIca);
      if (elTotalRet) elTotalRet.textContent = (window as any).fmt(totalRetenciones);
      if (elNetoCxP) elNetoCxP.textContent = (window as any).fmt(netoCxP);
    };

    ['cde-apply-reterenta', 'cde-apply-reteiva', 'cde-apply-reteica', 'cde-rate-reterenta', 'cde-rate-reteiva', 'cde-rate-reteica'].forEach(idEl => {
      const el = document.getElementById(idEl);
      el?.addEventListener('change', updateRetentionsCalculation);
      el?.addEventListener('input', updateRetentionsCalculation);
    });

    updateRetentionsCalculation();

    // Cálculo dinámico en vivo de Precio 1 global opcional para productos de la compra
    const updateCdeAutoCalcPriceGlobal = () => {
      const chk = document.getElementById('cde-auto-calc-price-global') as HTMLInputElement;
      const container = document.getElementById('cde-calc-container-global');
      const badge = document.getElementById('cde-calc-preview-badge-global');
      const unitLabel = document.getElementById('cde-margin-unit-label-global');
      const marginTypeSelect = document.getElementById('cde-margin-type-global') as HTMLSelectElement;
      const factorInput = document.getElementById('cde-margin-factor-global') as HTMLInputElement;
      const roundingTypeSelect = document.getElementById('cde-rounding-type-global') as HTMLSelectElement;

      const isChecked = chk?.checked || false;
      if (container) container.style.display = isChecked ? '' : 'none';
      if (unitLabel && marginTypeSelect) {
        unitLabel.textContent = marginTypeSelect.value === 'FACTOR' ? 'x' : '%';
      }

      if (!isChecked) {
        if (badge) {
          badge.className = 'text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-100 text-gray-600 border border-gray-200';
          badge.textContent = 'Sin cálculo automático';
        }
        return;
      }

      const factor = parseFloat(factorInput?.value || '0') || 0;
      const marginType = marginTypeSelect?.value || 'MARKUP_COST';
      const roundingType = roundingTypeSelect?.value || 'NEAREST_100';

      if (factor <= 0) {
        if (badge) {
          badge.className = 'text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200';
          badge.textContent = 'Ingresa Factor / Margen > 0 para calcular';
        }
        return;
      }

      const sampleItem = items.find((it: any) => (it.price || 0) > 0) || items[0];
      const sampleCost = sampleItem ? Number(sampleItem.price) || 0 : 0;

      if (sampleCost > 0) {
        const calcResult = calculateSalePriceFromCost(sampleCost, factor, marginType, roundingType);
        if (badge) {
          const typeStr = marginType === 'MARGIN_SALE' ? 's/Venta' : marginType === 'FACTOR' ? 'Mult.' : 'Markup';
          badge.className = 'text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200';
          badge.innerHTML = `<i class="fas fa-check-circle mr-1 text-blue-600"></i>Ejemplo Precio 1: ${(window as any).fmt(calcResult.price)} <span class="opacity-80 font-normal ml-1">(Ganancia: ${(window as any).fmt(calcResult.profit)} · ${calcResult.marginOnSalePercent.toFixed(1)}% ${typeStr})</span>`;
        }
      } else {
        if (badge) {
          badge.className = 'text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200';
          badge.textContent = 'Cálculo automático activo para la compra';
        }
      }
    };

    ['cde-auto-calc-price-global', 'cde-margin-factor-global', 'cde-margin-type-global', 'cde-rounding-type-global'].forEach(idEl => {
      const el = document.getElementById(idEl);
      el?.addEventListener('change', updateCdeAutoCalcPriceGlobal);
      el?.addEventListener('input', updateCdeAutoCalcPriceGlobal);
    });

    updateCdeAutoCalcPriceGlobal();

    // Batch Selectors
    document.getElementById('btn-cde-all-inv')?.addEventListener('click', () => {
      items.forEach((_, idx) => {
        const sel = document.getElementById(`cde-line-type-${idx}`) as HTMLSelectElement;
        if (sel) {
          sel.value = 'inventory';
          sel.dispatchEvent(new Event('change'));
        }
      });
    });

    document.getElementById('btn-cde-all-exp')?.addEventListener('click', () => {
      items.forEach((_, idx) => {
        const sel = document.getElementById(`cde-line-type-${idx}`) as HTMLSelectElement;
        if (sel) {
          sel.value = 'expense';
          sel.dispatchEvent(new Event('change'));
        }
      });
    });

    // Dynamic Tx Type Selector matching Document Type change
    const docTypeSelect = document.getElementById('cde-doc-type-select') as HTMLSelectElement;
    const txTypeSelect = document.getElementById('cde-tx-type-id') as HTMLSelectElement;

    docTypeSelect?.addEventListener('change', () => {
      const selectedType = docTypeSelect.value;
      let matchedId = '';

      for (let i = 0; i < txTypeSelect.options.length; i++) {
        const opt = txTypeSelect.options[i];
        const text = opt.text.toUpperCase();
        if (selectedType === 'credit_note' && (text.includes('[NC]') || text.includes('CRÉDITO'))) { matchedId = opt.value; break; }
        if (selectedType === 'debit_note' && (text.includes('[ND]') || text.includes('DÉBITO'))) { matchedId = opt.value; break; }
        if (selectedType === 'support_document' && (text.includes('[DS]') || text.includes('SOPORTE'))) { matchedId = opt.value; break; }
        if (selectedType === 'invoice_purchase' && (text.includes('[FC]') || text.includes('COMPRA'))) { matchedId = opt.value; break; }
      }

      if (matchedId) txTypeSelect.value = matchedId;
    });

    // Event listener para crear Tercero
    if (!isThirdPartyExists) {
      document.getElementById('btn-cde-create-tp')?.addEventListener('click', async () => {
        try {
          let parsedDetails: any = {};
          if (d.supplier_details) {
            try {
              parsedDetails = JSON.parse(d.supplier_details);
            } catch (errParse) {
              console.warn('Error parsing supplier details:', errParse);
            }
          }

          const payload = {
            name: d.supplier_name,
            doc_type: 'NIT',
            doc_number: NitLimpio,
            type: 'PROVEEDOR',
            person_type: parsedDetails.person_type || (NitLimpio.length >= 9 ? 'JURIDICA' : 'NATURAL'),
            active: true,
            email: parsedDetails.email || '',
            phone: parsedDetails.phone || '',
            address: parsedDetails.address || '',
            city: parsedDetails.city || '',
            department: parsedDetails.department || '',
            country: parsedDetails.country || 'CO',
            dv: parsedDetails.dv || '',
            tax_regime: parsedDetails.tax_regime || 'COMUN'
          };
          thirdParty = await (window as any).pb.create('third_parties', payload);
          (window as any).showToast('Tercero registrado exitosamente', 'success');

          const warnBanner = document.getElementById('cde-thirdparty-warning');
          if (warnBanner) {
            warnBanner.className = "p-3 rounded-xl border flex items-center justify-between bg-emerald-50 border-emerald-200 text-emerald-800";
            warnBanner.innerHTML = `<div><i class="fas fa-circle-check mr-2"></i>Tercero registrado: <strong>${(window as any).esc(payload.name)}</strong></div>`;
          }
          const submitBtn = document.getElementById('btn-cde-submit-accounting') as HTMLButtonElement;
          if (submitBtn) submitBtn.disabled = false;
        } catch (err: any) {
          (window as any).showToast(err.message, 'error');
        }
      });
    }

    // Vinculación de Autocompletes Dinámicos para ítems
    items.forEach((_, index: number) => {
      const typeSelect = document.getElementById(`cde-line-type-${index}`) as HTMLSelectElement;
      const expensePanel = document.getElementById(`cde-panel-expense-${index}`);
      const inventoryPanel = document.getElementById(`cde-panel-inventory-${index}`);

      typeSelect?.addEventListener('change', () => {
        if (typeSelect.value === 'inventory') {
          typeSelect.className = 'form-input text-xs py-1 px-2.5 font-bold cde-line-type-select bg-indigo-50 text-indigo-700 border-indigo-300';
          expensePanel?.classList.add('hidden');
          inventoryPanel?.classList.remove('hidden');
        } else {
          typeSelect.className = 'form-input text-xs py-1 px-2.5 font-bold cde-line-type-select bg-amber-50 text-amber-700 border-amber-300';
          inventoryPanel?.classList.add('hidden');
          expensePanel?.classList.remove('hidden');
        }
      });

      // 1. Autocomplete Cuentas PUC (Gasto/Servicio)
      setupDynamicAccountAutocomplete(
        document.getElementById(`cde-acc-input-${index}`) as HTMLInputElement,
        document.getElementById(`cde-acc-code-${index}`) as HTMLInputElement,
        document.getElementById(`cde-acc-results-${index}`) as HTMLElement,
        allAccounts
      );

      // 2. Autocomplete Cuentas PUC (Inventario)
      setupDynamicAccountAutocomplete(
        document.getElementById(`cde-inv-acc-input-${index}`) as HTMLInputElement,
        document.getElementById(`cde-inv-acc-code-${index}`) as HTMLInputElement,
        document.getElementById(`cde-inv-acc-results-${index}`) as HTMLElement,
        allAccounts
      );

      // 3. Autocomplete Productos ERP (Buscador Dinámico en tiempo real para Productos)
      setupDynamicProductAutocomplete(
        document.getElementById(`cde-prod-input-${index}`) as HTMLInputElement,
        document.getElementById(`cde-prod-id-${index}`) as HTMLInputElement,
        document.getElementById(`cde-prod-sku-${index}`) as HTMLInputElement,
        document.getElementById(`cde-prod-results-${index}`) as HTMLElement,
        productsList
      );
    });

    // Acción Final de Contabilización
    document.getElementById('btn-cde-submit-accounting')?.addEventListener('click', async () => {
      const chosenDocType = (document.getElementById('cde-doc-type-select') as HTMLSelectElement).value;
      const txTypeId = (document.getElementById('cde-tx-type-id') as HTMLSelectElement).value;
      const saveRules = (document.getElementById('cde-save-rules') as HTMLInputElement).checked;

      if (!thirdParty || !thirdParty.id) {
        thirdParty = await findThirdPartyByNit(d.supplier_nit);
      }
      if (!thirdParty || !thirdParty.id) {
        return (window as any).showToast(`El proveedor ${d.supplier_name} (NIT: ${d.supplier_nit}) debe estar registrado en el sistema para poder contabilizar.`, 'error');
      }

      const isConsolidatedDoc = (document.getElementById('cde-doc-consolidate') as HTMLInputElement)?.checked;

      const lines: any[] = [];
      const inventoryItemsToProcess: any[] = [];

      const isCreditNote = chosenDocType === 'credit_note';

      if (isConsolidatedDoc) {
        const code = (document.getElementById(`cde-acc-code-0`) as HTMLInputElement).value;
        const accQuery = await (window as any).pb.list('accounts', { filter: `code="${code}"`, perPage: 1 });
        if (!accQuery.items.length) {
          return (window as any).showToast(`La cuenta contable ${code} no existe en el PUC.`, 'error');
        }

        const lineAccId = accQuery.items[0].id;
        const subtotalVal = d.subtotal;

        if (isCreditNote) {
          lines.push({ account_id: lineAccId, third_party_id: thirdParty.id, debit: 0, credit: subtotalVal, description: `Nota Crédito XML Consolidada: ${d.supplier_name}` });
        } else {
          lines.push({ account_id: lineAccId, third_party_id: thirdParty.id, debit: subtotalVal, credit: 0, description: `Compra/Gasto XML Consolidado: ${d.supplier_name}` });
        }

        if (saveRules) {
          saveOrUpdateRule('supplier', d.supplier_nit, code, `Regla consolidada de ${d.supplier_name}`);
        }
      } else {
        const isGlobalCalcPrice = (document.getElementById('cde-auto-calc-price-global') as HTMLInputElement)?.checked || false;
        const globalMarginFactor = parseFloat((document.getElementById('cde-margin-factor-global') as HTMLInputElement)?.value || '0') || 0;
        const globalMarginType = (document.getElementById('cde-margin-type-global') as HTMLSelectElement)?.value || 'MARKUP_COST';
        const globalRoundingType = (document.getElementById('cde-rounding-type-global') as HTMLSelectElement)?.value || 'NEAREST_100';

        for (let index = 0; index < items.length; index++) {
          const it = items[index];
          const lineTypeSelect = document.getElementById(`cde-line-type-${index}`) as HTMLSelectElement;
          const isInv = lineTypeSelect?.value === 'inventory';

          let lineAccId = '';

          if (isInv) {
            const prodIdVal = (document.getElementById(`cde-prod-id-${index}`) as HTMLInputElement).value;
            const prodSkuVal = (document.getElementById(`cde-prod-sku-${index}`) as HTMLInputElement)?.value.trim() || it.code || `PROD-${Date.now()}`;
            const invAccCodeVal = (document.getElementById(`cde-inv-acc-code-${index}`) as HTMLInputElement)?.value || defInvAccount;

            let productRecord: any = null;

            if (prodIdVal) {
              productRecord = productsList.find((p: any) => p.id === prodIdVal);
            } else if (prodSkuVal) {
              const safeCode = (window as any).pb.escapeFilterValue(prodSkuVal);
              const exProd = await (window as any).pb.list('products', { filter: `code="${safeCode}"`, perPage: 1 });
              if (exProd.items.length) {
                productRecord = exProd.items[0];
              }
            }

            const invAccQuery = await (window as any).pb.list('accounts', { filter: `code="${invAccCodeVal}"`, perPage: 1 });
            const invAccIdResolved = invAccQuery.items[0]?.id || '';

            const unitCost = Number(it.price) || 0;
            let computedBasePrice = unitCost > 0 ? unitCost * 1.3 : 0;
            let isAutoCalc = false;
            let marginFactorToUse = 0;
            let marginTypeToUse = 'MARKUP_COST';
            let roundingTypeToUse = 'NEAREST_100';

            if (isGlobalCalcPrice && globalMarginFactor > 0) {
              isAutoCalc = true;
              marginFactorToUse = globalMarginFactor;
              marginTypeToUse = globalMarginType;
              roundingTypeToUse = globalRoundingType;
              const res = calculateSalePriceFromCost(unitCost, globalMarginFactor, globalMarginType, globalRoundingType);
              if (res.price > 0) computedBasePrice = res.price;
            } else if (productRecord && productRecord.auto_calc_price && productRecord.margin_factor > 0) {
              isAutoCalc = true;
              marginFactorToUse = productRecord.margin_factor;
              marginTypeToUse = productRecord.margin_type || 'MARKUP_COST';
              roundingTypeToUse = productRecord.rounding_type || 'NEAREST_100';
              const res = calculateSalePriceFromCost(unitCost, marginFactorToUse, marginTypeToUse, roundingTypeToUse);
              if (res.price > 0) computedBasePrice = res.price;
            }

            if (!productRecord) {
              productRecord = await (window as any).pb.create('products', {
                code: prodSkuVal,
                name: it.description,
                description: `Producto cargado desde XML DIAN — Proveedor ${d.supplier_name}`,
                type: 'BIEN',
                unit: '94',
                unspsc_code: it.unspsc_code || '',
                active: true,
                cost_price: unitCost,
                base_price: computedBasePrice,
                auto_calc_price: isAutoCalc,
                margin_factor: marginFactorToUse > 0 ? marginFactorToUse : null,
                margin_type: marginTypeToUse,
                rounding_type: roundingTypeToUse,
                inventory_account_id: invAccIdResolved
              });
            } else {
              const updateData: any = {
                cost_price: unitCost
              };
              if (isAutoCalc || (isGlobalCalcPrice && globalMarginFactor > 0)) {
                updateData.base_price = computedBasePrice;
                updateData.auto_calc_price = isAutoCalc;
                if (marginFactorToUse > 0) updateData.margin_factor = marginFactorToUse;
                updateData.margin_type = marginTypeToUse;
                updateData.rounding_type = roundingTypeToUse;
              }
              await (window as any).pb.update('products', productRecord.id, updateData).catch((errUp: any) => {
                console.warn('Error updating existing product price on purchase contabilización:', errUp);
              });
            }

            lineAccId = productRecord.inventory_account_id || invAccIdResolved;
            if (!lineAccId) {
              const fallbackAcc = await (window as any).pb.list('accounts', { filter: `code="${defInvAccount}"`, perPage: 1 });
              lineAccId = fallbackAcc.items[0]?.id || '';
            }

            inventoryItemsToProcess.push({
              item: it,
              product_id: productRecord.id,
              sku: prodSkuVal
            });

            if (saveRules && it.code) {
              const ruleKey = `${d.supplier_nit}_${it.code}`;
              saveOrUpdateRule('keyword', ruleKey, prodSkuVal, `Homologación ítem XML ${it.code} -> SKU ERP ${prodSkuVal}`);
            }

          } else {
            const code = (document.getElementById(`cde-acc-code-${index}`) as HTMLInputElement).value;
            const accQuery = await (window as any).pb.list('accounts', { filter: `code="${code}"`, perPage: 1 });
            if (!accQuery.items.length) {
              return (window as any).showToast(`La cuenta contable ${code} no existe en el PUC.`, 'error');
            }
            lineAccId = accQuery.items[0].id;

            if (saveRules) {
              if (it.unspsc_code) {
                saveOrUpdateRule('unspsc', it.unspsc_code, code, `Regla UNSPSC ${it.unspsc_code}`);
              } else {
                saveOrUpdateRule('supplier', d.supplier_nit, code, `Regla de ${d.supplier_name}`);
              }
            }
          }

          if (isCreditNote) {
            lines.push({ account_id: lineAccId, third_party_id: thirdParty.id, debit: 0, credit: it.subtotal, description: `NC XML [${isInv ? 'INV' : 'GASTO'}]: ${it.description}` });
          } else {
            lines.push({ account_id: lineAccId, third_party_id: thirdParty.id, debit: it.subtotal, credit: 0, description: `Compra XML [${isInv ? 'INV' : 'GASTO'}]: ${it.description}` });
          }
        }
      }

      // Impuestos
      const iva19Code = await (window as any).API.getSetting('cde_iva_19_account').catch(() => '') || '240810';
      const iva5Code = await (window as any).API.getSetting('cde_iva_5_account').catch(() => '') || '240805';
      const otherTaxesCode = await (window as any).API.getSetting('cde_other_taxes_account').catch(() => '') || '240890';

      for (const tax of taxes) {
        if (!tax.amount) continue;
        let taxCode = otherTaxesCode;
        if (tax.tax_type === 'iva') {
          const rateVal = parseFloat(tax.rate) || 0;
          if (Math.abs(rateVal - 19) < 0.1) {
            taxCode = iva19Code;
          } else if (Math.abs(rateVal - 5) < 0.1) {
            taxCode = iva5Code;
          }
        }

        let taxAcc = await (window as any).pb.list('accounts', { filter: `code="${taxCode}"`, perPage: 1 });
        if (!taxAcc.items.length) {
          taxAcc = await (window as any).pb.list('accounts', { filter: `code="240810"`, perPage: 1 });
        }

        if (taxAcc.items.length) {
          if (isCreditNote) {
            lines.push({ account_id: taxAcc.items[0].id, third_party_id: thirdParty.id, debit: 0, credit: tax.amount, description: `${tax.tax_type.toUpperCase()} (${tax.rate}%) NC ${d.number}` });
          } else {
            lines.push({ account_id: taxAcc.items[0].id, third_party_id: thirdParty.id, debit: tax.amount, credit: 0, description: `${tax.tax_type.toUpperCase()} (${tax.rate}%) Factura ${d.number}` });
          }
        }
      }

      // Retenciones
      const docSubtotal = d.subtotal || 0;
      const docTaxesAmount = d.tax_amount || 0;

      const applyRenta = (document.getElementById('cde-apply-reterenta') as HTMLInputElement)?.checked;
      const applyReteIva = (document.getElementById('cde-apply-reteiva') as HTMLInputElement)?.checked;
      const applyReteIca = (document.getElementById('cde-apply-reteica') as HTMLInputElement)?.checked;

      const rateRenta = parseFloat((document.getElementById('cde-rate-reterenta') as HTMLInputElement)?.value || '0') || 0;
      const rateReteIva = parseFloat((document.getElementById('cde-rate-reteiva') as HTMLInputElement)?.value || '0') || 0;
      const rateReteIca = parseFloat((document.getElementById('cde-rate-reteica') as HTMLInputElement)?.value || '0') || 0;

      const valRenterenta = applyRenta ? Math.round(docSubtotal * (rateRenta / 100)) : 0;
      const valReteIva = applyReteIva ? Math.round(docTaxesAmount * (rateReteIva / 100)) : 0;
      const valReteIca = applyReteIca ? Math.round(docSubtotal * (rateReteIca / 1000)) : 0;

      const totalRetenciones = valRenterenta + valReteIva + valReteIca;
      const netPayableTotal = d.total - totalRetenciones;

      if (valRenterenta > 0) {
        const accRenta = await (window as any).pb.list('accounts', { filter: `code="236540"`, perPage: 1 }).catch(() => ({ items: [] }));
        const accRentaId = accRenta.items[0]?.id || (await (window as any).pb.list('accounts', { filter: `code="236505"`, perPage: 1 })).items[0]?.id;
        if (accRentaId) {
          if (isCreditNote) {
            lines.push({ account_id: accRentaId, third_party_id: thirdParty.id, debit: valRenterenta, credit: 0, description: `Reversión ReteFuente (${rateRenta}%) NC ${d.number}` });
          } else {
            lines.push({ account_id: accRentaId, third_party_id: thirdParty.id, debit: 0, credit: valRenterenta, description: `Retención en la Fuente (${rateRenta}%) Factura ${d.number}` });
          }
        }
      }

      if (valReteIva > 0) {
        const accReteIva = await (window as any).pb.list('accounts', { filter: `code="236701"`, perPage: 1 }).catch(() => ({ items: [] }));
        const accReteIvaId = accReteIva.items[0]?.id;
        if (accReteIvaId) {
          if (isCreditNote) {
            lines.push({ account_id: accReteIvaId, third_party_id: thirdParty.id, debit: valReteIva, credit: 0, description: `Reversión ReteIVA (${rateReteIva}%) NC ${d.number}` });
          } else {
            lines.push({ account_id: accReteIvaId, third_party_id: thirdParty.id, debit: 0, credit: valReteIva, description: `ReteIVA (${rateReteIva}%) Factura ${d.number}` });
          }
        }
      }

      if (valReteIca > 0) {
        const accReteIca = await (window as any).pb.list('accounts', { filter: `code="236801"`, perPage: 1 }).catch(() => ({ items: [] }));
        const accReteIcaId = accReteIca.items[0]?.id;
        if (accReteIcaId) {
          if (isCreditNote) {
            lines.push({ account_id: accReteIcaId, third_party_id: thirdParty.id, debit: valReteIca, credit: 0, description: `Reversión ReteICA (${rateReteIca}‰) NC ${d.number}` });
          } else {
            lines.push({ account_id: accReteIcaId, third_party_id: thirdParty.id, debit: 0, credit: valReteIca, description: `ReteICA (${rateReteIca}‰) Factura ${d.number}` });
          }
        }
      }

      // Forma de Pago (Contado vs Crédito) y Tesorería / Cruce CxP
      const paymentFormMode = (document.getElementById('cde-payment-form') as HTMLSelectElement)?.value || 'CREDITO';
      const selectedPaymentAccountId = (document.getElementById('cde-payment-account-id') as HTMLSelectElement)?.value;
      const crossDocRefVal = (document.getElementById('cde-cross-doc-ref') as HTMLInputElement)?.value.trim() || d.number;
      const dueDateVal = (document.getElementById('cde-due-date') as HTMLInputElement)?.value || d.issue_date;

      if (paymentFormMode === 'CONTADO') {
        if (!selectedPaymentAccountId) {
          return (window as any).showToast('Debes seleccionar un método o cuenta de tesorería para la compra de contado.', 'error');
        }

        let cashAccId = '';
        let cashAccName = 'Tesorería';

        // 1. Resolver desde Cuentas/Métodos de Tesorería (bank_accounts)
        const selectedTreasury = treasuryAccounts.find((b: any) => b.id === selectedPaymentAccountId);
        if (selectedTreasury) {
          cashAccName = selectedTreasury.name;
          cashAccId = selectedTreasury.account_id || selectedTreasury.expand?.account_id?.id || '';
          if (!cashAccId && selectedTreasury.expand?.account_id?.code) {
            const accRes = await (window as any).pb.list('accounts', { filter: `code="${selectedTreasury.expand.account_id.code}"`, perPage: 1 }).catch(() => ({ items: [] }));
            cashAccId = accRes.items[0]?.id || '';
          }
        }

        // 2. Fallback a selección directa de cuenta PUC
        if (!cashAccId) {
          const directPuc = paymentAccounts.find((a: any) => a.id === selectedPaymentAccountId);
          if (directPuc) {
            cashAccId = directPuc.id;
            cashAccName = directPuc.name;
          }
        }

        // 3. Fallback a 110505
        if (!cashAccId) {
          const fallbackCaja = await (window as any).pb.list('accounts', { filter: `code="110505"`, perPage: 1 }).catch(() => ({ items: [] }));
          cashAccId = fallbackCaja.items[0]?.id || '';
        }

        if (!cashAccId) {
          return (window as any).showToast('La cuenta de tesorería seleccionada no tiene una cuenta PUC auxiliar (1105 / 1110) vinculada.', 'error');
        }

        if (isCreditNote) {
          lines.push({
            account_id: cashAccId,
            third_party_id: thirdParty.id,
            debit: netPayableTotal,
            credit: 0,
            description: `Reembolso de Contado (${cashAccName}) NC ${d.number}`
          });
        } else {
          lines.push({
            account_id: cashAccId,
            third_party_id: thirdParty.id,
            debit: 0,
            credit: netPayableTotal,
            description: `Pago de Contado (${cashAccName}) Factura ${d.number}`
          });
        }
      } else {
        // A Crédito: Imputación a Pasivo (Proveedores 2205 / Gastos 2335) con documento de cruce
        const payAccCode = (document.getElementById('cde-payable-account-code') as HTMLSelectElement)?.value || 
                          await (window as any).API.getSetting('cde_default_payable_account').catch(() => '') || '220501';
        const payAcc = await (window as any).pb.list('accounts', { filter: `code="${payAccCode}"`, perPage: 1 });
        if (!payAcc.items.length) {
          return (window as any).showToast(`La cuenta de pasivo/proveedores ${payAccCode} no existe en el PUC.`, 'error');
        }

        if (isCreditNote) {
          lines.push({
            account_id: payAcc.items[0].id,
            third_party_id: thirdParty.id,
            debit: netPayableTotal,
            credit: 0,
            description: `Disminución CxP Proveedor ${d.supplier_name} - NC ${d.number}`,
            cross_doc_ref: crossDocRefVal,
            cross_doc_date: d.issue_date,
            due_date: dueDateVal,
            doc_cruce: crossDocRefVal,
            fecha_doc_cruce: d.issue_date,
            fecha_vencimiento: dueDateVal
          });
        } else {
          lines.push({
            account_id: payAcc.items[0].id,
            third_party_id: thirdParty.id,
            debit: 0,
            credit: netPayableTotal,
            description: `CxP Proveedor ${d.supplier_name} - Factura ${d.number}`,
            cross_doc_ref: crossDocRefVal,
            cross_doc_date: d.issue_date,
            due_date: dueDateVal,
            doc_cruce: crossDocRefVal,
            fecha_doc_cruce: d.issue_date,
            fecha_vencimiento: dueDateVal
          });
        }
      }

      const txPayload = {
        tx_type_id: txTypeId,
        number: 'AUTO',
        date: d.issue_date,
        description: `Contabilización automática XML DIAN: Doc ${d.number} (${d.supplier_name})`,
        third_party_id: thirdParty.id,
        cross_doc_ref: paymentFormMode === 'CREDITO' ? crossDocRefVal : '',
        cross_enabled: paymentFormMode === 'CREDITO',
        status: 'active',
        user_id: (window as any).pb.currentUser?.id || ''
      };

      const submitAccountingBtn = document.getElementById('btn-cde-submit-accounting') as HTMLButtonElement;
      if (submitAccountingBtn) {
        submitAccountingBtn.disabled = true;
        submitAccountingBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Procesando...`;
      }

      try {
        // Agrupar movimientos contables por cuenta PUC (account_id) para resumir el asiento contable
        const aggregateAccountingLines = (rawLines: any[]) => {
          const accMap = new Map<string, { account_id: string; debit: number; credit: number; descriptions: string[]; count: number; cross_doc_ref?: string; cross_doc_date?: string; due_date?: string; doc_cruce?: string; fecha_doc_cruce?: string; fecha_vencimiento?: string }>();

          for (const line of rawLines) {
            if (!line.account_id) continue;
            const key = line.account_id;
            const docRef = line.cross_doc_ref || line.doc_cruce || '';
            const docDate = line.cross_doc_date || line.fecha_doc_cruce || '';
            const dueDate = line.due_date || line.fecha_vencimiento || '';

            if (accMap.has(key)) {
              const item = accMap.get(key)!;
              item.debit += line.debit || 0;
              item.credit += line.credit || 0;
              item.count += 1;
              if (line.description && !item.descriptions.includes(line.description)) {
                item.descriptions.push(line.description);
              }
              if (docRef && !item.cross_doc_ref) {
                item.cross_doc_ref = docRef;
                item.doc_cruce = docRef;
              }
              if (docDate && !item.cross_doc_date) {
                item.cross_doc_date = docDate;
                item.fecha_doc_cruce = docDate;
              }
              if (dueDate && !item.due_date) {
                item.due_date = dueDate;
                item.fecha_vencimiento = dueDate;
              }
            } else {
              accMap.set(key, {
                account_id: line.account_id,
                debit: line.debit || 0,
                credit: line.credit || 0,
                descriptions: line.description ? [line.description] : [],
                count: 1,
                cross_doc_ref: docRef,
                cross_doc_date: docDate,
                due_date: dueDate,
                doc_cruce: docRef,
                fecha_doc_cruce: docDate,
                fecha_vencimiento: dueDate
              });
            }
          }

          return Array.from(accMap.values()).map(item => {
            let desc = item.descriptions[0] || `Causación CDE — Doc ${d.number}`;
            if (item.count > 1) {
              const cleanBase = desc.split(':')[0] || 'Causación CDE';
              desc = `${cleanBase} (${item.count} ítems acumulados — Doc ${d.number})`;
            }
            return {
              account_id: item.account_id,
              debit: Math.round(item.debit),
              credit: Math.round(item.credit),
              description: desc,
              cross_doc_ref: item.cross_doc_ref || '',
              cross_doc_date: item.cross_doc_date || '',
              due_date: item.due_date || '',
              doc_cruce: item.cross_doc_ref || '',
              fecha_doc_cruce: item.cross_doc_date || '',
              fecha_vencimiento: item.due_date || ''
            };
          });
        };

        const finalTxLines = aggregateAccountingLines(lines);
        const txRecord = await (window as any).API.createTransaction(txPayload, finalTxLines);

        if (inventoryItemsToProcess.length > 0) {
          try {
            const warehouses = await (window as any).pb.listAll('warehouses', { filter: 'active=true' });
            if (warehouses.length) {
              const warehouseId = warehouses[0].id;
              const today = (window as any).todayStr();
              const movType = isCreditNote ? 'SALIDA' : 'ENTRADA';
              const movNumber = await (window as any).API.getNextInventoryMovementNumber(today, movType);

              const mov = await (window as any).pb.create('inventory_movements', {
                number: movNumber,
                mov_type: movType,
                date: today,
                warehouse_id: warehouseId,
                third_party_id: thirdParty.id,
                notes: `Movimiento automático por CDE - Documento ${d.number}`,
                status: 'draft',
                tx_id: txRecord.id
              });

              for (let k = 0; k < inventoryItemsToProcess.length; k++) {
                const invIt = inventoryItemsToProcess[k];
                await (window as any).pb.create('inventory_movement_lines', {
                  movement_id: mov.id,
                  product_id: invIt.product_id,
                  qty: invIt.item.qty,
                  unit_cost: invIt.item.price,
                  notes: `SKU ERP: ${invIt.sku} | Doc XML ${d.number}`,
                  line_order: k + 1
                });
              }

              await (window as any).API.applyInventoryMovement(mov.id);
            }
          } catch (errMov: any) {
            console.error('[CDE-INVENTARIOS] Error al procesar inventarios:', errMov);
            (window as any).showToast(`Advertencia: Transacción creada pero falló el ingreso de inventario: ${errMov.message}`, 'warning');
          }
        }

        await (window as any).pb.update('electronic_documents', d.id, {
          document_type: chosenDocType,
          status: 'contabilizado',
          processed: true,
          transaction_id: txRecord.id
        });

        (window as any).showToast('Transacción contabilizada exitosamente', 'success');
        (window as any).closeModal();

        renderDocumentosElectronicos();
      } catch (errTx: any) {
        (window as any).showToast(`Error al contabilizar: ${errTx.message}`, 'error');
        if (submitAccountingBtn) {
          submitAccountingBtn.disabled = false;
          submitAccountingBtn.innerHTML = `<i class="fas fa-receipt"></i> Contabilizar Transacción`;
        }
      }
    });

  } catch (err: any) {
    (window as any).showToast(err.message, 'error');
  }
}

// ──────────────────────────────────────────────────────────
// FUNCIONES AUXILIARES PARA AUTOCOMPLETES DINÁMICOS (MOUSE & TECLADO)
// ──────────────────────────────────────────────────────────

function setupDynamicAccountAutocomplete(
  inputEl: HTMLInputElement,
  hiddenEl: HTMLInputElement,
  resultsEl: HTMLElement,
  allAccounts: any[]
) {
  if (!inputEl || !resultsEl) return;

  let activeIndex = -1;

  const renderResults = () => {
    const query = inputEl.value.toLowerCase().trim();
    if (!query) {
      resultsEl.innerHTML = '';
      resultsEl.classList.add('hidden');
      activeIndex = -1;
      return;
    }

    const filtered = allAccounts.filter((a: any) => 
      a.code.startsWith(query) || a.name.toLowerCase().includes(query)
    ).slice(0, 15);

    if (!filtered.length) {
      resultsEl.innerHTML = `<div class="p-2.5 text-slate-400 text-center text-xs">No se encontraron cuentas PUC</div>`;
      resultsEl.classList.remove('hidden');
      activeIndex = -1;
      return;
    }

    resultsEl.innerHTML = filtered.map((a: any, idx: number) => `
      <div class="p-2 hover:bg-indigo-50 cursor-pointer border-b font-mono text-xs flex justify-between items-center transition cde-acc-opt ${idx === activeIndex ? 'bg-indigo-100 text-indigo-900 font-bold' : ''}" 
           data-index="${idx}" 
           data-code="${a.code}" 
           data-name="${(window as any).esc(a.name)}">
        <strong class="text-indigo-700 font-bold">${a.code}</strong>
        <span class="text-slate-600 text-right truncate max-w-48 ml-2 font-sans">${(window as any).esc(a.name)}</span>
      </div>
    `).join('');

    resultsEl.classList.remove('hidden');

    resultsEl.querySelectorAll('.cde-acc-opt').forEach((div: any) => {
      div.addEventListener('click', (e: any) => {
        e.stopPropagation();
        selectOption(div);
      });
      div.addEventListener('mouseenter', () => {
        resultsEl.querySelectorAll('.cde-acc-opt').forEach(el => el.classList.remove('bg-indigo-100', 'text-indigo-900', 'font-bold'));
        div.classList.add('bg-indigo-100', 'text-indigo-900', 'font-bold');
        activeIndex = parseInt(div.dataset.index || '0');
      });
    });
  };

  const selectOption = (optEl: HTMLElement) => {
    const code = optEl.getAttribute('data-code') || '';
    const name = optEl.getAttribute('data-name') || '';
    inputEl.value = `${code} — ${name}`;
    if (hiddenEl) hiddenEl.value = code;
    resultsEl.classList.add('hidden');
    activeIndex = -1;
  };

  inputEl.addEventListener('focus', renderResults);
  inputEl.addEventListener('input', () => {
    activeIndex = -1;
    renderResults();
  });

  inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
    const items = resultsEl.querySelectorAll('.cde-acc-opt');
    if (resultsEl.classList.contains('hidden') || !items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % items.length;
      updateHighlight(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + items.length) % items.length;
      updateHighlight(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) {
        selectOption(items[activeIndex] as HTMLElement);
      } else if (items[0]) {
        selectOption(items[0] as HTMLElement);
      }
    } else if (e.key === 'Escape') {
      resultsEl.classList.add('hidden');
      activeIndex = -1;
    }
  });

  const updateHighlight = (items: NodeListOf<Element>) => {
    items.forEach((item, idx) => {
      if (idx === activeIndex) {
        item.classList.add('bg-indigo-100', 'text-indigo-900', 'font-bold');
        (item as HTMLElement).scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('bg-indigo-100', 'text-indigo-900', 'font-bold');
      }
    });
  };

  document.addEventListener('click', (e: any) => {
    if (!inputEl.contains(e.target) && !resultsEl.contains(e.target)) {
      resultsEl.classList.add('hidden');
      activeIndex = -1;
    }
  });
}

function setupDynamicProductAutocomplete(
  inputEl: HTMLInputElement,
  hiddenEl: HTMLInputElement,
  skuEl: HTMLInputElement,
  resultsEl: HTMLElement,
  productsList: any[]
) {
  if (!inputEl || !resultsEl) return;

  let activeIndex = -1;

  const renderResults = () => {
    const query = inputEl.value.toLowerCase().trim();
    if (!query) {
      resultsEl.innerHTML = '';
      resultsEl.classList.add('hidden');
      activeIndex = -1;
      return;
    }

    const filtered = productsList.filter((p: any) => 
      p.code.toLowerCase().includes(query) || p.name.toLowerCase().includes(query)
    ).slice(0, 15);

    if (!filtered.length) {
      resultsEl.innerHTML = `<div class="p-2.5 text-slate-500 text-center text-xs">Sin coincidencias exactas (se registrará con SKU asignado)</div>`;
      resultsEl.classList.remove('hidden');
      activeIndex = -1;
      return;
    }

    resultsEl.innerHTML = filtered.map((p: any, idx: number) => `
      <div class="p-2 hover:bg-indigo-50/70 cursor-pointer border-b text-xs flex justify-between items-center transition cde-prod-opt ${idx === activeIndex ? 'bg-indigo-100 text-indigo-900 font-bold' : ''}" 
           data-index="${idx}" 
           data-id="${p.id}" 
           data-code="${p.code}" 
           data-name="${(window as any).esc(p.name)}">
        <div>
          <strong class="font-mono text-indigo-700 mr-1">[${p.code}]</strong>
          <span class="font-semibold text-slate-800">${(window as any).esc(p.name)}</span>
        </div>
        <span class="text-slate-500 font-mono text-[10px] ml-2">${(window as any).fmt(p.cost_price)}</span>
      </div>
    `).join('');

    resultsEl.classList.remove('hidden');

    resultsEl.querySelectorAll('.cde-prod-opt').forEach((div: any) => {
      div.addEventListener('click', (e: any) => {
        e.stopPropagation();
        selectOption(div);
      });
      div.addEventListener('mouseenter', () => {
        resultsEl.querySelectorAll('.cde-prod-opt').forEach(el => el.classList.remove('bg-indigo-100', 'text-indigo-900', 'font-bold'));
        div.classList.add('bg-indigo-100', 'text-indigo-900', 'font-bold');
        activeIndex = parseInt(div.dataset.index || '0');
      });
    });
  };

  const selectOption = (optEl: HTMLElement) => {
    const id = optEl.getAttribute('data-id') || '';
    const code = optEl.getAttribute('data-code') || '';
    const name = optEl.getAttribute('data-name') || '';
    inputEl.value = `${code} — ${name}`;
    if (hiddenEl) hiddenEl.value = id;
    if (skuEl) skuEl.value = code;
    resultsEl.classList.add('hidden');
    activeIndex = -1;
  };

  inputEl.addEventListener('focus', renderResults);
  inputEl.addEventListener('input', () => {
    activeIndex = -1;
    renderResults();
  });

  inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
    const items = resultsEl.querySelectorAll('.cde-prod-opt');
    if (resultsEl.classList.contains('hidden') || !items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % items.length;
      updateHighlight(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + items.length) % items.length;
      updateHighlight(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) {
        selectOption(items[activeIndex] as HTMLElement);
      } else if (items[0]) {
        selectOption(items[0] as HTMLElement);
      }
    } else if (e.key === 'Escape') {
      resultsEl.classList.add('hidden');
      activeIndex = -1;
    }
  });

  const updateHighlight = (items: NodeListOf<Element>) => {
    items.forEach((item, idx) => {
      if (idx === activeIndex) {
        item.classList.add('bg-indigo-100', 'text-indigo-900', 'font-bold');
        (item as HTMLElement).scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('bg-indigo-100', 'text-indigo-900', 'font-bold');
      }
    });
  };

  document.addEventListener('click', (e: any) => {
    if (!inputEl.contains(e.target) && !resultsEl.contains(e.target)) {
      resultsEl.classList.add('hidden');
      activeIndex = -1;
    }
  });
}

async function saveOrUpdateRule(ruleType: string, keyValue: string, accountCode: string, description: string) {
  try {
    const existingRule = await (window as any).pb.list('homologation_rules', {
      filter: `rule_type="${ruleType}" && key_value="${keyValue}"`,
      perPage: 1
    });
    if (existingRule.items.length) {
      await (window as any).pb.update('homologation_rules', existingRule.items[0].id, { account_code: accountCode });
    } else {
      await (window as any).pb.create('homologation_rules', {
        rule_type: ruleType,
        key_value: keyValue,
        account_code: accountCode,
        description: description
      });
    }
  } catch (errRule) {
    console.warn('Aviso: no se pudo guardar regla de homologación:', errRule);
  }
}

// ──────────────────────────────────────────────────────────
// MODAL DE CONFIGURACIÓN CDE
// ──────────────────────────────────────────────────────────

async function openCdeSettingsModal(parentContainer: HTMLElement) {
  try {
    const [defExpense, defPayable, defInventory, defIva19, defIva5, defOtherTaxes, rules, allAccounts] = await Promise.all([
      (window as any).API.getSetting('cde_default_expense_account').catch(() => '') || '519530',
      (window as any).API.getSetting('cde_default_payable_account').catch(() => '') || '220501',
      (window as any).API.getSetting('cde_default_inventory_account').catch(() => '') || '143501',
      (window as any).API.getSetting('cde_iva_19_account').catch(() => '') || '240810',
      (window as any).API.getSetting('cde_iva_5_account').catch(() => '') || '240805',
      (window as any).API.getSetting('cde_other_taxes_account').catch(() => '') || '240890',
      (window as any).pb.listAll('homologation_rules', { sort: '-id' }),
      (window as any).API.getAccounts(true)
    ]);

    const htmlBody = `
      <div class="space-y-4 text-xs">
        <div class="flex border-b" style="border-color: #E2E8F0;">
          <button class="px-4 py-2 font-bold border-b-2" id="tab-cde-defaults" style="border-color: #1A4B8C; color: #1A4B8C;" onclick="window._cdeSwitchTab(0)">Cuentas por Defecto</button>
          <button class="px-4 py-2 font-bold border-b-2 border-transparent text-slate-500" id="tab-cde-rules" onclick="window._cdeSwitchTab(1)">Reglas Guardadas (${rules.length})</button>
        </div>

        <!-- Panel 1: Defaults -->
        <div id="panel-cde-defaults" class="space-y-3 pt-2">
          <p class="text-slate-500 mb-2">Define las cuentas PUC predeterminadas que se sugerirán o utilizarán automáticamente al procesar compras, inventarios y servicios.</p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="form-group relative">
              <label class="block font-semibold mb-1">Cuenta de Gasto Predeterminada</label>
              <input type="text" id="cde-cfg-expense-search" class="form-input w-full" placeholder="Buscar cuenta..." value="${defExpense}">
              <input type="hidden" id="cde-cfg-expense-code" value="${defExpense}">
              <div id="cde-cfg-expense-results" class="autocomplete-results hidden absolute z-50 left-0 right-0 max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg top-full mt-1"></div>
            </div>

            <div class="form-group relative">
              <label class="block font-semibold mb-1">Cuenta de Inventario Predeterminada</label>
              <input type="text" id="cde-cfg-inventory-search" class="form-input w-full" placeholder="Buscar cuenta..." value="${defInventory}">
              <input type="hidden" id="cde-cfg-inventory-code" value="${defInventory}">
              <div id="cde-cfg-inventory-results" class="autocomplete-results hidden absolute z-50 left-0 right-0 max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg top-full mt-1"></div>
            </div>

            <div class="form-group relative">
              <label class="block font-semibold mb-1">Cuenta de Proveedores (CxP)</label>
              <input type="text" id="cde-cfg-payable-search" class="form-input w-full" placeholder="Buscar cuenta..." value="${defPayable}">
              <input type="hidden" id="cde-cfg-payable-code" value="${defPayable}">
              <div id="cde-cfg-payable-results" class="autocomplete-results hidden absolute z-50 left-0 right-0 max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg top-full mt-1"></div>
            </div>
          </div>

          <div class="border-t pt-3 mt-3" style="border-color: #E2E8F0;">
            <span class="block font-bold text-slate-700 mb-2">Configuración de Cuentas de Impuestos por Tarifa:</span>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="form-group relative">
                <label class="block font-semibold mb-1">IVA del 19%</label>
                <input type="text" id="cde-cfg-iva19-search" class="form-input w-full" placeholder="Buscar cuenta..." value="${defIva19}">
                <input type="hidden" id="cde-cfg-iva19-code" value="${defIva19}">
                <div id="cde-cfg-iva19-results" class="autocomplete-results hidden absolute z-50 left-0 right-0 max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg top-full mt-1"></div>
              </div>

              <div class="form-group relative">
                <label class="block font-semibold mb-1">IVA del 5%</label>
                <input type="text" id="cde-cfg-iva5-search" class="form-input w-full" placeholder="Buscar cuenta..." value="${defIva5}">
                <input type="hidden" id="cde-cfg-iva5-code" value="${defIva5}">
                <div id="cde-cfg-iva5-results" class="autocomplete-results hidden absolute z-50 left-0 right-0 max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg top-full mt-1"></div>
              </div>

              <div class="form-group relative">
                <label class="block font-semibold mb-1">Otros Impuestos</label>
                <input type="text" id="cde-cfg-other-taxes-search" class="form-input w-full" placeholder="Buscar cuenta..." value="${defOtherTaxes}">
                <input type="hidden" id="cde-cfg-other-taxes-code" value="${defOtherTaxes}">
                <div id="cde-cfg-other-taxes-results" class="autocomplete-results hidden absolute z-50 left-0 right-0 max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg top-full mt-1"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel 2: Rules -->
        <div id="panel-cde-rules" class="hidden pt-2 space-y-2">
          <p class="text-slate-500 mb-2">Aquí puedes ver y eliminar las reglas de homologación que el sistema ha "aprendido" al asociar proveedores con cuentas contables o códigos SKU de producto.</p>
          <div class="max-h-64 overflow-y-auto border rounded-lg" style="border-color: #E2E8F0;">
            <table class="data-table w-full text-left" style="font-size: 11px;">
              <thead>
                <tr class="bg-slate-50">
                  <th class="p-2 border-b">Tipo / Clave</th>
                  <th class="p-2 border-b">Cuenta / SKU Asignado</th>
                  <th class="p-2 border-b text-center" style="width: 60px;">Acción</th>
                </tr>
              </thead>
              <tbody>
                ${rules.length ? rules.map((r: any) => `
                  <tr class="hover:bg-slate-50" id="row-rule-${r.id}">
                    <td class="p-2 border-b font-semibold">
                      <span class="badge badge-blue text-[9px] uppercase mr-1">${r.rule_type}</span>
                      ${(window as any).esc(r.key_value)} 
                      <span class="block text-slate-400 font-normal">${(window as any).esc(r.description || 'Regla homologada')}</span>
                    </td>
                    <td class="p-2 border-b font-mono font-bold">${(window as any).esc(r.account_code)}</td>
                    <td class="p-2 border-b text-center">
                      <button class="p-1 text-red-500 hover:text-red-700 transition" onclick="window.deleteCdeRule('${r.id}')" title="Eliminar regla">
                        <i class="fas fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="3" class="text-center py-6 text-slate-400">No hay reglas de homologación registradas aún.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const htmlFooter = `
      <div class="flex gap-2">
        <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="btn-cde-save-settings"><i class="fas fa-floppy-disk mr-1"></i>Guardar Cambios</button>
      </div>
    `;

    (window as any).openModal('Configuración del CDE', htmlBody, htmlFooter, false);

    (window as any)._cdeSwitchTab = (tabIdx: number) => {
      const defTab = document.getElementById('tab-cde-defaults');
      const rulesTab = document.getElementById('tab-cde-rules');
      const defPanel = document.getElementById('panel-cde-defaults');
      const rulesPanel = document.getElementById('panel-cde-rules');

      if (tabIdx === 0) {
        defTab?.classList.add('border-b-2');
        defTab?.classList.remove('border-transparent', 'text-slate-500');
        defTab?.setAttribute('style', 'border-color: #1A4B8C; color: #1A4B8C;');

        rulesTab?.classList.remove('border-b-2');
        rulesTab?.classList.add('border-transparent', 'text-slate-500');
        rulesTab?.removeAttribute('style');

        defPanel?.classList.remove('hidden');
        rulesPanel?.classList.add('hidden');
      } else {
        rulesTab?.classList.add('border-b-2');
        rulesTab?.classList.remove('border-transparent', 'text-slate-500');
        rulesTab?.setAttribute('style', 'border-color: #1A4B8C; color: #1A4B8C;');

        defTab?.classList.remove('border-b-2');
        defTab?.classList.add('border-transparent', 'text-slate-500');
        defTab?.removeAttribute('style');

        rulesPanel?.classList.remove('hidden');
        defPanel?.classList.add('hidden');
      }
    };

    (window as any).deleteCdeRule = async (ruleId: string) => {
      if (confirm('¿Estás seguro de eliminar esta regla de homologación contable? El sistema tendrá que volver a aprender la cuenta o SKU.')) {
        try {
          await (window as any).pb.delete('homologation_rules', ruleId);
          document.getElementById(`row-rule-${ruleId}`)?.remove();
          (window as any).showToast('Regla eliminada correctamente', 'success');
        } catch (errDel: any) {
          (window as any).showToast(`Error al eliminar: ${errDel.message}`, 'error');
        }
      }
    };

    // Vincular autocompletes dinámicos para el modal de configuración CDE
    setupDynamicAccountAutocomplete(
      document.getElementById('cde-cfg-expense-search') as HTMLInputElement,
      document.getElementById('cde-cfg-expense-code') as HTMLInputElement,
      document.getElementById('cde-cfg-expense-results') as HTMLElement,
      allAccounts
    );
    setupDynamicAccountAutocomplete(
      document.getElementById('cde-cfg-inventory-search') as HTMLInputElement,
      document.getElementById('cde-cfg-inventory-code') as HTMLInputElement,
      document.getElementById('cde-cfg-inventory-results') as HTMLElement,
      allAccounts
    );
    setupDynamicAccountAutocomplete(
      document.getElementById('cde-cfg-payable-search') as HTMLInputElement,
      document.getElementById('cde-cfg-payable-code') as HTMLInputElement,
      document.getElementById('cde-cfg-payable-results') as HTMLElement,
      allAccounts
    );
    setupDynamicAccountAutocomplete(
      document.getElementById('cde-cfg-iva19-search') as HTMLInputElement,
      document.getElementById('cde-cfg-iva19-code') as HTMLInputElement,
      document.getElementById('cde-cfg-iva19-results') as HTMLElement,
      allAccounts
    );
    setupDynamicAccountAutocomplete(
      document.getElementById('cde-cfg-iva5-search') as HTMLInputElement,
      document.getElementById('cde-cfg-iva5-code') as HTMLInputElement,
      document.getElementById('cde-cfg-iva5-results') as HTMLElement,
      allAccounts
    );
    setupDynamicAccountAutocomplete(
      document.getElementById('cde-cfg-other-taxes-search') as HTMLInputElement,
      document.getElementById('cde-cfg-other-taxes-code') as HTMLInputElement,
      document.getElementById('cde-cfg-other-taxes-results') as HTMLElement,
      allAccounts
    );

    document.getElementById('btn-cde-save-settings')?.addEventListener('click', async () => {
      const expenseInput = document.getElementById('cde-cfg-expense-search') as HTMLInputElement;
      const inventoryInput = document.getElementById('cde-cfg-inventory-search') as HTMLInputElement;
      const payableInput = document.getElementById('cde-cfg-payable-search') as HTMLInputElement;
      const iva19Input = document.getElementById('cde-cfg-iva19-search') as HTMLInputElement;
      const iva5Input = document.getElementById('cde-cfg-iva5-search') as HTMLInputElement;
      const otherTaxesInput = document.getElementById('cde-cfg-other-taxes-search') as HTMLInputElement;

      const expenseVal = expenseInput.value.split('—')[0].trim();
      const inventoryVal = inventoryInput.value.split('—')[0].trim();
      const payableVal = payableInput.value.split('—')[0].trim();
      const iva19Val = iva19Input.value.split('—')[0].trim();
      const iva5Val = iva5Input.value.split('—')[0].trim();
      const otherTaxesVal = otherTaxesInput.value.split('—')[0].trim();

      if (!expenseVal || !inventoryVal || !payableVal || !iva19Val || !iva5Val || !otherTaxesVal) {
        return (window as any).showToast('Todas las cuentas PUC de configuración son obligatorias.', 'error');
      }

      try {
        await Promise.all([
          (window as any).API.setSetting('cde_default_expense_account', expenseVal),
          (window as any).API.setSetting('cde_default_inventory_account', inventoryVal),
          (window as any).API.setSetting('cde_default_payable_account', payableVal),
          (window as any).API.setSetting('cde_iva_19_account', iva19Val),
          (window as any).API.setSetting('cde_iva_5_account', iva5Val),
          (window as any).API.setSetting('cde_other_taxes_account', otherTaxesVal)
        ]);

        (window as any).showToast('Configuración del CDE guardada con éxito', 'success');
        (window as any).closeModal();
        
        renderDocumentosElectronicos(parentContainer);
      } catch (saveErr: any) {
        (window as any).showToast(`Error al guardar configuración: ${saveErr.message}`, 'error');
      }
    });

  } catch (err: any) {
    (window as any).showToast(`Error al cargar configuración: ${err.message}`, 'error');
  }
}

async function reverseDocContabilization(docId: string) {
  const userRole = ((window as any).pb.currentUser?.role || '').toLowerCase();
  const isAdmin = ['superadmin', 'administrador', 'admin'].includes(userRole);
  if (!isAdmin) {
    return (window as any).showToast('Solo los usuarios administradores pueden reversar contabilizaciones.', 'error');
  }

  if (!confirm('¿Estás seguro de reversar la contabilización de este documento? Esto eliminará la transacción contable del PUC y revertirá/eliminará cualquier movimiento de inventario asociado.')) {
    return;
  }

  try {
    const d = await (window as any).pb.get('electronic_documents', docId);
    if (!d.transaction_id) {
      return (window as any).showToast('El documento no tiene una transacción asociada.', 'warning');
    }

    const invMovs = await (window as any).pb.listAll('inventory_movements', {
      filter: `tx_id = "${d.transaction_id}"`
    });

    for (const mov of invMovs) {
      try {
        if (mov.status === 'applied') {
          await (window as any).API.voidInventoryMovement(mov.id, 'Reversión automática de CDE');
        }
        await (window as any).pb.delete('inventory_movements', mov.id);
      } catch (errMov) {
        console.warn('Advertencia al anular movimiento de inventario:', errMov);
      }
    }

    await (window as any).pb.delete('transactions', d.transaction_id);

    await (window as any).pb.update('electronic_documents', d.id, {
      status: 'pendiente',
      processed: false,
      transaction_id: ''
    });

    (window as any).showToast('Contabilización reversada correctamente.', 'success');
    
    renderDocumentosElectronicos();
  } catch (err: any) {
    (window as any).showToast(`Error al reversar: ${err.message}`, 'error');
  }
}

(window as any).viewDocXmlDetails = viewDocXmlDetails;
(window as any).openDocHomologationModal = openDocHomologationModal;
(window as any).renderDocumentosElectronicos = renderDocumentosElectronicos;
(window as any).openCdeSettingsModal = openCdeSettingsModal;
(window as any).reverseDocContabilization = reverseDocContabilization;
(window as any).deleteDocElectronico = deleteDocElectronico;
