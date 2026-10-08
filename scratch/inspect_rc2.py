import sqlite3
import json

conn = sqlite3.connect('empresas/empresa_8094/pb_data/data.db')
c = conn.cursor()
c.execute("SELECT id, number, date, description, teso_params FROM transactions WHERE number = 'RC-00000002'")
t = c.fetchone()
print("TX:", t[0], t[1], t[2], t[3])
print("teso_params:", t[4])
c.execute("""
    SELECT l.id, a.code, a.name, l.third_party_id, l.debit, l.credit, l.cross_doc_ref, l.description 
    FROM tx_lines l
    JOIN accounts a ON a.id = l.account_id
    WHERE l.tx_id = ?
""", (t[0],))
for row in c.fetchall():
    print(" LINE:", row)
