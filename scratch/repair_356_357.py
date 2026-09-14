import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cur = conn.cursor()
cur.execute("SELECT id, consecutivo, xml_generado FROM electronic_payrolls WHERE consecutivo IN (356, 357)")
for row in cur.fetchall():
    rec_id, c, xml = row
    xml = xml.replace('EncripCUNE=""', 'EncripCUNE ="CUNE-SHA384"')
    xml = xml.replace('EncripCUNE="CUNE-SHA384"', 'EncripCUNE ="CUNE-SHA384"')
    xml = xml.replace('PrimerApellido="GARCIA VIVAS" SegundoApellido="VIVAS"', 'PrimerApellido="GARCIA" SegundoApellido="VIVAS"')
    cur.execute("UPDATE electronic_payrolls SET xml_generado = ? WHERE id = ?", (xml, rec_id))
conn.commit()
print("Updated 356 and 357.")
