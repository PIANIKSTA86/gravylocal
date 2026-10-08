# -*- coding: utf-8 -*-
import re

file_path = 'frontend/src/modules/utilidades.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update headers in _downloadMassFixedAssetsTemplate
old_headers = """  const headers = [
    'codigo', 'nombre', 'categoria', 'costo', 'vida_util_niif', 'vida_util_fiscal',
    'valor_residual', 'metodo_depreciacion', 'centro_costos', 'responsable',
    'proveedor', 'ubicacion', 'fecha_compra', 'fecha_puesta_servicio', 'factura_numero',
    'marca', 'modelo', 'serie', 'placa_qr', 'estado', 'activo_padre'
  ];"""

new_headers = """  const headers = [
    'codigo', 'nombre', 'categoria', 'costo', 'es_depreciable', 'vida_util_niif', 'vida_util_fiscal',
    'valor_residual', 'metodo_depreciacion', 'depr_acum_inicial_niif', 'depr_acum_inicial_fiscal',
    'periodo_corte_depreciacion', 'centro_costos', 'responsable',
    'proveedor', 'ubicacion', 'fecha_compra', 'fecha_puesta_servicio', 'factura_numero',
    'marca', 'modelo', 'serie', 'placa_qr', 'estado', 'activo_padre'
  ];"""

# Replace CRLF-insensitively
content = content.replace(old_headers.replace('\n', '\r\n'), new_headers.replace('\n', '\r\n'))
content = content.replace(old_headers, new_headers)

# 2. Update sample rows in _downloadMassFixedAssetsTemplate
old_row1 = """      costo: 4850000,
      vida_util_niif: 60,"""
new_row1 = """      costo: 4850000,
      es_depreciable: 'SI',
      vida_util_niif: 60,"""
content = content.replace(old_row1.replace('\n', '\r\n'), new_row1.replace('\n', '\r\n'))
content = content.replace(old_row1, new_row1)

old_row1_fin = """      metodo_depreciacion: 'linea_recta',
      centro_costos: 'ADM-01',"""
new_row1_fin = """      metodo_depreciacion: 'linea_recta',
      depr_acum_inicial_niif: 0,
      depr_acum_inicial_fiscal: 0,
      periodo_corte_depreciacion: '2025-12',
      centro_costos: 'ADM-01',"""
content = content.replace(old_row1_fin.replace('\n', '\r\n'), new_row1_fin.replace('\n', '\r\n'))
content = content.replace(old_row1_fin, new_row1_fin)

old_row2 = """    {
      codigo: 'VEH-002',
      nombre: 'Camión Foton Aumark 3.5 Toneladas Furgón Aislado',
      categoria: 'VEH',
      costo: 128000000,
      vida_util_niif: 120,
      vida_util_fiscal: 120,
      valor_residual: 12800000,
      metodo_depreciacion: 'linea_recta',
      centro_costos: 'LOG-01',"""
new_row2 = """    {
      codigo: 'VEH-002',
      nombre: 'Camioneta Changan Deepal S05 Eléctrica',
      categoria: 'VEH',
      costo: 133990000,
      es_depreciable: 'SI',
      vida_util_niif: 60,
      vida_util_fiscal: 60,
      valor_residual: 1000000,
      metodo_depreciacion: 'linea_recta',
      depr_acum_inicial_niif: 6649500,
      depr_acum_inicial_fiscal: 6649500,
      periodo_corte_depreciacion: '2025-12',
      centro_costos: 'LOG-01',"""
content = content.replace(old_row2.replace('\n', '\r\n'), new_row2.replace('\n', '\r\n'))
content = content.replace(old_row2, new_row2)

# 3. Update indications in _downloadMassFixedAssetsTemplate
old_ind = """    ['costo', 'SÍ', 'Número Positivo (> 0)', 'Costo histórico de adquisición del activo en pesos colombianos ($ COP).', '4850000'],
    ['vida_util_niif', 'NO (Auto)', 'Número Entero (Meses)', 'Vida útil contable bajo NIIF en meses. Si se omite, toma la vida útil por defecto de la categoría.', '60'],"""
new_ind = """    ['costo', 'SÍ', 'Número Positivo (> 0)', 'Costo histórico de adquisición del activo en pesos colombianos ($ COP).', '4850000'],
    ['es_depreciable', 'NO (Default: SI)', 'Texto (SI/NO)', 'Indica si el activo es depreciable. Si es NO (terrenos, lotes, obras de arte), no genera cuota contable.', 'SI'],
    ['vida_util_niif', 'NO (Auto)', 'Número Entero (Meses)', 'Vida útil contable bajo NIIF en meses. Si se omite, toma la vida útil por defecto de la categoría.', '60'],"""
content = content.replace(old_ind.replace('\n', '\r\n'), new_ind.replace('\n', '\r\n'))
content = content.replace(old_ind, new_ind)

old_ind2 = """    ['metodo_depreciacion', 'NO', 'Texto', 'Método de cálculo. Valores admitidos: linea_recta, saldos_decrecientes, unidades_produccion (Default: linea_recta).', 'linea_recta'],
    ['centro_costos', 'NO', 'Código o Nombre', 'Código o nombre del Centro de Costos registrado en GRAVY (ej: ADM-01, 01, Ventas).', 'ADM-01'],"""
new_ind2 = """    ['metodo_depreciacion', 'NO', 'Texto', 'Método de cálculo. Valores admitidos: linea_recta, saldos_decrecientes, unidades_produccion (Default: linea_recta).', 'linea_recta'],
    ['depr_acum_inicial_niif', 'NO (Opcional)', 'Número (>= 0)', 'Depreciación acumulada contable al corte de migración/saldo inicial (ej: dic/2025). Alícuota individual de esta placa.', '6649500'],
    ['depr_acum_inicial_fiscal', 'NO (Opcional)', 'Número (>= 0)', 'Depreciación acumulada tributaria fiscal al corte. Si se omite, toma el valor NIIF.', '6649500'],
    ['periodo_corte_depreciacion', 'NO (Opcional)', 'Texto AAAA-MM', 'Periodo contable del saldo inicial (ej: 2025-12). GRAVY calculará cuotas pendientes a partir del mes siguiente.', '2025-12'],
    ['centro_costos', 'NO', 'Código o Nombre', 'Código o nombre del Centro de Costos registrado en GRAVY (ej: ADM-01, 01, Ventas).', 'ADM-01'],"""
content = content.replace(old_ind2.replace('\n', '\r\n'), new_ind2.replace('\n', '\r\n'))
content = content.replace(old_ind2, new_ind2)

# 4. Update optColsFin and Modal UI in _openMassFixedAssetsImportModal
old_optcols = """  const reqCols = ['codigo', 'nombre', 'categoria', 'costo'];
  const optColsFin = ['vida_util_niif', 'vida_util_fiscal', 'valor_residual', 'metodo_depreciacion', 'centro_costos'];
  const optColsAdmin = ['responsable', 'proveedor', 'ubicacion', 'fecha_compra', 'fecha_puesta_servicio', 'factura_numero', 'marca', 'modelo', 'serie', 'placa_qr', 'estado', 'activo_padre'];"""

new_optcols = """  const reqCols = ['codigo', 'nombre', 'categoria', 'costo'];
  const optColsFin = ['es_depreciable', 'vida_util_niif', 'vida_util_fiscal', 'valor_residual', 'metodo_depreciacion', 'depr_acum_inicial_niif', 'depr_acum_inicial_fiscal', 'periodo_corte_depreciacion', 'centro_costos'];
  const optColsAdmin = ['responsable', 'proveedor', 'ubicacion', 'fecha_compra', 'fecha_puesta_servicio', 'factura_numero', 'marca', 'modelo', 'serie', 'placa_qr', 'estado', 'activo_padre'];"""
content = content.replace(old_optcols.replace('\n', '\r\n'), new_optcols.replace('\n', '\r\n'))
content = content.replace(old_optcols, new_optcols)

old_modal_header = """    `<div class="mb-2">
      <p class="text-sm mb-3" style="color:#374151">
        Carga un archivo <strong>Excel (.xlsx/.xls)</strong> o <strong>CSV</strong> con el catálogo de activos fijos.<br>
        Si el <strong>código/placa</strong> ya existe, el activo será <strong>actualizado</strong>; si no existe, será <strong>creado</strong>.
      </p>"""

new_modal_header = """    `<div class="mb-2">
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm" style="color:#374151">
          Carga un archivo <strong>Excel (.xlsx/.xls)</strong> o <strong>CSV</strong> con el catálogo de activos fijos.<br>
          Si el <strong>código/placa</strong> ya existe, el activo será <strong>actualizado</strong>; si no existe, será <strong>creado</strong>.
        </p>
        <button type="button" class="btn btn-outline btn-xs whitespace-nowrap ml-2" id="btn-mass-assets-modal-tpl" style="color:#059669;border-color:#A7F3D0">
          <i class="fas fa-file-excel mr-1 text-emerald-600"></i>Descargar plantilla
        </button>
      </div>"""
content = content.replace(old_modal_header.replace('\n', '\r\n'), new_modal_header.replace('\n', '\r\n'))
content = content.replace(old_modal_header, new_modal_header)

old_modal_note = """        <p class="text-[11px] mt-2" style="color:#065F46">
          <strong>Categoría</strong>: Código (ej: COMP, VEH) o nombre de categoría NIIF. 
          <strong>Fechas</strong>: Formato YYYY-MM-DD. 
          <strong>Valores monetarios</strong>: Cifras numéricas sin puntos de mil ni signos de peso.
        </p>"""

new_modal_note = """        <p class="text-[11px] mt-2" style="color:#065F46">
          <strong>Categoría</strong>: Código (ej: COMP, VEH) o nombre de categoría NIIF. 
          <strong>Fechas</strong>: Formato YYYY-MM-DD. 
          <strong>Valores monetarios</strong>: Cifras numéricas sin puntos de mil ni signos de peso.
          <br><strong>Saldos Iniciales de Depreciación</strong>: Usa <code>depr_acum_inicial_niif</code>, <code>depr_acum_inicial_fiscal</code> y <code>periodo_corte_depreciacion</code> (ej: <code>2025-12</code>) para conciliar saldos históricos previos.
        </p>"""
content = content.replace(old_modal_note.replace('\n', '\r\n'), new_modal_note.replace('\n', '\r\n'))
content = content.replace(old_modal_note, new_modal_note)

old_table_headers = """            <thead><tr>
              <th>#</th><th>Código</th><th>Activo</th><th>Categoría</th><th>Costo</th><th>Vida NIIF</th><th>Centro Costo</th><th>Estado</th><th>Acción</th>
            </tr></thead>"""

new_table_headers = """            <thead><tr>
              <th>#</th><th>Código</th><th>Activo</th><th>Categoría</th><th>Costo</th><th>Vida NIIF</th><th>Depr. Inicial</th><th>Periodo Corte</th><th>Centro Costo</th><th>Estado</th><th>Acción</th>
            </tr></thead>"""
content = content.replace(old_table_headers.replace('\n', '\r\n'), new_table_headers.replace('\n', '\r\n'))
content = content.replace(old_table_headers, new_table_headers)

# Wire up template button in modal
old_clear_listener = """  clearBtn?.addEventListener('click', resetPreview);"""
new_clear_listener = """  $('#btn-mass-assets-modal-tpl')?.addEventListener('click', _downloadMassFixedAssetsTemplate);
  clearBtn?.addEventListener('click', resetPreview);"""
content = content.replace(old_clear_listener.replace('\n', '\r\n'), new_clear_listener.replace('\n', '\r\n'))
content = content.replace(old_clear_listener, new_clear_listener)

# 5. Build draft parsing logic
old_build_draft_depr = """    // Resolver Vidas Útiles (Prioridad: fila Excel > default de categoría > fallback)
    const lifeNiifRaw = get('vida_util_niif', 'useful_life_niif', 'vida_niif', 'meses_niif');
    let useful_life_niif = lifeNiifRaw ? parseInt(lifeNiifRaw, 10) : (resolvedCat.useful_life_niif_default || 60);
    if (isNaN(useful_life_niif) || useful_life_niif <= 0) useful_life_niif = 60;

    const lifeFiscalRaw = get('vida_util_fiscal', 'useful_life_fiscal', 'vida_fiscal', 'meses_fiscal');
    let useful_life_fiscal = lifeFiscalRaw ? parseInt(lifeFiscalRaw, 10) : (resolvedCat.useful_life_fiscal_default || useful_life_niif);
    if (isNaN(useful_life_fiscal) || useful_life_fiscal <= 0) useful_life_fiscal = useful_life_niif;

    // Resolver Valor Residual
    const residualRaw = get('valor_residual', 'residual_value', 'salvamento');
    let residual_value = 0;
    if (residualRaw !== '') {
      residual_value = parseFloat(residualRaw.replace(/[^0-9.-]/g, '')) || 0;
    } else if (resolvedCat.residual_value_percent_default) {
      residual_value = Math.round(cost * (resolvedCat.residual_value_percent_default / 100));
    }"""

new_build_draft_depr = """    // Comprobar si ya existe para upsert
    const existing = assetsByCode.get(code);
    const mode = existing ? 'update' : 'create';

    // Determinar si es depreciable
    const depreciableRaw = get('es_depreciable', 'depreciable', 'is_depreciable').toLowerCase().trim();
    let is_depreciable = true;
    if (depreciableRaw === 'no' || depreciableRaw === 'false' || depreciableRaw === '0') {
      is_depreciable = false;
    } else if (existing && depreciableRaw === '') {
      is_depreciable = existing.is_depreciable !== false;
    }

    // Resolver Vidas Útiles (Prioridad: fila Excel > default de categoría > fallback)
    const lifeNiifRaw = get('vida_util_niif', 'useful_life_niif', 'vida_niif', 'meses_niif');
    let useful_life_niif = is_depreciable
      ? (lifeNiifRaw ? parseInt(lifeNiifRaw, 10) : (resolvedCat.useful_life_niif_default || 60))
      : (existing?.useful_life_niif || 120);
    if (isNaN(useful_life_niif) || useful_life_niif <= 0) useful_life_niif = 60;

    const lifeFiscalRaw = get('vida_util_fiscal', 'useful_life_fiscal', 'vida_fiscal', 'meses_fiscal');
    let useful_life_fiscal = is_depreciable
      ? (lifeFiscalRaw ? parseInt(lifeFiscalRaw, 10) : (resolvedCat.useful_life_fiscal_default || useful_life_niif))
      : (existing?.useful_life_fiscal || useful_life_niif);
    if (isNaN(useful_life_fiscal) || useful_life_fiscal <= 0) useful_life_fiscal = useful_life_niif;

    // Resolver Valor Residual
    const residualRaw = get('valor_residual', 'residual_value', 'salvamento');
    let residual_value = 0;
    if (is_depreciable) {
      if (residualRaw !== '') {
        residual_value = parseFloat(residualRaw.replace(/[^0-9.-]/g, '')) || 0;
      } else if (resolvedCat.residual_value_percent_default) {
        residual_value = Math.round(cost * (resolvedCat.residual_value_percent_default / 100));
      } else if (existing) {
        residual_value = existing.residual_value || 0;
      }
    }

    // Resolver Depreciación Acumulada Inicial (NIIF y Fiscal)
    const initDeprNiifRaw = get('depr_acum_inicial_niif', 'saldo_inicial_depr_niif', 'depr_inicial_niif', 'depr_inicial', 'initial_depreciation_niif');
    const initDeprFiscalRaw = get('depr_acum_inicial_fiscal', 'saldo_inicial_depr_fiscal', 'depr_inicial_fiscal', 'initial_depreciation_fiscal');

    let initial_depreciation_niif = 0;
    let initial_depreciation_fiscal = 0;

    if (is_depreciable) {
      if (initDeprNiifRaw !== '') {
        initial_depreciation_niif = parseFloat(initDeprNiifRaw.replace(/[^0-9.-]/g, '')) || 0;
      } else if (existing) {
        initial_depreciation_niif = Number(existing.initial_depreciation_niif) || 0;
      }

      if (initDeprFiscalRaw !== '') {
        initial_depreciation_fiscal = parseFloat(initDeprFiscalRaw.replace(/[^0-9.-]/g, '')) || 0;
      } else if (initDeprNiifRaw !== '') {
        initial_depreciation_fiscal = initial_depreciation_niif;
      } else if (existing) {
        initial_depreciation_fiscal = Number(existing.initial_depreciation_fiscal) || initial_depreciation_niif;
      }
    }

    // Resolver Periodo de Corte de Depreciación Inicial (ej: 2025-12)
    const cutoffRaw = get('periodo_corte_depreciacion', 'periodo_corte', 'ultimo_periodo_depr', 'ultimo_cierre', 'last_depreciation_period').trim();
    let last_depreciation_period: string | null = null;
    if (is_depreciable) {
      if (cutoffRaw) {
        if (/^\\d{4}-\\d{2}$/.test(cutoffRaw)) {
          last_depreciation_period = cutoffRaw;
        } else if (/^\\d{4}[\\/\\-]\\d{1,2}/.test(cutoffRaw)) {
          const parts = cutoffRaw.split(/[\\/\\-]/);
          last_depreciation_period = `${parts[0]}-${parts[1].padStart(2, '0')}`;
        } else if (/^\\d{1,2}[\\/\\-]\\d{4}/.test(cutoffRaw)) {
          const parts = cutoffRaw.split(/[\\/\\-]/);
          last_depreciation_period = `${parts[1]}-${parts[0].padStart(2, '0')}`;
        } else {
          const parsedD = parseDateString(cutoffRaw);
          if (parsedD) last_depreciation_period = parsedD.substring(0, 7);
        }
      } else if (initial_depreciation_niif > 0 || initial_depreciation_fiscal > 0) {
        last_depreciation_period = existing?.last_depreciation_period || '2025-12';
      } else if (existing?.last_depreciation_period) {
        last_depreciation_period = existing.last_depreciation_period;
      }
    }"""
content = content.replace(old_build_draft_depr.replace('\n', '\r\n'), new_build_draft_depr.replace('\n', '\r\n'))
content = content.replace(old_build_draft_depr, new_build_draft_depr)

# 6. Replace payload and duplicate existing check
old_payload_block = """    // Comprobar si ya existe para upsert
    const existing = assetsByCode.get(code);
    const mode = existing ? 'update' : 'create';

    const payload = {
      code,
      name,
      category_id: resolvedCat.id,
      cost,
      useful_life_niif,
      useful_life_fiscal,
      residual_value,
      depreciation_method: methodRaw,
      cost_center_id,
      owner_id,
      provider_id,
      parent_asset_id,
      location: get('ubicacion', 'location'),
      invoice_number: get('factura_numero', 'invoice_number', 'nro_factura', 'factura'),
      invoice_date: purchase_date,
      purchase_date,
      start_service_date,
      brand: get('marca', 'brand'),
      model: get('modelo', 'model'),
      serial_number: get('serie', 'serial_number', 'serial'),
      qr_code: get('placa_qr', 'qr_code', 'placa') || code,
      status,
      active
    };

    return {
      ok: true,
      rowNo,
      code,
      name,
      category: resolvedCat.name,
      cost,
      useful_life_niif,
      costCenterDisplay,
      status,
      mode,
      existingId: existing ? existing.id : null,
      payload
    };"""

new_payload_block = """    const payload = {
      code,
      name,
      category_id: resolvedCat.id,
      cost,
      is_depreciable,
      useful_life_niif,
      useful_life_fiscal,
      residual_value,
      initial_depreciation_niif,
      initial_depreciation_fiscal,
      last_depreciation_period,
      depreciation_method: is_depreciable ? methodRaw : 'linea_recta',
      cost_center_id,
      owner_id,
      provider_id,
      parent_asset_id,
      location: get('ubicacion', 'location'),
      invoice_number: get('factura_numero', 'invoice_number', 'nro_factura', 'factura'),
      invoice_date: purchase_date,
      purchase_date,
      start_service_date,
      brand: get('marca', 'brand'),
      model: get('modelo', 'model'),
      serial_number: get('serie', 'serial_number', 'serial'),
      qr_code: get('placa_qr', 'qr_code', 'placa') || code,
      status,
      active
    };

    return {
      ok: true,
      rowNo,
      code,
      name,
      category: resolvedCat.name,
      cost,
      is_depreciable,
      useful_life_niif,
      initial_depreciation_niif,
      last_depreciation_period,
      costCenterDisplay,
      status,
      mode,
      existingId: existing ? existing.id : null,
      payload
    };"""
content = content.replace(old_payload_block.replace('\n', '\r\n'), new_payload_block.replace('\n', '\r\n'))
content = content.replace(old_payload_block, new_payload_block)

# 7. Update preview table renderer
old_preview_render = """  tbody.innerHTML = rows.map(r => {
    if (r.ok) {
      return `<tr>
        <td>${r.rowNo}</td>
        <td><strong class="font-mono text-indigo-900">${esc(r.code)}</strong></td>
        <td><div class="font-medium text-gray-800 text-xs">${esc(r.name)}</div></td>
        <td><span class="text-xs text-gray-600">${esc(r.category)}</span></td>
        <td class="font-semibold">${fmt(r.cost)}</td>
        <td>${r.useful_life_niif} m</td>
        <td><span class="text-xxs text-gray-500">${esc(r.costCenterDisplay)}</span></td>
        <td>${statusMap[r.status] || `<span class="badge badge-green">${esc(r.status)}</span>`}</td>
        <td><span class="badge ${r.mode === 'update' ? 'badge-orange' : 'badge-blue'}">${r.mode === 'update' ? 'Actualizar' : 'Crear'}</span></td>
      </tr>`;
    }
    return `<tr style="background:#FEF2F2">
      <td>${r.rowNo}</td>
      <td colspan="7" class="text-xs font-medium" style="color:#DC2626">${esc(r.error || 'Error en la fila')}</td>
      <td><span class="badge badge-red">Error</span></td>
    </tr>`;
  }).join('');"""

new_preview_render = """  tbody.innerHTML = rows.map(r => {
    if (r.ok) {
      return `<tr>
        <td>${r.rowNo}</td>
        <td><strong class="font-mono text-indigo-900">${esc(r.code)}</strong></td>
        <td><div class="font-medium text-gray-800 text-xs">${esc(r.name)}</div></td>
        <td><span class="text-xs text-gray-600">${esc(r.category)}</span></td>
        <td class="font-semibold">${fmt(r.cost)}</td>
        <td>${r.is_depreciable === false ? '<span class="text-gray-400">No depr.</span>' : `${r.useful_life_niif} m`}</td>
        <td>${r.is_depreciable === false ? '<span class="text-gray-400">—</span>' : (r.initial_depreciation_niif ? `<strong class="text-emerald-700">${fmt(r.initial_depreciation_niif)}</strong>` : '$ 0')}</td>
        <td>${r.is_depreciable === false ? '<span class="text-gray-400">—</span>' : (r.last_depreciation_period ? `<span class="badge badge-purple font-mono">${esc(r.last_depreciation_period)}</span>` : '<span class="text-gray-400">Sin corte</span>')}</td>
        <td><span class="text-xxs text-gray-500">${esc(r.costCenterDisplay)}</span></td>
        <td>${statusMap[r.status] || `<span class="badge badge-green">${esc(r.status)}</span>`}</td>
        <td><span class="badge ${r.mode === 'update' ? 'badge-orange' : 'badge-blue'}">${r.mode === 'update' ? 'Actualizar' : 'Crear'}</span></td>
      </tr>`;
    }
    return `<tr style="background:#FEF2F2">
      <td>${r.rowNo}</td>
      <td colspan="9" class="text-xs font-medium" style="color:#DC2626">${esc(r.error || 'Error en la fila')}</td>
      <td><span class="badge badge-red">Error</span></td>
    </tr>`;
  }).join('');"""
content = content.replace(old_preview_render.replace('\n', '\r\n'), new_preview_render.replace('\n', '\r\n'))
content = content.replace(old_preview_render, new_preview_render)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied successfully!")
