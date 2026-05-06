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
      const user = pb.currentUser || {};
      await pb.create('audit_log', {
        user_id: user.id || null,
        username: user.email || user.full_name || 'system',
        action: String(action || ''),
        entity: String(entity || ''),
        entity_id: entityId ? String(entityId) : '',
        event_at: nowStr(),
        details: String(details || ''),
        ip: '',
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
      // El n�mero se asigna en hook server-side al crear transactions.
      number: txData.number || 'AUTO',
      status: 'active',
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
    for (const l of txLines) {
      const safeLine = pb.escapeFilterValue(l.id);
      const bm = await pb.list('bank_movements', { filter: `tx_line_id="${safeLine}" && reconciled=true`, perPage: 1 });
      reconCount += bm.totalItems;
    }
    if (reconCount > 0) {
      warnings.push(`Tiene ${reconCount} movimiento(s) bancario(s) conciliado(s). Revisa la conciliación bancaria después de modificar.`);
    }

    return { blocks, warnings };
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
};
