import sqlite3
conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
c.execute("""
SELECT w.name, s.qty_on_hand, s.avg_cost, p.cost_price
FROM inventory_stock s
JOIN warehouses w ON w.id = s.warehouse_id
JOIN products p ON p.id = s.product_id
WHERE s.product_id = 'qv46yr2j9xkv7cp'
""")
for r in c.fetchall():
    print(r)
