const http = require('http');

const data = JSON.stringify({
  electronicPayrollId: "test" // or get real id from electronic_payrolls
});

// First get a real electronic_payrolls record id from SQLite
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve('empresas', 'empresa_8093', 'pb_data', 'data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("SELECT id, consecutivo, prefijo FROM electronic_payrolls ORDER BY id DESC LIMIT 1", [], (err, rows) => {
  if (err || !rows.length) {
    console.error("No electronic payroll record found", err);
    db.close();
    return;
  }
  const rec = rows[0];
  console.log("Testing emit with record ID:", rec.id, "consecutivo:", rec.consecutivo);
  db.close();

  const reqData = JSON.stringify({ id: rec.id });

  const req = http.request({
    hostname: 'localhost',
    port: 8090,
    path: '/api/dian/nomina/emit',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(reqData)
    }
  }, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    let body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('RESPONSE BODY:');
      console.log(body);
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  req.write(reqData);
  req.end();
});
