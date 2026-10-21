const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
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
    console.log('Total cities in MATIAS:', list.length);
    // Create a lookup map: DANE code -> MATIAS ID, and normalized name -> MATIAS ID
    const daneMap = {};
    const nameMap = {};
    list.forEach(c => {
      if (c.city_code) daneMap[c.city_code] = c.id;
      if (c.name_city) {
        const norm = c.name_city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        nameMap[norm] = c.id;
      }
    });
    console.log('Mapped DANE codes:', Object.keys(daneMap).length);
    console.log('Cali 76001:', daneMap['76001']);
    console.log('Cali by name:', nameMap['cali']);
    console.log('Bogota 11001:', daneMap['11001']);
    console.log('Medellin 05001:', daneMap['05001']);
    console.log('Barranquilla 08001:', daneMap['08001']);
    fs.writeFileSync('scratch/matias_cities_map.json', JSON.stringify({ daneMap, nameMap }, null, 2));
    db.close();
  });
});
