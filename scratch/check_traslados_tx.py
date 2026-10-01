import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()

cur.execute("""
    SELECT number, date, mov_type, warehouse_id, dest_warehouse_id, tx_id
    FROM inventory_movements
    WHERE mov_type = 'TRASLADO'
""")
for r in cur.fetchall():
    print(r)
