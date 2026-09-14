import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cur = conn.cursor()
cur.execute("SELECT consecutivo, xml_generado FROM electronic_payrolls WHERE consecutivo IN (355, 358)")
rows = dict(cur.fetchall())
print("--- FULL 355 (APROBADO) ---")
print(rows.get(355))
print("--- FULL 358 (RECHAZADO) ---")
print(rows.get(358))
