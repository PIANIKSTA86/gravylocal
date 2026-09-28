import sqlite3
import json

db_path = './empresas/empresa_8094/pb_data/data.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

print("=== SETTINGS in empresa_8094 ===")
cur.execute("SELECT key, value FROM settings WHERE key LIKE '%ph%' OR key LIKE '%trea%' OR key LIKE '%bill%'")
for k, v in cur.fetchall():
    print(f"Key: {k}\nVal: {v}\n")

print("=== ACCOUNTS (1345% and 1305%) in empresa_8094 ===")
cur.execute("SELECT id, code, name FROM accounts WHERE code LIKE '1345%' OR code LIKE '1305%'")
for r in cur.fetchall():
    print(r)

print("\n=== TX_LINES with 'Abono anticipado' ===")
cur.execute("""
    SELECT tl.id, t.number, t.date, a.code, a.name, tl.debit, tl.credit, tl.cross_doc_ref, tl.description, t.teso_params
    FROM tx_lines tl
    JOIN transactions t ON tl.tx_id = t.id
    JOIN accounts a ON tl.account_id = a.id
    WHERE tl.description LIKE '%Abono anticipado%'
""")
for r in cur.fetchall():
    print(f"Doc: {r[1]} | Date: {r[2]} | Account: {r[3]} ({r[4]}) | Deb: {r[5]} | Cred: {r[6]} | Ref: {r[7]}")
    print(f"  Desc: {r[8]}")
    print(f"  TesoParams: {r[9]}\n")
