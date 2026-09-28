import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()
tp = cur.execute("SELECT id, name FROM third_parties WHERE id = 'ok1gkgra6nhv28z'").fetchone()
print("Supplier:", tp)
wh = cur.execute("SELECT id, name FROM warehouses WHERE id = '75npb0kfhhfdtmf'").fetchone()
print("Warehouse:", wh)
