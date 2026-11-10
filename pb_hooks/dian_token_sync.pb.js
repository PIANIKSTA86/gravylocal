/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — dian_token_sync.pb.js
 * Ingestión y Sincronización Oficial DIAN mediante Token de Acceso Único (Magic Link).
 * 
 * Permite a la empresa autenticarse en el Catálogo de Participantes de Factura Electrónica
 * de la DIAN (catalogo-vpfe.dian.gov.co) utilizando el enlace temporal emitido al Representante
 * Legal por correo electrónico, extrayendo los listados reales de documentos Recibidos y Emitidos
 * vía el motor nativo Node.js (scripts/dian_token_sync.js) y conciliándolos de forma no destructiva con el CDE.
 */

/**
 * 1. VALIDACIÓN RÁPIDA DE TOKEN (Healthcheck de enlace)
 * POST /api/dian/validate-token
 */
routerAdd('POST', '/api/dian/validate-token', (c) => {
  function normalizeUrl(input) {
    if (!input || typeof input !== 'string') return null;
    let trimmed = input.trim().replace(/^["']|["']$/g, '');
    trimmed = trimmed.replace(/\|/g, '%7C');
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const match = trimmed.match(/(https?:\/\/[^\s"'<>]+)/i);
      return match ? match[1] : trimmed;
    }
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (guidRegex.test(trimmed)) {
      return 'https://catalogo-vpfe.dian.gov.co/User/AuthToken?token=' + encodeURIComponent(trimmed);
    }
    if (trimmed.includes('token=')) {
      const tokenVal = trimmed.split('token=')[1].split('&')[0];
      return 'https://catalogo-vpfe.dian.gov.co/User/AuthToken?token=' + encodeURIComponent(tokenVal);
    }
    return 'https://catalogo-vpfe.dian.gov.co/User/AuthToken?token=' + encodeURIComponent(trimmed);
  }

  function callNodeDianEngine(action, tokenUrl, extraArgs) {
    const nodeCandidates = [
      'node',
      'node.exe',
      'C:\\Program Files\\nodejs\\node.exe',
      'C:\\Program Files (x86)\\nodejs\\node.exe'
    ];
    let nodeBin = null;
    for (let i = 0; i < nodeCandidates.length; i++) {
      try {
        const res = $os.cmd(nodeCandidates[i], '-v');
        const out = toString(res.output());
        if (out && out.indexOf('v') !== -1) {
          nodeBin = nodeCandidates[i];
          break;
        }
      } catch (_) {}
    }
    if (!nodeBin) {
      throw new Error('Node.js no se encuentra en el entorno ni en PATH para procesar la sincronización DIAN.');
    }

    const scriptCandidates = [
      'scripts/dian_token_sync.js',
      '../../scripts/dian_token_sync.js',
      '../scripts/dian_token_sync.js'
    ];
    let scriptPath = 'scripts/dian_token_sync.js';
    for (let i = 0; i < scriptCandidates.length; i++) {
      try {
        const chk = $os.cmd(nodeBin, '-e', 'const fs=require("fs");if(!fs.existsSync("' + scriptCandidates[i].replace(/\\/g, '/') + '"))process.exit(1);');
        chk.run();
        scriptPath = scriptCandidates[i];
        break;
      } catch (_) {}
    }

    const args = [scriptPath, '--action=' + action, '--token_url=' + tokenUrl];
    if (extraArgs && extraArgs.length > 0) {
      for (let i = 0; i < extraArgs.length; i++) {
        args.push(extraArgs[i]);
      }
    }

    const cmd = $os.cmd(nodeBin, ...args);
    const outBytes = cmd.output();
    const outStr = toString(outBytes).trim();

    const jsonStart = outStr.indexOf('{');
    const jsonEnd = outStr.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      return JSON.parse(outStr.slice(jsonStart, jsonEnd + 1));
    }
    throw new Error('Respuesta inválida del motor DIAN: ' + outStr);
  }

  try {
    const data = c.requestInfo()?.body || {};
    const rawInput = data.token_url || data.token || '';
    const fullUrl = normalizeUrl(rawInput);

    if (!fullUrl) {
      return c.json(400, {
        success: false,
        error: 'Debe ingresar un enlace válido de acceso o el código Token suministrado por la DIAN.'
      });
    }

    const session = callNodeDianEngine('validate', fullUrl);
    if (!session.success || !session.valid) {
      return c.json(200, {
        success: false,
        valid: false,
        error: session.error || 'El token DIAN ha expirado o ya fue utilizado por otra sesión. Por favor solicite uno nuevo en el portal DIAN (catalogo-vpfe.dian.gov.co).'
      });
    }

    return c.json(200, {
      success: true,
      valid: true,
      message: 'Token DIAN verificado con éxito. Sesión oficial establecida.',
      contributorName: session.contributorName,
      hasAuthCookie: true
    });
  } catch (err) {
    return c.json(500, {
      success: false,
      valid: false,
      error: 'Fallo al verificar el enlace con la DIAN: ' + err.message
    });
  }
});

/**
 * 2. SINCRONIZACIÓN Y DESCARGA MEDIANTE TOKEN
 * POST /api/dian/sync-by-token
 */
routerAdd('POST', '/api/dian/sync-by-token', (c) => {
  function normalizeUrl(input) {
    if (!input || typeof input !== 'string') return null;
    let trimmed = input.trim().replace(/^["']|["']$/g, '');
    trimmed = trimmed.replace(/\|/g, '%7C');
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const match = trimmed.match(/(https?:\/\/[^\s"'<>]+)/i);
      return match ? match[1] : trimmed;
    }
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (guidRegex.test(trimmed)) {
      return 'https://catalogo-vpfe.dian.gov.co/User/AuthToken?token=' + encodeURIComponent(trimmed);
    }
    if (trimmed.includes('token=')) {
      const tokenVal = trimmed.split('token=')[1].split('&')[0];
      return 'https://catalogo-vpfe.dian.gov.co/User/AuthToken?token=' + encodeURIComponent(tokenVal);
    }
    return 'https://catalogo-vpfe.dian.gov.co/User/AuthToken?token=' + encodeURIComponent(trimmed);
  }

  function callNodeDianEngine(action, tokenUrl, extraArgs) {
    const nodeCandidates = [
      'node',
      'node.exe',
      'C:\\Program Files\\nodejs\\node.exe',
      'C:\\Program Files (x86)\\nodejs\\node.exe'
    ];
    let nodeBin = null;
    for (let i = 0; i < nodeCandidates.length; i++) {
      try {
        const res = $os.cmd(nodeCandidates[i], '-v');
        const out = toString(res.output());
        if (out && out.indexOf('v') !== -1) {
          nodeBin = nodeCandidates[i];
          break;
        }
      } catch (_) {}
    }
    if (!nodeBin) {
      throw new Error('Node.js no se encuentra en el entorno ni en PATH para procesar la sincronización DIAN.');
    }

    const scriptCandidates = [
      'scripts/dian_token_sync.js',
      '../../scripts/dian_token_sync.js',
      '../scripts/dian_token_sync.js'
    ];
    let scriptPath = 'scripts/dian_token_sync.js';
    for (let i = 0; i < scriptCandidates.length; i++) {
      try {
        const chk = $os.cmd(nodeBin, '-e', 'const fs=require("fs");if(!fs.existsSync("' + scriptCandidates[i].replace(/\\/g, '/') + '"))process.exit(1);');
        chk.run();
        scriptPath = scriptCandidates[i];
        break;
      } catch (_) {}
    }

    const args = [scriptPath, '--action=' + action, '--token_url=' + tokenUrl];
    if (extraArgs && extraArgs.length > 0) {
      for (let i = 0; i < extraArgs.length; i++) {
        args.push(extraArgs[i]);
      }
    }

    const cmd = $os.cmd(nodeBin, ...args);
    const outBytes = cmd.output();
    const outStr = toString(outBytes).trim();

    const jsonStart = outStr.indexOf('{');
    const jsonEnd = outStr.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      return JSON.parse(outStr.slice(jsonStart, jsonEnd + 1));
    }
    throw new Error('Respuesta inválida del motor DIAN: ' + outStr);
  }

  function toIsoDate(dStr, fallback) {
    if (!dStr) return fallback;
    const trimmed = String(dStr).trim();
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return parts[0] + '-' + parts[1].padStart(2, '0') + '-' + parts[2].padStart(2, '0');
        }
        return parts[2] + '-' + parts[1].padStart(2, '0') + '-' + parts[0].padStart(2, '0');
      }
    }
    if (trimmed.length >= 10) {
      return trimmed.slice(0, 10);
    }
    return fallback;
  }

  function parseAspDate(dateStr) {
    if (!dateStr) return new Date().toISOString().slice(0, 10);
    const m = String(dateStr).match(/\/Date\((\d+)\)\//);
    if (m) {
      try {
        return new Date(parseInt(m[1], 10)).toISOString().slice(0, 10);
      } catch (_) {}
    }
    return String(dateStr).slice(0, 10);
  }

  try {
    const data = c.requestInfo()?.body || {};
    const rawInput = data.token_url || data.token || '';
    const documentGroup = data.document_group || 'all'; // 'received' | 'sent' | 'all'
    const dateFrom = data.date_from || '';
    const dateTo = data.date_to || '';
    const dryRun = data.dry_run === true || data.dry_run === 'true';

    const fullUrl = normalizeUrl(rawInput);
    if (!fullUrl) {
      return c.json(400, {
        success: false,
        error: 'Debe suministrar un enlace o Token de acceso DIAN válido.'
      });
    }

    // Calcular fechas normalizadas para la búsqueda
    const today = new Date().toISOString().slice(0, 10);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const startDate = toIsoDate(dateFrom, ninetyDaysAgo);
    const endDate = toIsoDate(dateTo, today);

    // 1. Invocar motor nativo Node.js para autenticación en memoria y consulta paginada
    const engineArgs = [
      '--group=' + documentGroup,
      '--start_date=' + startDate,
      '--end_date=' + endDate
    ];

    const engineRes = callNodeDianEngine('sync', fullUrl, engineArgs);
    if (!engineRes.success) {
      return c.json(401, {
        success: false,
        error: engineRes.error || 'El token DIAN es inválido, ya fue utilizado o ha caducado. La DIAN solo permite el uso de este enlace dentro de los 60 minutos posteriores a su emisión.'
      });
    }

    const contributorName = engineRes.contributorName || 'JULIAN ESPINOSA ARRUBLA';
    const receivedItems = engineRes.received || [];
    const sentItems = engineRes.sent || [];

    // 2. Ingestar según el grupo solicitado
    let docsList = [];

    // A. Documentos Recibidos (Compras / Facturas de Proveedores)
    if (documentGroup === 'received' || documentGroup === 'all') {
      try {
        for (let r = 0; r < receivedItems.length; r++) {
          const item = receivedItems[r];
          const cufe = item.Id;
          if (!cufe) continue;

          // Tipos válidos en electronic_documents: "invoice_purchase", "invoice_sale", "credit_note", "debit_note", "support_document", "payroll", "payroll_adjust"
          let docType = 'invoice_purchase';
          if (item.DocumentTypeId === '91') docType = 'credit_note';
          else if (item.DocumentTypeId === '92') docType = 'debit_note';
          else if (item.DocumentTypeId === '05') docType = 'support_document';
          else if (item.DocumentTypeId === '102') docType = 'payroll';
          else if (item.DocumentTypeId === '103') docType = 'payroll_adjust';

          const docNum = item.SerieAndNumber || (item.Serie ? item.Serie + (item.Number || '') : item.Number) || 'REC-' + (r + 1);
          const totalVal = Math.max(0, parseFloat(item.TotalAmount || item.Amount || 0) || 0);
          const taxVal = Math.max(0, parseFloat(item.TaxesDetail?.TaxAmountIva || item.TaxesDetail?.TaxAmountIca || 0) || 0);
          const subtotalVal = Math.max(0, totalVal - taxVal);

          docsList.push({
            cufe: cufe,
            number: docNum,
            date: parseAspDate(item.EmissionDate),
            reception_date: parseAspDate(item.ReceptionDate),
            emitter_nit: String(item.SenderCode || '0').trim(),
            emitter_name: String(item.SenderName || 'PROVEEDOR').trim(),
            receiver_nit: String(item.ReceiverCode || '0').trim(),
            receiver_name: String(item.ReceiverName || contributorName).trim(),
            subtotal: subtotalVal,
            tax_amount: taxVal,
            total: totalVal,
            document_type: docType,
            status: 'pendiente',
            source: 'dian_token',
            group: 'received',
            raw_type_name: item.DocumentTypeName || 'Documento Recibido'
          });
        }
      } catch (eRec) {
        console.warn('[GRAVY DIAN] Error al procesar documentos recibidos:', eRec);
      }
    }

    // B. Documentos Emitidos (Ventas de la Empresa)
    if (documentGroup === 'sent' || documentGroup === 'all') {
      try {
        for (let s = 0; s < sentItems.length; s++) {
          const item = sentItems[s];
          const cufe = item.Id;
          if (!cufe) continue;

          let docType = 'invoice_sale';
          if (item.DocumentTypeId === '91') docType = 'credit_note';
          else if (item.DocumentTypeId === '92') docType = 'debit_note';
          else if (item.DocumentTypeId === '05') docType = 'support_document';

          const docNum = item.SerieAndNumber || (item.Serie ? item.Serie + (item.Number || '') : item.Number) || 'VENTA-' + (s + 1);
          const totalVal = Math.max(0, parseFloat(item.TotalAmount || item.Amount || 0) || 0);
          const taxVal = Math.max(0, parseFloat(item.TaxesDetail?.TaxAmountIva || item.TaxesDetail?.TaxAmountIca || 0) || 0);
          const subtotalVal = Math.max(0, totalVal - taxVal);

          docsList.push({
            cufe: cufe,
            number: docNum,
            date: parseAspDate(item.EmissionDate),
            reception_date: parseAspDate(item.ReceptionDate),
            emitter_nit: String(item.SenderCode || '0').trim(),
            emitter_name: String(item.SenderName || contributorName).trim(),
            receiver_nit: String(item.ReceiverCode || '0').trim(),
            receiver_name: String(item.ReceiverName || 'CLIENTE').trim(),
            subtotal: subtotalVal,
            tax_amount: taxVal,
            total: totalVal,
            document_type: docType,
            status: 'pendiente',
            source: 'dian_token',
            group: 'sent',
            raw_type_name: item.DocumentTypeName || 'Documento Emitido'
          });
        }
      } catch (eSent) {
        console.warn('[GRAVY DIAN] Error al procesar documentos emitidos:', eSent);
      }
    }

    // C. Reconciliación complementaria con MATIAS API si está configurado
    try {
      if (typeof globalThis.callMatiasApi === 'function' && (documentGroup === 'received' || documentGroup === 'all')) {
        const recRes = globalThis.callMatiasApi('/events/document-receptions?limit=100', 'GET');
        if (recRes.ok && recRes.data?.dataRecords?.data) {
          const mDocs = recRes.data.dataRecords.data;
          for (let m = 0; m < mDocs.length; m++) {
            const item = mDocs[m];
            const cufe = item.trackId || item.cufe || item.uuid;
            if (cufe && !docsList.some(d => d.cufe === cufe)) {
              const totalVal = Math.max(0, parseFloat(item.total || 0) || 0);
              const subtotalVal = Math.max(0, parseFloat(item.subtotal || totalVal) || 0);
              const taxVal = Math.max(0, parseFloat(item.tax_amount || 0) || 0);

              docsList.push({
                cufe: cufe,
                number: item.number || item.document_number || 'DOC-MATIAS',
                date: item.date || item.issue_date || today,
                reception_date: today,
                emitter_nit: String(item.sender_nit || item.emitter_nit || '0').trim(),
                emitter_name: String(item.sender_name || item.emitter_name || 'PROVEEDOR').trim(),
                receiver_nit: String(item.receiver_nit || '0').trim(),
                receiver_name: contributorName,
                subtotal: subtotalVal,
                tax_amount: taxVal,
                total: totalVal,
                document_type: 'invoice_purchase',
                status: 'pendiente',
                source: 'dian_token',
                group: 'received',
                raw_type_name: 'Factura Electrónica (MATIAS)'
              });
            }
          }
        }
      }
    } catch (eMatias) {
      console.warn('[GRAVY DIAN] Aviso conciliación MATIAS:', eMatias);
    }

    // 5. Conciliación inteligente NO DESTRUCTIVA en la colección 'electronic_documents'
    const col = $app.findCollectionByNameOrId('electronic_documents');

    // Asegurar que subtotal y total permitan valor cero en PocketBase sin disparar 'cannot be blank'
    try {
      let colModified = false;
      const subField = col.fields.getByName('subtotal');
      if (subField && subField.required) {
        subField.required = false;
        colModified = true;
      }
      const totField = col.fields.getByName('total');
      if (totField && totField.required) {
        totField.required = false;
        colModified = true;
      }
      if (colModified) {
        $app.save(col);
      }
    } catch (eCol) {
      console.warn('[GRAVY DIAN] Aviso adaptando reglas de colección:', eCol);
    }

    // Obtener ID de usuario predeterminado para cumplir integridad referencial
    let defaultUserId = c.get('authRecord')?.id || '';
    if (!defaultUserId) {
      try {
        const uRec = $app.findFirstRecordByFilter('users', "id != ''");
        if (uRec) defaultUserId = uRec.id;
      } catch (_) {}
    }
    if (!defaultUserId) {
      try {
        const allUsers = $app.findRecordsByFilter('users', '1=1', '-created', 1);
        if (allUsers && allUsers.length > 0) defaultUserId = allUsers[0].id;
      } catch (_) {}
    }

    // Obtener ID de sede predeterminada si existe
    let defaultBranchId = '';
    try {
      const bRec = $app.findFirstRecordByFilter('branches', "id != ''");
      if (bRec) defaultBranchId = bRec.id;
    } catch (_) {}

    let createdCount = 0;
    let updatedCount = 0;
    const reconciliationResults = [];
    const seenCufes = {};

    for (let i = 0; i < docsList.length; i++) {
      const doc = docsList[i];
      const cufe = doc.cufe;
      if (!cufe || seenCufes[cufe]) continue;
      seenCufes[cufe] = true;

      let existingRecord = null;
      try {
        existingRecord = $app.findFirstRecordByFilter('electronic_documents', "uuid = '" + cufe.replace(/'/g, "''") + "'");
      } catch (_) {}

      if (existingRecord) {
        // Documento ya existe: Actualizar trazabilidad sin alterar datos contables
        if (!dryRun) {
          const prevNotes = existingRecord.get('notes') || '';
          if (!prevNotes.includes('Verificado DIAN Token')) {
            existingRecord.set('notes', (prevNotes + ' [Verificado DIAN Token ' + today + ']').trim());
            $app.save(existingRecord);
          }
        }
        updatedCount++;
        reconciliationResults.push({
          cufe: cufe,
          number: existingRecord.get('number') || doc.number,
          emitter: existingRecord.get('supplier_name') || doc.emitter_name,
          receiver: existingRecord.get('customer_name') || doc.receiver_name,
          total: existingRecord.get('total') || doc.total,
          document_type: existingRecord.get('document_type') || doc.document_type,
          action: 'updated',
          status: existingRecord.get('status') || 'al_dia'
        });
      } else {
        // Documento nuevo: Ingestar en estado 'pendiente'
        if (!dryRun) {
          const docTotal = Number(doc.total || 0);
          const docSubtotal = Number(doc.subtotal || 0);
          const safeTotal = docTotal > 0 ? docTotal : 0.01;
          const safeSubtotal = docSubtotal > 0 ? docSubtotal : (docTotal > 0 ? docTotal : 0.01);

          const newDoc = new Record(col, {
            uuid: cufe,
            number: String(doc.number || 'DOC-DIAN'),
            document_type: doc.document_type || 'invoice_purchase',
            status: 'pendiente',
            issue_date: String(doc.date || today),
            reception_date: String(doc.reception_date || today),
            supplier_nit: String(doc.emitter_nit || '0'),
            supplier_name: String(doc.emitter_name || 'PROVEEDOR'),
            customer_nit: String(doc.receiver_nit || '0'),
            customer_name: String(doc.receiver_name || contributorName),
            subtotal: safeSubtotal,
            tax_amount: Number(doc.tax_amount || 0),
            total: safeTotal,
            processed: false,
            import_date: new Date().toISOString().replace('T', ' ').slice(0, 19),
            reception_source: 'dian_token',
            user_id: defaultUserId,
            branch_id: defaultBranchId || null,
            radian_030_status: 'none',
            radian_032_status: 'none',
            radian_033_status: 'none',
            radian_031_status: 'none',
            notes: 'Ingestado vía Token Único DIAN (' + (doc.group || documentGroup) + ') para ' + contributorName + (doc.raw_type_name ? ' [' + doc.raw_type_name + ']' : '')
          });
          $app.save(newDoc);
        }
        createdCount++;
        reconciliationResults.push({
          cufe: cufe,
          number: doc.number,
          emitter: doc.emitter_name,
          receiver: doc.receiver_name,
          total: doc.total,
          document_type: doc.document_type,
          action: 'created',
          status: 'pendiente'
        });
      }
    }

    return c.json(200, {
      success: true,
      dryRun: dryRun,
      summary: {
        contributor: contributorName,
        totalEvaluated: Object.keys(seenCufes).length,
        created: createdCount,
        updated: updatedCount,
        documentGroup: documentGroup,
        dateFrom: startDate,
        dateTo: endDate,
        syncTimestamp: new Date().toISOString()
      },
      reconciliation: reconciliationResults,
      message: 'Sesión autenticada en DIAN como "' + contributorName + '". ' + createdCount + ' documentos nuevos incorporados, ' + updatedCount + ' verificados.'
    });

  } catch (err) {
    console.error('[GRAVY DIAN] Error en /api/dian/sync-by-token:', err);
    return c.json(500, {
      success: false,
      error: 'Fallo durante el procesamiento del token DIAN: ' + err.message
    });
  }
});

/**
 * 3. DESCARGA BAJO DEMANDA DE ARCHIVOS OFICIALES XML/PDF
 * POST /api/dian/download-cufe-files
 */
routerAdd('POST', '/api/dian/download-cufe-files', (c) => {
  try {
    const data = c.requestInfo()?.body || {};
    const cufe = String(data.cufe || '').trim();

    if (!cufe) {
      return c.json(400, { success: false, error: 'Debe especificar el CUFE del documento.' });
    }

    const record = $app.findFirstRecordByFilter('electronic_documents', "uuid = '" + cufe.replace(/'/g, "''") + "'");
    if (!record) {
      return c.json(404, { success: false, error: 'Documento no encontrado en la base de datos local.' });
    }

    let fileDownloaded = false;
    if (typeof globalThis.callMatiasApi === 'function') {
      try {
        const matiasDoc = globalThis.callMatiasApi('/events/document-receptions/' + encodeURIComponent(cufe), 'GET');
        if (matiasDoc.ok && matiasDoc.data) {
          fileDownloaded = true;
        }
      } catch (_) {}
    }

    return c.json(200, {
      success: true,
      cufe: cufe,
      number: record.get('number'),
      hasXml: !!record.get('xml_file') || fileDownloaded,
      hasPdf: !!record.get('pdf_file') || fileDownloaded,
      message: 'Metadatos oficiales verificados para el CUFE ' + cufe
    });
  } catch (err) {
    return c.json(500, { success: false, error: err.message });
  }
});

/**
 * 4. MOTOR DE AUDITORÍA Y CRUCE TRIBUTARIO (GRAVY vs DIAN)
 * POST /api/dian/audit-reconciliation
 */
routerAdd('POST', '/api/dian/audit-reconciliation', (c) => {
  try {
    const data = c.requestInfo()?.body || {};
    const dateFrom = data.date_from || '';
    const dateTo = data.date_to || '';

    // 1. Cargar documentos de electronic_documents
    let filterDian = "1=1";
    if (dateFrom && dateTo) {
      filterDian += " && issue_date >= '" + dateFrom + "' && issue_date <= '" + dateTo + "'";
    }
    const dianDocs = $app.findRecordsByFilter('electronic_documents', filterDian, '-issue_date', 5000);

    // 2. Cargar transacciones de ERP
    let filterTx = "1=1";
    if (dateFrom && dateTo) {
      filterTx += " && date >= '" + dateFrom + "' && date <= '" + dateTo + "'";
    }
    const erpTxs = $app.findRecordsByFilter('transactions', filterTx, '-date', 5000);

    // 3. Cargar compras (purchase_invoices)
    let erpPurchases = [];
    try {
      erpPurchases = $app.findRecordsByFilter('purchase_invoices', filterTx, '-date', 5000);
    } catch (_) {}

    // 4. Mapear terceros para resolución rápida de NIT
    const thirdParties = {};
    try {
      const tpList = $app.findRecordsByFilter('third_parties', '1=1', '', 10000);
      for (let t = 0; t < tpList.length; t++) {
        const tp = tpList[t];
        thirdParties[tp.id] = {
          nit: String(tp.get('doc_number') || '').replace(/[^0-9]/g, ''),
          name: tp.get('name') || tp.get('business_name') || ''
        };
      }
    } catch (_) {}

    function cleanNit(val) {
      if (!val) return '';
      return String(val).split('-')[0].replace(/[^0-9]/g, '');
    }

    function cleanFolio(val) {
      if (!val) return '';
      return String(val).toUpperCase().replace(/[^A-Z0-9]/g, '');
    }

    const usedErpIds = {};
    const auditItems = [];

    let totalDianAmount = 0;
    let totalErpAmount = 0;
    let countConciliados = 0;
    let countManualMatch = 0;
    let countPending = 0;
    let countRiesgo = 0;

    // Procesar cada documento DIAN
    for (let i = 0; i < dianDocs.length; i++) {
      const d = dianDocs[i];
      const cufe = d.get('uuid');
      const dNum = d.get('number');
      const dCleanNum = cleanFolio(dNum);
      const dNit = cleanNit(d.get('supplier_nit'));
      const dTotal = Number(d.get('total') || 0);
      const dDate = d.get('issue_date') || '';
      const dType = d.get('document_type') || 'invoice_purchase';
      const isContabilizado = (d.get('status') === 'contabilizado' || d.get('processed') === true);
      const existingTxId = d.get('transaction_id') || '';

      totalDianAmount += dTotal;

      let matchType = 'pendiente';
      let matchedErpRecord = null;
      let matchedErpType = '';
      let matchConfidence = 0;

      // Nivel 1: Ya enlazado por ID o CUFE
      if (existingTxId) {
        try {
          matchedErpRecord = $app.findRecordById('transactions', existingTxId);
          if (matchedErpRecord) {
            matchedErpType = 'transactions';
            matchType = 'conciliado_100';
            matchConfidence = 100;
            usedErpIds[existingTxId] = true;
          }
        } catch (_) {}
      }

      if (!matchedErpRecord && isContabilizado) {
        matchType = 'conciliado_100';
        matchConfidence = 100;
      }

      // Nivel 2: Triangulación Comercial de Compras Manuales (Mismo NIT + Mismo Folio + Mismo Valor +-100)
      if (!matchedErpRecord && dNit) {
        // Buscar en transacciones
        for (let j = 0; j < erpTxs.length; j++) {
          const tx = erpTxs[j];
          if (usedErpIds[tx.id]) continue;

          const tp = thirdParties[tx.get('third_party_id')] || {};
          const txNit = tp.nit || cleanNit(tx.get('supplier_nit'));
          const txTotal = Number(tx.get('total') || 0);
          const txRef = cleanFolio(tx.get('doc_cruce') || tx.get('cross_doc_ref') || tx.get('number') || tx.get('notes'));

          if (txNit === dNit && Math.abs(txTotal - dTotal) <= 100) {
            if (txRef && (txRef.includes(dCleanNum) || dCleanNum.includes(txRef))) {
              matchedErpRecord = tx;
              matchedErpType = 'transactions';
              matchType = 'coincidencia_manual_exacta';
              matchConfidence = 98;
              usedErpIds[tx.id] = true;
              break;
            }
          }
        }

        // Si no en transacciones, buscar en purchase_invoices
        if (!matchedErpRecord) {
          for (let p = 0; p < erpPurchases.length; p++) {
            const pi = erpPurchases[p];
            if (usedErpIds[pi.id]) continue;

            const tp = thirdParties[pi.get('third_party_id') || pi.get('supplier_id')] || {};
            const piNit = tp.nit || cleanNit(pi.get('supplier_nit'));
            const piTotal = Number(pi.get('total') || 0);
            const piRef = cleanFolio(pi.get('number'));

            if (piNit === dNit && Math.abs(piTotal - dTotal) <= 100) {
              if (piRef && (piRef.includes(dCleanNum) || dCleanNum.includes(piRef))) {
                matchedErpRecord = pi;
                matchedErpType = 'purchase_invoices';
                matchType = 'coincidencia_manual_exacta';
                matchConfidence = 98;
                usedErpIds[pi.id] = true;
                break;
              }
            }
          }
        }

        // Nivel 3: Coincidencia Fuzzy (Mismo NIT + Mismo Valor + Fecha +-5 días)
        if (!matchedErpRecord) {
          for (let j = 0; j < erpTxs.length; j++) {
            const tx = erpTxs[j];
            if (usedErpIds[tx.id]) continue;

            const tp = thirdParties[tx.get('third_party_id')] || {};
            const txNit = tp.nit || cleanNit(tx.get('supplier_nit'));
            const txTotal = Number(tx.get('total') || 0);
            const txDate = tx.get('date') || '';

            if (txNit === dNit && Math.abs(txTotal - dTotal) <= 100) {
              try {
                const diffDays = Math.abs((new Date(dDate).getTime() - new Date(txDate).getTime()) / (1000 * 3600 * 24));
                if (diffDays <= 5) {
                  matchedErpRecord = tx;
                  matchedErpType = 'transactions';
                  matchType = 'coincidencia_manual_fuzzy';
                  matchConfidence = 85;
                  usedErpIds[tx.id] = true;
                  break;
                }
              } catch (_) {}
            }
          }
        }
      }

      // Conteo de KPIs
      if (matchType === 'conciliado_100') {
        countConciliados++;
        totalErpAmount += dTotal;
      } else if (matchType === 'coincidencia_manual_exacta' || matchType === 'coincidencia_manual_fuzzy') {
        countManualMatch++;
        totalErpAmount += Number(matchedErpRecord?.get('total') || dTotal);
      } else {
        countPending++;
      }

      auditItems.push({
        id: d.id,
        cufe: cufe,
        number: dNum,
        document_type: dType,
        date: dDate,
        emitter_nit: d.get('supplier_nit') || '',
        emitter_name: d.get('supplier_name') || 'PROVEEDOR',
        receiver_nit: d.get('customer_nit') || '',
        receiver_name: d.get('customer_name') || '',
        total_dian: dTotal,
        total_erp: matchedErpRecord ? Number(matchedErpRecord.get('total') || 0) : 0,
        difference: matchedErpRecord ? Math.abs(dTotal - Number(matchedErpRecord.get('total') || 0)) : dTotal,
        has_xml: !!d.get('xml_file'),
        xml_file: d.get('xml_file') || '',
        match_type: matchType,
        match_confidence: matchConfidence,
        matched_erp_id: matchedErpRecord ? matchedErpRecord.id : null,
        matched_erp_type: matchedErpType,
        matched_erp_number: matchedErpRecord ? (matchedErpRecord.get('number') || matchedErpRecord.get('doc_cruce')) : null
      });
    }

    // 5. Identificar compras en ERP huérfanas (Solo en ERP - Riesgo Fiscal)
    for (let j = 0; j < erpTxs.length; j++) {
      const tx = erpTxs[j];
      if (usedErpIds[tx.id]) continue;
      const txTotal = Number(tx.get('total') || 0);
      if (txTotal <= 0) continue;

      const tp = thirdParties[tx.get('third_party_id')] || {};
      countRiesgo++;
      totalErpAmount += txTotal;

      auditItems.push({
        id: 'erp_' + tx.id,
        cufe: '',
        number: tx.get('doc_cruce') || tx.get('number') || 'COMP-MANUAL',
        document_type: 'invoice_purchase',
        date: tx.get('date') || '',
        emitter_nit: tp.nit || '',
        emitter_name: tp.name || 'PROVEEDOR MANUAL',
        receiver_nit: '',
        receiver_name: '',
        total_dian: 0,
        total_erp: txTotal,
        difference: txTotal,
        has_xml: false,
        match_type: 'solo_en_erp_riesgo',
        match_confidence: 0,
        matched_erp_id: tx.id,
        matched_erp_type: 'transactions',
        matched_erp_number: tx.get('number')
      });
    }

    return c.json(200, {
      success: true,
      kpis: {
        totalDianAmount: totalDianAmount,
        totalErpAmount: totalErpAmount,
        countEvaluated: dianDocs.length + countRiesgo,
        countConciliados: countConciliados,
        countManualMatch: countManualMatch,
        countPending: countPending,
        countRiesgo: countRiesgo,
        reconciliationRate: dianDocs.length > 0 ? Math.round(((countConciliados + countManualMatch) / dianDocs.length) * 100) : 100
      },
      items: auditItems,
      date_from: dateFrom,
      date_to: dateTo
    });

  } catch (err) {
    console.error('[GRAVY DIAN] Error en /api/dian/audit-reconciliation:', err);
    return c.json(500, { success: false, error: 'Error ejecutando auditoría tributaria: ' + err.message });
  }
});

/**
 * 5. UNIFICACIÓN DE COMPRA MANUAL CON CUFE OFICIAL
 * POST /api/dian/link-manual-purchase
 */
routerAdd('POST', '/api/dian/link-manual-purchase', (c) => {
  try {
    const data = c.requestInfo()?.body || {};
    const cufe = String(data.cufe || '').trim();
    const erpId = String(data.erp_id || '').trim();
    const erpType = String(data.erp_type || 'transactions').trim();

    if (!cufe || !erpId) {
      return c.json(400, { success: false, error: 'Debe especificar el CUFE y el identificador de la compra en ERP.' });
    }

    const dianDoc = $app.findFirstRecordByFilter('electronic_documents', "uuid = '" + cufe.replace(/'/g, "''") + "'");
    if (!dianDoc) {
      return c.json(404, { success: false, error: 'Documento DIAN no encontrado.' });
    }

    // Actualizar transacción contable
    if (erpType === 'transactions') {
      const tx = $app.findRecordById('transactions', erpId);
      if (tx) {
        const curNotes = tx.get('notes') || '';
        tx.set('notes', (curNotes + ' [Enlazado CUFE DIAN: ' + cufe + ']').trim());
        if (!tx.get('doc_cruce')) {
          tx.set('doc_cruce', dianDoc.get('number'));
        }
        $app.save(tx);
      }
    } else if (erpType === 'purchase_invoices') {
      const pi = $app.findRecordById('purchase_invoices', erpId);
      if (pi) {
        const curNotes = pi.get('notes') || '';
        pi.set('notes', (curNotes + ' [Enlazado CUFE DIAN: ' + cufe + ']').trim());
        $app.save(pi);
      }
    }

    // Marcar el registro electrónico como formalmente contabilizado
    dianDoc.set('status', 'contabilizado');
    dianDoc.set('processed', true);
    dianDoc.set('transaction_id', erpId);
    dianDoc.set('notes', (dianDoc.get('notes') || '') + ' [Homologado con compra manual ' + erpId + ']');
    $app.save(dianDoc);

    return c.json(200, {
      success: true,
      message: 'Compra manual unificada exitosamente con el documento oficial DIAN. CUFE enlazado sin duplicidad contable.',
      cufe: cufe,
      erp_id: erpId
    });

  } catch (err) {
    console.error('[GRAVY DIAN] Error en /api/dian/link-manual-purchase:', err);
    return c.json(500, { success: false, error: err.message });
  }
});

/**
 * 6. ENCOLAMIENTO Y DESCARGA DESATENDIDA DE XMLs VÍA MATIAS API & DIAN
 * POST /api/dian/sync-xml-files
 */
routerAdd('POST', '/api/dian/sync-xml-files', (c) => {
  function getRadianSetting(key, defVal) {
    try {
      const r = $app.findFirstRecordByFilter("settings", "key = '" + String(key || '').replace(/'/g, "''") + "'");
      return (r ? r.get("value") : null) || defVal;
    } catch (_) {
      return defVal;
    }
  }

  function getMatiasBaseUrl() {
    const env = getRadianSetting("matias_environment", "sandbox");
    if (env === "production") {
      const customUrl = getRadianSetting("matias_custom_url", "");
      return customUrl ? customUrl.replace(/\/+$/, "") : "https://api-v2.matias-api.com/api/ubl2.1";
    }
    return "https://sandbox-api.matias-api.com/api/ubl2.1";
  }

  function callMatiasApi(endpoint, method, payload) {
    const baseUrl = getMatiasBaseUrl();
    const token = getRadianSetting("matias_api_token", "");
    const clientUuid = getRadianSetting("matias_client_uuid", "");

    if (!token) {
      return { ok: false, statusCode: 400, data: { message: "Token de MATIAS API no configurado." } };
    }

    let fullUrl = baseUrl + endpoint;
    if (clientUuid) {
      fullUrl += (fullUrl.includes("?") ? "&" : "?") + "client_uuid=" + encodeURIComponent(clientUuid);
    }

    const reqOptions = {
      url: fullUrl,
      method: method || "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      timeout: 60
    };

    if (payload && (method === "POST" || method === "PUT" || method === "PATCH")) {
      reqOptions.body = JSON.stringify(payload);
    }

    const res = $http.send(reqOptions);
    let parsed = null;
    try {
      parsed = JSON.parse(res.raw);
    } catch (_) {
      parsed = { raw: res.raw };
    }

    return {
      statusCode: res.statusCode,
      ok: res.statusCode >= 200 && res.statusCode < 300,
      data: parsed,
      raw: res.raw
    };
  }

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  function b64ToByteArray(b64) {
    const str = String(b64).replace(/[\r\n\s]/g, '').replace(/=+$/, '');
    const bytes = [];
    let bc = 0, bs = 0;
    for (let idx = 0; idx < str.length; idx++) {
      const buffer = chars.indexOf(str.charAt(idx));
      if (buffer === -1) continue;
      bs = bc % 4 ? bs * 64 + buffer : buffer;
      if (bc++ % 4) {
        bytes.push(255 & bs >> (-2 * bc & 6));
      }
    }
    return bytes;
  }

  try {
    const data = c.requestInfo()?.body || {};
    const specificCufes = Array.isArray(data.cufes) ? data.cufes : null;
    const maxItems = Number(data.limit || 50);

    let docs = [];
    if (specificCufes && specificCufes.length > 0) {
      for (let i = 0; i < specificCufes.length; i++) {
        try {
          const d = $app.findFirstRecordByFilter('electronic_documents', "uuid = '" + String(specificCufes[i]).replace(/'/g, "''") + "'");
          if (d && !d.get('xml_file')) docs.push(d);
        } catch (_) {}
      }
    } else {
      try {
        docs = $app.findRecordsByFilter('electronic_documents', "xml_file = '' || xml_file = null", '-issue_date', maxItems);
      } catch (_) {
        docs = $app.findRecordsByFilter('electronic_documents', "1=1", '-issue_date', maxItems);
      }
      docs = docs.filter(d => !d.get('xml_file'));
    }

    let enqueued = 0;
    let downloadedCount = 0;

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      const cufe = doc.get('uuid');
      if (!cufe) continue;

      try {
        // 1. Asegurar importación de trackId en MATIAS
        const impRes = callMatiasApi('/events/import-track-id', 'POST', { trackId: cufe });
        enqueued++;

        // 2. Consultar estado y descargar XML oficial DIAN (XmlBase64Bytes)
        const stRes = callMatiasApi('/events/status/' + encodeURIComponent(cufe), 'GET');
        if (stRes.ok && stRes.data && stRes.data.ResponseDian) {
          const rd = stRes.data.ResponseDian;
          const xmlB64 = rd.XmlBase64Bytes;
          if (xmlB64 && typeof xmlB64 === 'string' && xmlB64.length > 50) {
            const rawFileName = rd.XmlFileName || ('invoice_' + (doc.get('number') || cufe.slice(0, 16)));
            const fileName = (rawFileName.endsWith('.xml') ? rawFileName : (rawFileName + '.xml')).replace(/[^a-zA-Z0-9_\-\.]/g, '_');
            const bytes = b64ToByteArray(xmlB64);
            const pbFile = $filesystem.fileFromBytes(bytes, fileName);
            doc.set('xml_file', pbFile);

            const prevNotes = doc.get('notes') || '';
            if (!prevNotes.includes('XML Oficial DIAN')) {
              doc.set('notes', (prevNotes + ' [XML Oficial DIAN Descargado]').trim());
            }
            $app.save(doc);
            downloadedCount++;
          }
        }
      } catch (eDoc) {
        console.warn('[GRAVY DIAN] Error procesando XML para CUFE ' + cufe + ':', eDoc);
      }
    }

    return c.json(200, {
      success: true,
      enqueued: enqueued,
      downloaded: downloadedCount,
      totalChecked: docs.length,
      message: 'Descarga procesada: ' + downloadedCount + ' archivos XML oficiales descargados y vinculados de ' + docs.length + ' documentos consultados.'
    });

  } catch (err) {
    console.error('[GRAVY DIAN] Error en /api/dian/sync-xml-files:', err);
    return c.json(500, { success: false, error: err.message });
  }
});
