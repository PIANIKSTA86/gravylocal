/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — ph_operations_guard.pb.js
 * Blindaje de reglas de negocio en servidor para:
 * 1. Reservas de Zonas Comunes (solapamiento, capacidad, duración, horarios, mora y tarifas/depósitos).
 * 2. PQRS (consecutivo atómico, vencimiento legal Ley 1755 en días hábiles, bitácora inicial).
 * 3. Facturación de tarifas/depósitos de reservas hacia facturas en borrador.
 */

// ── Helpers compartidos ──────────────────────────────────────────────────────
function phOpsTimeToMinutes(hhmm) {
  const parts = String(hhmm || '').split(':');
  if (parts.length < 2) return -1;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return -1;
  return h * 60 + m;
}

function phOpsAddBusinessDays(dateStr, businessDays) {
  const base = dateStr ? new Date(String(dateStr).slice(0, 10) + 'T12:00:00Z') : new Date();
  if (isNaN(base.getTime())) return '';
  let remaining = Math.max(1, Number(businessDays || 15));
  while (remaining > 0) {
    base.setUTCDate(base.getUTCDate() + 1);
    const day = base.getUTCDay();
    if (day !== 0 && day !== 6) {
      remaining--;
    }
  }
  return base.toISOString().slice(0, 10);
}

function phOpsValidateReservation(e, isUpdate) {
  const rec = e.record;
  const areaId = String(rec.getString('area_id') || '').trim();
  const propId = String(rec.getString('property_id') || '').trim();
  const date = String(rec.getString('date') || '').trim();
  const timeFrom = String(rec.getString('time_from') || '').trim();
  const timeTo = String(rec.getString('time_to') || '').trim();
  const status = String(rec.getString('status') || 'pending').trim() || 'pending';
  const attendees = Number(rec.getInt('attendees') || 0);

  if (!areaId || !propId || !date || !timeFrom || !timeTo) {
    throw new BadRequestError('Zona común, unidad, fecha y horario son obligatorios.');
  }

  // En actualización por usuario no admin/contador, solo se permite cancelar una reserva pendiente
  if (isUpdate && e.auth) {
    const role = String(e.auth.getString('role') || '');
    const isAdminOrContador = role === 'admin' || role === 'contador' || role === 'superadmin';
    if (!isAdminOrContador) {
      const orig = rec.original();
      const origStatus = String(orig.getString('status') || 'pending');
      if (origStatus !== 'pending' || status !== 'cancelled') {
        throw new BadRequestError('Solo puedes cancelar tus reservas que aún están en estado Pendiente.');
      }
    }
  }

  // Si se está cancelando, no bloquear por reglas de horario/capacidad
  if (status === 'cancelled') {
    return;
  }

  const minFrom = phOpsTimeToMinutes(timeFrom);
  const minTo = phOpsTimeToMinutes(timeTo);
  if (minFrom < 0 || minTo < 0 || minTo <= minFrom) {
    throw new BadRequestError('La hora de fin debe ser posterior a la hora de inicio.');
  }

  let area = null;
  try {
    area = $app.findRecordById('ph_common_areas', areaId);
  } catch (_) {
    throw new BadRequestError('La zona común seleccionada no existe.');
  }

  if (area.getBool('active') === false) {
    throw new BadRequestError('Esta zona común se encuentra inactiva actualmente.');
  }

  const capacity = Number(area.getInt('capacity') || 0);
  if (capacity > 0 && attendees > capacity) {
    throw new BadRequestError(`El número de asistentes (${attendees}) supera la capacidad máxima (${capacity}).`);
  }

  const durationHours = (minTo - minFrom) / 60;
  const minHours = Number(area.getFloat('min_hours') || 0);
  const maxHours = Number(area.getFloat('max_hours') || 0);
  if (minHours > 0 && durationHours < minHours) {
    throw new BadRequestError(`La reserva debe durar mínimo ${minHours} hora(s).`);
  }
  if (maxHours > 0 && durationHours > maxHours) {
    throw new BadRequestError(`La reserva no puede exceder ${maxHours} hora(s).`);
  }

  const openTime = String(area.getString('open_time') || '').trim();
  const closeTime = String(area.getString('close_time') || '').trim();
  if (openTime && phOpsTimeToMinutes(openTime) > minFrom) {
    throw new BadRequestError(`La zona común abre a las ${openTime}.`);
  }
  if (closeTime && phOpsTimeToMinutes(closeTime) < minTo) {
    throw new BadRequestError(`La zona común cierra a las ${closeTime}.`);
  }

  // Restricción por mora configurable (solo para reservas nuevas)
  if (!isUpdate && area.getBool('block_if_delinquent')) {
    try {
      const overdueRow = new DynamicModel({ cnt: 0 });
      $app.db().newQuery(
        "SELECT COUNT(*) as cnt FROM ph_invoices WHERE property_id = {:propId} AND status = 'posted' AND total > 0"
      ).bind({ propId }).one(overdueRow);
      if (Number(overdueRow.cnt || 0) > 0) {
        throw new BadRequestError('La unidad presenta facturas de administración pendientes de pago. Esta zona requiere estar al día.');
      }
    } catch (errMora) {
      if (errMora instanceof BadRequestError) throw errMora;
    }
  }

  // Límite mensual de reservas activas por unidad
  const maxMonthly = Number(area.getInt('max_monthly_per_unit') || 0);
  if (!isUpdate && maxMonthly > 0) {
    const ym = date.slice(0, 7);
    const countRow = new DynamicModel({ cnt: 0 });
    $app.db().newQuery(
      "SELECT COUNT(*) as cnt FROM ph_reservations WHERE area_id = {:areaId} AND property_id = {:propId} AND date LIKE {:ym} AND status != 'cancelled'"
    ).bind({ areaId, propId, ym: ym + '%' }).one(countRow);
    if (Number(countRow.cnt || 0) >= maxMonthly) {
      throw new BadRequestError(`Se alcanzó el límite de ${maxMonthly} reserva(s) mensuales para esta unidad en ${ym}.`);
    }
  }

  // Validación atómica de solapamiento en servidor
  const existing = arrayOf(new DynamicModel({ id: '', time_from: '', time_to: '', status: '' }));
  $app.db().newQuery(
    "SELECT id, time_from, time_to, status FROM ph_reservations WHERE area_id = {:areaId} AND date = {:date} AND status != 'cancelled'"
  ).bind({ areaId, date }).all(existing);

  for (const ex of existing) {
    if (isUpdate && ex.id === rec.id) continue;
    const exFrom = ex.time_from || '00:00';
    const exTo = ex.time_to || '23:59';
    if (timeFrom < exTo && timeTo > exFrom) {
      throw new BadRequestError(`Conflicto de horario: la zona ya está reservada de ${exFrom} a ${exTo}.`);
    }
  }

  // Calcular tarifa y depósito automáticamente en creación si la zona es de pago
  if (!isUpdate) {
    const isPaid = area.getBool('is_paid');
    const hourlyRate = Number(area.getFloat('hourly_rate') || 0);
    const depositAmount = Number(area.getFloat('deposit_amount') || 0);

    if (isPaid && hourlyRate > 0 && Number(rec.getFloat('rental_fee') || 0) === 0) {
      const fee = Math.round(hourlyRate * durationHours);
      rec.set('rental_fee', fee);
      if (!rec.getString('charge_status')) rec.set('charge_status', 'pending');
    } else if (!rec.getString('charge_status')) {
      rec.set('charge_status', Number(rec.getFloat('rental_fee') || 0) > 0 ? 'pending' : 'none');
    }

    if (depositAmount > 0 && Number(rec.getFloat('deposit_amount') || 0) === 0) {
      rec.set('deposit_amount', depositAmount);
      if (!rec.getString('deposit_status')) rec.set('deposit_status', 'pending');
    } else if (!rec.getString('deposit_status')) {
      rec.set('deposit_status', Number(rec.getFloat('deposit_amount') || 0) > 0 ? 'pending' : 'none');
    }

    if (!area.getBool('require_approval') && status === 'pending') {
      // Si no requiere aprobación manual y no es de pago pendiente, puede quedar pendiente o confirmada según cliente
      rec.set('status', status);
    }
  }
}

onRecordBeforeCreateRequest((e) => {
  phOpsValidateReservation(e, false);
  e.next();
}, 'ph_reservations');

onRecordBeforeUpdateRequest((e) => {
  phOpsValidateReservation(e, true);
  e.next();
}, 'ph_reservations');

// ── PQRS: Consecutivo atómico + vencimiento Ley 1755 ─────────────────────────
onRecordBeforeCreateRequest((e) => {
  const rec = e.record;
  const todayCompact = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `PQR-${todayCompact}-`;

  // Generar consecutivo único seguro en servidor
  let currentNum = String(rec.getString('number') || '').trim();
  let needsSeq = !currentNum;
  if (currentNum) {
    try {
      const dup = new DynamicModel({ cnt: 0 });
      $app.db().newQuery('SELECT COUNT(*) as cnt FROM ph_pqrs WHERE number = {:num}').bind({ num: currentNum }).one(dup);
      if (Number(dup.cnt || 0) > 0) needsSeq = true;
    } catch (_) {}
  }

  if (needsSeq) {
    const latest = new DynamicModel({ number: '' });
    let nextSeq = 1;
    try {
      $app.db().newQuery(
        "SELECT number FROM ph_pqrs WHERE number LIKE {:pfx} ORDER BY number DESC LIMIT 1"
      ).bind({ pfx: prefix + '%' }).one(latest);
      if (latest.number) {
        const tail = parseInt(String(latest.number).split('-').pop() || '0', 10);
        if (!isNaN(tail)) nextSeq = tail + 1;
      }
    } catch (_) {}
    rec.set('number', `${prefix}${String(nextSeq).padStart(4, '0')}`);
  }

  if (!rec.getString('opened_at')) {
    rec.set('opened_at', new Date().toISOString().slice(0, 19).replace('T', ' '));
  }

  // Calcular due_date Ley 1755 (10 días hábiles para documentos/info, 15 días hábiles general)
  if (!rec.getString('due_date')) {
    const text = (String(rec.getString('subject') || '') + ' ' + String(rec.getString('description') || '')).toLowerCase();
    const isDocRequest = /acta|certificado|paz y salvo|estado de cuenta|reglamento|copia|informacion|información/.test(text);
    const days = isDocRequest ? 10 : 15;
    rec.set('due_date', phOpsAddBusinessDays(rec.getString('opened_at'), days));
  }

  if (!rec.getString('history_json')) {
    const actor = e.auth ? (e.auth.getString('name') || e.auth.getString('email') || 'Sistema') : 'Sistema';
    const initialHistory = [{
      at: rec.getString('opened_at'),
      by: actor,
      action: 'RADICACION',
      note: 'Solicitud radicada en el sistema.',
      internal: false,
    }];
    rec.set('history_json', JSON.stringify(initialHistory));
  }

  e.next();
}, 'ph_pqrs');

// ── Endpoint: Cargar tarifa/depósito de reserva a factura borrador PH ────────
routerAdd('POST', '/api/ph/reservations/bill-deposit', (e) => {
  try {
    if (!e.auth) return e.json(401, { ok: false, message: 'No autenticado.' });
    const role = String(e.auth.getString('role') || '');
    if (role !== 'admin' && role !== 'contador' && role !== 'superadmin') {
      return e.json(403, { ok: false, message: 'Solo administración o contabilidad puede facturar reservas.' });
    }

    const body = e.requestInfo()?.body || {};
    const reservationId = String(body.reservationId || '').trim();
    if (!reservationId) return e.json(400, { ok: false, message: 'reservationId es obligatorio.' });

    const res = $app.findRecordById('ph_reservations', reservationId);
    const area = $app.findRecordById('ph_common_areas', res.getString('area_id'));
    const propId = res.getString('property_id');
    const rentalFee = Number(res.getFloat('rental_fee') || 0);
    const depositAmount = Number(res.getFloat('deposit_amount') || 0);

    if (rentalFee <= 0 && depositAmount <= 0) {
      return e.json(400, { ok: false, message: 'La reserva no tiene tarifa de alquiler ni depósito configurado.' });
    }

    // Buscar factura en borrador más reciente para la unidad
    const drafts = $app.findRecordsByFilter(
      'ph_invoices',
      `property_id = "${propId}" && status = "draft"`,
      '-created',
      1,
      0
    ) || [];

    if (!drafts.length) {
      return e.json(409, {
        ok: false,
        message: 'La unidad no tiene una factura en estado Borrador abierta. Genera primero los borradores del período.',
      });
    }

    const inv = drafts[0];
    const linesCol = $app.findCollectionByNameOrId('ph_invoice_lines');
    const existingLines = $app.findRecordsByFilter('ph_invoice_lines', `invoice_id = "${inv.id}"`, '-line_order', 1, 0) || [];
    let nextOrder = existingLines.length ? Number(existingLines[0].getInt('line_order') || 0) + 1 : 1;
    let addedAmount = 0;

    if (rentalFee > 0 && res.getString('charge_status') !== 'billed' && res.getString('charge_status') !== 'paid') {
      const line = new Record(linesCol, {
        invoice_id: inv.id,
        description: `Alquiler Zona Común: ${area.getString('name')} (${res.getString('date')})`,
        amount: rentalFee,
        line_order: nextOrder++,
        account_code: String(area.getString('income_account_code') || '').trim(),
      });
      $app.save(line);
      res.set('charge_status', 'billed');
      addedAmount += rentalFee;
    }

    if (depositAmount > 0 && res.getString('deposit_status') === 'pending') {
      const depLine = new Record(linesCol, {
        invoice_id: inv.id,
        description: `Depósito Garantía Reembolsable: ${area.getString('name')} (${res.getString('date')})`,
        amount: depositAmount,
        line_order: nextOrder++,
        account_code: String(area.getString('deposit_account_code') || '280505').trim(),
      });
      $app.save(depLine);
      res.set('deposit_status', 'held');
      addedAmount += depositAmount;
    }

    if (addedAmount <= 0) {
      return e.json(400, { ok: false, message: 'Los conceptos de esta reserva ya fueron cargados anteriormente.' });
    }

    const newTotal = Number(inv.getFloat('total') || 0) + addedAmount;
    inv.set('subtotal', newTotal);
    inv.set('total', newTotal);
    $app.save(inv);

    res.set('invoice_id', inv.id);
    $app.save(res);

    return e.json(200, {
      ok: true,
      invoiceId: inv.id,
      invoiceNumber: inv.getString('number'),
      addedAmount,
      newTotal,
    });
  } catch (err) {
    return e.json(500, { ok: false, message: 'Error al cargar reserva a factura: ' + String(err) });
  }
});
