import sqlite3
conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
c.execute("""
SELECT i.number, i.date, i.cost_corrected, m.number, l.qty, l.unit_cost
FROM invoices i
JOIN inventory_movements m ON m.id = i.inv_movement_id
JOIN inventory_movement_lines l ON l.movement_id = m.id
WHERE l.product_id = 'qv46yr2j9xkv7cp'
ORDER BY i.date
""")
for r in c.fetchall():
    print(r)
