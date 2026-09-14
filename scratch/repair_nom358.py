import sqlite3
import datetime

conn = sqlite3.connect('pb_data/data.db')
cur = conn.cursor()
cur.execute("SELECT id, consecutivo, xml_generado FROM electronic_payrolls WHERE consecutivo = 358")
row = cur.fetchone()
if not row:
    print("Not found")
    exit(1)

rec_id, consecutivo, xml = row

# 1. Corregir EncripCUNE
xml = xml.replace('EncripCUNE=""', 'EncripCUNE ="CUNE-SHA384"')

# 2. Corregir apellidos duplicados de Angelica Moncada Armilla
xml = xml.replace('PrimerApellido="MONCADA ARMILLA" SegundoApellido="ARMILLA"', 'PrimerApellido="MONCADA" SegundoApellido="ARMILLA"')

# 3. Corregir CUNE vacío
xml = xml.replace('CUNE="16a0a08716a0a08716a0a08716a0a08716a0a08716a0a08716a0a08716a0a08716a0a08716a0a08716a0a08716a0a087"', 'CUNE=""')

cur.execute("""
    UPDATE electronic_payrolls 
    SET xml_generado = ?,
        dian_response = 'Rechazado en intento previo por error de esquema EncripCUNE vacío. Esquema y apellidos corregidos para reintento.'
    WHERE id = ?
""", (xml, rec_id))
conn.commit()
print("Updated successfully. Verification:")
cur.execute("SELECT id, consecutivo, estado_dian, dian_response, xml_generado FROM electronic_payrolls WHERE consecutivo = 358")
r = cur.fetchone()
print(r[0], r[1], r[2])
print("dian_response:", r[3])
for l in r[4].split('\n'):
    if 'InformacionGeneral' in l or 'Trabajador' in l:
        print(l)
