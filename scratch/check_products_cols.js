const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.resolve(__dirname, '..', 'pb_data', 'data.db'));
const query = `
  SELECT
    l.product_id,
    l.qty,
    l.unit_cost,
    l.line_order,
    m.id AS mov_id,
    m.mov_type,
    m.warehouse_id,
    m.dest_warehouse_id,
    m.date AS mov_date
  FROM inventory_movement_lines l
  INNER JOIN inventory_movements m ON m.id = l.movement_id
  WHERE m.status = 'applied'
    AND m.date <= '2026-07-30 23:59:59'
  ORDER BY m.date ASC, l.line_order ASC
`;
try {
  const rows = db.prepare(query).all();
  console.log("Query success! Rows count:", rows.length);
} catch (err) {
  console.error("Query error:", err);
}
