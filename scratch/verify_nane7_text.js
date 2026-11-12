const http = require('http');
const zlib = require('zlib');

function verifyNane7() {
  const req = http.request('http://127.0.0.1:8090/api/dian/nomina/download-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const json = JSON.parse(data);
      const buf = Buffer.from(json.pdfBase64, 'base64');
      const str = buf.toString('latin1');
      const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
      let match;
      let allText = '';
      while ((match = streamRegex.exec(str)) !== null) {
        try {
          const decomp = zlib.inflateSync(Buffer.from(match[1], 'latin1')).toString('utf8');
          allText += decomp + '\n';
        } catch (_) {}
      }

      console.log("=== Text verification for NANE-7 ===");
      const checks = [
        'Sueldo Básico',
        'Auxilio de Transporte',
        'Auxilio No Salarial',
        'Comisiones',
        'Salud (Aporte Trabajador)',
        'Fondo Pensión (Aporte Trabajador)',
        '2026-09-01 al 2026-09-30',
        '3.143.831',
        '225.179',
        '2.918.652',
        'CIELO DEL PILAR ALDANA'
      ];
      checks.forEach(c => {
        const found = allText.includes(c);
        console.log(`[${found ? 'PASS' : 'FAIL'}] contains "${c}"`);
      });
    });
  });
  req.write(JSON.stringify({ id: 'swpcwm9ph97o8ob' }));
  req.end();
}

verifyNane7();

