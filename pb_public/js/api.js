/**
 * GRAVY v2.0 � api.js
 * Capa de acceso a PocketBase REST API.
 * Reemplaza completamente a SQL.js / localStorage.
 */

'use strict';

/* -- URL base � detecta automaticamente el servidor ------- */
const PB_URL = window.location.origin;  // http://192.168.x.x:8090 o localhost:8090

/* -- Cliente minimo PocketBase (sin SDK externo) ----------- */
const pb = {
  _token: null,
  _user: null,

  get authToken() { return this._token ?? localStorage.getItem('pb_token'); },
  set authToken(v) { this._token = v; if (v) localStorage.setItem('pb_token', v); else localStorage.removeItem('pb_token'); },

  get currentUser() {
    if (this._user) return this._user;
    try {
      return JSON.parse(localStorage.getItem('pb_user') ?? 'null');
    } catch {
      localStorage.removeItem('pb_user');
      return null;
    }
  },
  set currentUser(v) { this._user = v; if (v) localStorage.setItem('pb_user', JSON.stringify(v)); else localStorage.removeItem('pb_user'); },

  // Escapa valores usados dentro del DSL de filtros de PocketBase.
  escapeFilterValue(v) {
    return String(v ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\r?\n/g, ' ')
      .trim();
  },

  headers() {
    const h = { 'Content-Type': 'application/json' };
    if (this.authToken) h['Authorization'] = `Bearer ${this.authToken}`;
    return h;
  },

  /** GET /api/collections/:col/records con filtro y paginaci�n */
  async list(collection, { filter = '', sort = '', page = 1, perPage = 200, expand = '' } = {}) {
    const params = new URLSearchParams({ page, perPage });
    if (filter)  params.set('filter', filter);
    if (sort)    params.set('sort', sort);
    if (expand)  params.set('expand', expand);
    const res = await fetch(`${PB_URL}/api/collections/${collection}/records?${params}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw await this._err(res);
    return res.json(); // { page, perPage, totalItems, totalPages, items: [...] }
  },

  /** GET todos los registros paginando automaticamente */
  async listAll(collection, options = {}) {
    let page = 1;
    const all = [];
    while (true) {
      const r = await this.list(collection, { ...options, page, perPage: 200 });
      all.push(...r.items);
      if (page >= r.totalPages) break;
      page++;
    }
    return all;
  },

  /** GET /api/collections/:col/records/:id */
  async get(collection, id, { expand = '' } = {}) {
    const params = expand ? `?expand=${encodeURIComponent(expand)}` : '';
    const res = await fetch(`${PB_URL}/api/collections/${collection}/records/${id}${params}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw await this._err(res);
    return res.json();
  },

  /** POST � crear registro */
  async create(collection, data) {
    const res = await fetch(`${PB_URL}/api/collections/${collection}/records`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await this._err(res);
    return res.json();
  },

  /** PATCH � actualizar registro */
  async update(collection, id, data) {
    const res = await fetch(`${PB_URL}/api/collections/${collection}/records/${id}`, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await this._err(res);
    return res.json();
  },

  /** DELETE � eliminar registro */
  async delete(collection, id) {
    const res = await fetch(`${PB_URL}/api/collections/${collection}/records/${id}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    if (!res.ok && res.status !== 204) throw await this._err(res);
    return true;
  },

  /** Autenticaci�n de usuario */
  async authWithPassword(email, password) {
    const res = await fetch(`${PB_URL}/api/collections/users/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: email, password }),
    });
    if (!res.ok) throw await this._err(res);
    const data = await res.json();
    this.authToken  = data.token;
    this.currentUser = data.record;
    return data;
  },

  /** Verificar si el token actual sigue siendo valido */
  async authRefresh() {
    if (!this.authToken) return null;
    const res = await fetch(`${PB_URL}/api/collections/users/auth-refresh`, {
      method: 'POST',
      headers: this.headers(),
    });
    if (!res.ok) {
      this.authToken   = null;
      this.currentUser = null;
      return null;
    }
    const data = await res.json();
    this.authToken   = data.token;
    this.currentUser = data.record;
    return data;
  },

  /** Cerrar sesi�n */
  logout() {
    this.authToken   = null;
    this.currentUser = null;
  },

  /** Ping al servidor */
  async ping() {
    try {
      const res = await fetch(`${PB_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch { return false; }
  },

  /** Error helper */
  async _err(res) {
    let body = {};
    try { body = await res.json(); } catch { body = { message: res.statusText }; }
    const fieldMessages = body?.data && typeof body.data === 'object'
      ? Object.values(body.data).map(v => v?.message).filter(Boolean)
      : [];
    const msg = body?.message ?? body?.data?.identity?.message ?? fieldMessages[0] ?? 'Error desconocido';
    const err = new Error(msg);
    err.status = res.status;
    err.data   = body;
    return err;
  },
};

/* -- Helpers de API con logging de auditoria ---------------- */
const API = {

  // -- Settings ----------------------------------------------
  async getSetting(key) {
    try {
      const safeKey = pb.escapeFilterValue(key);
      const r = await pb.list('settings', { filter: `key="${safeKey}"`, perPage: 1 });
      return r.items[0]?.value ?? '';
    } catch { return ''; }
  },

  async setSetting(key, value) {
    const safeKey = pb.escapeFilterValue(key);
    const existing = await pb.list('settings', { filter: `key="${safeKey}"`, perPage: 1 });
    if (existing.items.length) {
      return pb.update('settings', existing.items[0].id, { value });
    }
    return pb.create('settings', { key, value });
  },

  // -- auditoria ---------------------------------------------
  async logAudit(action, entity, entityId = null, details = '') {
    try {
      if (!pb.authToken) return;
      await fetch(`${PB_URL}/api/audit-event`, {
        method: 'POST',
        headers: pb.headers(),
        body: JSON.stringify({
          action:    String(action    || ''),
          entity:    String(entity    || ''),
          entity_id: entityId ? String(entityId) : '',
          details:   String(details   || ''),
        }),
      });
    } catch (_) {
      // Nunca romper flujos de negocio por falla de auditoría.
    }
  },

  // -- Plan de Cuentas ---------------------------------------
  async getAccounts(activeOnly = true) {
    const filter = activeOnly ? 'active=true' : '';
    return pb.listAll('accounts', { filter, sort: 'code', expand: 'account_type_id' });
  },

  async getAccountSaldos() {
    // Trae Debitos y Creditos agrupados por cuenta en una sola consulta
    // PocketBase no soporta GROUP BY nativo, as� que traemos las lineas y agrupamos en JS
    const lines = await pb.listAll('tx_lines', {
      expand: 'tx_id',
      filter: 'tx_id.status="active"',
    });
    const saldos = {};
    for (const line of lines) {
      if (!saldos[line.account_id]) saldos[line.account_id] = 0;
      saldos[line.account_id] += (line.debit ?? 0) - (line.credit ?? 0);
    }
    return saldos;  // { accountId: saldoNeto }
  },

  // -- Terceros ----------------------------------------------
  async getTerceros(opts = {}) {
    const { type = '', query = '' } = opts;
    let filter = 'active=true';
    if (type) {
      const safeType = pb.escapeFilterValue(type);
      filter += ` && type="${safeType}"`;
    }
    if (query) {
      const safeQuery = pb.escapeFilterValue(query);
      filter += ` && (name~"${safeQuery}" || doc_number~"${safeQuery}")`;
    }
    return pb.listAll('third_parties', { filter, sort: 'name' });
  },

  // -- Tipos de transaccion ----------------------------------
  async getTxTypes() {
    return pb.listAll('transaction_types', { filter: 'active=true', sort: 'code' });
  },

  async nextConsecutive(txTypeId) {
    const tt = await pb.get('transaction_types', txTypeId);
    const next = (tt.consecutive ?? 0) + 1;
    await pb.update('transaction_types', txTypeId, { consecutive: next });
    return String(next).padStart(8, '0');
  },

  // -- Transacciones -----------------------------------------
  async createTransaction(txData, lines) {
    // txData: { tx_type_id, number, date, description, third_party_id?, cross_*, user_id, status }
    // lines: [{ account_id, debit, credit, description, line_order }]
    const tx = await pb.create('transactions', {
      ...txData,
      // El número se asigna en hook server-side al crear transactions.
      number: txData.number || 'AUTO',
      status: txData.status || 'active',
    });

    try {
      for (const line of lines) {
        await pb.create('tx_lines', { tx_id: tx.id, ...line });
      }
    } catch (lineErr) {
      // Evita dejar cabeceras hu�rfanas si falla la persistencia de una l�nea.
      try { await pb.delete('transactions', tx.id); } catch (_) {}
      throw lineErr;
    }

    return tx;
  },

  async getTransactions(opts = {}) {
    const { page = 1, perPage = 50, filter = '', sort = '-id' } = opts;
    try {
      return await pb.list('transactions', {
        page, perPage, filter, sort,
        expand: 'tx_type_id,third_party_id,user_id',
      });
    } catch (err) {
      if (sort !== '-id') {
        return pb.list('transactions', {
          page, perPage, filter, sort: '-id',
          expand: 'tx_type_id,third_party_id,user_id',
        });
      }
      throw err;
    }
  },

  async getTxLines(txId) {
    return pb.listAll('tx_lines', {
      filter: `tx_id="${txId}"`,
      sort: 'line_order',
      expand: 'account_id,third_party_id',
    });
  },

  async voidTransaction(txId, description = '') {
    await pb.update('transactions', txId, { status: 'voided' });
  },

  async approveTx(txId) {
    const tx = await pb.get('transactions', txId);
    if (tx.status !== 'draft') throw new Error('Solo se pueden aprobar transacciones en estado Borrador.');
    await pb.update('transactions', txId, { status: 'active' });
    await this.logAudit('APPROVE', 'transactions', txId, `Transacción ${tx.number} aprobada`);
    return tx;
  },

  async revertTxToDraft(txId) {
    const tx = await pb.get('transactions', txId);
    if (tx.status !== 'active') throw new Error('Solo se pueden revertir transacciones Activas a Borrador.');
    await pb.update('transactions', txId, { status: 'draft' });
    await this.logAudit('REVERT_DRAFT', 'transactions', txId, `Transacción ${tx.number} revertida a Borrador`);
    return tx;
  },

  async updateTransaction(txId, txData, lines) {
    await pb.update('transactions', txId, txData);
    // Reemplazar líneas: eliminar las existentes y crear las nuevas
    const safeId = pb.escapeFilterValue(txId);
    const oldLines = await pb.listAll('tx_lines', { filter: `tx_id="${safeId}"` });
    for (const l of oldLines) {
      await pb.delete('tx_lines', l.id);
    }
    for (const line of lines) {
      await pb.create('tx_lines', { tx_id: txId, ...line });
    }
    await this.logAudit('UPDATE', 'transactions', txId, 'Modificación desde consulta de transacciones');
  },

  async checkTxDependencies(txId) {
    const safe = pb.escapeFilterValue(txId);
    const blocks = [];
    const warnings = [];

    // BLOQUEO: Solo documentos electrónicos ya enviados o aceptados por la DIAN (firmados = inmutables)
    // Los estados "pendiente" y "rechazada" NO bloquean porque aún no tienen validez fiscal.
    const einv = await pb.list('einvoice_docs', {
      filter: `tx_id="${safe}" && (status="enviada" || status="aceptada")`,
      perPage: 1,
    });
    if (einv.totalItems > 0) {
      const doc = einv.items[0];
      const estado = doc.status === 'aceptada' ? 'Aceptada por DIAN' : 'Enviada a DIAN';
      blocks.push(`Este comprobante tiene un documento electrónico DIAN con estado "${estado}". Los documentos fiscales ya transmitidos son inalterables por normativa tributaria.`);
    }

    // ADVERTENCIA: Período de nómina vinculado (informativo — no bloquea)
    const payP = await pb.list('payroll_periods', { filter: `tx_id="${safe}"`, perPage: 1 });
    if (payP.totalItems > 0) {
      const period = payP.items[0];
      const estadoLabel = { draft: 'Borrador', approved: 'Aprobado', paid: 'Pagado' }[period.status] || period.status;
      warnings.push(`Este comprobante es el asiento de nómina del período "${period.name}" (${estadoLabel}). Si lo modificas, el asiento contable de nómina quedará desincronizado con las liquidaciones.`);
    }

    // ADVERTENCIA: Movimientos bancarios conciliados (informativo — no bloquea)
    const txLines = await pb.listAll('tx_lines', { filter: `tx_id="${safe}"` });
    let reconCount = 0;
    if (txLines.length > 0) {
      const lineFilter = txLines
        .map(l => `tx_line_id="${pb.escapeFilterValue(l.id)}"`)
        .join(' || ');
      const bm = await pb.list('bank_movements', {
        filter: `(${lineFilter}) && reconciled=true`,
        perPage: 1,
      });
      reconCount = bm.totalItems;
    }
    if (reconCount > 0) {
      warnings.push(`Tiene ${reconCount} movimiento(s) bancario(s) conciliado(s). Revisa la conciliación bancaria después de modificar.`);
    }

    return { blocks, warnings };
  },

  // -- Productos ---------------------------------------------
  async getProducts(opts = {}) {
    const { activeOnly = true, query = '', type = '' } = opts;
    let filter = activeOnly ? 'active=true' : '';
    if (type) {
      const safeType = pb.escapeFilterValue(type);
      filter += (filter ? ' && ' : '') + `type="${safeType}"`;
    }
    if (query) {
      const safeQ = pb.escapeFilterValue(query);
      filter += (filter ? ' && ' : '') + `(name~"${safeQ}" || code~"${safeQ}")`;
    }
    return pb.listAll('products', {
      filter,
      sort: 'code',
      expand: 'income_account_id,cost_account_id,inventory_account_id',
    });
  },

  // -- Dashboard KPIs ----------------------------------------
  async getDashboardKpis() {
    const [txCount, tpCount, acCount] = await Promise.all([
      pb.list('transactions', { perPage: 1 }),
      pb.list('third_parties', { filter: 'active=true', perPage: 1 }),
      pb.list('accounts',       { filter: 'active=true', perPage: 1 }),
    ]);
    return {
      totalTx: txCount.totalItems,
      totalTp: tpCount.totalItems,
      totalAc: acCount.totalItems,
    };
  },

  // -- Inventarios -------------------------------------------

  /** Bodegas */
  async getWarehouses(activeOnly = true) {
    const filter = activeOnly ? 'active=true' : '';
    return pb.listAll('warehouses', { filter, sort: 'code' });
  },

  /** Stock actual (kardex resumen) con expand a producto y bodega */
  async getInventoryStock(opts = {}) {
    const { warehouseId = '', productId = '' } = opts;
    let filter = '';
    if (warehouseId) filter += `warehouse_id="${pb.escapeFilterValue(warehouseId)}"`;
    if (productId)   filter += (filter ? ' && ' : '') + `product_id="${pb.escapeFilterValue(productId)}"`;
    return pb.listAll('inventory_stock', {
      filter,
      sort:   'product_id',
      expand: 'product_id,warehouse_id',
    });
  },

  /** Upsert de stock: si ya existe el registro producto+bodega lo actualiza; si no lo crea */
  async upsertStock(productId, warehouseId, deltaQty, newAvgCost = null, date = '') {
    const safeP = pb.escapeFilterValue(productId);
    const safeW = pb.escapeFilterValue(warehouseId);
    const existing = await pb.list('inventory_stock', {
      filter: `product_id="${safeP}" && warehouse_id="${safeW}"`,
      perPage: 1,
    });
    const today = date || new Date().toISOString().slice(0, 10);
    if (existing.items.length) {
      const rec = existing.items[0];
      const newQty = Math.max(0, (rec.qty_on_hand ?? 0) + deltaQty);
      const avgCost = newAvgCost !== null ? newAvgCost : (rec.avg_cost ?? 0);
      return pb.update('inventory_stock', rec.id, {
        qty_on_hand: newQty, avg_cost: avgCost, last_mov_date: today,
      });
    }
    return pb.create('inventory_stock', {
      product_id: productId, warehouse_id: warehouseId,
      qty_on_hand: Math.max(0, deltaQty),
      avg_cost: newAvgCost ?? 0,
      last_mov_date: today,
    });
  },

  /** Movimientos de inventario paginados */
  async getInventoryMovements(opts = {}) {
    const { page = 1, perPage = 50, filter = '', sort = '-date' } = opts;
    return pb.list('inventory_movements', {
      page, perPage, filter, sort,
      expand: 'warehouse_id,dest_warehouse_id,third_party_id',
    });
  },

  /** Líneas de un movimiento */
  async getInventoryMovementLines(movementId) {
    const safe = pb.escapeFilterValue(movementId);
    return pb.listAll('inventory_movement_lines', {
      filter: `movement_id="${safe}"`,
      sort:   'line_order',
      expand: 'product_id',
    });
  },

  /** Aplica un movimiento: actualiza stock + genera asiento contable si procede */
  async applyInventoryMovement(movId) {
    const mov   = await pb.get('inventory_movements', movId, { expand: 'warehouse_id,dest_warehouse_id' });
    if (mov.status === 'applied') throw new Error('El movimiento ya fue aplicado.');
    if (mov.status === 'voided')  throw new Error('El movimiento está anulado.');

    const lines = await this.getInventoryMovementLines(movId);
    if (!lines.length) throw new Error('El movimiento no tiene líneas.');

    const today  = mov.date || new Date().toISOString().slice(0, 10);
    const isIn   = mov.mov_type === 'ENTRADA' || mov.mov_type === 'AJUSTE_POSITIVO';
    const isOut  = mov.mov_type === 'SALIDA'  || mov.mov_type === 'AJUSTE_NEGATIVO';
    const isTran = mov.mov_type === 'TRASLADO';

    for (const line of lines) {
      const delta = isIn ? line.qty : isOut ? -line.qty : 0;
      if (isTran) {
        await this.upsertStock(line.product_id, mov.warehouse_id,      -line.qty, null, today);
        await this.upsertStock(line.product_id, mov.dest_warehouse_id,  line.qty, null, today);
      } else {
        await this.upsertStock(line.product_id, mov.warehouse_id, delta, line.unit_cost ?? null, today);
      }
    }

    await pb.update('inventory_movements', movId, { status: 'applied' });
    await this.logAudit('APPLY', 'InventoryMovement', movId, `${mov.mov_type} — ${mov.number}`);
    return mov;
  },

  /** Anula un movimiento aplicado revirtiendo el stock */
  async voidInventoryMovement(movId) {
    const mov   = await pb.get('inventory_movements', movId);
    if (mov.status !== 'applied') throw new Error('Solo se pueden anular movimientos ya aplicados.');

    const lines = await this.getInventoryMovementLines(movId);
    const today  = new Date().toISOString().slice(0, 10);
    const isIn   = mov.mov_type === 'ENTRADA' || mov.mov_type === 'AJUSTE_POSITIVO';
    const isOut  = mov.mov_type === 'SALIDA'  || mov.mov_type === 'AJUSTE_NEGATIVO';
    const isTran = mov.mov_type === 'TRASLADO';

    for (const line of lines) {
      const delta = isIn ? -line.qty : isOut ? line.qty : 0;
      if (isTran) {
        await this.upsertStock(line.product_id, mov.warehouse_id,      line.qty,  null, today);
        await this.upsertStock(line.product_id, mov.dest_warehouse_id, -line.qty, null, today);
      } else {
        await this.upsertStock(line.product_id, mov.warehouse_id, delta, null, today);
      }
    }

    await pb.update('inventory_movements', movId, { status: 'voided' });
    await this.logAudit('VOID', 'InventoryMovement', movId, `Anulación ${mov.mov_type} — ${mov.number}`);
  },

  // ── Compras ───────────────────────────────────────────────

  /** Lista paginada de facturas de compra */
  async getPurchaseInvoices(opts = {}) {
    const { page = 1, perPage = 50, filter = '', sort = '-date' } = opts;
    return pb.list('purchase_invoices', {
      page, perPage, filter, sort,
      expand: 'supplier_id,warehouse_id,tx_type_id',
    });
  },

  /** Líneas de una factura de compra con expand de producto y cuenta */
  async getPurchaseInvoiceLines(invoiceId) {
    const safe = pb.escapeFilterValue(invoiceId);
    return pb.listAll('purchase_invoice_lines', {
      filter:  `invoice_id="${safe}"`,
      sort:    'line_order',
      expand:  'product_id,account_id',
    });
  },

  /** Crea cabecera + líneas de factura de compra en estado borrador */
  async createPurchaseInvoice(header, lines) {
    const txTypeId = String(header?.tx_type_id || '').trim();
    const txNumber = String(header?.tx_number || '').trim();
    if (!txTypeId) throw new Error('Debes seleccionar el tipo de comprobante contable en la compra.');
    if (!txNumber) throw new Error('Debes definir la numeración del comprobante contable en la compra.');

    // Calcular totales desde las líneas
    let subtotal = 0, ivaTot = 0, retTot = 0;
    for (const l of lines) {
      subtotal += l.subtotal || 0;
      ivaTot   += l.iva_amount || 0;
      retTot   += l.ret_amount || 0;
    }
    const inv = await pb.create('purchase_invoices', {
      ...header,
      subtotal,
      iva_total: ivaTot,
      total:     subtotal + ivaTot,
      ret_total: retTot,
      payable_total: (subtotal + ivaTot) - retTot,
      status:    'draft',
    });

    // Refuerzo de persistencia para instalaciones donde el esquema pudo estar desfasado.
    if (!inv.tx_type_id || !inv.tx_number) {
      await pb.update('purchase_invoices', inv.id, {
        tx_type_id: txTypeId,
        tx_number: txNumber,
      });
    }

    const invStored = await pb.get('purchase_invoices', inv.id);
    if (!invStored.tx_type_id || !invStored.tx_number) {
      throw new Error('No se pudo persistir el comprobante contable de la compra. Reinicia PocketBase para aplicar migraciones y vuelve a intentar.');
    }

    for (let i = 0; i < lines.length; i++) {
      await pb.create('purchase_invoice_lines', {
        invoice_id: inv.id,
        line_order: i + 1,
        ...lines[i],
      });
    }
    await this.logAudit('CREATE', 'PurchaseInvoice', inv.id, `Factura compra ${inv.number}`);
    return invStored;
  },

  /**
   * Contabiliza una factura de compra (draft → posted):
   * 1. Genera asiento FC en transactions (status: draft, listo para aprobar)
   * 2. Para líneas de BIEN: crea movimiento ENTRADA y lo aplica al stock
   * 3. Actualiza la factura con tx_id, inv_movement_id, status=posted
   */
  async postPurchaseInvoice(invoiceId) {
    const inv   = await pb.get('purchase_invoices', invoiceId, { expand: 'supplier_id,warehouse_id,tx_type_id' });
    if (inv.status === 'posted')  throw new Error('La factura ya fue contabilizada.');
    if (inv.status === 'voided')  throw new Error('La factura está anulada.');

    const lines = await this.getPurchaseInvoiceLines(invoiceId);
    if (!lines.length) throw new Error('La factura no tiene líneas.');

    // Configuracion contable de compras (settings.key = purchase_config_v1)
    let purchaseCfg = {};
    try {
      const rawCfg = await this.getSetting('purchase_config_v1');
      purchaseCfg = rawCfg ? JSON.parse(rawCfg) : {};
    } catch (_) {
      purchaseCfg = {};
    }
    const cfgAccounting = purchaseCfg?.accounting || {};
    const cfgAccounts = cfgAccounting?.accounts || {};
    const cfgRetRules = Array.isArray(cfgAccounting?.withholding_rules) ? cfgAccounting.withholding_rules : [];
    const codePayable = String(cfgAccounts.payable_code || '220505').trim();
    const codeExpFallback = String(cfgAccounts.expense_fallback_code || '5135').trim();
    const ivaByRateCfg = (cfgAccounts.iva_by_rate && typeof cfgAccounts.iva_by_rate === 'object')
      ? cfgAccounts.iva_by_rate
      : {};

    const accountByIdCache = {};
    const accountByCodeCache = {};

    const getAccById = async (id) => {
      const key = String(id || '').trim();
      if (!key) throw new Error('Cuenta contable inválida en la compra.');
      if (!accountByIdCache[key]) accountByIdCache[key] = await pb.get('accounts', key);
      return accountByIdCache[key];
    };

    // ── Buscar cuentas clave por código ──────────────────────────────────
    const findAccByCode = async (code) => {
      if (!String(code || '').trim()) throw new Error('Hay una cuenta sin código en la configuración de compras.');
      const key = String(code).trim();
      if (accountByCodeCache[key]) return accountByCodeCache[key];
      const safeCode = pb.escapeFilterValue(key);
      const res = await pb.list('accounts', { filter: `code="${safeCode}"`, perPage: 1 });
      if (!res.items.length) throw new Error(`Cuenta ${key} no encontrada en el plan de cuentas.`);
      accountByCodeCache[key] = res.items[0];
      accountByIdCache[res.items[0].id] = res.items[0];
      return res.items[0];
    };

    const buildTxLine = async ({ accountId, thirdPartyId = null, debit = 0, credit = 0, description = '', crossDocRef = '' }) => {
      const acc = await getAccById(accountId);
      const line = {
        account_id: acc.id,
        third_party_id: thirdPartyId,
        debit,
        credit,
        description,
        line_order: txLines.length + 1,
      };
      if (acc.maneja_cruce && String(crossDocRef || '').trim()) {
        line.cross_doc_ref = String(crossDocRef || '').trim();
      }
      return line;
    };

    const accProveedor  = await findAccByCode(codePayable);   // Proveedores
    const accExpFallback = await findAccByCode(codeExpFallback);
    const ivaAccountCache = {};

    // ── Construir líneas del asiento contable ────────────────────────────
    const txLines = [];
    const bienLines = [];
    const ivaByRate = {};
    const retByAccount = {};

    for (const line of lines) {
      const prod = line.expand?.product_id;
      let accountId;
      if (prod) {
        accountId = prod.type === 'BIEN'
          ? prod.inventory_account_id
          : (prod.cost_account_id || accExpFallback.id);
        if (prod.type === 'BIEN' && !accountId) {
          throw new Error(`El producto ${prod.code || ''} ${prod.name || ''} no tiene cuenta de inventario asignada.`.trim());
        }
      } else {
        if (!line.account_id) throw new Error(`Línea sin cuenta contable: "${line.description || '?'}"`);
        accountId = line.account_id;
      }
      txLines.push(await buildTxLine({
        accountId,
        thirdPartyId: inv.supplier_id,
        debit: line.subtotal || 0,
        credit: 0,
        description: line.description || inv.expand?.supplier_id?.name || '',
        crossDocRef: inv.supplier_ref || '',
      }));
      if (prod?.type === 'BIEN') {
        bienLines.push({ product_id: line.product_id, qty: line.qty, unit_cost: line.unit_price, notes: line.description });
      }

      const rateKey = String(Number(line.iva_rate || 0));
      const ivaAmt = Number(line.iva_amount || 0);
      if (ivaAmt > 0) {
        ivaByRate[rateKey] = (ivaByRate[rateKey] || 0) + ivaAmt;
      }

      let retAmt = Number(line.ret_amount || 0);
      let retAccountCode = String(line.ret_account_code || '').trim();
      if (retAmt <= 0 && line.ret_rule_id) {
        const rule = cfgRetRules.find(r => String(r.id || '') === String(line.ret_rule_id || ''));
        if (rule) {
          const baseType = String(line.ret_base_type || rule.base_type || 'SUBTOTAL').toUpperCase();
          const minBase = Number(rule.min_base || 0) || 0;
          const sub = Number(line.subtotal || 0);
          const iva = Number(line.iva_amount || 0);
          const tot = Number(line.total || (sub + iva));
          const base = baseType === 'IVA' ? iva : (baseType === 'TOTAL' ? tot : sub);
          const rate = Number(line.ret_rate || rule.rate || 0) || 0;
          if (base >= minBase && rate > 0) {
            retAmt = base * rate / 100;
            if (!retAccountCode) retAccountCode = String(rule.account_code || '').trim();
          }
        }
      }
      if (retAmt > 0) {
        if (!retAccountCode) {
          throw new Error(`La línea "${line.description || '?'}" tiene retención sin cuenta contable configurada.`);
        }
        retByAccount[retAccountCode] = (retByAccount[retAccountCode] || 0) + retAmt;
      }
    }

    // IVA Descontable por tarifa
    for (const rateKey of Object.keys(ivaByRate)) {
      const amount = Number(ivaByRate[rateKey] || 0);
      if (amount <= 0) continue;
      let accCode = String(ivaByRateCfg[rateKey] || '').trim();
      if (!accCode && Number(rateKey) === 19) accCode = '233502'; // compatibilidad
      if (!accCode) {
        throw new Error(`No hay cuenta IVA configurada para la tarifa ${rateKey}%. Ajusta el engranaje de Compras.`);
      }
      if (!ivaAccountCache[accCode]) ivaAccountCache[accCode] = await findAccByCode(accCode);
      txLines.push(await buildTxLine({
        accountId: ivaAccountCache[accCode].id,
        thirdPartyId: null,
        debit: amount,
        credit: 0,
        description: `IVA ${rateKey}% compra ${inv.number}`,
        crossDocRef: inv.supplier_ref || '',
      }));
    }

    // Retenciones por cuenta (crédito)
    let retTotal = 0;
    for (const accCode of Object.keys(retByAccount)) {
      const amount = Number(retByAccount[accCode] || 0);
      if (amount <= 0) continue;
      retTotal += amount;
      if (!ivaAccountCache[accCode]) ivaAccountCache[accCode] = await findAccByCode(accCode);
      txLines.push(await buildTxLine({
        accountId: ivaAccountCache[accCode].id,
        thirdPartyId: inv.supplier_id,
        debit: 0,
        credit: amount,
        description: `Retenciones compra ${inv.number}`,
        crossDocRef: inv.supplier_ref || '',
      }));
    }
    // Crédito a Proveedores
    const payableCredit = (inv.total || 0) - retTotal;
    txLines.push(await buildTxLine({
      accountId: accProveedor.id,
      thirdPartyId: inv.supplier_id,
      debit: 0,
      credit: payableCredit,
      description: `${inv.supplier_ref ? `Ref: ${inv.supplier_ref} — ` : ''}${inv.expand?.supplier_id?.name || ''}`,
      crossDocRef: inv.supplier_ref || '',
    }));

    // ── Crear transacción contable ───────────────────────────────────────
    let effectiveTxTypeId = String(inv.tx_type_id || '').trim();
    let effectiveTxNumber = String(inv.tx_number || '').trim();

    // Fallback para facturas históricas con datos incompletos de comprobante.
    if (!effectiveTxTypeId) {
      const candidates = [];
      const fromTxNumber = effectiveTxNumber.split('-')[0] || '';
      const fromInvNumber = String(inv.number || '').split('-')[0] || '';
      if (fromTxNumber) candidates.push(fromTxNumber);
      if (fromInvNumber && fromInvNumber !== fromTxNumber) candidates.push(fromInvNumber);

      for (const token of candidates) {
        const safe = pb.escapeFilterValue(token);
        const found = await pb.list('transaction_types', {
          filter: `active=true && (prefix="${safe}" || code="${safe}")`,
          perPage: 1,
        });
        if (found.items.length) {
          effectiveTxTypeId = found.items[0].id;
          break;
        }
      }
    }

    if (!effectiveTxTypeId) throw new Error('La factura no tiene tipo de comprobante contable. Edítala y selecciónalo.');
    if (!effectiveTxNumber) effectiveTxNumber = 'AUTO';

    if (!inv.tx_type_id || !inv.tx_number) {
      await pb.update('purchase_invoices', invoiceId, {
        tx_type_id: effectiveTxTypeId,
        tx_number: effectiveTxNumber,
      });
    }

    const tx = await this.createTransaction({
      tx_type_id:    effectiveTxTypeId,
      number:        effectiveTxNumber,
      date:          inv.date,
      description:   `Compra ${inv.number} — ${inv.expand?.supplier_id?.name || ''}`,
      third_party_id: inv.supplier_id,
      payment_days:  0,
      cross_enabled: false,
      status:        'draft',
    }, txLines);

    // ── Movimiento de inventario para bienes ─────────────────────────────
    let invMovId = null;
    if (bienLines.length && inv.warehouse_id) {
      const today  = inv.date || new Date().toISOString().slice(0, 10);
      const rand   = String(Date.now()).slice(-4);
      const movNumber = `ENT-${today.replaceAll('-', '')}-${rand}`;
      const mov = await pb.create('inventory_movements', {
        number:       movNumber,
        mov_type:     'ENTRADA',
        date:         inv.date,
        warehouse_id: inv.warehouse_id,
        third_party_id: inv.supplier_id,
        notes:        `Compra ${inv.number}`,
        status:       'draft',
        tx_id:        tx.id,
      });
      for (let i = 0; i < bienLines.length; i++) {
        await pb.create('inventory_movement_lines', { movement_id: mov.id, line_order: i + 1, ...bienLines[i] });
      }
      await this.applyInventoryMovement(mov.id);
      invMovId = mov.id;
    }

    // ── Actualizar factura ───────────────────────────────────────────────
    await pb.update('purchase_invoices', invoiceId, {
      status:          'posted',
      tx_id:           tx.id,
      inv_movement_id: invMovId,
      ret_total:       retTotal,
      payable_total:   payableCredit,
    });
    await this.logAudit('POST', 'PurchaseInvoice', invoiceId, `Contabilizada ${inv.number} → TX ${tx.number}`);
    return { inv, tx };
  },

  /** Anula una factura de compra (solo borradores — para simplificar) */
  async voidPurchaseInvoice(invoiceId) {
    const inv = await pb.get('purchase_invoices', invoiceId);
    if (inv.status === 'voided') throw new Error('La factura ya está anulada.');
    if (inv.status === 'posted') throw new Error('No se puede anular una factura ya contabilizada. Anula el asiento contable directamente.');
    await pb.update('purchase_invoices', invoiceId, { status: 'voided' });
    await this.logAudit('VOID', 'PurchaseInvoice', invoiceId, `Anulada ${inv.number}`);
  },
};

