const http = require('http');

async function testDoc(docId) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      docId: docId,
      code: '030',
      notes: 'Acuse de recibo de prueba',
      notifySupplier: false
    });

    const req = http.request('http://127.0.0.1:8090/api/radian/send-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ docId, status: res.statusCode, body }));
    });

    req.on('error', err => resolve({ docId, error: err.message }));
    req.write(payload);
    req.end();
  });
}

(async () => {
  const ids = ['eazp133iwyoe0pv', 'bpsiha8oz0xspkd', '2nmgud38sbokwcg', 'v3kbuksm1nakghj', 'fa8rgcky610vylz', 'bjxzkvtswsneict', 'non_existent_id'];
  for (const id of ids) {
    const res = await testDoc(id);
    console.log(`Doc ${id}: Status ${res.status} -> ${res.body}`);
  }
})();

