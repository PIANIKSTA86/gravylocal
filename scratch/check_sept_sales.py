import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()

# Find invoices in September for PB3000
cur.execute("""
    SELECT i.number, i.date, i.tx_id, m.number as mov_num, l.qty, l.unit_cost
    FROM invoices i
    JOIN inventory_movements m ON m.id = i.inv_movement_id
    JOIN inventory_movement_lines l ON l.movement_id = m.id
    WHERE l.product_id = 'qv46yr2j9xkv7cp' AND i.date >= '2026-09-01'
    ORDER BY i.date ASC, i.number ASC
""")

rows = cur.fetchall()
print(f"Found {len(rows)} sales invoices in September for PB3000:")
total_qty = 0
for r in rows:
    print(r)
    total_qty += r[4]
print("Total units sold in Sept:", total_qty)
