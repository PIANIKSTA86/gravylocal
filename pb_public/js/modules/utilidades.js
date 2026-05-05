/**
 * ContaCO v2.0 — utilidades.js
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

      </div>
    </div>`;

  _backupInProgress = false;
  _restoreInProgress = false;

  // Cargar última info de respaldo guardada localmente
  _loadLastBackupInfo();

  // Cargar estadísticas del sistema
  _loadSysInfo();

  // Listeners
  $('#btn-backup-create')?.addEventListener('click', _handleCreateBackup);
  $('#btn-backup-restore')?.addEventListener('click', () => $('#backup-file-input')?.click());
  $('#backup-file-input')?.addEventListener('change', _handleRestoreFileSelected);
}

/* ── Información del último backup (localStorage) ──────── */
function _loadLastBackupInfo() {
  const last = localStorage.getItem('contaco_last_backup');
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
      <span class="text-xs" style="color:#9CA3AF">Versión ContaCO</span>
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
      app:        'ContaCO',
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
    anchor.download = `ContaCO_backup_${dateStr}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    setProgress('Completado', 100);

    // Guardar metadata del último backup
    localStorage.setItem('contaco_last_backup', JSON.stringify({
      label:   new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }),
      records: totalRecords,
    }));
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
    showToast('El archivo no corresponde a un respaldo de ContaCO', 'error');
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
