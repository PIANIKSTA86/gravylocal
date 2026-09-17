import sqlite3
import os
import re

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()

files = [
    (359, 'DatosReferencia/NOM359.xml'),
    (360, 'DatosReferencia/NOM360.xml'),
    (362, 'DatosReferencia/NOM362.xml')
]

for consecutivo, file_path in files:
    if not os.path.exists(file_path):
        print(f"File {file_path} does not exist!")
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        xml_content = f.read()
    
    # Extract CUNE
    cune_m = re.search(r'CUNE="([0-9a-fA-F]{64,96})"', xml_content) or re.search(r'<CUNE[^>]*>(.*?)</CUNE>', xml_content)
    cune = cune_m.group(1).strip() if cune_m else ''
    
    msg = f"El comprobante NOM{consecutivo} ha sido autorizado por la DIAN"
    
    cur.execute("""
        UPDATE electronic_payrolls 
        SET estado_dian = 'APROBADO',
            cufe = ?,
            xml_generado = ?,
            dian_response = ?
        WHERE consecutivo = ?
    """, (cune, xml_content, msg, consecutivo))
    
    print(f"Updated NOM{consecutivo}: APROBADO, CUNE={cune[:16]}..., XML len={len(xml_content)}")

con.commit()

# Print summary of all records >= 356
print("\n=== Current State of electronic_payrolls (>= 356) ===")
cur.execute("""
    SELECT prefijo, consecutivo, estado_dian, cufe, substr(dian_response, 1, 50), length(xml_generado)
    FROM electronic_payrolls 
    WHERE consecutivo >= 356 
    ORDER BY consecutivo ASC
""")
for row in cur.fetchall():
    p, num, st, cu, resp, xlen = row
    print(f"{p}{num}: {st} | CUNE: {cu[:16]}... | XML: {xlen} bytes | {resp}")

con.close()
