/**
 * GRAVY v2.0 - usuarios.js
 */
'use strict';

(window as any).togglePasswordVisibility = (id: string, btn: HTMLElement) => {
  const input = document.getElementById(id) as HTMLInputElement | null;
  if (!input) return;
  const icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    if (icon) icon.className = 'fas fa-eye';
  }
};

async function renderUsuarios(c) {
  const getContainer = (window as any).getPageContainer || ((x: any) => x || document.getElementById('page-content'));
  c = getContainer(c);
  if (!c) return;
  const canManage = ['admin', 'superadmin'].includes(pb.currentUser?.role);
  if (!canManage) {
    renderProfileForm(c);
    return;
  }

  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF">Cargando usuarios...</div>`;
  try {
    const users = await pb.listAll('users', { sort: '-created' });
    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Usuarios</h3>
          <p class="text-sm" style="color:#6B7280">Gestión de acceso, roles y estado.</p>
        </div>
        <button class="btn btn-primary" id="btn-new-user"><i class="fas fa-user-plus"></i> Nuevo Usuario</button>
      </div>

      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <input id="users-q" class="form-input" placeholder="Buscar por nombre, correo o rol...">
      </div>

      ${(pb.currentUser?.role === 'admin' && users.length <= 1) ? `
      <div class="mb-4 p-4 rounded-2xl border" style="background:#FFF8F0;border-color:#FED7AA">
        <p class="font-semibold" style="color:#C46516"><i class="fas fa-circle-info mr-2"></i>Solo se visualiza 1 usuario</p>
        <p class="text-sm" style="color:#6B7280">Si ya existen más usuarios en BD, revisa la regla listRule de la colección users en PocketBase.</p>
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
                      <button class="btn btn-outline btn-sm" title="Editar usuario" onclick="editUser('${esc(u.id)}')"><i class="fas fa-pen"></i></button>
                      <button class="btn btn-danger btn-sm" title="${u.active ? 'Inactivar usuario' : 'Reactivar usuario'}" onclick="toggleUser('${esc(u.id)}', ${u.active ? 'false' : 'true'})"><i class="fas ${u.active ? 'fa-ban' : 'fa-rotate-left'}"></i></button>
                      ${pb.currentUser?.role === 'superadmin' ? `<button class="btn btn-sm" title="Eliminar definitivamente" style="background:#FEE2E2;color:#DC2626;border:1px solid #FECACA;" onclick="deleteUser('${esc(u.id)}','${esc(u.email || u.full_name || u.id)}')"><i class="fas fa-trash-alt"></i></button>` : ''}
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
        <p class="font-semibold" style="color:#374151">No fue posible acceder a la colección de usuarios</p>
        <p class="text-sm mt-2" style="color:#6B7280">${esc(err.message)}</p>
        <p class="text-xs mt-3" style="color:#9CA3AF">Si el backend bloquea este recurso, puedes administrar usuarios desde el panel de PocketBase.</p>
      </div>`;
  }
}

function renderProfileForm(c) {
  c.innerHTML = `
    <div class="max-w-2xl mx-auto p-4" style="animation: fadeIn 0.4s ease">
      <div class="bg-white rounded-3xl border p-8 shadow-sm" style="border-color: #F0F0F0; background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)">
        
        <!-- Encabezado -->
        <div class="flex items-center gap-4 mb-8">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-sm" 
               style="background: linear-gradient(135deg, var(--accent-cyan), var(--accent-violet)); box-shadow: 0 8px 20px -4px rgba(127,124,255,0.3)">
            ${(pb.currentUser?.full_name || pb.currentUser?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 class="text-xl font-bold" style="color:#0D2137">Mi Perfil</h3>
            <p class="text-sm" style="color:#6B7280">Información de tu cuenta y opciones de seguridad.</p>
          </div>
        </div>

        <!-- Campos de información general -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 text-sm" style="color:#374151">
          <div>
            <label class="form-label" style="font-weight:700; color:#4B5563">Nombre Completo</label>
            <input class="form-input" style="background:#F3F4F6; cursor:not-allowed" value="${esc(pb.currentUser?.full_name || '—')}" readonly>
          </div>
          <div>
            <label class="form-label" style="font-weight:700; color:#4B5563">Correo Electrónico</label>
            <input class="form-input" style="background:#F3F4F6; cursor:not-allowed" value="${esc(pb.currentUser?.email || '—')}" readonly>
          </div>
          <div class="md:col-span-2">
            <label class="form-label" style="font-weight:700; color:#4B5563">Rol Asignado</label>
            <div class="mt-1">${roleBadge(pb.currentUser?.role || 'viewer')}</div>
          </div>
          <div class="md:col-span-2 mt-4 border-t pt-4" style="border-color:#F0F0F0">
            <label class="form-label font-bold mb-1.5 block" style="color:#0D2137"><i class="fas fa-palette mr-2 text-indigo-500"></i>Color del Topbar</label>
            <div class="flex items-center gap-3">
              <input type="color" id="pf-topbar-color" class="form-input p-1 h-[38px] w-[60px] cursor-pointer" value="${esc(pb.currentUser?.topbar_color || '#ffffff')}">
              <input type="text" id="pf-topbar-color-hex" class="form-input font-mono text-xs w-[100px]" value="${esc(pb.currentUser?.topbar_color || '#ffffff')}" placeholder="#ffffff" maxlength="7">
              <button class="btn btn-secondary btn-sm h-[38px]" id="btn-save-topbar-color">Aplicar Color</button>
            </div>
          </div>
        </div>

        <hr class="my-6" style="border-color:#F0F0F0">

        <!-- Cambio de Contraseña -->
        <div class="mt-6">
          <h4 class="text-md font-bold mb-4" style="color:#0D2137"><i class="fas fa-lock mr-2 text-indigo-500"></i>Cambiar Contraseña</h4>
          
          ${pb.currentUser?.role === 'viewer' ? `
            <div class="p-4 rounded-2xl border flex items-start gap-3" style="background:#FEF2F2; border-color:#FCA5A5">
              <i class="fas fa-circle-exclamation text-lg mt-0.5" style="color:#EF4444"></i>
              <div>
                <p class="font-semibold text-sm" style="color:#991B1B">Acción no permitida</p>
                <p class="text-xs mt-1" style="color:#7F1D1D">El rol de Visualizador cuenta con un acceso de solo lectura en el sistema y no tiene permitido cambiar su contraseña.</p>
              </div>
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div class="form-group">
                <label class="form-label" style="font-weight:700">Nueva Contraseña</label>
                <div class="relative flex items-center">
                  <input id="pf-pass" type="password" class="form-input pr-10" placeholder="Mínimo 8 caracteres">
                  <button type="button" class="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none" onclick="togglePasswordVisibility('pf-pass', this)">
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-weight:700">Confirmar Nueva Contraseña</label>
                <div class="relative flex items-center">
                  <input id="pf-pass2" type="password" class="form-input pr-10" placeholder="Repite la contraseña">
                  <button type="button" class="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none" onclick="togglePasswordVisibility('pf-pass2', this)">
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="flex justify-end mt-4">
              <button class="btn btn-primary" id="btn-change-pass">
                <i class="fas fa-key mr-2"></i> Actualizar Contraseña
              </button>
            </div>
          `}
        </div>

      </div>
    </div>`;

  $('#btn-change-pass')?.addEventListener('click', async () => {
    const btn = $('#btn-change-pass');
    const pass = getInputVal('pf-pass');
    const pass2 = getInputVal('pf-pass2');

    if (!pass || !pass2) {
      return showToast('Por favor completa ambos campos', 'warning');
    }
    if (pass.length < 8) {
      return showToast('La contraseña debe tener al menos 8 caracteres', 'warning');
    }
    if (pass !== pass2) {
      return showToast('Las contraseñas no coinciden', 'warning');
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Actualizando...';
    }

    try {
      await pb.update('users', pb.currentUser.id, {
        password: pass,
        passwordConfirm: pass2
      });
      showToast('Contraseña actualizada correctamente', 'success');
      setInputVal('pf-pass', '');
      setInputVal('pf-pass2', '');
    } catch (err) {
      showToast(err.message || 'Error al actualizar contraseña', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-key mr-2"></i> Actualizar Contraseña';
      }
    }
  });

  // Sync profile topbar color inputs
  const colorPicker = $('#pf-topbar-color') as HTMLInputElement | null;
  const colorHex = $('#pf-topbar-color-hex') as HTMLInputElement | null;
  colorPicker?.addEventListener('input', () => {
    if (colorHex) colorHex.value = colorPicker.value;
  });
  colorHex?.addEventListener('input', () => {
    if (colorPicker && /^#[0-9A-F]{6}$/i.test(colorHex.value)) {
      colorPicker.value = colorHex.value;
    }
  });

  $('#btn-save-topbar-color')?.addEventListener('click', async () => {
    const btn = $('#btn-save-topbar-color') as HTMLButtonElement | null;
    const color = (colorHex?.value || '#ffffff').trim();
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      return showToast('Por favor introduce un formato de color hexadecimal válido (ej: #ffffff)', 'warning');
    }
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Guardando...';
    }
    try {
      await pb.update('users', pb.currentUser.id, { topbar_color: color });
      pb.currentUser.topbar_color = color;
      const topbarEl = document.querySelector('.topbar') as HTMLElement;
      if (topbarEl) {
        topbarEl.style.background = color;
      }
      showToast('Color de topbar actualizado correctamente', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al guardar el color de topbar', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Aplicar Color';
      }
    }
  });
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

  // Cargar bodegas activas
  let warehouses: any[] = [];
  try {
    warehouses = await pb.listAll('warehouses', { filter: 'active=true' });
  } catch (err) {
    console.warn('Error al cargar bodegas:', err);
  }

  const defaultBranchId = row?.default_branch_id || '';
  const allowedBranches = Array.isArray(row?.allowed_branches) ? row.allowed_branches : [];

  const defaultWarehouseId = row?.default_warehouse_id || '';
  const allowedWarehouses = Array.isArray(row?.allowed_warehouses) ? row.allowed_warehouses : [];

  const branchOptions = branches.map(b => `<option value="${esc(b.id)}" ${b.id === defaultBranchId ? 'selected' : ''}>${esc(b.code)} - ${esc(b.name)}</option>`).join('');
  const allowedBranchChecks = branches.map(b => `
    <label class="inline-flex items-center gap-1.5 text-xs select-none cursor-pointer">
      <input type="checkbox" name="uf-allowed-branches" value="${esc(b.id)}" ${allowedBranches.includes(b.id) ? 'checked' : ''}>
      <span>${esc(b.code)} - ${esc(b.name)}</span>
    </label>
  `).join('');

  const warehouseOptions = warehouses.map(w => `<option value="${esc(w.id)}" ${w.id === defaultWarehouseId ? 'selected' : ''}>${esc(w.code)} - ${esc(w.name)}</option>`).join('');
  const allowedWarehouseChecks = warehouses.map(w => `
    <label class="inline-flex items-center gap-1.5 text-xs select-none cursor-pointer">
      <input type="checkbox" name="uf-allowed-warehouses" value="${esc(w.id)}" ${allowedWarehouses.includes(w.id) ? 'checked' : ''}>
      <span>${esc(w.code)} - ${esc(w.name)}</span>
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

      <!-- BODEGAS -->
      <div class="form-group">
        <label class="form-label">Bodega por defecto</label>
        <select id="uf-default-warehouse" class="form-input">
          <option value="">— Ninguna —</option>
          ${warehouseOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Bodegas permitidas (vacío = todas)</label>
        <div class="flex flex-col gap-1.5 border p-2.5 rounded-xl overflow-y-auto" style="border-color:#E5E7EB; max-height:110px; background:#FCFCFD">
          ${allowedWarehouseChecks || '<span class="text-xs text-gray-400">No hay bodegas activas</span>'}
        </div>
      </div>
      
      <!-- COLOR DEL TOPBAR -->
      <div class="form-group md:col-span-2">
        <label class="form-label">Color de la barra superior (Topbar)</label>
        <div class="flex gap-2 items-center">
          <input type="color" id="uf-topbar-color" class="form-input p-1 h-[38px] w-[60px] cursor-pointer" value="${esc(row?.topbar_color || '#ffffff')}">
          <input type="text" id="uf-topbar-color-hex" class="form-input font-mono text-xs w-[100px]" value="${esc(row?.topbar_color || '#ffffff')}" placeholder="#ffffff" maxlength="7">
        </div>
      </div>

      ${['superadmin', 'admin'].includes(pb.currentUser?.role) ? `
      <!-- PERMISOS AVANZADOS -->
      <div class="form-group md:col-span-2">
        <div class="rounded-xl border p-4" style="background:#F8FAFC;border-color:#E5E7EB">
          <p class="text-xs font-bold mb-3 uppercase tracking-wide" style="color:#6B7280;"><i class="fas fa-shield-halved mr-1.5" style="color:#7F7CFF"></i>Permisos Avanzados</p>
          <div class="flex flex-col gap-2">
            <label class="inline-flex items-center gap-2.5 text-sm cursor-pointer select-none" style="color:#374151">
              <input type="checkbox" id="uf-can-edit-docs" class="w-4 h-4 rounded" ${(row?.can_edit_docs === true || (row?.can_edit_docs === undefined && ['superadmin','admin','contador'].includes(row?.role || 'viewer'))) ? 'checked' : ''}>
              <span>
                <strong>Permitir editar documentos existentes</strong>
                <span class="block text-xs mt-0.5" style="color:#9CA3AF">Habilita la edición de transacciones, facturas y documentos ya creados.</span>
              </span>
            </label>
          </div>
        </div>
      </div>` : ''}

      <div class="form-group">
        <label class="form-label">Contraseña ${row ? '(opcional)' : ''}</label>
        <div class="relative flex items-center">
          <input id="uf-pass" type="password" class="form-input pr-10" placeholder="${row ? 'Dejar en blanco para conservar actual' : 'Mínimo 8 caracteres'}">
          <button type="button" class="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none" onclick="togglePasswordVisibility('uf-pass', this)">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Confirmar Contraseña ${row ? '(opcional)' : ''}</label>
        <div class="relative flex items-center">
          <input id="uf-pass2" type="password" class="form-input pr-10" placeholder="${row ? 'Dejar en blanco para conservar actual' : 'Repite la contraseña'}">
          <button type="button" class="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none" onclick="togglePasswordVisibility('uf-pass2', this)">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-user"><i class="fas fa-floppy-disk"></i> Guardar</button>`
  );

  // Sync user form topbar color inputs
  const ucp = $('#uf-topbar-color') as HTMLInputElement | null;
  const uch = $('#uf-topbar-color-hex') as HTMLInputElement | null;
  ucp?.addEventListener('input', () => { if (uch) uch.value = ucp.value; });
  uch?.addEventListener('input', () => { if (ucp && /^#[0-9A-F]{6}$/i.test(uch.value)) ucp.value = uch.value; });

  $('#btn-save-user')?.addEventListener('click', async () => {
    const btn = $('#btn-save-user');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    }
    const payload: any = {
      full_name: getInputVal('uf-name'),
      role: getSelectVal('uf-role'),
      active: getSelectVal('uf-active') === '1',
      default_branch_id: getSelectVal('uf-default-branch') || null,
      allowed_branches: Array.from(document.querySelectorAll('input[name="uf-allowed-branches"]:checked')).map((el: any) => el.value),
      default_warehouse_id: getSelectVal('uf-default-warehouse') || null,
      allowed_warehouses: Array.from(document.querySelectorAll('input[name="uf-allowed-warehouses"]:checked')).map((el: any) => el.value),
      topbar_color: getInputVal('uf-topbar-color-hex') || '#ffffff',
    };
    // Incluir override de can_edit_docs solo si el campo está presente en el formulario
    const canEditDocsEl = document.getElementById('uf-can-edit-docs') as HTMLInputElement | null;
    if (canEditDocsEl) {
      payload.can_edit_docs = canEditDocsEl.checked;
    }
    if (!payload.full_name) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar';
      }
      return showToast('El nombre es obligatorio', 'warning');
    }
    try {
      if (row?.id) {
        const pass = getInputVal('uf-pass');
        const pass2 = getInputVal('uf-pass2');
        if (pass || pass2) {
          if (pass.length < 8) {
            if (btn) {
              btn.disabled = false;
              btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar';
            }
            return showToast('La contraseña debe tener al menos 8 caracteres', 'warning');
          }
          if (pass !== pass2) {
            if (btn) {
              btn.disabled = false;
              btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar';
            }
            return showToast('Las contraseñas no coinciden', 'warning');
          }
          payload.password = pass;
          payload.passwordConfirm = pass2;
        }
        
        // Usamos el endpoint personalizado para evitar errores de permisos 400 de PocketBase
        const res = await fetch(`${pb.baseUrl}/api/gravy/admin/update-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': pb.authToken
          },
          body: JSON.stringify({ id: row.id, ...payload })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Error al actualizar usuario');
        }
        await (window as any).API.logAudit('UPDATE', 'users', row.id, `Usuario ${payload.full_name || row.email} modificado (Rol: ${payload.role}, Estado: ${payload.active ? 'Activo' : 'Inactivo'})`);
      } else {
        const email = getInputVal('uf-email').toLowerCase();
        const pass = getInputVal('uf-pass');
        const pass2 = getInputVal('uf-pass2');
         if (!email || !pass || !pass2) {
           if (btn) {
             btn.disabled = false;
             btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar';
           }
           return showToast('Correo y contraseña son obligatorios', 'warning');
         }
         if (pass !== pass2) {
           if (btn) {
             btn.disabled = false;
             btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar';
           }
           return showToast('Las contraseñas no coinciden', 'warning');
         }

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
        await (window as any).API.logAudit('CREATE', 'users', created.id, `Usuario ${email} creado (Rol: ${payload.role})`);
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
        await (window as any).API.logAudit('STATUS', 'users', id, `Usuario ${active ? 'reactivado' : 'inactivado'}`);
        showToast('Estado actualizado', 'success');
        renderUsuarios($('#page-content'));
      } catch (err) { showToast(err.message, 'error'); }
    }
  );
}

function deleteUser(id: string, identifier: string) {
  if (pb.currentUser?.role !== 'superadmin') return showToast('Solo el superadmin puede eliminar usuarios', 'error');
  if (pb.currentUser?.id === id) return showToast('No puedes eliminar tu propia cuenta', 'warning');
  confirmDialog(
    '⚠️ Eliminar usuario permanentemente',
    `<div style="color:#DC2626">
      <p class="font-semibold mb-2">Esta acción es <u>irreversible</u>. El usuario <strong>${esc(identifier)}</strong> y todos sus datos asociados serán eliminados definitivamente de la base de datos.</p>
      <p class="text-sm" style="color:#7F1D1D">No existe papelera ni forma de recuperar el registro.</p>
    </div>`,
    async () => {
      try {
        await pb.delete('users', id);
        await (window as any).API.logAudit('DELETE', 'users', id, `Usuario ${identifier} eliminado permanentemente`);
        showToast(`Usuario «${identifier}» eliminado permanentemente`, 'success');
        renderUsuarios($('#page-content'));
      } catch (err: any) {
        showToast(err.message || 'No se pudo eliminar el usuario', 'error');
      }
    },
    true // danger = true
  );
}

// --- VITE MIGRATION GLOBALS ---
(window as any).editUser = editUser;
(window as any).toggleUser = toggleUser;
(window as any).deleteUser = deleteUser;
(window as any).renderUsuarios = renderUsuarios;
(window as any).openUserForm = openUserForm;
