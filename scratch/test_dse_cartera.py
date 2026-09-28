import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

# Simular el filtro de Tesorería (tesoreria.ts) para proveedores
cursor.execute('''
    SELECT tl.id, t.number as tx_number, tl.cross_doc_ref, a.code as account_code, a.name as account_name,
           tl.debit, tl.credit, tp.name as third_name, tp.doc_number as nit
    FROM tx_lines tl
    JOIN transactions t ON t.id = tl.tx_id
    JOIN accounts a ON a.id = tl.account_id
    JOIN third_parties tp ON tp.id = tl.third_party_id
    WHERE t.status != 'voided'
      AND (a.code LIKE '22%' OR a.code LIKE '23%')
      AND tl.cross_doc_ref LIKE 'DSE%'
    ORDER BY t.date DESC
    LIMIT 10
''')

print("Documentos Soporte visibles en cartera de proveedores (Tesorería):")
rows = cursor.fetchall()
for r in rows:
    print(f"Doc Cruce: {r[2]} | Tx: {r[1]} | Cta: {r[3]} ({r[4]}) | Cred: {r[6]} | Deb: {r[5]} | Tercero: {r[7]} ({r[8]})")

conn.close()
