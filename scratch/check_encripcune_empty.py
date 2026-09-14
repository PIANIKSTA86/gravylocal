import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cur = conn.cursor()
cur.execute("SELECT id, consecutivo, estado_dian FROM electronic_payrolls WHERE xml_generado LIKE '%EncripCUNE=\"\"%'")
rows = cur.fetchall()
print("Records with EncripCUNE empty:", rows)
