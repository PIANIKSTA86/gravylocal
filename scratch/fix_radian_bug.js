const fs = require('fs');

// 1. Fix pb_hooks/radian.pb.js
let radianCode = fs.readFileSync('pb_hooks/radian.pb.js', 'utf8');

// Ensure getMatiasCaller exists
if (!radianCode.includes('function getMatiasCaller()')) {
  const callerHelper = `
function getMatiasCaller() {
  if (typeof callMatiasApi === 'function') return callMatiasApi;
  if (typeof globalThis.callMatiasApi === 'function') return globalThis.callMatiasApi;
  throw new Error("El conector de MATIAS API no está disponible en este servidor.");
}
globalThis.getMatiasCaller = getMatiasCaller;
`;
  radianCode = radianCode.replace('globalThis.callMatiasApi = callMatiasApi;', 'globalThis.callMatiasApi = callMatiasApi;' + callerHelper);
}

// Replace docRecord finding in send-event
const oldFindSendEvent = `    const docRecord = $app.findRecordById("electronic_documents", docId);
    if (!docRecord) {
      return c.json(404, { success: false, error: "Documento electrónico no encontrado en el buzón tributario." });
    }`;

const newFindSendEvent = `    let docRecord = null;
    if (docId) {
      try {
        docRecord = $app.findRecordById("electronic_documents", docId);
      } catch (_) {
        try {
          docRecord = $app.findFirstRecordByFilter("electronic_documents", "uuid = '" + String(docId).replace(/'/g, "''") + "'");
        } catch (_) {}
      }
    }
    if (!docRecord) {
      return c.json(404, { success: false, error: "Documento electrónico no encontrado en el buzón tributario (" + docId + ")." });
    }`;

radianCode = radianCode.replace(oldFindSendEvent, newFindSendEvent);

// Replace docRecord finding in sync-event-status
const oldFindSync = `    if (docId) {
      docRecord = $app.findRecordById("electronic_documents", docId);
      if (docRecord) {
        trackId = docRecord.getString("uuid") || trackId;
      }
    } else if (trackId) {
      try {
        docRecord = $app.findFirstRecordByFilter("electronic_documents", "uuid = '" + trackId.replace(/'/g, "''") + "'");
      } catch (_) {}
    }`;

const newFindSync = `    if (docId) {
      try {
        docRecord = $app.findRecordById("electronic_documents", docId);
      } catch (_) {
        try {
          docRecord = $app.findFirstRecordByFilter("electronic_documents", "uuid = '" + String(docId).replace(/'/g, "''") + "'");
        } catch (_) {}
      }
      if (docRecord) {
        trackId = docRecord.getString("uuid") || trackId;
      }
    } else if (trackId) {
      try {
        docRecord = $app.findFirstRecordByFilter("electronic_documents", "uuid = '" + trackId.replace(/'/g, "''") + "'");
      } catch (_) {}
    }`;

radianCode = radianCode.replace(oldFindSync, newFindSync);

// Replace calls to callMatiasApi with getMatiasCaller()
radianCode = radianCode.replace(/callMatiasApi\(/g, 'getMatiasCaller()(');

// Save root radian.pb.js
fs.writeFileSync('pb_hooks/radian.pb.js', radianCode, 'utf8');
console.log('Saved pb_hooks/radian.pb.js');

// Copy to all company directories
const dests = [
  'empresas/empresa_8091/pb_hooks/radian.pb.js',
  'empresas/empresa_8092/pb_hooks/radian.pb.js',
  'empresas/empresa_8093/pb_hooks/radian.pb.js',
  'empresas/empresa_8094/pb_hooks/radian.pb.js',
  'empresas/pb_hooks/radian.pb.js'
];

dests.forEach(d => {
  if (fs.existsSync(d)) {
    fs.writeFileSync(d, radianCode, 'utf8');
    console.log('Synchronized ' + d);
  }
});

// 2. Fix frontend/src/modules/documentos-electronicos.ts
let fe = fs.readFileSync('frontend/src/modules/documentos-electronicos.ts', 'utf8');

// Fix sendRadianEvent
const oldSendFn = `  try {
    const res = await fetch('/api/radian/send-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        docId,
        code,
        claim_code: claimCode,
        notes,
        notifySupplier
      })
    });`;

const newSendFn = `  try {
    const baseUrl = (window as any).pb?.baseUrl || (window as any).PB_URL || window.location.origin;
    const authToken = (window as any).pb?.authToken || '';
    const res = await fetch(\`\${baseUrl}/api/radian/send-event\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': \`Bearer \${authToken}\` } : {})
      },
      body: JSON.stringify({
        docId,
        code,
        claim_code: claimCode,
        notes,
        notifySupplier
      })
    });`;

fe = fe.replace(oldSendFn, newSendFn);

// Fix sync-event-status
const oldSyncStatus = `      try {
        const res = await fetch('/api/radian/sync-event-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ docId, trackId })
        });`;

const newSyncStatus = `      try {
        const baseUrl = (window as any).pb?.baseUrl || (window as any).PB_URL || window.location.origin;
        const authToken = (window as any).pb?.authToken || '';
        const res = await fetch(\`\${baseUrl}/api/radian/sync-event-status\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': \`Bearer \${authToken}\` } : {})
          },
          body: JSON.stringify({ docId, trackId })
        });`;

fe = fe.replace(oldSyncStatus, newSyncStatus);

// Fix import-cufe
const oldImportCufe = `      const res = await fetch('/api/radian/import-cufe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cufe })
      });`;

const newImportCufe = `      const baseUrl = (window as any).pb?.baseUrl || (window as any).PB_URL || window.location.origin;
      const authToken = (window as any).pb?.authToken || '';
      const res = await fetch(\`\${baseUrl}/api/radian/import-cufe\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': \`Bearer \${authToken}\` } : {})
        },
        body: JSON.stringify({ cufe })
      });`;

fe = fe.replace(oldImportCufe, newImportCufe);

// Fix import-excel
const oldImportExcel = `          const res = await fetch('/api/radian/import-excel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ excelBase64: base64Data })
          });`;

const newImportExcel = `          const baseUrl = (window as any).pb?.baseUrl || (window as any).PB_URL || window.location.origin;
          const authToken = (window as any).pb?.authToken || '';
          const res = await fetch(\`\${baseUrl}/api/radian/import-excel\`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { 'Authorization': \`Bearer \${authToken}\` } : {})
            },
            body: JSON.stringify({ excelBase64: base64Data })
          });`;

fe = fe.replace(oldImportExcel, newImportExcel);

fs.writeFileSync('frontend/src/modules/documentos-electronicos.ts', fe, 'utf8');
console.log('Saved frontend/src/modules/documentos-electronicos.ts');

