import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

c.execute("SELECT id, tx_id, account_id, debit, credit, import_id, import_concept, import_trm, import_invoice_ref FROM tx_lines WHERE import_id = 'zva62hh26xjxn50'")
lines = c.fetchall()
print(f"Linked tx_lines for IMP-93: {len(lines)}")
for l in lines:
    print(l)

c.execute("SELECT id, number, date, total, is_import, import_id FROM transactions WHERE import_id = 'zva62hh26xjxn50'")
txs = c.fetchall()
print(f"\nLinked transactions for IMP-93: {len(txs)}")
for t in txs:
    print(t)
