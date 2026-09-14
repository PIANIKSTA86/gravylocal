import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cur = conn.cursor()
cur.execute("SELECT id, consecutivo, xml_generado FROM electronic_payrolls WHERE consecutivo = 357")
row = cur.fetchone()
if row:
    print(row[0], row[1])
    for line in row[2].split('\n'):
        if 'InformacionGeneral' in line or 'Trabajador' in line:
            print(line)
