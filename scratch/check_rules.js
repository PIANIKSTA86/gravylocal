const sqlite3 = require('./mobile-vendedores-app/node_modules/sqlite3' || 'sqlite3'); // Intentar buscar en node_modules de la app
const db = new sqlite3.Database('./pb_data/data.db');

db.all("SELECT name, listRule, viewRule FROM _collections WHERE name IN ('clientes', 'products', 'listas_precios', 'precios_producto')", (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log(JSON.stringify(rows, null, 2));
  }
  db.close();
});
