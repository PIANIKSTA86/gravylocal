/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_ph_voting.pb.js
 * Crea las colecciones de Votaciones y Asambleas PH (Ley 675 de 2001):
 * - ph_assemblies
 * - ph_proxies
 * - ph_assembly_attendees
 * - ph_polls
 * - ph_votes
 */

onBootstrap((e) => {
  e.next();

  let usersId = '';
  let phPropertiesId = '';
  try {
    usersId = $app.findCollectionByNameOrId('users').id;
    phPropertiesId = $app.findCollectionByNameOrId('ph_properties').id;
  } catch (err) {
    console.log('[GRAVY-PH-VOTING] Aviso: colecciones base no encontradas: ' + err);
    return;
  }

  const adminRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'superadmin')";
  const authRule = "@request.auth.id != ''";

  // 1. ph_assemblies
  let assembliesId = '';
  try {
    assembliesId = $app.findCollectionByNameOrId('ph_assemblies').id;
  } catch (_) {
    const col = new Collection({
      name: 'ph_assemblies',
      type: 'base',
      listRule: authRule,
      viewRule: authRule,
      createRule: adminRule,
      updateRule: adminRule,
      deleteRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'superadmin')",
      fields: [
        { name: 'code',                   type: 'text',   required: true },
        { name: 'title',                  type: 'text',   required: true },
        { name: 'description',            type: 'text',   required: false },
        { name: 'assembly_type',          type: 'select', required: true, values: ['ORDINARIA', 'EXTRAORDINARIA', 'CONSULTA_MOVIL'] },
        { name: 'status',                 type: 'select', required: true, values: ['scheduled', 'checkin_open', 'in_session', 'closed'] },
        { name: 'convocation_num',        type: 'number', required: false, min: 1, max: 2 },
        { name: 'scheduled_at',           type: 'text',   required: true },
        { name: 'quorum_required_pct',    type: 'number', required: false, min: 0, max: 100 },
        { name: 'max_proxies_per_user',   type: 'number', required: false, min: 0 },
        { name: 'allow_delinquent_in_poll', type: 'bool', required: false },
      ],
      indexes: ['CREATE UNIQUE INDEX IF NOT EXISTS idx_ph_asm_code ON ph_assemblies (code)'],
    });
    $app.save(col);
    assembliesId = col.id;
    console.log('[GRAVY-PH-VOTING] Colección ph_assemblies creada.');
  }

  // 2. ph_proxies
  let proxiesId = '';
  try {
    proxiesId = $app.findCollectionByNameOrId('ph_proxies').id;
  } catch (_) {
    const col = new Collection({
      name: 'ph_proxies',
      type: 'base',
      listRule: authRule,
      viewRule: authRule,
      createRule: authRule,
      updateRule: adminRule,
      deleteRule: adminRule,
      fields: [
        { name: 'assembly_id',          type: 'relation', required: true,  collectionId: assembliesId, cascadeDelete: true },
        { name: 'property_id',          type: 'relation', required: true,  collectionId: phPropertiesId, cascadeDelete: false },
        { name: 'grantor_user_id',      type: 'relation', required: false, collectionId: usersId, cascadeDelete: false },
        { name: 'proxy_holder_user_id', type: 'relation', required: false, collectionId: usersId, cascadeDelete: false },
        { name: 'proxy_holder_name',    type: 'text',     required: true },
        { name: 'proxy_holder_doc',     type: 'text',     required: true },
        { name: 'document_file',        type: 'file',     required: false, maxSelect: 1, maxSize: 2097152, mimeTypes: ['image/*', 'application/pdf'] },
        { name: 'status',               type: 'select',   required: true,  values: ['pending', 'approved', 'rejected'] },
        { name: 'reviewed_by',          type: 'text',     required: false },
        { name: 'notes',                type: 'text',     required: false },
      ],
      indexes: ['CREATE INDEX IF NOT EXISTS idx_ph_proxy_asm_prop ON ph_proxies (assembly_id, property_id, status)'],
    });
    $app.save(col);
    proxiesId = col.id;
    console.log('[GRAVY-PH-VOTING] Colección ph_proxies creada.');
  }

  // 3. ph_assembly_attendees
  try {
    $app.findCollectionByNameOrId('ph_assembly_attendees');
  } catch (_) {
    const col = new Collection({
      name: 'ph_assembly_attendees',
      type: 'base',
      listRule: authRule,
      viewRule: authRule,
      createRule: authRule,
      updateRule: adminRule,
      deleteRule: adminRule,
      fields: [
        { name: 'assembly_id',           type: 'relation', required: true,  collectionId: assembliesId, cascadeDelete: true },
        { name: 'property_id',           type: 'relation', required: true,  collectionId: phPropertiesId, cascadeDelete: false },
        { name: 'attendee_user_id',      type: 'relation', required: false, collectionId: usersId, cascadeDelete: false },
        { name: 'represented_by_proxy_id', type: 'relation', required: false, collectionId: proxiesId, cascadeDelete: false },
        { name: 'coef_snapshot',         type: 'number',   required: true,  min: 0, max: 100 },
        { name: 'checkin_at',            type: 'text',     required: true },
        { name: 'checkout_at',           type: 'text',     required: false },
      ],
      indexes: ['CREATE UNIQUE INDEX IF NOT EXISTS idx_ph_att_asm_prop ON ph_assembly_attendees (assembly_id, property_id)'],
    });
    $app.save(col);
    console.log('[GRAVY-PH-VOTING] Colección ph_assembly_attendees creada.');
  }

  // 4. ph_polls
  let pollsId = '';
  try {
    pollsId = $app.findCollectionByNameOrId('ph_polls').id;
  } catch (_) {
    const col = new Collection({
      name: 'ph_polls',
      type: 'base',
      listRule: authRule,
      viewRule: authRule,
      createRule: adminRule,
      updateRule: adminRule,
      deleteRule: adminRule,
      fields: [
        { name: 'assembly_id',   type: 'relation', required: true,  collectionId: assembliesId, cascadeDelete: true },
        { name: 'title',         type: 'text',     required: true },
        { name: 'description',   type: 'text',     required: false },
        { name: 'majority_type', type: 'select',   required: true,  values: ['SIMPLE_COEF', 'QUALIFIED_70_COEF', 'UNIT_COUNT'] },
        { name: 'vote_mode',     type: 'select',   required: true,  values: ['NOMINAL', 'SECRET'] },
        { name: 'options',       type: 'json',     required: true },
        { name: 'status',        type: 'select',   required: true,  values: ['draft', 'open', 'closed'] },
        { name: 'opens_at',      type: 'text',     required: false },
        { name: 'closes_at',     type: 'text',     required: false },
      ],
      indexes: ['CREATE INDEX IF NOT EXISTS idx_ph_poll_asm ON ph_polls (assembly_id, status)'],
    });
    $app.save(col);
    pollsId = col.id;
    console.log('[GRAVY-PH-VOTING] Colección ph_polls creada.');
  }

  // 5. ph_votes (inmutable: updateRule = null, deleteRule = null)
  try {
    $app.findCollectionByNameOrId('ph_votes');
  } catch (_) {
    const col = new Collection({
      name: 'ph_votes',
      type: 'base',
      listRule: authRule,
      viewRule: authRule,
      createRule: authRule,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'poll_id',         type: 'relation', required: true,  collectionId: pollsId, cascadeDelete: true },
        { name: 'property_id',     type: 'relation', required: true,  collectionId: phPropertiesId, cascadeDelete: false },
        { name: 'voter_user_id',   type: 'relation', required: false, collectionId: usersId, cascadeDelete: false },
        { name: 'selected_option', type: 'text',     required: true },
        { name: 'coef_weight',     type: 'number',   required: true,  min: 0 },
        { name: 'vote_hash',       type: 'text',     required: true },
        { name: 'cast_at',         type: 'text',     required: true },
      ],
      indexes: ['CREATE UNIQUE INDEX IF NOT EXISTS idx_ph_vote_unique ON ph_votes (poll_id, property_id)'],
    });
    $app.save(col);
    console.log('[GRAVY-PH-VOTING] Colección ph_votes creada.');
  }
});
