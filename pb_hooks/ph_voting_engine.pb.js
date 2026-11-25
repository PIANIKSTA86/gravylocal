/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — ph_voting_engine.pb.js
 * Motor de reglas Ley 675 de 2001 para Votaciones PH (Asambleas y Consultas Móviles):
 * - Validación de poderes y límite por apoderado
 * - Check-in de quórum con snapshot de coeficiente
 * - Emisión de voto único, inmutable y con comprobante hash
 * - Endpoint /api/ph/assemblies/:id/summary para quórum y escrutinio en tiempo real
 */

function phVotingSimpleHash(input) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  const str = String(input || '');
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return ('00000000' + (h1 >>> 0).toString(16)).slice(-8) + ('00000000' + (h2 >>> 0).toString(16)).slice(-8);
}

// ── Poderes: validar tope por apoderado y unicidad por unidad ─────────────────
onRecordBeforeCreateRequest((e) => {
  const rec = e.record;
  const assemblyId = String(rec.getString('assembly_id') || '').trim();
  const propertyId = String(rec.getString('property_id') || '').trim();
  const holderDoc = String(rec.getString('proxy_holder_doc') || '').trim().toUpperCase();

  const asm = $app.findRecordById('ph_assemblies', assemblyId);
  const existingProp = $app.findRecordsByFilter(
    'ph_proxies',
    `assembly_id = "${assemblyId}" && property_id = "${propertyId}" && status != "rejected"`,
    '-created', 1, 0
  ) || [];
  if (existingProp.length > 0) {
    throw new BadRequestError('Esta unidad ya tiene un poder registrado o aprobado para esta asamblea.');
  }

  const maxProxies = Number(asm.getInt('max_proxies_per_user') || 0);
  if (maxProxies > 0 && holderDoc) {
    const holderProxies = $app.findRecordsByFilter(
      'ph_proxies',
      `assembly_id = "${assemblyId}" && proxy_holder_doc = "${holderDoc}" && status != "rejected"`,
      '-created', 50, 0
    ) || [];
    if (holderProxies.length >= maxProxies) {
      throw new BadRequestError(`El apoderado (${holderDoc}) alcanzó el límite de ${maxProxies} poder(es) permitido(s) por reglamento.`);
    }
  }
  if (!rec.getString('status')) rec.set('status', 'pending');
  e.next();
}, 'ph_proxies');

// ── Check-in de Quórum: snapshot de coeficiente de ph_properties ─────────────
onRecordBeforeCreateRequest((e) => {
  const rec = e.record;
  const assemblyId = String(rec.getString('assembly_id') || '').trim();
  const propertyId = String(rec.getString('property_id') || '').trim();

  const asm = $app.findRecordById('ph_assemblies', assemblyId);
  const asmStatus = String(asm.getString('status') || '');
  if (asmStatus !== 'checkin_open' && asmStatus !== 'in_session') {
    throw new BadRequestError('El registro de asistencia/quórum no está abierto para esta asamblea.');
  }

  const prop = $app.findRecordById('ph_properties', propertyId);
  if (prop.getBool('active') === false) {
    throw new BadRequestError('La unidad se encuentra inactiva.');
  }

  const coef = Number(prop.getFloat('coef_participacion') || 0);
  rec.set('coef_snapshot', coef);
  if (!rec.getString('checkin_at')) {
    rec.set('checkin_at', new Date().toISOString().slice(0, 19).replace('T', ' '));
  }
  e.next();
}, 'ph_assembly_attendees');

// ── Voto: validar apertura, quórum/check-in, opciones y generar vote_hash ────
onRecordBeforeCreateRequest((e) => {
  const rec = e.record;
  const pollId = String(rec.getString('poll_id') || '').trim();
  const propertyId = String(rec.getString('property_id') || '').trim();
  const selectedOption = String(rec.getString('selected_option') || '').trim();

  const poll = $app.findRecordById('ph_polls', pollId);
  if (poll.getString('status') !== 'open') {
    throw new BadRequestError('Esta votación no se encuentra abierta.');
  }

  const asm = $app.findRecordById('ph_assemblies', poll.getString('assembly_id'));
  const asmType = String(asm.getString('assembly_type') || '');

  // Validar que la opción exista en el JSON de opciones
  let options = [];
  try {
    const rawOpts = poll.get('options');
    options = Array.isArray(rawOpts) ? rawOpts : JSON.parse(String(rawOpts || '[]'));
  } catch (_) {}
  if (options.length > 0 && options.indexOf(selectedOption) === -1) {
    throw new BadRequestError('La opción seleccionada no es válida para esta votación.');
  }

  // En Asambleas formales (no CONSULTA_MOVIL), exigir check-in previo en ph_assembly_attendees
  if (asmType !== 'CONSULTA_MOVIL') {
    const att = $app.findRecordsByFilter(
      'ph_assembly_attendees',
      `assembly_id = "${asm.id}" && property_id = "${propertyId}"`,
      '-checkin_at', 1, 0
    ) || [];
    if (!att.length) {
      throw new BadRequestError('La unidad debe registrar asistencia (check-in de quórum) antes de votar en la asamblea.');
    }
  }

  // Nota Ley 675: Los propietarios en mora conservan su derecho a voz y voto. No se bloquea por cartera.
  const prop = $app.findRecordById('ph_properties', propertyId);
  const majorityType = String(poll.getString('majority_type') || 'SIMPLE_COEF');
  const weight = majorityType === 'UNIT_COUNT' ? 1 : Number(prop.getFloat('coef_participacion') || 0);

  const castAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const hash = phVotingSimpleHash(`${pollId}|${propertyId}|${selectedOption}|${castAt}|${weight}`);

  rec.set('coef_weight', weight);
  rec.set('cast_at', castAt);
  rec.set('vote_hash', hash);
  if (e.auth && !rec.getString('voter_user_id')) {
    rec.set('voter_user_id', e.auth.id);
  }

  e.next();
}, 'ph_votes');

// ── Endpoint de resumen en vivo (Quórum + Escrutinio por pregunta) ───────────
routerAdd('GET', '/api/ph/assemblies/{id}/summary', (e) => {
  try {
    if (!e.auth) return e.json(401, { ok: false, message: 'No autenticado.' });
    const assemblyId = String(e.request.pathValue('id') || '').trim();
    const asm = $app.findRecordById('ph_assemblies', assemblyId);

    const totalCoefRow = new DynamicModel({ total_coef: -0, total_units: 0 });
    $app.db().newQuery(
      'SELECT COALESCE(SUM(coef_participacion), 0) as total_coef, COUNT(*) as total_units FROM ph_properties WHERE active = 1'
    ).one(totalCoefRow);

    const attRow = new DynamicModel({ present_coef: -0, present_units: 0 });
    $app.db().newQuery(
      'SELECT COALESCE(SUM(coef_snapshot), 0) as present_coef, COUNT(*) as present_units FROM ph_assembly_attendees WHERE assembly_id = {:asmId}'
    ).bind({ asmId: assemblyId }).one(attRow);

    const totalCoef = Number(totalCoefRow.total_coef || 0) || 100;
    const presentCoef = Number(attRow.present_coef || 0);
    const quorumPct = Math.round((presentCoef / totalCoef) * 10000) / 100;
    const requiredPct = Number(asm.getFloat('quorum_required_pct') || 0);

    const polls = $app.findRecordsByFilter('ph_polls', `assembly_id = "${assemblyId}"`, 'created', 100, 0) || [];
    const pollSummaries = polls.map((p) => {
      let opts = [];
      try {
        const raw = p.get('options');
        opts = Array.isArray(raw) ? raw : JSON.parse(String(raw || '[]'));
      } catch (_) {}

      const rows = arrayOf(new DynamicModel({ selected_option: '', votes_count: 0, coef_sum: -0 }));
      $app.db().newQuery(
        'SELECT selected_option, COUNT(*) as votes_count, COALESCE(SUM(coef_weight), 0) as coef_sum FROM ph_votes WHERE poll_id = {:pollId} GROUP BY selected_option'
      ).bind({ pollId: p.id }).all(rows);

      const byOpt = {};
      let totalVotedWeight = 0;
      let totalVotes = 0;
      for (const r of rows) {
        byOpt[r.selected_option] = {
          option: r.selected_option,
          votesCount: Number(r.votes_count || 0),
          coefSum: Math.round(Number(r.coef_sum || 0) * 10000) / 10000,
        };
        totalVotedWeight += Number(r.coef_sum || 0);
        totalVotes += Number(r.votes_count || 0);
      }

      const breakdown = opts.map((opt) => {
        const entry = byOpt[opt] || { option: opt, votesCount: 0, coefSum: 0 };
        const denomPresent = presentCoef > 0 ? presentCoef : totalVotedWeight;
        return {
          option: opt,
          votesCount: entry.votesCount,
          coefSum: entry.coefSum,
          pctOfPresent: denomPresent > 0 ? Math.round((entry.coefSum / denomPresent) * 10000) / 100 : 0,
          pctOfTotal: totalCoef > 0 ? Math.round((entry.coefSum / totalCoef) * 10000) / 100 : 0,
        };
      });

      return {
        id: p.id,
        title: p.getString('title'),
        description: p.getString('description'),
        majority_type: p.getString('majority_type'),
        vote_mode: p.getString('vote_mode'),
        status: p.getString('status'),
        totalVotes,
        totalVotedWeight: Math.round(totalVotedWeight * 10000) / 10000,
        breakdown,
      };
    });

    return e.json(200, {
      ok: true,
      assembly: {
        id: asm.id,
        code: asm.getString('code'),
        title: asm.getString('title'),
        assembly_type: asm.getString('assembly_type'),
        status: asm.getString('status'),
        convocation_num: asm.getInt('convocation_num'),
        quorum_required_pct: requiredPct,
      },
      quorum: {
        totalUnits: Number(totalCoefRow.total_units || 0),
        totalCoef: Math.round(totalCoef * 10000) / 10000,
        presentUnits: Number(attRow.present_units || 0),
        presentCoef: Math.round(presentCoef * 10000) / 10000,
        quorumPct,
        quorumReached: quorumPct >= requiredPct,
      },
      polls: pollSummaries,
    });
  } catch (err) {
    return e.json(500, { ok: false, message: 'Error al calcular resumen de asamblea: ' + String(err) });
  }
});
