const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');

db.get("SELECT value FROM settings WHERE key = 'matias_api_token'", async (err, rTok) => {
  const token = rTok.value;
  db.get("SELECT value FROM settings WHERE key = 'matias_client_uuid'", async (err2, rUuid) => {
    const clientUuid = rUuid.value;
    const res = await fetch('https://sandbox-api.matias-api.com/api/ubl2.1/cities?limit=2000', {
      headers: { 'Authorization': 'Bearer ' + token, 'Matias-Client': clientUuid, 'Accept': 'application/json' }
    });
    const d = await res.json();
    const list = d.dataRecords?.data || [];
    
    // Find all cities where city_code is 76001 or in Valle del Cauca
    const valleCities = list.filter(c => c.city_code === '76001' || (c.department?.name_department || '').toLowerCase().includes('valle'));
    console.log('Valle cities count:', valleCities.length);
    valleCities.forEach(c => {
      if (c.city_code === '76001' || c.name_city.toLowerCase().includes('cali')) {
        console.log('Valle Cali match:', { id: c.id, code: c.city_code, name: c.name_city, dept: c.department?.name_department });
      }
    });

    db.close();
  });
});
