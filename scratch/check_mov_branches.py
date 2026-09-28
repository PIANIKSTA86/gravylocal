import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()

# Check warehouse branch
wh = cur.execute("SELECT id, name, branch_id FROM warehouses WHERE id = '75npb0kfhhfdtmf'").fetchone()
print("Warehouse:", wh)

# Let's check last inventory_movements to see their branch_id
movs = cur.execute("SELECT id, number, warehouse_id, branch_id FROM inventory_movements ORDER BY rowid DESC LIMIT 5").fetchall()
for m in movs:
    print("Mov:", m)
