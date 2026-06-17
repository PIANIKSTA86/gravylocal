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

  /** GET /api/collections/:col/records con filtro y paginacin */
  async list(collection, { filter = '', sort = '', page = 1, perPage = 200, expand = '', ignoreBranch = false } = {}) {
    const branchScoped = ['transactions', 'tx_lines', 'invoices', 'purchase_invoices', 'inventory_movements', 'payroll_periods', 'pos_registers', 'pos_shifts'];
    const activeBranchId = localStorage.getItem('active_branch_id');
    if (activeBranchId && activeBranchId !== 'TODAS' && branchScoped.includes(collection) && !ignoreBranch) {
      const branchFilter = `branch_id = "${this.escapeFilterValue(activeBranchId)}"`;
      filter = filter ? `(${filter}) && ${branchFilter}` : branchFilter;
    }

    const params = new URLSearchParams({ page, perPage });
    if (filter) params.set('filter', filter);
    if (sort) params.set('sort', sort);
    if (expand) params.set('expand', expand);
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

  /** POST  crear registro */
  async create(collection, data) {
    const branchScoped = ['transactions', 'invoices', 'purchase_invoices', 'inventory_movements', 'payroll_periods', 'pos_registers', 'pos_shifts'];
    if (branchScoped.includes(collection) && data && typeof data === 'object' && !(data instanceof FormData)) {
      const activeBranchId = localStorage.getItem('active_branch_id');
      const user = this.currentUser;
      const targetBranchId = (activeBranchId && activeBranchId !== 'TODAS') 
        ? activeBranchId 
        : (user?.default_branch_id || null);
      
      if (targetBranchId && !data.branch_id) {
        data.branch_id = targetBranchId;
      }
    }

    const isForm = data instanceof FormData;
    const headers = isForm ? (this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}) : this.headers();
    const body = isForm ? data : JSON.stringify(data);
    const res = await fetch(`${PB_URL}/api/collections/${collection}/records`, {
      method: 'POST',
      headers: headers,
      body,
    });
    if (!res.ok) throw await this._err(res);
    return res.json();
  },

  /** PATCH  actualizar registro */
  async update(collection, id, data) {
    const isForm = data instanceof FormData;
    const headers = isForm ? (this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}) : this.headers();
    const body = isForm ? data : JSON.stringify(data);
    const res = await fetch(`${PB_URL}/api/collections/${collection}/records/${id}`, {
      method: 'PATCH',
      headers: headers,
      body,
    });
    if (!res.ok) throw await this._err(res);
    return res.json();
  },

  /** DELETE  eliminar registro */
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
    this.authToken = data.token;
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
      this.authToken = null;
      this.currentUser = null;
      return null;
    }
    const data = await res.json();
    this.authToken = data.token;
    this.currentUser = data.record;
    return data;
  },

  /** Cerrar sesi�n */
  logout() {
    this.authToken = null;
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
    err.data = body;
    return err;
  },

  /** Enviar solicitud HTTP genérica */
  async send(path, options = {}) {
    const url = path.startsWith('http') ? path : `${PB_URL}${path}`;
    const headers = { ...this.headers(), ...options.headers };
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body,
    });
    if (!res.ok) throw await this._err(res);
    return res.json();
  },
};

/* -- Helpers internos de resolución de cuentas ---------------- */
const _apiAccountCache = {};
async function _apiFindAccByCode(code) {
  const key = String(code || '').trim();
  if (!key) throw new Error('Se requiere un código de cuenta válido.');
  if (_apiAccountCache[key]) return _apiAccountCache[key];
  const safeCode = pb.escapeFilterValue(key);
  const res = await pb.list('accounts', { filter: `code="${safeCode}"`, perPage: 1 });
  if (!res.items.length) throw new Error(`Cuenta ${key} no encontrada en el plan de cuentas.`);
  _apiAccountCache[key] = res.items[0];
  return res.items[0];
}

async function _apiResolvePayableAccountForThirdParty(thirdParty) {
  const code = String(thirdParty.type || '').toLowerCase();
  if (code.includes('exterior') || code.includes('extranjero')) {
    return await _apiFindAccByCode('220505'); // Proveedores del exterior
  }
  if (thirdParty.name.toLowerCase().includes('dian') || thirdParty.doc_number === '800197268') {
    return await _apiFindAccByCode('233595'); // DIAN / Otros
  }
  // Fallback general a proveedores nacionales o acreedores de flete
  try {
    return await _apiFindAccByCode('233545'); // Acreedores varios - Transportes
  } catch(_) {
    try {
      return await _apiFindAccByCode('233595');
    } catch(_) {
      return await _apiFindAccByCode('220501'); // Proveedores nacionales
    }
  }
}

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
          action: String(action || ''),
          entity: String(entity || ''),
          entity_id: entityId ? String(entityId) : '',
          details: String(details || ''),
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
    // txData: { tx_type_id, number, date, description, third_party_id?, cross_*, user_id, status, branch_id? }
    // lines: [{ account_id, debit, credit, description, line_order, branch_id? }]
    const txBranchId = txData.branch_id || null;
    const tx = await pb.create('transactions', {
      ...txData,
      // El número se asigna en hook server-side al crear transactions.
      number: txData.number || 'AUTO',
      status: txData.status || 'active',
      branch_id: txBranchId,
    });

    try {
      for (const line of lines) {
        await pb.create('tx_lines', {
          tx_id: tx.id,
          ...line,
          branch_id: line.branch_id || txBranchId || null
        });
      }
    } catch (lineErr) {
      // Evita dejar cabeceras hurfanas si falla la persistencia de una lnea.
      try { await pb.delete('transactions', tx.id); } catch (_) { }
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
      try {
        await pb.delete('tx_lines', l.id);
      } catch (err: any) {
        // Ignorar 404: la línea ya fue eliminada (doble submit, edición concurrente, etc.)
        if (err?.status !== 404 && err?.response?.code !== 404) throw err;
      }
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
      pb.list('accounts', { filter: 'active=true', perPage: 1 }),
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
    if (productId) filter += (filter ? ' && ' : '') + `product_id="${pb.escapeFilterValue(productId)}"`;
    return pb.listAll('inventory_stock', {
      filter,
      sort: 'product_id',
      expand: 'product_id,warehouse_id',
    });
  },

  /** Upsert de stock: si ya existe el registro producto+bodega lo actualiza; si no lo crea */
  async upsertStock(productId, warehouseId, deltaQty, newAvgCost = null, date = '', branchId = null) {
    const safeP = pb.escapeFilterValue(productId);
    const safeW = pb.escapeFilterValue(warehouseId);
    const existing = await pb.list('inventory_stock', {
      filter: `product_id="${safeP}" && warehouse_id="${safeW}"`,
      perPage: 1,
    });
    const today = date || new Date().toISOString().slice(0, 10);
    let finalAvgCostForProductUpdate = null;

    let posConfig = { operational: { allow_negative_stock: false } };
    try {
      const rawCfg = await this.getSetting('pos_settings_v1');
      if (rawCfg) posConfig = JSON.parse(rawCfg);
    } catch (_) { }
    const allowNegative = !!posConfig?.operational?.allow_negative_stock;

    if (existing.items.length) {
      const rec = existing.items[0];
      const newQty = allowNegative
        ? (rec.qty_on_hand ?? 0) + deltaQty
        : Math.max(0, (rec.qty_on_hand ?? 0) + deltaQty);

      let avgCost = Number(rec.avg_cost ?? 0);
      if (deltaQty > 0 && newAvgCost !== null) {
        const currentQty = Number(rec.qty_on_hand ?? 0);
        const currentCost = Number(rec.avg_cost ?? 0);
        const totalNewQty = currentQty + deltaQty;

        if (currentQty < 0) {
          // Opción B: Stock negativo resuelto por compra/entrada positiva
          const resolvedQty = Math.min(deltaQty, Math.abs(currentQty));
          const costDiff = newAvgCost - currentCost;
          const totalAdjustment = Math.round((resolvedQty * costDiff) * 100) / 100;

          // El costo promedio de las unidades restantes es el costo de compra
          avgCost = newAvgCost;

          if (Math.abs(totalAdjustment) > 0.009) {
            // Registrar ajuste contable retroactivo (Costo de Ventas vs Inventario)
            try {
              // Obtener producto para ver si tiene cuentas configuradas
              (async () => {
                const prod = await pb.get('products', productId);
                const inventoryAcc = prod.inventory_account_id;
                const costAcc = prod.cost_account_id;

                if (inventoryAcc && costAcc) {
                  let ajType = await pb.listAll('transaction_types', { filter: 'code="AJ"' });
                  if (!ajType.length) {
                    ajType = [await pb.create('transaction_types', {
                      code: 'AJ',
                      prefix: 'AJ',
                      name: 'Ajuste de Inventario',
                      description: 'Ajustes de costeo por stock negativo',
                      consecutive: 0,
                      active: true
                    })];
                  }
                  const txTypeId = ajType[0].id;
                  const rand = String(Date.now()).slice(-4);
                  const txNumber = `AJ-${today.replaceAll('-', '')}-${rand}`;

                  const lines = [
                    {
                      account_id: costAcc,
                      debit: totalAdjustment > 0 ? totalAdjustment : 0,
                      credit: totalAdjustment < 0 ? Math.abs(totalAdjustment) : 0,
                      description: `Ajuste Costo de Ventas retroactivo por negativo resuelto - Prod ${prod.code}`,
                      line_order: 1
                    },
                    {
                      account_id: inventoryAcc,
                      debit: totalAdjustment < 0 ? Math.abs(totalAdjustment) : 0,
                      credit: totalAdjustment > 0 ? totalAdjustment : 0,
                      description: `Ajuste Inventario retroactivo por negativo resuelto - Prod ${prod.code}`,
                      line_order: 2
                    }
                  ];

                  await this.createTransaction({
                    tx_type_id: txTypeId,
                    number: txNumber,
                    date: today,
                    description: `Ajuste automático de costeo por stock negativo resuelto - Prod ${prod.name}`,
                    status: 'active',
                    payment_days: 0,
                    cross_enabled: false,
                    branch_id: branchId || null,
                  }, lines);
                }
              })();
            } catch (err: any) {
              console.error('[GRAVY] Error al generar el ajuste contable retroactivo:', err);
            }
          }
        } else {
          if (totalNewQty > 0) {
            avgCost = Math.round((((currentQty * currentCost) + (deltaQty * newAvgCost)) / totalNewQty) * 100) / 100;
          } else {
            avgCost = newAvgCost;
          }
        }
        finalAvgCostForProductUpdate = avgCost;
      }

      await pb.update('inventory_stock', rec.id, {
        qty_on_hand: newQty, avg_cost: avgCost, last_mov_date: today,
      });
    } else {
      const initialCost = newAvgCost !== null ? newAvgCost : 0;
      const initialQty = allowNegative ? deltaQty : Math.max(0, deltaQty);
      await pb.create('inventory_stock', {
        product_id: productId, warehouse_id: warehouseId,
        qty_on_hand: initialQty,
        avg_cost: initialCost,
        last_mov_date: today,
      });
      if (deltaQty > 0 && newAvgCost !== null) {
        finalAvgCostForProductUpdate = initialCost;
      }
    }
    // Actualizar último costo en el producto cuando viene de una entrada con costo
    if (finalAvgCostForProductUpdate !== null && finalAvgCostForProductUpdate > 0) {
      await pb.update('products', productId, { cost_price: finalAvgCostForProductUpdate });
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
      sort: 'line_order',
      expand: 'product_id',
    });
  },

  /** Aplica un movimiento: actualiza stock + genera asiento contable si procede */
  async applyInventoryMovement(movId) {
    const mov = await pb.get('inventory_movements', movId, { expand: 'warehouse_id,dest_warehouse_id' });
    if (mov.status === 'applied') throw new Error('El movimiento ya fue aplicado.');
    if (mov.status === 'voided') throw new Error('El movimiento está anulado.');

    const lines = await this.getInventoryMovementLines(movId);
    if (!lines.length) throw new Error('El movimiento no tiene líneas.');

    const today = mov.date || new Date().toISOString().slice(0, 10);
    const isIn = mov.mov_type === 'ENTRADA' || mov.mov_type === 'AJUSTE_POSITIVO';
    const isOut = mov.mov_type === 'SALIDA' || mov.mov_type === 'AJUSTE_NEGATIVO';
    const isTran = mov.mov_type === 'TRASLADO';

    for (const line of lines) {
      const delta = isIn ? line.qty : isOut ? -line.qty : 0;
      if (isTran) {
        // Obtener costo promedio en la bodega origen
        const sourceStock = await this.getInventoryStock({ warehouseId: mov.warehouse_id, productId: line.product_id }).catch(() => []);
        const sourceAvgCost = Number(sourceStock[0]?.avg_cost || 0);

        await this.upsertStock(line.product_id, mov.warehouse_id, -line.qty, null, today, mov.branch_id || null);
        await this.upsertStock(line.product_id, mov.dest_warehouse_id, line.qty, sourceAvgCost, today, mov.branch_id || null);
      } else {
        await this.upsertStock(line.product_id, mov.warehouse_id, delta, line.unit_cost ?? null, today, mov.branch_id || null);
      }
    }

    await pb.update('inventory_movements', movId, { status: 'applied' });
    await this.logAudit('APPLY', 'InventoryMovement', movId, `${mov.mov_type} — ${mov.number}`);
    return mov;
  },

  /** Anula un movimiento aplicado revirtiendo el stock */
  async voidInventoryMovement(movId, reason = '') {
    const mov = await pb.get('inventory_movements', movId);
    if (mov.status !== 'applied') throw new Error('Solo se pueden anular movimientos ya aplicados.');

    const lines = await this.getInventoryMovementLines(movId);
    const today = new Date().toISOString().slice(0, 10);
    const isIn = mov.mov_type === 'ENTRADA' || mov.mov_type === 'AJUSTE_POSITIVO';
    const isOut = mov.mov_type === 'SALIDA' || mov.mov_type === 'AJUSTE_NEGATIVO';
    const isTran = mov.mov_type === 'TRASLADO';

    for (const line of lines) {
      const delta = isIn ? -line.qty : isOut ? line.qty : 0;
      if (isTran) {
        await this.upsertStock(line.product_id, mov.warehouse_id, line.qty, null, today, mov.branch_id || null);
        await this.upsertStock(line.product_id, mov.dest_warehouse_id, -line.qty, null, today, mov.branch_id || null);
      } else {
        await this.upsertStock(line.product_id, mov.warehouse_id, delta, null, today, mov.branch_id || null);
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
      filter: `invoice_id="${safe}"`,
      sort: 'line_order',
      expand: 'product_id,account_id',
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
      ivaTot += l.iva_amount || 0;
      retTot += l.ret_amount || 0;
    }
    const payableTotal = (subtotal + ivaTot) - retTot;
    const inv = await pb.create('purchase_invoices', {
      ...header,
      subtotal,
      iva_total: ivaTot,
      total: payableTotal,
      ret_total: retTot,
      payable_total: payableTotal,
      status: 'draft',
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
    const inv = await pb.get('purchase_invoices', invoiceId, { expand: 'supplier_id,warehouse_id,tx_type_id' });
    if (inv.status === 'posted') throw new Error('La factura ya fue contabilizada.');
    if (inv.status === 'voided') throw new Error('La factura está anulada.');

    const lines = await this.getPurchaseInvoiceLines(invoiceId);
    if (!lines.length) throw new Error('La factura no tiene líneas.');

    const txTypeCode = inv.expand?.tx_type_id?.code;
    const isCreditNote = txTypeCode === 'NDS' || txTypeCode === 'NC';
    const docLabel = isCreditNote ? 'Nota de Ajuste (Compra)' : 'Compra';

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

    const accProveedor = await findAccByCode(codePayable);   // Proveedores
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
      const aggSub = lines.reduce((s, l) => s + Number(l.subtotal || 0), 0);
      const aggIva = lines.reduce((s, l) => s + Number(l.iva_amount || 0), 0);
      const aggTotal = aggSub + aggIva;
      const hdrRules = [
        { id: String(inv.ret_rule_renta_id || '').trim(), kind: 'renta' },
        { id: String(inv.ret_rule_ica_id || '').trim(), kind: 'ica' },
        { id: String(inv.ret_rule_iva_id || '').trim(), kind: 'iva' },
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

    if (isCreditNote) {
      for (const ln of txLines) {
        const temp = ln.debit;
        ln.debit = ln.credit;
        ln.credit = temp;
      }
    }

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
      tx_type_id: effectiveTxTypeId,
      number: effectiveTxNumber,
      date: inv.date,
      description: `${docLabel} ${inv.number} — ${inv.expand?.supplier_id?.name || ''}`,
      third_party_id: inv.supplier_id,
      payment_days: 0,
      cross_enabled: false,
      status: 'draft',
      branch_id: inv.branch_id || null,
    }, txLines);

    // ── Movimiento de inventario para bienes ─────────────────────────────
    let invMovId = null;
    if (bienLines.length && inv.warehouse_id) {
      const today = inv.date || new Date().toISOString().slice(0, 10);
      const rand = String(Date.now()).slice(-4);
      const movType = isCreditNote ? 'SALIDA' : 'ENTRADA';
      const movPrefix = isCreditNote ? 'SAL' : 'ENT';
      const movNumber = `${movPrefix}-${today.replaceAll('-', '')}-${rand}`;
      const mov = await pb.create('inventory_movements', {
        number: movNumber,
        mov_type: movType,
        date: inv.date,
        warehouse_id: inv.warehouse_id,
        third_party_id: inv.supplier_id,
        notes: `${docLabel} ${inv.number}`,
        status: 'draft',
        tx_id: tx.id,
        branch_id: inv.branch_id || null,
      });
      for (let i = 0; i < bienLines.length; i++) {
        await pb.create('inventory_movement_lines', { movement_id: mov.id, line_order: i + 1, ...bienLines[i] });
      }
      await this.applyInventoryMovement(mov.id);
      invMovId = mov.id;
    }

    // ── Actualizar factura ───────────────────────────────────────────────
    await pb.update('purchase_invoices', invoiceId, {
      status: 'posted',
      tx_id: tx.id,
      inv_movement_id: invMovId,
      ret_total: retTotal,
      payable_total: payableCredit,
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

  // ── Ventas y POS (Comercial) ──────────────────────────────

  /** Lista paginada de facturas de venta / recibos POS */
  async getInvoices(opts = {}) {
    const { page = 1, perPage = 50, filter = '', sort = '-date' } = opts;
    return pb.list('invoices', {
      page, perPage, filter, sort,
      expand: 'customer_id,warehouse_id,tx_type_id,pos_shift_id',
    });
  },

  /** Líneas de una factura de venta con expand de producto y cuenta */
  async getInvoiceLines(invoiceId) {
    const safe = pb.escapeFilterValue(invoiceId);
    return pb.listAll('invoice_lines', {
      filter: `invoice_id="${safe}"`,
      sort: 'line_order',
      expand: 'product_id,account_id',
    });
  },

  /** Crea cabecera + líneas de factura de venta en estado borrador */
  async createInvoice(header, lines) {
    let subtotal = 0, ivaTot = 0;
    for (const l of lines) {
      subtotal += l.subtotal || 0;
      ivaTot += l.iva_amount || 0;
    }
    const discountAmt = Number(header.discount_amount || 0);
    const freightAmt = Number(header.freight_amount || 0);
    const retTot = Number(header.ret_total || 0);
    const isPOS = !!header.pos_shift_id;
    const total = isPOS 
      ? (subtotal - discountAmt + ivaTot + freightAmt)
      : (subtotal + ivaTot + freightAmt);
    const payableTotal = total - retTot;


    const inv = await pb.create('invoices', {
      ...header,
      subtotal,
      iva_total: ivaTot,
      total,
      ret_total: retTot,
      payable_total: payableTotal,
      status: 'draft',
    });

    for (let i = 0; i < lines.length; i++) {
      await pb.create('invoice_lines', {
        invoice_id: inv.id,
        line_order: i + 1,
        ...lines[i],
      });
    }
    await this.logAudit('CREATE', 'Invoice', inv.id, `Factura venta ${inv.number}`);
    return inv;
  },

  /**
   * Contabiliza una factura de venta (draft → posted):
   * 1. Valida existencias en tiempo real para bienes.
   * 2. Genera asiento FV/POS en transactions (debitos CxC/Caja ↔ ingresos + iva).
   * 3. Registra el costo de ventas (COGS) para bienes físicos.
   * 4. Para líneas de BIEN: crea movimiento SALIDA y lo aplica al stock.
   * 5. Actualiza la factura con tx_id, inv_movement_id, status=posted.
   */
  async postInvoice(invoiceId) {
    const inv = await pb.get('invoices', invoiceId, { expand: 'customer_id,warehouse_id,tx_type_id' });
    if (inv.status === 'posted') throw new Error('La factura ya fue contabilizada.');
    if (inv.status === 'voided') throw new Error('La factura está anulada.');

    const txTypeCode = String(inv.expand?.tx_type_id?.code || '').toUpperCase();
    const txTypeName = String(inv.expand?.tx_type_id?.name || '').toUpperCase();
    const isCreditNote = txTypeCode === 'NC' || txTypeName.includes('CRÉDITO') || txTypeName.includes('CREDITO');
    const docLabel = isCreditNote ? 'Nota Crédito' : (inv.pos_shift_id ? 'Venta POS' : 'Venta');

    const lines = await this.getInvoiceLines(invoiceId);
    if (!lines.length) throw new Error('La factura no tiene líneas.');

    // Cargar productos para expandir
    const products = await this.getProducts({ activeOnly: false });

    // Cargar configuraciones de POS y Ventas para validar stock negativo
    let posConfig = { operational: { allow_negative_stock: false } };
    try {
      const rawCfg = await this.getSetting('pos_settings_v1');
      if (rawCfg) posConfig = JSON.parse(rawCfg);
    } catch (_) { }

    let salesConfig = { operational: { allow_negative_stock: false } };
    try {
      const rawCfg = await this.getSetting('sales_settings_v2');
      if (rawCfg) salesConfig = JSON.parse(rawCfg);
    } catch (_) { }

    const isPOS = !!inv.pos_shift_id;
    const allowNegative = isPOS 
      ? !!posConfig?.operational?.allow_negative_stock 
      : !!salesConfig?.operational?.allow_negative_stock;
    const immediatePosting = isPOS || !!salesConfig?.operational?.immediate_posting;

    // ── Validar stock en tiempo real y preparar COGS ───────────────────
    const movLines = [];
    for (const line of lines) {
      const prod = products.find(p => p.id === line.product_id);
      if (prod && prod.type === 'BIEN') {
        if (prod.is_combo) {
          const comps = await pb.listAll('product_components', { filter: `parent_id="${pb.escapeFilterValue(prod.id)}"`, expand: 'component_id' });
          if (!comps.length) {
            throw new Error(`El combo "${prod.name}" no tiene componentes configurados.`);
          }
          for (const comp of comps) {
            const compProd = products.find(p => p.id === comp.component_id);
            const compName = compProd ? compProd.name : (comp.expand?.component_id?.name || 'Componente');
            const compCode = compProd ? compProd.code : (comp.expand?.component_id?.code || '');
            const compQty = line.qty * comp.qty;
            if (!inv.warehouse_id) {
              throw new Error(`Se requiere seleccionar una bodega origen para el producto inventariable ${compCode} ${compName}.`);
            }
            const stockRows = await this.getInventoryStock({ warehouseId: inv.warehouse_id, productId: comp.component_id }).catch(() => []);
            const qtyOnHand = Number(stockRows[0]?.qty_on_hand || 0);
            if (!allowNegative && qtyOnHand + 0.0001 < compQty) {
              throw new Error(`Existencias insuficientes para el componente "${compName}" (necesario para el combo "${prod.name}") en la bodega seleccionada. Solicitado: ${fmtN(compQty)}, Disponible: ${fmtN(qtyOnHand)}.`);
            }
            const avgCost = Number(stockRows[0]?.avg_cost || (compProd ? compProd.cost_price : 0) || 0);
            movLines.push({
              product_id: comp.component_id,
              qty: compQty,
              unit_cost: avgCost,
              notes: line.description || `Componente Combo: ${prod.name} (${docLabel} ${inv.number})`,
            });
          }
        } else {
          if (!inv.warehouse_id) {
            throw new Error(`Se requiere seleccionar una bodega origen para el producto inventariable ${prod.code || ''} ${prod.name || ''}.`);
          }
          const stockRows = await this.getInventoryStock({ warehouseId: inv.warehouse_id, productId: line.product_id }).catch(() => []);
          const qtyOnHand = Number(stockRows[0]?.qty_on_hand || 0);
          if (!isCreditNote && !allowNegative && qtyOnHand + 0.0001 < line.qty) {
            throw new Error(`Existencias insuficientes para el producto "${prod.name}" en la bodega seleccionada. Solicitado: ${fmtN(line.qty)}, Disponible: ${fmtN(qtyOnHand)}.`);
          }
          const avgCost = Number(stockRows[0]?.avg_cost || prod.cost_price || 0);
          movLines.push({
            product_id: line.product_id,
            qty: line.qty,
            unit_cost: avgCost,
            notes: line.description || `${docLabel} ${inv.number}`,
          });
        }
      }
    }

    const accountByIdCache = {};
    const accountByCodeCache = {};

    const getAccById = async (id) => {
      const key = String(id || '').trim();
      if (!key) throw new Error('Cuenta contable inválida en la venta.');
      if (!accountByIdCache[key]) accountByIdCache[key] = await pb.get('accounts', key);
      return accountByIdCache[key];
    };

    const findAccByCode = async (code) => {
      const key = String(code || '').trim();
      if (!key) throw new Error('Se requiere un código de cuenta válido.');
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
      let finalThirdPartyId = thirdPartyId;
      if (acc.requires_third_party && !finalThirdPartyId) {
        finalThirdPartyId = inv.customer_id || null;
      }
      const line = {
        account_id: acc.id,
        third_party_id: finalThirdPartyId,
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

    const txLines = [];

    // Helper para resolver la cuenta contable según forma de pago y jerarquía (POS -> Tesorería -> Fallback)
    const resolvePaymentAccount = async (method) => {
      if (isPOS && posConfig?.accounting?.accounts) {
        const accs = posConfig.accounting.accounts;
        let code = "";
        if (method === 'EFECTIVO') code = accs.payment_accounts?.efectivo_code || accs.cash_code;
        else if (method === 'TRANSFERENCIA') code = accs.payment_accounts?.transferencia_code;
        else if (method === 'CREDITO') code = accs.payment_accounts?.credito_code;

        if (code) {
          try {
            const acc = await findAccByCode(code);
            if (acc) return acc.id;
          } catch (_) { }
        }
      }

      if (method === 'CREDITO') {
        try {
          const rawSalesCfg = await this.getSetting('sales_settings_v2');
          if (rawSalesCfg) {
            const sc = JSON.parse(rawSalesCfg);
            const code = sc?.accounting?.accounts?.receivable_code;
            if (code) {
              const acc = await findAccByCode(code);
              if (acc) return acc.id;
            }
          }
        } catch (_) { }
        const acc = await findAccByCode('130505');
        return acc.id;
      } else if (method === 'TRANSFERENCIA') {
        let bankAccId = "";
        try {
          const tesoSettings = await pb.list('treasury_settings', { perPage: 1 });
          if (tesoSettings.items.length) bankAccId = tesoSettings.items[0].default_bank_account_id;
        } catch (_) { }
        if (bankAccId) return bankAccId;
        const acc = await findAccByCode('111005');
        return acc.id;
      } else { // EFECTIVO o cualquier otro
        let cashAccId = "";
        try {
          const tesoSettings = await pb.list('treasury_settings', { perPage: 1 });
          if (tesoSettings.items.length) cashAccId = tesoSettings.items[0].default_cash_account_id;
        } catch (_) { }
        if (cashAccId) return cashAccId;
        const acc = await findAccByCode('110505');
        return acc.id;
      }
    };

    const resolveDiscountAccount = async () => {
      // 1. POS config
      if (isPOS && posConfig?.accounting?.accounts?.discount_code) {
        try {
          const acc = await findAccByCode(posConfig.accounting.accounts.discount_code);
          if (acc) return acc.id;
        } catch (_) { }
      }
      // 2. Sales config fallback
      try {
        const rawSalesCfg = await this.getSetting('sales_settings_v2');
        if (rawSalesCfg) {
          const sc = JSON.parse(rawSalesCfg);
          const code = sc?.accounting?.accounts?.discount_code;
          if (code) {
            const acc = await findAccByCode(code);
            if (acc) return acc.id;
          }
        }
      } catch (_) { }
      // 3. Fallbacks
      const fallbacks = ['530535', '4175', '53053501', '417501'];
      for (const code of fallbacks) {
        try {
          const acc = await findAccByCode(code);
          if (acc) return acc.id;
        } catch (_) { }
      }
      throw new Error('No se pudo determinar una cuenta contable para el Descuento. Por favor configure "discount_code" en los parámetros del POS o Ventas.');
    };

    const resolveFreightAccount = async () => {
      // 1. POS config
      if (isPOS && posConfig?.accounting?.accounts?.freight_code) {
        try {
          const acc = await findAccByCode(posConfig.accounting.accounts.freight_code);
          if (acc) return acc.id;
        } catch (_) { }
      }
      // 2. Sales config fallback
      try {
        const rawSalesCfg = await this.getSetting('sales_settings_v2');
        if (rawSalesCfg) {
          const sc = JSON.parse(rawSalesCfg);
          const code = sc?.accounting?.accounts?.freight_code;
          if (code) {
            const acc = await findAccByCode(code);
            if (acc) return acc.id;
          }
        }
      } catch (_) { }
      // 3. Fallbacks
      const fallbacks = ['429550', '4145', '429595', '414595', '42959501', '41459501'];
      for (const code of fallbacks) {
        try {
          const acc = await findAccByCode(code);
          if (acc) return acc.id;
        } catch (_) { }
      }
      throw new Error('No se pudo determinar una cuenta contable para el Flete. Por favor configure "freight_code" en los parámetros del POS o Ventas.');
    };

    // ── Registrar débito por recaudo/CxC (Soportando Pago Mixto) ───────────
    if (inv.payment_method === 'MIXTO') {
      let split = {};
      try {
        split = typeof inv.payment_split === 'string' ? JSON.parse(inv.payment_split) : (inv.payment_split || {});
      } catch (_) { }

      for (const method of Object.keys(split)) {
        const amount = Number(split[method] || 0);
        if (amount > 0) {
          const paymentAccId = await resolvePaymentAccount(method);
          txLines.push(await buildTxLine({
            accountId: paymentAccId,
            thirdPartyId: inv.customer_id,
            debit: amount,
            credit: 0,
            description: `${docLabel} ${inv.number} Pago mixto - ${method}`,
            crossDocRef: inv.number,
          }));
        }
      }
    } else {
      const paymentAccId = await resolvePaymentAccount(inv.payment_method);
      txLines.push(await buildTxLine({
        accountId: paymentAccId,
        thirdPartyId: inv.customer_id,
        debit: inv.payable_total,
        credit: 0,
        description: `${docLabel} ${inv.number} ${inv.payment_method}`,
        crossDocRef: inv.number,
      }));
    }

    // ── Debito de Descuento (si existe discount_amount) ─────────────────────
    if (Number(inv.discount_amount || 0) > 0) {
      const discountAccId = await resolveDiscountAccount();
      txLines.push(await buildTxLine({
        accountId: discountAccId,
        thirdPartyId: inv.customer_id,
        debit: inv.discount_amount,
        credit: 0,
        description: `Descuento concedido venta ${inv.number}`,
        crossDocRef: inv.number,
      }));
    }

    // ── Crédito de Flete (si existe freight_amount) ───────────────────────
    if (Number(inv.freight_amount || 0) > 0) {
      const freightAccId = await resolveFreightAccount();
      txLines.push(await buildTxLine({
        accountId: freightAccId,
        thirdPartyId: inv.customer_id,
        debit: 0,
        credit: inv.freight_amount,
        description: `Flete cobrado venta ${inv.number}`,
        crossDocRef: inv.number,
      }));
    }

    // ── Construir créditos de ingresos e IVA ─────────────────────────────
    let fallbackIncomeCode = '413505';
    if (isPOS && posConfig?.accounting?.accounts?.sales_code) {
      fallbackIncomeCode = posConfig.accounting.accounts.sales_code;
    } else {
      try {
        const rawSalesCfg = await this.getSetting('sales_settings_v2');
        if (rawSalesCfg) {
          const sc = JSON.parse(rawSalesCfg);
          if (sc?.accounting?.accounts?.income_fallback_code) {
            fallbackIncomeCode = sc.accounting.accounts.income_fallback_code;
          }
        }
      } catch (_) { }
    }
    const defaultIncome = await findAccByCode(fallbackIncomeCode);

    const resolveIvaAccount = async (rate) => {
      const rateStr = String(rate || 0);
      if (isPOS && posConfig?.accounting?.accounts?.iva_by_rate?.[rateStr]) {
        try {
          const acc = await findAccByCode(posConfig.accounting.accounts.iva_by_rate[rateStr]);
          if (acc) return acc.id;
        } catch (_) { }
      }
      try {
        const rawSalesCfg = await this.getSetting('sales_settings_v2');
        if (rawSalesCfg) {
          const sc = JSON.parse(rawSalesCfg);
          const salesCode = sc?.accounting?.accounts?.iva_by_rate?.[rateStr];
          if (salesCode) {
            const acc = await findAccByCode(salesCode);
            if (acc) return acc.id;
          }
        }
      } catch (_) { }

      const acc = await findAccByCode('233501');
      return acc.id;
    };

    // ── Registro de Ingresos e IVA Consolidados ──────────────────────────
    const incomeGroups: { [accId: string]: number } = {};
    const ivaGroups: { [key: string]: { ivaAccId: string, rate: number, amount: number } } = {};
    let totalLineDiscount = 0;

    for (const line of lines) {
      const prod = products.find(p => p.id === line.product_id);
      let incomeAccId = line.account_id;
      if (!incomeAccId && prod) {
        incomeAccId = prod.income_account_id || defaultIncome.id;
      }
      if (!incomeAccId) {
        incomeAccId = defaultIncome.id;
      }

      const subtotal = Number(line.subtotal || 0);
      const lineDiscount = (Number(line.qty || 0) * Number(line.unit_price || 0)) - subtotal;
      if (lineDiscount > 0) {
        totalLineDiscount += lineDiscount;
      }
      const grossLineSub = subtotal + Math.max(0, lineDiscount);
      if (grossLineSub > 0) {
        incomeGroups[incomeAccId] = (incomeGroups[incomeAccId] || 0) + grossLineSub;
      }

      const ivaAmount = Number(line.iva_amount || 0);
      if (ivaAmount > 0) {
        const rate = line.iva_rate || 0;
        const ivaAccId = await resolveIvaAccount(rate);
        const groupKey = `${ivaAccId}_${rate}`;
        if (!ivaGroups[groupKey]) {
          ivaGroups[groupKey] = {
            ivaAccId,
            rate,
            amount: 0
          };
        }
        ivaGroups[groupKey].amount += ivaAmount;
      }
    }

    // ── Debito de Descuento en Líneas (si existe totalLineDiscount) ─────────
    if (totalLineDiscount > 0) {
      const discountAccId = await resolveDiscountAccount();
      txLines.push(await buildTxLine({
        accountId: discountAccId,
        thirdPartyId: inv.customer_id,
        debit: totalLineDiscount,
        credit: 0,
        description: `Descuentos en líneas venta ${inv.number}`,
        crossDocRef: inv.number,
      }));
    }

    // 1. Agregar créditos consolidados de ingresos
    for (const incomeAccId of Object.keys(incomeGroups)) {
      const amount = incomeGroups[incomeAccId];
      if (amount > 0) {
        txLines.push(await buildTxLine({
          accountId: incomeAccId,
          thirdPartyId: inv.customer_id,
          debit: 0,
          credit: amount,
          description: `Ingresos por ventas consolidados — ${inv.number}`,
          crossDocRef: inv.number,
        }));
      }
    }

    // 2. Agregar créditos consolidados de IVA
    for (const key of Object.keys(ivaGroups)) {
      const { ivaAccId, rate, amount } = ivaGroups[key];
      if (amount > 0) {
        txLines.push(await buildTxLine({
          accountId: ivaAccId,
          thirdPartyId: inv.customer_id,
          debit: 0,
          credit: amount,
          description: `IVA Generado ${rate}% venta ${inv.number}`,
          crossDocRef: inv.number,
        }));
      }
    }

    // ── Desglose de retenciones aplicadas (Débito - Activo) ────────────
    // Nota: El cliente nos retiene, lo cual representa un activo de retenciones a favor (1355) para nosotros.
    if (Number(inv.ret_total || 0) > 0) {
      // Mapea la cuenta de pasivo de la regla (2365) a la cuenta de activo de ventas (1355)
      const mapToSalesRetAccount = (code) => {
        const c = String(code || '').trim();
        if (c.startsWith('2365')) return c.replace('2365', '1355');
        if (c.startsWith('2368')) return c.replace('2368', '1355');
        if (c.startsWith('2367')) return c.replace('2367', '1355');
        return '135515'; // Cuenta por defecto de Retención en la Fuente Ventas
      };

      // Si hay desglose en la cabecera
      let salesCfg = {};
      try {
        const rawCfg = await this.getSetting('sales_config_v1');
        salesCfg = rawCfg ? JSON.parse(rawCfg) : {};
      } catch (_) { }
      const cfgRetRules = Array.isArray(salesCfg?.withholding_rules) ? salesCfg.withholding_rules : [];

      const aggSub = Number(inv.subtotal || 0);
      const aggIva = Number(inv.iva_total || 0);
      const aggTotal = aggSub + aggIva;

      const hdrRules = [
        { id: String(inv.ret_rule_renta_id || '').trim(), kind: 'renta' },
        { id: String(inv.ret_rule_ica_id || '').trim(), kind: 'ica' },
        { id: String(inv.ret_rule_iva_id || '').trim(), kind: 'iva' },
      ];

      for (const { id, kind } of hdrRules) {
        if (!id) continue;
        const rule = cfgRetRules.find(r => String(r.id || '') === id);
        if (!rule) continue;
        const minBase = Number(rule.min_base || 0) || 0;
        let base = kind === 'iva' ? aggIva : (String(rule.base_type).toUpperCase() === 'TOTAL' ? aggTotal : aggSub);
        if (base <= 0 || base < minBase) continue;
        const amt = base * Number(rule.rate || 0) / 100;
        if (amt <= 0) continue;

        const assetCode = mapToSalesRetAccount(rule.account_code || '236540');
        const acc = await findAccByCode(assetCode);
        txLines.push(await buildTxLine({
          accountId: acc.id,
          thirdPartyId: inv.customer_id,
          debit: amt,
          credit: 0,
          description: `Retención ${rule.concept} a favor`,
          crossDocRef: inv.number,
        }));
      }
    }

    // ── Registro de Costo de Ventas (COGS) Consolidado ──────────────────
    const defaultCogsAcc = await findAccByCode('613505'); // Costo de Mercancía por defecto
    const defaultInvAcc = await findAccByCode('143005');  // Inventario por defecto
    
    // Agrupamos por la combinación de cuenta de costo (débito) y cuenta de inventario (crédito)
    // Clave: `cogsAccId_invAccId`
    const cogsGroups: { [key: string]: { cogsAccId: string, invAccId: string, amount: number } } = {};

    for (const mv of movLines) {
      const prod = products.find(p => p.id === mv.product_id);
      const cogsAmt = mv.qty * mv.unit_cost;
      if (cogsAmt > 0) {
        const cogsAccId = prod?.cost_account_id || defaultCogsAcc.id;
        const invAccId = prod?.inventory_account_id || defaultInvAcc.id;

        // Si por alguna razón la cuenta de costo y la de inventario son iguales, no genera movimiento (se anulan)
        if (cogsAccId === invAccId) {
          console.log(`[GRAVY] Omitida línea de COGS ya que la cuenta de costo e inventario son idénticas: ${cogsAccId}`);
          continue;
        }

        const groupKey = `${cogsAccId}_${invAccId}`;
        if (!cogsGroups[groupKey]) {
          cogsGroups[groupKey] = {
            cogsAccId,
            invAccId,
            amount: 0
          };
        }
        cogsGroups[groupKey].amount += cogsAmt;
      }
    }

    // Registrar en txLines las partidas consolidadas
    for (const groupKey of Object.keys(cogsGroups)) {
      const { cogsAccId, invAccId, amount } = cogsGroups[groupKey];
      if (amount > 0) {
        // 1. Débito consolidado al Costo de Ventas correspondiente
        txLines.push(await buildTxLine({
          accountId: cogsAccId,
          thirdPartyId: inv.customer_id,
          debit: amount,
          credit: 0,
          description: `Costo de Ventas consolidado — ${inv.number}`,
          crossDocRef: inv.number,
        }));

        // 2. Crédito consolidado a la cuenta de Inventario correspondiente
        txLines.push(await buildTxLine({
          accountId: invAccId,
          thirdPartyId: inv.customer_id,
          debit: 0,
          credit: amount,
          description: `Baja Inventario COGS consolidada — ${inv.number}`,
          crossDocRef: inv.number,
        }));
      }
    }

    // Invertir naturaleza contable si es Nota Crédito
    if (isCreditNote) {
      for (const ln of txLines) {
        const temp = ln.debit;
        ln.debit = ln.credit;
        ln.credit = temp;
      }
    }

    // ── Crear Transacción Contable ─────────────────────────────────────
    let effectiveTxTypeId = String(inv.tx_type_id || '').trim();
    if (!effectiveTxTypeId) {
      const code = inv.pos_shift_id ? 'POS' : 'FV';

      // Intentar buscar por el prefijo del número de factura para asociarla a la serie contable correspondiente
      const invNum = String(inv.number || "").trim();
      const prefixCandidate = invNum.includes("-") ? invNum.split("-")[0].toUpperCase() : "";

      let found = null;
      if (prefixCandidate) {
        try {
          const safePrefix = pb.escapeFilterValue(prefixCandidate);
          found = await pb.list('transaction_types', {
            filter: `active=true && code="${code}" && prefix="${safePrefix}"`,
            perPage: 1,
          });
        } catch (_) { }
      }

      // Fallback si no se encontró serie específica con ese prefijo
      if (!found || !found.items.length) {
        found = await pb.list('transaction_types', {
          filter: `active=true && code="${code}"`,
          perPage: 1,
        });
      }

      if (found && found.items.length) {
        effectiveTxTypeId = found.items[0].id;
      }
    }
    if (!effectiveTxTypeId) throw new Error('No se encontró el tipo de transacción contable (FV/POS) en el sistema.');

    const txNumber = String(inv.tx_number || inv.number || 'AUTO').trim();

    let txCreated = null;
    let movCreated = null;
    try {
      txCreated = await this.createTransaction({
        tx_type_id: effectiveTxTypeId,
        number: txNumber,
        date: inv.date,
        description: `${docLabel} ${inv.number} — ${inv.expand?.customer_id?.name || ''}`,
        third_party_id: inv.customer_id,
        payment_days: 0,
        cross_enabled: false,
        status: immediatePosting ? 'active' : 'draft',
        branch_id: inv.branch_id || null,
      }, txLines);

      // ── Movimiento de Inventario ─────────────────────────────
      let invMovId = null;
      if (movLines.length && inv.warehouse_id) {
        const today = inv.date || new Date().toISOString().slice(0, 10);
        const rand = String(Date.now()).slice(-4);
        const movType = isCreditNote ? 'ENTRADA' : 'SALIDA';
        const movPrefix = isCreditNote ? 'ENT' : 'SAL';
        const movNumber = `${movPrefix}-${today.replaceAll('-', '')}-${rand}`;
        movCreated = await pb.create('inventory_movements', {
          number: movNumber,
          mov_type: movType,
          date: inv.date,
          warehouse_id: inv.warehouse_id,
          third_party_id: inv.customer_id,
          notes: `${docLabel} ${inv.number}`,
          status: 'draft',
          tx_id: txCreated.id,
          branch_id: inv.branch_id || null,
        });
        invMovId = movCreated.id;
        for (let i = 0; i < movLines.length; i++) {
          await pb.create('inventory_movement_lines', { movement_id: movCreated.id, line_order: i + 1, ...movLines[i] });
        }
        await this.applyInventoryMovement(movCreated.id);
      }

      // ── Actualizar Factura Comercial ────────────────────────────────────
      await pb.update('invoices', invoiceId, {
        status: 'posted',
        tx_id: txCreated.id,
        inv_movement_id: invMovId,
        tx_type_id: effectiveTxTypeId,
        tx_number: txNumber,
      });
      if (inv.sales_order_id) {
        await pb.update('sales_orders', inv.sales_order_id, {
          status: 'invoiced',
          invoice_id: invoiceId
        });
        await this.logAudit('UPDATE_STATUS', 'SalesOrder', inv.sales_order_id, `Pedido marcado como facturado por factura ${inv.number}`);
      }
      await this.logAudit('POST', 'Invoice', invoiceId, `Contabilizada ${inv.number} → TX ${txCreated.number}`);
      return { inv, tx: txCreated };
    } catch (postErr) {
      // ROLLBACK atómico en caso de fallo intermedio
      if (movCreated) {
        try {
          const currentMov = await pb.get('inventory_movements', movCreated.id).catch(() => null);
          if (currentMov && currentMov.status === 'applied') {
            await this.voidInventoryMovement(movCreated.id, 'Rollback por fallo de contabilización');
          }
          const mLines = await pb.listAll('inventory_movement_lines', { filter: `movement_id="${pb.escapeFilterValue(movCreated.id)}"` }).catch(() => []);
          for (const ml of mLines) {
            await pb.delete('inventory_movement_lines', ml.id).catch(() => {});
          }
          await pb.delete('inventory_movements', movCreated.id).catch(() => {});
        } catch (_) {}
      }
      if (txCreated) {
        try {
          const tLines = await pb.listAll('tx_lines', { filter: `tx_id="${pb.escapeFilterValue(txCreated.id)}"` }).catch(() => []);
          for (const tl of tLines) {
            await pb.delete('tx_lines', tl.id).catch(() => {});
          }
          await pb.delete('transactions', txCreated.id).catch(() => {});
        } catch (_) {}
      }
      throw postErr;
    }
  },

  /** Revierte los efectos contables e inventario de una factura */
  async rollbackInvoicePosting(invoiceId, actionLabel = 'anular', reason = '') {
    const inv = await pb.get('invoices', invoiceId);
    if (inv.status !== 'posted') {
      return { inv, txVoided: false, movementVoided: false };
    }

    if (typeof isPeriodClosed === 'function') {
      const closed = await isPeriodClosed(inv.date);
      if (closed) throw new Error(`El período ${(inv.date || '').slice(0, 7)} está cerrado. No se puede ${actionLabel} la venta.`);
    }

    if (inv.tx_id) {
      const tx = await pb.get('transactions', inv.tx_id).catch(() => null);
      if (tx && tx.status !== 'voided') {
        if (tx.status === 'draft') {
          const tLines = await pb.listAll('tx_lines', { filter: `tx_id="${pb.escapeFilterValue(tx.id)}"` }).catch(() => []);
          for (const tl of tLines) {
            await pb.delete('tx_lines', tl.id).catch(() => {});
          }
          await pb.delete('transactions', tx.id).catch(() => {});
          console.log(`[GRAVY] Eliminada transacción borrador vinculada a la factura anulada: ${inv.number}`);
        } else {
          await this.voidTransaction(inv.tx_id, `${actionLabel} venta ${inv.number}${reason ? ` | Motivo: ${reason}` : ''}`);
        }
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

    if (inv.sales_order_id) {
      await pb.update('sales_orders', inv.sales_order_id, {
        status: 'pending',
        invoice_id: null
      });
      await this.logAudit('UPDATE_STATUS', 'SalesOrder', inv.sales_order_id, `Pedido devuelto a pendiente por anulación/reapertura de factura ${inv.number}`);
    }

    return {
      inv,
      txVoided: !!inv.tx_id,
      movementVoided: !!inv.inv_movement_id,
    };
  },

  /** Anula una factura de venta */
  async voidInvoice(invoiceId, reason = '') {
    const safeReason = String(reason || '').trim();
    if (!safeReason) throw new Error('Debes indicar el motivo de anulación.');
    const inv = await pb.get('invoices', invoiceId);
    if (inv.status === 'voided') throw new Error('La factura ya está anulada.');
    if (inv.status === 'posted') {
      await this.rollbackInvoicePosting(invoiceId, 'anular', safeReason);
    }
    await pb.update('invoices', invoiceId, { status: 'voided' });
    await this.logAudit('VOID', 'Invoice', invoiceId, `Anulada factura ${inv.number} | Motivo: ${safeReason}`);
  },

  /** Cambia el método de pago de una factura contabilizada y actualiza el asiento contable */
  async changeInvoicePaymentMethod(invoiceId, newMethod, newSplit = null, reason = '') {
    const safeReason = String(reason || '').trim();
    if (!safeReason) throw new Error('Debes indicar el motivo del cambio de forma de pago.');
    if (safeReason.length < 8) throw new Error('El motivo debe ser más descriptivo (mínimo 8 caracteres).');

    const inv = await pb.get('invoices', invoiceId, { expand: 'customer_id,tx_type_id' });
    if (inv.status !== 'posted') {
      throw new Error('Solo se puede cambiar la forma de pago en facturas contabilizadas.');
    }

    if (typeof isPeriodClosed === 'function') {
      const closed = await isPeriodClosed(inv.date);
      if (closed) throw new Error(`El período ${(inv.date || '').slice(0, 7)} está cerrado. No se puede modificar la forma de pago.`);
    }

    const oldMethod = inv.payment_method;
    const oldSplit = typeof inv.payment_split === 'string' ? inv.payment_split : JSON.stringify(inv.payment_split || {});

    // Preparar configuraciones de POS y ventas para resolver cuentas contables
    const isPOS = !!inv.pos_shift_id;
    let posConfig = { operational: { allow_negative_stock: false } };
    try {
      const rawCfg = await this.getSetting('pos_settings_v1');
      if (rawCfg) posConfig = JSON.parse(rawCfg);
    } catch (_) { }

    const findAccByCode = async (code) => {
      const key = String(code || '').trim();
      if (!key) throw new Error('Se requiere un código de cuenta válido.');
      const safeCode = pb.escapeFilterValue(key);
      const res = await pb.list('accounts', { filter: `code="${safeCode}"`, perPage: 1 });
      if (!res.items.length) throw new Error(`Cuenta ${key} no encontrada en el plan de cuentas.`);
      return res.items[0];
    };

    const resolvePaymentAccount = async (method) => {
      if (isPOS && posConfig?.accounting?.accounts) {
        const accs = posConfig.accounting.accounts;
        let code = "";
        if (method === 'EFECTIVO') code = accs.payment_accounts?.efectivo_code || accs.cash_code;
        else if (method === 'TRANSFERENCIA') code = accs.payment_accounts?.transferencia_code;
        else if (method === 'CREDITO') code = accs.payment_accounts?.credito_code;

        if (code) {
          try {
            const acc = await findAccByCode(code);
            if (acc) return acc.id;
          } catch (_) { }
        }
      }

      if (method === 'CREDITO') {
        try {
          const rawSalesCfg = await this.getSetting('sales_settings_v2');
          if (rawSalesCfg) {
            const sc = JSON.parse(rawSalesCfg);
            const code = sc?.accounting?.accounts?.receivable_code;
            if (code) {
              const acc = await findAccByCode(code);
              if (acc) return acc.id;
            }
          }
        } catch (_) { }
        const acc = await findAccByCode('130505');
        return acc.id;
      } else if (method === 'TRANSFERENCIA') {
        let bankAccId = "";
        try {
          const tesoSettings = await pb.list('treasury_settings', { perPage: 1 });
          if (tesoSettings.items.length) bankAccId = tesoSettings.items[0].default_bank_account_id;
        } catch (_) { }
        if (bankAccId) return bankAccId;
        const acc = await findAccByCode('111005');
        return acc.id;
      } else { // EFECTIVO o cualquier otro
        let cashAccId = "";
        try {
          const tesoSettings = await pb.list('treasury_settings', { perPage: 1 });
          if (tesoSettings.items.length) cashAccId = tesoSettings.items[0].default_cash_account_id;
        } catch (_) { }
        if (cashAccId) return cashAccId;
        const acc = await findAccByCode('110505');
        return acc.id;
      }
    };

    // Actualizar la factura
    const parsedSplit = newMethod === 'MIXTO' ? (typeof newSplit === 'string' ? newSplit : JSON.stringify(newSplit)) : null;
    await pb.update('invoices', invoiceId, {
      payment_method: newMethod,
      payment_split: parsedSplit
    });

    // Si tiene transacción contable asociada, actualizar las líneas de pago
    if (inv.tx_id) {
      const tx = await pb.get('transactions', inv.tx_id);
      const lines = await pb.listAll('tx_lines', { filter: `tx_id="${pb.escapeFilterValue(inv.tx_id)}"` });

      // Identificar líneas de pago existentes
      const numUpper = inv.number.toUpperCase();
      const paymentLines = lines.filter(l => {
        const d = (l.description || '').toUpperCase();
        return d.includes(numUpper) && (
          d.includes('EFECTIVO') ||
          d.includes('TRANSFERENCIA') ||
          d.includes('CREDITO') ||
          d.includes('CRÉDITO') ||
          d.includes('MIXTO') ||
          d.includes('PAGO MIXTO')
        );
      });

      if (paymentLines.length > 0) {
        // Eliminar las líneas de pago viejas (tolerante a 404 por edición concurrente)
        for (const pl of paymentLines) {
          try {
            await pb.delete('tx_lines', pl.id);
          } catch (err: any) {
            if (err?.status !== 404 && err?.response?.code !== 404) throw err;
          }
        }

        // Determinar si es nota de crédito
        const txTypeCode = String(inv.expand?.tx_type_id?.code || '').toUpperCase();
        const txTypeName = String(inv.expand?.tx_type_id?.name || '').toUpperCase();
        const isCreditNote = txTypeCode === 'NC' || txTypeName.includes('CRÉDITO') || txTypeName.includes('CREDITO');
        const docLabel = isCreditNote ? 'Nota Crédito' : (isPOS ? 'Venta POS' : 'Venta');

        // Determinar un line_order base
        let maxOrder = lines.reduce((max, l) => l.line_order > max ? l.line_order : max, 0);
        let nextLineOrder = maxOrder + 1;

        // Crear las nuevas líneas de pago
        if (newMethod === 'MIXTO') {
          const splitObj = typeof newSplit === 'string' ? JSON.parse(newSplit) : (newSplit || {});
          for (const method of Object.keys(splitObj)) {
            const amount = Number(splitObj[method] || 0);
            if (amount > 0) {
              const paymentAccId = await resolvePaymentAccount(method);
              const acc = await pb.get('accounts', paymentAccId);
              const line = {
                tx_id: inv.tx_id,
                account_id: paymentAccId,
                third_party_id: inv.customer_id,
                debit: isCreditNote ? 0 : amount,
                credit: isCreditNote ? amount : 0,
                description: `${docLabel} ${inv.number} Pago mixto - ${method}`,
                line_order: nextLineOrder++,
              };
              if (acc.maneja_cruce) {
                line.cross_doc_ref = inv.number;
              }
              await pb.create('tx_lines', line);
            }
          }
        } else {
          const paymentAccId = await resolvePaymentAccount(newMethod);
          const acc = await pb.get('accounts', paymentAccId);
          const line = {
            tx_id: inv.tx_id,
            account_id: paymentAccId,
            third_party_id: inv.customer_id,
            debit: isCreditNote ? 0 : inv.payable_total,
            credit: isCreditNote ? inv.payable_total : 0,
            description: `${docLabel} ${inv.number} ${newMethod}`,
            line_order: nextLineOrder++,
          };
          if (acc.maneja_cruce) {
            line.cross_doc_ref = inv.number;
          }
          await pb.create('tx_lines', line);
        }
      }
    }

    // Registrar en auditoría
    await this.logAudit('CHANGE_PAYMENT_METHOD', 'Invoice', invoiceId, 
      `Forma de pago corregida: ${oldMethod} -> ${newMethod}. Motivo: ${safeReason}`
    );

    return { success: true };
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
      sort: 'line_order',
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
    if (!concepts.length) throw new Error('No hay conceptos de facturación activos.');

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
          concept_id: c.id,
          description: c.name,
          amount: Math.round(amount),
          line_order: order++,
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
            concept_id: null,
            description: `Interés de mora a ${asOfStr}`,
            amount: roundedLate,
            line_order: order++,
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
        date: dateStr,
        due_date: dueDateStr,
        subtotal: Math.round(total),
        total: Math.round(total),
        status: 'draft',
        notes: '',
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

    const cxcCode = String(phCfg.cxc_code || '130505').trim();
    const incomeCode = String(phCfg.income_code || '413505').trim();
    const lateFeeIncomeCode = String(phCfg.late_fee_income_code || incomeCode).trim();
    const crossRef = String(inv.number || '').trim();

    // Buscar tipo de transacción CF
    const cfTypes = await pb.list('transaction_types', {
      filter: 'code="CF" && active=true',
      perPage: 1,
    });
    if (!cfTypes.items.length) throw new Error('Tipo de transacción CF no encontrado. Reinicia PocketBase para aplicar la migración.');
    const txType = cfTypes.items[0];

    // Propietario de la unidad (para third_party en asiento)
    const property = inv.expand?.property_id;
    const ownerId = property?.owner_id || null;

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
      let conceptCode = concept?.code || 'GEN';
      if (!concept) {
        if (/inter[eé]s de mora/i.test(String(ln.description || ''))) {
          conceptCode = 'MORA';
        } else {
          const m = String(ln.description || '').match(/^\[([A-Z0-9]+)\]/);
          if (m) conceptCode = m[1];
        }
      }
      const refPorConcepto = `${crossRef}-${conceptCode}`;

      let incomeAccountId = incomeDefaultAccount.id;
      if (ln.account_code) {
        // Override directo en la línea (conceptos individuales manuales)
        const overrideAcc = await findAccByCode(ln.account_code);
        incomeAccountId = overrideAcc.id;
      } else if (concept?.account_id) {
        incomeAccountId = concept.account_id;
      } else if (conceptCode === 'MORA') {
        const lateAcc = await findAccByCode(lateFeeIncomeCode);
        incomeAccountId = lateAcc.id;
      }
      txLines.push(await buildTxLine({
        accountId: incomeAccountId,
        debit: 0,
        credit: Number(ln.amount || 0),
        description: ln.description,
        thirdPartyId: ownerId || null,
        crossDocRef: refPorConcepto,
      }));
    }

    // Línea de débito a CxC (una línea por cada concepto para permitir trazabilidad en recaudo)
    for (const ln of lines) {
      const concept = ln.expand?.concept_id;
      let conceptCode = concept?.code || 'GEN';
      if (!concept) {
        if (/inter[eé]s de mora/i.test(String(ln.description || ''))) {
          conceptCode = 'MORA';
        } else {
          const m = String(ln.description || '').match(/^\[([A-Z0-9]+)\]/);
          if (m) conceptCode = m[1];
        }
      }
      const refPorConcepto = `${crossRef}-${conceptCode}`;

      txLines.unshift(await buildTxLine({
        accountId: cxcAccount.id,
        debit: Number(ln.amount || 0),
        credit: 0,
        description: ln.description,
        thirdPartyId: ownerId || null,
        crossDocRef: refPorConcepto,
      }));
    }
    // Reordenar
    txLines.forEach((l, i) => { l.line_order = i + 1; });

    // Crear transacción contable
    const userId = pb.currentUser?.id || '';
    const tx = await pb.create('transactions', {
      tx_type_id: txType.id,
      number: 'AUTO',
      date: inv.date,
      description: `Factura PH ${inv.number} — ${property?.name || inv.property_id} — ${inv.period}`,
      third_party_id: ownerId || null,
      cross_enabled: txLines.some(l => !!l.cross_doc_ref),
      status: 'active',
      user_id: userId || undefined,
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

  /** Envia factura o estado de cuenta PH por correo individual */
  async sendPhInvoiceEmail(invoiceId, type = 'invoice', email = '', subject = '', message = '') {
    const res = await fetch(`${PB_URL}/api/ph/send-invoice-email`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ invoiceId, type, email, subject, message }),
    });
    if (!res.ok) throw await this._err(res);
    return res.json();
  },

  /** Envia correos masivos de facturación PH para un período */
  async sendPhBulkEmails(period, type = 'invoice', subject = '', message = '') {
    const res = await fetch(`${PB_URL}/api/ph/send-bulk-emails`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ period, type, subject, message }),
    });
    if (!res.ok) throw await this._err(res);
    return res.json();
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
    const res = await pb.list('ph_pqrs', { perPage: 1 });
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
        invoice_id: invoiceId,
        concept_id: null,
        description: String(ln.description || ''),
        amount: Math.round(Number(ln.amount || 0)),
        account_code: String(ln.account_code || ''),
        line_order: lineOrder++,
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

    // Filtro base: facturas no anuladas
    let filter = `status!="voided"`;
    if (propertyId) filter += ` && property_id="${safePropertyId}"`;
    // El período es una cadena YYYY-MM, sirve para filtrar lotes de facturación
    if (fromPeriod) filter += ` && period>="${safeFrom}"`;
    if (toPeriod) filter += ` && period<="${safeTo}"`;

    let invoices = [];
    try {
      const res = await pb.listAll('ph_invoices', { filter, sort: '-date' });
      // Asegurar unicidad de facturas por ID
      const uniqueMap = new Map();
      (res || []).forEach(inv => uniqueMap.set(inv.id, inv));
      invoices = Array.from(uniqueMap.values());
    } catch (_) { invoices = []; }

    // Determinar fecha de corte real (cutoffDate) para cálculos de mora y saldos
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
    const refDate = cutoffDate || new Date().toISOString().slice(0, 10);

    // Filtrar facturas que fueron emitidas después de la fecha de corte si se especificó
    if (cutoffDate) {
      invoices = invoices.filter(inv => {
        const invDate = (inv.date || inv.created || '').slice(0, 10);
        return invDate <= cutoffDate;
      });
    }

    if (invoices.length === 0) return { invoices: [], rows: [] };
    // 1. Obtener todas las líneas de las facturas
    const allInvLines = [];
    for (const inv of invoices) {
      try {
        const lns = await this.getPhInvoiceLines(inv.id);
        allInvLines.push(...lns);
      } catch (_) { }
    }

    // 2. Obtener ABONOS de Tesorería (tx_lines que cruzan estas facturas)
    // Buscamos líneas contables de tipo Recibo de Caja o ajustes que afecten el saldo
    // CUADRE CRÍTICO: Buscamos tx_lines donde cross_doc_ref coincida con el número de factura
    // o empiece por el número de factura (para casos de desglose por concepto CF-001-ADMIN)
    const invNumbers = invoices.map(i => String(i.number || '').toUpperCase()).filter(Boolean);
    const causalityTxIds = new Set(invoices.map(i => i.tx_id).filter(Boolean));
    const abonosMap = new Map(); // key: cross_doc_ref, value: total_abono

    if (invNumbers.length > 0) {
      // Optimizamos: traemos líneas contables que tengan un cross_doc_ref en el set de facturas
      // y cuya fecha sea <= fecha de corte
      const txLines = await pb.listAll('tx_lines', {
        filter: `cross_doc_ref!="" && tx_id.date <= "${refDate}" && (tx_id.status = "posted" || tx_id.status = "active")`,
        expand: 'tx_id'
      });

      for (const tl of txLines) {
        // IGNORAR la causación original de la factura
        if (causalityTxIds.has(tl.tx_id)) continue;

        const ref = String(tl.cross_doc_ref || '').trim().toUpperCase();
        const valAbono = Number(tl.credit || 0) - Number(tl.debit || 0);
        if (valAbono === 0) continue;

        // Buscamos si esta referencia pertenece a alguna de nuestras facturas
        const matchedInv = invNumbers.find(num => ref === num || ref.startsWith(num + '-'));

        if (matchedInv) {
          abonosMap.set(ref, (abonosMap.get(ref) || 0) + valAbono);
        }
      }
    }

    const properties = await this.getPhProperties(false).catch(() => []);
    const propById = new Map(properties.map(p => [String(p.id), p]));

    const rows = [];
    for (const inv of invoices) {
      const prop = propById.get(String(inv.property_id));
      const invLines = allInvLines.filter(l => l.invoice_id === inv.id);

      const invNumber = String(inv.number || '').trim().toUpperCase();
      const fechaDoc = String(inv.date || inv.created || '').slice(0, 10);
      const venc = String(inv.due_date || '').slice(0, 10);
      const diasMoraRaw = this.calculateDaysOverdue(inv.due_date, cutoffDate);

      // Control de abono general para distribuir entre líneas
      let generalAbono = abonosMap.get(invNumber) || 0;

      for (const line of invLines) {
        const originalAmount = Number(line.amount || 0);

        // 1. Intentar abono específico por concepto (ej: CF-001-ADMIN)
        const conceptCode = (line.expand?.concept_id?.code || (/inter[eé]s/i.test(line.description) ? 'MORA' : 'GEN')).toUpperCase();
        const specificRef = `${invNumber}-${conceptCode}`;
        let abonoAplicado = abonosMap.get(specificRef) || 0;

        // 2. Si hay abono general remanente, aplicarlo a esta línea
        if (generalAbono > 0) {
          const porAplicar = Math.min(generalAbono, Math.max(0, originalAmount - abonoAplicado));
          abonoAplicado += porAplicar;
          generalAbono -= porAplicar;
        }

        const currentBalance = originalAmount - abonoAplicado;

        let estado = 'por_vencer';
        if (currentBalance < 1) {
          estado = 'cancelado';
        } else if (inv.status === 'draft') {
          estado = 'borrador';
        } else if (diasMoraRaw >= 0) {
          estado = 'vencido';
        }

        const rawConcepto = line.description || line.account_code || 'Concepto';
        const normalizedConcepto = this.normalizePhCarteraConceptLabel(rawConcepto);
        const normalizedConceptId = line.concept_id
          ? String(line.concept_id)
          : String(normalizedConcepto || line.account_code || 'OTROS').toUpperCase();

        rows.push({
          invoice: inv,
          line,
          amount: currentBalance, // Saldo para el reporte
          originalAmount: originalAmount, // Valor original para integridad
          abono: abonoAplicado,
          diasMora: Math.max(0, diasMoraRaw),
          diasMoraRaw,
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
      totalOriginalLines: 0,
      totalPendiente: 0,
      totalCancelado: 0,
      diferenciaGlobal: 0,
      totalLineas: 0,
    };

    for (const inv of invoices) totals.totalFacturas += Number(inv.total || 0);
    for (const r of rows) {
      totals.totalOriginalLines += Number(r.originalAmount || 0);
      totals.totalLineas += Number(r.amount || 0);
      if (r.estado === 'cancelado') totals.totalCancelado += Number(r.abono || 0);
      else totals.totalPendiente += Number(r.amount || 0);
    }
    // La integridad se chequea contra el valor ORIGINAL de las líneas
    totals.diferenciaGlobal = Math.round((totals.totalFacturas - totals.totalOriginalLines) * 100) / 100;

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
          totalOriginalLines: 0,
          diferencia: 0,
        };
      }
      byInvoice[id].totalOriginalLines += Number(r.originalAmount || 0);
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
  // -- Presupuestos (PH) -------------------------------------
  async getPhBudgets(year = null) {
    let filter = '';
    if (year) filter = `year=${Number(year)}`;
    return pb.listAll('ph_budgets', { filter, sort: '-year' });
  },

  async getPhBudgetLines(budgetId) {
    return pb.listAll('ph_budget_lines', {
      filter: `budget_id="${pb.escapeFilterValue(budgetId)}"`,
      expand: 'account_id',
    });
  },

  async savePhBudget(budget, lines) {
    let budgetId = budget.id;
    const payload = { ...budget };
    delete payload.id;
    delete payload.created;
    delete payload.updated;
    delete payload.expand;

    if (budgetId) {
      await pb.update('ph_budgets', budgetId, payload);
    } else {
      const created = await pb.create('ph_budgets', payload);
      budgetId = created.id;
    }

    // Update lines: delete all and recreate (simplest way for a local app)
    const existing = await pb.listAll('ph_budget_lines', { filter: `budget_id="${pb.escapeFilterValue(budgetId)}"` });
    for (const l of existing) await pb.delete('ph_budget_lines', l.id);

    for (const line of lines) {
      const lp = { ...line, budget_id: budgetId };
      delete lp.id;
      delete lp.expand;
      await pb.create('ph_budget_lines', lp);
    }
    return budgetId;
  },

  async getBudgetExecution(budgetId, year) {
    const lines = await this.getPhBudgetLines(budgetId);
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // Fetch all accounts in the database to map child sub-accounts
    const allAccounts = await this.getAccounts(false).catch(() => []);

    // Create a mapping of each budget line to its matching sub-account IDs
    const lineSubAccountMap = new Map();
    const allSubAccountIds = new Set();

    lines.forEach(l => {
      const code = l.expand?.account_id?.code;
      let matchIds = [l.account_id];
      if (code) {
        const matched = allAccounts.filter(a => a.code && a.code.startsWith(code));
        if (matched.length > 0) {
          matchIds = matched.map(a => a.id);
        }
      }
      lineSubAccountMap.set(l.id, matchIds);
      matchIds.forEach(id => allSubAccountIds.add(id));
    });

    const uniqueAccountIds = Array.from(allSubAccountIds);
    if (!uniqueAccountIds.length) return lines.map(l => ({ ...l, executed: 0, monthly_executed: new Array(12).fill(0) }));

    const filter = `tx_id.date >= "${startDate}" && tx_id.date <= "${endDate}" && tx_id.status="active"`;
    // Note: PocketBase filter doesn't support easy "IN" for arrays in strings without joining
    const accountFilter = uniqueAccountIds.map(id => `account_id="${id}"`).join(' || ');
    const fullFilter = `(${accountFilter}) && ${filter}`;

    const txLines = await pb.listAll('tx_lines', { filter: fullFilter, expand: 'tx_id' });

    const executionMap = {}; // accountId -> [jan, feb, ... dec]
    for (const tl of txLines) {
      const dStr = tl.expand?.tx_id?.date;
      if (!dStr) continue;
      const month = new Date(dStr + 'T00:00:00Z').getUTCMonth();
      if (month < 0 || month >= 12) continue;
      if (!executionMap[tl.account_id]) executionMap[tl.account_id] = new Array(12).fill(0);

      // Simple logic: if account starts with 4 (Income), Credit - Debit. 
      // If starts with 5 or 6 (Expenses/Costs), Debit - Credit.
      // We need to fetch account codes to be sure.
      // For now we'll assume the caller knows the nature. 
      // Let's just return raw Net (Debit - Credit) and let UI decide.
      executionMap[tl.account_id][month] += (tl.debit || 0) - (tl.credit || 0);
    }

    return lines.map(l => {
      const matchedIds = lineSubAccountMap.get(l.id) || [l.account_id];
      const execArr = new Array(12).fill(0);
      
      for (const accId of matchedIds) {
        const accVals = executionMap[accId];
        if (accVals) {
          for (let m = 0; m < 12; m++) {
            execArr[m] += accVals[m];
          }
        }
      }
      
      const totalExec = execArr.reduce((a, b) => a + b, 0);
      return {
        ...l,
        executed: totalExec,
        monthly_executed: execArr
      };
    });
  },

  async getBudgetExecutionDetail(budgetId, year) {
    const lines = await this.getPhBudgetLines(budgetId);
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // Fetch all accounts in the database to map child sub-accounts
    const allAccounts = await this.getAccounts(false).catch(() => []);

    // Create a mapping of each budget line to its matching sub-account IDs
    const lineSubAccountMap = new Map();
    const allSubAccountIds = new Set();

    lines.forEach(l => {
      const code = l.expand?.account_id?.code;
      let matchIds = [l.account_id];
      if (code) {
        const matched = allAccounts.filter(a => a.code && a.code.startsWith(code));
        if (matched.length > 0) {
          matchIds = matched.map(a => a.id);
        }
      }
      lineSubAccountMap.set(l.id, matchIds);
      matchIds.forEach(id => allSubAccountIds.add(id));
    });

    const uniqueAccountIds = Array.from(allSubAccountIds);
    if (!uniqueAccountIds.length) {
      return {
        budgetLines: lines.map(l => ({ ...l, executed: 0, monthly_executed: new Array(12).fill(0) })),
        txLines: []
      };
    }

    const filter = `tx_id.date >= "${startDate}" && tx_id.date <= "${endDate}" && tx_id.status="active"`;
    const accountFilter = uniqueAccountIds.map(id => `account_id="${id}"`).join(' || ');
    const fullFilter = `(${accountFilter}) && ${filter}`;

    // Load tx_lines with expand of tx_id, account_id, and third_party_id
    const txLines = await pb.listAll('tx_lines', { 
      filter: fullFilter, 
      expand: 'tx_id,account_id,third_party_id' 
    });

    const executionMap = {}; // accountId -> [jan, feb, ... dec]
    for (const tl of txLines) {
      const dStr = tl.expand?.tx_id?.date;
      if (!dStr) continue;
      const month = new Date(dStr + 'T00:00:00Z').getUTCMonth();
      if (month < 0 || month >= 12) continue;
      if (!executionMap[tl.account_id]) executionMap[tl.account_id] = new Array(12).fill(0);
      executionMap[tl.account_id][month] += (tl.debit || 0) - (tl.credit || 0);
    }

    const budgetLines = lines.map(l => {
      const matchedIds = lineSubAccountMap.get(l.id) || [l.account_id];
      const execArr = new Array(12).fill(0);
      
      for (const accId of matchedIds) {
        const accVals = executionMap[accId];
        if (accVals) {
          for (let m = 0; m < 12; m++) {
            execArr[m] += accVals[m];
          }
        }
      }
      
      const totalExec = execArr.reduce((a, b) => a + b, 0);
      return {
        ...l,
        executed: totalExec,
        monthly_executed: execArr
      };
    });

    return { budgetLines, txLines };
  },

  // -- Información Exógena (DIAN) ----------------------------
  async getExogenaConcepts(format = '1001') {
    return pb.listAll('exogena_concepts', { filter: `format_type="${format}"`, sort: 'code' });
  },

  async saveExogenaConcept(concept) {
    if (concept.id) return pb.update('exogena_concepts', concept.id, concept);
    return pb.create('exogena_concepts', concept);
  },

  async generateExogenaDataset(year, formatId, mappings) {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const txLines = await pb.listAll('tx_lines', {
      filter: `tx_id.date >= "${startDate}" && tx_id.date <= "${endDate}" && tx_id.status="active"`,
      expand: 'tx_id,account_id,third_party_id'
    });

    const results = {};
    for (const tl of txLines) {
      const acc = tl.expand?.account_id;
      if (!acc) continue;
      const accCode = acc.code;

      // Find concept match using mappings passed from frontend
      let matchedConcept = null;
      const formatMappings = mappings[formatId] || {};
      for (const [concept, accounts] of Object.entries(formatMappings)) {
        if ((accounts as string[]).some(a => accCode.startsWith(a))) {
          matchedConcept = concept;
          break;
        }
      }

      if (!matchedConcept) continue;

      const third = tl.expand?.third_party_id;
      if (!third) continue;

      const key = `${third.id}-${matchedConcept}-${accCode}`;
      if (!results[key]) {
        results[key] = {
          third,
          conceptCode: matchedConcept,
          accountCode: accCode,
          accountName: acc.name,
          debit: 0,
          credit: 0,
          net: 0
        };
      }

      results[key].debit += tl.debit || 0;
      results[key].credit += tl.credit || 0;
      results[key].net += (tl.debit || 0) - (tl.credit || 0);
    }

    return Object.values(results);
  },

  // ── Pedidos y Cotizaciones ──────────────────────────────────

  /** Lista paginada de pedidos de venta */
  async getSalesOrders(opts = {}) {
    const { page = 1, perPage = 50, filter = '', sort = '-date' } = opts;
    return pb.list('sales_orders', {
      page, perPage, filter, sort,
      expand: 'customer_id,warehouse_id,invoice_id,user_id',
    });
  },

  /** Líneas de un pedido de venta con expand de producto y cuenta */
  async getSalesOrderLines(orderId) {
    const safe = pb.escapeFilterValue(orderId);
    return pb.listAll('sales_order_lines', {
      filter: `sales_order_id="${safe}"`,
      sort: 'line_order',
      expand: 'product_id,account_id',
    });
  },

  /** Crea cabecera + líneas de pedido de venta en estado pendiente */
  async createSalesOrder(header, lines) {
    let subtotal = 0, ivaTot = 0;
    for (const l of lines) {
      subtotal += l.subtotal || 0;
      ivaTot += l.iva_amount || 0;
    }
    const discountAmt = Number(header.discount_amount || 0);
    const total = subtotal - discountAmt + ivaTot;

    // Obtener consecutivo
    let orderNum = header.number;
    if (!orderNum || orderNum === 'AUTO') {
      orderNum = await this.nextOrderConsecutive();
    }

    const order = await pb.create('sales_orders', {
      ...header,
      number: orderNum,
      subtotal,
      iva_total: ivaTot,
      total,
      status: 'pending',
      user_id: pb.currentUser?.id
    });

    for (let i = 0; i < lines.length; i++) {
      await pb.create('sales_order_lines', {
        sales_order_id: order.id,
        line_order: i + 1,
        ...lines[i],
      });
    }
    await this.logAudit('CREATE', 'SalesOrder', order.id, `Pedido creado ${order.number}`);
    return order;
  },

  /** Actualiza cabecera + líneas de un pedido de venta pendiente */
  async updateSalesOrder(orderId, header, lines) {
    let subtotal = 0, ivaTot = 0;
    for (const l of lines) {
      subtotal += l.subtotal || 0;
      ivaTot += l.iva_amount || 0;
    }
    const discountAmt = Number(header.discount_amount || 0);
    const total = subtotal - discountAmt + ivaTot;

    await pb.update('sales_orders', orderId, {
      ...header,
      subtotal,
      iva_total: ivaTot,
      total,
    });

    // Eliminar líneas viejas
    const oldLines = await pb.listAll('sales_order_lines', { filter: `sales_order_id="${pb.escapeFilterValue(orderId)}"` });
    for (const l of oldLines) {
      await pb.delete('sales_order_lines', l.id);
    }

    // Crear líneas nuevas
    for (let i = 0; i < lines.length; i++) {
      await pb.create('sales_order_lines', {
        sales_order_id: orderId,
        line_order: i + 1,
        ...lines[i],
      });
    }

    await this.logAudit('UPDATE', 'SalesOrder', orderId, `Pedido actualizado ${header.number || ''}`);
    return pb.get('sales_orders', orderId);
  },

  /** Anula un pedido de venta cambiando su estado a cancelled */
  async cancelSalesOrder(orderId, reason = '') {
    const order = await pb.get('sales_orders', orderId);
    if (order.status !== 'pending') {
      throw new Error(`Solo se pueden anular pedidos en estado Pendiente. Estado actual: ${order.status}`);
    }
    await pb.update('sales_orders', orderId, { status: 'cancelled' });
    await this.logAudit('VOID', 'SalesOrder', orderId, `Pedido anulado ${order.number} | Motivo: ${reason}`);
    return pb.get('sales_orders', orderId);
  },

  /** Obtiene y avanza el siguiente consecutivo de pedido */
  async nextOrderConsecutive() {
    let currentConsecutive = 0;
    let recordId = "";
    try {
      const res = await pb.list('settings', { filter: 'key="order_consecutive"', perPage: 1 });
      if (res.items.length) {
        currentConsecutive = parseInt(res.items[0].value || '0', 10);
        recordId = res.items[0].id;
      }
    } catch (_) {}

    const next = currentConsecutive + 1;
    const nextStr = String(next);
    
    if (recordId) {
      await pb.update('settings', recordId, { value: nextStr });
    } else {
      await pb.create('settings', { key: 'order_consecutive', value: nextStr });
    }

    return `PED-${String(next).padStart(8, '0')}`;
  },

  /** Elimina borrador de factura de venta y restablece pedidos asociados */
  async deleteInvoiceDraft(invoiceId) {
    const inv = await pb.get('invoices', invoiceId);
    if (inv.status !== 'draft') throw new Error('Solo se pueden eliminar facturas en estado Borrador.');
    if (inv.sales_order_id) {
      await pb.update('sales_orders', inv.sales_order_id, {
        status: 'pending',
        invoice_id: null
      });
      await this.logAudit('UPDATE_STATUS', 'SalesOrder', inv.sales_order_id, `Pedido devuelto a pendiente por eliminación de borrador de factura`);
    }
    // Eliminar líneas de factura
    const lines = await this.getInvoiceLines(invoiceId);
    for (const l of lines) {
      await pb.delete('invoice_lines', l.id);
    }
    // Eliminar cabecera
    await pb.delete('invoices', invoiceId);
    await this.logAudit('DELETE', 'Invoice', invoiceId, `Eliminado borrador de factura ${inv.number}`);
  },

  // ── Importaciones ──────────────────────────────────────────

  /** Lista paginada de importaciones */
  async getImports(opts: any = {}) {
    const { page = 1, perPage = 50, filter = '', sort = '-date_created' } = opts;
    return pb.list('imports', {
      page, perPage, filter, sort,
      expand: 'supplier_id,user_id,purchase_invoice_id',
    });
  },

  /** Líneas de una importación */
  async getImportLines(importId: string) {
    const safe = pb.escapeFilterValue(importId);
    return pb.listAll('import_lines', {
      filter: `import_id="${safe}"`,
      sort: 'line_order',
      expand: 'product_id',
    });
  },

  /** Crea una importación con FormData para soporte de archivos */
  async createImport(header: any, lines: any[], files: any = {}) {
    const formData = new FormData();
    for (const key of Object.keys(header)) {
      if (header[key] !== undefined && header[key] !== null) {
        formData.append(key, String(header[key]));
      }
    }
    if (files.bl_document) {
      formData.append('bl_document', files.bl_document);
    }
    const tStr = typeof (window as any).todayStr === 'function' ? (window as any).todayStr() : new Date().toISOString().slice(0, 10);
    formData.append('date_created', tStr);
    formData.append('user_id', pb.currentUser?.id || '');

    let fobTotal = 0;
    for (const l of lines) {
      fobTotal += (l.qty || 0) * (l.fob_price || 0);
    }
    formData.append('fob_total', String(fobTotal));

    const record = await pb.create('imports', formData);

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      const lineData = new FormData();
      lineData.append('import_id', record.id);
      lineData.append('line_order', String(i + 1));
      lineData.append('product_id', l.product_id);
      lineData.append('qty', String(l.qty || 0));
      lineData.append('fob_price', String(l.fob_price || 0));
      lineData.append('arancel_rate', String(l.arancel_rate || 0));
      lineData.append('arancel_amount', String(l.arancel_amount || 0));
      lineData.append('iva_rate', String(l.iva_rate || 0));
      lineData.append('iva_amount', String(l.iva_amount || 0));
      lineData.append('prorated_cost', String(l.prorated_cost || 0));
      lineData.append('unit_cost_cop', String(l.unit_cost_cop || 0));
      lineData.append('total_cop', String(l.total_cop || 0));
      if (l.manifest_number) {
        lineData.append('manifest_number', l.manifest_number);
      }
      if (l.pais_origen) {
        lineData.append('pais_origen', l.pais_origen);
      }
      if (l.certificado_origen_num) {
        lineData.append('certificado_origen_num', l.certificado_origen_num);
      }
      if (l.posicion_arancelaria) {
        lineData.append('posicion_arancelaria', l.posicion_arancelaria);
      }
      if (l.peso_neto_total !== undefined && l.peso_neto_total !== null) {
        lineData.append('peso_neto_total', String(l.peso_neto_total));
      }
      if (l.peso_bruto_total !== undefined && l.peso_bruto_total !== null) {
        lineData.append('peso_bruto_total', String(l.peso_bruto_total));
      }
      if (files[`manifest_file_${i}`]) {
        lineData.append('manifest_file', files[`manifest_file_${i}`]);
      }
      await pb.create('import_lines', lineData);
    }

    await this.logAudit('CREATE', 'Import', record.id, `Importación creada ${record.number}`);
    return record;
  },

  /** Actualiza cabecera, líneas e incorpora nuevos adjuntos subidos */
  async updateImport(importId: string, header: any, lines: any[], files: any = {}) {
    const formData = new FormData();
    for (const key of Object.keys(header)) {
      if (header[key] !== undefined && header[key] !== null) {
        formData.append(key, String(header[key]));
      }
    }
    if (files.bl_document) {
      formData.append('bl_document', files.bl_document);
    } else if (files.bl_document === null) {
      formData.append('bl_document', '');
    }

    const record = await pb.update('imports', importId, formData);

    const oldLines = await pb.listAll('import_lines', { filter: `import_id="${pb.escapeFilterValue(importId)}"` });
    const oldLinesMap: any = {};
    oldLines.forEach((l: any) => { oldLinesMap[l.id] = l; });

    const keepIds = new Set();

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      const lineData = new FormData();
      lineData.append('import_id', importId);
      lineData.append('line_order', String(i + 1));
      lineData.append('product_id', l.product_id);
      lineData.append('qty', String(l.qty || 0));
      lineData.append('fob_price', String(l.fob_price || 0));
      lineData.append('arancel_rate', String(l.arancel_rate || 0));
      lineData.append('arancel_amount', String(l.arancel_amount || 0));
      lineData.append('iva_rate', String(l.iva_rate || 0));
      lineData.append('iva_amount', String(l.iva_amount || 0));
      lineData.append('prorated_cost', String(l.prorated_cost || 0));
      lineData.append('unit_cost_cop', String(l.unit_cost_cop || 0));
      lineData.append('total_cop', String(l.total_cop || 0));
      lineData.append('manifest_number', l.manifest_number || '');
      lineData.append('pais_origen', l.pais_origen || '');
      lineData.append('certificado_origen_num', l.certificado_origen_num || '');
      lineData.append('posicion_arancelaria', l.posicion_arancelaria || '');
      lineData.append('peso_neto_total', String(l.peso_neto_total || 0));
      lineData.append('peso_bruto_total', String(l.peso_bruto_total || 0));

      if (files[`manifest_file_${i}`]) {
        lineData.append('manifest_file', files[`manifest_file_${i}`]);
      } else if (files[`manifest_file_${i}`] === null) {
        lineData.append('manifest_file', '');
      }

      if (l.id && oldLinesMap[l.id]) {
        await pb.update('import_lines', l.id, lineData);
        keepIds.add(l.id);
      } else {
        const newL = await pb.create('import_lines', lineData);
        keepIds.add(newL.id);
      }
    }

    for (const oldId of Object.keys(oldLinesMap)) {
      if (!keepIds.has(oldId)) {
        await pb.delete('import_lines', oldId);
      }
    }

    await this.logAudit('UPDATE', 'Import', importId, `Importación actualizada ${record.number}`);
    return pb.get('imports', importId);
  },

  /** Anula una importación en estado borrador/transito */
  async cancelImport(importId: string, reason: string = '') {
    const imp = await pb.get('imports', importId);
    if (imp.status === 'recibido') {
      throw new Error('No se puede anular una importación ya finalizada.');
    }
    await pb.update('imports', importId, { status: 'anulado' });
    await this.logAudit('VOID', 'Import', importId, `Importación anulada ${imp.number} | Motivo: ${reason}`);
    return pb.get('imports', importId);
  },

  /** Genera el consecutivo IMP-XXXXXX */
  async nextImportConsecutive() {
    let currentConsecutive = 0;
    let recordId = "";
    try {
      const res = await pb.list('settings', { filter: 'key="import_consecutive"', perPage: 1 });
      if (res.items.length) {
        currentConsecutive = parseInt(res.items[0].value || '0', 10);
        recordId = res.items[0].id;
      }
    } catch (_) {}

    const next = currentConsecutive + 1;
    const nextStr = String(next);
    
    if (recordId) {
      await pb.update('settings', recordId, { value: nextStr });
    } else {
      await pb.create('settings', { key: 'import_consecutive', value: nextStr });
    }

    return `IMP-${String(next).padStart(6, '0')}`;
  },

  /** Consulta el stock en camino por producto en importaciones activas */
  async getIncomingStockForProduct(productId) {
    const safe = pb.escapeFilterValue(productId);
    return pb.listAll('import_lines', {
      filter: `product_id="${safe}" && (import_id.status="transito" || import_id.status="nacionalizacion")`,
      expand: 'import_id',
    });
  },

  /** Obtener la configuración del módulo de importaciones */
  async getImportConfig() {
    const defaultCfg = {
      accounting: {
        accounts: {
          transito_account_code: '143505',
          inventario_account_code: '143501',
          anticipo_account_code: '133025',
          iva_account_code: '240810',
          fob_payable_account_code: '220505',
          freight_payable_account_code: '233545',
          insurance_payable_account_code: '233555',
          customs_payable_account_code: '233595',
          arancel_payable_account_code: '233595',
          local_carrier_payable_account_code: '233545',
          local_other_payable_account_code: '233595'
        }
      }
    };
    try {
      const raw = await this.getSetting('import_config_v1');
      if (!raw) return defaultCfg;
      const parsed = JSON.parse(raw);
      if (parsed.accounting && parsed.accounting.accounts) {
        const accs = parsed.accounting.accounts;
        accs.transito_account_code = accs.transito_account_code || '143505';
        accs.inventario_account_code = accs.inventario_account_code || '143501';
        accs.anticipo_account_code = accs.anticipo_account_code || '133025';
        accs.iva_account_code = accs.iva_account_code || '240810';
        accs.fob_payable_account_code = accs.fob_payable_account_code || '220505';
        accs.freight_payable_account_code = accs.freight_payable_account_code || '233545';
        accs.insurance_payable_account_code = accs.insurance_payable_account_code || '233555';
        accs.customs_payable_account_code = accs.customs_payable_account_code || '233595';
        accs.arancel_payable_account_code = accs.arancel_payable_account_code || '233595';
        accs.local_carrier_payable_account_code = accs.local_carrier_payable_account_code || '233545';
        accs.local_other_payable_account_code = accs.local_other_payable_account_code || '233595';
      } else {
        return defaultCfg;
      }
      return parsed;
    } catch {
      return defaultCfg;
    }
  },

  /** Guardar la configuración del módulo de importaciones */
  async saveImportConfig(cfg) {
    await this.setSetting('import_config_v1', JSON.stringify(cfg));
    await this.logAudit('CONFIG', 'ImportConfig', null, 'Configuración de importaciones actualizada');
    return cfg;
  },

  /** Obtiene todos los datos para armar el reporte de trazabilidad de una importación */
  async getImportTraceabilityData(importId: string) {
    const [imp, lines] = await Promise.all([
      pb.get('imports', importId, { expand: 'supplier_id,user_id,purchase_invoice_id,tx_fob_id,tx_freight_id,tx_insurance_id,tx_customs_id,tx_local_carrier_id,tx_local_other_id' }),
      this.getImportLines(importId)
    ]);
    
    const importNumber = imp.number;
    const invoiceNums = [
      imp.supplier_invoice_num,
      imp.freight_invoice_num,
      imp.insurance_invoice_num,
      imp.customs_invoice_num,
      imp.local_carrier_invoice_num,
      imp.local_other_invoice_num
    ].filter(Boolean);

    const txIds = [
      imp.tx_fob_id,
      imp.tx_freight_id,
      imp.tx_insurance_id,
      imp.tx_customs_id,
      imp.tx_local_carrier_id,
      imp.tx_local_other_id
    ].filter(Boolean);

    const filters = [`cross_doc_ref="${pb.escapeFilterValue(importNumber)}"`];
    
    if (txIds.length) {
      const idsFilter = txIds.map(id => `tx_id="${pb.escapeFilterValue(id)}"`).join(' || ');
      filters.push(`(${idsFilter})`);
    }
    
    if (invoiceNums.length) {
      const invsFilter = invoiceNums.map(num => `cross_doc_ref="${pb.escapeFilterValue(num)}"`).join(' || ');
      filters.push(`(${invsFilter})`);
    }

    const filterString = filters.join(' || ');
    const txLines = filterString ? await pb.listAll('tx_lines', {
      filter: filterString,
      expand: 'tx_id,account_id,third_party_id'
    }) : [];
    
    const transactionsMap: any = {};
    for (const tl of txLines) {
      const tx = tl.expand?.tx_id;
      if (!tx || tx.status === 'voided') continue;
      if (!transactionsMap[tx.id]) {
        transactionsMap[tx.id] = {
          id: tx.id,
          number: tx.number,
          date: tx.date,
          description: tx.description,
          lines: []
        };
      }
      transactionsMap[tx.id].lines.push({
        account_code: tl.expand?.account_id?.code || '',
        account_name: tl.expand?.account_id?.name || '',
        debit: tl.debit || 0,
        credit: tl.credit || 0,
        third_party_name: tl.expand?.third_party_id?.name || '',
        description: tl.description || ''
      });
    }
    const transactions = Object.values(transactionsMap);
    
    const purchaseInvoices = await pb.listAll('purchase_invoices', {
      filter: `import_id="${pb.escapeFilterValue(importId)}" && status!="voided"`,
      expand: 'supplier_id,warehouse_id'
    });
    
    return {
      import: imp,
      lines,
      transactions,
      purchaseInvoices
    };
  },

  /** Causa contabilidad individual de una etapa de importación */
  async postImportStage(importId: string, stageName: string, supplierId: string, invoiceNum: string, amount: number) {
    if (!importId) throw new Error('Se requiere el ID de la importación.');
    if (!stageName) throw new Error('Se requiere el nombre de la etapa.');
    if (!supplierId) throw new Error('Se requiere el ID del proveedor.');
    if (!invoiceNum) throw new Error('Se requiere el número de factura/soporte.');
    if (amount <= 0) throw new Error('El monto a causar debe ser mayor a cero.');

    const imp = await pb.get('imports', importId);
    
    const mappings: Record<string, { txField: string; supplierField: string; invoiceField: string; label: string }> = {
      fob: { txField: 'tx_fob_id', supplierField: 'supplier_id', invoiceField: 'supplier_invoice_num', label: 'FOB Mercancía' },
      freight: { txField: 'tx_freight_id', supplierField: 'freight_supplier_id', invoiceField: 'freight_invoice_num', label: 'Flete Internacional' },
      insurance: { txField: 'tx_insurance_id', supplierField: 'insurance_supplier_id', invoiceField: 'insurance_invoice_num', label: 'Seguro Internacional' },
      customs: { txField: 'tx_customs_id', supplierField: 'customs_supplier_id', invoiceField: 'customs_invoice_num', label: 'Aduanas / DIAN' },
      local_carrier: { txField: 'tx_local_carrier_id', supplierField: 'local_carrier_id', invoiceField: 'local_carrier_invoice_num', label: 'Transporte Local' },
      local_other: { txField: 'tx_local_other_id', supplierField: 'local_other_supplier_id', invoiceField: 'local_other_invoice_num', label: 'Otros Gastos' },
    };

    const map = mappings[stageName];
    if (!map) throw new Error(`Etapa '${stageName}' no es válida.`);

    if (imp[map.txField]) {
      throw new Error(`La etapa ${map.label} ya tiene una causación contable registrada.`);
    }

    const cfg = await this.getImportConfig();
    const transitoCode = cfg.accounting?.accounts?.transito_account_code || '143505';
    const accTransito = await _apiFindAccByCode(transitoCode);

    const accountsCfg = cfg.accounting?.accounts || {};
    const stageAccountMapping: Record<string, string> = {
      fob: accountsCfg.fob_payable_account_code || '220505',
      freight: accountsCfg.freight_payable_account_code || '233545',
      insurance: accountsCfg.insurance_payable_account_code || '233555',
      customs: accountsCfg.customs_payable_account_code || '233595',
      local_carrier: accountsCfg.local_carrier_payable_account_code || '233545',
      local_other: accountsCfg.local_other_payable_account_code || '233595'
    };

    const targetAccountCode = stageAccountMapping[stageName];
    let accPayable = await _apiFindAccByCode(targetAccountCode).catch(async () => {
      const thirdParty = await pb.get('third_parties', supplierId);
      return await _apiResolvePayableAccountForThirdParty(thirdParty);
    });

    const txTypes = await pb.listAll('transaction_types', { filter: 'code="FC"', perPage: 1 });
    if (!txTypes.length) throw new Error('Tipo de transacción FC (Factura de Compra) no encontrado en el sistema.');
    const txTypeId = txTypes[0].id;

    let lines: any[] = [];
    if (stageName === 'customs') {
      const arancelAmt = imp.arancel_total || 0;
      const customsAmt = imp.gastos_nacionalizacion || 0;
      const customsCode = accountsCfg.customs_payable_account_code || '233595';
      const arancelCode = accountsCfg.arancel_payable_account_code || '233595';

      if (arancelAmt > 0 && customsAmt > 0 && customsCode !== arancelCode && Math.abs(arancelAmt + customsAmt - amount) < 1.0) {
        const accCustoms = await _apiFindAccByCode(customsCode).catch(async () => accPayable);
        const accArancel = await _apiFindAccByCode(arancelCode).catch(async () => accPayable);
        lines = [
          {
            account_id: accTransito.id,
            third_party_id: supplierId,
            debit: amount,
            credit: 0,
            description: `Causación Aduana/DIAN - Importación ${imp.number}`,
            line_order: 1
          },
          {
            account_id: accCustoms.id,
            third_party_id: supplierId,
            debit: 0,
            credit: customsAmt,
            description: `Gastos Nac. - Importación ${imp.number} | Factura ${invoiceNum}`,
            line_order: 2,
            cross_doc_ref: invoiceNum
          },
          {
            account_id: accArancel.id,
            third_party_id: supplierId,
            debit: 0,
            credit: arancelAmt,
            description: `Aranceles DIAN - Importación ${imp.number}`,
            line_order: 3,
            cross_doc_ref: invoiceNum
          }
        ];
      }
    }

    if (!lines.length) {
      lines = [
        {
          account_id: accTransito.id,
          third_party_id: supplierId,
          debit: amount,
          credit: 0,
          description: `Causación ${map.label} - Importación ${imp.number}`,
          line_order: 1
        },
        {
          account_id: accPayable.id,
          third_party_id: supplierId,
          debit: 0,
          credit: amount,
          description: `Causación ${map.label} - Importación ${imp.number} | Factura ${invoiceNum}`,
          line_order: 2,
          cross_doc_ref: invoiceNum
        }
      ];
    }

    const txData = {
      tx_type_id: txTypeId,
      number: 'AUTO',
      date: new Date().toISOString().slice(0, 10),
      description: `Causación ${map.label} Importación ${imp.number}`,
      third_party_id: supplierId,
      status: 'active'
    };

    const tx = await this.createTransaction(txData, lines);

    const updateData: Record<string, any> = {};
    updateData[map.txField] = tx.id;
    updateData[map.supplierField] = supplierId;
    updateData[map.invoiceField] = invoiceNum;

    await pb.update('imports', importId, updateData);
    await this.logAudit('POST_STAGE', 'imports', importId, `Causación contable etapa ${map.label} realizada. Transacción: ${tx.number}`);

    return tx;
  },

  /** Registra nota de ajuste contable por diferencia en costo */
  async postImportAdjustment(importId: string, stageName: string, deltaAmount: number, invoiceNum: string, reason: string = '') {
    if (!importId) throw new Error('Se requiere el ID de la importación.');
    if (!stageName) throw new Error('Se requiere el nombre de la etapa.');
    if (deltaAmount === 0) throw new Error('El monto de ajuste no puede ser cero.');

    const imp = await pb.get('imports', importId);

    const mappings: Record<string, { txField: string; supplierField: string; invoiceField: string; label: string }> = {
      fob: { txField: 'tx_fob_id', supplierField: 'supplier_id', invoiceField: 'supplier_invoice_num', label: 'FOB Mercancía' },
      freight: { txField: 'tx_freight_id', supplierField: 'freight_supplier_id', invoiceField: 'freight_invoice_num', label: 'Flete Internacional' },
      insurance: { txField: 'tx_insurance_id', supplierField: 'insurance_supplier_id', invoiceField: 'insurance_invoice_num', label: 'Seguro Internacional' },
      customs: { txField: 'tx_customs_id', supplierField: 'customs_supplier_id', invoiceField: 'customs_invoice_num', label: 'Aduanas / DIAN' },
      local_carrier: { txField: 'tx_local_carrier_id', supplierField: 'local_carrier_id', invoiceField: 'local_carrier_invoice_num', label: 'Transporte Local' },
      local_other: { txField: 'tx_local_other_id', supplierField: 'local_other_supplier_id', invoiceField: 'local_other_invoice_num', label: 'Otros Gastos' },
    };

    const map = mappings[stageName];
    if (!map) throw new Error(`Etapa '${stageName}' no es válida.`);

    if (!imp[map.txField]) {
      throw new Error(`No se puede realizar un ajuste en ${map.label} porque aún no ha sido causada.`);
    }

    const supplierId = imp[map.supplierField];
    if (!supplierId) throw new Error(`No se encontró un proveedor asociado a la etapa ${map.label}.`);

    const cfg = await this.getImportConfig();
    const transitoCode = cfg.accounting?.accounts?.transito_account_code || '143505';
    const accTransito = await _apiFindAccByCode(transitoCode);

    const accountsCfg = cfg.accounting?.accounts || {};
    const stageAccountMapping: Record<string, string> = {
      fob: accountsCfg.fob_payable_account_code || '220505',
      freight: accountsCfg.freight_payable_account_code || '233545',
      insurance: accountsCfg.insurance_payable_account_code || '233555',
      customs: accountsCfg.customs_payable_account_code || '233595',
      local_carrier: accountsCfg.local_carrier_payable_account_code || '233545',
      local_other: accountsCfg.local_other_payable_account_code || '233595'
    };

    const targetAccountCode = stageAccountMapping[stageName];
    const accPayable = await _apiFindAccByCode(targetAccountCode).catch(async () => {
      const thirdParty = await pb.get('third_parties', supplierId);
      return await _apiResolvePayableAccountForThirdParty(thirdParty);
    });

    let txTypeId = '';
    const txTypes = await pb.listAll('transaction_types', { filter: 'code="NC"', perPage: 1 });
    if (txTypes.length) {
      txTypeId = txTypes[0].id;
    } else {
      const txTypesFC = await pb.listAll('transaction_types', { filter: 'code="FC"', perPage: 1 });
      if (txTypesFC.length) txTypeId = txTypesFC[0].id;
    }

    if (!txTypeId) throw new Error('No se encontró ningún tipo de transacción contable válido para el ajuste (NC o FC).');

    const absDelta = Math.abs(deltaAmount);
    const isIncrease = deltaAmount > 0;

    const lines = [
      {
        account_id: accTransito.id,
        third_party_id: supplierId,
        debit: isIncrease ? absDelta : 0,
        credit: isIncrease ? 0 : absDelta,
        description: `Nota de Ajuste ${map.label} - Importación ${imp.number}. Motivo: ${reason}`,
        line_order: 1
      },
      {
        account_id: accPayable.id,
        third_party_id: supplierId,
        debit: isIncrease ? 0 : absDelta,
        credit: isIncrease ? absDelta : 0,
        description: `Nota de Ajuste ${map.label} - Importación ${imp.number} | Factura ${invoiceNum}. Motivo: ${reason}`,
        line_order: 2,
        cross_doc_ref: invoiceNum
      }
    ];

    const txData = {
      tx_type_id: txTypeId,
      number: 'AUTO',
      date: new Date().toISOString().slice(0, 10),
      description: `Ajuste Contable ${map.label} Importación ${imp.number} | Factura ${invoiceNum}`,
      third_party_id: supplierId,
      status: 'active'
    };

    const tx = await this.createTransaction(txData, lines);
    await this.logAudit('POST_ADJUSTMENT', 'imports', importId, `Ajuste contable realizado en etapa ${map.label}. Diferencia: ${deltaAmount}. Transacción: ${tx.number}`);

    return tx;
  },

  /** Finaliza la importación, traslada costo de Tránsito a Inventario y registra stock */
  async capitalizeImport(importId: string, warehouseId: string, txTypeId: string, txNumber: string) {
    if (!importId) throw new Error('Se requiere el ID de la importación.');
    if (!warehouseId) throw new Error('Se requiere la bodega de destino.');
    if (!txTypeId) throw new Error('Se requiere el tipo de transacción contable.');
    if (!txNumber) throw new Error('Se requiere el número del comprobante contable.');

    const imp = await pb.get('imports', importId);
    if (imp.status === 'recibido') {
      throw new Error('Esta importación ya ha sido finalizada y capitalizada.');
    }
    const lines = await this.getImportLines(importId);
    if (!lines.length) {
      throw new Error('La importación no contiene productos para capitalizar.');
    }

    const cfg = await this.getImportConfig();
    const transitoCode = cfg.accounting?.accounts?.transito_account_code || '143505';
    const inventarioCode = cfg.accounting?.accounts?.inventario_account_code || '143501';

    const accTransito = await _apiFindAccByCode(transitoCode);
    const accInventario = await _apiFindAccByCode(inventarioCode);

    const totalAmount = imp.total || 0;
    if (totalAmount <= 0) {
      throw new Error('El valor total acumulado de la importación debe ser mayor a cero para capitalizar.');
    }

    const txLines = [
      {
        account_id: accInventario.id,
        third_party_id: imp.supplier_id,
        debit: totalAmount,
        credit: 0,
        description: `Capitalización Importación ${imp.number} - Ingreso a Bodega`,
        line_order: 1
      },
      {
        account_id: accTransito.id,
        third_party_id: imp.supplier_id,
        debit: 0,
        credit: totalAmount,
        description: `Capitalización Importación ${imp.number} - Cierre Cuenta Tránsito`,
        line_order: 2
      }
    ];

    const txData = {
      tx_type_id: txTypeId,
      number: txNumber,
      date: new Date().toISOString().slice(0, 10),
      description: `Capitalización Importación ${imp.number}`,
      third_party_id: imp.supplier_id,
      status: 'active'
    };

    const tx = await this.createTransaction(txData, txLines);

    const movNumber = `ENT-IMP-${imp.number.split('-').pop()}`;
    const movData = {
      number: movNumber,
      mov_type: 'ENTRADA',
      date: new Date().toISOString().slice(0, 10),
      warehouse_id: warehouseId,
      third_party_id: imp.supplier_id,
      notes: `Ingreso físico por capitalización de Importación ${imp.number}. Transacción contable: ${tx.number}`,
      status: 'draft',
      tx_id: tx.id
    };

    const mov = await pb.create('inventory_movements', movData);

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      await pb.create('inventory_movement_lines', {
        movement_id: mov.id,
        product_id: l.product_id,
        qty: l.qty,
        unit_cost: l.unit_cost_cop || 0,
        notes: `Importación ${imp.number} - Línea ${i + 1}`,
        line_order: i + 1
      });
    }

    await this.applyInventoryMovement(mov.id);

    await pb.update('imports', importId, {
      status: 'recibido'
    });

    await this.logAudit('CAPITALIZE', 'imports', importId, `Importación capitalizada y trasladada a bodega. Transacción: ${tx.number}. Movimiento: ${mov.number}`);

    return { tx, mov };
  },

  // ── Inmobiliarias (F9) ────────────────────────────────────

  async getInmoProperties(activeOnly = true) {
    const filter = activeOnly ? 'active=true' : '';
    return pb.listAll('inmo_properties', {
      filter,
      sort: 'code',
      expand: 'owner_id',
    });
  },

  async getInmoContracts(activeOnly = true) {
    const filter = activeOnly ? 'active=true' : '';
    return pb.listAll('inmo_contracts', {
      filter,
      sort: 'number',
      expand: 'property_id,property_id.owner_id,tenant_id',
    });
  },

  async getInmoInvoices(opts = {}) {
    const { page = 1, perPage = 50, filter = '', sort = '-date' } = opts;
    return pb.list('inmo_invoices', {
      page, perPage, filter, sort,
      expand: 'contract_id,contract_id.property_id,contract_id.property_id.owner_id,contract_id.tenant_id',
    });
  },

  async getInmoInvoiceLines(invoiceId) {
    const safe = pb.escapeFilterValue(invoiceId);
    return pb.listAll('inmo_invoice_lines', {
      filter: `invoice_id="${safe}"`,
      sort: 'line_order',
    });
  },

  async generateInmoInvoices(period, dueDate = '') {
    const safePeriod = pb.escapeFilterValue(period);
    const contracts = await this.getInmoContracts(true);
    if (!contracts.length) throw new Error('No hay contratos activos registrados.');

    // Validar facturas ya existentes para este período
    const existing = await pb.listAll('inmo_invoices', {
      filter: `period="${safePeriod}"`,
      perPage: 200,
    });
    const existingContractIds = new Set(existing.map(i => i.contract_id));

    const toCreate = contracts.filter(c => c.status === 'VIGENTE' && !existingContractIds.has(c.id));
    if (!toCreate.length) throw new Error(`Todos los contratos vigentes ya tienen factura para el período ${period}.`);

    const dateStr = period + '-01';
    const dueDateStr = dueDate || (period + '-10');
    let created = 0;

    for (const contract of toCreate) {
      const prop = contract.expand?.property_id;
      const rate = Number(contract.increment_percentage || prop?.commission_rate || 8);
      const rentAmount = Number(contract.monthly_rent || 0);
      const commissionAmount = Math.round(rentAmount * (rate / 100));
      const netToOwner = rentAmount - commissionAmount;

      // Generar consecutivo de factura
      const randomPart = String(Date.now()).slice(-4);
      const invoiceNum = `IA-${period.replace('-', '')}-${randomPart}-${created + 1}`;

      const inv = await pb.create('inmo_invoices', {
        number: invoiceNum,
        period: safePeriod,
        contract_id: contract.id,
        date: dateStr,
        due_date: dueDateStr,
        rent_amount: rentAmount,
        other_amount: 0,
        commission_amount: commissionAmount,
        net_to_owner: netToOwner,
        total: rentAmount,
        status: 'draft',
        notes: `Facturación canon de arrendamiento período ${period}. Inmueble: ${prop?.title || ''}.`,
      });

      // Crear línea de factura
      await pb.create('inmo_invoice_lines', {
        invoice_id: inv.id,
        description: 'Canon de arrendamiento',
        amount: rentAmount,
        line_order: 1,
      });

      created++;
    }

    return created;
  },

  async postInmoInvoicesByPeriod(period) {
    const safePeriod = pb.escapeFilterValue(period);
    const invoices = await pb.listAll('inmo_invoices', { filter: `period="${safePeriod}"`, perPage: 200 });
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
        await this.postInmoInvoice(inv.id);
        posted++;
      } catch (err) {
        failed++;
        failures.push(`${inv.number || inv.id}: ${err?.message || 'Error'}`);
      }
    }

    await this.logAudit(
      'POST_PERIOD',
      'InmoInvoices',
      period,
      `Período ${period}: contabilizadas ${posted}, omitidas ${skipped}, fallidas ${failed}`,
    );

    return { period, total: invoices.length, posted, skipped, failed, failures };
  },

  async unpostInmoInvoice(invoiceId) {
    const inv = await pb.get('inmo_invoices', invoiceId);
    if (inv.status === 'draft') throw new Error('La factura ya está en borrador.');
    if (inv.status === 'voided') throw new Error('La factura está anulada.');

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

    await pb.update('inmo_invoices', invoiceId, { status: 'draft', tx_id: null });
    await this.logAudit('UNPOST', 'InmoInvoice', invoiceId, `Descontabilizada ${inv.number || invoiceId} | TX->${txAction}`);
    return { invoiceId, txAction };
  },

  async unpostInmoInvoicesByPeriod(period) {
    const safePeriod = pb.escapeFilterValue(period);
    const invoices = await pb.listAll('inmo_invoices', { filter: `period="${safePeriod}"`, perPage: 200 });
    if (!invoices.length) throw new Error(`No hay facturas para el período ${period}.`);

    let reverted = 0;
    let skipped = 0;
    let txDraft = 0;
    let txVoided = 0;

    for (const inv of invoices) {
      if (inv.status === 'draft' || inv.status === 'voided') {
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

      await pb.update('inmo_invoices', inv.id, { status: 'draft', tx_id: null });
      reverted++;
    }

    await this.logAudit(
      'UNPOST_PERIOD',
      'InmoInvoices',
      period,
      `Período ${period}: descontabilizadas ${reverted}, omitidas ${skipped}, TX->draft ${txDraft}, TX->voided ${txVoided}`,
    );

    return { period, total: invoices.length, reverted, skipped, txDraft, txVoided };
  },

  async deleteInmoInvoicesByPeriod(period) {
    const safePeriod = pb.escapeFilterValue(period);
    const invoices = await pb.listAll('inmo_invoices', { filter: `period="${safePeriod}"`, perPage: 200 });
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

      await pb.delete('inmo_invoices', inv.id);
      deleted++;
    }

    await this.logAudit(
      'DELETE_PERIOD',
      'InmoInvoices',
      period,
      `Período ${period}: facturas eliminadas ${deleted}, TX eliminadas ${txDeleted}, TX anuladas ${txVoided}`,
    );

    return { period, total: invoices.length, deleted, txDeleted, txVoided };
  },

  async postInmoInvoice(invoiceId) {
    const inv = await pb.get('inmo_invoices', invoiceId, {
      expand: 'contract_id,contract_id.property_id,contract_id.property_id.owner_id,contract_id.tenant_id',
    });
    if (inv.status === 'posted') throw new Error('La factura ya fue contabilizada.');
    if (inv.status === 'voided') throw new Error('La factura está anulada.');

    const lines = await this.getInmoInvoiceLines(invoiceId);
    if (!lines.length) throw new Error('La factura no tiene líneas.');

    // Leer configuración contable Inmobiliarias
    let inmoCfg = {};
    try {
      const raw = await this.getSetting('inmo_config_v1');
      inmoCfg = raw ? JSON.parse(raw) : {};
    } catch (_) { inmoCfg = {}; }

    const cxcTenantCode = String(inmoCfg.cxc_tenant_code || '130505').trim();
    const commissionIncomeCode = String(inmoCfg.commission_income_code || '413505').trim();
    const cxpOwnerCode = String(inmoCfg.cxp_owner_code || '220505').trim();

    // Buscar tipo de transacción IA
    const iaTypes = await pb.list('transaction_types', {
      filter: 'code="IA" && active=true',
      perPage: 1,
    });
    if (!iaTypes.items.length) throw new Error('Tipo de transacción IA no encontrado. Reinicia PocketBase para aplicar la migración.');
    const txType = iaTypes.items[0];

    // Terceros involucrados
    const tenantId = inv.expand?.contract_id?.tenant_id?.id || null;
    const ownerId = inv.expand?.contract_id?.property_id?.expand?.owner_id?.id || null;

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
      if (!res.items.length) throw new Error(`Cuenta "${code}" no encontrada.`);
      const acc = res.items[0];
      accountByCodeCache[key] = acc;
      accountByIdCache[acc.id] = acc;
      return acc;
    };

    const cxcTenantAcc = await findAccByCode(cxcTenantCode);
    const commissionIncomeAcc = await findAccByCode(commissionIncomeCode);
    const cxpOwnerAcc = await findAccByCode(cxpOwnerCode);

    const txLines = [];
    
    // 1. Débito a Cuentas por cobrar inquilino (por el total)
    txLines.push({
      account_id: cxcTenantAcc.id,
      third_party_id: tenantId,
      debit: inv.total || 0,
      credit: 0,
      description: `Canon Inmueble ${inv.expand?.contract_id?.expand?.property_id?.title || ''} período ${inv.period}`,
      line_order: 1,
    });

    // 2. Crédito a Ingresos por comisión (por el commission_amount)
    txLines.push({
      account_id: commissionIncomeAcc.id,
      third_party_id: ownerId, // La comisión se le cobra al propietario
      debit: 0,
      credit: inv.commission_amount || 0,
      description: `Comisión Administración Inmobiliaria - Factura ${inv.number}`,
      line_order: 2,
    });

    // 3. Crédito a Cuentas por pagar propietario (por el net_to_owner)
    txLines.push({
      account_id: cxpOwnerAcc.id,
      third_party_id: ownerId,
      debit: 0,
      credit: inv.net_to_owner || 0,
      description: `Neto Propietario por Canon - Factura ${inv.number}`,
      line_order: 3,
    });

    // Validar sumas de partida doble
    const totalDebit = txLines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = txLines.reduce((sum, l) => sum + (l.credit || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 1.0) {
      throw new Error(`Descuadre contable detectado. Débito: ${totalDebit}, Crédito: ${totalCredit}.`);
    }

    const tx = await this.createTransaction({
      tx_type_id: txType.id,
      number: 'AUTO',
      date: inv.date,
      description: `Facturación Arriendo ${inv.number} - Inmueble: ${inv.expand?.contract_id?.expand?.property_id?.title || ''}`,
      third_party_id: tenantId,
      status: 'active',
      branch_id: inv.branch_id || null,
    }, txLines);

    await pb.update('inmo_invoices', invoiceId, {
      status: 'posted',
      tx_id: tx.id,
    });

    await this.logAudit('POST', 'InmoInvoice', invoiceId, `Contabilizada ${inv.number} -> TX ${tx.number}`);
    return { inv, tx };
  },
};

// --- VITE MIGRATION GLOBALS ---
(window as any).pb = pb;
(window as any).API = API;
(window as any).PB_URL = PB_URL;
