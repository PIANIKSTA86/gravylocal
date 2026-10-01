import sqlite3

conn = sqlite3.connect('pb_data/data.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

cursor.execute("""
    SELECT m.number, m.date, m.warehouse_id, m.dest_warehouse_id, l.product_id, p.code, l.qty, l.unit_cost
    FROM inventory_movements m
    JOIN inventory_movement_lines l ON l.movement_id = m.id
    JOIN products p ON p.id = l.product_id
    WHERE m.mov_type = 'TRASLADO' AND m.status = 'applied'
    ORDER BY m.date, m.number
""")

rows = cursor.fetchall()
print(f"Total transfer lines in DB: {len(rows)}")
for r in rows:
    print(dict(r))
