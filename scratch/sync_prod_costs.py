import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()

# Update products cost_price based on active inventory_stock
cur.execute("""
    SELECT product_id, avg_cost
    FROM inventory_stock
    WHERE avg_cost > 0 AND qty_on_hand > 0
    ORDER BY last_mov_date DESC
""")
rows = cur.fetchall()

updated = {}
for p_id, avg_c in rows:
    if p_id not in updated:
        cur.execute("UPDATE products SET cost_price = ? WHERE id = ?", (avg_c, p_id))
        updated[p_id] = avg_c

con.commit()
print(f"Updated {len(updated)} products with real average cost.")

cur.execute("SELECT id, code, cost_price FROM products WHERE id = 'qv46yr2j9xkv7cp'")
print("PB3000 updated product:", cur.fetchall())
