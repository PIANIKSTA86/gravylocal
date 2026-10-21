const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');

// Let's check test_runner_matias.js or check what POST /invoice returns
db.get("SELECT value FROM settings WHERE key = 'matias_api_token'", (err, rTok) => {
  const token = rTok ? rTok.value : '';
  db.get("SELECT value FROM settings WHERE key = 'matias_client_uuid'", (err2, rUuid) => {
    const clientUuid = rUuid ? rUuid.value : '';
    // Let's check scripts/test_runner_matias.js to see what res.data has
    console.log('Token exists:', !!token);
    db.close();
  });
});
