import sqlite3
conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
c.execute("""
SELECT m.number, m.date, m.mov_type, m.warehouse_id, m.dest_warehouse_id, l.qty, l.unit_cost, l.original_unit_cost, l.id
FROM inventory_movement_lines l
JOIN inventory_movements m ON m.id = l.movement_id
WHERE l.product_id = 'qv46yr2j9xkv7cp'
ORDER BY m.date, m.number
""")
for r in c.fetchall():
    print(r)
