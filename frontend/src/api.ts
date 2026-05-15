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
    try {
      const safeKey = pb.escapeFilterValue(key);
      const existing = await pb.list('settings', { filter: `key="${safeKey}"`, perPage: 1 });
      if (existing.items.length) {
        return await pb.update('settings', existing.items[0].id, { value });
      }
      return await pb.create('settings', { key, value });
    } catch (err) {
      const msg = String(err?.message || '').toLowerCase();
      if (err?.status === 400 || err?.status === 403 || msg.includes('allowed') || msg.includes('permission')) {
        throw new Error('No tienes permisos para modificar configuración global.');
      }
      throw err;
    }
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

  async getAuditLogs(opts = {}) {
    const {
      entity = '',
      entityId = '',
      actions = [],
      sort = '-event_at',
      limit = 100,
    } = opts;

    const filters = [];
    if (entity) filters.push(`entity="${pb.escapeFilterValue(entity)}"`);
    if (entityId) filters.push(`entity_id="${pb.escapeFilterValue(entityId)}"`);
    if (Array.isArray(actions) && actions.length) {
      const actionFilter = actions
        .map(a => `action="${pb.escapeFilterValue(a)}"`)
        .join(' || ');
      filters.push(`(${actionFilter})`);
    }

    return pb.listAll('audit_log', {
      filter: filters.join(' && ') || '',
      sort,
      perPage: Math.max(1, Math.min(200, Number(limit) || 100)),
    });
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
    const tx = await pb.get('transactions', txId);
    if (tx.status === 'voided') return tx;
    await pb.update('transactions', txId, { status: 'voided' });
    await this.logAudit('VOID', 'transactions', txId, description || `Transacción ${tx.number} anulada`);
    return tx;
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
      await pb.update('inventory_stock', rec.id, {
        qty_on_hand: newQty, avg_cost: avgCost, last_mov_date: today,
      });
    } else {
      await pb.create('inventory_stock', {
        product_id: productId, warehouse_id: warehouseId,
        qty_on_hand: Math.max(0, deltaQty),
        avg_cost: newAvgCost ?? 0,
        last_mov_date: today,
      });
    }
    // Actualizar último costo en el producto cuando viene de una entrada con costo
    if (newAvgCost !== null && newAvgCost > 0) {
      await pb.update('products', productId, { cost_price: newAvgCost });
    }
    return;
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
  async voidInventoryMovement(movId, reason = '') {
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
    await this.logAudit('VOID', 'InventoryMovement', movId, `Anulación ${mov.mov_type} — ${mov.number}${reason ? ` | Motivo: ${reason}` : ''}`);
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
    const payableTotal = (subtotal + ivaTot) - retTot;
    const inv = await pb.create('purchase_invoices', {
      ...header,
      subtotal,
      iva_total: ivaTot,
      total:     payableTotal,
      ret_total: retTot,
      payable_total: payableTotal,
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

    // ── Retenciones de encabezado (modo global) ──────────────────────────
    // Cuando las retenciones se capturan a nivel de encabezado (no por línea),
    // el invoice guarda ret_rule_renta_id / ret_rule_ica_id / ret_rule_iva_id.
    // Computamos esos montos aquí para que queden en retByAccount.
    {
      const aggSub   = lines.reduce((s, l) => s + Number(l.subtotal    || 0), 0);
      const aggIva   = lines.reduce((s, l) => s + Number(l.iva_amount  || 0), 0);
      const aggTotal = aggSub + aggIva;
      const hdrRules = [
        { id: String(inv.ret_rule_renta_id || '').trim(), kind: 'renta' },
        { id: String(inv.ret_rule_ica_id   || '').trim(), kind: 'ica'   },
        { id: String(inv.ret_rule_iva_id   || '').trim(), kind: 'iva'   },
      ];
      for (const { id, kind } of hdrRules) {
        if (!id) continue;
        const rule = cfgRetRules.find(r => String(r.id || '') === id);
        if (!rule) continue;
        const minBase = Number(rule.min_base || 0) || 0;
        // ReteIVA siempre usa IVA como base; los demás respetan base_type de la regla
        let base;
        if (kind === 'iva') {
          base = aggIva;
        } else {
          const baseType = String(rule.base_type || 'SUBTOTAL').toUpperCase();
          base = baseType === 'IVA' ? aggIva : (baseType === 'TOTAL' ? aggTotal : aggSub);
        }
        if (base <= 0 || base < minBase) continue;
        const rate = Number(rule.rate || 0) || 0;
        if (rate <= 0) continue;
        const amt = base * rate / 100;
        const code = String(rule.account_code || '').trim();
        if (!code) throw new Error(`La regla de retención "${rule.concept}" no tiene cuenta contable configurada.`);
        retByAccount[code] = (retByAccount[code] || 0) + amt;
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
    const grossTotal = Number(inv.subtotal || 0) + Number(inv.iva_total || 0);
    const storedPayable = Number(inv.payable_total || 0);
    const storedTotal = Number(inv.total || 0);
    const payableCredit = storedPayable > 0
      ? storedPayable
      : (storedTotal > 0 && Math.abs(storedTotal - grossTotal) > 0.01 ? storedTotal : (grossTotal - retTotal));
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

  async getPurchaseMutationBlocks(invoiceId) {
    const inv = await pb.get('purchase_invoices', invoiceId, { expand: 'supplier_id,warehouse_id' });
    const blocks = [];
    const details = {
      crossRefs: [],
      downstreamTx: [],
      stockShortages: [],
    };

    if (inv.tx_id) {
      const deps = await this.checkTxDependencies(inv.tx_id);
      blocks.push(...deps.blocks);

      const txLines = await this.getTxLines(inv.tx_id).catch(() => []);
      const crossRefs = new Set();
      if (String(inv.supplier_ref || '').trim()) crossRefs.add(String(inv.supplier_ref || '').trim());
      txLines.forEach((line) => {
        const ref = String(line.cross_doc_ref || '').trim();
        if (ref) crossRefs.add(ref);
      });
      details.crossRefs = [...crossRefs];

      if (inv.supplier_id && crossRefs.size) {
        for (const ref of crossRefs) {
          const rows = await pb.listAll('tx_lines', {
            filter: `third_party_id="${pb.escapeFilterValue(inv.supplier_id)}" && cross_doc_ref="${pb.escapeFilterValue(ref)}"`,
            expand: 'account_id,tx_id',
            sort: '-id',
          });
          const related = rows.filter((line) => {
            if (!line || line.tx_id === inv.tx_id) return false;
            if ((line.expand?.tx_id?.status || '') === 'voided') return false;
            return String(line.cross_doc_ref || '').trim() === ref;
          });
          if (related.length) {
            details.downstreamTx.push(...related.map(line => ({
              ref,
              txNumber: line.expand?.tx_id?.number || line.tx_id,
              txDate: line.expand?.tx_id?.date || '',
              account: line.expand?.account_id?.code || line.account_id,
              amount: Number(line.debit || 0) || Number(line.credit || 0) || 0,
            })));
          }
        }
      }

      if (details.downstreamTx.length) {
        const sample = details.downstreamTx.slice(0, 3)
          .map(item => `${item.txNumber}${item.txDate ? ` (${item.txDate})` : ''}`)
          .join(', ');
        blocks.push(`La compra ya tiene pagos o cruces posteriores sobre el documento ${details.crossRefs.join(', ')}. Transacciones detectadas: ${sample}${details.downstreamTx.length > 3 ? '…' : ''}.`);
      }
    }

    if (inv.inv_movement_id) {
      const mov = await pb.get('inventory_movements', inv.inv_movement_id).catch(() => null);
      const movementWarehouseId = mov?.warehouse_id || inv.warehouse_id || '';
      const movLines = await this.getInventoryMovementLines(inv.inv_movement_id).catch(() => []);
      for (const line of movLines) {
        const stockRows = movementWarehouseId
          ? await this.getInventoryStock({ warehouseId: movementWarehouseId, productId: line.product_id }).catch(() => [])
          : [];
        const qtyOnHand = Number(stockRows[0]?.qty_on_hand || 0);
        const requiredQty = Number(line.qty || 0);
        if (qtyOnHand + 0.0001 < requiredQty) {
          details.stockShortages.push({
            product: line.expand?.product_id?.name || line.product_id,
            requiredQty,
            qtyOnHand,
          });
        }
      }
      if (details.stockShortages.length) {
        const sample = details.stockShortages
          .slice(0, 3)
          .map(item => `${item.product} (disp. ${fmtN(item.qtyOnHand)} / compra ${fmtN(item.requiredQty)})`)
          .join(', ');
        blocks.push(`La entrada de inventario ya tuvo efectos posteriores y no se puede revertir sin descuadrar stock. Productos afectados: ${sample}${details.stockShortages.length > 3 ? '…' : ''}.`);
      }
    }

    return { inv, blocks, details };
  },

  async rollbackPurchasePosting(invoiceId, actionLabel = 'anular', reason = '') {
    const inv = await pb.get('purchase_invoices', invoiceId);
    if (inv.status !== 'posted') {
      return {
        inv,
        txVoided: false,
        movementVoided: false,
      };
    }

    if (typeof isPeriodClosed === 'function') {
      const closed = await isPeriodClosed(inv.date);
      if (closed) throw new Error(`El período ${(inv.date || '').slice(0, 7)} está cerrado. No se puede ${actionLabel} la compra.`);
    }

    const mutationCheck = await this.getPurchaseMutationBlocks(invoiceId);
    if (mutationCheck.blocks.length) throw new Error(mutationCheck.blocks[0]);

    if (inv.tx_id) {
      const tx = await pb.get('transactions', inv.tx_id).catch(() => null);
      if (tx && tx.status !== 'voided') {
        await this.voidTransaction(inv.tx_id, `${actionLabel} compra ${inv.number}${reason ? ` | Motivo: ${reason}` : ''}`);
      }
    }

    if (inv.inv_movement_id) {
      const mov = await pb.get('inventory_movements', inv.inv_movement_id).catch(() => null);
      if (mov && mov.status === 'applied') {
        await this.voidInventoryMovement(inv.inv_movement_id, reason);
      } else if (mov && mov.status !== 'voided') {
        await pb.update('inventory_movements', inv.inv_movement_id, { status: 'voided' });
        await this.logAudit('VOID', 'InventoryMovement', inv.inv_movement_id, `Anulación ${mov.mov_type || 'MOV'} — ${mov.number || ''}${reason ? ` | Motivo: ${reason}` : ''}`.trim());
      }
    }

    return {
      inv,
      txVoided: !!inv.tx_id,
      movementVoided: !!inv.inv_movement_id,
    };
  },

  async reopenPurchaseInvoice(invoiceId, reason = '') {
    const safeReason = String(reason || '').trim();
    if (!safeReason) throw new Error('Debes indicar el motivo de reapertura.');
    const result = await this.rollbackPurchasePosting(invoiceId, 'reabrir', safeReason);
    const inv = result.inv;
    if (inv.status === 'voided') throw new Error('La factura está anulada y no se puede reabrir.');
    if (inv.status === 'draft') throw new Error('La factura ya está en borrador.');

    await pb.update('purchase_invoices', invoiceId, {
      status: 'draft',
      tx_id: null,
      inv_movement_id: null,
    });
    await this.logAudit('REOPEN', 'PurchaseInvoice', invoiceId, `Reabierta ${inv.number} para corrección | Motivo: ${safeReason}`);
    return pb.get('purchase_invoices', invoiceId, { expand: 'supplier_id,warehouse_id,tx_type_id' });
  },

  /** Anula una factura de compra manteniendo trazabilidad y revirtiendo efectos si ya fue contabilizada. */
  async voidPurchaseInvoice(invoiceId, reason = '') {
    const safeReason = String(reason || '').trim();
    if (!safeReason) throw new Error('Debes indicar el motivo de anulación.');
    const inv = await pb.get('purchase_invoices', invoiceId);
    if (inv.status === 'voided') throw new Error('La factura ya está anulada.');
    if (inv.status === 'posted') {
      await this.rollbackPurchasePosting(invoiceId, 'anular', safeReason);
    }
    await pb.update('purchase_invoices', invoiceId, { status: 'voided' });
    await this.logAudit('VOID', 'PurchaseInvoice', invoiceId, `Anulada ${inv.number} | Motivo: ${safeReason}`);
  },

  // ── Copropiedades (F8) ────────────────────────────────────

  /** Lista todas las unidades habitacionales */
  async getPhProperties(activeOnly = true) {
    const filter = activeOnly ? 'active=true' : '';
    return pb.listAll('ph_properties', {
      filter,
      sort: 'code',
      expand: 'owner_id,occupant_id',
    });
  },

  /** Zonas comunes */
  async getPhCommonAreas(activeOnly = true) {
    const filter = activeOnly ? 'active=true' : '';
    return pb.listAll('ph_common_areas', { filter, sort: 'code' });
  },

  /** Conceptos de facturación PH */
  async getPhBillingConcepts(activeOnly = true) {
    const filter = activeOnly ? 'active=true' : '';
    return pb.listAll('ph_billing_concepts', {
      filter,
      sort: 'code',
      expand: 'account_id',
    });
  },

  /** Facturas PH paginadas */
  async getPhInvoices(opts = {}) {
    const { page = 1, perPage = 50, filter = '', sort = '-date' } = opts;
    return pb.list('ph_invoices', {
      page, perPage, filter, sort,
      expand: 'property_id,property_id.owner_id',
    });
  },

  /** Líneas de una factura PH */
  async getPhInvoiceLines(invoiceId) {
    const safe = pb.escapeFilterValue(invoiceId);
    return pb.listAll('ph_invoice_lines', {
      filter: `invoice_id="${safe}"`,
      sort:   'line_order',
      expand: 'concept_id,concept_id.account_id',
    });
  },

  /**
   * Genera facturas en borrador para todas las unidades activas en un período YYYY-MM.
   * Omite unidades que ya tienen factura para ese período.
   */
  async generatePhInvoices(period, dueDate = '') {
    const safePeriod = pb.escapeFilterValue(period);
    const [properties, concepts, rawCfg] = await Promise.all([
      this.getPhProperties(true),
      this.getPhBillingConcepts(true),
      this.getSetting('ph_config_v1'),
    ]);
    if (!properties.length) throw new Error('No hay unidades activas registradas.');
    if (!concepts.length)   throw new Error('No hay conceptos de facturación activos.');

    let phCfg = {};
    try { phCfg = rawCfg ? JSON.parse(rawCfg) : {}; } catch (_) { phCfg = {}; }
    const lateFeeRate = Number(phCfg?.late_fee_rate || 0);
    const lateConceptIds = Array.isArray(phCfg?.late_fee_concepts)
      ? phCfg.late_fee_concepts.map(v => String(v || '')).filter(Boolean)
      : [];
    const lateConceptSet = new Set(lateConceptIds);
    const norm = (v) => String(v || '').trim().toLowerCase();
    const lateConceptNameSet = new Set(
      (concepts || [])
        .filter(c => lateConceptSet.has(String(c.id || '')))
        .map(c => norm(c.name))
        .filter(Boolean)
    );

    // Calcular número de secuencia base CF para este batch
    const existingFilter = `period="${safePeriod}"`;
    const existing = await pb.listAll('ph_invoices', { filter: existingFilter, perPage: 200 });
    const existingPropIds = new Set(existing.map(i => i.property_id));

    const toCreate = properties.filter(p => !existingPropIds.has(p.id));
    if (!toCreate.length) throw new Error(`Todas las unidades ya tienen factura para el período ${period}.`);

    const dateStr = period + '-01';
    const dueDateStr = dueDate || (period + '-10');
    let created = 0;

    for (const prop of toCreate) {
      // Fecha de corte de mora: inicio del período que se está liquidando.
      // Así la mora no depende del día real de ejecución del proceso.
      const asOfStr = `${period}-01`;
      const asOf = new Date(`${asOfStr}T00:00:00`);

      // Calcular líneas y total para esta unidad
      const lines = [];
      let total = 0;
      let order = 1;
      for (const c of concepts) {
        let amount = Number(c.amount || 0);
        if (c.applies_coef && prop.coef_participacion > 0) {
          amount = amount * (prop.coef_participacion / 100);
        }
        if (amount <= 0) continue;
        total += amount;
        lines.push({
          concept_id:  c.id,
          description: c.name,
          amount:      Math.round(amount),
          line_order:  order++,
        });
      }

      // Interés de mora por conceptos configurados (sobre facturas vencidas no pagadas).
      if (lateFeeRate > 0 && lateConceptSet.size) {
        const safeProp = pb.escapeFilterValue(prop.id);
        const overdueInvoices = await pb.listAll('ph_invoices', {
          filter: `property_id="${safeProp}" && period!="${safePeriod}" && status!="paid" && status!="voided"`,
          perPage: 200,
        });

        let lateAmount = 0;
        for (const oldInv of overdueInvoices) {
          if (!oldInv?.due_date) continue;
          const due = new Date(`${oldInv.due_date}T00:00:00`);
          if (Number.isNaN(due.getTime())) continue;
          if (due.getTime() >= asOf.getTime()) continue;

          const safeOldInv = pb.escapeFilterValue(oldInv.id);
          const oldLines = await pb.listAll('ph_invoice_lines', {
            filter: `invoice_id="${safeOldInv}"`,
            perPage: 200,
          });

          for (const oldLn of oldLines) {
            const conceptId = String(oldLn?.concept_id || '');
            const descNorm = norm(oldLn?.description);
            const selectedById = conceptId && lateConceptSet.has(conceptId);
            const selectedByDesc = !conceptId && lateConceptNameSet.has(descNorm);
            if (!selectedById && !selectedByDesc) continue;
            const principal = Number(oldLn.amount || 0);
            if (principal <= 0) continue;
            // lateFeeRate se almacena como entero (ej: 2 = 2% mensual).
            // Se aplica una vez sobre el saldo vencido, sin multiplicar por días.
            lateAmount += principal * (lateFeeRate / 100);
          }
        }

        if (lateAmount > 0) {
          const roundedLate = Math.round(lateAmount);
          total += roundedLate;
          lines.push({
            concept_id:  null,
            description: `Interés de mora a ${asOfStr}`,
            amount:      roundedLate,
            line_order:  order++,
          });
        }
      }

      if (!lines.length) continue;

      // Crear cabecera (número AUTO — el hook de PocketBase no aplica aquí,
      // ph_invoices no es "transactions"; generamos número en cliente con timestamp)
      const seq = String(created + 1).padStart(6, '0');
      const number = `CF-${period.replace('-', '')}-${seq}`;

      const inv = await pb.create('ph_invoices', {
        number,
        period,
        property_id: prop.id,
        date:         dateStr,
        due_date:     dueDateStr,
        subtotal:     Math.round(total),
        total:        Math.round(total),
        status:       'draft',
        notes:        '',
      });

      for (const ln of lines) {
        await pb.create('ph_invoice_lines', { invoice_id: inv.id, ...ln });
      }
      created++;
    }

    await this.logAudit('GENERATE', 'PhInvoices', period, `Generadas ${created} facturas PH para ${period}`);
    return created;
  },

  /**
   * Cartera PH por concepto a fecha de corte.
   * Considera facturas no pagadas y no anuladas.
   */
  async getPhPortfolioByConcept(cutoffDate = '') {
    const asOf = String(cutoffDate || new Date().toISOString().slice(0, 10)).trim();
    const safeAsOf = pb.escapeFilterValue(asOf);
    const invoices = await pb.listAll('ph_invoices', {
      filter: `status!="paid" && status!="voided" && date<="${safeAsOf}"`,
      perPage: 200,
      expand: 'property_id',
    });

    const byConcept = new Map();
    for (const inv of invoices) {
      const safeInv = pb.escapeFilterValue(inv.id);
      const lines = await pb.listAll('ph_invoice_lines', {
        filter: `invoice_id="${safeInv}"`,
        perPage: 200,
        expand: 'concept_id',
      });
      const isOverdue = !!inv.due_date && String(inv.due_date) < asOf;

      for (const ln of lines) {
        const conceptId = String(ln.concept_id || 'SIN_CONCEPTO');
        const conceptName = ln.expand?.concept_id?.name || ln.description || 'Sin concepto';
        const key = `${conceptId}`;
        if (!byConcept.has(key)) {
          byConcept.set(key, {
            concept_id: conceptId === 'SIN_CONCEPTO' ? null : conceptId,
            concept_name: conceptName,
            total: 0,
            overdue: 0,
            lines: 0,
          });
        }
        const bucket = byConcept.get(key);
        const amount = Number(ln.amount || 0);
        bucket.total += amount;
        bucket.lines += 1;
        if (isOverdue) bucket.overdue += amount;
      }
    }

    return Array.from(byConcept.values())
      .sort((a, b) => String(a.concept_name || '').localeCompare(String(b.concept_name || '')));
  },

  /**
   * Contabiliza en lote la liquidación de un período PH.
   * Solo procesa facturas en draft; omite posted/paid/voided.
   */
  async postPhInvoicesByPeriod(period) {
    const safePeriod = pb.escapeFilterValue(period);
    const invoices = await pb.listAll('ph_invoices', { filter: `period="${safePeriod}"`, perPage: 200 });
    if (!invoices.length) throw new Error(`No hay facturas para el período ${period}.`);

    let posted = 0;
    let skipped = 0;
    let failed = 0;
    const failures = [];

    for (const inv of invoices) {
      if (inv.status !== 'draft') {
        skipped++;
        continue;
      }
      try {
        await this.postPhInvoice(inv.id);
        posted++;
      } catch (err) {
        failed++;
        failures.push(`${inv.number || inv.id}: ${err?.message || 'Error'}`);
      }
    }

    await this.logAudit(
      'POST_PERIOD',
      'PhInvoices',
      period,
      `Período ${period}: contabilizadas ${posted}, omitidas ${skipped}, fallidas ${failed}`,
    );

    return { period, total: invoices.length, posted, skipped, failed, failures };
  },

  /**
   * Descontabiliza una sola factura PH (posted/paid -> draft).
   * Intenta pasar el asiento a draft; si falla, lo anula.
   */
  async unpostPhInvoice(invoiceId) {
    const inv = await pb.get('ph_invoices', invoiceId);
    if (inv.status === 'draft') throw new Error('La factura ya está en borrador.');
    if (inv.status === 'voided') throw new Error('La factura está anulada y no se puede descontabilizar.');

    let txAction = 'none';
    if (inv.tx_id) {
      try {
        await pb.update('transactions', inv.tx_id, { status: 'draft' });
        txAction = 'draft';
      } catch (_) {
        await pb.update('transactions', inv.tx_id, { status: 'voided' });
        txAction = 'voided';
      }
    }

    await pb.update('ph_invoices', invoiceId, { status: 'draft', tx_id: null });
    await this.logAudit('UNPOST', 'PhInvoice', invoiceId, `Descontabilizada ${inv.number || invoiceId} | TX->${txAction}`);
    return { invoiceId, txAction };
  },

  /**
   * Descontabiliza completamente la liquidación de un período PH.
   * - Facturas posted/paid pasan a draft y se desvinculan del asiento (tx_id = null).
   * - El asiento asociado se intenta pasar a borrador; si falla, se anula.
   */
  async unpostPhInvoicesByPeriod(period) {
    const safePeriod = pb.escapeFilterValue(period);
    const invoices = await pb.listAll('ph_invoices', { filter: `period="${safePeriod}"`, perPage: 200 });
    if (!invoices.length) throw new Error(`No hay facturas para el período ${period}.`);

    let reverted = 0;
    let skipped = 0;
    let txDraft = 0;
    let txVoided = 0;

    for (const inv of invoices) {
      if (inv.status === 'draft') {
        skipped++;
        continue;
      }
      if (inv.status === 'voided') {
        skipped++;
        continue;
      }

      if (inv.tx_id) {
        try {
          await pb.update('transactions', inv.tx_id, { status: 'draft' });
          txDraft++;
        } catch (_) {
          await pb.update('transactions', inv.tx_id, { status: 'voided' });
          txVoided++;
        }
      }

      await pb.update('ph_invoices', inv.id, { status: 'draft', tx_id: null });
      reverted++;
    }

    await this.logAudit(
      'UNPOST_PERIOD',
      'PhInvoices',
      period,
      `Período ${period}: descontabilizadas ${reverted}, omitidas ${skipped}, TX->draft ${txDraft}, TX->voided ${txVoided}`,
    );

    return { period, total: invoices.length, reverted, skipped, txDraft, txVoided };
  },

  /**
   * Elimina toda la liquidación de un período PH.
   * - Intenta eliminar transacciones asociadas.
   * - Si no puede eliminarlas, las anula para no dejar efecto contable.
   */
  async deletePhInvoicesByPeriod(period) {
    const safePeriod = pb.escapeFilterValue(period);
    const invoices = await pb.listAll('ph_invoices', { filter: `period="${safePeriod}"`, perPage: 200 });
    if (!invoices.length) throw new Error(`No hay facturas para el período ${period}.`);

    let deleted = 0;
    let txDeleted = 0;
    let txVoided = 0;

    for (const inv of invoices) {
      if (inv.tx_id) {
        try {
          await pb.delete('transactions', inv.tx_id);
          txDeleted++;
        } catch (_) {
          await pb.update('transactions', inv.tx_id, { status: 'voided' });
          txVoided++;
        }
      }

      await pb.delete('ph_invoices', inv.id);
      deleted++;
    }

    await this.logAudit(
      'DELETE_PERIOD',
      'PhInvoices',
      period,
      `Período ${period}: facturas eliminadas ${deleted}, TX eliminadas ${txDeleted}, TX anuladas ${txVoided}`,
    );

    return { period, total: invoices.length, deleted, txDeleted, txVoided };
  },

  /**
   * Contabiliza una factura PH (draft → posted).
   * Genera un asiento: Débito CxC propietario / Crédito ingresos por concepto.
   */
  async postPhInvoice(invoiceId) {
    const inv = await pb.get('ph_invoices', invoiceId, {
      expand: 'property_id,property_id.owner_id',
    });
    if (inv.status === 'posted') throw new Error('La factura ya fue contabilizada.');
    if (inv.status === 'voided') throw new Error('La factura está anulada.');

    const lines = await this.getPhInvoiceLines(invoiceId);
    if (!lines.length) throw new Error('La factura no tiene líneas.');

    // Leer configuración contable PH
    let phCfg = {};
    try {
      const raw = await this.getSetting('ph_config_v1');
      phCfg = raw ? JSON.parse(raw) : {};
    } catch (_) { phCfg = {}; }

    const cxcCode    = String(phCfg.cxc_code    || '130505').trim();
    const incomeCode = String(phCfg.income_code  || '413505').trim();
    const lateFeeIncomeCode = String(phCfg.late_fee_income_code || incomeCode).trim();
    const crossRef   = String(inv.number || '').trim();

    // Buscar tipo de transacción CF
    const cfTypes = await pb.list('transaction_types', {
      filter: 'code="CF" && active=true',
      perPage: 1,
    });
    if (!cfTypes.items.length) throw new Error('Tipo de transacción CF no encontrado. Reinicia PocketBase para aplicar la migración.');
    const txType = cfTypes.items[0];

    // Propietario de la unidad (para third_party en asiento)
    const property = inv.expand?.property_id;
    const ownerId  = property?.owner_id || null;

    const accountByIdCache = {};
    const accountByCodeCache = {};
    const getAccById = async (id) => {
      const key = String(id || '').trim();
      if (!key) throw new Error('Cuenta contable inválida.');
      if (!accountByIdCache[key]) accountByIdCache[key] = await pb.get('accounts', key);
      return accountByIdCache[key];
    };
    const findAccByCode = async (code) => {
      const key = String(code || '').trim();
      if (!key) throw new Error('Código de cuenta inválido.');
      if (accountByCodeCache[key]) return accountByCodeCache[key];
      const safeCode = pb.escapeFilterValue(key);
      const res = await pb.list('accounts', { filter: `code="${safeCode}"`, perPage: 1 });
      if (!res.items.length) throw new Error(`Cuenta "${key}" no encontrada.`);
      const acc = res.items[0];
      accountByCodeCache[key] = acc;
      accountByIdCache[acc.id] = acc;
      return acc;
    };

    // Buscar cuentas base por código
    const cxcAccount = await findAccByCode(cxcCode);
    const incomeDefaultAccount = await findAccByCode(incomeCode);

    const buildTxLine = async ({ accountId, debit = 0, credit = 0, description = '', thirdPartyId = null, crossDocRef = '' }) => {
      const acc = await getAccById(accountId);
      const line = {
        account_id: acc.id,
        debit: Number(debit || 0),
        credit: Number(credit || 0),
        description: String(description || ''),
        line_order: 0,
      };

      if (acc.requires_third_party) {
        const resolvedThird = thirdPartyId || ownerId || null;
        if (!resolvedThird) {
          throw new Error(`La cuenta ${acc.code} - ${acc.name} requiere tercero y la unidad no tiene propietario.`);
        }
        line.third_party_id = resolvedThird;
      } else {
        line.third_party_id = thirdPartyId || null;
      }

      if (acc.maneja_cruce) {
        const ref = String(crossDocRef || crossRef || '').trim();
        if (!ref) {
          throw new Error(`La cuenta ${acc.code} - ${acc.name} requiere documento de cruce.`);
        }
        line.cross_doc_ref = ref;
      }

      return line;
    };

    // Construir líneas del asiento contable
    const txLines = [];

    // Líneas de ingreso por concepto (crédito)
    for (const ln of lines) {
      const concept = ln.expand?.concept_id;
      let incomeAccountId = incomeDefaultAccount.id;
      if (ln.account_code) {
        // Override directo en la línea (conceptos individuales manuales)
        const overrideAcc = await findAccByCode(ln.account_code);
        incomeAccountId = overrideAcc.id;
      } else if (concept?.account_id) {
        incomeAccountId = concept.account_id;
      } else if (!ln.concept_id && /inter[eé]s de mora/i.test(String(ln.description || ''))) {
        const lateAcc = await findAccByCode(lateFeeIncomeCode);
        incomeAccountId = lateAcc.id;
      }
      txLines.push(await buildTxLine({
        accountId: incomeAccountId,
        debit: 0,
        credit: Number(ln.amount || 0),
        description: ln.description,
        thirdPartyId: ownerId || null,
        crossDocRef: crossRef,
      }));
    }

    // Línea de débito a CxC (una sola línea por el total)
    const totalAmount = lines.reduce((s, l) => s + Number(l.amount || 0), 0);
    txLines.unshift(await buildTxLine({
      accountId: cxcAccount.id,
      debit: totalAmount,
      credit: 0,
      description: `Cuota ${inv.period} — ${property?.name || property?.code || inv.property_id}`,
      thirdPartyId: ownerId || null,
      crossDocRef: crossRef,
    }));
    // Reordenar
    txLines.forEach((l, i) => { l.line_order = i + 1; });

    // Crear transacción contable
    const userId = pb.currentUser?.id || '';
    const tx = await pb.create('transactions', {
      tx_type_id:    txType.id,
      number:        'AUTO',
      date:          inv.date,
      description:   `Factura PH ${inv.number} — ${property?.name || inv.property_id} — ${inv.period}`,
      third_party_id: ownerId || null,
      cross_enabled: txLines.some(l => !!l.cross_doc_ref),
      status:        'active',
      user_id:       userId || undefined,
    });
    for (const ln of txLines) {
      await pb.create('tx_lines', { tx_id: tx.id, ...ln });
    }

    // Actualizar factura
    await pb.update('ph_invoices', invoiceId, { status: 'posted', tx_id: tx.id });
    await this.logAudit('POST', 'PhInvoice', invoiceId, `Contabilizada ${inv.number} → TX ${tx.number}`);
    return pb.get('ph_invoices', invoiceId, { expand: 'property_id' });
  },

  /** Anula una factura PH: revierte el asiento si existe */
  async voidPhInvoice(invoiceId, reason = '') {
    const safeReason = String(reason || '').trim();
    if (!safeReason) throw new Error('Debes indicar el motivo de anulación.');
    const inv = await pb.get('ph_invoices', invoiceId);
    if (inv.status === 'voided') throw new Error('La factura ya está anulada.');

    if (inv.status === 'posted' && inv.tx_id) {
      // Anular la transacción contable
      await pb.update('transactions', inv.tx_id, { status: 'voided' });
    }
    await pb.update('ph_invoices', invoiceId, { status: 'voided', tx_id: null });
    await this.logAudit('VOID', 'PhInvoice', invoiceId, `Anulada ${inv.number} | Motivo: ${safeReason}`);
  },

  /** Marca una factura PH como pagada */
  async markPhInvoicePaid(invoiceId) {
    const inv = await pb.get('ph_invoices', invoiceId);
    if (inv.status !== 'posted') throw new Error('Solo se pueden marcar como pagadas las facturas contabilizadas.');
    await pb.update('ph_invoices', invoiceId, { status: 'paid' });
    await this.logAudit('PAID', 'PhInvoice', invoiceId, `Marcada como pagada ${inv.number}`);
  },

  /** Reservas */
  async getPhReservations(opts = {}) {
    const { page = 1, perPage = 50, filter = '', sort = '-date' } = opts;
    return pb.list('ph_reservations', {
      page, perPage, filter, sort,
      expand: 'area_id,property_id',
    });
  },

  /** PQRs paginadas */
  async getPhPqrs(opts = {}) {
    const { page = 1, perPage = 50, filter = '', sort = '-created' } = opts;
    try {
      return await pb.list('ph_pqrs', {
        page, perPage, filter, sort,
        expand: 'property_id',
      });
    } catch (_) {
      try {
        return await pb.list('ph_pqrs', {
          page, perPage, filter,
          expand: 'property_id',
        });
      } catch (_2) {
        return { items: [], totalItems: 0, page, perPage };
      }
    }
  },

  /** Genera número de PQR con prefijo PQR-YYYYMMDD-NNNN */
  async nextPhPqrNumber() {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const res   = await pb.list('ph_pqrs', { perPage: 1 });
    const count = (res.totalItems || 0) + 1;
    return `PQR-${today}-${String(count).padStart(4, '0')}`;
  },

  /** Cobros individuales paginados */
  /**
   * Añade líneas de conceptos individuales a una factura en borrador.
   * lines: [{ description, amount, account_code }]
   * Recalcula el total de la factura.
   */
  async addPhIndividualLinesToInvoice(invoiceId, lines) {
    const inv = await pb.get('ph_invoices', invoiceId);
    if (inv.status !== 'draft') throw new Error('Solo se pueden modificar facturas en estado Borrador.');
    const existingLines = await this.getPhInvoiceLines(invoiceId);
    let lineOrder = Math.max(0, ...existingLines.map(l => Number(l.line_order || 0))) + 1;
    for (const ln of lines) {
      await pb.create('ph_invoice_lines', {
        invoice_id:   invoiceId,
        concept_id:   null,
        description:  String(ln.description || ''),
        amount:       Math.round(Number(ln.amount || 0)),
        account_code: String(ln.account_code || ''),
        line_order:   lineOrder++,
      });
    }
    // Recalcular total
    const allLines = await this.getPhInvoiceLines(invoiceId);
    const newTotal = allLines.reduce((s, l) => s + Number(l.amount || 0), 0);
    await pb.update('ph_invoices', invoiceId, { subtotal: newTotal, total: newTotal });
    return newTotal;
  },

  /**
   * Edita una línea manual de factura PH en borrador y recalcula total.
   */
  async updatePhDraftInvoiceLine(lineId, { description = '', amount = 0, account_code = '' } = {}) {
    const line = await pb.get('ph_invoice_lines', lineId);
    const inv = await pb.get('ph_invoices', line.invoice_id);
    if (inv.status !== 'draft') throw new Error('Solo se pueden editar líneas de facturas en borrador.');
    await pb.update('ph_invoice_lines', lineId, {
      description: String(description || '').trim(),
      amount: Math.round(Number(amount || 0)),
      account_code: String(account_code || '').trim() || null,
    });
    const allLines = await this.getPhInvoiceLines(inv.id);
    const newTotal = allLines.reduce((s, l) => s + Number(l.amount || 0), 0);
    await pb.update('ph_invoices', inv.id, { subtotal: newTotal, total: newTotal });
    return { invoiceId: inv.id, total: newTotal };
  },

  /**
   * Elimina una línea manual de factura PH en borrador y recalcula total.
   */
  async deletePhDraftInvoiceLine(lineId) {
    const line = await pb.get('ph_invoice_lines', lineId);
    const inv = await pb.get('ph_invoices', line.invoice_id);
    if (inv.status !== 'draft') throw new Error('Solo se pueden eliminar líneas de facturas en borrador.');
    await pb.delete('ph_invoice_lines', lineId);
    const allLines = await this.getPhInvoiceLines(inv.id);
    const newTotal = allLines.reduce((s, l) => s + Number(l.amount || 0), 0);
    await pb.update('ph_invoices', inv.id, { subtotal: newTotal, total: newTotal });
    return { invoiceId: inv.id, total: newTotal };
  },

  async getPhIndividualCharges(opts = {}) {
    const { page = 1, perPage = 100, filter = '', sort = '' } = opts;
    const params = { page, perPage, filter };
    if (sort) params.sort = sort;
    try {
      return await pb.list('ph_individual_charges', params);
    } catch (_) {
      try {
        return await pb.list('ph_individual_charges', { page, perPage, filter });
      } catch (_2) {
        try {
          // Fallback para esquemas legacy donde el filtro/campo aún no existe.
          return await pb.list('ph_individual_charges', { page, perPage });
        } catch (_3) {
          return { items: [], totalItems: 0, page, perPage };
        }
      }
    }
  },

  /**
   * Calcula dias de mora desde una fecha de vencimiento respecto a una fecha de corte.
   * dueDate: 'YYYY-MM-DD', cutoffDate: 'YYYY-MM-DD' (opcional, por defecto hoy)
   */
  calculateDaysOverdue(dueDate, cutoffDate = null) {
    if (!dueDate) return 0;
    const due = new Date(`${dueDate}T00:00:00Z`);
    let ref = null;
    if (cutoffDate) {
      ref = new Date(`${cutoffDate}T23:59:59Z`);
    } else {
      ref = new Date();
    }
    const diffMs = ref.getTime() - due.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  },

  /**
   * Normaliza etiquetas de concepto para reportes de cartera.
   * Evita separar el mismo concepto por sufijos de fecha (ej. "Interes de mora a 2026-06-01").
   */
  normalizePhCarteraConceptLabel(rawLabel) {
    const txt = String(rawLabel || '').trim();
    if (!txt) return 'Concepto';

    // Unifica variantes de interes de mora con fecha de corte incrustada.
    const moraDatePattern = /^inter[eé]s\s+de\s+mora\s+a\s+\d{4}-\d{2}-\d{2}$/i;
    if (moraDatePattern.test(txt)) return 'Interés de mora';

    return txt;
  },

  async _getPhCarteraDataset(propertyId, fromPeriod = '', toPeriod = '') {
    const safePropertyId = pb.escapeFilterValue(propertyId);
    const safeFrom = pb.escapeFilterValue(fromPeriod);
    const safeTo = pb.escapeFilterValue(toPeriod);
    let filter = `status!="voided"`;
    if (propertyId) filter += ` && property_id="${safePropertyId}"`;
    if (fromPeriod) filter += ` && period>="${safeFrom}"`;
    if (toPeriod) filter += ` && period<="${safeTo}"`;

    let invoices = [];
    try {
      const res = await pb.list('ph_invoices', { filter, perPage: 500, sort: '-date' });
      invoices = res.items || [];
    } catch (_) {
      try {
        const res = await pb.list('ph_invoices', { filter, perPage: 500 });
        invoices = res.items || [];
      } catch (_2) {
        invoices = [];
      }
    }

    let properties = [];
    try {
      properties = await this.getPhProperties(false);
    } catch (_) {
      properties = [];
    }
    const propById = new Map((properties || []).map((p) => [String(p.id), p]));

    // Determinar fecha de corte: acepta YYYY-MM-DD (fecha completa) o YYYY-MM (mes)
    let cutoffDate = null;
    if (toPeriod) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(toPeriod)) {
        cutoffDate = toPeriod;
      } else if (/^\d{4}-\d{2}$/.test(toPeriod)) {
        const [y, m] = toPeriod.split('-').map(Number);
        const lastDay = new Date(y, m, 0).getDate();
        cutoffDate = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      }
    }

    const rows = [];
    for (const inv of invoices) {
      const prop = propById.get(String(inv.property_id)) || null;
      let lines = [];
      try {
        lines = await this.getPhInvoiceLines(inv.id);
      } catch (_) {
        lines = [];
      }
      for (const line of lines) {
        const amount = Number(line.amount || 0);
        const diasMoraRaw = this.calculateDaysOverdue(inv.due_date, cutoffDate);
        const fechaDoc = String(inv.date || inv.created || '').slice(0, 10);
        const venc = String(inv.due_date || '').slice(0, 10);
        const fechaDocDt = fechaDoc ? new Date(`${fechaDoc}T00:00:00Z`) : null;
        const vencDt = venc ? new Date(`${venc}T00:00:00Z`) : null;
        const plazoDias = (fechaDocDt && vencDt)
          ? Math.max(0, Math.floor((vencDt.getTime() - fechaDocDt.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;
        let estado = 'por_vencer';
        if (inv.status === 'paid') {
          estado = 'cancelado';
        } else if (inv.status === 'draft') {
          estado = 'borrador';
        } else if (diasMoraRaw >= 0) {
          estado = 'vencido';
        }
        const diasMora = Math.max(0, diasMoraRaw); // Para mostrar, pero guardamos el raw para bucketize
        const rawConcepto = line.description || line.account_code || 'Concepto';
        const normalizedConcepto = this.normalizePhCarteraConceptLabel(rawConcepto);
        const normalizedConceptId = line.concept_id
          ? String(line.concept_id)
          : String(normalizedConcepto || line.account_code || 'OTROS').toUpperCase();

        rows.push({
          invoice: inv,
          line,
          amount,
          diasMora, // solo para mostrar
          diasMoraRaw, // para bucketize
          plazoDias,
          fechaDoc,
          dueDate: venc,
          estado,
          propertyId: String(inv.property_id || ''),
          propertyCode: String(prop?.code || ''),
          propertyName: String(prop?.name || ''),
          conceptoId: normalizedConceptId,
          concepto: normalizedConcepto,
        });
      }
    }
    return { invoices, rows };
  },

  /**
   * Cartera consolidada por concepto de una unidad.
   * Retorna: [{concepto, conceptoId, totalVencido, totalPorVencer, totalCancelado, totalPendiente, diasMoraMax}]
   */
  async getPhCarteraByUnit(propertyId, fromPeriod = '', toPeriod = '') {
    const { rows } = await this._getPhCarteraDataset(propertyId, fromPeriod, toPeriod);
    const cartera = {};
    for (const r of rows) {
      if (!cartera[r.conceptoId]) {
        cartera[r.conceptoId] = {
          conceptoId: r.conceptoId,
          concepto: r.concepto,
          totalVencido: 0,
          totalPorVencer: 0,
          totalCancelado: 0,
          totalPendiente: 0,
          diasMoraMax: 0,
        };
      }
      if (r.estado === 'cancelado') {
        cartera[r.conceptoId].totalCancelado += r.amount;
      } else if (r.estado === 'vencido') {
        cartera[r.conceptoId].totalVencido += r.amount;
        cartera[r.conceptoId].totalPendiente += r.amount;
        cartera[r.conceptoId].diasMoraMax = Math.max(cartera[r.conceptoId].diasMoraMax, r.diasMora);
      } else {
        cartera[r.conceptoId].totalPorVencer += r.amount;
        cartera[r.conceptoId].totalPendiente += r.amount;
      }
    }
    return Object.values(cartera).sort((a, b) => String(a.concepto).localeCompare(String(b.concepto), 'es'));
  },

  /**
   * Partidas por concepto (fila individual por linea de factura).
   * opts: { conceptoId?: string, estado?: 'all'|'por_vencer'|'vencido'|'cancelado'|'borrador' }
   */
  async getPhCarteraOpenParties(propertyId, fromPeriod = '', toPeriod = '', opts = {}) {
    const { rows } = await this._getPhCarteraDataset(propertyId, fromPeriod, toPeriod);
    const conceptoFilter = String(opts.conceptoId || '').trim();
    const estadoFilter = String(opts.estado || 'all').trim();
    const parties = rows
      .filter((r) => !conceptoFilter || String(r.conceptoId) === conceptoFilter)
      .filter((r) => estadoFilter === 'all' || r.estado === estadoFilter)
      .map((r) => ({
        invoiceId: r.invoice.id,
        invoiceNumber: r.invoice.number,
        periodo: r.invoice.period,
        propertyId: r.propertyId,
        propertyCode: r.propertyCode,
        propertyName: r.propertyName,
        concepto: r.concepto,
        conceptoId: r.conceptoId,
        amount: r.amount,
        fechaDoc: r.fechaDoc,
        plazoDias: r.plazoDias,
        dueDate: r.dueDate,
        diasMora: r.diasMora,
        estado: r.estado,
      }))
      .sort((a, b) => {
        const u = String(a.propertyCode || '').localeCompare(String(b.propertyCode || ''));
        if (u !== 0) return u;
        const p = String(a.periodo || '').localeCompare(String(b.periodo || ''));
        if (p !== 0) return p;
        return String(a.invoiceNumber || '').localeCompare(String(b.invoiceNumber || ''));
      });
    return parties;
  },

  /**
   * Control de integridad para cartera PH de una unidad.
   * Verifica cuadre global y diferencias por factura (total factura vs suma de lineas).
   */
  async getPhCarteraIntegrity(propertyId, fromPeriod = '', toPeriod = '') {
    const { invoices, rows } = await this._getPhCarteraDataset(propertyId, fromPeriod, toPeriod);
    const totals = {
      invoices: invoices.length,
      lines: rows.length,
      totalFacturas: 0,
      totalLineas: 0,
      totalPendiente: 0,
      totalCancelado: 0,
      diferenciaGlobal: 0,
    };

    for (const inv of invoices) totals.totalFacturas += Number(inv.total || 0);
    for (const r of rows) {
      totals.totalLineas += Number(r.amount || 0);
      if (r.estado === 'cancelado') totals.totalCancelado += Number(r.amount || 0);
      else totals.totalPendiente += Number(r.amount || 0);
    }
    totals.diferenciaGlobal = Math.round((totals.totalFacturas - totals.totalLineas) * 100) / 100;

    const byInvoice = {};
    for (const r of rows) {
      const id = r.invoice.id;
      if (!byInvoice[id]) {
        byInvoice[id] = {
          invoiceId: id,
          number: r.invoice.number,
          period: r.invoice.period,
          status: r.invoice.status,
          totalFactura: Number(r.invoice.total || 0),
          totalLineas: 0,
          diferencia: 0,
        };
      }
      byInvoice[id].totalLineas += Number(r.amount || 0);
    }

    const mismatches = Object.values(byInvoice)
      .map((m) => {
        m.diferencia = Math.round((m.totalFactura - m.totalLineas) * 100) / 100;
        return m;
      })
      .filter((m) => Math.abs(m.diferencia) > 1)
      .sort((a, b) => Math.abs(b.diferencia) - Math.abs(a.diferencia));

    return {
      totals,
      mismatches,
      isBalanced: Math.abs(totals.diferenciaGlobal) <= 1 && mismatches.length === 0,
    };
  },
};


// --- VITE MIGRATION GLOBALS ---
(window as any).pb = pb;
(window as any).API = API;
(window as any).PB_URL = PB_URL;
