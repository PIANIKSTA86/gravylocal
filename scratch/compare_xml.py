import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cur = conn.cursor()
cur.execute("SELECT consecutivo, xml_generado FROM electronic_payrolls WHERE consecutivo IN (355, 357, 358)")
rows = cur.fetchall()
for c, xml in rows:
    print(f"=== CONSECUTIVO {c} ===")
    print(xml[:800])
