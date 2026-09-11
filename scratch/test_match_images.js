const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('pb_data/data.db');
db.all("SELECT id, code, name, image FROM products WHERE active = 1", (err, products) => {
  if (err) {
    console.error(err);
    db.close();
    return;
  }

  // Check CATALOGO2026 folder
  const makaoDir = path.resolve('DatosReferencia/Muestra_CatalogoMakao/CATALOGO2026');
  let makaoFiles = [];
  if (fs.existsSync(makaoDir)) {
    makaoFiles = fs.readdirSync(makaoDir);
  }

  // Check how many have image field in DB
  const withDbImage = products.filter(p => p.image && p.image.trim() !== '');
  console.log(`Total productos activos: ${products.length}`);
  console.log(`Con campo 'image' en BD: ${withDbImage.length}`);
  console.log(`Sin campo 'image' en BD: ${products.length - withDbImage.length}`);
  console.log(`Archivos WebP en CATALOGO2026: ${makaoFiles.length}`);

  // Check how many codes match CATALOGO2026
  let matches = 0;
  products.forEach(p => {
    const code = (p.code || '').trim().toLowerCase();
    const cleanCode = code.replace(/[^a-z0-9]/g, '');
    const found = makaoFiles.find(f => {
      const fClean = f.toLowerCase().replace('.webp', '').replace(/[^a-z0-9]/g, '');
      return fClean === cleanCode;
    });
    if (found) matches++;
  });
  console.log(`Productos cuyo código coincide con archivo en CATALOGO2026: ${matches}`);

  // Print sample products with DB image
  console.log("\nMuestra de productos con imagen en BD:");
  withDbImage.slice(0, 5).forEach(p => {
    console.log(`- [${p.code}] ${p.name} -> image: ${p.image}`);
  });

  // Print sample products without DB image
  console.log("\nMuestra de productos SIN imagen en BD:");
  products.filter(p => !p.image || p.image.trim() === '').slice(0, 5).forEach(p => {
    console.log(`- [${p.code}] ${p.name}`);
  });

  db.close();
});
