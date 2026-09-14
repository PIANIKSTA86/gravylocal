import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cur = conn.cursor()
cur.execute("SELECT id, prefijo, consecutivo, estado_dian, dian_response, ftech_transaction_id FROM electronic_payrolls ORDER BY consecutivo DESC LIMIT 10")
for r in cur.fetchall():
    print(r)
