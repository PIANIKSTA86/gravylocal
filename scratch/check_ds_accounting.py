import sqlite3
import json

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

print("--- Documentos Soporte en purchase_invoices ---")
cursor.execute('''
    SELECT id, number, supplier_id, supplier_ref, date, due_date, status, total, tx_id, notes
    FROM purchase_invoices
    WHERE number LIKE 'DS%' OR tx_type_id IN (SELECT id FROM transaction_types WHERE code='DS' OR prefix='DS')
    ORDER BY date DESC LIMIT 5
''')
rows = cursor.fetchall()
for r in rows:
    print(r)
    tx_id = r[8]
    if tx_id:
        print(f"  -> tx_lines for tx {tx_id}:")
        cursor.execute('''
            SELECT tl.id, tl.account_id, a.code, a.name, a.maneja_cruce, a.requires_third_party, tl.debit, tl.credit, tl.cross_doc_ref, tl.third_party_id
            FROM tx_lines tl
            JOIN accounts a ON a.id = tl.account_id
            WHERE tl.tx_id = ?
        ''', (tx_id,))
        for line in cursor.fetchall():
            print(f"     account={line[2]} ({line[3]}) maneja_cruce={line[4]} req_third={line[5]} deb={line[6]} cred={line[7]} cross_doc_ref='{line[8]}' third='{line[9]}'")

print("\n--- Configuracion settings ---")
cursor.execute("SELECT key, value FROM settings WHERE key IN ('purchase_config_v1', 'doc_soporte_config_v1')")
for s in cursor.fetchall():
    print(f"Key: {s[0]}")
    try:
        val = json.loads(s[1])
        print(json.dumps(val, indent=2))
    except:
        print(s[1][:200])
