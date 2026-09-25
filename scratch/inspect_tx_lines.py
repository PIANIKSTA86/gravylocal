import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

imp_id = 'o6r1vqd7mnnty34'

# 1. Transacciones que tienen import_id en la cabecera
cursor.execute("SELECT id, number, date, description, third_party_id FROM transactions WHERE import_id = ?", (imp_id,))
txs = cursor.fetchall()
print(f"Transactions with import_id = {imp_id}: {len(txs)}")
for t in txs:
    print(f"  Tx {t[1]} (id={t[0]}): Date={t[2]}, Desc={t[3]}")
    # Líneas de esta tx
    cursor.execute("""
        SELECT tl.id, a.code, a.name, tp.name, tl.debit, tl.credit, tl.import_id, tl.import_concept
        FROM tx_lines tl
        LEFT JOIN accounts a ON a.id = tl.account_id
        LEFT JOIN third_parties tp ON tp.id = tl.third_party_id
        WHERE tl.tx_id = ?
    """, (t[0],))
    for l in cursor.fetchall():
        print(f"    Line {l[0]}: Acct={l[1]} | Third={l[3]} | D={l[4]} | C={l[5]} | imp_id='{l[6]}' | concept='{l[7]}'")

conn.close()
