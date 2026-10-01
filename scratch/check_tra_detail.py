import sqlite3
conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
c.execute("SELECT id, number, date, tx_id FROM inventory_movements WHERE mov_type='TRASLADO'")
for r in c.fetchall():
    print(r)
