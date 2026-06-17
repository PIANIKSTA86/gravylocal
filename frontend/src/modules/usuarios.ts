/**
 * GRAVY v2.0 - usuarios.js
 */
'use strict';

async function renderUsuarios(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF">Cargando usuarios...</div>`;
  try {
    const users = await pb.listAll('users', { sort: '-created' });
    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Usuarios</h3>
          <p class="text-sm" style="color:#6B7280">Gestion de acceso, roles y estado.</p>
        </div>
        <button class="btn btn-primary" id="btn-new-user"><i class="fas fa-user-plus"></i> Nuevo Usuario</button>
      </div>

      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <input id="users-q" class="form-input" placeholder="Buscar por nombre, correo o rol...">
      </div>

      ${(pb.currentUser?.role === 'admin' && users.length <= 1) ? `
      <div class="mb-4 p-4 rounded-2xl border" style="background:#FFF8F0;border-color:#FED7AA">
        <p class="font-semibold" style="color:#C46516"><i class="fas fa-circle-info mr-2"></i>Solo se visualiza 1 usuario</p>
        <p class="text-sm" style="color:#6B7280">Si ya existen mas usuarios en BD, revisa la regla listRule de la coleccion users en PocketBase.</p>
      </div>` : ''}

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto" style="max-height: calc(100vh - 290px)">
          <table class="data-table" id="users-table">
            <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              ${users.length ? users.map(u => `
                <tr>
                  <td>${esc(u.full_name || '?')}</td>
                  <td>${esc(u.email || '?')}</td>
                  <td>${roleBadge(u.role || 'viewer')}</td>
                  <td>${u.active ? '<span class="badge badge-green">Activo</span>' : '<span class="badge badge-gray">Inactivo</span>'}</td>
                  <td>
                    <div class="flex gap-2">
                      <button class="btn btn-outline btn-sm" onclick="editUser('${esc(u.id)}')"><i class="fas fa-pen"></i></button>
                      <button class="btn btn-danger btn-sm" onclick="toggleUser('${esc(u.id)}', ${u.active ? 'false' : 'true'})"><i class="fas ${u.active ? 'fa-ban' : 'fa-rotate-left'}"></i></button>
                    </div>
                  </td>
                </tr>`).join('') : '<tr><td colspan="5" class="text-center py-10" style="color:#9CA3AF">No hay usuarios.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;

    $('#users-q')?.addEventListener('input', debounce(() => filterTable('users-table', getInputVal('users-q')), 150));
    $('#btn-new-user')?.addEventListener('click', async () => await openUserForm());
  } catch (err) {
    c.innerHTML = `
      <div class="bg-white rounded-2xl border p-8 text-center" style="border-color:#F0F0F0">
        <i class="fas fa-circle-exclamation text-3xl mb-3" style="color:#EF4444"></i>
        <p class="font-semibold" style="color:#374151">No fue posible acceder a la coleccion de usuarios</p>
        <p class="text-sm mt-2" style="color:#6B7280">${esc(err.message)}</p>
        <p class="text-xs mt-3" style="color:#9CA3AF">Si el backend bloquea este recurso, puedes administrar usuarios desde el panel de PocketBase.</p>
      </div>`;
  }
}

async function openUserForm(row = null) {
  if (!can('canManageUsers')) return showToast('No tienes permisos para gestionar usuarios', 'error');

  // Cargar sucursales activas
  let branches: any[] = [];
  try {
    branches = await pb.listAll('branches', { filter: 'active=true', ignoreBranch: true });
  } catch (err) {
    console.warn('Error al cargar sucursales:', err);
  }

  const defaultBranchId = row?.default_branch_id || '';
  const allowedBranches = Array.isArray(row?.allowed_branches) ? row.allowed_branches : [];

  const branchOptions = branches.map(b => `<option value="${esc(b.id)}" ${b.id === defaultBranchId ? 'selected' : ''}>${esc(b.code)} - ${esc(b.name)}</option>`).join('');
  const allowedBranchChecks = branches.map(b => `
    <label class="inline-flex items-center gap-1.5 text-xs select-none cursor-pointer">
      <input type="checkbox" name="uf-allowed-branches" value="${esc(b.id)}" ${allowedBranches.includes(b.id) ? 'checked' : ''}>
      <span>${esc(b.code)} - ${esc(b.name)}</span>
    </label>
  `).join('');

  openModal(
    row ? 'Editar Usuario' : 'Nuevo Usuario',
    `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" style="color:#374151">
      <div class="form-group"><label class="form-label">Nombre completo</label><input id="uf-name" class="form-input" value="${esc(row?.full_name || '')}"></div>
      <div class="form-group"><label class="form-label">Correo</label><input id="uf-email" type="email" class="form-input" value="${esc(row?.email || '')}" ${row ? 'readonly' : ''}></div>
      <div class="form-group"><label class="form-label">Rol</label><select id="uf-role" class="form-input">${Object.keys(ROLES).map(r => `<option value="${esc(r)}" ${(row?.role || 'viewer') === r ? 'selected' : ''}>${esc(roleLabel(r))}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Estado</label><select id="uf-active" class="form-input"><option value="1" ${row?.active !== false ? 'selected' : ''}>Activo</option><option value="0" ${row?.active === false ? 'selected' : ''}>Inactivo</option></select></div>
      
      <!-- SUCURSALES -->
      <div class="form-group">
        <label class="form-label">Sucursal por defecto</label>
        <select id="uf-default-branch" class="form-input">
          <option value="">— Ninguna —</option>
          ${branchOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Sucursales permitidas (vacío = todas)</label>
        <div class="flex flex-col gap-1.5 border p-2.5 rounded-xl overflow-y-auto" style="border-color:#E5E7EB; max-height:110px; background:#FCFCFD">
          ${allowedBranchChecks || '<span class="text-xs text-gray-400">No hay sucursales activas</span>'}
        </div>
      </div>

      ${row ? '' : '<div class="form-group"><label class="form-label">Contraseña</label><input id="uf-pass" type="password" class="form-input"></div><div class="form-group"><label class="form-label">Confirmar Contraseña</label><input id="uf-pass2" type="password" class="form-input"></div>'}
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-user"><i class="fas fa-floppy-disk"></i> Guardar</button>`
  );

  $('#btn-save-user')?.addEventListener('click', async () => {
    const btn = $('#btn-save-user');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    }
    const payload = {
      full_name: getInputVal('uf-name'),
      role: getSelectVal('uf-role'),
      active: getSelectVal('uf-active') === '1',
      default_branch_id: getSelectVal('uf-default-branch') || null,
      allowed_branches: Array.from(document.querySelectorAll('input[name="uf-allowed-branches"]:checked')).map((el: any) => el.value),
    };
    if (!payload.full_name) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar';
      }
      return showToast('El nombre es obligatorio', 'warning');
    }
    try {
      if (row?.id) {
        await pb.update('users', row.id, payload);
      } else {
        const email = getInputVal('uf-email').toLowerCase();
        const pass = getInputVal('uf-pass');
        const pass2 = getInputVal('uf-pass2');
         if (!email || !pass || !pass2) return showToast('Correo y contraseña son obligatorios', 'warning');
         if (pass !== pass2) return showToast('Las contraseñas no coinciden', 'warning');

         // Algunos despliegues de PocketBase exponen "name"; lo enviamos para máxima compatibilidad.
        const generatedName = (email.split('@')[0] || 'user').replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 30) || `user_${Date.now()}`;
        const created = await pb.create('users', {
          ...payload,
          email,
          emailVisibility: true,
          name: generatedName,
          password: pass,
          passwordConfirm: pass2,
        });
      }
      closeModal();
      showToast('Usuario guardado correctamente', 'success');
      renderUsuarios($('#page-content'));
    } catch (err) {
      const details = err?.data?.data
        ? Object.values(err.data.data).map(v => v?.message).filter(Boolean).join(' | ')
        : '';
      showToast(details || err.message || 'No se pudo guardar el usuario', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar';
      }
    }
  });
}

async function editUser(id) {
  try { await openUserForm(await pb.get('users', id)); }
  catch (err) { showToast(err.message, 'error'); }
}

function toggleUser(id, active) {
  if (!can('canManageUsers')) return showToast('No tienes permisos para cambiar estado', 'error');
  confirmDialog(
    active ? 'Reactivar usuario' : 'Inactivar usuario',
    active ? '¿Deseas reactivar este usuario?' : '¿Deseas inactivar este usuario?',
    async () => {
      try {
        await pb.update('users', id, { active });
        showToast('Estado actualizado', 'success');
        renderUsuarios($('#page-content'));
      } catch (err) { showToast(err.message, 'error'); }
    }
  );
}

// --- VITE MIGRATION GLOBALS ---
(window as any).editUser = editUser;
(window as any).toggleUser = toggleUser;
(window as any).renderUsuarios = renderUsuarios;
(window as any).openUserForm = openUserForm;
