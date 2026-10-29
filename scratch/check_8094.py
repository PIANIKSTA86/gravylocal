import sqlite3
import json

db_path = r'C:\Users\JULIAN\Desktop\GravyLocalTABS\empresas\empresa_8094\pb_data\data.db'
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

print("--- PH PROPERTIES FOR 2604 ---")
props = cur.execute("SELECT id, code, name, owner_id FROM ph_properties WHERE code LIKE '%2604%' OR name LIKE '%2604%' OR name LIKE '%604%'").fetchall()
for p in props:
    print(dict(p))

prop_ids = [p['id'] for p in props]

print("\n--- PH INVOICES ---")
invoices = cur.execute(f"SELECT id, number, period, date, due_date, total, status, property_id, tx_id FROM ph_invoices WHERE property_id IN ({','.join(['?']*len(prop_ids))})", prop_ids).fetchall()
for inv in invoices:
    print(dict(inv))

inv_ids = [i['id'] for i in invoices]
if inv_ids:
    print("\n--- PH INVOICE LINES ---")
    lines = cur.execute(f"SELECT id, invoice_id, concept_id, description, amount, balance, status FROM ph_invoice_lines WHERE invoice_id IN ({','.join(['?']*len(inv_ids))})", inv_ids).fetchall()
    for l in lines:
        print(dict(l))

print("\n--- TX LINES WITH ACCOUNT 13459501 OR CROSS DOC OR PROPERTY ---")
# Let's find account 13459501
accs = cur.execute("SELECT id, code, name FROM accounts WHERE code LIKE '13459501%'").fetchall()
for a in accs:
    print("Account:", dict(a))

acc_ids = [a['id'] for a in accs]
if acc_ids:
    tx_lines = cur.execute(f"""
        SELECT tl.id, tl.tx_id, t.date, t.number as tx_number, t.type as tx_type, tl.account_id, tl.debit, tl.credit, tl.description, tl.cross_doc_ref, tl.third_party_id
        FROM tx_lines tl
        JOIN transactions t ON t.id = tl.tx_id
        WHERE tl.account_id IN ({','.join(['?']*len(acc_ids))})
        ORDER BY t.date ASC, t.number ASC
    """, acc_ids).fetchall()
    print(f"\nTotal tx_lines for account 13459501: {len(tx_lines)}")
    for tl in tx_lines:
        print(dict(tl))

conn.close()
