const fs = require('fs');

const path = 'frontend/src/modules/doc-soporte.ts';
let content = fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

// 1. Update DocSoporteItem interface to include cost_center_id and cost_center_code
const targetInterface = `  bank_account_id?: string;
  warehouse_id?: string;
  expand?: any;
}`;

const repInterface = `  bank_account_id?: string;
  warehouse_id?: string;
  cost_center_id?: string;
  cost_center_code?: string;
  cost_center_name?: string;
  expand?: any;
}`;

// 2. In loadDocSoportePage, include cost_center_id in expand
const targetPurExpand = `pb.listAll('purchase_invoices', { 
      filter: purFilter, 
      sort: '-date,-id', 
      expand: 'supplier_id,tx_type_id' 
    }).catch(() => [])`;

const repPurExpand = `pb.listAll('purchase_invoices', { 
      filter: purFilter, 
      sort: '-date,-id', 
      expand: 'supplier_id,tx_type_id,cost_center_id' 
    }).catch(() => [])`;

// 3. In openDocSoporteSettingsModal, filter only auxiliary accounts (Level 5 / >= 8 digits) and validate on save
const targetSettingsModal = `  const [cfg, accounts] = await Promise.all([
    getDocSoporteConfig(),
    pb.listAll('accounts', { filter: 'active=true', sort: 'code' }).catch(() => [])
  ]);

  const accountOptions = (selectedCode = '') => {
    return \`<option value="">— Sin definir —</option>\` + accounts.map((a: any) => 
      \`<option value="\${esc(a.code)}"\${a.code === selectedCode ? ' selected' : ''}>\${esc(a.code)} — \${esc(a.name)}</option>\`
    ).join('');
  };`;

const repSettingsModal = `  const [cfg, allAccounts] = await Promise.all([
    getDocSoporteConfig(),
    pb.listAll('accounts', { filter: 'active=true', sort: 'code' }).catch(() => [])
  ]);

  // Filtrar estrictamente cuentas auxiliares (Nivel 5 como mínimo o longitud >= 8 dígitos)
  const auxiliaryAccounts = allAccounts.filter((a: any) => {
    const digits = String(a.code || '').replace(/\\D/g, '');
    return (a.level >= 5 || digits.length >= 8);
  });

  const accountOptions = (selectedCode = '') => {
    let extraOpt = '';
    if (selectedCode && !auxiliaryAccounts.some((a: any) => a.code === selectedCode)) {
      const legacy = allAccounts.find((a: any) => a.code === selectedCode);
      if (legacy) {
        extraOpt = \`<option value="\${esc(legacy.code)}" selected class="text-rose-600 bg-rose-50 font-bold">⚠️ \${esc(legacy.code)} — \${esc(legacy.name)} (No auxiliar - Actualizar a Nivel 5)</option>\`;
      }
    }
    return \`<option value="">— Sin definir —</option>\` + extraOpt + auxiliaryAccounts.map((a: any) => 
      \`<option value="\${esc(a.code)}"\${a.code === selectedCode ? ' selected' : ''}>\${esc(a.code)} — \${esc(a.name)}</option>\`
    ).join('');
  };`;

// 4. In btn-save-ds-cfg listener, validate that all selected accounts are auxiliary
const targetSaveCfg = `    cfg.accounting.accounts.payable_code = (document.getElementById('ds-cfg-payable') as HTMLSelectElement).value;
    cfg.accounting.accounts.expense_fallback_code = (document.getElementById('ds-cfg-exp-fallback') as HTMLSelectElement).value;
    cfg.accounting.accounts.cash_account_code = (document.getElementById('ds-cfg-cash-acct') as HTMLSelectElement).value;
    cfg.accounting.accounts.bank_account_code = (document.getElementById('ds-cfg-bank-acct') as HTMLSelectElement).value;`;

const repSaveCfg = `    const payableCode = (document.getElementById('ds-cfg-payable') as HTMLSelectElement).value;
    const expFallbackCode = (document.getElementById('ds-cfg-exp-fallback') as HTMLSelectElement).value;
    const cashCode = (document.getElementById('ds-cfg-cash-acct') as HTMLSelectElement).value;
    const bankCode = (document.getElementById('ds-cfg-bank-acct') as HTMLSelectElement).value;

    const checkIsAuxiliary = (code: string, label: string) => {
      if (!code) return true;
      const acc = allAccounts.find((a: any) => a.code === code);
      const digits = code.replace(/\\D/g, '');
      if (acc && (acc.level < 5 && digits.length < 8)) {
        showToast(\`La \${label} "\${code}" no es una cuenta auxiliar. Debe ser nivel 5 (mínimo 8 dígitos).\`, 'warning');
        return false;
      }
      return true;
    };

    if (!checkIsAuxiliary(payableCode, 'cuenta de pasivo / cuentas por pagar')) return;
    if (!checkIsAuxiliary(expFallbackCode, 'cuenta de gasto fallback')) return;
    if (!checkIsAuxiliary(cashCode, 'cuenta de efectivo / caja')) return;
    if (!checkIsAuxiliary(bankCode, 'cuenta de banco')) return;

    cfg.accounting.accounts.payable_code = payableCode;
    cfg.accounting.accounts.expense_fallback_code = expFallbackCode;
    cfg.accounting.accounts.cash_account_code = cashCode;
    cfg.accounting.accounts.bank_account_code = bankCode;`;

// 5. In openNuevoDsModal, fetch cost_centers
const targetDsModalFetch = `  const [resolutions, thirdParties, bankAccounts, txTypes, warehouses, products, accounts, cfg] = await Promise.all([
    preResolutions.length ? preResolutions : pb.listAll('dian_resolutions', { filter: 'active=true && document_type="DS"' }),
    preThirds.length ? preThirds : pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
    pb.listAll('bank_accounts', { filter: 'active=true', sort: 'name' }).catch(() => []),
    pb.listAll('transaction_types', { filter: 'active=true' }).catch(() => []),
    (window as any).API?.getWarehouses ? (window as any).API.getWarehouses(true) : pb.listAll('warehouses', { filter: 'active=true' }).catch(() => []),
    (window as any).API?.getProducts ? (window as any).API.getProducts({ activeOnly: true }) : pb.listAll('products', { filter: 'active=true' }).catch(() => []),
    pb.listAll('accounts', { filter: 'active=true', sort: 'code' }).catch(() => []),
    getDocSoporteConfig()
  ]);`;

const repDsModalFetch = `  const [resolutions, thirdParties, bankAccounts, txTypes, warehouses, products, accounts, cfg, costCenters] = await Promise.all([
    preResolutions.length ? preResolutions : pb.listAll('dian_resolutions', { filter: 'active=true && document_type="DS"' }),
    preThirds.length ? preThirds : pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
    pb.listAll('bank_accounts', { filter: 'active=true', sort: 'name' }).catch(() => []),
    pb.listAll('transaction_types', { filter: 'active=true' }).catch(() => []),
    (window as any).API?.getWarehouses ? (window as any).API.getWarehouses(true) : pb.listAll('warehouses', { filter: 'active=true' }).catch(() => []),
    (window as any).API?.getProducts ? (window as any).API.getProducts({ activeOnly: true }) : pb.listAll('products', { filter: 'active=true' }).catch(() => []),
    pb.listAll('accounts', { filter: 'active=true', sort: 'code' }).catch(() => []),
    getDocSoporteConfig(),
    pb.listAll('cost_centers', { filter: 'active=true', sort: 'code' }).catch(() => [])
  ]);`;

// 6. In openNuevoDsModal, build costCenterOptions and add to header HTML
const targetWarehouseOptions = `  const warehouseOptions = warehouses.map((w: any) =>
    \`<option value="\${esc(w.id)}"\${existingPur?.warehouse_id === w.id ? ' selected' : ''}>\${esc(w.name)}</option>\`
  ).join('');`;

const repWarehouseOptions = `  const warehouseOptions = warehouses.map((w: any) =>
    \`<option value="\${esc(w.id)}"\${existingPur?.warehouse_id === w.id ? ' selected' : ''}>\${esc(w.name)}</option>\`
  ).join('');

  const costCenterOptions = (costCenters || []).map((cc: any) =>
    \`<option value="\${esc(cc.id)}"\${existingPur?.cost_center_id === cc.id ? ' selected' : ''}>\${esc(cc.code)} — \${esc(cc.name)}</option>\`
  ).join('');`;

// 7. Insert Centro de Costos in header form
const targetHeaderGrid = `      <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div>
          <label class="form-label font-bold">\${existingPur ? 'Consecutivo Borrador' : 'Próximo Consecutivo'}</label>
          <input id="ds-consecutivo-preview" class="form-input font-mono font-bold bg-slate-100 text-slate-800" readonly value="\${esc(existingPur?.number || 'Cargando...')}">
        </div>
        <div>
          <label class="form-label font-bold">Resolución DIAN</label>
          <select id="ds-resolution-id" class="form-input w-full" onchange="window.dsUpdateConsecutivoPreview('resolution')">
            \${resOptions || '<option value="">Sin resolución activa</option>'}
          </select>
        </div>
        <!-- Bodega de Inventario -->
        <div>
          <label class="form-label font-bold">Bodega (Inventario)</label>
          <select id="ds-warehouse" class="form-input w-full">
            <option value="">— Sin Bodega (Servicios) —</option>
            \${warehouseOptions}
          </select>
        </div>
        <div>
          <label class="form-label font-bold">Fecha Emisión</label>
          <input type="date" id="ds-date" class="form-input w-full" value="\${existingPur?.date || (window as any).todayStr()}" onchange="window.dsRecalcDueDate && window.dsRecalcDueDate()">
        </div>
        <!-- 3. Selector de Forma de Pago DIAN -->
        <div>
          <label class="form-label font-bold">Forma de Pago (DIAN)</label>
          <select id="ds-payment-form" class="form-input w-full font-semibold" onchange="window.dsOnPaymentFormChange()">
            <option value="1"\${(!isExistingCredit) ? ' selected' : ''}>1 - Contado</option>
            <option value="2"\${isExistingCredit ? ' selected' : ''}>2 - Crédito Comercial</option>
          </select>
        </div>
      </div>`;

const repHeaderGrid = `      <div class="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div>
          <label class="form-label font-bold">\${existingPur ? 'Consecutivo Borrador' : 'Próximo Consecutivo'}</label>
          <input id="ds-consecutivo-preview" class="form-input font-mono font-bold bg-slate-100 text-slate-800" readonly value="\${esc(existingPur?.number || 'Cargando...')}">
        </div>
        <div>
          <label class="form-label font-bold">Resolución DIAN</label>
          <select id="ds-resolution-id" class="form-input w-full" onchange="window.dsUpdateConsecutivoPreview('resolution')">
            \${resOptions || '<option value="">Sin resolución activa</option>'}
          </select>
        </div>
        <!-- Centro de Costos en Cabecera -->
        <div>
          <label class="form-label font-bold text-slate-800"><i class="fas fa-sitemap mr-1 text-indigo-600"></i>Centro de Costos</label>
          <select id="ds-cost-center" class="form-input w-full font-semibold">
            <option value="">— Sin Centro de Costos —</option>
            \${costCenterOptions}
          </select>
        </div>
        <!-- Bodega de Inventario -->
        <div>
          <label class="form-label font-bold">Bodega (Inventario)</label>
          <select id="ds-warehouse" class="form-input w-full">
            <option value="">— Sin Bodega (Servicios) —</option>
            \${warehouseOptions}
          </select>
        </div>
        <div>
          <label class="form-label font-bold">Fecha Emisión</label>
          <input type="date" id="ds-date" class="form-input w-full" value="\${existingPur?.date || (window as any).todayStr()}" onchange="window.dsRecalcDueDate && window.dsRecalcDueDate()">
        </div>
        <!-- 3. Selector de Forma de Pago DIAN -->
        <div>
          <label class="form-label font-bold">Forma de Pago (DIAN)</label>
          <select id="ds-payment-form" class="form-input w-full font-semibold" onchange="window.dsOnPaymentFormChange()">
            <option value="1"\${(!isExistingCredit) ? ' selected' : ''}>1 - Contado</option>
            <option value="2"\${isExistingCredit ? ' selected' : ''}>2 - Crédito Comercial</option>
          </select>
        </div>
      </div>`;

// 8. In submitDsForm, read ds-cost-center and attach to headerPayload and linesData
const targetSubmitPayload = `      const payableTotal = Math.max(0, subtotalSum - retSum);
      const warehouseId = (document.getElementById('ds-warehouse') as HTMLSelectElement)?.value || '';

      const headerPayload = {`;

const repSubmitPayload = `      const payableTotal = Math.max(0, subtotalSum - retSum);
      const warehouseId = (document.getElementById('ds-warehouse') as HTMLSelectElement)?.value || '';
      const costCenterId = (document.getElementById('ds-cost-center') as HTMLSelectElement)?.value || null;

      const headerPayload = {
        cost_center_id: costCenterId,`;

// Also in linesData.push
const targetLineData = `          ret_rule_id: lineRetRuleId,
          ret_rate: lineRetRate,
          ret_amount: lineRet,
          ret_account_code: lineRetAccountCode
        });`;

const repLineData = `          ret_rule_id: lineRetRuleId,
          ret_rate: lineRetRate,
          ret_amount: lineRet,
          ret_account_code: lineRetAccountCode,
          cost_center_id: costCenterId
        });`;

// Replace all
if (!content.includes(targetInterface)) { console.error('targetInterface not found'); process.exit(1); }
if (!content.includes(targetPurExpand)) { console.error('targetPurExpand not found'); process.exit(1); }
if (!content.includes(targetSettingsModal)) { console.error('targetSettingsModal not found'); process.exit(1); }
if (!content.includes(targetSaveCfg)) { console.error('targetSaveCfg not found'); process.exit(1); }
if (!content.includes(targetDsModalFetch)) { console.error('targetDsModalFetch not found'); process.exit(1); }
if (!content.includes(targetWarehouseOptions)) { console.error('targetWarehouseOptions not found'); process.exit(1); }
if (!content.includes(targetHeaderGrid)) { console.error('targetHeaderGrid not found'); process.exit(1); }
if (!content.includes(targetSubmitPayload)) { console.error('targetSubmitPayload not found'); process.exit(1); }
if (!content.includes(targetLineData)) { console.error('targetLineData not found'); process.exit(1); }

content = content.replace(targetInterface, repInterface);
content = content.replace(targetPurExpand, repPurExpand);
content = content.replace(targetSettingsModal, repSettingsModal);
content = content.replace(targetSaveCfg, repSaveCfg);
content = content.replace(targetDsModalFetch, repDsModalFetch);
content = content.replace(targetWarehouseOptions, repWarehouseOptions);
content = content.replace(targetHeaderGrid, repHeaderGrid);
content = content.replace(targetSubmitPayload, repSubmitPayload);
content = content.replace(targetLineData, repLineData);

fs.writeFileSync(path, content.replace(/\n/g, '\r\n'), 'utf8');
console.log('Successfully updated frontend/src/modules/doc-soporte.ts with auxiliary accounts and header cost center.');

