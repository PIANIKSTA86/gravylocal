import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

# 1. Buscar líneas con import_id pero con import_concept vacío o nulo
cursor.execute("""
    SELECT tl.id, tl.tx_id, a.code, a.name, tp.name, tl.debit, tl.credit, tl.import_id, tl.import_concept
    FROM tx_lines tl
    LEFT JOIN accounts a ON a.id = tl.account_id
    LEFT JOIN third_parties tp ON tp.id = tl.third_party_id
    WHERE tl.import_id IS NOT NULL AND tl.import_id != ''
      AND (tl.import_concept IS NULL OR tl.import_concept = '')
""")
empty_concept_lines = cursor.fetchall()
print(f"Líneas con import_id pero SIN concepto: {len(empty_concept_lines)}")
for l in empty_concept_lines:
    print(f"  Line {l[0]}: Acct={l[2]} {l[3]} | Third={l[4]} | D={l[5]} | C={l[6]} | imp_id='{l[7]}'")

# 2. Buscar líneas donde la cuenta es claramente de pasivo/proveedores (2205, 2335, 2365, etc.) y fueron forzadas a concepto 'fob'
# Ojo: la cuenta 220505 es Proveedores, mientras que el costo de importación va en 1465 / 1435.
# En la Imagen 1, se ve que las líneas de Mediterranean Shipping y Agencia de Aduanas y Sociedad Portuaria con cuenta 22050501 o 23652501
# si tienen import_concept='fob', pero son de Mediterranean Shipping (fletes) o Aduana o Puerto!
cursor.execute("""
    SELECT tl.id, tl.tx_id, a.code, a.name, tp.name, tl.debit, tl.credit, tl.import_id, tl.import_concept
    FROM tx_lines tl
    LEFT JOIN accounts a ON a.id = tl.account_id
    LEFT JOIN third_parties tp ON tp.id = tl.third_party_id
    WHERE tl.import_id IS NOT NULL AND tl.import_id != ''
      AND a.code LIKE '2%'
""")
liability_lines = cursor.fetchall()
print(f"\nLíneas con import_id y cuenta de Pasivo (Clase 2): {len(liability_lines)}")
for l in liability_lines:
    print(f"  Line {l[0]}: Acct={l[2]} {l[3]} | Third={l[4]} | D={l[5]} | C={l[6]} | concept='{l[8]}' | imp_id='{l[7]}'")

conn.close()
