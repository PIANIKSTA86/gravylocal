/**
 * GRAVY v2.0 ï¿½ api.js
 * Capa de acceso a PocketBase REST API.
 * Reemplaza completamente a SQL.js / localStorage.
 */

'use strict';

/* -- URL base ï¿½ detecta automaticamente el servidor ------- */
// PB_URL is resolved dynamically via pb.baseUrl to support multi-tenant routing

/* -- Cliente minimo PocketBase (sin SDK externo) ----------- */
const pb = {
  _token: null,
  _user: null,
  _baseUrl: null,

  get baseUrl() { return this._baseUrl ?? (window as any).PB_URL ?? window.location.origin; },
  set baseUrl(v) { this._baseUrl = v; (window as any).PB_URL = v; },

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

  /** GET /api/collections/:col/records con filtro y paginación */
  async list(collection, { filter = '', sort = '', page = 1, perPage = 200, expand = '', ignoreBranch = false, ignoreCostCenter = false } = {}) {
    const branchScoped = ['transactions', 'tx_lines', 'invoices', 'purchase_invoices', 'inventory_movements', 'payroll_periods', 'pos_registers', 'pos_shifts', 'sales_orders', 'niif_assets'];
    const activeBranchId = localStorage.getItem('active_branch_id');
    if (activeBranchId && activeBranchId !== 'TODAS' && activeBranchId !== 'ALL' && branchScoped.includes(collection) && !ignoreBranch) {
      const branchFilter = `branch_id = "${this.escapeFilterValue(activeBranchId)}"`;
      filter = filter ? `(${filter}) && ${branchFilter}` : branchFilter;
    }

    const costCenterScoped = ['tx_lines', 'inventory_movements', 'niif_assets'];
    const activeCostCenterId = localStorage.getItem('active_cost_center_id');
    if (activeCostCenterId && activeCostCenterId !== 'TODOS' && activeCostCenterId !== 'ALL' && costCenterScoped.includes(collection) && !ignoreCostCenter) {
      const ccFilter = `cost_center_id = "${this.escapeFilterValue(activeCostCenterId)}"`;
      filter = filter ? `(${filter}) && ${ccFilter}` : ccFilter;
    }

    const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
    if (filter) params.set('filter', filter);
    if (sort) params.set('sort', sort);
    if (expand) params.set('expand', expand);
    const res = await fetch(`${pb.baseUrl}/api/collections/${collection}/records?${params}`, {
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
    const res = await fetch(`${pb.baseUrl}/api/collections/${collection}/records/${id}${params}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw await this._err(res);
    return res.json();
  },

  /** POST  crear registro */
  async create(collection, data) {
    if (data && typeof data === 'object' && !(data instanceof FormData)) {
      const relFields = ['owner_id', 'occupant_id', 'account_id', 'property_id', 'concept_id', 'invoice_id', 'branch_id', 'cost_center_id'];
      for (const field of relFields) {
        if (field in data && (data[field] === '' || data[field] === undefined)) {
          data[field] = null;
        }
      }
    }

    const branchScoped = ['transactions', 'invoices', 'purchase_invoices', 'inventory_movements', 'payroll_periods', 'pos_registers', 'pos_shifts', 'sales_orders'];
    if (branchScoped.includes(collection) && data && typeof data === 'object' && !(data instanceof FormData)) {
      const activeBranchId = localStorage.getItem('active_branch_id');
      const user = this.currentUser;
      const targetBranchId = (activeBranchId && activeBranchId !== 'TODAS' && activeBranchId !== 'ALL') 
        ? activeBranchId 
        : (user?.default_branch_id || null);
      
      if (targetBranchId && !data.branch_id) {
        data.branch_id = targetBranchId;
      }

      // Clean up invalid branch_id relation value (must be 15 alphanumeric characters)
      if (data.branch_id !== undefined && data.branch_id !== null && data.branch_id !== '' && !/^[a-z0-9]{15}$/.test(String(data.branch_id))) {
        data.branch_id = null;
      }
    }

    if (data && typeof data === 'object' && !(data instanceof FormData)) {
      if (data.cost_center_id !== undefined && data.cost_center_id !== null && data.cost_center_id !== '' && !/^[a-z0-9]{15}$/.test(String(data.cost_center_id))) {
        data.cost_center_id = null;
      }
    }

    const isForm = data instanceof FormData;
    const headers = isForm ? (this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}) : this.headers();
    const body = isForm ? data : JSON.stringify(data);
    const res = await fetch(`${pb.baseUrl}/api/collections/${collection}/records`, {
      method: 'POST',
      headers: headers,
      body,
    });
    if (!res.ok) throw await this._err(res);
    return res.json();
  },

  /** PATCH  actualizar registro */
  async update(collection, id, data) {
    if (data && typeof data === 'object' && !(data instanceof FormData)) {
      const relFields = ['owner_id', 'occupant_id', 'account_id', 'property_id', 'concept_id', 'invoice_id', 'branch_id', 'cost_center_id'];
      for (const field of relFields) {
        if (field in data && (data[field] === '' || data[field] === undefined)) {
          data[field] = null;
        }
      }
    }

    const branchScoped = ['transactions', 'invoices', 'purchase_invoices', 'inventory_movements', 'payroll_periods', 'pos_registers', 'pos_shifts', 'sales_orders'];
    if (branchScoped.includes(collection) && data && typeof data === 'object' && !(data instanceof FormData)) {
      if (data.branch_id !== undefined && data.branch_id !== null && data.branch_id !== '' && !/^[a-z0-9]{15}$/.test(String(data.branch_id))) {
        data.branch_id = null;
      }
    }

    if (data && typeof data === 'object' && !(data instanceof FormData)) {
      if (data.cost_center_id !== undefined && data.cost_center_id !== null && data.cost_center_id !== '' && !/^[a-z0-9]{15}$/.test(String(data.cost_center_id))) {
        data.cost_center_id = null;
      }
    }

    const isForm = data instanceof FormData;
    const headers = isForm ? (this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}) : this.headers();
    const body = isForm ? data : JSON.stringify(data);
    const res = await fetch(`${pb.baseUrl}/api/collections/${collection}/records/${id}`, {
      method: 'PATCH',
      headers: headers,
      body,
    });
    if (!res.ok) throw await this._err(res);
    return res.json();
  },

  /** DELETE  eliminar registro */
  async delete(collection, id) {
    const res = await fetch(`${pb.baseUrl}/api/collections/${collection}/records/${id}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    if (!res.ok && res.status !== 204) throw await this._err(res);
    return true;
  },

  /** Autenticaciï¿½n de usuario */
  async authWithPassword(email, password) {
    const res = await fetch(`${pb.baseUrl}/api/collections/users/auth-with-password`, {
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
    const res = await fetch(`${pb.baseUrl}/api/collections/users/auth-refresh`, {
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

  /** Cerrar sesiï¿½n */
  logout() {
    this.authToken = null;
    this.currentUser = null;
  },

  /** Ping al servidor */
  async ping() {
    try {
      const res = await fetch(`${pb.baseUrl}/api/health`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch { return false; }
  },

  /** Error helper */
  async _err(res) {
    let body = {};
    try { body = await res.json(); } catch { body = { message: res.statusText }; }
    // Extraer errores por campo de la respuesta de validacion de PocketBase
    const fieldErrors = [];
    if (body && body.data && typeof body.data === 'object') {
      for (const [field, detail] of Object.entries(body.data)) {
        const fieldMsg = detail && detail.message;
        if (fieldMsg) fieldErrors.push('[' + field + '] ' + fieldMsg);
      }
    }
    // Si hay errores de campo especificos, mostrarlos; si no, usar el mensaje generico
    const msg = fieldErrors.length > 0
      ? fieldErrors.join(' | ')
      : (body && body.message) || 'Error desconocido';
    const err = new Error(msg);
    err.status = res.status;
    err.data = body;
    return err;
  },

  /** Enviar solicitud HTTP genÃ©rica */
  async send(path, options = {}) {
    const url = path.startsWith('http') ? path : `${pb.baseUrl}${path}`;
    const headers = { ...this.headers(), ...options.headers };
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body,
    });
    if (!res.ok) throw await this._err(res);
    return res.json();
  },

  /** Registro de evento de auditoría */
  async logAudit(action, entity, entityId = null, details = '') {
    try {
      if (!this.authToken) return;
      await fetch(`${this.baseUrl}/api/audit-event`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({
          action: String(action || ''),
          entity: String(entity || ''),
          entity_id: entityId ? String(entityId) : '',
          details: String(details || ''),
        }),
      });
    } catch (_) {
      // Tolerar fallos sin romper flujos
    }
  },
};

/* -- Helpers internos de resoluciÃ³n de cuentas ---------------- */
const _apiAccountCache = {};
async function _apiFindAccByCode(code) {
  const key = String(code || '').trim();
  if (!key) throw new Error('Se requiere un cÃ³digo de cuenta vÃ¡lido.');
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
        throw new Error('No tienes permisos para modificar configuraciÃ³n global.');
      }
      throw err;
    }
  },

  // -- auditoria ---------------------------------------------
  async logAudit(action, entity, entityId = null, details = '') {
    try {
      if (!pb.authToken) return;
      await fetch(`${pb.baseUrl}/api/audit-event`, {
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
      // Nunca romper flujos de negocio por falla de auditorÃ­a.
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

  async getAccountSaldos(period = '') {
    // Consume el endpoint optimizado que realiza la agregación directamente en el servidor SQLite
    try {
      const url = new URL(`${pb.baseUrl}/api/gravy/account-saldos`);
      if (period) {
        url.searchParams.append('period', period);
      }
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: pb.headers(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error('[getAccountSaldos] Error con endpoint optimizado:', err);
    }

    // Fallback original si por alguna razón falla el endpoint optimizado
    let filter = 'tx_id.status="active"';
    if (period && /^\d{4}-\d{2}$/.test(period)) {
      const [yearStr, monthStr] = period.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const startDate = `${year}-${String(month).padStart(2, '0')}-01 00:00:00`;
      let nextYear = year;
      let nextMonth = month + 1;
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
      }
      const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01 00:00:00`;
      filter += ` && tx_id.date >= "${startDate}" && tx_id.date < "${endDate}"`;
    }
    const lines = await pb.listAll('tx_lines', {
      expand: 'tx_id',
      filter,
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

  async getThirdPartyBranches(thirdPartyId) {
    if (!thirdPartyId) return [];
    try {
      const safeId = pb.escapeFilterValue(thirdPartyId);
      return await pb.listAll('third_party_branches', {
        filter: `third_party_id = "${safeId}" && active = true`,
        sort: '-is_main,code'
      });
    } catch { return []; }
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
    //
    // ESTRATEGIA: Usar endpoint bulk-tx (1 request atómico) para evitar timeout
    // con comprobantes de muchas líneas (ej: saldos iniciales con 100+ cuentas).
    // Si el endpoint no está disponible, hace fallback al método línea-por-línea.

    const txBranchId = txData.branch_id || null;

    // ── Intentar endpoint bulk (recomendado para 5+ líneas) ──────────────────
    try {
      const res = await fetch(`${pb.baseUrl}/api/gravy/bulk-tx`, {
        method: 'POST',
        headers: pb.headers(),
        body: JSON.stringify({
          txData: {
            ...txData,
            number: txData.number || 'AUTO',
            status: txData.status || 'active',
            branch_id: txBranchId,
          },
          lines: lines.map((line, i) => ({
            ...line,
            branch_id: line.branch_id || txBranchId || null,
            line_order: line.line_order ?? (i + 1),
          })),
        }),
      });

      if (res.ok) {
        return await res.json();
      }

      // Si el servidor devuelve 404, el endpoint no existe — usar fallback
      if (res.status === 404) {
        console.warn('[createTransaction] Endpoint bulk-tx no disponible, usando método línea a línea.');
        // Continúa al fallback abajo
      } else {
        // Otro error HTTP: lanzar para que el llamador lo maneje
        throw await pb._err(res);
      }
    } catch (bulkErr) {
      // Si el error fue un throw nuestro (no 404), re-lanzar
      if (bulkErr && bulkErr.status !== undefined && bulkErr.status !== 404) {
        throw bulkErr;
      }
      // Si fue un error de red puro (fetch failed), intentar fallback
      console.warn('[createTransaction] Bulk endpoint falló, usando fallback:', bulkErr?.message || bulkErr);
    }

    // ── Fallback: crear cabecera + líneas una por una (método original) ───────
    const tx = await pb.create('transactions', {
      ...txData,
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
      // Evita dejar cabeceras huérfanas si falla la persistencia de una línea.
      try { await pb.delete('transactions', tx.id); } catch (_) { }
      throw lineErr;
    }

    try {
      await this.logAudit('CREATE', 'transactions', tx.id, `Transacción ${tx.number || ''} creada`);
    } catch (_) {}

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
      ignoreBranch: true,
    });
  },

  async voidTransaction(txId, description = '') {
    const tx = await pb.get('transactions', txId);
    if (tx.status === 'voided') return tx;
    await pb.update('transactions', txId, { status: 'voided' });
    await this.logAudit('VOID', 'transactions', txId, description || `TransacciÃ³n ${tx.number} anulada`);
    return tx;
  },

  async approveTx(txId) {
    const tx = await pb.get('transactions', txId);
    if (tx.status !== 'draft') throw new Error('Solo se pueden aprobar transacciones en estado Borrador.');
    await pb.update('transactions', txId, { status: 'active' });
    await this.logAudit('APPROVE', 'transactions', txId, `TransacciÃ³n ${tx.number} aprobada`);
    return tx;
  },

  async revertTxToDraft(txId) {
    const tx = await pb.get('transactions', txId);
    if (tx.status !== 'active') throw new Error('Solo se pueden revertir transacciones Activas a Borrador.');
    await pb.update('transactions', txId, { status: 'draft' });
    await this.logAudit('REVERT_DRAFT', 'transactions', txId, `TransacciÃ³n ${tx.number} revertida a Borrador`);
    return tx;
  },

  async updateTransaction(txId, txData, lines) {
    const branchId = txData.branch_id || null;
    try {
      const res = await fetch(`${pb.baseUrl}/api/gravy/bulk-tx`, {
        method: 'POST',
        headers: pb.headers(),
        body: JSON.stringify({
          txData: {
            ...txData,
            id: txId,
            branch_id: branchId,
          },
          lines: lines.map((l: any, idx: number) => ({
            ...l,
            branch_id: l.branch_id || branchId || null,
            line_order: l.line_order ?? (idx + 1),
          })),
        }),
      });

      if (res.ok) {
        await this.logAudit('UPDATE', 'transactions', txId, 'Modificación desde consulta de transacciones');
        return await res.json();
      }

      if (res.status === 404) {
        console.warn('[updateTransaction] Endpoint bulk-tx no disponible, usando método fallback.');
      } else {
        throw await pb._err(res);
      }
    } catch (err: any) {
      if (err && err.status !== undefined && err.status !== 404) {
        throw err;
      }
      console.warn('[updateTransaction] Bulk endpoint falló, usando fallback:', err?.message || err);
    }

    // Fallback: Si el endpoint bulk-tx no estuviese disponible
    await pb.update('transactions', txId, txData);
    const safeId = pb.escapeFilterValue(txId);
    const oldLines = await pb.listAll('tx_lines', { filter: `tx_id="${safeId}"`, ignoreBranch: true });
    for (const l of oldLines) {
      try {
        await pb.delete('tx_lines', l.id);
      } catch (err: any) {
        if (err?.status !== 404 && err?.response?.code !== 404) throw err;
      }
    }
    for (const line of lines) {
      await pb.create('tx_lines', { tx_id: txId, ...line });
    }
    await this.logAudit('UPDATE', 'transactions', txId, 'Modificación desde consulta de transacciones');
  },


  async checkTxDependencies(txId, options: { ignoreEinvoiceBlock?: boolean } = {}) {
    const safe = pb.escapeFilterValue(txId);
    const blocks: string[] = [];
    const warnings: string[] = [];

    const userRole = String(pb.currentUser?.role || '').toLowerCase().trim();
    const isSuperAdminOrContador = options.ignoreEinvoiceBlock ?? ['superadmin', 'superadministrador', 'contador'].includes(userRole);

    // BLOQUEO: Solo documentos electrónicos ya enviados o aceptados por la DIAN (firmados = inmutables)
    try {
      const einv = await pb.list('einvoice_docs', {
        filter: `tx_id="${safe}" && (status="enviada" || status="aceptada")`,
        perPage: 1,
      });
      if (einv.totalItems > 0) {
        const doc = einv.items[0];
        const estado = doc.status === 'aceptada' ? 'Aceptada por DIAN' : 'Enviada a DIAN';
        if (isSuperAdminOrContador) {
          warnings.push(`Este comprobante tiene un documento electrónico DIAN con estado "${estado}". Como usuario ${userRole === 'contador' ? 'CONTADOR' : 'SUPERADMINISTRADOR'}, tienes permisos especiales para modificar esta transacción.`);
        } else {
          blocks.push(`Este comprobante tiene un documento electrónico DIAN con estado "${estado}". Los documentos fiscales ya transmitidos son inalterables por usuarios sin permisos de SUPERADMINISTRADOR o CONTADOR.`);
        }
      }
    } catch (_) {}

    // ADVERTENCIA: Período de nómina vinculado (informativo - no bloquea)
    try {
      const payP = await pb.list('payroll_periods', { filter: `tx_id="${safe}"`, perPage: 1 });
      if (payP.totalItems > 0) {
        const period = payP.items[0];
        const estadoLabel = { draft: 'Borrador', approved: 'Aprobado', paid: 'Pagado' }[period.status] || period.status;
        warnings.push(`Este comprobante es el asiento de nómina del período "${period.name}" (${estadoLabel}). Si lo modificas, el asiento contable de nómina quedará desincronizado con las liquidaciones.`);
      }
    } catch (_) {}

    // ADVERTENCIA: Movimientos bancarios conciliados (informativo - no bloquea)
    try {
      const txLines = await pb.listAll('tx_lines', { filter: `tx_id="${safe}"`, ignoreBranch: true });
      let reconCount = 0;
      if (txLines.length > 0) {
        // Consultar en lotes de máximo 15 IDs para evitar desbordar los límites de longitud de URL en PocketBase
        const CHUNK_SIZE = 15;
        for (let i = 0; i < txLines.length; i += CHUNK_SIZE) {
          const chunk = txLines.slice(i, i + CHUNK_SIZE);
          const lineFilter = chunk
            .map((l: any) => `tx_line_id="${pb.escapeFilterValue(l.id)}"`)
            .join(' || ');
          const bm = await pb.list('bank_movements', {
            filter: `(${lineFilter}) && reconciled=true`,
            perPage: 1,
          }).catch(() => ({ totalItems: 0 }));
          reconCount += (bm.totalItems || 0);
        }
      }
      if (reconCount > 0) {
        warnings.push(`Tiene ${reconCount} movimiento(s) bancario(s) conciliado(s). Revisa la conciliación bancaria después de modificar.`);
      }
    } catch (_) {}

    // ADVERTENCIA: Movimientos de inventario asociados
    try {
      const invMovs = await pb.listAll('inventory_movements', { filter: `tx_id="${safe}"` }).catch(() => []);
      const salesWithMov = await pb.listAll('invoices', { filter: `tx_id="${safe}" && inv_movement_id!=""` }).catch(() => []);
      const purchasesWithMov = await pb.listAll('purchase_invoices', { filter: `tx_id="${safe}" && inv_movement_id!=""` }).catch(() => []);
      const totalMovs = new Set([...invMovs.map((m: any) => m.id), ...salesWithMov.map((s: any) => s.inv_movement_id), ...purchasesWithMov.map((p: any) => p.inv_movement_id)]).size;
      if (totalMovs > 0) {
        warnings.push(`Se detectaron ${totalMovs} movimiento(s) de inventario asociado(s). La eliminación total revertirá el stock de productos en bodega y erradicará dichos movimientos de inventario.`);
      }
    } catch (_) {}

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

  async getDashboardSummary(branchId = '', advisorId = '') {
    const url = new URL(`${pb.baseUrl}/api/gravy/dashboard-summary`);
    if (branchId) {
      url.searchParams.append('branch_id', branchId);
    }
    if (advisorId) {
      url.searchParams.append('advisor_id', advisorId);
    }
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: pb.headers(),
    });
    if (!res.ok) {
      throw new Error(`Error obteniendo resumen de dashboard: ${await res.text()}`);
    }
    return await res.json();
  },

  // -- Inventarios -------------------------------------------

  /** Bodegas */
  async getWarehouses(activeOnly = true, branchId = '') {
    let filter = activeOnly ? 'active=true' : '';
    if (branchId) {
      const branchFilter = `(branch_id = "${pb.escapeFilterValue(branchId)}" || branch_id = "" || branch_id = null)`;
      filter = filter ? `(${filter}) && ${branchFilter}` : branchFilter;
    }
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

  /** Stock de inventario proyectado a una fecha de corte (Kardex histórico) */
  async getInventoryStockAsOf(opts: { asOfDate: string; warehouseId?: string; category?: string; line?: string }) {
    const params = new URLSearchParams();
    if (opts.asOfDate) params.append('asOfDate', opts.asOfDate);
    if (opts.warehouseId) params.append('warehouseId', opts.warehouseId);
    if (opts.category) params.append('category', opts.category);
    if (opts.line) params.append('line', opts.line);

    const activeBranchId = localStorage.getItem('active_branch_id') || 'TODAS';
    if (activeBranchId && activeBranchId !== 'TODAS' && activeBranchId !== 'ALL') {
      params.append('branch_id', activeBranchId);
    }

    const res = await pb.send(`/api/gravy/report-inventory-as-of?${params.toString()}`, {
      method: 'GET'
    });
    return res.items || [];
  },

  /** Retorna si la configuración permite stock negativo en inventarios, POS o Ventas */
  async isNegativeStockAllowed(): Promise<boolean> {
    try {
      const invCfgRaw = await this.getSetting('inventory_settings_v1');
      if (invCfgRaw) {
        const parsed = JSON.parse(invCfgRaw);
        if (parsed?.allow_negative_stock === true) return true;
      }
    } catch (_) {}

    try {
      const posCfgRaw = await this.getSetting('pos_settings_v1');
      if (posCfgRaw) {
        const parsed = JSON.parse(posCfgRaw);
        if (parsed?.operational?.allow_negative_stock === true) return true;
      }
    } catch (_) {}

    try {
      const salesCfgRaw = await this.getSetting('sales_settings_v2');
      if (salesCfgRaw) {
        const parsed = JSON.parse(salesCfgRaw);
        if (parsed?.operational?.allow_negative_stock === true) return true;
      }
    } catch (_) {}

    return false;
  },

  /** Recalcular todas las existencias y costos de inventario */
  async recalculateStock() {
    return pb.send('/api/gravy/recalculate-stock', { method: 'POST' });
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

    const allowNegative = await this.isNegativeStockAllowed();

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
          // OpciÃ³n B: Stock negativo resuelto por compra/entrada positiva
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
                    description: `Ajuste automÃ¡tico de costeo por stock negativo resuelto - Prod ${prod.name}`,
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
    // Actualizar Ãºltimo costo en el producto cuando viene de una entrada con costo
    if (finalAvgCostForProductUpdate !== null && finalAvgCostForProductUpdate > 0) {
      await pb.update('products', productId, { cost_price: finalAvgCostForProductUpdate });
    }
    return;
  },

  /** Movimientos de inventario paginados */
  async getInventoryMovements(opts: any = {}) {
    const { page = 1, perPage = 50, filter = '', sort = '-date,-number' } = opts;
    const result = await pb.list('inventory_movements', {
      page, perPage, filter, sort,
      expand: 'warehouse_id,dest_warehouse_id,third_party_id,tx_id,concept_id',
    });

    const movs = result.items || [];
    if (!movs.length) return result;

    const pendingIds = movs
      .filter((m: any) => m.total_qty === undefined || m.total_cost === undefined || m.total_qty === null)
      .map((m: any) => m.id);

    if (pendingIds.length > 0) {
      const filterQuery = pendingIds.map((id: string) => `movement_id="${pb.escapeFilterValue(id)}"`).join('||');
      const allLines = await pb.listAll('inventory_movement_lines', {
        filter: filterQuery,
        fields: 'movement_id,qty,unit_cost',
      }).catch(() => []);

      const aggregatesMap = new Map<string, { totalQty: number; totalCost: number }>();
      for (const line of allLines) {
        const existing = aggregatesMap.get(line.movement_id) || { totalQty: 0, totalCost: 0 };
        const q = Number(line.qty || 0);
        const c = Number(line.unit_cost || 0);
        existing.totalQty += q;
        existing.totalCost += (q * c);
        aggregatesMap.set(line.movement_id, existing);
      }

      for (const mov of movs) {
        if (mov.total_qty === undefined || mov.total_qty === null) {
          const agg = aggregatesMap.get(mov.id) || { totalQty: 0, totalCost: 0 };
          mov.total_qty = agg.totalQty;
          mov.total_cost = agg.totalCost;
        }
      }
    }

    return result;
  },

  /** Mapea el tipo de movimiento a su prefijo de 3 letras (ENT, SAL, TRA, INV) */
  getInventoryTypePrefix(movType: string = ''): string {
    const tp = String(movType || '').trim().toUpperCase();
    if (tp === 'ENTRADA' || tp === 'AJUSTE_POSITIVO') return 'ENT';
    if (tp === 'SALIDA' || tp === 'AJUSTE_NEGATIVO') return 'SAL';
    if (tp === 'TRASLADO') return 'TRA';
    return 'INV';
  },

  /** Genera el consecutivo mensual de movimiento respetando el tipo (ej. ENT-202607-0001, SAL-202607-0001) */
  async getNextInventoryMovementNumber(dateStr: string = '', movType: string = '') {
    const d = dateStr || new Date().toISOString().slice(0, 10);
    const period = d.slice(0, 7).replace('-', '');
    const typePrefix = this.getInventoryTypePrefix(movType);
    const prefix = `${typePrefix}-${period}-`;

    const records = await pb.listAll('inventory_movements', {
      filter: `number ~ "${prefix}"`,
    }).catch(() => []);

    let maxSeq = 0;
    for (const r of records) {
      if (r.number && r.number.startsWith(prefix)) {
        const seqStr = r.number.slice(prefix.length);
        const seqNum = parseInt(seqStr, 10);
        if (!isNaN(seqNum) && seqNum > maxSeq) {
          maxSeq = seqNum;
        }
      }
    }

    const nextSeq = maxSeq + 1;
    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  },

  /** Renumerar movimientos existentes al formato mensual secuencial respetando el tipo (ENT, SAL, TRA, INV) */
  async renumberLegacyInventoryMovements() {
    const movs = await pb.listAll('inventory_movements').catch(() => []);

    if (!movs.length) return { updated: 0, total: 0 };

    // Ordenar cronológicamente en memoria por fecha y creación
    movs.sort((a: any, b: any) => {
      const dateA = a.date || (a.created ? a.created.slice(0, 10) : '');
      const dateB = b.date || (b.created ? b.created.slice(0, 10) : '');
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return (a.created || '').localeCompare(b.created || '');
    });

    const groupMap = new Map<string, any[]>();
    for (const m of movs) {
      const d = m.date || (m.created ? m.created.slice(0, 10) : new Date().toISOString().slice(0, 10));
      const period = d.slice(0, 7).replace('-', '');
      const typePrefix = this.getInventoryTypePrefix(m.mov_type);
      const key = `${typePrefix}-${period}`;

      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(m);
    }

    let updatedCount = 0;
    for (const [key, items] of groupMap.entries()) {
      let seq = 1;
      for (const item of items) {
        const expectedNumber = `${key}-${String(seq).padStart(4, '0')}`;
        if (item.number !== expectedNumber) {
          await pb.update('inventory_movements', item.id, { number: expectedNumber });
          updatedCount++;
        }
        seq++;
      }
    }

    return { updated: updatedCount, total: movs.length };
  },

  /** Líneas de un movimiento */
  async getInventoryMovementLines(movementId: string) {
    const safe = pb.escapeFilterValue(movementId);
    return pb.listAll('inventory_movement_lines', {
      filter: `movement_id="${safe}"`,
      sort: 'line_order',
      expand: 'product_id',
    });
  },

  /** Validar que las cantidades de salida/traslado no superen el stock de origen */
  async validateOutgoingStock(warehouseId: string, lines: any[], movType: string) {
    const isOutbound = movType === 'SALIDA' || movType === 'TRASLADO' || movType === 'AJUSTE_NEGATIVO';
    if (!isOutbound || !warehouseId || !lines || !lines.length) return;

    // Consultar configuración operativa de inventarios
    const allowNegative = await this.isNegativeStockAllowed();

    // Si la configuración permite stock negativo, se autoriza la operación sin bloquear
    if (allowNegative) return;

    const stockMap = new Map<string, number>();
    const stockRows = await this.getInventoryStock({ warehouseId }).catch(() => []);
    for (const s of stockRows) {
      stockMap.set(s.product_id, Number(s.qty_on_hand || 0));
    }

    const requestedQtyMap = new Map<string, number>();
    for (const line of lines) {
      const pid = line.product_id;
      const q = Number(line.qty || 0);
      if (pid && q > 0) {
        requestedQtyMap.set(pid, (requestedQtyMap.get(pid) || 0) + q);
      }
    }

    const errors: string[] = [];
    for (const [pid, reqQty] of requestedQtyMap.entries()) {
      const available = stockMap.get(pid) || 0;
      if (reqQty > available) {
        const lineMatch = lines.find((l: any) => l.product_id === pid);
        const prod = lineMatch?.expand?.product_id;
        const prodName = prod ? `${prod.code} - ${prod.name}` : pid;
        errors.push(`• ${prodName}: Disponible: ${available}, Solicitado: ${reqQty}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Stock insuficiente en la bodega origen para procesar la salida/traslado:\n${errors.join('\n')}`);
    }
  },

  /** Aplica un movimiento: actualiza stock + genera asiento contable si procede */
  async applyInventoryMovement(movId: string) {
    const mov = await pb.get('inventory_movements', movId, { expand: 'warehouse_id,dest_warehouse_id' });
    if (mov.status === 'applied') throw new Error('El movimiento ya fue aplicado.');
    if (mov.status === 'voided') throw new Error('El movimiento está anulado.');

    const lines = await this.getInventoryMovementLines(movId);
    if (!lines.length) throw new Error('El movimiento no tiene líneas.');

    // Validación estricta de existencias origen antes de aplicar
    await this.validateOutgoingStock(mov.warehouse_id, lines, mov.mov_type);

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
    await this.logAudit('APPLY', 'InventoryMovement', movId, `${mov.mov_type} - ${mov.number}`);
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
    if (mov.tx_id) {
      await this.voidTransaction(mov.tx_id, `Anulación automática por anulación de movimiento ${mov.number}`).catch(() => {});
    }
    await this.logAudit('VOID', 'InventoryMovement', movId, `Anulación ${mov.mov_type} - ${mov.number}${reason ? ` | Motivo: ${reason}` : ''}`);
  },

  /** Valida si revertir un movimiento dejaría existencias negativas en bodega */
  async validateMovementReversal(movId: string) {
    const allowNegative = await this.isNegativeStockAllowed();
    if (allowNegative) return;

    const mov = await pb.get('inventory_movements', movId, { expand: 'warehouse_id,dest_warehouse_id' });
    const lines = await this.getInventoryMovementLines(movId);
    const isIn = mov.mov_type === 'ENTRADA' || mov.mov_type === 'AJUSTE_POSITIVO';
    const isTran = mov.mov_type === 'TRASLADO';

    const errors: string[] = [];

    for (const line of lines) {
      const prod = line.expand?.product_id;
      const prodName = prod ? `${prod.code} - ${prod.name}` : line.product_id;

      if (isIn) {
        const stockArr = await this.getInventoryStock({ warehouseId: mov.warehouse_id, productId: line.product_id }).catch(() => []);
        const currentQty = Number(stockArr[0]?.qty_on_hand || 0);
        if (currentQty - line.qty < 0) {
          errors.push(`• ${prodName}: Stock actual de ${currentQty} en bodega origen, se requieren ${line.qty} para revertir.`);
        }
      } else if (isTran) {
        const destStockArr = await this.getInventoryStock({ warehouseId: mov.dest_warehouse_id, productId: line.product_id }).catch(() => []);
        const destQty = Number(destStockArr[0]?.qty_on_hand || 0);
        if (destQty - line.qty < 0) {
          errors.push(`• ${prodName}: Stock actual de ${destQty} en bodega destino, se requieren ${line.qty} para revertir.`);
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`No se puede modificar/desaplicar el movimiento porque dejaría existencias negativas:\n${errors.join('\n')}`);
    }
  },

  /** Revierte el stock de un movimiento aplicado y cambia su estado a draft para permitir edición */
  async unapplyMovementForEdit(movId: string) {
    await this.validateMovementReversal(movId);

    const mov = await pb.get('inventory_movements', movId);
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

    await pb.update('inventory_movements', movId, { status: 'draft' });
    await this.logAudit('UNAPPLY_FOR_EDIT', 'InventoryMovement', movId, `Desaplicación para edición: ${mov.number}`);
    return mov;
  },

  /** Actualiza un movimiento en estado borrador (encabezado y reemplazo de líneas) */
  async updateInventoryMovement(movId: string, payload: any, linesData: any[]) {
    const mov = await pb.get('inventory_movements', movId);
    if (mov.status !== 'draft') {
      throw new Error('Solo se pueden actualizar movimientos en estado borrador (draft).');
    }

    const updatedMov = await pb.update('inventory_movements', movId, payload);

    const oldLines = await this.getInventoryMovementLines(movId);
    for (const line of oldLines) {
      await pb.delete('inventory_movement_lines', line.id);
    }

    for (const line of linesData) {
      await pb.create('inventory_movement_lines', {
        movement_id: movId,
        ...line,
      });
    }

    await this.logAudit('UPDATE', 'InventoryMovement', movId, `Actualización borrador: ${mov.number}`);
    return updatedMov;
  },

  /** Conceptos de Inventario */
  async getInventoryConcepts(opts: { activeOnly?: boolean; type?: string } = {}) {
    const filterParts: string[] = [];
    if (opts.activeOnly) filterParts.push('active=true');
    if (opts.type) filterParts.push(`(type="${pb.escapeFilterValue(opts.type)}" || type="AMBOS")`);
    const filter = filterParts.join(' && ');
    return pb.listAll('inventory_concepts', {
      filter,
      sort: 'code',
      expand: 'account_id',
    });
  },

  async createInventoryConcept(payload: any) {
    const record = await pb.create('inventory_concepts', payload);
    await this.logAudit('CREATE', 'InventoryConcept', record.id, `${record.code} — ${record.name}`);
    return record;
  },

  async updateInventoryConcept(id: string, payload: any) {
    const record = await pb.update('inventory_concepts', id, payload);
    await this.logAudit('UPDATE', 'InventoryConcept', record.id, `${record.code} — ${record.name}`);
    return record;
  },

  async deleteInventoryConcept(id: string) {
    await pb.delete('inventory_concepts', id);
    await this.logAudit('DELETE', 'InventoryConcept', id, `Eliminado concepto ${id}`);
  },

  /** Genera un asiento contable automático agrupado por cuenta para un movimiento de inventario */
  async createInventoryMovementTransaction(movId: string, counterpartAccountId: string | null = null, thirdPartyId: string | null = null, txTypeId: string | null = null) {
    const mov = await pb.get('inventory_movements', movId, { expand: 'warehouse_id,dest_warehouse_id,concept_id' });
    const lines = await this.getInventoryMovementLines(movId);
    if (!lines.length) throw new Error('El movimiento no tiene líneas para contabilizar.');

    let effectiveCounterpartAccId = counterpartAccountId;
    let conceptName = '';

    if (mov.concept_id) {
      try {
        const concept = mov.expand?.concept_id || await pb.get('inventory_concepts', mov.concept_id);
        if (concept && concept.account_id) {
          effectiveCounterpartAccId = concept.account_id;
          conceptName = concept.name || '';
        }
      } catch (_) {}
    }

    if (!effectiveCounterpartAccId) throw new Error('Se requiere una cuenta contable de contrapartida asociada al concepto o seleccionada.');

    const products = await this.getProducts({ activeOnly: false });
    const accounts = await this.getAccounts(true);
    const postableAccountIds = new Set(accounts.filter(a => a.active !== false).map(a => a.id));

    // Buscar cuenta de inventario fallback (ej. 143505 o la primera de activo grupo 14)
    const fallbackAccount = accounts.find(a => a.code.startsWith('1435') || a.code.startsWith('14'));
    const fallbackInventoryAccId = fallbackAccount?.id || null;

    const isIn = mov.mov_type === 'ENTRADA' || mov.mov_type === 'AJUSTE_POSITIVO';
    const isOut = mov.mov_type === 'SALIDA' || mov.mov_type === 'AJUSTE_NEGATIVO';

    // Agrupar montos totales por cuenta contable de inventario del producto
    const accountTotals = new Map<string, number>();
    let grandTotal = 0;

    for (const line of lines) {
      const prod = products.find(p => p.id === line.product_id);
      const accId = (prod?.inventory_account_id && postableAccountIds.has(prod.inventory_account_id))
        ? prod.inventory_account_id
        : fallbackInventoryAccId;

      if (!accId) {
        throw new Error(`El producto "${prod?.name || line.product_id}" no posee una cuenta de inventario asociada y no existe cuenta 1435 en el plan de cuentas.`);
      }

      const cost = Number(line.unit_cost ?? prod?.cost_price ?? 0);
      const subtotal = Math.round(Number(line.qty || 0) * cost * 100) / 100;

      if (subtotal > 0) {
        accountTotals.set(accId, Math.round(((accountTotals.get(accId) || 0) + subtotal) * 100) / 100);
        grandTotal = Math.round((grandTotal + subtotal) * 100) / 100;
      }
    }

    if (grandTotal <= 0) {
      throw new Error('El valor total del movimiento es $0.00. No se puede generar un comprobante contable sin valor.');
    }

    const txTypes = await this.getTxTypes();
    let txType = txTypeId ? txTypes.find(t => t.id === txTypeId) : null;
    if (!txType) {
      if (isIn) {
        txType = txTypes.find(t =>
          (t.prefix || '').toUpperCase() === 'EI' ||
          (t.prefix || '').toUpperCase() === 'ENT' ||
          (t.code || '').toUpperCase() === 'EI' ||
          (t.name || '').toLowerCase().includes('entrada')
        );
      } else if (isOut) {
        txType = txTypes.find(t =>
          (t.prefix || '').toUpperCase() === 'SI' ||
          (t.prefix || '').toUpperCase() === 'SAL' ||
          (t.code || '').toUpperCase() === 'SI' ||
          (t.name || '').toLowerCase().includes('salida')
        );
      }
      if (!txType) {
        txType = txTypes.find(t => t.code === 'AI' || t.code === 'AJ' || t.code === 'INV' || t.code === 'CI') || txTypes[0];
      }
    }
    if (!txType) throw new Error('No se encontró un tipo de comprobante de transacción activo.');

    const txLines: any[] = [];
    const movNumber = mov.number || mov.id;
    const effectiveThird = thirdPartyId || mov.third_party_id || null;
    const descPrefix = conceptName ? `[${conceptName}] ` : '';

    if (isIn) {
      // ENTRADA / AJUSTE POSITIVO:
      // Débito (+) a Cuentas de Inventario (agrupadas por cuenta)
      for (const [accId, amt] of accountTotals.entries()) {
        txLines.push({
          account_id: accId,
          debit: amt,
          credit: 0,
          third_party_id: effectiveThird,
          description: `${descPrefix}Inventario ${movNumber} - Entrada de mercancía`,
          line_order: txLines.length + 1,
        });
      }
      // Crédito (-) a Cuenta de Contrapartida
      txLines.push({
        account_id: effectiveCounterpartAccId,
        debit: 0,
        credit: grandTotal,
        third_party_id: effectiveThird,
        description: `${descPrefix}Contrapartida movimiento ${movNumber}`,
        line_order: txLines.length + 1,
      });
    } else if (isOut) {
      // SALIDA / AJUSTE NEGATIVO:
      // Débito (+) a Cuenta de Contrapartida
      txLines.push({
        account_id: effectiveCounterpartAccId,
        debit: grandTotal,
        credit: 0,
        third_party_id: effectiveThird,
        description: `${descPrefix}Contrapartida movimiento ${movNumber}`,
        line_order: 1,
      });
      // Crédito (-) a Cuentas de Inventario (agrupadas por cuenta)
      for (const [accId, amt] of accountTotals.entries()) {
        txLines.push({
          account_id: accId,
          debit: 0,
          credit: amt,
          third_party_id: effectiveThird,
          description: `${descPrefix}Inventario ${movNumber} - Salida de mercancía`,
          line_order: txLines.length + 1,
        });
      }
    } else {
      throw new Error('Los traslados entre bodegas no admiten cuenta de contrapartida.');
    }

    const txNumber = await this.nextConsecutive(txType.id);
    const tx = await this.createTransaction({
      tx_type_id: txType.id,
      number: txNumber,
      date: mov.date,
      description: `Asiento automático Movimiento ${movNumber} (${conceptName || mov.notes || mov.mov_type})`,
      third_party_id: effectiveThird,
      status: 'active',
      branch_id: mov.branch_id || null,
    }, txLines);

    await pb.update('inventory_movements', movId, { tx_id: tx.id });
    await this.logAudit('POST_TX', 'InventoryMovement', movId, `Contabilización automática -> TX ${tx.number}`);
    return tx;
  },

  // â”€â”€ Compras â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /** Lista paginada de facturas de compra */
  async getPurchaseInvoices(opts = {}) {
    const { page = 1, perPage = 50, filter = '', sort = '-date' } = opts;
    return pb.list('purchase_invoices', {
      page, perPage, filter, sort,
      expand: 'supplier_id,warehouse_id,tx_type_id',
    });
  },

  /** LÃ­neas de una factura de compra con expand de producto y cuenta */
  async getPurchaseInvoiceLines(invoiceId) {
    const safe = pb.escapeFilterValue(invoiceId);
    return pb.listAll('purchase_invoice_lines', {
      filter: `invoice_id="${safe}"`,
      sort: 'line_order',
      expand: 'product_id,account_id',
    });
  },

  /** Crea cabecera + lÃ­neas de factura de compra en estado borrador */
  async createPurchaseInvoice(header, lines) {
    const txTypeId = String(header?.tx_type_id || '').trim();
    const txNumber = String(header?.tx_number || '').trim();
    if (!txTypeId) throw new Error('Debes seleccionar el tipo de comprobante contable en la compra.');
    if (!txNumber) throw new Error('Debes definir la numeraciÃ³n del comprobante contable en la compra.');

    // Calcular totales desde las líneas
    let subtotal = 0, ivaTot = 0, retTot = 0, ivaCostTot = 0;
    const headerIvaTreatment = String(header?.iva_treatment || 'DESCONTABLE').toUpperCase();

    for (const l of lines) {
      subtotal += Number(l.subtotal || 0);
      ivaTot += Number(l.iva_amount || 0);
      retTot += Number(l.ret_amount || 0);
      const lineIsCost = (headerIvaTreatment === 'MAYOR_COSTO') || (headerIvaTreatment === 'POR_LINEA' && !!l.iva_as_cost);
      if (lineIsCost) {
        ivaCostTot += Number(l.iva_amount || 0);
      }
    }
    const payableTotal = (subtotal + ivaTot) - retTot;
    const inv = await pb.create('purchase_invoices', {
      ...header,
      subtotal,
      iva_total: ivaTot,
      iva_treatment: headerIvaTreatment,
      iva_cost_total: ivaCostTot,
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
      const lineIsCost = (headerIvaTreatment === 'MAYOR_COSTO') || (headerIvaTreatment === 'POR_LINEA' && !!lines[i].iva_as_cost);
      await pb.create('purchase_invoice_lines', {
        invoice_id: inv.id,
        line_order: i + 1,
        ...lines[i],
        iva_as_cost: lineIsCost,
      });
    }
    await this.logAudit('CREATE', 'PurchaseInvoice', inv.id, `Factura compra ${inv.number}`);
    return invStored;
  },

  /**
   * Contabiliza una factura de compra (draft â†’ posted):
   * 1. Genera asiento FC en transactions (status: draft, listo para aprobar)
   * 2. Para lÃ­neas de BIEN: crea movimiento ENTRADA y lo aplica al stock
   * 3. Actualiza la factura con tx_id, inv_movement_id, status=posted
   */
  async postPurchaseInvoice(invoiceId) {
    let inv = null;
    try {
      inv = await pb.get('purchase_invoices', invoiceId, { expand: 'supplier_id,warehouse_id,tx_type_id' });
    } catch (_) {
      try {
        const list = await pb.listAll('purchase_invoices', { filter: `tx_id="${pb.escapeFilterValue(invoiceId)}"`, expand: 'supplier_id,warehouse_id,tx_type_id' });
        if (list.length) inv = list[0];
      } catch (_) {}
    }
    if (!inv) throw new Error('No se encontró la factura de compra o documento soporte especificado.');
    invoiceId = inv.id;

    if (inv.status === 'posted') throw new Error('La factura ya fue contabilizada.');
    if (inv.status === 'voided') throw new Error('La factura está anulada.');

    const lines = await this.getPurchaseInvoiceLines(invoiceId);
    if (!lines.length) throw new Error('La factura no tiene lÃ­neas.');

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
      if (!key) throw new Error('Cuenta contable invÃ¡lida en la compra.');
      if (!accountByIdCache[key]) accountByIdCache[key] = await pb.get('accounts', key);
      return accountByIdCache[key];
    };

    // â”€â”€ Buscar cuentas clave por cÃ³digo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const findAccByCode = async (code) => {
      if (!String(code || '').trim()) throw new Error('Hay una cuenta sin cÃ³digo en la configuraciÃ³n de compras.');
      const key = String(code).trim();
      if (accountByCodeCache[key]) return accountByCodeCache[key];
      const safeCode = pb.escapeFilterValue(key);
      const res = await pb.list('accounts', { filter: `code="${safeCode}"`, perPage: 1 });
      if (!res.items.length) throw new Error(`Cuenta ${key} no encontrada en el plan de cuentas.`);
      accountByCodeCache[key] = res.items[0];
      accountByIdCache[res.items[0].id] = res.items[0];
      return res.items[0];
    };

    const buildTxLine = async ({ accountId, thirdPartyId = null, debit = 0, credit = 0, description = '', crossDocRef = '', isIvaCost = false }) => {
      const acc = await getAccById(accountId);
      const line = {
        account_id: acc.id,
        third_party_id: thirdPartyId,
        debit: Math.round(debit * 100) / 100,
        credit: Math.round(credit * 100) / 100,
        description,
        is_iva_cost: !!isIvaCost,
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

    // ── Construir líneas del asiento contable ──────────────────────────────
    const txLines = [];
    const bienLines = [];
    const ivaByRate = {};
    const retByAccount = {};
    const headerIvaTreatment = String(inv.iva_treatment || 'DESCONTABLE').toUpperCase();

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

      const isIvaAsCost = (headerIvaTreatment === 'MAYOR_COSTO') || (headerIvaTreatment === 'POR_LINEA' && !!line.iva_as_cost);
      const lineSubtotal = Number(line.subtotal || 0);
      const ivaAmt = Number(line.iva_amount || 0);
      const effectiveDebit = isIvaAsCost ? (lineSubtotal + ivaAmt) : lineSubtotal;

      txLines.push(await buildTxLine({
        accountId,
        thirdPartyId: inv.supplier_id,
        debit: effectiveDebit,
        credit: 0,
        description: line.description || inv.expand?.supplier_id?.name || '',
        crossDocRef: inv.supplier_ref || '',
        isIvaCost: isIvaAsCost && ivaAmt > 0,
      }));

      if (prod?.type === 'BIEN') {
        const unitCostForStock = (isIvaAsCost && Number(line.qty || 0) > 0)
          ? ((lineSubtotal + ivaAmt) / Number(line.qty))
          : Number(line.unit_price || 0);
        bienLines.push({ product_id: line.product_id, qty: line.qty, unit_cost: unitCostForStock, notes: line.description });
      }

      if (!isIvaAsCost && ivaAmt > 0) {
        const rateKey = String(Number(line.iva_rate || 0));
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
          throw new Error(`La lÃ­nea "${line.description || '?'}" tiene retenciÃ³n sin cuenta contable configurada.`);
        }
        retByAccount[retAccountCode] = (retByAccount[retAccountCode] || 0) + retAmt;
      }
    }

    // â”€â”€ Retenciones de encabezado (modo global) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Cuando las retenciones se capturan a nivel de encabezado (no por lÃ­nea),
    // el invoice guarda ret_rule_renta_id / ret_rule_ica_id / ret_rule_iva_id.
    // Computamos esos montos aquÃ­ para que queden en retByAccount.
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
        // ReteIVA siempre usa IVA como base; los demÃ¡s respetan base_type de la regla
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
        if (!code) throw new Error(`La regla de retenciÃ³n "${rule.concept}" no tiene cuenta contable configurada.`);
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
        thirdPartyId: inv.supplier_id,
        debit: amount,
        credit: 0,
        description: `IVA ${rateKey}% compra ${inv.number}`,
        crossDocRef: inv.supplier_ref || '',
      }));
    }

    // Retenciones por cuenta (crÃ©dito)
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
    // Crédito a Proveedores (Balanceo dinámico exacto de débitos y créditos)
    const sumDebits = txLines.reduce((acc, ln) => acc + (ln.debit || 0), 0);
    const sumCreditsExclSupplier = txLines.reduce((acc, ln) => acc + (ln.credit || 0), 0);
    const payableCredit = Math.max(0, Math.round((sumDebits - sumCreditsExclSupplier) * 100) / 100);

    txLines.push(await buildTxLine({
      accountId: accProveedor.id,
      thirdPartyId: inv.supplier_id,
      debit: 0,
      credit: payableCredit,
      description: `${inv.supplier_ref ? `Ref: ${inv.supplier_ref} - ` : ''}${inv.expand?.supplier_id?.name || ''}`,
      crossDocRef: inv.supplier_ref || '',
    }));

    if (isCreditNote) {
      for (const ln of txLines) {
        const temp = ln.debit;
        ln.debit = ln.credit;
        ln.credit = temp;
      }
    }

    // â”€â”€ Crear transacciÃ³n contable â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let effectiveTxTypeId = String(inv.tx_type_id || '').trim();
    let effectiveTxNumber = String(inv.tx_number || '').trim();

    // Fallback para facturas histÃ³ricas con datos incompletos de comprobante.
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

    if (!effectiveTxTypeId) throw new Error('La factura no tiene tipo de comprobante contable. EdÃ­tala y selecciÃ³nalo.');
    if (!effectiveTxNumber) effectiveTxNumber = 'AUTO';

    if (!inv.tx_type_id || !inv.tx_number) {
      await pb.update('purchase_invoices', invoiceId, {
        tx_type_id: effectiveTxTypeId,
        tx_number: effectiveTxNumber,
      });
    }

    // La transacción queda Activa cuando "Contabilización inmediata" está habilitada en el
    // engranaje de Compras; de lo contrario queda en Borrador pendiente de aprobar en Contabilidad.
    const txStatus = purchaseCfg?.operational?.immediate_posting ? 'active' : 'draft';
    const tx = await this.createTransaction({
      tx_type_id: effectiveTxTypeId,
      number: effectiveTxNumber,
      date: inv.date,
      description: `${docLabel} ${inv.number} - ${inv.expand?.supplier_id?.name || ''}`,
      third_party_id: inv.supplier_id,
      payment_days: 0,
      cross_enabled: false,
      status: txStatus,
      branch_id: inv.branch_id || null,
    }, txLines);

    // â”€â”€ Movimiento de inventario para bienes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let invMovId = null;
    if (bienLines.length && inv.warehouse_id) {
      const today = inv.date || new Date().toISOString().slice(0, 10);
      const movType = isCreditNote ? 'SALIDA' : 'ENTRADA';
      const movNumber = await this.getNextInventoryMovementNumber(today, movType);
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

    // â”€â”€ Actualizar factura â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await pb.update('purchase_invoices', invoiceId, {
      status: 'posted',
      tx_id: tx.id,
      tx_number: tx.number,
      inv_movement_id: invMovId,
      ret_total: retTotal,
      payable_total: payableCredit,
    });
    await this.logAudit('POST', 'PurchaseInvoice', invoiceId, `Contabilizada ${inv.number} â†’ TX ${tx.number}`);
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
        blocks.push(`La compra ya tiene pagos o cruces posteriores sobre el documento ${details.crossRefs.join(', ')}. Transacciones detectadas: ${sample}${details.downstreamTx.length > 3 ? 'â€¦' : ''}.`);
      }
    }

    const allowNegative = await this.isNegativeStockAllowed();
    if (inv.inv_movement_id && !allowNegative) {
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
        blocks.push(`La entrada de inventario ya tuvo efectos posteriores y no se puede revertir sin descuadrar stock. Productos afectados: ${sample}${details.stockShortages.length > 3 ? 'â€¦' : ''}.`);
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
      if (closed) throw new Error(`El perÃ­odo ${(inv.date || '').slice(0, 7)} estÃ¡ cerrado. No se puede ${actionLabel} la compra.`);
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
        await this.logAudit('VOID', 'InventoryMovement', inv.inv_movement_id, `Anulación ${mov.mov_type || 'MOV'} - ${mov.number || ''}${reason ? ` | Motivo: ${reason}` : ''}`.trim());
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
    if (inv.status === 'voided') throw new Error('La factura estÃ¡ anulada y no se puede reabrir.');
    if (inv.status === 'draft') throw new Error('La factura ya estÃ¡ en borrador.');

    await pb.update('purchase_invoices', invoiceId, {
      status: 'draft',
      tx_id: null,
      inv_movement_id: null,
    });
    await this.logAudit('REOPEN', 'PurchaseInvoice', invoiceId, `Reabierta ${inv.number} para correcciÃ³n | Motivo: ${safeReason}`);
    return pb.get('purchase_invoices', invoiceId, { expand: 'supplier_id,warehouse_id,tx_type_id' });
  },

  /** Anula una factura de compra manteniendo trazabilidad y revirtiendo efectos si ya fue contabilizada. */
  async voidPurchaseInvoice(invoiceId, reason = '') {
    const safeReason = String(reason || '').trim();
    if (!safeReason) throw new Error('Debes indicar el motivo de anulaciÃ³n.');
    const inv = await pb.get('purchase_invoices', invoiceId);
    if (inv.status === 'voided') throw new Error('La factura ya estÃ¡ anulada.');
    if (inv.status === 'posted') {
      await this.rollbackPurchasePosting(invoiceId, 'anular', safeReason);
    }
    await pb.update('purchase_invoices', invoiceId, { status: 'voided' });
    await this.logAudit('VOID', 'PurchaseInvoice', invoiceId, `Anulada ${inv.number} | Motivo: ${safeReason}`);
  },

  // â”€â”€ Ventas y POS (Comercial) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /** Lista paginada de facturas de venta / recibos POS */
  async getInvoices(opts: any = {}) {
    let { page = 1, perPage = 50, filter = '', sort = '-date' } = opts;
    if (pb.currentUser?.role === 'vendedor') {
      const uid = pb.currentUser.id;
      const sellerFilter = `(seller_id="${uid}" || user_id="${uid}")`;
      filter = filter ? `(${filter}) && ${sellerFilter}` : sellerFilter;
    }
    return pb.list('invoices', {
      page, perPage, filter, sort,
      expand: 'customer_id,warehouse_id,tx_type_id,pos_shift_id,seller_id',
    });
  },

  /** LÃ­neas de una factura de venta con expand de producto y cuenta */
  async getInvoiceLines(invoiceId) {
    const safe = pb.escapeFilterValue(invoiceId);
    return pb.listAll('invoice_lines', {
      filter: `invoice_id="${safe}"`,
      sort: 'line_order',
      expand: 'product_id,account_id',
    });
  },

  /** Crea cabecera + líneas de factura de venta en estado borrador */
  /** Crea cabecera + líneas de factura de venta en estado borrador */
  async createInvoice(header: any, lines: any[]) {
    const dp = typeof (window as any).getDecimalPlaces === 'function' ? (window as any).getDecimalPlaces() : 2;
    const rDec = (v: number) => typeof (window as any).roundDecimals === 'function' ? (window as any).roundDecimals(v, dp) : Math.round((Number(v || 0) + Number.EPSILON) * Math.pow(10, dp)) / Math.pow(10, dp);

    let subtotal = 0, ivaTot = 0;
    const cleanedLines = [];
    for (const l of lines) {
      const lSub = rDec(l.subtotal || 0);
      const lIva = rDec(l.iva_amount || 0);
      const lQty = rDec(l.qty || 0);
      const lPrice = rDec(l.unit_price || 0);
      const lTot = rDec(l.total || (lSub + lIva));
      subtotal += lSub;
      ivaTot += lIva;
      cleanedLines.push({
        ...l,
        qty: lQty,
        unit_price: lPrice,
        subtotal: lSub,
        iva_amount: lIva,
        total: lTot,
      });
    }
    subtotal = rDec(subtotal);
    ivaTot = rDec(ivaTot);
    const discountAmt = rDec(header.discount_amount || 0);
    const freightAmt = rDec(header.freight_amount || 0);
    const retTot = rDec(header.ret_total || 0);
    const isPOS = !!header.pos_shift_id;
    const total = isPOS 
      ? rDec(subtotal - discountAmt + ivaTot + freightAmt)
      : rDec(subtotal + ivaTot + freightAmt);
    const payableTotal = rDec(total - retTot);

    const cleanedHeader: any = {};
    for (const [k, v] of Object.entries(header)) {
      if (v === '' || v === undefined) {
        cleanedHeader[k] = null;
      } else {
        cleanedHeader[k] = v;
      }
    }
    delete cleanedHeader.dian_resolution_id;

    let inv;
    try {
      inv = await pb.create('invoices', {
        ...cleanedHeader,
        subtotal,
        iva_total: ivaTot,
        total,
        ret_total: retTot,
        payable_total: payableTotal,
        discount_amount: discountAmt,
        freight_amount: freightAmt,
        status: 'draft',
      });
    } catch (err: any) {
      console.error("PocketBase error al crear factura:", err);
      const responseData = err?.response?.data || {};
      const dataKeys = Object.keys(responseData);
      if (dataKeys.length > 0) {
        const details = Object.entries(responseData)
          .map(([k, d]: [string, any]) => `${k}: ${d?.message || JSON.stringify(d)}`)
          .join(', ');
        throw new Error(`Validación de factura falló: ${details}`);
      }
      if (!pb.currentUser) {
        throw new Error('Sesión de usuario no válida o expirada. Por favor recarga la página e inicia sesión nuevamente.');
      }
      throw new Error(err?.message || `No se pudo crear la factura ${header.number}. Revisa el consecutivo o la conexión.`);
    }

    for (let i = 0; i < cleanedLines.length; i++) {
      const rawLine = cleanedLines[i];
      const linePayload: any = {};
      for (const [k, v] of Object.entries(rawLine)) {
        linePayload[k] = (v === '' || v === undefined) ? null : v;
      }
      try {
        await pb.create('invoice_lines', {
          invoice_id: inv.id,
          line_order: i + 1,
          ...linePayload,
        });
      } catch (err: any) {
        console.error("PocketBase error al crear línea de factura:", err, linePayload);
        const responseData = err?.response?.data || {};
        const details = Object.entries(responseData)
          .map(([k, d]: [string, any]) => `${k}: ${d?.message || JSON.stringify(d)}`)
          .join(', ');
        throw new Error(`Error al crear la línea ${i + 1}: ${details || err.message}`);
      }
    }
    await this.logAudit('CREATE', 'Invoice', inv.id, `Factura venta ${inv.number}`);
    return inv;
  },

  /**
   * Contabiliza una factura de venta (draft â†’ posted):
   * 1. Valida existencias en tiempo real para bienes.
   * 2. Genera asiento FV/POS en transactions (debitos CxC/Caja â†” ingresos + iva).
   * 3. Registra el costo de ventas (COGS) para bienes fÃ­sicos.
   * 4. Para lÃ­neas de BIEN: crea movimiento SALIDA y lo aplica al stock.
   * 5. Actualiza la factura con tx_id, inv_movement_id, status=posted.
   */
  async postInvoice(invoiceId) {
    const inv = await pb.get('invoices', invoiceId, { expand: 'customer_id,warehouse_id,tx_type_id' });
    if (inv.status === 'posted') throw new Error('La factura ya fue contabilizada.');
    if (inv.status === 'voided') throw new Error('La factura está anulada.');

    const dp = typeof (window as any).getDecimalPlaces === 'function' ? (window as any).getDecimalPlaces() : 2;
    const rDec = (v: any) => typeof (window as any).roundDecimals === 'function' ? (window as any).roundDecimals(v, dp) : Math.round((Number(v || 0) + Number.EPSILON) * Math.pow(10, dp)) / Math.pow(10, dp);

    const txTypeCode = String(inv.expand?.tx_type_id?.code || '').toUpperCase();
    const txTypeName = String(inv.expand?.tx_type_id?.name || '').toUpperCase();
    const isCreditNote = txTypeCode === 'NC' || txTypeName.includes('CRÉDITO') || txTypeName.includes('CREDITO');
    const docLabel = isCreditNote ? 'Nota Crédito' : (inv.pos_shift_id ? 'Venta POS' : 'Venta');

    const lines = await this.getInvoiceLines(invoiceId);
    if (!lines.length) throw new Error('La factura no tiene líneas.');

    // Cargar productos para expandir
    const products = await this.getProducts({ activeOnly: false });

    const allowNegative = await this.isNegativeStockAllowed();

    let salesConfig = { operational: { allow_negative_stock: false } };
    try {
      const rawCfg = await this.getSetting('sales_settings_v2');
      if (rawCfg) salesConfig = JSON.parse(rawCfg);
    } catch (_) { }

    const isPOS = !!inv.pos_shift_id;
    const immediatePosting = isPOS || !!salesConfig?.operational?.immediate_posting;
    const isImportReservationMode = inv.delivery_fulfillment_status === 'RESERVADO_IMPORTACION' || !!inv.is_import_reservation;

    if (isImportReservationMode) {
      await this.createImportReservationForInvoice(invoiceId, { createDelivery: true, allowExisting: true });
    }

    // ── Validar stock en tiempo real y preparar COGS ───────────────────
    const movLines = [];
    for (const line of lines) {
      const prod = products.find(p => p.id === line.product_id);
      if (prod && prod.type === 'BIEN') {
        if (isImportReservationMode) {
          continue;
        }
        if (prod.is_combo) {
          const comps = await pb.listAll('product_components', { filter: `parent_id="${pb.escapeFilterValue(prod.id)}"`, expand: 'component_id' });
          if (!comps.length) {
            throw new Error(`El combo "${prod.name}" no tiene componentes configurados.`);
          }
          for (const comp of comps) {
            const compProd = products.find(p => p.id === comp.component_id);
            const compName = compProd ? compProd.name : (comp.expand?.component_id?.name || 'Componente');
            const compCode = compProd ? compProd.code : (comp.expand?.component_id?.code || '');
            const compQty = rDec(line.qty * comp.qty);
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
              unit_cost: rDec(avgCost),
              notes: line.description || `Componente Combo: ${prod.name} (${docLabel} ${inv.number})`,
            });
          }
        } else {
          if (!inv.warehouse_id) {
            throw new Error(`Se requiere seleccionar una bodega origen para el producto inventariable ${prod.code || ''} ${prod.name || ''}.`);
          }
          const stockRows = await this.getInventoryStock({ warehouseId: inv.warehouse_id, productId: line.product_id }).catch(() => []);
          const qtyOnHand = Number(stockRows[0]?.qty_on_hand || 0);
          const lineQty = rDec(line.qty);
          if (!isCreditNote && !allowNegative && qtyOnHand + 0.0001 < lineQty) {
            throw new Error(`Existencias insuficientes para el producto "${prod.name}" en la bodega seleccionada. Solicitado: ${fmtN(lineQty)}, Disponible: ${fmtN(qtyOnHand)}.`);
          }
          const avgCost = Number(stockRows[0]?.avg_cost || prod.cost_price || 0);
          const isLineLoss = isCreditNote && (line.is_loss === true || line.is_loss === 'true');
          if (isLineLoss) {
            console.log(`[GRAVY] Producto "${prod.name}" marcado como pérdida/gasto en Nota Crédito. Se omite movimiento de inventario.`);
          } else {
            movLines.push({
              product_id: line.product_id,
              qty: lineQty,
              unit_cost: rDec(avgCost),
              notes: line.description || `${docLabel} ${inv.number}`,
            });
          }
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
        debit: rDec(debit),
        credit: rDec(credit),
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
        if (inv.bank_account_id) {
          try {
            const bankAcc = await pb.get('bank_accounts', inv.bank_account_id, { expand: 'account_id' });
            if (bankAcc && bankAcc.expand?.account_id?.id) {
              return bankAcc.expand.account_id.id;
            } else if (bankAcc && bankAcc.account_id) {
              return bankAcc.account_id;
            }
          } catch (err) {
            console.warn("Fallo al obtener cuenta bancaria desde inv.bank_account_id:", err);
          }
        }
        let bankAccId = "";
        try {
          const tesoSettings = await pb.list('treasury_settings', { perPage: 1 });
          if (tesoSettings.items.length) bankAccId = tesoSettings.items[0].default_bank_account_id;
        } catch (_) { }
        if (bankAccId) return bankAccId;
        const acc = await findAccByCode('111005');
        return acc.id;
      } else { // EFECTIVO o cualquier otro
        try {
          const rawSalesCfg = await this.getSetting('sales_settings_v2');
          if (rawSalesCfg) {
            const sc = JSON.parse(rawSalesCfg);
            const code = sc?.accounting?.accounts?.cash_code;
            if (code) {
              const acc = await findAccByCode(code);
              if (acc) return acc.id;
            }
          }
        } catch (_) { }
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

    // ── Obtener parámetros de ventas para verificar regla de Tercero Especial ──
    let specialThirdPartyId = '';
    let specialAccountCode = '';
    try {
      const rawSalesCfg = await this.getSetting('sales_settings_v2');
      if (rawSalesCfg) {
        const sc = JSON.parse(rawSalesCfg);
        specialThirdPartyId = String(sc?.accounting?.accounts?.special_third_party_id || '').trim();
        specialAccountCode = String(sc?.accounting?.accounts?.special_account_code || '').trim();
      }
    } catch (_) { }

    const isSpecialThirdParty = Boolean(
      specialThirdPartyId && 
      specialAccountCode && 
      inv.customer_id === specialThirdPartyId
    );

    // ── Registrar débito por recaudo/CxC / Cuenta Preestablecida ──────────────
    if (isSpecialThirdParty) {
      const specialAcc = await findAccByCode(specialAccountCode);
      txLines.push(await buildTxLine({
        accountId: specialAcc.id,
        thirdPartyId: inv.customer_id,
        debit: rDec(inv.payable_total),
        credit: 0,
        description: `${docLabel} ${inv.number} (Contabilización Especial Tercero)`,
        crossDocRef: inv.number,
      }));
    } else if (inv.payment_method === 'MIXTO') {
      let split = {};
      try {
        split = typeof inv.payment_split === 'string' ? JSON.parse(inv.payment_split) : (inv.payment_split || {});
      } catch (_) { }

      for (const method of Object.keys(split)) {
        const amount = rDec(split[method] || 0);
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
        debit: rDec(inv.payable_total),
        credit: 0,
        description: `${docLabel} ${inv.number} ${inv.payment_method}`,
        crossDocRef: inv.number,
      }));
    }

    // ── Crédito de Flete (si existe freight_amount) ────────────────────────
    const freightAmt = rDec(inv.freight_amount || 0);
    if (freightAmt > 0) {
      const freightAccId = await resolveFreightAccount();
      txLines.push(await buildTxLine({
        accountId: freightAccId,
        thirdPartyId: inv.customer_id,
        debit: 0,
        credit: freightAmt,
        description: `Flete cobrado venta ${inv.number}`,
        crossDocRef: inv.number,
      }));
    }

    // ── Construir créditos de ingresos e IVA ──────────────────────────────
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

    // ── Registro de Ingresos e IVA Consolidados ───────────────────────────
    const incomeGroups: { [accId: string]: number } = {};
    const ivaGroups: { [key: string]: { ivaAccId: string, rate: number, amount: number } } = {};
    let totalLineDiscount = 0;

    // Resolve refund account if it's a Credit Note (and NOT concept '2' - Anulación de factura electrónica)
    let refundAccount = null;
    const isAnnulment = String(inv.notes || '').includes('[Ajuste DIAN: 2]');
    if (isCreditNote && !isAnnulment) {
      try {
        const rawSalesCfg = await this.getSetting('sales_settings_v2');
        if (rawSalesCfg) {
          const sc = JSON.parse(rawSalesCfg);
          const refCode = sc?.accounting?.accounts?.refund_code;
          if (refCode) {
            refundAccount = await findAccByCode(refCode);
          }
        }
      } catch (_) { }
      if (!refundAccount) {
        try {
          refundAccount = await findAccByCode('417505'); // fallback nacional
        } catch (_) { }
      }
    }

    for (const line of lines) {
      const prod = products.find(p => p.id === line.product_id);
      let incomeAccId = line.account_id;
      if (isCreditNote && refundAccount) {
        incomeAccId = refundAccount.id;
      } else {
        if (!incomeAccId && prod) {
          incomeAccId = prod.income_account_id || defaultIncome.id;
        }
        if (!incomeAccId) {
          incomeAccId = defaultIncome.id;
        }
      }

      const subtotal = rDec(line.subtotal || 0);
      const qty = rDec(line.qty || 0);
      const unitPrice = rDec(line.unit_price || 0);
      const lineDiscount = rDec((qty * unitPrice) - subtotal);
      if (lineDiscount > 0) {
        totalLineDiscount += lineDiscount;
      }
      const grossLineSub = rDec(subtotal + Math.max(0, lineDiscount));
      if (grossLineSub > 0) {
        incomeGroups[incomeAccId] = rDec((incomeGroups[incomeAccId] || 0) + grossLineSub);
      }

      const ivaAmount = rDec(line.iva_amount || 0);
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
        ivaGroups[groupKey].amount = rDec(ivaGroups[groupKey].amount + ivaAmount);
      }
    }

    // Unificación de Descuento (Header o Acumulado de Líneas)
    const headerDiscount = rDec(inv.discount_amount || 0);
    const effectiveDiscount = headerDiscount > 0 ? headerDiscount : rDec(totalLineDiscount);

    // Débito de Descuento (UNICA LÍNEA si existe descuento para evitar duplicidad)
    if (effectiveDiscount > 0) {
      const discountAccId = await resolveDiscountAccount();
      txLines.push(await buildTxLine({
        accountId: discountAccId,
        thirdPartyId: inv.customer_id,
        debit: effectiveDiscount,
        credit: 0,
        description: `Descuento concedido venta ${inv.number}`,
        crossDocRef: inv.number,
      }));
    }

    // 1. Agregar créditos consolidados de ingresos
    for (const incomeAccId of Object.keys(incomeGroups)) {
      const amount = rDec(incomeGroups[incomeAccId]);
      if (amount > 0) {
        txLines.push(await buildTxLine({
          accountId: incomeAccId,
          thirdPartyId: inv.customer_id,
          debit: 0,
          credit: amount,
          description: `Ingresos por ventas consolidados - ${inv.number}`,
          crossDocRef: inv.number,
        }));
      }
    }

    // 2. Agregar créditos consolidados de IVA
    for (const key of Object.keys(ivaGroups)) {
      const { ivaAccId, rate, amount } = ivaGroups[key];
      const ivaAmt = rDec(amount);
      if (ivaAmt > 0) {
        txLines.push(await buildTxLine({
          accountId: ivaAccId,
          thirdPartyId: inv.customer_id,
          debit: 0,
          credit: ivaAmt,
          description: `IVA Generado ${rate}% venta ${inv.number}`,
          crossDocRef: inv.number,
        }));
      }
    }

    // ── Desglose de retenciones aplicadas (Débito - Activo) ─────────────
    if (rDec(inv.ret_total || 0) > 0) {
      const mapToSalesRetAccount = (code) => {
        const c = String(code || '').trim();
        return c || '135515';
      };

      let salesCfg = {};
      try {
        const rawCfg = await this.getSetting('sales_settings_v2');
        salesCfg = rawCfg ? JSON.parse(rawCfg) : {};
      } catch (_) { }
      const cfgRetRules = Array.isArray(salesCfg?.accounting?.withholding_rules) ? salesCfg.accounting.withholding_rules : [];

      const aggSub = rDec(inv.subtotal || 0);
      const aggIva = rDec(inv.iva_total || 0);
      const aggTotal = rDec(aggSub + aggIva);

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
        const amt = rDec(base * Number(rule.rate || 0) / 100);
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

    // ── Registro de Costo de Ventas (COGS) / Pérdida por Devolución ────
    const defaultCogsAcc = await findAccByCode('613505');
    const defaultInvAcc = await findAccByCode('143005');

    const resolveLossAccount = async () => {
      try {
        const rawSalesCfg = await this.getSetting('sales_settings_v2');
        if (rawSalesCfg) {
          const sc = JSON.parse(rawSalesCfg);
          const code = sc?.accounting?.accounts?.inventory_loss_code;
          if (code) {
            const acc = await findAccByCode(code);
            if (acc) return acc.id;
          }
        }
      } catch (_) {}
      const fallbacks = ['531520', '519595', '5315', '529595', '613595'];
      for (const code of fallbacks) {
        try {
          const acc = await findAccByCode(code);
          if (acc) return acc.id;
        } catch (_) {}
      }
      return defaultCogsAcc.id;
    };

    const lossAccId = isCreditNote ? await resolveLossAccount() : defaultCogsAcc.id;
    const cogsGroups: { [key: string]: { cogsAccId: string, invAccId: string, isLoss: boolean, amount: number } } = {};

    for (const line of lines) {
      const prod = products.find(p => p.id === line.product_id);
      if (!prod || prod.type !== 'BIEN' || isImportReservationMode) continue;

      const stockRows = inv.warehouse_id ? await this.getInventoryStock({ warehouseId: inv.warehouse_id, productId: line.product_id }).catch(() => []) : [];
      const avgCost = Number(stockRows[0]?.avg_cost || prod.cost_price || 0);
      const lineQty = rDec(line.qty);
      const cogsAmt = rDec(lineQty * avgCost);

      if (cogsAmt > 0) {
        const cogsAccId = prod?.cost_account_id || defaultCogsAcc.id;
        const isLoss = isCreditNote && (line.is_loss === true || line.is_loss === 'true');
        let invAccId = isLoss ? lossAccId : (prod?.inventory_account_id || defaultInvAcc.id);

        if (prod?.is_consigned && !isLoss) {
          try {
            const consignAcc = await findAccByCode('238095');
            if (consignAcc) invAccId = consignAcc.id;
          } catch (_) {}
        }

        if (cogsAccId === invAccId) {
          console.log(`[GRAVY] Omitida línea de COGS ya que la cuenta de costo e inventario/gasto son idénticas: ${cogsAccId}`);
          continue;
        }

        const groupKey = `${cogsAccId}_${invAccId}`;
        if (!cogsGroups[groupKey]) {
          cogsGroups[groupKey] = {
            cogsAccId,
            invAccId,
            isLoss,
            amount: 0
          };
        }
        cogsGroups[groupKey].amount = rDec(cogsGroups[groupKey].amount + cogsAmt);
      }
    }

    for (const groupKey of Object.keys(cogsGroups)) {
      const { cogsAccId, invAccId, isLoss, amount } = cogsGroups[groupKey];
      const cogsVal = rDec(amount);
      if (cogsVal > 0) {
        txLines.push(await buildTxLine({
          accountId: cogsAccId,
          thirdPartyId: inv.customer_id,
          debit: cogsVal,
          credit: 0,
          description: `Costo de Ventas consolidado - ${inv.number}`,
          crossDocRef: inv.number,
        }));

        txLines.push(await buildTxLine({
          accountId: invAccId,
          thirdPartyId: inv.customer_id,
          debit: 0,
          credit: cogsVal,
          description: isLoss ? `Gasto por pérdida/deterioro inventario - ${inv.number}` : `Baja Inventario COGS consolidada - ${inv.number}`,
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

    // ── Auditoría y Cuadre Exacto a Nivel Decimal (Débitos == Créditos) ─────
    let sumDebits = 0;
    let sumCredits = 0;
    for (const ln of txLines) {
      ln.debit = rDec(ln.debit);
      ln.credit = rDec(ln.credit);
      sumDebits += ln.debit;
      sumCredits += ln.credit;
    }
    sumDebits = rDec(sumDebits);
    sumCredits = rDec(sumCredits);
    const diff = rDec(sumDebits - sumCredits);

    if (Math.abs(diff) > 0 && Math.abs(diff) <= Math.pow(10, -dp + 2)) {
      if (diff > 0) {
        // Débitos > Créditos: ajustar sobre la primera línea de crédito relevante (ingresos)
        let primaryCreditLine = txLines.find(l => l.credit > 0);
        if (primaryCreditLine) {
          primaryCreditLine.credit = rDec(primaryCreditLine.credit + diff);
        }
      } else {
        // Créditos > Débitos: ajustar sobre la primera línea de débito relevante (CxC / cobro)
        let primaryDebitLine = txLines.find(l => l.debit > 0);
        if (primaryDebitLine) {
          primaryDebitLine.debit = rDec(primaryDebitLine.debit + Math.abs(diff));
        }
      }
    }

    // ── Crear Transacción Contable ──────────────────────────────────
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
      // Buscar si ya existe una transacción vinculada o en borrador con este número
      let existingTx = null;
      if (inv.tx_id) {
        try {
          existingTx = await pb.get('transactions', inv.tx_id);
        } catch (_) {}
      }
      if (!existingTx && txNumber && txNumber !== 'AUTO') {
        try {
          const safeNum = pb.escapeFilterValue(txNumber);
          const existingList = await pb.list('transactions', { filter: `number="${safeNum}"`, perPage: 1 });
          if (existingList.items.length) {
            existingTx = existingList.items[0];
          }
        } catch (_) {}
      }

      const txPayload: any = {
        tx_type_id: effectiveTxTypeId,
        number: txNumber,
        date: inv.date,
        description: `${docLabel} ${inv.number} - ${inv.expand?.customer_id?.name || ''}`,
        third_party_id: inv.customer_id,
        payment_days: 0,
        cross_enabled: true,
        cross_type: 'invoices',
        cross_number: inv.number,
        cross_amount: inv.payable_total,
        cross_purpose: 'Causar',
        status: immediatePosting ? 'active' : 'draft',
        branch_id: inv.branch_id || null,
      };

      if (existingTx) {
        txPayload.id = existingTx.id;
        txPayload.status = immediatePosting ? 'active' : 'draft';
        await this.updateTransaction(existingTx.id, txPayload, txLines);
        txCreated = await pb.get('transactions', existingTx.id);
      } else {
        txCreated = await this.createTransaction(txPayload, txLines);
      }

      // ── Movimiento de Inventario ──────────────────────────────
      let invMovId = inv.inv_movement_id || null;
      if (invMovId) {
        const existingMov = await pb.get('inventory_movements', invMovId).catch(() => null);
        if (existingMov && existingMov.status === 'applied') {
          console.log(`[GRAVY] Reutilizando movimiento de inventario previamente aplicado (${invMovId}) para la factura ${inv.number}`);
          movCreated = null;
        } else {
          invMovId = null;
        }
      }

      if (!invMovId && movLines.length && inv.warehouse_id) {
        const today = inv.date || new Date().toISOString().slice(0, 10);
        const movType = isCreditNote ? 'ENTRADA' : 'SALIDA';
        const movNumber = await this.getNextInventoryMovementNumber(today, movType);
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

      // ── Actualizar Factura Comercial ─────────────────────────────────
      const updatedInvRec = await pb.update('invoices', invoiceId, {
        status: 'posted',
        tx_id: txCreated.id,
        inv_movement_id: invMovId,
        tx_type_id: effectiveTxTypeId,
        tx_number: txNumber,
      });

      if (updatedInvRec && updatedInvRec.number && updatedInvRec.number !== txNumber && !updatedInvRec.number.startsWith('BORR-')) {
        try {
          await pb.update('transactions', txCreated.id, { number: updatedInvRec.number });
        } catch (_) {}
      }
      if (inv.sales_order_id) {
        const soPatch: any = {
          status: 'invoiced',
          invoice_id: invoiceId
        };
        if (pendingDeliveryMode) {
          soPatch.has_pending_delivery = true;
          soPatch.fulfillment_status = 'PENDIENTE_ENTREGA';
        }
        await pb.update('sales_orders', inv.sales_order_id, soPatch);
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
          await pb.update('transactions', txCreated.id, { status: 'voided' }).catch(() => {});
        } catch (_) {}
      }
      if (pendingDeliveryMode) {
        await this.releaseReservationsByInvoice(invoiceId, 'Rollback por error de contabilizacion').catch(() => {});
      }
      throw postErr;
    }
  },

  /** Pre-valida que la factura tenga todos los datos requeridos para ser emitida ante la DIAN antes de alterar inventario o contabilidad */
  async validateInvoiceForDianEmit(invoiceId: string) {
    const inv = await pb.get('invoices', invoiceId, { expand: 'customer_id,tx_type_id' });
    if (!inv) throw new Error('La factura especificada no existe.');
    if (inv.status === 'voided') throw new Error('La factura está anulada y no se puede emitir.');

    const lines = await this.getInvoiceLines(invoiceId);
    if (!lines || !lines.length) {
      throw new Error(`La factura ${inv.number || ''} no tiene líneas registradas.`);
    }

    const customer = inv.expand?.customer_id || (inv.customer_id ? await pb.get('third_parties', inv.customer_id).catch(() => null) : null);
    if (!customer) {
      throw new Error(`Debe asociar un cliente (tercero) a la factura ${inv.number || ''} antes de emitir a la DIAN.`);
    }
    const docNumber = String(customer.doc_number || customer.nit || '').trim();
    if (!docNumber) {
      throw new Error(`El cliente "${customer.name || 'Consumidor'}" no tiene número de documento (NIT/CC) registrado.`);
    }

    // Verificar si hay productos físicos que requieran bodega
    const products = await this.getProducts({ activeOnly: false });
    const hasPhysical = lines.some(l => {
      const p = products.find(prod => prod.id === l.product_id);
      return p && p.type === 'BIEN';
    });
    if (hasPhysical && !inv.warehouse_id) {
      throw new Error(`Selecciona una bodega origen para el despacho de los productos de la factura ${inv.number || ''}.`);
    }

    // Pre-validar resolución DIAN
    const txNumber = String(inv.tx_number || inv.number || '').trim();
    const prefixCandidate = txNumber.includes('-') ? txNumber.split('-')[0].toUpperCase() : '';
    let filterStr = 'active=true && (document_type="FV" || document_type="POS")';
    if (prefixCandidate) {
      filterStr += ` && prefix="${pb.escapeFilterValue(prefixCandidate)}"`;
    }
    const resList = await pb.list('dian_resolutions', { filter: filterStr, perPage: 1 }).catch(() => ({ items: [] }));
    if (!resList.items.length) {
      const fallbackRes = await pb.list('dian_resolutions', { filter: 'active=true && (document_type="FV" || document_type="POS")', perPage: 1 }).catch(() => ({ items: [] }));
      if (!fallbackRes.items.length) {
        throw new Error('No hay una resolución DIAN activa configurada en el sistema para Factura de Venta (FV).');
      }
    }
    return { valid: true, inv, customer, lines };
  },

  /** Revierte los efectos contables e inventario de una factura */
  async rollbackInvoicePosting(invoiceId, actionLabel = 'anular', reason = '') {
    const inv = await pb.get('invoices', invoiceId);
    if (inv.status !== 'posted' && !inv.tx_id && !inv.inv_movement_id) {
      return { inv, txVoided: false, movementVoided: false };
    }

    if (typeof isPeriodClosed === 'function') {
      const closed = await isPeriodClosed(inv.date);
      if (closed) throw new Error(`El período ${(inv.date || '').slice(0, 7)} está cerrado. No se puede ${actionLabel} la venta.`);
    }

    if (inv.tx_id) {
      const tx = await pb.get('transactions', inv.tx_id).catch(() => null);
      if (tx && tx.status !== 'voided') {
        await pb.update('transactions', tx.id, { status: 'voided' }).catch(() => {});
        console.log(`[GRAVY] Anulada transacción vinculada a la factura: ${inv.number}`);
      }
    }

    if (inv.inv_movement_id) {
      const mov = await pb.get('inventory_movements', inv.inv_movement_id).catch(() => null);
      if (mov && mov.status === 'applied') {
        await this.voidInventoryMovement(inv.inv_movement_id, reason);
      } else if (mov && mov.status !== 'voided') {
        await pb.update('inventory_movements', inv.inv_movement_id, { status: 'voided' });
        await this.logAudit('VOID', 'InventoryMovement', inv.inv_movement_id, `Anulación ${mov.mov_type || 'MOV'} - ${mov.number || ''}${reason ? ` | Motivo: ${reason}` : ''}`.trim());
      }
    }

    if (inv.sales_order_id) {
      await pb.update('sales_orders', inv.sales_order_id, {
        status: 'pending',
        invoice_id: null,
        has_pending_delivery: false,
        fulfillment_status: 'SIN_GESTION',
      });
      await this.logAudit('UPDATE_STATUS', 'SalesOrder', inv.sales_order_id, `Pedido devuelto a pendiente por anulaciÃ³n/reapertura de factura ${inv.number}`);
    }

    await this.releaseReservationsByInvoice(invoiceId, `${actionLabel} venta ${inv.number}${reason ? ` | ${reason}` : ''}`).catch(() => {});

    return {
      inv,
      txVoided: !!inv.tx_id,
      movementVoided: !!inv.inv_movement_id,
    };
  },

  /** Anula una factura de venta */
  async voidInvoice(invoiceId, reason = '') {
    const safeReason = String(reason || '').trim();
    if (!safeReason) throw new Error('Debes indicar el motivo de anulaciÃ³n.');
    const inv = await pb.get('invoices', invoiceId);
    if (inv.status === 'voided') throw new Error('La factura ya estÃ¡ anulada.');
    if (inv.status === 'posted') {
      await this.rollbackInvoicePosting(invoiceId, 'anular', safeReason);
    } else {
      await this.releaseReservationsByInvoice(invoiceId, `anular venta ${inv.number} | ${safeReason}`).catch(() => {});
    }
    await pb.update('invoices', invoiceId, { status: 'voided' });
    await this.logAudit('VOID', 'Invoice', invoiceId, `Anulada factura ${inv.number} | Motivo: ${safeReason}`);
  },

  /** Cambia el método de pago de una factura contabilizada y actualiza el asiento contable */
  async changeInvoicePaymentMethod(invoiceId, newMethod, newSplit = null, reason = '', bankAccountId = null) {
    const safeReason = String(reason || '').trim();
    if (!safeReason) throw new Error('Debes indicar el motivo del cambio de forma de pago.');
    if (safeReason.length < 8) throw new Error('El motivo debe ser mÃ¡s descriptivo (mÃ­nimo 8 caracteres).');

    const inv = await pb.get('invoices', invoiceId, { expand: 'customer_id,tx_type_id' });
    if (inv.status !== 'posted') {
      throw new Error('Solo se puede cambiar la forma de pago en facturas contabilizadas.');
    }

    if (typeof isPeriodClosed === 'function') {
      const closed = await isPeriodClosed(inv.date);
      if (closed) throw new Error(`El perÃ­odo ${(inv.date || '').slice(0, 7)} estÃ¡ cerrado. No se puede modificar la forma de pago.`);
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
      if (!key) throw new Error('Se requiere un cÃ³digo de cuenta vÃ¡lido.');
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
        const actualBankAccountId = bankAccountId || inv.bank_account_id;
        if (actualBankAccountId) {
          try {
            const bankAcc = await pb.get('bank_accounts', actualBankAccountId, { expand: 'account_id' });
            if (bankAcc && bankAcc.expand?.account_id?.id) {
              return bankAcc.expand.account_id.id;
            } else if (bankAcc && bankAcc.account_id) {
              return bankAcc.account_id;
            }
          } catch (err) {
            console.warn("Fallo al obtener cuenta bancaria en changeInvoicePaymentMethod:", err);
          }
        }
        let bankAccId = "";
        try {
          const tesoSettings = await pb.list('treasury_settings', { perPage: 1 });
          if (tesoSettings.items.length) bankAccId = tesoSettings.items[0].default_bank_account_id;
        } catch (_) { }
        if (bankAccId) return bankAccId;
        const acc = await findAccByCode('111005');
        return acc.id;
      } else { // EFECTIVO o cualquier otro
        try {
          const rawSalesCfg = await this.getSetting('sales_settings_v2');
          if (rawSalesCfg) {
            const sc = JSON.parse(rawSalesCfg);
            const code = sc?.accounting?.accounts?.cash_code;
            if (code) {
              const acc = await findAccByCode(code);
              if (acc) return acc.id;
            }
          }
        } catch (_) { }
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
      payment_split: parsedSplit,
      bank_account_id: bankAccountId
    });

    // Si tiene transacciÃ³n contable asociada, actualizar las lÃ­neas de pago
    if (inv.tx_id) {
      const tx = await pb.get('transactions', inv.tx_id);
      const lines = await pb.listAll('tx_lines', { filter: `tx_id="${pb.escapeFilterValue(inv.tx_id)}"`, ignoreBranch: true });

      // Identificar lÃ­neas de pago existentes
      const numUpper = inv.number.toUpperCase();
      const paymentLines = lines.filter(l => {
        const d = (l.description || '').toUpperCase();
        return d.includes(numUpper) && (
          d.includes('EFECTIVO') ||
          d.includes('TRANSFERENCIA') ||
          d.includes('CREDITO') ||
          d.includes('CRÃ‰DITO') ||
          d.includes('MIXTO') ||
          d.includes('PAGO MIXTO')
        );
      });

      if (paymentLines.length > 0) {
        // Eliminar las lÃ­neas de pago viejas (tolerante a 404 por ediciÃ³n concurrente)
        for (const pl of paymentLines) {
          try {
            await pb.delete('tx_lines', pl.id);
          } catch (err: any) {
            if (err?.status !== 404 && err?.response?.code !== 404) throw err;
          }
        }

        // Determinar si es nota de crÃ©dito
        const txTypeCode = String(inv.expand?.tx_type_id?.code || '').toUpperCase();
        const txTypeName = String(inv.expand?.tx_type_id?.name || '').toUpperCase();
        const isCreditNote = txTypeCode === 'NC' || txTypeName.includes('CRÃ‰DITO') || txTypeName.includes('CREDITO');
        const docLabel = isCreditNote ? 'Nota CrÃ©dito' : (isPOS ? 'Venta POS' : 'Venta');

        // Determinar un line_order base
        let maxOrder = lines.reduce((max, l) => l.line_order > max ? l.line_order : max, 0);
        let nextLineOrder = maxOrder + 1;

        // Crear las nuevas lÃ­neas de pago
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

    // Registrar en auditorÃ­a
    await this.logAudit('CHANGE_PAYMENT_METHOD', 'Invoice', invoiceId, 
      `Forma de pago corregida: ${oldMethod} -> ${newMethod}. Motivo: ${safeReason}`
    );

    return { success: true };
  },

  // â”€â”€ Copropiedades (F8) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  /** Conceptos de facturaciÃ³n PH */
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

  /** LÃ­neas de una factura PH */
  async getPhInvoiceLines(invoiceId) {
    const safe = pb.escapeFilterValue(invoiceId);
    return pb.listAll('ph_invoice_lines', {
      filter: `invoice_id="${safe}"`,
      sort: 'line_order',
      expand: 'concept_id,concept_id.account_id',
    });
  },

  /**
   * Genera facturas en borrador para todas las unidades activas en un perÃ­odo YYYY-MM.
   * Omite unidades que ya tienen factura para ese perÃ­odo.
   */
  async generatePhInvoices(period, dueDate = '') {
    const safePeriod = pb.escapeFilterValue(period);
    const [properties, concepts, rawCfg] = await Promise.all([
      this.getPhProperties(true),
      this.getPhBillingConcepts(true),
      this.getSetting('ph_config_v1'),
    ]);
    if (!properties.length) throw new Error('No hay unidades activas registradas.');
    if (!concepts.length) throw new Error('No hay conceptos de facturaciÃ³n activos.');

    let phCfg = {};
    try { phCfg = rawCfg ? JSON.parse(rawCfg) : {}; } catch (_) { phCfg = {}; }
    const lateFeeRate = Number(phCfg?.late_fee_rate || 0);
    const lateFeeIncomeCode = String(phCfg?.late_fee_income_code || '').trim();
    const moraConcept = (concepts || []).find(c => String(c?.code || '').trim().toUpperCase() === 'MORA');
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

    // Calcular número de secuencia base CF consultando facturas existentes
    const existingFilter = `period="${safePeriod}"`;
    const existing = await pb.listAll('ph_invoices', { filter: existingFilter, perPage: 200 });
    const existingPropIds = new Set(existing.map(i => i.property_id));

    const toCreate = properties.filter(p => !existingPropIds.has(p.id));
    if (!toCreate.length) throw new Error(`Todas las unidades ya tienen factura para el período ${period}.`);

    const periodCode = period.replace('-', '');
    const prefix = `CF-${periodCode}-`;
    const allInvoices = await pb.listAll('ph_invoices', { perPage: 200 });
    let maxSeq = 0;
    const existingNumbers = new Set<string>();
    for (const inv of allInvoices) {
      if (inv.number) existingNumbers.add(inv.number);
      if (inv.number && inv.number.startsWith(prefix)) {
        const numPart = parseInt(inv.number.slice(prefix.length), 10);
        if (!isNaN(numPart) && numPart > maxSeq) {
          maxSeq = numPart;
        }
      }
    }

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
            lateAmount += principal * (lateFeeRate / 100);
          }
        }

        if (lateAmount > 0) {
          const roundedLate = Math.round(lateAmount);
          total += roundedLate;
          lines.push({
            concept_id: moraConcept ? moraConcept.id : null,
            description: `Interés de mora a ${asOfStr}`,
            amount: roundedLate,
            line_order: order++,
            account_code: lateFeeIncomeCode,
          });
        }
      }

      if (!lines.length) continue;

      maxSeq++;
      let seq = String(maxSeq).padStart(6, '0');
      let number = `${prefix}${seq}`;
      while (existingNumbers.has(number)) {
        maxSeq++;
        seq = String(maxSeq).padStart(6, '0');
        number = `${prefix}${seq}`;
      }
      existingNumbers.add(number);

      const safeTotal = Math.max(0, Math.round(total) || 0);

      let inv;
      try {
        inv = await pb.create('ph_invoices', {
          number,
          period,
          property_id: prop.id,
          date: dateStr,
          due_date: dueDateStr,
          subtotal: safeTotal,
          total: safeTotal,
          status: 'draft',
          notes: '',
        });
      } catch (err: any) {
        const details = err?.data?.data ? JSON.stringify(err.data.data) : (err.message || 'Error desconocido');
        console.error(`[generatePhInvoices] Error al crear factura ${number} para propiedad ${prop.name || prop.id}:`, details, err);
        throw new Error(`Error al crear la factura ${number}: ${details}`);
      }

      for (const ln of lines) {
        try {
          await pb.create('ph_invoice_lines', { invoice_id: inv.id, ...ln });
        } catch (lnErr: any) {
          console.error(`[generatePhInvoices] Error al crear línea de factura ${inv.id}:`, lnErr);
        }
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
   * Contabiliza en lote la liquidaciÃ³n de un perÃ­odo PH.
   * Solo procesa facturas en draft; omite posted/paid/voided.
   */
  async postPhInvoicesByPeriod(period) {
    const safePeriod = pb.escapeFilterValue(period);
    const invoices = await pb.listAll('ph_invoices', { filter: `period="${safePeriod}"`, perPage: 200 });
    if (!invoices.length) throw new Error(`No hay facturas para el perÃ­odo ${period}.`);

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
      `PerÃ­odo ${period}: contabilizadas ${posted}, omitidas ${skipped}, fallidas ${failed}`,
    );

    return { period, total: invoices.length, posted, skipped, failed, failures };
  },

  /**
   * Descontabiliza una sola factura PH (posted/paid -> draft).
   * Intenta pasar el asiento a draft; si falla, lo anula.
   */
  async unpostPhInvoice(invoiceId) {
    const inv = await pb.get('ph_invoices', invoiceId);
    if (inv.status === 'draft') throw new Error('La factura ya estÃ¡ en borrador.');
    if (inv.status === 'voided') throw new Error('La factura estÃ¡ anulada y no se puede descontabilizar.');

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
   * Descontabiliza completamente la liquidaciÃ³n de un perÃ­odo PH.
   * - Facturas posted/paid pasan a draft y se desvinculan del asiento (tx_id = null).
   * - El asiento asociado se intenta pasar a borrador; si falla, se anula.
   */
  async unpostPhInvoicesByPeriod(period) {
    const safePeriod = pb.escapeFilterValue(period);
    const invoices = await pb.listAll('ph_invoices', { filter: `period="${safePeriod}"`, perPage: 200 });
    if (!invoices.length) throw new Error(`No hay facturas para el perÃ­odo ${period}.`);

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
      `PerÃ­odo ${period}: descontabilizadas ${reverted}, omitidas ${skipped}, TX->draft ${txDraft}, TX->voided ${txVoided}`,
    );

    return { period, total: invoices.length, reverted, skipped, txDraft, txVoided };
  },

  /**
   * Elimina toda la liquidaciÃ³n de un perÃ­odo PH.
   * - Intenta eliminar transacciones asociadas.
   * - Si no puede eliminarlas, las anula para no dejar efecto contable.
   */
  async deletePhInvoicesByPeriod(period) {
    const safePeriod = pb.escapeFilterValue(period);
    const invoices = await pb.listAll('ph_invoices', { filter: `period="${safePeriod}"`, perPage: 200 });
    if (!invoices.length) throw new Error(`No hay facturas para el perÃ­odo ${period}.`);

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
      `PerÃ­odo ${period}: facturas eliminadas ${deleted}, TX eliminadas ${txDeleted}, TX anuladas ${txVoided}`,
    );

    return { period, total: invoices.length, deleted, txDeleted, txVoided };
  },

  /**
   * Contabiliza una factura PH (draft â†’ posted).
   * Genera un asiento: DÃ©bito CxC propietario / CrÃ©dito ingresos por concepto.
   */
  async postPhInvoice(invoiceId) {
    const inv = await pb.get('ph_invoices', invoiceId, {
      expand: 'property_id,property_id.owner_id',
    });
    if (inv.status === 'posted') throw new Error('La factura ya fue contabilizada.');
    if (inv.status === 'voided') throw new Error('La factura estÃ¡ anulada.');

    const lines = await this.getPhInvoiceLines(invoiceId);
    if (!lines.length) throw new Error('La factura no tiene lÃ­neas.');

    // Leer configuraciÃ³n contable PH
    let phCfg = {};
    try {
      const raw = await this.getSetting('ph_config_v1');
      phCfg = raw ? JSON.parse(raw) : {};
    } catch (_) { phCfg = {}; }

    const cxcCode = String(phCfg.cxc_code || '130505').trim();
    const incomeCode = String(phCfg.income_code || '413505').trim();
    const lateFeeIncomeCode = String(phCfg.late_fee_income_code || incomeCode).trim();
    const crossRef = String(inv.number || '').trim();

    // Buscar tipo de transacciÃ³n CF
    const cfTypes = await pb.list('transaction_types', {
      filter: 'code="CF" && active=true',
      perPage: 1,
    });
    if (!cfTypes.items.length) throw new Error('Tipo de transacciÃ³n CF no encontrado. Reinicia PocketBase para aplicar la migraciÃ³n.');
    const txType = cfTypes.items[0];

    // Propietario de la unidad (para third_party en asiento)
    const property = inv.expand?.property_id;
    const ownerId = property?.owner_id || null;
    const propTag = (property?.code || property?.name) ? `[${property.code || property.name}] ` : '';

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

    // Determinar el código de concepto de una línea con prioridad en el código del concepto
    const resolveLineConceptCode = (ln) => {
      // 1. Si está vinculado a un concepto del catálogo, su código manda
      const conceptCode = String(ln.expand?.concept_id?.code || '').trim().toUpperCase();
      if (conceptCode) return conceptCode;

      // 2. Si la línea tiene account_code asignado y coincide con la cuenta de mora configurada
      if (ln.account_code && String(ln.account_code).trim() === lateFeeIncomeCode) {
        return 'MORA';
      }

      // 3. Prefijo formal [CODIGO] (ej. [MORA], [INT])
      const m = String(ln.description || '').match(/^\[([A-Z0-9_-]+)\]/);
      if (m) return m[1].toUpperCase();

      // 4. Detección por texto normalizado sin acentos
      const normDesc = String(ln.description || '')
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (normDesc.includes('interes') || normDesc.includes('mora')) {
        return 'MORA';
      }

      return 'GEN';
    };

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
      const conceptCode = resolveLineConceptCode(ln);
      const refPorConcepto = `${crossRef}-${conceptCode}`;

      let incomeAccountId = incomeDefaultAccount.id;
      if (ln.account_code) {
        // Override directo en la línea
        const overrideAcc = await findAccByCode(ln.account_code);
        incomeAccountId = overrideAcc.id;
      } else if (conceptCode === 'MORA') {
        // Concepto de mora -> cuenta de ingreso para intereses de mora
        const lateAcc = await findAccByCode(lateFeeIncomeCode);
        incomeAccountId = lateAcc.id;
      } else if (concept?.account_id) {
        // Cuenta específica del concepto
        incomeAccountId = concept.account_id;
      }

      const rawDesc = String(ln.description || '').trim();
      const finalDesc = rawDesc.startsWith('[') ? rawDesc : `${propTag}${rawDesc}`;

      txLines.push(await buildTxLine({
        accountId: incomeAccountId,
        debit: 0,
        credit: Number(ln.amount || 0),
        description: finalDesc,
        thirdPartyId: ownerId || null,
        crossDocRef: refPorConcepto,
      }));
    }

    // Línea de débito a CxC (una línea por cada concepto para permitir trazabilidad en recaudo)
    for (const ln of lines) {
      const conceptCode = resolveLineConceptCode(ln);
      const refPorConcepto = `${crossRef}-${conceptCode}`;
      const rawDesc = String(ln.description || '').trim();
      const finalDesc = rawDesc.startsWith('[') ? rawDesc : `${propTag}${rawDesc}`;

      txLines.unshift(await buildTxLine({
        accountId: cxcAccount.id,
        debit: Number(ln.amount || 0),
        credit: 0,
        description: finalDesc,
        thirdPartyId: ownerId || null,
        crossDocRef: refPorConcepto,
      }));
    }
    // Reordenar
    txLines.forEach((l, i) => { l.line_order = i + 1; });

    // Validar sumas de partida doble
    const totalDebit = txLines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = txLines.reduce((sum, l) => sum + (l.credit || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 1.0) {
      throw new Error(`Descuadre contable detectado en factura PH. Débito: ${totalDebit}, Crédito: ${totalCredit}.`);
    }

    // Crear transacción contable atómica (vía bulk-tx)
    const userId = pb.currentUser?.id || '';
    const txPayload: any = {
      tx_type_id: txType.id,
      number: 'AUTO',
      date: inv.date,
      description: `Factura PH ${inv.number} - ${property?.name || inv.property_id} - ${inv.period}`,
      third_party_id: ownerId || null,
      status: 'active',
      user_id: userId || undefined,
      branch_id: inv.branch_id || null,
      cross_enabled: txLines.some(l => !!l.cross_doc_ref),
      cross_type: 'ph_invoices',
      cross_number: inv.number,
      cross_amount: inv.total || 0,
      cross_purpose: 'Causar',
    };

    const tx = await this.createTransaction(txPayload, txLines);

    // Actualizar factura
    await pb.update('ph_invoices', invoiceId, { status: 'posted', tx_id: tx.id });
    await this.logAudit('POST', 'PhInvoice', invoiceId, `Contabilizada ${inv.number} -> TX ${tx.number}`);
    return pb.get('ph_invoices', invoiceId, { expand: 'property_id' });
  },

  /** Anula una factura PH: revierte el asiento si existe */
  async voidPhInvoice(invoiceId, reason = '') {
    const safeReason = String(reason || '').trim();
    if (!safeReason) throw new Error('Debes indicar el motivo de anulaciÃ³n.');
    const inv = await pb.get('ph_invoices', invoiceId);
    if (inv.status === 'voided') throw new Error('La factura ya estÃ¡ anulada.');

    if (inv.status === 'posted' && inv.tx_id) {
      // Anular la transacciÃ³n contable
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
    const res = await fetch(`${pb.baseUrl}/api/ph/send-invoice-email`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ invoiceId, type, email, subject, message }),
    });
    if (!res.ok) throw await this._err(res);
    return res.json();
  },

  /** Envia correos masivos de facturaciÃ³n PH para un perÃ­odo */
  async sendPhBulkEmails(period, type = 'invoice', subject = '', message = '') {
    const res = await fetch(`${pb.baseUrl}/api/ph/send-bulk-emails`, {
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

  /** Genera nÃºmero de PQR con prefijo PQR-YYYYMMDD-NNNN */
  async nextPhPqrNumber() {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const res = await pb.list('ph_pqrs', { perPage: 1 });
    const count = (res.totalItems || 0) + 1;
    return `PQR-${today}-${String(count).padStart(4, '0')}`;
  },

  /** Cobros individuales paginados */
  /**
   * AÃ±ade lÃ­neas de conceptos individuales a una factura en borrador.
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
   * Edita una lÃ­nea manual de factura PH en borrador y recalcula total.
   */
  async updatePhDraftInvoiceLine(lineId, { description = '', amount = 0, account_code = '' } = {}) {
    const line = await pb.get('ph_invoice_lines', lineId);
    const inv = await pb.get('ph_invoices', line.invoice_id);
    if (inv.status !== 'draft') throw new Error('Solo se pueden editar lÃ­neas de facturas en borrador.');
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
   * Elimina una lÃ­nea manual de factura PH en borrador y recalcula total.
   */
  async deletePhDraftInvoiceLine(lineId) {
    const line = await pb.get('ph_invoice_lines', lineId);
    const inv = await pb.get('ph_invoices', line.invoice_id);
    if (inv.status !== 'draft') throw new Error('Solo se pueden eliminar lÃ­neas de facturas en borrador.');
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
          // Fallback para esquemas legacy donde el filtro/campo aÃºn no existe.
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
    const norm = txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (norm.includes('interes') && norm.includes('mora')) return 'Interés de mora';

    return txt;
  },

  async _getPhCarteraDataset(propertyId, fromPeriod = '', toPeriod = '') {
    const safePropertyId = pb.escapeFilterValue(propertyId);
    const safeFrom = pb.escapeFilterValue(fromPeriod);
    const safeTo = pb.escapeFilterValue(toPeriod);

    // Filtro base: facturas no anuladas
    let filter = `status!="voided"`;
    if (propertyId) filter += ` && property_id="${safePropertyId}"`;
    // El perÃ­odo es una cadena YYYY-MM, sirve para filtrar lotes de facturaciÃ³n
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

    // Determinar fecha de corte real (cutoffDate) para cÃ¡lculos de mora y saldos
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

    // Filtrar facturas que fueron emitidas despuÃ©s de la fecha de corte si se especificÃ³
    if (cutoffDate) {
      invoices = invoices.filter(inv => {
        const invDate = (inv.date || inv.created || '').slice(0, 10);
        return invDate <= cutoffDate;
      });
    }

    if (invoices.length === 0) return { invoices: [], rows: [] };
    // 1. Obtener todas las lÃ­neas de las facturas
    const allInvLines = [];
    for (const inv of invoices) {
      try {
        const lns = await this.getPhInvoiceLines(inv.id);
        allInvLines.push(...lns);
      } catch (_) { }
    }

    // 2. Obtener ABONOS de TesorerÃ­a (tx_lines que cruzan estas facturas)
    // Buscamos lÃ­neas contables de tipo Recibo de Caja o ajustes que afecten el saldo
    // CUADRE CRÃTICO: Buscamos tx_lines donde cross_doc_ref coincida con el nÃºmero de factura
    // o empiece por el nÃºmero de factura (para casos de desglose por concepto CF-001-ADMIN)
    const invNumbers = invoices.map(i => String(i.number || '').toUpperCase()).filter(Boolean);
    const causalityTxIds = new Set(invoices.map(i => i.tx_id).filter(Boolean));
    const abonosMap = new Map(); // key: cross_doc_ref, value: total_abono

    if (invNumbers.length > 0) {
      // Optimizamos: traemos lÃ­neas contables que tengan un cross_doc_ref en el set de facturas
      // y cuya fecha sea <= fecha de corte
      const txLines = await pb.listAll('tx_lines', {
        filter: `cross_doc_ref!="" && tx_id.date <= "${refDate}" && (tx_id.status = "posted" || tx_id.status = "active")`,
        expand: 'tx_id'
      });

      for (const tl of txLines) {
        // IGNORAR la causaciÃ³n original de la factura
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

      // Control de abono general para distribuir entre lÃ­neas
      let generalAbono = abonosMap.get(invNumber) || 0;

      for (const line of invLines) {
        const originalAmount = Number(line.amount || 0);

        // 1. Intentar abono específico por concepto (ej: CF-001-ADMIN)
        const cCode = String(line.expand?.concept_id?.code || '').trim().toUpperCase();
        const normDesc = String(line.description || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const isMora = cCode === 'MORA' || normDesc.includes('interes') || normDesc.includes('mora');
        const conceptCode = (cCode || (isMora ? 'MORA' : 'GEN')).toUpperCase();
        const specificRef = `${invNumber}-${conceptCode}`;
        let abonoAplicado = abonosMap.get(specificRef) || 0;

        // 2. Si hay abono general remanente, aplicarlo a esta lÃ­nea
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
    // La integridad se chequea contra el valor ORIGINAL de las lÃ­neas
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

  // -- InformaciÃ³n ExÃ³gena (DIAN) ----------------------------
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

      const isIvaCost = !!tl.is_iva_cost;
      const key = `${third.id}-${matchedConcept}-${accCode}-${isIvaCost ? 'COST' : 'NOCOST'}`;
      if (!results[key]) {
        results[key] = {
          third,
          conceptCode: matchedConcept,
          accountCode: accCode,
          accountName: acc.name,
          isIvaCost,
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

  // â”€â”€ Pedidos y Cotizaciones â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /** Lista paginada de pedidos de venta */
  async getSalesOrders(opts: any = {}) {
    let { page = 1, perPage = 50, filter = '', sort = '-date' } = opts;
    if (pb.currentUser?.role === 'vendedor') {
      const uid = pb.currentUser.id;
      const sellerFilter = `(user_id="${uid}" || seller_id="${uid}")`;
      filter = filter ? `(${filter}) && ${sellerFilter}` : sellerFilter;
    }
    return pb.list('sales_orders', {
      page, perPage, filter, sort,
      expand: 'customer_id,warehouse_id,invoice_id,user_id,seller_id',
    });
  },

  /** LÃ­neas de un pedido de venta con expand de producto y cuenta */
  async getSalesOrderLines(orderId) {
    const safe = pb.escapeFilterValue(orderId);
    return pb.listAll('sales_order_lines', {
      filter: `sales_order_id="${safe}"`,
      sort: 'line_order',
      expand: 'product_id,account_id',
    });
  },

  /** Crea cabecera + lÃ­neas de pedido de venta en estado pendiente */
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

  /** Actualiza cabecera + lÃ­neas de un pedido de venta pendiente */
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

    // Eliminar lÃ­neas viejas
    const oldLines = await pb.listAll('sales_order_lines', { filter: `sales_order_id="${pb.escapeFilterValue(orderId)}"` });
    for (const l of oldLines) {
      await pb.delete('sales_order_lines', l.id);
    }

    // Crear lÃ­neas nuevas
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
      if (res.items && res.items.length) {
        currentConsecutive = parseInt(res.items[0].value || '0', 10);
        recordId = res.items[0].id;
      }
    } catch (_) {}

    // Fallback: calcular a partir del mayor número en sales_orders si settings no es accesible
    if (currentConsecutive === 0) {
      try {
        const lastOrders = await pb.list('sales_orders', { sort: '-created', perPage: 1 });
        if (lastOrders.items && lastOrders.items.length) {
          const lastNumStr = String(lastOrders.items[0].number || '').replace(/\D/g, '');
          currentConsecutive = parseInt(lastNumStr || '0', 10);
        }
      } catch (_) {}
    }

    const next = currentConsecutive + 1;
    const nextStr = String(next);
    
    try {
      if (recordId) {
        await pb.update('settings', recordId, { value: nextStr });
      } else {
        await pb.create('settings', { key: 'order_consecutive', value: nextStr });
      }
    } catch (_) {
      // Ignorar si el rol vendedor no tiene permisos de escritura en la colección settings
    }

    return `PED-${String(next).padStart(8, '0')}`;
  },

  /** Elimina borrador de factura de venta y restablece pedidos asociados */
  async deleteInvoiceDraft(invoiceId) {
    const inv = await pb.get('invoices', invoiceId);
    if (inv.status !== 'draft') throw new Error('Solo se pueden eliminar facturas en estado Borrador.');
    await this.releaseReservationsByInvoice(invoiceId, `eliminar borrador de factura ${inv.number}`).catch(() => {});
    if (inv.sales_order_id) {
      await pb.update('sales_orders', inv.sales_order_id, {
        status: 'pending',
        invoice_id: null,
        has_pending_delivery: false,
        fulfillment_status: 'SIN_GESTION',
      });
      await this.logAudit('UPDATE_STATUS', 'SalesOrder', inv.sales_order_id, `Pedido devuelto a pendiente por eliminaciÃ³n de borrador de factura`);
    }
    // Eliminar lÃ­neas de factura
    const lines = await this.getInvoiceLines(invoiceId);
    for (const l of lines) {
      await pb.delete('invoice_lines', l.id);
    }
    // Eliminar cabecera
    await pb.delete('invoices', invoiceId);
    await this.logAudit('DELETE', 'Invoice', invoiceId, `Eliminado borrador de factura ${inv.number}`);
  },

  // â”€â”€ Importaciones â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /** Lista paginada de importaciones */
  async getImports(opts: any = {}) {
    const { page = 1, perPage = 50, filter = '', sort = '-date_created' } = opts;
    return pb.list('imports', {
      page, perPage, filter, sort,
      expand: 'supplier_id,user_id,purchase_invoice_id',
    });
  },

  /** LÃ­neas de una importaciÃ³n */
  async getImportLines(importId: string) {
    const safe = pb.escapeFilterValue(importId);
    return pb.listAll('import_lines', {
      filter: `import_id="${safe}"`,
      sort: 'line_order',
      expand: 'product_id',
    });
  },

  /** Crea una importaciÃ³n con FormData para soporte de archivos */
  async createImport(header: any, lines: any[], files: any = {}) {
    const formData = new FormData();
    // Incluir header; filtrar null, undefined y NaN para evitar valores invalidos en PocketBase
    for (const key of Object.keys(header)) {
      const val = header[key];
      if (val === undefined || val === null) continue;
      if (typeof val === 'number' && isNaN(val)) continue;
      formData.append(key, String(val));
    }
    if (files.bl_document) {
      formData.append('bl_document', files.bl_document);
    }
    const tStr = typeof (window as any).todayStr === 'function' ? (window as any).todayStr() : new Date().toISOString().slice(0, 10);
    formData.append('date_created', tStr);
    formData.append('user_id', pb.currentUser?.id || '');
    // fob_total ya viene en el header; no se re-appende para evitar duplicados en FormData

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
      if (l.largo_cm !== undefined && l.largo_cm !== null) {
        lineData.append('largo_cm', String(l.largo_cm));
      }
      if (l.ancho_cm !== undefined && l.ancho_cm !== null) {
        lineData.append('ancho_cm', String(l.ancho_cm));
      }
      if (l.alto_cm !== undefined && l.alto_cm !== null) {
        lineData.append('alto_cm', String(l.alto_cm));
      }
      if (l.cubic_meters_total !== undefined && l.cubic_meters_total !== null) {
        lineData.append('cubic_meters_total', String(l.cubic_meters_total));
      }
      if (files[`manifest_file_${i}`]) {
        lineData.append('manifest_file', files[`manifest_file_${i}`]);
      }
      await pb.create('import_lines', lineData);
    }

    await this.logAudit('CREATE', 'Import', record.id, `ImportaciÃ³n creada ${record.number}`);
    return record;
  },

  /** Actualiza cabecera, lÃ­neas e incorpora nuevos adjuntos subidos */
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
      lineData.append('largo_cm', String(l.largo_cm || 0));
      lineData.append('ancho_cm', String(l.ancho_cm || 0));
      lineData.append('alto_cm', String(l.alto_cm || 0));
      lineData.append('cubic_meters_total', String(l.cubic_meters_total || 0));

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

    await this.logAudit('UPDATE', 'Import', importId, `ImportaciÃ³n actualizada ${record.number}`);
    return pb.get('imports', importId);
  },

  /** Anula una importaciÃ³n en estado borrador/transito */
  async cancelImport(importId: string, reason: string = '') {
    const imp = await pb.get('imports', importId);
    if (imp.status === 'recibido') {
      throw new Error('No se puede anular una importaciÃ³n ya finalizada.');
    }
    await pb.update('imports', importId, { status: 'anulado' });
    await this.logAudit('VOID', 'Import', importId, `ImportaciÃ³n anulada ${imp.number} | Motivo: ${reason}`);
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

  /** Genera consecutivo RES-XXXXXX para reservas de importacion */
  async nextSalesReservationConsecutive() {
    let currentConsecutive = 0;
    let recordId = "";
    try {
      const res = await pb.list('settings', { filter: 'key="sales_reservation_consecutive"', perPage: 1 });
      if (res.items && res.items.length) {
        currentConsecutive = parseInt(res.items[0].value || '0', 10);
        recordId = res.items[0].id;
      }
    } catch (_) {}

    if (currentConsecutive === 0) {
      try {
        const lastRes = await pb.list('sales_reservations', { sort: '-created', perPage: 1 });
        if (lastRes.items && lastRes.items.length) {
          const lastNumStr = String(lastRes.items[0].number || '').replace(/\D/g, '');
          currentConsecutive = parseInt(lastNumStr || '0', 10);
        }
      } catch (_) {}
    }

    const next = currentConsecutive + 1;
    const nextStr = String(next);
    try {
      if (recordId) {
        await pb.update('settings', recordId, { value: nextStr });
      } else {
        await pb.create('settings', { key: 'sales_reservation_consecutive', value: nextStr });
      }
    } catch (_) {}

    return `RES-${String(next).padStart(6, '0')}`;
  },

  /** Genera consecutivo DESP-XXXXX para entregas programadas desde facturacion */
  async nextDeliveryConsecutive() {
    let currentConsecutive = 0;
    let recordId = "";
    try {
      const res = await pb.list('settings', { filter: 'key="delivery_consecutive"', perPage: 1 });
      if (res.items && res.items.length) {
        currentConsecutive = parseInt(res.items[0].value || '0', 10);
        recordId = res.items[0].id;
      }
    } catch (_) {}

    const next = currentConsecutive + 1;
    const nextStr = String(next);
    try {
      if (recordId) {
        await pb.update('settings', recordId, { value: nextStr });
      } else {
        await pb.create('settings', { key: 'delivery_consecutive', value: nextStr });
      }
    } catch (_) {}

    return `DESP-${String(next).padStart(5, '0')}`;
  },

  /** Consulta el stock en camino por producto en importaciones activas */
  async getIncomingStockForProduct(productId) {
    const safe = pb.escapeFilterValue(productId);
    const incoming = await pb.listAll('import_lines', {
      filter: `product_id="${safe}" && (import_id.status="transito" || import_id.status="nacionalizacion")`,
      expand: 'import_id',
    });

    if (!incoming.length) return incoming;

    const reservationLines = await pb.listAll('sales_reservation_lines', {
      filter: `import_line_id!="" && (status="active" || status="partial") && (reservation_id.status="active" || reservation_id.status="partial")`,
      expand: 'reservation_id',
    }).catch(() => []);

    const committedByImportLine: any = {};
    for (const r of reservationLines) {
      const il = String(r.import_line_id || '').trim();
      if (!il) continue;
      const committed = Math.max(0, Number(r.qty_reserved || 0) - Number(r.qty_dispatched || 0) - Number(r.qty_released || 0));
      committedByImportLine[il] = (committedByImportLine[il] || 0) + committed;
    }

    return incoming.map((line: any) => {
      const qty = Number(line.qty || 0);
      const committed = Number(committedByImportLine[line.id] || 0);
      return {
        ...line,
        qty_committed: committed,
        qty_available: Math.max(0, qty - committed),
      };
    });
  },

  /** Crea reserva de importacion para una factura marcada como pendiente por entrega. */
  async createImportReservationForInvoice(invoiceId, opts = {}) {
    const options = {
      createDelivery: opts.createDelivery !== false,
      allowExisting: opts.allowExisting !== false,
    };

    const inv = await pb.get('invoices', invoiceId, { expand: 'customer_id' });
    if (!inv.has_pending_delivery) return null;

    const existing = await pb.listAll('sales_reservations', {
      filter: `invoice_id="${pb.escapeFilterValue(invoiceId)}" && status!="released" && status!="cancelled"`,
      sort: '-created',
    }).catch(() => []);

    if (existing.length && options.allowExisting) {
      return existing[0];
    }

    const [invLines, products] = await Promise.all([
      this.getInvoiceLines(invoiceId),
      this.getProducts({ activeOnly: false }),
    ]);

    const goodsLines = invLines
      .map((l: any) => {
        const p = products.find((x: any) => x.id === l.product_id);
        return { line: l, product: p };
      })
      .filter((x: any) => x.product && x.product.type === 'BIEN' && Number(x.line.qty || 0) > 0);

    if (!goodsLines.length) {
      return null;
    }

    const allocations: any[] = [];

    for (const item of goodsLines) {
      const line = item.line;
      const product = item.product;
      let needed = Number(line.qty || 0);
      const incoming = await this.getIncomingStockForProduct(product.id);
      const sorted = [...incoming].sort((a: any, b: any) => {
        const etaA = String(a.expand?.import_id?.estimated_arrival || '9999-99-99');
        const etaB = String(b.expand?.import_id?.estimated_arrival || '9999-99-99');
        return etaA.localeCompare(etaB);
      });

      for (const lot of sorted) {
        if (needed <= 0) break;
        const available = Number(lot.qty_available ?? lot.qty ?? 0);
        if (available <= 0) continue;
        const take = Math.min(needed, available);
        allocations.push({
          invoice_line_id: line.id,
          product_id: product.id,
          import_id: lot.import_id,
          import_line_id: lot.id,
          qty: take,
          eta: lot.expand?.import_id?.estimated_arrival || '',
          product_name: product.name,
        });
        needed -= take;
      }

      if (needed > 0) {
        throw new Error(`No hay disponibilidad en importacion suficiente para ${product.name}. Faltan ${fmtN(needed)} unidades por reservar.`);
      }
    }

    const number = await this.nextSalesReservationConsecutive();
    const reservation = await pb.create('sales_reservations', {
      number,
      customer_id: inv.customer_id,
      sales_order_id: inv.sales_order_id || null,
      invoice_id: invoiceId,
      status: 'active',
      notes: `Reserva auto por factura ${inv.number}`,
    });

    let lineOrder = 1;
    const createdReservationLines: any[] = [];
    for (const a of allocations) {
      const rl = await pb.create('sales_reservation_lines', {
        reservation_id: reservation.id,
        line_order: lineOrder++,
        product_id: a.product_id,
        import_id: a.import_id,
        import_line_id: a.import_line_id,
        qty_reserved: a.qty,
        qty_dispatched: 0,
        qty_released: 0,
        eta_snapshot: a.eta || null,
        status: 'active',
        notes: `Factura ${inv.number}`,
      });
      createdReservationLines.push({ ...rl, invoice_line_id: a.invoice_line_id, product_name: a.product_name });
    }

    await pb.update('invoices', invoiceId, {
      has_pending_delivery: true,
      delivery_fulfillment_status: 'PENDIENTE',
    });

    if (inv.sales_order_id) {
      await pb.update('sales_orders', inv.sales_order_id, {
        has_pending_delivery: true,
        fulfillment_status: 'RESERVADO_IMPORTACION',
      }).catch(() => {});
    }

    if (options.createDelivery) {
      const existingDelivery = await pb.listAll('logistica_deliveries', {
        filter: `invoice_id="${pb.escapeFilterValue(invoiceId)}" && status!="CANCELADO"`,
        sort: '-created',
      }).catch(() => []);

      if (!existingDelivery.length) {
        const dNumber = await this.nextDeliveryConsecutive();
        const customer = inv.expand?.customer_id || null;
        const del = await pb.create('logistica_deliveries', {
          number: dNumber,
          date: inv.due_date || inv.date,
          client_id: inv.customer_id,
          vehicle_id: null,
          address: customer?.address || 'Pendiente definir con cliente',
          status: 'PENDIENTE',
          weight: null,
          notes: `Generado automatico por factura ${inv.number}`,
          items: createdReservationLines.map((x: any) => `${fmtN(x.qty_reserved)} x ${x.product_name || x.product_id}`).join(' | '),
          sales_order_id: inv.sales_order_id || null,
          invoice_id: invoiceId,
        });

        let dLineOrder = 1;
        for (const x of createdReservationLines) {
          await pb.create('logistica_delivery_lines', {
            delivery_id: del.id,
            line_order: dLineOrder++,
            product_id: x.product_id,
            invoice_line_id: x.invoice_line_id || null,
            reservation_line_id: x.id,
            qty_planned: x.qty_reserved,
            qty_delivered: 0,
            notes: `Reserva ${reservation.number}`,
          }).catch(() => {});
        }
      }
    }

    await this.logAudit('CREATE', 'SalesReservation', reservation.id, `Reserva ${number} creada para factura ${inv.number}`);
    return reservation;
  },

  /** Libera reservas activas de una factura (anulacion, rollback o eliminacion). */
  async releaseReservationsByInvoice(invoiceId, reason = '') {
    const reservations = await pb.listAll('sales_reservations', {
      filter: `invoice_id="${pb.escapeFilterValue(invoiceId)}" && (status="active" || status="partial" || status="completed")`,
    }).catch(() => []);

    for (const r of reservations) {
      const lines = await pb.listAll('sales_reservation_lines', {
        filter: `reservation_id="${pb.escapeFilterValue(r.id)}"`,
      }).catch(() => []);

      for (const l of lines) {
        const remaining = Math.max(0, Number(l.qty_reserved || 0) - Number(l.qty_dispatched || 0) - Number(l.qty_released || 0));
        const newReleased = Number(l.qty_released || 0) + remaining;
        const isCompleted = Number(l.qty_dispatched || 0) >= Number(l.qty_reserved || 0);
        await pb.update('sales_reservation_lines', l.id, {
          qty_released: newReleased,
          status: isCompleted ? 'completed' : 'released',
          notes: reason ? `${l.notes || ''} | ${reason}` : l.notes,
        });
      }

      await pb.update('sales_reservations', r.id, {
        status: 'released',
        notes: reason ? `${r.notes || ''} | ${reason}` : r.notes,
      });

      await this.logAudit('RELEASE', 'SalesReservation', r.id, `Reserva ${r.number} liberada${reason ? ` | ${reason}` : ''}`);
    }
  },

  /** Obtener la configuraciÃ³n del mÃ³dulo de importaciones */
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

  /** Guardar la configuraciÃ³n del mÃ³dulo de importaciones */
  async saveImportConfig(cfg) {
    await this.setSetting('import_config_v1', JSON.stringify(cfg));
    await this.logAudit('CONFIG', 'ImportConfig', null, 'ConfiguraciÃ³n de importaciones actualizada');
    return cfg;
  },

  /** Formatea el cÃ³digo de la cuenta contable de trÃ¡nsito para una importaciÃ³n especÃ­fica (ej: 146505 + 099 = 146505099) */
  getImportTransitAccountCode(baseCode: string, importNumber: string): string {
    const base = (baseCode || '146505').trim();
    const rawNum = String(importNumber || '').trim();
    const digits = rawNum.replace(/^[^\d]+/, '').trim() || rawNum.replace(/\D/g, '') || rawNum;
    return `${base}${digits}`;
  },

  /** Obtiene y valida la existencia de la cuenta PUC de trÃ¡nsito especÃ­fica para una importaciÃ³n */
  async getImportTransitAccount(importNumber: string) {
    if (!importNumber) throw new Error('Se requiere el nÃºmero de la importaciÃ³n para validar la cuenta de trÃ¡nsito.');
    const cfg = await this.getImportConfig();
    const baseCode = cfg.accounting?.accounts?.transito_account_code || '146505';
    const expectedCode = this.getImportTransitAccountCode(baseCode, importNumber);

    const safeCode = pb.escapeFilterValue(expectedCode);
    const res = await pb.list('accounts', { filter: `code="${safeCode}"`, perPage: 1 });
    if (!res.items.length) {
      throw new Error(`No existe la cuenta contable "${expectedCode}" en el PUC para MercancÃ­as en TrÃ¡nsito de la importaciÃ³n ${importNumber}. Por favor crÃ©ala en el Plan Ãšnico de Cuentas (PUC) antes de registrar causaciones o movimientos.`);
    }
    return res.items[0];
  },

  /** Obtiene todos los datos para armar el reporte de trazabilidad de una importaciÃ³n */
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

  /** Causa contabilidad individual de una etapa de importaciÃ³n */
  async postImportStage(importId: string, stageName: string, supplierId: string, invoiceNum: string, amount: number) {
    if (!importId) throw new Error('Se requiere el ID de la importaciÃ³n.');
    if (!stageName) throw new Error('Se requiere el nombre de la etapa.');
    if (!supplierId) throw new Error('Se requiere el ID del proveedor.');
    if (!invoiceNum) throw new Error('Se requiere el nÃºmero de factura/soporte.');
    if (amount <= 0) throw new Error('El monto a causar debe ser mayor a cero.');

    const imp = await pb.get('imports', importId);
    
    const mappings: Record<string, { txField: string; supplierField: string; invoiceField: string; label: string }> = {
      fob: { txField: 'tx_fob_id', supplierField: 'supplier_id', invoiceField: 'supplier_invoice_num', label: 'FOB MercancÃ­a' },
      freight: { txField: 'tx_freight_id', supplierField: 'freight_supplier_id', invoiceField: 'freight_invoice_num', label: 'Flete Internacional' },
      insurance: { txField: 'tx_insurance_id', supplierField: 'insurance_supplier_id', invoiceField: 'insurance_invoice_num', label: 'Seguro Internacional' },
      customs: { txField: 'tx_customs_id', supplierField: 'customs_supplier_id', invoiceField: 'customs_invoice_num', label: 'Aduanas / DIAN' },
      local_carrier: { txField: 'tx_local_carrier_id', supplierField: 'local_carrier_id', invoiceField: 'local_carrier_invoice_num', label: 'Transporte Local' },
      local_other: { txField: 'tx_local_other_id', supplierField: 'local_other_supplier_id', invoiceField: 'local_other_invoice_num', label: 'Otros Gastos' },
    };

    const map = mappings[stageName];
    if (!map) throw new Error(`Etapa '${stageName}' no es vÃ¡lida.`);

    if (imp[map.txField]) {
      throw new Error(`La etapa ${map.label} ya tiene una causaciÃ³n contable registrada.`);
    }

    const cfg = await this.getImportConfig();
    const accTransito = await this.getImportTransitAccount(imp.number);

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
    if (!txTypes.length) throw new Error('Tipo de transacciÃ³n FC (Factura de Compra) no encontrado en el sistema.');
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
            description: `CausaciÃ³n Aduana/DIAN - ImportaciÃ³n ${imp.number}`,
            line_order: 1
          },
          {
            account_id: accCustoms.id,
            third_party_id: supplierId,
            debit: 0,
            credit: customsAmt,
            description: `Gastos Nac. - ImportaciÃ³n ${imp.number} | Factura ${invoiceNum}`,
            line_order: 2,
            cross_doc_ref: invoiceNum
          },
          {
            account_id: accArancel.id,
            third_party_id: supplierId,
            debit: 0,
            credit: arancelAmt,
            description: `Aranceles DIAN - ImportaciÃ³n ${imp.number}`,
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
          description: `CausaciÃ³n ${map.label} - ImportaciÃ³n ${imp.number}`,
          line_order: 1
        },
        {
          account_id: accPayable.id,
          third_party_id: supplierId,
          debit: 0,
          credit: amount,
          description: `CausaciÃ³n ${map.label} - ImportaciÃ³n ${imp.number} | Factura ${invoiceNum}`,
          line_order: 2,
          cross_doc_ref: invoiceNum
        }
      ];
    }

    const txData = {
      tx_type_id: txTypeId,
      number: 'AUTO',
      date: new Date().toISOString().slice(0, 10),
      description: `CausaciÃ³n ${map.label} ImportaciÃ³n ${imp.number}`,
      third_party_id: supplierId,
      status: 'active'
    };

    const tx = await this.createTransaction(txData, lines);

    const updateData: Record<string, any> = {};
    updateData[map.txField] = tx.id;
    updateData[map.supplierField] = supplierId;
    updateData[map.invoiceField] = invoiceNum;

    await pb.update('imports', importId, updateData);
    await this.logAudit('POST_STAGE', 'imports', importId, `CausaciÃ³n contable etapa ${map.label} realizada. TransacciÃ³n: ${tx.number}`);

    return tx;
  },

  /** Registra nota de ajuste contable por diferencia en costo */
  async postImportAdjustment(importId: string, stageName: string, deltaAmount: number, invoiceNum: string, reason: string = '') {
    if (!importId) throw new Error('Se requiere el ID de la importaciÃ³n.');
    if (!stageName) throw new Error('Se requiere el nombre de la etapa.');
    if (deltaAmount === 0) throw new Error('El monto de ajuste no puede ser cero.');

    const imp = await pb.get('imports', importId);

    const mappings: Record<string, { txField: string; supplierField: string; invoiceField: string; label: string }> = {
      fob: { txField: 'tx_fob_id', supplierField: 'supplier_id', invoiceField: 'supplier_invoice_num', label: 'FOB MercancÃ­a' },
      freight: { txField: 'tx_freight_id', supplierField: 'freight_supplier_id', invoiceField: 'freight_invoice_num', label: 'Flete Internacional' },
      insurance: { txField: 'tx_insurance_id', supplierField: 'insurance_supplier_id', invoiceField: 'insurance_invoice_num', label: 'Seguro Internacional' },
      customs: { txField: 'tx_customs_id', supplierField: 'customs_supplier_id', invoiceField: 'customs_invoice_num', label: 'Aduanas / DIAN' },
      local_carrier: { txField: 'tx_local_carrier_id', supplierField: 'local_carrier_id', invoiceField: 'local_carrier_invoice_num', label: 'Transporte Local' },
      local_other: { txField: 'tx_local_other_id', supplierField: 'local_other_supplier_id', invoiceField: 'local_other_invoice_num', label: 'Otros Gastos' },
    };

    const map = mappings[stageName];
    if (!map) throw new Error(`Etapa '${stageName}' no es vÃ¡lida.`);

    if (!imp[map.txField]) {
      throw new Error(`No se puede realizar un ajuste en ${map.label} porque aÃºn no ha sido causada.`);
    }

    const supplierId = imp[map.supplierField];
    if (!supplierId) throw new Error(`No se encontrÃ³ un proveedor asociado a la etapa ${map.label}.`);

    const cfg = await this.getImportConfig();
    const accTransito = await this.getImportTransitAccount(imp.number);

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

    if (!txTypeId) throw new Error('No se encontrÃ³ ningÃºn tipo de transacciÃ³n contable vÃ¡lido para el ajuste (NC o FC).');

    const absDelta = Math.abs(deltaAmount);
    const isIncrease = deltaAmount > 0;

    const lines = [
      {
        account_id: accTransito.id,
        third_party_id: supplierId,
        debit: isIncrease ? absDelta : 0,
        credit: isIncrease ? 0 : absDelta,
        description: `Nota de Ajuste ${map.label} - ImportaciÃ³n ${imp.number}. Motivo: ${reason}`,
        line_order: 1
      },
      {
        account_id: accPayable.id,
        third_party_id: supplierId,
        debit: isIncrease ? 0 : absDelta,
        credit: isIncrease ? absDelta : 0,
        description: `Nota de Ajuste ${map.label} - ImportaciÃ³n ${imp.number} | Factura ${invoiceNum}. Motivo: ${reason}`,
        line_order: 2,
        cross_doc_ref: invoiceNum
      }
    ];

    const txData = {
      tx_type_id: txTypeId,
      number: 'AUTO',
      date: new Date().toISOString().slice(0, 10),
      description: `Ajuste Contable ${map.label} ImportaciÃ³n ${imp.number} | Factura ${invoiceNum}`,
      third_party_id: supplierId,
      status: 'active'
    };

    const tx = await this.createTransaction(txData, lines);
    await this.logAudit('POST_ADJUSTMENT', 'imports', importId, `Ajuste contable realizado en etapa ${map.label}. Diferencia: ${deltaAmount}. TransacciÃ³n: ${tx.number}`);

    return tx;
  },

  /** Finaliza la importaciÃ³n, traslada costo de TrÃ¡nsito a Inventario y registra stock */
  async capitalizeImport(importId: string, warehouseId: string, txTypeId: string, txNumber: string) {
    if (!importId) throw new Error('Se requiere el ID de la importaciÃ³n.');
    if (!warehouseId) throw new Error('Se requiere la bodega de destino.');
    if (!txTypeId) throw new Error('Se requiere el tipo de transacciÃ³n contable.');
    if (!txNumber) throw new Error('Se requiere el nÃºmero del comprobante contable.');

    const imp = await pb.get('imports', importId);
    if (imp.status === 'recibido') {
      throw new Error('Esta importaciÃ³n ya ha sido finalizada y capitalizada.');
    }
    const lines = await this.getImportLines(importId);
    if (!lines.length) {
      throw new Error('La importaciÃ³n no contiene productos para capitalizar.');
    }

    const cfg = await this.getImportConfig();
    const inventarioCode = cfg.accounting?.accounts?.inventario_account_code || '143501';

    const accTransito = await this.getImportTransitAccount(imp.number);
    const accInventario = await _apiFindAccByCode(inventarioCode);

    const totalAmount = imp.total || 0;
    if (totalAmount <= 0) {
      throw new Error('El valor total acumulado de la importaciÃ³n debe ser mayor a cero para capitalizar.');
    }

    const txLines = [
      {
        account_id: accInventario.id,
        third_party_id: imp.supplier_id,
        debit: totalAmount,
        credit: 0,
        description: `CapitalizaciÃ³n ImportaciÃ³n ${imp.number} - Ingreso a Bodega`,
        line_order: 1
      },
      {
        account_id: accTransito.id,
        third_party_id: imp.supplier_id,
        debit: 0,
        credit: totalAmount,
        description: `CapitalizaciÃ³n ImportaciÃ³n ${imp.number} - Cierre Cuenta TrÃ¡nsito`,
        line_order: 2
      }
    ];

    const txData = {
      tx_type_id: txTypeId,
      number: txNumber,
      date: new Date().toISOString().slice(0, 10),
      description: `CapitalizaciÃ³n ImportaciÃ³n ${imp.number}`,
      third_party_id: imp.supplier_id,
      status: 'active'
    };

    const tx = await this.createTransaction(txData, txLines);

    const movToday = new Date().toISOString().slice(0, 10);
    const movNumber = await this.getNextInventoryMovementNumber(movToday, 'ENTRADA');
    const movData = {
      number: movNumber,
      mov_type: 'ENTRADA',
      date: movToday,
      warehouse_id: warehouseId,
      third_party_id: imp.supplier_id,
      notes: `Ingreso fÃ­sico por capitalizaciÃ³n de ImportaciÃ³n ${imp.number}. TransacciÃ³n contable: ${tx.number}`,
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
        notes: `ImportaciÃ³n ${imp.number} - LÃ­nea ${i + 1}`,
        line_order: i + 1
      });
    }

    await this.applyInventoryMovement(mov.id);

    await pb.update('imports', importId, {
      status: 'recibido'
    });

    await this.logAudit('CAPITALIZE', 'imports', importId, `ImportaciÃ³n capitalizada y trasladada a bodega. TransacciÃ³n: ${tx.number}. Movimiento: ${mov.number}`);

    return { tx, mov };
  },

  // â”€â”€ Inmobiliarias (F9) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getInmoProperties(activeOnly = true) {
    const filter = activeOnly ? 'active=true' : '';
    return pb.listAll('inmo_properties', {
      filter,
      sort: 'code',
      expand: 'owner_id',
    });
  },

  async getInmoContracts(activeOnly = true, typeFilter?: 'EMITIDO' | 'RECIBIDO' | 'ALL') {
    let filter = activeOnly ? 'active=true' : '';
    const selectedType = typeFilter || 'EMITIDO';
    if (selectedType !== 'ALL') {
      const typeExpr = `type="${selectedType}"`;
      filter = filter ? `(${filter}) && ${typeExpr}` : typeExpr;
    }
    return pb.listAll('inmo_contracts', {
      filter,
      sort: 'number',
      expand: 'property_id,property_id.owner_id,tenant_id,lessor_id',
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

    // Validar facturas ya existentes para este perÃ­odo
    const existing = await pb.listAll('inmo_invoices', {
      filter: `period="${safePeriod}"`,
      perPage: 200,
    });
    const existingContractIds = new Set(existing.map(i => i.contract_id));

    const toCreate = contracts.filter(c => c.status === 'VIGENTE' && !existingContractIds.has(c.id));
    if (!toCreate.length) throw new Error(`Todos los contratos vigentes ya tienen factura para el perÃ­odo ${period}.`);

    // Leer configuraciones de Inmobiliaria y Facturación General (prices_include_iva)
    let inmoCfg: any = {};
    try {
      const rawInmoCfg = await this.getSetting('inmo_config_v1');
      if (rawInmoCfg) inmoCfg = JSON.parse(rawInmoCfg);
    } catch (_) {}

    let generalPricesIncludeIva = false;
    try {
      const rawSalesCfg = await this.getSetting('sales_config_v1');
      if (rawSalesCfg) {
        const parsedSales = JSON.parse(rawSalesCfg);
        generalPricesIncludeIva = !!parsedSales?.operational?.prices_include_iva;
      }
    } catch (_) {}

    const pricesIncludeIva = inmoCfg.prices_include_tax !== undefined 
      ? !!inmoCfg.prices_include_tax 
      : generalPricesIncludeIva;

    const dateStr = period + '-01';
    const dueDateStr = dueDate || (period + '-10');
    let created = 0;

    for (const contract of toCreate) {
      const prop = contract.expand?.property_id;
      const commRate = prop?.commission_rate !== undefined && prop?.commission_rate !== null ? Number(prop.commission_rate) : 0;
      const monthlyRent = Number(contract.monthly_rent || 0);

      let rentBase = monthlyRent;
      let taxAmount = 0;
      let totalAmount = monthlyRent;
      let commissionAmount = 0;
      let netToOwner = 0;

      if (commRate > 0) {
        // CASO A: MANDATO / INTERMEDIACIÓN (Comisión > 0%)
        commissionAmount = Math.round(monthlyRent * (commRate / 100));
        netToOwner = monthlyRent - commissionAmount;
        rentBase = monthlyRent;
        taxAmount = 0;
        totalAmount = monthlyRent;
      } else {
        // CASO B: ARRENDAMIENTO ESTÁNDAR DIRECTO (COMISIÓN 0%)
        const rentHasIva = !!inmoCfg.rent_has_iva;
        const rentIvaRate = rentHasIva ? (parseFloat(inmoCfg.rent_iva_rate) || 19) : 0;
        
        if (rentHasIva && rentIvaRate > 0) {
          if (pricesIncludeIva) {
            // PRECIOS TIENEN IVA INCLUIDO (TAX-IN)
            totalAmount = monthlyRent;
            rentBase = Math.round(totalAmount / (1 + (rentIvaRate / 100)));
            taxAmount = totalAmount - rentBase;
          } else {
            // PRECIOS NO INCLUYEN IVA (TAX-OUT)
            rentBase = monthlyRent;
            taxAmount = Math.round(rentBase * (rentIvaRate / 100));
            totalAmount = rentBase + taxAmount;
          }
        } else {
          rentBase = monthlyRent;
          taxAmount = 0;
          totalAmount = monthlyRent;
        }
        commissionAmount = 0;
        netToOwner = 0;
      }

      // Generar consecutivo de factura
      const randomPart = String(Date.now()).slice(-4);
      const invoiceNum = `IA-${period.replace('-', '')}-${randomPart}-${created + 1}`;

      const inv = await pb.create('inmo_invoices', {
        number: invoiceNum,
        period: safePeriod,
        contract_id: contract.id,
        date: dateStr,
        due_date: dueDateStr,
        rent_amount: rentBase,
        other_amount: 0,
        tax_amount: taxAmount,
        commission_amount: commissionAmount,
        net_to_owner: netToOwner,
        total: totalAmount,
        status: 'draft',
        notes: `Facturación canon de arrendamiento período ${period}. Inmueble: ${prop?.title || ''}.`,
      });

      // Crear líneas de factura
      await pb.create('inmo_invoice_lines', {
        invoice_id: inv.id,
        description: 'Canon de arrendamiento',
        amount: rentBase,
        line_order: 1,
      });

      if (taxAmount > 0) {
        await pb.create('inmo_invoice_lines', {
          invoice_id: inv.id,
          description: `IVA Arrendamiento (${inmoCfg.rent_iva_rate || 19}%)`,
          amount: taxAmount,
          line_order: 2,
        });
      }

      created++;
    }

    return created;
  },

  async postInmoInvoicesByPeriod(period) {
    const safePeriod = pb.escapeFilterValue(period);
    const invoices = await pb.listAll('inmo_invoices', { filter: `period="${safePeriod}"`, perPage: 200 });
    if (!invoices.length) throw new Error(`No hay facturas para el perÃ­odo ${period}.`);

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
      `PerÃ­odo ${period}: contabilizadas ${posted}, omitidas ${skipped}, fallidas ${failed}`,
    );

    return { period, total: invoices.length, posted, skipped, failed, failures };
  },

  async unpostInmoInvoice(invoiceId) {
    const inv = await pb.get('inmo_invoices', invoiceId);
    if (inv.status === 'draft') throw new Error('La factura ya estÃ¡ en borrador.');
    if (inv.status === 'voided') throw new Error('La factura estÃ¡ anulada.');

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
    if (!invoices.length) throw new Error(`No hay facturas para el perÃ­odo ${period}.`);

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
      `PerÃ­odo ${period}: descontabilizadas ${reverted}, omitidas ${skipped}, TX->draft ${txDraft}, TX->voided ${txVoided}`,
    );

    return { period, total: invoices.length, reverted, skipped, txDraft, txVoided };
  },

  async deleteInmoInvoicesByPeriod(period) {
    const safePeriod = pb.escapeFilterValue(period);
    const invoices = await pb.listAll('inmo_invoices', { filter: `period="${safePeriod}"`, perPage: 200 });
    if (!invoices.length) throw new Error(`No hay facturas para el perÃ­odo ${period}.`);

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
      `PerÃ­odo ${period}: facturas eliminadas ${deleted}, TX eliminadas ${txDeleted}, TX anuladas ${txVoided}`,
    );

    return { period, total: invoices.length, deleted, txDeleted, txVoided };
  },

  async postInmoInvoice(invoiceId, selectedResolutionId = '') {
    const inv = await pb.get('inmo_invoices', invoiceId, {
      expand: 'contract_id,contract_id.property_id,contract_id.property_id.owner_id,contract_id.tenant_id',
    });
    if (inv.status === 'posted') throw new Error('La factura ya fue contabilizada.');
    if (inv.status === 'voided') throw new Error('La factura está anulada.');

    const lines = await this.getInmoInvoiceLines(invoiceId);
    if (!lines.length) throw new Error('La factura no tiene líneas.');

    // Leer configuración contable Inmobiliarias
    let inmoCfg: any = {};
    try {
      const raw = await this.getSetting('inmo_config_v1');
      inmoCfg = raw ? JSON.parse(raw) : {};
    } catch (_) { inmoCfg = {}; }

    const activeResolutionId = selectedResolutionId || inmoCfg.dian_resolution_id || '';

    const cxcTenantCode = String(inmoCfg.cxc_tenant_code || '130505').trim();
    const commissionIncomeCode = String(inmoCfg.commission_income_code || '413505').trim();
    const cxpOwnerCode = String(inmoCfg.cxp_owner_code || '220505').trim();

    // Buscar tipo de transacciÃ³n IA
    const iaTypes = await pb.list('transaction_types', {
      filter: 'code="IA" && active=true',
      perPage: 1,
    });
    if (!iaTypes.items.length) throw new Error('Tipo de transacciÃ³n IA no encontrado. Reinicia PocketBase para aplicar la migraciÃ³n.');
    const txType = iaTypes.items[0];

    // Terceros involucrados
    const tenantId = inv.expand?.contract_id?.expand?.tenant_id?.id || null;
    const ownerId = inv.expand?.contract_id?.expand?.property_id?.expand?.owner_id?.id || null;

    const accountByIdCache = {};
    const accountByCodeCache = {};
    const getAccById = async (id) => {
      const key = String(id || '').trim();
      if (!key) throw new Error('Cuenta contable invÃ¡lida.');
      if (!accountByIdCache[key]) accountByIdCache[key] = await pb.get('accounts', key);
      return accountByIdCache[key];
    };
    const findAccByCode = async (code) => {
      const key = String(code || '').trim();
      if (!key) throw new Error('CÃ³digo de cuenta invÃ¡lido.');
      if (accountByCodeCache[key]) return accountByCodeCache[key];
      const safeCode = pb.escapeFilterValue(key);
      const res = await pb.list('accounts', { filter: `code="${safeCode}"`, perPage: 1 });
      if (!res.items.length) throw new Error(`Cuenta "${code}" no encontrada.`);
      const acc = res.items[0];
      accountByCodeCache[key] = acc;
      accountByIdCache[acc.id] = acc;
      return acc;
    };

    const commissionHasIva = !!inmoCfg.commission_has_iva;
    const ivaCommissionCode = String(inmoCfg.iva_commission_code || '240810').trim();

    const cxcTenantAcc = await findAccByCode(cxcTenantCode);
    const commissionIncomeAcc = await findAccByCode(commissionIncomeCode);
    const cxpOwnerAcc = await findAccByCode(cxpOwnerCode);

    const txLines = [];
    const isMandato = (inv.commission_amount || 0) > 0;
    
    if (isMandato) {
      // ── CASO A: FACTURA POR MANDATO / INTERMEDIACIÓN ──
      const commissionHasIva = !!inmoCfg.commission_has_iva;
      const ivaCommissionCode = String(inmoCfg.iva_commission_code || '240810').trim();

      const cxcTenantAcc = await findAccByCode(cxcTenantCode);
      const commissionIncomeAcc = await findAccByCode(commissionIncomeCode);
      const cxpOwnerAcc = await findAccByCode(cxpOwnerCode);

      txLines.push({
        account_id: cxcTenantAcc.id,
        third_party_id: tenantId,
        debit: inv.total || 0,
        credit: 0,
        description: `Canon Inmueble ${inv.expand?.contract_id?.expand?.property_id?.title || ''} período ${inv.period}`,
        line_order: 1,
        cross_doc_ref: inv.number,
      });

      let ownerPayout = inv.net_to_owner || 0;
      let commissionIvaAmount = 0;

      if (commissionHasIva && inv.commission_amount > 0) {
        commissionIvaAmount = Math.round(inv.commission_amount * 0.19);
        ownerPayout = Math.max(0, ownerPayout - commissionIvaAmount);
      }

      txLines.push({
        account_id: commissionIncomeAcc.id,
        third_party_id: ownerId,
        debit: 0,
        credit: inv.commission_amount || 0,
        description: `Comisión Administración Inmobiliaria - Factura ${inv.number}`,
        line_order: 2,
      });

      let currentLineOrder = 3;

      if (commissionIvaAmount > 0) {
        const ivaCommissionAcc = await findAccByCode(ivaCommissionCode);
        txLines.push({
          account_id: ivaCommissionAcc.id,
          third_party_id: ownerId,
          debit: 0,
          credit: commissionIvaAmount,
          description: `IVA Comisión Administración 19% - Factura ${inv.number}`,
          line_order: currentLineOrder++,
        });
      }

      txLines.push({
        account_id: cxpOwnerAcc.id,
        third_party_id: ownerId,
        debit: 0,
        credit: ownerPayout,
        description: `Neto Propietario por Canon - Factura ${inv.number}`,
        line_order: currentLineOrder++,
        cross_doc_ref: inv.number,
      });

    } else {
      // ── CASO B: ARRENDAMIENTO ESTÁNDAR / GESTIÓN DIRECTA (COMISIÓN 0%) ──
      const rentHasIva = !!inmoCfg.rent_has_iva;
      const rentIvaRate = rentHasIva ? (parseFloat(inmoCfg.rent_iva_rate) || 19) : 0;
      const rentIvaCode = String(inmoCfg.rent_iva_code || '240805').trim();
      const rentIncomeCode = String(inmoCfg.rent_income_code || '415505').trim();

      const cxcTenantAcc = await findAccByCode(cxcTenantCode);
      const rentIncomeAcc = await findAccByCode(rentIncomeCode);

      const baseRent = (inv.rent_amount || 0) + (inv.other_amount || 0);
      const ivaRent = (rentHasIva && rentIvaRate > 0) ? Math.round(baseRent * (rentIvaRate / 100)) : 0;
      const totalInv = baseRent + ivaRent;

      // 1. Débito a CxC Inquilino por el Total (Base + IVA)
      txLines.push({
        account_id: cxcTenantAcc.id,
        third_party_id: tenantId,
        debit: totalInv,
        credit: 0,
        description: `Arrendamiento Estándar Inmueble ${inv.expand?.contract_id?.expand?.property_id?.title || ''} período ${inv.period}`,
        line_order: 1,
        cross_doc_ref: inv.number,
      });

      // 2. Crédito a Ingreso por Arrendamiento (Base)
      txLines.push({
        account_id: rentIncomeAcc.id,
        third_party_id: tenantId,
        debit: 0,
        credit: baseRent,
        description: `Ingreso por Arrendamiento Estándar - Factura ${inv.number}`,
        line_order: 2,
      });

      // 3. Crédito a IVA Arrendamiento (si aplica)
      if (ivaRent > 0) {
        const rentIvaAcc = await findAccByCode(rentIvaCode);
        txLines.push({
          account_id: rentIvaAcc.id,
          third_party_id: tenantId,
          debit: 0,
          credit: ivaRent,
          description: `IVA Arrendamiento ${rentIvaRate}% - Factura ${inv.number}`,
          line_order: 3,
        });
      }
    }

    // Validar sumas de partida doble
    const totalDebit = txLines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = txLines.reduce((sum, l) => sum + (l.credit || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 1.0) {
      throw new Error(`Descuadre contable detectado. DÃ©bito: ${totalDebit}, CrÃ©dito: ${totalCredit}.`);
    }

    const txPayload: any = {
      tx_type_id: txType.id,
      number: 'AUTO',
      date: inv.date,
      description: `Facturación Arriendo ${inv.number} - Inmueble: ${inv.expand?.contract_id?.expand?.property_id?.title || ''}`,
      third_party_id: tenantId,
      status: 'active',
      branch_id: inv.branch_id || null,
      cross_enabled: true,
      cross_type: 'inmo_invoices',
      cross_number: inv.number,
      cross_amount: inv.total || 0,
      cross_purpose: 'Causar',
    };
    if (activeResolutionId) {
      txPayload.dian_resolution_id = activeResolutionId;
    }

    const tx = await this.createTransaction(txPayload, txLines);

    await pb.update('inmo_invoices', invoiceId, {
      status: 'posted',
      tx_id: tx.id,
    });

    await this.logAudit('POST', 'InmoInvoice', invoiceId, `Contabilizada ${inv.number} -> TX ${tx.number}`);
    return { inv, tx };
  },

  // ── Liquidaciones de Consignación ───────────────────────────
  async getConsignmentSettlements(opts = {}) {
    const { page = 1, perPage = 50, filter = '', sort = '-date' } = opts;
    return pb.list('consignment_settlements', {
      page, perPage, filter, sort,
      expand: 'third_party_id,invoice_id,purchase_invoice_id,warehouse_id',
    });
  },

  async getConsignmentSettlementLines(settlementId) {
    const safe = pb.escapeFilterValue(settlementId);
    return pb.listAll('consignment_settlement_lines', {
      filter: `settlement_id="${safe}"`,
      expand: 'product_id',
    });
  },

  async createConsignmentSettlement(settlement, lines) {
    const todayStr = (settlement.date || new Date().toISOString().slice(0, 10)).replaceAll('-', '');
    const rand = String(Date.now()).slice(-4);
    const num = `LIQ-${todayStr}-${rand}`;

    const record = await pb.create('consignment_settlements', {
      ...settlement,
      number: num,
      status: 'draft',
    });

    for (const line of lines) {
      await pb.create('consignment_settlement_lines', {
        settlement_id: record.id,
        ...line,
      });
    }

    await this.logAudit('CREATE', 'ConsignmentSettlement', record.id, `Liquidación ${record.type} ${num}`);
    return record;
  },

  async postConsignmentSettlement(settlementId) {
    const settle = await pb.get('consignment_settlements', settlementId, { expand: 'third_party_id' });
    if (settle.status === 'posted') throw new Error('La liquidación ya fue procesada.');
    if (settle.status === 'voided') throw new Error('La liquidación está anulada.');

    const lines = await this.getConsignmentSettlementLines(settlementId);
    if (!lines.length) throw new Error('La liquidación no tiene líneas.');

    const today = settle.date || new Date().toISOString().slice(0, 10);
    const isOut = settle.type === 'OUTBOUND';

    if (isOut) {
      // Outbound Settlement: Generar factura de venta para el cliente
      let fvTxType = await pb.listAll('transaction_types', { filter: 'code="FV" && active=true' });
      if (!fvTxType.length) {
        fvTxType = await pb.listAll('transaction_types', { filter: 'active=true' });
      }
      if (!fvTxType.length) throw new Error('No se encontró un tipo de comprobante de venta (FV) activo.');

      const rand = String(Date.now()).slice(-4);
      const invoiceNumber = `FV-${today.replaceAll('-', '')}-${rand}`;

      const header = {
        number: invoiceNumber,
        date: today,
        customer_id: settle.third_party_id,
        payment_method: 'CREDITO',
        payment_days: 30,
        tx_type_id: fvTxType[0].id,
        tx_number: invoiceNumber,
        notes: `Liquidación de Consignación ${settle.number}`,
        warehouse_id: settle.warehouse_id || null,
        branch_id: settle.branch_id || null,
      };

      const invLines = [];
      for (const line of lines) {
        if (line.qty_sold <= 0) continue;
        const prod = line.expand?.product_id;
        invLines.push({
          product_id: line.product_id,
          qty: line.qty_sold,
          unit_price: line.unit_cost,
          subtotal: line.qty_sold * line.unit_cost,
          iva_rate: prod?.iva_rate || 0,
          iva_amount: Math.round((line.qty_sold * line.unit_cost * (prod?.iva_rate || 0) / 100) * 100) / 100,
          description: `Consignación - ${prod?.name || ''}`,
        });
      }

      if (invLines.length > 0) {
        const inv = await this.createInvoice(header, invLines);
        await this.postInvoice(inv.id);
        await pb.update('consignment_settlements', settlementId, {
          status: 'posted',
          invoice_id: inv.id,
        });
      } else {
        await pb.update('consignment_settlements', settlementId, { status: 'posted' });
      }

    } else {
      // Inbound Settlement: Generar factura de compra del proveedor
      let fcTxType = await pb.listAll('transaction_types', { filter: 'code="FC" && active=true' });
      if (!fcTxType.length) {
        fcTxType = await pb.listAll('transaction_types', { filter: 'code="CO" && active=true' });
      }
      if (!fcTxType.length) {
        fcTxType = await pb.listAll('transaction_types', { filter: 'active=true' });
      }
      if (!fcTxType.length) throw new Error('No se encontró un tipo de comprobante de compra (FC/CO) activo.');

      const rand = String(Date.now()).slice(-4);
      const purchaseNumber = `FC-${today.replaceAll('-', '')}-${rand}`;

      const header = {
        number: purchaseNumber,
        date: today,
        supplier_id: settle.third_party_id,
        payment_method: 'CREDITO',
        payment_days: 30,
        tx_type_id: fcTxType[0].id,
        tx_number: purchaseNumber,
        notes: `Liquidación de Consignación ${settle.number}`,
        warehouse_id: settle.warehouse_id || null,
        branch_id: settle.branch_id || null,
      };

      const purLines = [];
      for (const line of lines) {
        if (line.qty_sold <= 0) continue;
        const prod = line.expand?.product_id;
        purLines.push({
          product_id: line.product_id,
          qty: line.qty_sold,
          unit_cost: line.unit_cost,
          subtotal: line.qty_sold * line.unit_cost,
          iva_rate: prod?.iva_rate || 0,
          iva_amount: Math.round((line.qty_sold * line.unit_cost * (prod?.iva_rate || 0) / 100) * 100) / 100,
          description: `Liquidación Consignación - ${prod?.name || ''}`,
        });
      }

      if (purLines.length > 0) {
        const pinv = await this.createPurchaseInvoice(header, purLines);
        await this.postPurchaseInvoice(pinv.id);
        
        // Reclasificar débito de inventario (14) a cuenta puente de consignaciones (238095)
        if (pinv.tx_id) {
          const txLines = await pb.listAll('tx_lines', { filter: `transaction_id="${pinv.tx_id}"` });
          for (const tl of txLines) {
            const acc = await pb.get('accounts', tl.account_id);
            if (acc.code.startsWith('14')) {
              try {
                const bridgeAcc = await _apiFindAccByCode('238095');
                if (bridgeAcc) {
                  await pb.update('tx_lines', tl.id, { account_id: bridgeAcc.id });
                }
              } catch (_) {}
            }
          }
        }

        await pb.update('consignment_settlements', settlementId, {
          status: 'posted',
          purchase_invoice_id: pinv.id,
        });
      } else {
        await pb.update('consignment_settlements', settlementId, { status: 'posted' });
      }
    }

    // Devoluciones físicas (TRASLADO automático de la bodega de consignación a la bodega principal de retorno)
    const transferLines = [];
    for (const line of lines) {
      if (line.qty_returned > 0) {
        transferLines.push({
          product_id: line.product_id,
          qty: line.qty_returned,
          unit_cost: line.unit_cost,
        });
      }
    }
    if (transferLines.length > 0) {
      const destWh = settle.return_warehouse_id || (await this.getWarehouses(true)).find(w => !w.is_consignment)?.id;
      if (destWh) {
        const trNum = await this.getNextInventoryMovementNumber(today, 'TRASLADO');
        const mov = await pb.create('inventory_movements', {
          number: trNum,
          mov_type: 'TRASLADO',
          date: today,
          warehouse_id: settle.warehouse_id,
          dest_warehouse_id: destWh,
          notes: `Devolución de Consignación ${settle.number}`,
          status: 'draft',
          branch_id: settle.branch_id || null,
        });
        for (let i = 0; i < transferLines.length; i++) {
          await pb.create('inventory_movement_lines', {
            movement_id: mov.id,
            line_order: i + 1,
            ...transferLines[i]
          });
        }
        await this.applyInventoryMovement(mov.id);
      }
    }

    await this.logAudit('POST', 'ConsignmentSettlement', settlementId, `Aplicada liquidación ${settle.number}`);
    return;
  },

  async voidConsignmentSettlement(settlementId) {
    const settle = await pb.get('consignment_settlements', settlementId);
    if (settle.status !== 'posted') throw new Error('Solo se pueden anular liquidaciones ya contabilizadas.');

    if (settle.invoice_id) {
      await this.voidInvoice(settle.invoice_id, `Anulación de Liquidación ${settle.number}`);
    }
    if (settle.purchase_invoice_id) {
      await this.voidPurchaseInvoice(settle.purchase_invoice_id, `Anulación de Liquidación ${settle.number}`);
    }

    await pb.update('consignment_settlements', settlementId, { status: 'voided' });
    await this.logAudit('VOID', 'ConsignmentSettlement', settlementId, `Anulada liquidación ${settle.number}`);
  },

  /**
   * Archiva físicamente el soporte de una transacción aprobada en el servidor (PDF en carpeta de BD)
   */
  async archiveTransactionPdf(txId: string) {
    const res = await fetch(`${pb.baseUrl}/api/gravy/archive-pdf`, {
      method: 'POST',
      headers: pb.headers(),
      body: JSON.stringify({ tx_id: txId })
    });
    if (!res.ok) throw await pb._err(res);
    return res.json();
  },

  /**
   * Renumeración masiva de referencias de productos (Exclusivo SUPERADMIN)
   * Con fallback automático cliente a cliente si el endpoint de backend no está disponible (404).
   */
  async bulkRenumberProducts(payload: {
    items: Array<{ id: string; newCode: string; oldCode?: string }>;
    updateConsecutive?: boolean;
    nextConsecutive?: number;
    prefix?: string;
    digits?: number;
  }, onProgress?: (current: number, total: number, phase: string) => void) {
    try {
      const res = await fetch(`${pb.baseUrl}/api/gravy/bulk-renumber-products`, {
        method: 'POST',
        headers: pb.headers(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
      if (res.status !== 404) {
        throw await pb._err(res);
      }
      console.warn('[bulkRenumberProducts] Endpoint /api/gravy/bulk-renumber-products retornó 404. Usando fallback por cliente PocketBase...');
    } catch (err: any) {
      if (err?.status && err.status !== 404) throw err;
      console.warn('[bulkRenumberProducts] Endpoint no disponible o no reiniciado aún, procediendo con fallback seguro:', err);
    }

    // ── FALLBACK CLIENTE DIRECTO (Robusto, en 2 fases atómicas) ───────────
    const items = payload.items || [];
    const total = items.length;
    const nowTs = Date.now();

    // Fase 1: Asignar códigos temporales para evitar colisión de claves únicas
    for (let i = 0; i < total; i++) {
      const it = items[i];
      if (onProgress) onProgress(i + 1, total, 'Fase 1/2: Asignando claves temporales');
      const safeType = String((it as any).type || '').toUpperCase().includes('SERV') ? 'SERVICIO' : 'BIEN';
      await pb.update('products', it.id, { code: `__TMP_REN__${it.id}_${nowTs}`, type: safeType });
    }

    // Fase 2: Asignar nuevos códigos definitivos
    for (let i = 0; i < total; i++) {
      const it = items[i];
      if (onProgress) onProgress(i + 1, total, 'Fase 2/2: Aplicando nuevas referencias');
      const safeType = String((it as any).type || '').toUpperCase().includes('SERV') ? 'SERVICIO' : 'BIEN';
      await pb.update('products', it.id, { code: String(it.newCode).trim(), type: safeType });
    }

    // Fase 3: Sincronizar consecutivo en settings si se solicitó
    if (payload.updateConsecutive) {
      try {
        const rawCfg = await this.getSetting('product_config_v1');
        let currentCfg: any = { auto_code: true, prefix: payload.prefix || '', digits: payload.digits || 4, consecutive: payload.nextConsecutive || (total + 1) };
        if (rawCfg) {
          try {
            const parsed = JSON.parse(rawCfg);
            currentCfg = { ...parsed, prefix: payload.prefix !== undefined ? payload.prefix : parsed.prefix, digits: payload.digits !== undefined ? payload.digits : parsed.digits, consecutive: payload.nextConsecutive || (total + 1) };
          } catch (_) {}
        }
        await this.setSetting('product_config_v1', JSON.stringify(currentCfg));
      } catch (cfgErr) {
        console.warn('[bulkRenumberProducts] Advertencia sincronizando product_config_v1:', cfgErr);
      }
    }

    // Fase 4: Registro en log de auditoría
    try {
      const firstCode = items[0]?.newCode || '';
      const lastCode = items[total - 1]?.newCode || '';
      await this.logAudit('RENUMBER', 'Producto', 'bulk', `Renumeración masiva de ${total} productos aplicada (Rango: ${firstCode} a ${lastCode}).`);
    } catch (_) {}

    return {
      success: true,
      count: total,
      message: `Se renumeraron exitosamente ${total} referencias de productos.`
    };
  },
};

// --- VITE MIGRATION GLOBALS ---
(window as any).pb = pb;
(window as any).API = API;
(window as any).PB_URL = (window as any).PB_URL || window.location.origin;

export { API, pb };
