import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()
cur.execute("""
    SELECT s.id, w.name, s.qty_on_hand, s.avg_cost 
    FROM inventory_stock s 
    JOIN warehouses w ON w.id = s.warehouse_id 
    WHERE s.product_id = 'qv46yr2j9xkv7cp'
""")
print("Stock:", cur.fetchall())

# Also update products cost_price if needed
cur.execute("SELECT id, code, cost_price FROM products WHERE id = 'qv46yr2j9xkv7cp'")
print("Product:", cur.fetchall())
