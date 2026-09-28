import sqlite3
import json

db_path = './empresas/empresa_8094/pb_data/data.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

def dump_tx(num):
    print(f"================ TRANSACTION {num} ================")
    cur.execute("SELECT id, number, date, description, teso_mode, teso_params FROM transactions WHERE number = ?", (num,))
    tx = cur.fetchone()
    if not tx:
        print("Not found")
        return
    print("TX:", tx[:5])
    print("Params:", tx[5])
    cur.execute("""
        SELECT tl.id, a.code, a.name, tl.debit, tl.credit, tl.cross_doc_ref, tl.description
        FROM tx_lines tl
        JOIN accounts a ON tl.account_id = a.id
        WHERE tl.tx_id = ?
        ORDER BY tl.id
    """, (tx[0],))
    print("LINES:")
    for l in cur.fetchall():
        print(" ", l)

dump_tx('RC-00000044')
dump_tx('RC-00000098')
dump_tx('RC-00000007')
dump_tx('RC-00000105')
