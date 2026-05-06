/**
 * GRAVY v2.0 — utilidades.js
 * Módulo de Utilidades: herramientas de administración y mantenimiento.
 */
'use strict';

/* ── Colecciones que forman parte del backup ─────────────── */
const BACKUP_COLLECTIONS = [
  { name: 'settings',          label: 'Configuración' },
  { name: 'account_types',     label: 'Tipos de cuenta' },
  { name: 'accounts',          label: 'Plan de cuentas' },
  { name: 'third_parties',     label: 'Terceros' },
  { name: 'transaction_types', label: 'Tipos de transacción' },
  { name: 'transactions',      label: 'Transacciones' },
  { name: 'tx_lines',          label: 'Líneas de transacción' },
  { name: 'bank_accounts',     label: 'Cuentas bancarias' },
  { name: 'bank_movements',    label: 'Movimientos bancarios' },
  { name: 'payroll_periods',   label: 'Períodos de nómina' },
  { name: 'payroll_employees', label: 'Empleados de nómina' },
  { name: 'payroll_items',     label: 'Ítems de nómina' },
  { name: 'audit_log',         label: 'Auditoría' },
];

const BACKUP_VERSION = '2.0';

/* ── Estado del módulo ───────────────────────────────────── */
let _backupInProgress = false;
let _restoreInProgress = false;
let _massTxImportInProgress = false;
let _massTpImportInProgress = false;
let _massAccImportInProgress = false;

/* ══════════════════════════════════════════════════════════
   RENDER PRINCIPAL
══════════════════════════════════════════════════════════ */
async function renderUtilidades(container) {
  container.innerHTML = `
    <div class="anim-slide-up">
      <!-- Cabecera -->
      <div class="flex items-center gap-4 mb-6">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center"
             style="background:linear-gradient(135deg,#E87D1E,#C46516)">
          <i class="fas fa-toolbox text-white text-xl"></i>
        </div>
        <div>
          <h2 class="text-xl font-extrabold" style="color:#0D2137">Utilidades</h2>
          <p class="text-sm" style="color:#6B7280">Herramientas de administración y mantenimiento del sistema</p>
        </div>
      </div>

      <!-- Grid de tarjetas de utilidades -->
      <div class="grid gap-6" style="grid-template-columns:repeat(auto-fill,minmax(340px,1fr))">

        <!-- ── Tarjeta: Backup ──────────────────────────── -->
        <div class="stat-card blue" id="util-card-backup">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   style="background:rgba(46,107,166,.12)">
                <i class="fas fa-database" style="color:#1A4B8C;font-size:18px"></i>
              </div>
              <div>
                <h3 class="font-bold text-base" style="color:#0D2137">Respaldo de datos</h3>
                <p class="text-xs" style="color:#6B7280">Exportar e importar toda la información</p>
              </div>
            </div>
          </div>

          <p class="text-sm mb-4" style="color:#4B5563;line-height:1.6">
            Genera un archivo de respaldo completo con todos los datos del sistema en formato JSON.
            El archivo puede usarse para restaurar la información en caso de pérdida o migración.
          </p>

          <!-- Info última copia -->
          <div id="backup-last-info" class="hidden mb-4 p-3 rounded-lg text-xs"
               style="background:#EFF6FF;border:1px solid #BFDBFE;color:#1E40AF">
            <i class="fas fa-clock-rotate-left mr-1"></i>
            <span id="backup-last-text"></span>
          </div>

          <!-- Barra de progreso -->
          <div id="backup-progress-wrap" class="hidden mb-4">
            <div class="flex justify-between text-xs mb-1" style="color:#6B7280">
              <span id="backup-progress-label">Preparando...</span>
              <span id="backup-progress-pct">0%</span>
            </div>
            <div class="w-full rounded-full h-2" style="background:#E5E7EB">
              <div id="backup-progress-bar" class="h-2 rounded-full transition-all"
                   style="background:linear-gradient(90deg,#2E6BA6,#E87D1E);width:0%"></div>
            </div>
          </div>

          <div class="flex gap-3 flex-wrap">
            <button id="btn-backup-create" class="btn btn-secondary btn-sm">
              <i class="fas fa-download"></i> Crear respaldo
            </button>
            <button id="btn-backup-restore" class="btn btn-outline btn-sm">
              <i class="fas fa-upload"></i> Restaurar respaldo
            </button>
          </div>
          <!-- Input oculto para selección de archivo -->
          <input type="file" id="backup-file-input" accept=".json" class="hidden">
        </div>

        <!-- ── Tarjeta: Información del sistema ─────────── -->
        <div class="stat-card orange" id="util-card-sysinfo">
          <div class="flex items-start gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                 style="background:rgba(232,125,30,.12)">
              <i class="fas fa-circle-info" style="color:#C46516;font-size:18px"></i>
            </div>
            <div>
              <h3 class="font-bold text-base" style="color:#0D2137">Información del sistema</h3>
              <p class="text-xs" style="color:#6B7280">Estado y estadísticas generales</p>
            </div>
          </div>
          <div id="sysinfo-content">
            <div class="flex items-center gap-2 text-sm" style="color:#9CA3AF">
              <i class="fas fa-spinner fa-spin"></i> Cargando...
            </div>
          </div>
        </div>

        <!-- ── Tarjeta: Carga masiva de transacciones ───── -->
        <div class="stat-card green" id="util-card-mass-tx">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   style="background:rgba(16,185,129,.12)">
                <i class="fas fa-file-import" style="color:#059669;font-size:18px"></i>
              </div>
              <div>
                <h3 class="font-bold text-base" style="color:#0D2137">Carga masiva de transacciones</h3>
                <p class="text-xs" style="color:#6B7280">Importa comprobantes contables desde CSV o Excel</p>
              </div>
            </div>
          </div>

          <p class="text-sm mb-4" style="color:#4B5563;line-height:1.6">
            Registra comprobantes en lote usando una plantilla estandar. El sistema valida período,
            cuentas de movimiento, tercero obligatorio y balance débito/crédito antes de grabar.
          </p>

          <div class="flex gap-3 flex-wrap">
            <button id="btn-mass-tx-template" class="btn btn-outline btn-sm">
              <i class="fas fa-download"></i> Descargar plantilla
            </button>
            <button id="btn-mass-tx-open" class="btn btn-secondary btn-sm">
              <i class="fas fa-upload"></i> Cargar archivo
            </button>
          </div>
        </div>

        <!-- ── Tarjeta: Carga masiva de cuentas ─────────── -->
        <div class="stat-card purple" id="util-card-mass-acc">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   style="background:rgba(124,58,237,.12)">
                <i class="fas fa-list-tree" style="color:#6D28D9;font-size:18px"></i>
              </div>
              <div>
                <h3 class="font-bold text-base" style="color:#0D2137">Carga masiva de cuentas</h3>
                <p class="text-xs" style="color:#6B7280">Importa el plan de cuentas desde CSV o Excel</p>
              </div>
            </div>
          </div>

          <p class="text-sm mb-4" style="color:#4B5563;line-height:1.6">
            Crea o actualiza cuentas en lote usando una plantilla estándar. Si el código ya existe
            la cuenta se actualiza; si no existe, se crea automáticamente.
          </p>

          <div class="flex gap-3 flex-wrap">
            <button id="btn-mass-acc-template" class="btn btn-outline btn-sm">
              <i class="fas fa-download"></i> Descargar plantilla
            </button>
            <button id="btn-mass-acc-open" class="btn btn-secondary btn-sm">
              <i class="fas fa-upload"></i> Cargar archivo
            </button>
          </div>
        </div>

        <!-- ── Tarjeta: Carga masiva de terceros ────────── -->
        <div class="stat-card red" id="util-card-mass-tp">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   style="background:rgba(59,130,246,.12)">
                <i class="fas fa-users" style="color:#1D4ED8;font-size:18px"></i>
              </div>
              <div>
                <h3 class="font-bold text-base" style="color:#0D2137">Carga masiva de terceros</h3>
                <p class="text-xs" style="color:#6B7280">Importa clientes, proveedores y más desde CSV o Excel</p>
              </div>
            </div>
          </div>

          <p class="text-sm mb-4" style="color:#4B5563;line-height:1.6">
            Registra terceros en lote usando una plantilla estándar. El sistema valida documento,
            nombre y tipo antes de grabar. Los duplicados (mismo NIT/documento) se actualizan.
          </p>

          <div class="flex gap-3 flex-wrap">
            <button id="btn-mass-tp-template" class="btn btn-outline btn-sm">
              <i class="fas fa-download"></i> Descargar plantilla
            </button>
            <button id="btn-mass-tp-open" class="btn btn-secondary btn-sm">
              <i class="fas fa-upload"></i> Cargar archivo
            </button>
          </div>
        </div>

      </div>
    </div>`;

  _backupInProgress = false;
  _restoreInProgress = false;
  _massTxImportInProgress = false;
  _massTpImportInProgress = false;
  _massAccImportInProgress = false;

  // Cargar última info de respaldo guardada localmente
  _loadLastBackupInfo();

  // Cargar estadísticas del sistema
  _loadSysInfo();

  // Listeners
  $('#btn-backup-create')?.addEventListener('click', _handleCreateBackup);
  $('#btn-backup-restore')?.addEventListener('click', () => $('#backup-file-input')?.click());
  $('#backup-file-input')?.addEventListener('change', _handleRestoreFileSelected);
  $('#btn-mass-tx-template')?.addEventListener('click', _downloadMassTxTemplate);
  $('#btn-mass-tx-open')?.addEventListener('click', _openMassTxImportModal);
  $('#btn-mass-tp-template')?.addEventListener('click', _downloadMassTpTemplate);
  $('#btn-mass-tp-open')?.addEventListener('click', _openMassTpImportModal);
  $('#btn-mass-acc-template')?.addEventListener('click', _downloadMassAccTemplate);
  $('#btn-mass-acc-open')?.addEventListener('click', _openMassAccImportModal);
}

/* ── Información del último backup (localStorage) ──────── */
function _loadLastBackupInfo() {
  const last = localStorage.getItem('gravy_last_backup') || localStorage.getItem('contaco_last_backup');
  if (!last) return;
  try {
    const info = JSON.parse(last);
    const el = $('#backup-last-info');
    const txt = $('#backup-last-text');
    if (el && txt) {
      txt.textContent = `Último respaldo: ${info.label} — ${info.records} registros`;
      el.classList.remove('hidden');
    }
  } catch { /* ignore */ }
}

/* ── Estadísticas del sistema ───────────────────────────── */
async function _loadSysInfo() {
  const el = $('#sysinfo-content');
  if (!el) return;

  const stats = await Promise.all(
    ['accounts', 'third_parties', 'transactions', 'tx_lines'].map(async col => {
      try {
        const r = await pb.list(col, { perPage: 1, page: 1 });
        return { col, total: r.totalItems };
      } catch { return { col, total: '—' }; }
    })
  );

  const labels = {
    accounts:      'Cuentas contables',
    third_parties: 'Terceros',
    transactions:  'Transacciones',
    tx_lines:      'Líneas contables',
  };

  el.innerHTML = stats.map(s => `
    <div class="flex items-center justify-between py-2 border-b last:border-0" style="border-color:#F3F4F6">
      <span class="text-sm" style="color:#374151">${labels[s.col]}</span>
      <span class="font-bold text-sm" style="color:#E87D1E">${typeof s.total === 'number' ? s.total.toLocaleString('es-CO') : s.total}</span>
    </div>
  `).join('') + `
    <div class="flex items-center justify-between pt-3 mt-1">
      <span class="text-xs" style="color:#9CA3AF">Versión GRAVY</span>
      <span class="badge badge-orange">v${BACKUP_VERSION}</span>
    </div>`;
}

/* ══════════════════════════════════════════════════════════
   CREAR BACKUP
══════════════════════════════════════════════════════════ */
async function _handleCreateBackup() {
  if (_backupInProgress) return;
  _backupInProgress = true;

  const btn = $('#btn-backup-create');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...'; }

  const progressWrap  = $('#backup-progress-wrap');
  const progressBar   = $('#backup-progress-bar');
  const progressLabel = $('#backup-progress-label');
  const progressPct   = $('#backup-progress-pct');

  if (progressWrap) progressWrap.classList.remove('hidden');

  const setProgress = (label, pct) => {
    if (progressLabel) progressLabel.textContent = label;
    if (progressBar)   progressBar.style.width = `${pct}%`;
    if (progressPct)   progressPct.textContent  = `${Math.round(pct)}%`;
  };

  // Colecciones accesibles al usuario (algunas pueden estar restringidas por rol)
  const accessible = BACKUP_COLLECTIONS.filter(c => {
    // audit_log solo para admin/auditor
    if (c.name === 'audit_log' && !can('canViewAudit')) return false;
    return true;
  });

  const backup = {
    _meta: {
      version:    BACKUP_VERSION,
      created_at: new Date().toISOString(),
      app:        'GRAVY',
      user:       pb.currentUser?.email ?? 'desconocido',
    },
    collections: {},
  };

  let totalRecords = 0;

  try {
    for (let i = 0; i < accessible.length; i++) {
      const col = accessible[i];
      const pct = ((i / accessible.length) * 95);
      setProgress(`Exportando: ${col.label}...`, pct);

      try {
        const rows = await pb.listAll(col.name);
        backup.collections[col.name] = rows;
        totalRecords += rows.length;
      } catch (err) {
        // Colección no existe o sin permiso: omitir silenciosamente
        backup.collections[col.name] = [];
        console.warn(`[Backup] Colección omitida (${col.name}):`, err.message);
      }
    }

    setProgress('Generando archivo...', 97);

    // Serializar y descargar
    const json    = JSON.stringify(backup, null, 2);
    const blob    = new Blob([json], { type: 'application/json' });
    const url     = URL.createObjectURL(blob);
    const anchor  = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
    anchor.href     = url;
    anchor.download = `GRAVY_backup_${dateStr}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    setProgress('Completado', 100);

    // Guardar metadata del último backup
    const backupInfo = JSON.stringify({
      label:   new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }),
      records: totalRecords,
    });
    localStorage.setItem('gravy_last_backup', backupInfo);
    _loadLastBackupInfo();

    await API.logAudit('BACKUP_CREATED', 'sistema', null,
      `Respaldo manual: ${totalRecords} registros exportados`);

    showToast(`Respaldo creado exitosamente — ${totalRecords.toLocaleString('es-CO')} registros`, 'success');

  } catch (err) {
    showToast(`Error al generar respaldo: ${err.message}`, 'error');
    console.error('[Backup]', err);
  } finally {
    _backupInProgress = false;
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-download"></i> Crear respaldo'; }
    if (progressWrap) {
      setTimeout(() => progressWrap?.classList.add('hidden'), 2000);
    }
  }
}

/* ══════════════════════════════════════════════════════════
   RESTAURAR BACKUP
══════════════════════════════════════════════════════════ */
async function _handleRestoreFileSelected(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  // Limpiar el input para permitir reselección
  e.target.value = '';

  if (!can('canWrite') || !can('canDelete')) {
    showToast('No tienes permiso para restaurar un respaldo', 'error');
    return;
  }

  // Leer y validar el archivo primero
  let backup;
  try {
    const text = await file.text();
    backup = JSON.parse(text);
  } catch {
    showToast('El archivo no es un respaldo válido (JSON malformado)', 'error');
    return;
  }

  if (!backup._meta?.version || !backup.collections) {
    showToast('El archivo no corresponde a un respaldo de GRAVY', 'error');
    return;
  }

  // Confirmar con el usuario
  const meta      = backup._meta;
  const colCount  = Object.keys(backup.collections).length;
  const recCount  = Object.values(backup.collections).reduce((s, r) => s + (r?.length ?? 0), 0);

  openModal('Confirmar restauración', `
    <div class="flex flex-col gap-4">
      <div class="p-4 rounded-xl" style="background:#FEF3C7;border:1px solid #FCD34D">
        <div class="flex items-start gap-3">
          <i class="fas fa-triangle-exclamation mt-0.5" style="color:#D97706;font-size:18px"></i>
          <div>
            <p class="font-bold text-sm mb-1" style="color:#92400E">Advertencia: esta acción no se puede deshacer</p>
            <p class="text-sm" style="color:#78350F;line-height:1.6">
              La restauración <strong>reemplazará</strong> los datos existentes con los del respaldo.
              Los registros actuales que no existan en el respaldo <strong>no serán eliminados</strong>.
            </p>
          </div>
        </div>
      </div>
      <div class="rounded-xl p-4" style="background:#F8F9FB;border:1px solid #E5E7EB">
        <p class="text-xs font-bold uppercase mb-3" style="color:#6B7280;letter-spacing:.5px">Detalles del respaldo</p>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <span style="color:#6B7280">Versión:</span><strong style="color:#0D2137">${esc(meta.version)}</strong>
          <span style="color:#6B7280">Fecha:</span><strong style="color:#0D2137">${esc(new Date(meta.created_at).toLocaleString('es-CO'))}</strong>
          <span style="color:#6B7280">Generado por:</span><strong style="color:#0D2137">${esc(meta.user)}</strong>
          <span style="color:#6B7280">Colecciones:</span><strong style="color:#0D2137">${colCount}</strong>
          <span style="color:#6B7280">Registros totales:</span><strong style="color:#E87D1E">${recCount.toLocaleString('es-CO')}</strong>
        </div>
      </div>
      <p class="text-sm text-center" style="color:#374151">¿Deseas continuar con la restauración?</p>
    </div>`,
  [
    { label: 'Cancelar',   class: 'btn-outline',  action: () => closeModal() },
    { label: 'Restaurar',  class: 'btn-danger',   action: () => _doRestore(backup) },
  ]);
}

async function _doRestore(backup) {
  if (_restoreInProgress) return;
  _restoreInProgress = true;
  closeModal();

  showToast('Iniciando restauración...', 'info');

  // Orden de restauración respetando dependencias
  const ORDER = [
    'settings',
    'account_types',
    'accounts',
    'third_parties',
    'transaction_types',
    'transactions',
    'tx_lines',
    'bank_accounts',
    'bank_movements',
    'payroll_periods',
    'payroll_employees',
    'payroll_items',
  ];

  let restored = 0;
  let skipped  = 0;
  let errors   = 0;

  for (const colName of ORDER) {
    const rows = backup.collections[colName];
    if (!Array.isArray(rows) || rows.length === 0) continue;

    for (const row of rows) {
      try {
        // Intentar actualizar; si no existe, crear
        try {
          await pb.update(colName, row.id, row);
        } catch (updateErr) {
          if (updateErr.status === 404) {
            await pb.create(colName, row);
          } else {
            throw updateErr;
          }
        }
        restored++;
      } catch (err) {
        skipped++;
        if (err.status !== 400) errors++;
        console.warn(`[Restore] ${colName}/${row.id}:`, err.message);
      }
    }
  }

  await API.logAudit('BACKUP_RESTORED', 'sistema', null,
    `Restauración desde respaldo: ${restored} restaurados, ${skipped} omitidos`);

  const msg = `Restauración completada — ${restored} registros restaurados, ${skipped} omitidos`;
  showToast(msg, errors > 10 ? 'warning' : 'success');
  _restoreInProgress = false;

  // Recargar estadísticas
  _loadSysInfo();
}

/* ══════════════════════════════════════════════════════════
   CARGA MASIVA DE TRANSACCIONES
══════════════════════════════════════════════════════════ */
function _downloadMassTxTemplate() {
  const header = [
    'grupo',
    'fecha',
    'tipo',
    'descripcion',
    'tercero',
    'plazo_dias',
    'cuenta',
    'debito',
    'credito',
    'tercero_linea',
    'descripcion_linea',
    'doc_cruce',
  ].join(',');

  const rows = [
    'CMP-001,2026-05-01,RC,Registro recaudo factura FV-1001,900123456,0,111005,1500000,0,900123456,Ingreso por recaudo,FV-1001',
    'CMP-001,2026-05-01,RC,Registro recaudo factura FV-1001,900123456,0,130505,0,1500000,900123456,Cruce cartera cliente,FV-1001',
    'CMP-002,2026-05-02,CE,Pago proveedor factura FC-888,901234567,30,220501,450000,0,901234567,Cruce CxP proveedor,FC-888',
    'CMP-002,2026-05-02,CE,Pago proveedor factura FC-888,901234567,30,111005,0,450000,901234567,Salida de caja,FC-888',
  ].join('\n');

  const blob = new Blob([`${header}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_carga_transacciones.csv';
  a.click();
  URL.revokeObjectURL(url);
}

async function _openMassTxImportModal() {
  if (!can('canWrite')) return showToast('No tienes permisos para importar transacciones', 'error');

  openModal(
    '<i class="fas fa-file-import mr-2" style="color:#059669"></i>Carga masiva de transacciones',
    `
    <div class="mb-2">
      <p class="text-sm mb-3" style="color:#374151">
        Carga un archivo <strong>CSV</strong> o <strong>Excel (.xlsx/.xls)</strong> con líneas contables agrupadas por comprobante.
        Cada <strong>grupo</strong> representa un comprobante y debe quedar cuadrado (débito = crédito).
      </p>
      <div class="rounded-xl p-3 mb-3" style="background:#ECFDF5;border:1px solid #A7F3D0">
        <p class="text-xs font-semibold mb-1" style="color:#047857;text-transform:uppercase;letter-spacing:.05em">Columnas requeridas</p>
        <div class="flex flex-wrap gap-2 mb-2">
          ${['grupo','fecha','tipo','descripcion','cuenta'].map(c => `<code class="text-xs px-2 py-0.5 rounded" style="background:#D1FAE5;color:#065F46">${c}</code>`).join('')}
          ${['debito','credito','tercero','plazo_dias','tercero_linea','descripcion_linea','doc_cruce'].map(c => `<code class="text-xs px-2 py-0.5 rounded" style="background:#F3F4F6;color:#6B7280">${c} <span style="font-size:.65rem">(opcional)</span></code>`).join('')}
        </div>
        <p class="text-xs" style="color:#065F46">
          <strong>tipo</strong>: prefijo o código del tipo de transacción. <strong>cuenta</strong>: código contable.
          <strong>tercero</strong> y <strong>tercero_linea</strong>: documento/NIT del tercero.
        </p>
      </div>

      <div id="mass-tx-drop-zone" class="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer transition-all" style="border-color:#D1D5DB;background:#FAFAFA">
        <i class="fas fa-cloud-arrow-up text-3xl mb-3" style="color:#9CA3AF"></i>
        <p class="text-sm font-medium" style="color:#374151">Arrastra tu archivo aquí o <span style="color:#1A4B8C;text-decoration:underline">haz clic para seleccionar</span></p>
        <p class="text-xs mt-1" style="color:#9CA3AF">CSV · XLSX · XLS — máx. 8 MB</p>
        <input type="file" id="mass-tx-file-input" accept=".csv,.xlsx,.xls" class="hidden">
      </div>

      <div id="mass-tx-progress-wrap" class="hidden mt-4">
        <div class="w-full rounded-full h-2" style="background:#E5E7EB">
          <div id="mass-tx-progress-bar" class="h-2 rounded-full transition-all" style="background:linear-gradient(90deg,#059669,#1A4B8C);width:0%"></div>
        </div>
        <p id="mass-tx-progress-text" class="text-xs mt-2" style="color:#6B7280">Preparando...</p>
      </div>

      <div id="mass-tx-preview" class="mt-4 hidden">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-semibold" style="color:#0D2137">Vista previa de comprobantes</p>
          <button class="btn btn-outline btn-sm" id="btn-mass-tx-clear"><i class="fas fa-xmark mr-1"></i>Limpiar</button>
        </div>
        <div class="rounded-xl border overflow-hidden" style="border-color:#F0F0F0;max-height:320px;overflow-y:auto">
          <table class="data-table text-xs" id="mass-tx-preview-table">
            <thead><tr>
              <th>Grupo</th><th>Fecha</th><th>Tipo</th><th>Líneas</th><th>Débito</th><th>Crédito</th><th>Estado</th><th>Detalle</th>
            </tr></thead>
            <tbody id="mass-tx-preview-body"></tbody>
          </table>
        </div>
        <div id="mass-tx-summary" class="mt-2 text-xs" style="color:#6B7280"></div>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary hidden" id="btn-mass-tx-run"><i class="fas fa-bolt mr-1"></i>Ejecutar carga</button>`,
    true
  );

  let parsedGroups = [];

  const dropZone = $('#mass-tx-drop-zone');
  const fileInput = $('#mass-tx-file-input');
  const runBtn = $('#btn-mass-tx-run');
  const clearBtn = $('#btn-mass-tx-clear');

  const resetPreview = () => {
    parsedGroups = [];
    $('#mass-tx-preview')?.classList.add('hidden');
    runBtn?.classList.add('hidden');
    const body = $('#mass-tx-preview-body');
    if (body) body.innerHTML = '';
    const summary = $('#mass-tx-summary');
    if (summary) summary.innerHTML = '';
    if (fileInput) fileInput.value = '';
  };

  const setDropDefault = () => {
    if (!dropZone) return;
    dropZone.style.borderColor = '#D1D5DB';
    dropZone.style.background = '#FAFAFA';
  };

  dropZone?.addEventListener('click', () => fileInput?.click());
  dropZone?.addEventListener('dragover', e => {
    e.preventDefault();
    if (!dropZone) return;
    dropZone.style.borderColor = '#1A4B8C';
    dropZone.style.background = '#EFF6FF';
  });
  dropZone?.addEventListener('dragleave', () => setDropDefault());
  dropZone?.addEventListener('drop', e => {
    e.preventDefault();
    setDropDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  });

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) processFile(file);
  });

  clearBtn?.addEventListener('click', resetPreview);
  runBtn?.addEventListener('click', () => _executeMassTxImport(parsedGroups));

  async function processFile(file) {
    if (file.size > 8 * 1024 * 1024) return showToast('El archivo supera el límite de 8 MB', 'error');

    const ext = String(file.name.split('.').pop() || '').toLowerCase();
    let rawRows = [];

    try {
      if (ext === 'csv') {
        rawRows = _massTxParseCsv(await file.text());
      } else if (ext === 'xlsx' || ext === 'xls') {
        rawRows = _massTxParseExcel(await file.arrayBuffer());
      } else {
        return showToast('Formato no soportado. Usa CSV, XLSX o XLS.', 'error');
      }
    } catch (err) {
      return showToast(`Error al leer el archivo: ${err.message}`, 'error');
    }

    if (!rawRows.length) return showToast('El archivo no contiene datos', 'warning');

    parsedGroups = await _massTxBuildDraft(rawRows);
    _massTxRenderPreview(parsedGroups);
  }
}

function _massTxNormHeader(key) {
  return String(key || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .trim();
}

function _massTxParseCsv(text) {
  const lines = String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter(l => l.trim());
  if (!lines.length) return [];

  const split = (line) => {
    const fields = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (ch === ',' && !inQuotes) {
        fields.push(cur.trim());
        cur = '';
        continue;
      }
      cur += ch;
    }
    fields.push(cur.trim());
    return fields;
  };

  const headers = split(lines[0]).map(_massTxNormHeader);
  return lines.slice(1).map(line => {
    const vals = split(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = String(vals[i] ?? '').trim(); });
    return row;
  });
}

function _massTxParseExcel(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
  return rows.map(r => {
    const row = {};
    Object.entries(r).forEach(([k, v]) => {
      row[_massTxNormHeader(k)] = String(v ?? '').trim();
    });
    return row;
  });
}

function _massTxPick(raw, keys) {
  for (const k of keys) {
    const v = raw[k];
    if (v !== undefined && String(v).trim() !== '') return String(v).trim();
  }
  return '';
}

function _massTxDocKey(v) {
  return String(v || '').replace(/[^0-9a-z]/gi, '').toUpperCase();
}

function _massTxNum(v) {
  if (v === null || v === undefined || v === '') return 0;
  let s = String(v).trim();
  if (!s) return 0;
  if (s.includes(',') && s.includes('.')) {
    s = s.replace(/,/g, '');
  } else if (s.includes(',') && !s.includes('.')) {
    s = s.replace(/,/g, '.');
  }
  s = s.replace(/[^0-9.\-]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

async function _massTxBuildDraft(rawRows) {
  const [accounts, txTypes, terceros] = await Promise.all([
    API.getAccounts(true),
    API.getTxTypes(),
    API.getTerceros({}),
  ]);

  const parentCodes = new Set(accounts.map(a => a.parent_code).filter(Boolean));
  const postableIds = new Set(accounts.filter(a => !parentCodes.has(a.code)).map(a => a.id));
  const accByCode = new Map(accounts.map(a => [String(a.code || '').trim(), a]));

  const txTypeByKey = new Map();
  txTypes.forEach(t => {
    txTypeByKey.set(String(t.prefix || '').toUpperCase(), t);
    txTypeByKey.set(String(t.code || '').toUpperCase(), t);
    txTypeByKey.set(String(t.id || '').toUpperCase(), t);
  });

  const thirdByDoc = new Map();
  terceros.forEach(t => {
    const key = _massTxDocKey(t.doc_number);
    if (key) thirdByDoc.set(key, t);
  });

  const groups = new Map();
  const upsertHdr = (g, field, val, label, rowNo) => {
    if (!val) return;
    if (!g[field]) {
      g[field] = val;
      return;
    }
    if (g[field] !== val) {
      g.errors.push(`Fila ${rowNo}: valor inconsistente en ${label} ("${g[field]}" vs "${val}")`);
    }
  };

  for (let i = 0; i < rawRows.length; i++) {
    const raw = rawRows[i] || {};
    const rowNo = i + 2;
    const group = _massTxPick(raw, ['grupo', 'tx_group', 'comprobante', 'grupo_tx']);
    if (!group) continue;

    if (!groups.has(group)) {
      groups.set(group, {
        group,
        txDate: '',
        txType: '',
        txDesc: '',
        thirdDoc: '',
        paymentDays: '0',
        lines: [],
        errors: [],
      });
    }

    const g = groups.get(group);
    upsertHdr(g, 'txDate', _massTxPick(raw, ['fecha', 'date', 'tx_date']), 'fecha', rowNo);
    upsertHdr(g, 'txType', _massTxPick(raw, ['tipo', 'tx_type', 'tipo_tx']), 'tipo', rowNo);
    upsertHdr(g, 'txDesc', _massTxPick(raw, ['descripcion', 'description', 'detalle']), 'descripcion', rowNo);
    upsertHdr(g, 'thirdDoc', _massTxPick(raw, ['tercero', 'tercero_doc', 'nit_tercero', 'doc_tercero']), 'tercero', rowNo);
    upsertHdr(g, 'paymentDays', _massTxPick(raw, ['plazo_dias', 'payment_days', 'dias_pago']), 'plazo_dias', rowNo);

    const accountCode = _massTxPick(raw, ['cuenta', 'account', 'codigo_cuenta', 'account_code']);
    const debit = _massTxNum(_massTxPick(raw, ['debito', 'debit']));
    const credit = _massTxNum(_massTxPick(raw, ['credito', 'credit']));
    const lineThirdDoc = _massTxPick(raw, ['tercero_linea', 'line_third', 'tercero_line']);
    const lineDesc = _massTxPick(raw, ['descripcion_linea', 'line_description', 'detalle_linea']);
    const crossDoc = _massTxPick(raw, ['doc_cruce', 'cross_doc_ref', 'documento_cruce']);

    g.lines.push({
      rowNo,
      accountCode,
      debit,
      credit,
      lineThirdDoc,
      lineDesc,
      crossDoc,
    });
  }

  const periodCache = new Map();
  const result = [];

  for (const g of groups.values()) {
    const groupErrors = [...g.errors];

    if (!g.txDate) groupErrors.push('Falta fecha del comprobante');
    if (!g.txType) groupErrors.push('Falta tipo del comprobante');
    if (!g.txDesc) groupErrors.push('Falta descripción del comprobante');

    const txType = txTypeByKey.get(String(g.txType || '').toUpperCase());
    if (!txType) groupErrors.push(`Tipo de transacción no encontrado: ${g.txType || '(vacío)'}`);

    let txThird = null;
    if (g.thirdDoc) {
      txThird = thirdByDoc.get(_massTxDocKey(g.thirdDoc));
      if (!txThird) groupErrors.push(`Tercero no encontrado (encabezado): ${g.thirdDoc}`);
    }

    if (g.txDate) {
      const periodKey = g.txDate.slice(0, 7);
      if (!periodCache.has(periodKey)) {
        let isClosed = false;
        if (typeof isPeriodClosed === 'function') {
          isClosed = await isPeriodClosed(g.txDate);
        }
        periodCache.set(periodKey, isClosed);
      }
      if (periodCache.get(periodKey)) {
        groupErrors.push(`El período ${periodKey} no está habilitado o está cerrado`);
      }
    }

    const validLines = [];
    for (const line of g.lines) {
      const acc = accByCode.get(String(line.accountCode || '').trim());
      if (!line.accountCode) {
        groupErrors.push(`Fila ${line.rowNo}: falta cuenta`);
        continue;
      }
      if (!acc) {
        groupErrors.push(`Fila ${line.rowNo}: cuenta no encontrada (${line.accountCode})`);
        continue;
      }
      if (!postableIds.has(acc.id)) {
        groupErrors.push(`Fila ${line.rowNo}: la cuenta ${acc.code} es de mayor; usa una cuenta auxiliar`);
      }

      const hasDebit = Number(line.debit || 0) > 0;
      const hasCredit = Number(line.credit || 0) > 0;
      if (hasDebit && hasCredit) {
        groupErrors.push(`Fila ${line.rowNo}: no puede tener débito y crédito al mismo tiempo`);
      }
      if (!hasDebit && !hasCredit) {
        groupErrors.push(`Fila ${line.rowNo}: debes registrar débito o crédito`);
      }

      let lineThird = null;
      if (line.lineThirdDoc) {
        lineThird = thirdByDoc.get(_massTxDocKey(line.lineThirdDoc));
        if (!lineThird) {
          groupErrors.push(`Fila ${line.rowNo}: tercero de línea no encontrado (${line.lineThirdDoc})`);
        }
      }

      if (acc.requires_third_party && !(lineThird?.id || txThird?.id)) {
        groupErrors.push(`Fila ${line.rowNo}: la cuenta ${acc.code} requiere tercero`);
      }

      validLines.push({
        rowNo: line.rowNo,
        account_id: acc.id,
        debit: Number(line.debit || 0),
        credit: Number(line.credit || 0),
        third_party_id: lineThird?.id || txThird?.id || null,
        description: line.lineDesc || g.txDesc,
        cross_doc_ref: line.crossDoc || '',
      });
    }

    const totals = validLines.reduce((acc, l) => {
      acc.debit += Number(l.debit || 0);
      acc.credit += Number(l.credit || 0);
      return acc;
    }, { debit: 0, credit: 0 });

    if (validLines.length < 2) groupErrors.push('Se requieren al menos 2 líneas contables válidas');
    if (Math.abs(totals.debit - totals.credit) > 0.0001 || totals.debit <= 0) {
      groupErrors.push('Comprobante descuadrado: débito y crédito no coinciden');
    }

    result.push({
      group: g.group,
      txDate: g.txDate,
      txTypeLabel: txType ? `${txType.prefix} - ${txType.name}` : (g.txType || '—'),
      linesCount: validLines.length,
      debit: totals.debit,
      credit: totals.credit,
      ok: groupErrors.length === 0,
      errors: groupErrors,
      payload: groupErrors.length ? null : {
        txData: {
          tx_type_id: txType.id,
          number: '',
          date: g.txDate,
          description: g.txDesc,
          third_party_id: txThird?.id || null,
          user_id: pb.currentUser?.id,
          payment_days: parseInt(g.paymentDays, 10) || 0,
          cross_enabled: validLines.some(l => !!l.cross_doc_ref),
          status: 'active',
        },
        lines: validLines.map((l, i) => ({
          account_id: l.account_id,
          third_party_id: l.third_party_id,
          debit: l.debit,
          credit: l.credit,
          description: l.description,
          line_order: i + 1,
          cross_doc_ref: l.cross_doc_ref,
        })),
      },
    });
  }

  // Orden estable para facilitar revisión visual
  return result.sort((a, b) => String(a.group).localeCompare(String(b.group)));
}

function _massTxRenderPreview(groups) {
  const preview = $('#mass-tx-preview');
  const tbody = $('#mass-tx-preview-body');
  const summary = $('#mass-tx-summary');
  const runBtn = $('#btn-mass-tx-run');
  if (!preview || !tbody || !summary || !runBtn) return;

  const okGroups = groups.filter(g => g.ok);
  const badGroups = groups.filter(g => !g.ok);

  tbody.innerHTML = groups.map(g => {
    const detail = g.ok ? 'Validado' : (g.errors[0] || 'Error de validación');
    return `
      <tr ${g.ok ? '' : 'style="background:#FFF7F7"'}>
        <td>${esc(g.group)}</td>
        <td>${esc(g.txDate || '—')}</td>
        <td>${esc(g.txTypeLabel || '—')}</td>
        <td>${g.linesCount}</td>
        <td>${fmt(g.debit)}</td>
        <td>${fmt(g.credit)}</td>
        <td>${g.ok
          ? '<span class="badge badge-green">OK</span>'
          : '<span class="badge badge-red">Error</span>'}</td>
        <td class="text-xs" style="max-width:360px;white-space:normal">${esc(detail)}</td>
      </tr>`;
  }).join('');

  summary.innerHTML = `
    <span style="color:${badGroups.length ? '#B91C1C' : '#166534'}">
      ${groups.length} comprobante(s): ${okGroups.length} válido(s), ${badGroups.length} con error.
      ${badGroups.length ? 'Solo se procesarán los válidos.' : 'Listo para ejecutar.'}
    </span>`;

  preview.classList.remove('hidden');
  if (okGroups.length) runBtn.classList.remove('hidden');
  else runBtn.classList.add('hidden');
}

async function _executeMassTxImport(groups) {
  if (_massTxImportInProgress) return;
  if (!Array.isArray(groups) || !groups.length) return;

  const valids = groups.filter(g => g.ok && g.payload);
  if (!valids.length) return showToast('No hay comprobantes válidos para importar', 'warning');

  _massTxImportInProgress = true;

  const runBtn = $('#btn-mass-tx-run');
  const progressWrap = $('#mass-tx-progress-wrap');
  const progressBar = $('#mass-tx-progress-bar');
  const progressText = $('#mass-tx-progress-text');
  if (runBtn) {
    runBtn.disabled = true;
    runBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Importando...';
  }
  progressWrap?.classList.remove('hidden');

  let created = 0;
  let failed = 0;
  const failedGroups = [];

  try {
    for (let i = 0; i < valids.length; i++) {
      const draft = valids[i];
      const pct = ((i / valids.length) * 100);
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (progressText) progressText.textContent = `Procesando ${i + 1} de ${valids.length}: ${draft.group}`;

      try {
        await API.createTransaction(draft.payload.txData, draft.payload.lines);
        created++;
      } catch (err) {
        failed++;
        failedGroups.push(`${draft.group}: ${err.message}`);
      }
    }

    if (progressBar) progressBar.style.width = '100%';
    if (progressText) progressText.textContent = 'Proceso finalizado';

    await API.logAudit(
      'IMPORT',
      'transactions',
      'bulk',
      `Carga masiva: ${created} creadas, ${failed} con error de ${valids.length} comprobantes válidos`
    );

    if (failedGroups.length) {
      console.warn('[CargaMasivaTx] Errores:', failedGroups);
    }

    showToast(
      `Carga masiva finalizada: ${created} comprobante(s) creados${failed ? `, ${failed} con error` : ''}`,
      failed ? 'warning' : 'success',
      5500
    );

    _loadSysInfo();
  } finally {
    _massTxImportInProgress = false;
    if (runBtn) {
      runBtn.disabled = false;
      runBtn.innerHTML = '<i class="fas fa-bolt mr-1"></i>Ejecutar carga';
    }
  }
}

/* ══════════════════════════════════════════════════════════
   CARGA MASIVA DE TERCEROS
══════════════════════════════════════════════════════════ */
function _downloadMassTpTemplate() {
  const header = [
    'doc_type', 'doc_number', 'person_type', 'type', 'razon_social',
    'nombres', 'apellidos', 'email', 'phone', 'address',
    'dept_code', 'city_code', 'tax_regime', 'credit_limit',
    'payment_days', 'active',
  ].join(',');

  const rows = [
    'NIT,900123456,JURIDICA,CLIENTE,CERAMICAS CONSTRUHOGAR SAS,,,,3001234567,CR 8 73-25,68,68001,COMUN,5000000,30,Si',
    'CC,1234567890,NATURAL,PROVEEDOR,,JUAN CARLOS,PEREZ GOMEZ,juan@correo.com,3109876543,CL 45 12-30,05,05001,NO_RESP,0,0,Si',
    'NIT,800987654,JURIDICA,EMPLEADO,EMPRESA LOGISTICA SAS,,,,6012345678,AV 68 45-10,11,11001,COMUN,0,0,Si',
    'CC,9876543210,NATURAL,ACREEDOR,,MARIA ELENA,RODRIGUEZ SILVA,,3201112233,KR 15 80-20,76,76001,,0,0,Si',
  ].join('\n');

  const blob = new Blob([`${header}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_carga_terceros.csv';
  a.click();
  URL.revokeObjectURL(url);
}

async function _openMassTpImportModal() {
  if (!can('canWrite')) return showToast('No tienes permisos para importar terceros', 'error');

  openModal(
    '<i class="fas fa-users mr-2" style="color:#1D4ED8"></i>Carga masiva de terceros',
    `
    <div class="mb-2">
      <p class="text-sm mb-3" style="color:#374151">
        Carga un archivo <strong>CSV</strong> o <strong>Excel (.xlsx/.xls)</strong> con los terceros a registrar.
        Si el documento ya existe, el tercero será <strong>actualizado</strong>; si no existe, será <strong>creado</strong>.
      </p>
      <div class="rounded-xl p-3 mb-3" style="background:#EFF6FF;border:1px solid #BFDBFE">
        <p class="text-xs font-semibold mb-1" style="color:#1D4ED8;text-transform:uppercase;letter-spacing:.05em">Columnas requeridas</p>
        <div class="flex flex-wrap gap-2 mb-2">
          ${['doc_type','doc_number','person_type','type'].map(c => `<code class="text-xs px-2 py-0.5 rounded" style="background:#DBEAFE;color:#1E40AF">${c}</code>`).join('')}
          ${['razon_social','nombres','apellidos','email','phone','address','dept_code','city_code','tax_regime','credit_limit','payment_days','active'].map(c => `<code class="text-xs px-2 py-0.5 rounded" style="background:#F3F4F6;color:#6B7280">${c} <span style="font-size:.65rem">(opcional)</span></code>`).join('')}
        </div>
        <p class="text-xs" style="color:#1E40AF">
          <strong>doc_type</strong>: NIT, CC, CE, TI, PAS, RC.&nbsp;
          <strong>person_type</strong>: NATURAL, JURIDICA, GRAN_CONTRIBUYENTE.&nbsp;
          <strong>type</strong>: CLIENTE, PROVEEDOR, EMPLEADO, ACREEDOR, TRANSPORTISTA, OTRO.
        </p>
      </div>

      <div id="mass-tp-drop-zone" class="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer transition-all" style="border-color:#D1D5DB;background:#FAFAFA">
        <i class="fas fa-cloud-arrow-up text-3xl mb-3" style="color:#9CA3AF"></i>
        <p class="text-sm font-medium" style="color:#374151">Arrastra tu archivo aquí o <span style="color:#1A4B8C;text-decoration:underline">haz clic para seleccionar</span></p>
        <p class="text-xs mt-1" style="color:#9CA3AF">CSV · XLSX · XLS — máx. 8 MB</p>
        <input type="file" id="mass-tp-file-input" accept=".csv,.xlsx,.xls" class="hidden">
      </div>

      <div id="mass-tp-progress-wrap" class="hidden mt-4">
        <div class="w-full rounded-full h-2" style="background:#E5E7EB">
          <div id="mass-tp-progress-bar" class="h-2 rounded-full transition-all" style="background:linear-gradient(90deg,#1D4ED8,#7C3AED);width:0%"></div>
        </div>
        <p id="mass-tp-progress-text" class="text-xs mt-2" style="color:#6B7280">Preparando...</p>
      </div>

      <div id="mass-tp-preview" class="mt-4 hidden">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-semibold" style="color:#0D2137">Vista previa</p>
          <button class="btn btn-outline btn-sm" id="btn-mass-tp-clear"><i class="fas fa-xmark mr-1"></i>Limpiar</button>
        </div>
        <div class="rounded-xl border overflow-hidden" style="border-color:#F0F0F0;max-height:320px;overflow-y:auto">
          <table class="data-table text-xs" id="mass-tp-preview-table">
            <thead><tr>
              <th>#</th><th>Doc</th><th>Nombre / Razón Social</th><th>Tipo Persona</th><th>Rol</th><th>Email</th><th>Estado</th><th>Detalle</th>
            </tr></thead>
            <tbody id="mass-tp-preview-body"></tbody>
          </table>
        </div>
        <div id="mass-tp-summary" class="mt-2 text-xs" style="color:#6B7280"></div>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary hidden" id="btn-mass-tp-run"><i class="fas fa-bolt mr-1"></i>Ejecutar carga</button>`,
    true
  );

  let parsedRows = [];

  const dropZone = $('#mass-tp-drop-zone');
  const fileInput = $('#mass-tp-file-input');
  const runBtn = $('#btn-mass-tp-run');
  const clearBtn = $('#btn-mass-tp-clear');

  const resetPreview = () => {
    parsedRows = [];
    $('#mass-tp-preview')?.classList.add('hidden');
    runBtn?.classList.add('hidden');
    const body = $('#mass-tp-preview-body');
    if (body) body.innerHTML = '';
    const summary = $('#mass-tp-summary');
    if (summary) summary.innerHTML = '';
    if (fileInput) fileInput.value = '';
  };

  const dropDefault = () => {
    if (!dropZone) return;
    dropZone.style.borderColor = '#D1D5DB';
    dropZone.style.background = '#FAFAFA';
  };

  dropZone?.addEventListener('click', () => fileInput?.click());
  dropZone?.addEventListener('dragover', e => {
    e.preventDefault();
    if (!dropZone) return;
    dropZone.style.borderColor = '#1D4ED8';
    dropZone.style.background = '#EFF6FF';
  });
  dropZone?.addEventListener('dragleave', () => dropDefault());
  dropZone?.addEventListener('drop', e => {
    e.preventDefault();
    dropDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  });
  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) processFile(file);
  });
  clearBtn?.addEventListener('click', resetPreview);
  runBtn?.addEventListener('click', () => _executeMassTpImport(parsedRows));

  async function processFile(file) {
    if (file.size > 8 * 1024 * 1024) return showToast('El archivo supera el límite de 8 MB', 'error');
    const ext = String(file.name.split('.').pop() || '').toLowerCase();
    let rawRows = [];
    try {
      if (ext === 'csv') {
        rawRows = _massTxParseCsv(await file.text());
      } else if (ext === 'xlsx' || ext === 'xls') {
        rawRows = _massTxParseExcel(await file.arrayBuffer());
      } else {
        return showToast('Formato no soportado. Usa CSV, XLSX o XLS.', 'error');
      }
    } catch (err) {
      return showToast(`Error al leer el archivo: ${err.message}`, 'error');
    }
    if (!rawRows.length) return showToast('El archivo no contiene datos', 'warning');
    parsedRows = _massTpBuildDraft(rawRows);
    _massTpRenderPreview(parsedRows);
  }
}

/* Normaliza una fila a un draft de tercero { ok, payload, error, rowNo } */
function _massTpBuildDraft(rawRows) {
  const VALID_DOC_TYPES    = new Set(['NIT','CC','CE','TI','PAS','RC']);
  const VALID_PERSON_TYPES = new Set(['NATURAL','JURIDICA','GRAN_CONTRIBUYENTE']);
  const VALID_TP_TYPES     = new Set(['CLIENTE','PROVEEDOR','EMPLEADO','ACREEDOR','TRANSPORTISTA','OTRO']);

  return rawRows.map((raw, i) => {
    const rowNo = i + 2; // +2 porque fila 1 es cabecera
    const get = (...keys) => {
      for (const k of keys) {
        const v = raw[_massTxNormHeader(k)];
        if (v !== undefined && String(v).trim() !== '') return String(v).trim();
      }
      return '';
    };

    const docType    = get('doc_type','tipo_doc','tipo_documento').toUpperCase();
    const docNumber  = get('doc_number','numero_doc','nit','documento','doc').replace(/[^0-9a-zA-Z]/g, '');
    const personType = get('person_type','tipo_persona','persona').toUpperCase() || 'NATURAL';
    const tpType     = get('type','tipo','rol').toUpperCase() || 'CLIENTE';

    // Nombre
    const bizName   = get('razon_social','business_name','razon').toUpperCase();
    const firstName = get('nombres','first_name','nombre').toUpperCase();
    const lastName  = get('apellidos','last_name','apellido').toUpperCase();
    const isNatural = personType === 'NATURAL';
    const name = isNatural
      ? [firstName, lastName].filter(Boolean).join(' ')
      : bizName;

    // Opcionales
    const email       = get('email','correo');
    const phone       = get('phone','telefono','tel');
    const address     = get('address','direccion').toUpperCase();
    const deptCode    = get('dept_code','cod_dept','departamento_cod');
    const cityCode    = get('city_code','cod_mun','municipio_cod','ciudad_cod');
    const taxRegime   = get('tax_regime','regimen','tax').toUpperCase();
    const creditLimit = parseFloat(get('credit_limit','cupo_credito','cupo').replace(/[^0-9.]/g, '')) || 0;
    const payDays     = parseInt(get('payment_days','plazo_dias','plazo'), 10) || 0;
    const activeRaw   = get('active','activo','estado').toLowerCase();
    const active      = !/^(no|0|false|inactivo|inactiva)$/.test(activeRaw);

    // Dígito de verificación
    const dv = docType === 'NIT' ? calcDV(docNumber) : '';

    // Validaciones
    if (!docType)   return { ok: false, rowNo, error: `Fila ${rowNo}: falta doc_type` };
    if (!VALID_DOC_TYPES.has(docType))
      return { ok: false, rowNo, error: `Fila ${rowNo}: doc_type inválido (${docType})` };
    if (!docNumber) return { ok: false, rowNo, error: `Fila ${rowNo}: falta doc_number` };
    if (!VALID_PERSON_TYPES.has(personType))
      return { ok: false, rowNo, error: `Fila ${rowNo}: person_type inválido (${personType})` };
    if (!VALID_TP_TYPES.has(tpType))
      return { ok: false, rowNo, error: `Fila ${rowNo}: type inválido (${tpType})` };
    if (isNatural && !firstName && !lastName)
      return { ok: false, rowNo, error: `Fila ${rowNo}: persona natural requiere nombres o apellidos` };
    if (!isNatural && !bizName)
      return { ok: false, rowNo, error: `Fila ${rowNo}: persona jurídica requiere razon_social` };
    if (!name)
      return { ok: false, rowNo, error: `Fila ${rowNo}: no se pudo determinar el nombre` };

    // Validar dept_code si se suministra (solo para Colombia)
    let dept = '';
    let city = '';
    if (deptCode) {
      const deptRec = (typeof GEO_DEPTS !== 'undefined' ? GEO_DEPTS : []).find(d => d.code === deptCode);
      if (!deptRec)
        return { ok: false, rowNo, error: `Fila ${rowNo}: dept_code "${deptCode}" no encontrado` };
      dept = deptRec.name;
      if (cityCode) {
        const munis = typeof geoMunisByDept === 'function' ? geoMunisByDept(deptCode) : [];
        const muni = munis.find(m => m.code === cityCode);
        if (!muni)
          return { ok: false, rowNo, error: `Fila ${rowNo}: city_code "${cityCode}" no encontrado en dept ${deptCode}` };
        city = muni.name;
      }
    }

    const payload = {
      doc_type:        docType,
      doc_number:      docNumber,
      dv,
      person_type:     personType,
      type:            tpType,
      first_name:      firstName,
      last_name:       lastName,
      business_name:   bizName,
      commercial_name: '',
      name,
      email,
      email2:          '',
      phone,
      phone2:          '',
      contact_name:    '',
      advisor:         '',
      address,
      country:         deptCode ? 'CO' : '',
      department:      dept,
      dept_code:       deptCode,
      city,
      city_code:       cityCode,
      tax_regime:      taxRegime,
      credit_limit:    creditLimit,
      max_invoices:    1,
      payment_days:    payDays,
      active,
    };

    return {
      ok: true,
      rowNo,
      docNumber,
      docType,
      name,
      personType,
      tpType,
      email,
      active,
      payload,
    };
  });
}

function _massTpRenderPreview(rows) {
  const preview = $('#mass-tp-preview');
  const tbody   = $('#mass-tp-preview-body');
  const summary = $('#mass-tp-summary');
  const runBtn  = $('#btn-mass-tp-run');
  if (!preview || !tbody || !summary || !runBtn) return;

  const okRows  = rows.filter(r => r.ok);
  const badRows = rows.filter(r => !r.ok);

  tbody.innerHTML = rows.map(r => {
    if (r.ok) {
      return `<tr>
        <td>${r.rowNo}</td>
        <td><span class="font-semibold" style="color:#1D4ED8">${esc(r.docType)} ${esc(r.docNumber)}</span></td>
        <td>${esc(r.name)}</td>
        <td>${esc(r.personType)}</td>
        <td>${esc(r.tpType)}</td>
        <td>${esc(r.email || '—')}</td>
        <td><span class="badge ${r.active ? 'badge-green' : 'badge-gray'}">${r.active ? 'Activo' : 'Inactivo'}</span></td>
        <td><span class="badge badge-green">OK</span></td>
      </tr>`;
    }
    return `<tr style="background:#FFF7F7">
      <td>${r.rowNo}</td>
      <td colspan="6" class="text-xs" style="color:#EF4444">${esc(r.error || 'Error')}</td>
      <td><span class="badge badge-red">Error</span></td>
    </tr>`;
  }).join('');

  summary.innerHTML = `<span style="color:${badRows.length ? '#B91C1C' : '#166534'}">
    ${rows.length} fila(s): ${okRows.length} válida(s), ${badRows.length} con error.
    ${badRows.length ? 'Las filas con error serán omitidas.' : 'Listo para ejecutar.'}
  </span>`;

  preview.classList.remove('hidden');
  if (okRows.length) runBtn.classList.remove('hidden');
  else runBtn.classList.add('hidden');
}

async function _executeMassTpImport(rows) {
  if (_massTpImportInProgress) return;
  const valids = (rows || []).filter(r => r.ok && r.payload);
  if (!valids.length) return showToast('No hay filas válidas para importar', 'warning');

  _massTpImportInProgress = true;

  const runBtn      = $('#btn-mass-tp-run');
  const progressWrap = $('#mass-tp-progress-wrap');
  const progressBar  = $('#mass-tp-progress-bar');
  const progressText = $('#mass-tp-progress-text');

  if (runBtn) { runBtn.disabled = true; runBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Importando...'; }
  progressWrap?.classList.remove('hidden');

  // Cargar terceros existentes para decidir create vs update
  let existingByDoc = new Map();
  try {
    const all = await pb.listAll('third_parties', {});
    all.forEach(t => {
      const key = `${t.doc_type}|${String(t.doc_number || '').replace(/[^0-9a-zA-Z]/g, '')}`;
      existingByDoc.set(key, t.id);
    });
  } catch (err) {
    showToast(`Error al cargar terceros existentes: ${err.message}`, 'error');
    _massTpImportInProgress = false;
    if (runBtn) { runBtn.disabled = false; runBtn.innerHTML = '<i class="fas fa-bolt mr-1"></i>Ejecutar carga'; }
    return;
  }

  let created = 0, updated = 0, failed = 0;
  const failedRows = [];

  try {
    for (let i = 0; i < valids.length; i++) {
      const draft = valids[i];
      const pct = (i / valids.length) * 100;
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (progressText) progressText.textContent = `Procesando ${i + 1} de ${valids.length}: ${draft.name}`;

      const key = `${draft.payload.doc_type}|${draft.payload.doc_number}`;
      const existingId = existingByDoc.get(key);
      try {
        if (existingId) {
          await pb.update('third_parties', existingId, draft.payload);
          updated++;
        } else {
          const rec = await pb.create('third_parties', draft.payload);
          existingByDoc.set(key, rec.id);
          created++;
        }
      } catch (err) {
        failed++;
        failedRows.push(`Fila ${draft.rowNo} (${draft.docNumber}): ${err.message}`);
      }
    }

    if (progressBar) progressBar.style.width = '100%';
    if (progressText) progressText.textContent = 'Proceso finalizado';

    await API.logAudit(
      'IMPORT', 'third_parties', 'bulk',
      `Carga masiva: ${created} creados, ${updated} actualizados, ${failed} con error`
    );

    if (failedRows.length) console.warn('[CargaMasivaTp] Errores:', failedRows);

    showToast(
      `Carga completada: ${created} creados, ${updated} actualizados${failed ? `, ${failed} con error` : ''}`,
      failed ? 'warning' : 'success',
      5500
    );

    _loadSysInfo();
  } finally {
    _massTpImportInProgress = false;
    if (runBtn) { runBtn.disabled = false; runBtn.innerHTML = '<i class="fas fa-bolt mr-1"></i>Ejecutar carga'; }
  }
}

/* ══════════════════════════════════════════════════════════
   CARGA MASIVA DE CUENTAS (Plan de Cuentas)
══════════════════════════════════════════════════════════ */

/** Descarga plantilla CSV de ejemplo para importación de cuentas. */
function _downloadMassAccTemplate() {
  const header = 'codigo,nombre,tipo,naturaleza,nivel,codigo_padre,requiere_tercero,activa';
  const rows = [
    '1,ACTIVO,1,debit,1,,No,Si',
    '11,DISPONIBLE,1,debit,2,1,,Si',
    '1105,CAJA,1,debit,3,11,,Si',
    '110505,Caja General,1,debit,4,1105,No,Si',
  ].join('\n');
  const blob = new Blob([header + '\n' + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'plantilla_plan_cuentas.csv'; a.click();
  URL.revokeObjectURL(url);
}

/** Normaliza una fila cruda a payload de cuenta. Retorna { ok, payload, error }. */
function _massAccNormalizeRow(raw, accTypes) {
  const get = (...keys) => {
    for (const k of keys) { const v = raw[k]; if (v !== undefined && v !== '') return String(v).trim(); }
    return '';
  };
  const code       = get('codigo', 'code', 'cod', 'cuenta');
  const name       = get('nombre', 'name', 'descripcion', 'description');
  const tipoRaw    = get('tipo', 'type', 'tipo_cuenta', 'account_type');
  const natRaw     = get('naturaleza', 'nature', 'nat');
  const levelRaw   = get('nivel', 'level');
  const parentCode = get('codigo_padre', 'parent_code', 'padre', 'parent');
  const thirdRaw   = get('requiere_tercero', 'requires_third_party', 'tercero', 'req_tercero');
  const activeRaw  = get('activa', 'active', 'estado');

  if (!code)             return { ok: false, error: 'Falta el código' };
  if (!/^\d+$/.test(code)) return { ok: false, error: `Código "${code}" no es numérico` };
  if (!name)             return { ok: false, error: 'Falta el nombre' };
  if (!tipoRaw)          return { ok: false, error: 'Falta el tipo de cuenta' };

  const tipoNorm = tipoRaw.toLowerCase().trim();
  const accType  = accTypes.find(t =>
    String(t.code).toLowerCase() === tipoNorm ||
    t.name.toLowerCase().includes(tipoNorm)
  );
  if (!accType) return { ok: false, error: `Tipo "${tipoRaw}" no encontrado` };

  const nature = /^(c|cr|credit|credito|crédito)$/i.test(natRaw) ? 'credit' : 'debit';
  const level  = levelRaw ? Math.max(1, parseInt(levelRaw, 10) || 1) : code.length;
  const requiresThird = /^(s[ií]|yes|1|true)$/i.test(thirdRaw);
  const active = !/^(no|0|false|inactiva|inactivo)$/i.test(activeRaw);

  return {
    ok: true,
    payload: {
      code, name,
      account_type_id: accType.id,
      nature, level,
      parent_code: parentCode,
      requires_third_party: requiresThird,
      active,
      maneja_cruce: false,
      maneja_retenciones: false,
      tipos_retencion: '',
    },
  };
}

/** Abre el modal de importación masiva de cuentas. */
async function _openMassAccImportModal() {
  if (!can('canWrite')) return showToast('No tienes permisos para importar cuentas', 'error');
  if (_massAccImportInProgress) return showToast('Importación en curso, espera...', 'warning');

  const accTypes = await pb.listAll('account_types', { sort: 'code' });

  openModal(
    '<i class="fas fa-list-tree mr-2" style="color:#6D28D9"></i>Importar Plan de Cuentas',
    `
    <div class="mb-4">
      <p class="text-sm mb-3" style="color:#374151">
        Carga un archivo <strong>CSV</strong> o <strong>Excel (.xlsx)</strong> con las cuentas.
        Si el código ya existe la cuenta se <strong>actualiza</strong>; si no existe, se <strong>crea</strong>.
      </p>
      <div class="rounded-xl p-3 mb-3" style="background:#F5F3FF;border:1px solid #DDD6FE">
        <p class="text-xs font-semibold mb-1" style="color:#6D28D9;text-transform:uppercase;letter-spacing:.05em">Columnas</p>
        <div class="flex flex-wrap gap-2">
          ${['codigo','nombre','tipo'].map(c => `<code class="text-xs px-2 py-0.5 rounded" style="background:#EDE9FE;color:#6D28D9">${c}</code>`).join('')}
          ${['naturaleza','nivel','codigo_padre','requiere_tercero','activa'].map(c => `<code class="text-xs px-2 py-0.5 rounded" style="background:#F3F4F6;color:#6B7280">${c} <span style="font-size:.65rem">(opcional)</span></code>`).join('')}
        </div>
        <p class="text-xs mt-2" style="color:#6B7280">El campo <strong>tipo</strong> debe ser el código numérico del tipo (ej: <em>1</em>, <em>2</em>).</p>
      </div>
      <button class="btn btn-outline btn-sm mb-4" id="btn-mass-acc-dl-tmpl"><i class="fas fa-download mr-1"></i>Descargar plantilla CSV</button>
      <div id="mass-acc-drop" class="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer transition-all" style="border-color:#D1D5DB;background:#FAFAFA">
        <i class="fas fa-cloud-arrow-up text-3xl mb-3" style="color:#9CA3AF"></i>
        <p class="text-sm font-medium" style="color:#374151">Arrastra tu archivo aquí o <span style="color:#6D28D9;text-decoration:underline">haz clic para seleccionar</span></p>
        <p class="text-xs mt-1" style="color:#9CA3AF">CSV · XLSX · XLS — máx. 5 MB</p>
        <input type="file" id="mass-acc-file-input" accept=".csv,.xlsx,.xls" class="hidden">
      </div>
      <div id="mass-acc-preview" class="mt-4 hidden">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-semibold" style="color:#0D2137">Vista previa — <span id="mass-acc-count"></span></p>
          <button class="btn btn-outline btn-sm" id="btn-mass-acc-clear"><i class="fas fa-xmark mr-1"></i>Limpiar</button>
        </div>
        <div class="rounded-xl border overflow-hidden" style="border-color:#F0F0F0;max-height:300px;overflow-y:auto">
          <table class="data-table text-xs">
            <thead><tr><th>#</th><th>Código</th><th>Nombre</th><th>Tipo</th><th>Nat.</th><th>Nivel</th><th>Padre</th><th>Estado</th></tr></thead>
            <tbody id="mass-acc-preview-body"></tbody>
          </table>
        </div>
        <div id="mass-acc-summary" class="mt-2 text-xs" style="color:#6B7280"></div>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary hidden" id="btn-mass-acc-run"><i class="fas fa-bolt mr-1"></i>Ejecutar importación</button>`,
    true
  );

  let parsedRows = [];

  const dropZone  = document.getElementById('mass-acc-drop');
  const fileInput = document.getElementById('mass-acc-file-input');

  document.getElementById('btn-mass-acc-dl-tmpl')?.addEventListener('click', _downloadMassAccTemplate);

  dropZone?.addEventListener('click', () => fileInput?.click());
  dropZone?.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.style.borderColor = '#6D28D9'; dropZone.style.background = '#F5F3FF';
  });
  dropZone?.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#D1D5DB'; dropZone.style.background = '#FAFAFA';
  });
  dropZone?.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.style.borderColor = '#D1D5DB'; dropZone.style.background = '#FAFAFA';
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  });
  fileInput?.addEventListener('change', () => { if (fileInput.files?.[0]) processFile(fileInput.files[0]); });

  document.getElementById('btn-mass-acc-clear')?.addEventListener('click', () => {
    parsedRows = [];
    document.getElementById('mass-acc-preview')?.classList.add('hidden');
    document.getElementById('btn-mass-acc-run')?.classList.add('hidden');
    if (fileInput) fileInput.value = '';
  });

  async function processFile(file) {
    if (file.size > 5 * 1024 * 1024) return showToast('El archivo supera 5 MB', 'error');
    const ext = file.name.split('.').pop().toLowerCase();
    let rawRows = [];
    try {
      if (ext === 'csv') {
        rawRows = _massTxParseCsv(await file.text());
      } else if (ext === 'xlsx' || ext === 'xls') {
        rawRows = _massTxParseExcel(await file.arrayBuffer());
      } else {
        return showToast('Formato no soportado. Usa CSV, XLSX o XLS.', 'error');
      }
    } catch (e) {
      return showToast('Error al leer el archivo: ' + e.message, 'error');
    }
    if (!rawRows.length) return showToast('El archivo no contiene filas de datos', 'warning');
    parsedRows = rawRows.map((r, i) => ({ idx: i + 1, ...(_massAccNormalizeRow(r, accTypes)) }));
    renderPreview(parsedRows);
  }

  function renderPreview(rows) {
    const tbody   = document.getElementById('mass-acc-preview-body');
    const count   = document.getElementById('mass-acc-count');
    const summary = document.getElementById('mass-acc-summary');
    const runBtn  = document.getElementById('btn-mass-acc-run');
    const preview = document.getElementById('mass-acc-preview');

    const okRows  = rows.filter(r => r.ok);
    const errRows = rows.filter(r => !r.ok);
    count.textContent = `${rows.length} fila(s) — ${okRows.length} válidas, ${errRows.length} con error`;

    tbody.innerHTML = rows.map((r, i) => {
      if (r.ok) {
        const p = r.payload;
        const typeName = accTypes.find(t => t.id === p.account_type_id)?.name ?? '?';
        return `<tr>
          <td>${i + 1}</td>
          <td><span class="font-semibold" style="color:#6D28D9">${esc(p.code)}</span></td>
          <td>${esc(p.name)}</td>
          <td class="text-xs">${esc(typeName)}</td>
          <td>${p.nature === 'debit' ? 'Db' : 'Cr'}</td>
          <td>${p.level}</td>
          <td>${esc(p.parent_code || '—')}</td>
          <td><span class="badge badge-green">OK</span></td>
        </tr>`;
      }
      return `<tr style="background:#FFF7F7">
        <td>${i + 1}</td>
        <td colspan="6" class="text-xs" style="color:#EF4444">${esc(r.error)}</td>
        <td><span class="badge badge-red">Error</span></td>
      </tr>`;
    }).join('');

    summary.innerHTML = errRows.length
      ? `<span style="color:#EF4444"><i class="fas fa-triangle-exclamation mr-1"></i>${errRows.length} fila(s) con error serán omitidas.</span>`
      : `<span style="color:#22C55E"><i class="fas fa-circle-check mr-1"></i>Todas las filas son válidas.</span>`;

    preview.classList.remove('hidden');
    if (okRows.length) runBtn?.classList.remove('hidden');
    else runBtn?.classList.add('hidden');
  }

  document.getElementById('btn-mass-acc-run')?.addEventListener('click', async () => {
    const okRows = parsedRows.filter(r => r.ok);
    if (!okRows.length || _massAccImportInProgress) return;
    _massAccImportInProgress = true;
    const runBtn = document.getElementById('btn-mass-acc-run');
    if (runBtn) { runBtn.disabled = true; runBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Importando...'; }

    let existingMap = {};
    try {
      const all = await pb.listAll('accounts', {});
      all.forEach(a => { existingMap[a.code] = a.id; });
    } catch (e) {
      showToast('Error al cargar cuentas: ' + e.message, 'error');
      _massAccImportInProgress = false;
      if (runBtn) { runBtn.disabled = false; runBtn.innerHTML = '<i class="fas fa-bolt mr-1"></i>Ejecutar importación'; }
      return;
    }

    let created = 0, updated = 0, errors = 0;
    for (const row of okRows) {
      try {
        if (existingMap[row.payload.code]) {
          await pb.update('accounts', existingMap[row.payload.code], row.payload);
          updated++;
        } else {
          const rec = await pb.create('accounts', row.payload);
          existingMap[row.payload.code] = rec.id;
          created++;
        }
      } catch { errors++; }
    }

    await API.logAudit('IMPORT', 'Cuenta', 'bulk', `${created} creadas, ${updated} actualizadas, ${errors} errores`);
    _loadSysInfo();
    closeModal();
    let msg = `Importación completada: ${created} creadas, ${updated} actualizadas.`;
    if (errors) msg += ` ${errors} con error.`;
    showToast(msg, errors ? 'warning' : 'success', 5000);
    _massAccImportInProgress = false;
  });
}

/* ══════════════════════════════════════════════════════════
   HELPER: modal con botones de acción
══════════════════════════════════════════════════════════ */
function openModal(title, bodyHtml, actionsOrFooter = [], wide = false) {
  const titleEl  = $('#modal-title');
  const bodyEl   = $('#modal-body');
  const footerEl = $('#modal-footer');
  const modalBox = $('#modal-box');
  const overlay  = $('#modal-overlay');

  if (titleEl)  titleEl.innerHTML = title;
  if (bodyEl)   bodyEl.innerHTML    = bodyHtml;

  if (footerEl) {
    footerEl.innerHTML = '';

    if (typeof actionsOrFooter === 'string') {
      footerEl.innerHTML = actionsOrFooter;
    } else {
      const actions = Array.isArray(actionsOrFooter)
        ? actionsOrFooter
        : (actionsOrFooter && typeof actionsOrFooter === 'object' ? [actionsOrFooter] : []);

      actions.forEach(({ label, class: cls, action }) => {
        if (typeof action !== 'function') return;
        const btn = document.createElement('button');
        btn.className = `btn ${cls || 'btn-outline'}`;
        btn.textContent = label || 'Aceptar';
        btn.addEventListener('click', action);
        footerEl.appendChild(btn);
      });
    }
  }

  modalBox?.classList.toggle('wide', !!wide);
  overlay?.classList.add('show');
}
