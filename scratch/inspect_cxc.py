import sqlite3
import json

conn = sqlite3.connect('pb_data/data.db')
cur = conn.cursor()

print("--- PH / BILLING SETTINGS ---")
cur.execute("SELECT key, value FROM settings WHERE key LIKE '%ph%' OR key LIKE '%bill%' OR key LIKE '%trea%'")
for k, v in cur.fetchall():
    print(f"Key: {k}")
    print(f"Val: {v}\n")

print("--- ACCOUNTS (1345%, 1305%) ---")
cur.execute("SELECT id, code, name FROM accounts WHERE code LIKE '1345%' OR code LIKE '1305%'")
for r in cur.fetchall():
    print(r)

print("\n--- TRANSACTIONS RC-00000098 and RC-00000044 ---")
cur.execute("SELECT id, number, date, description, teso_params FROM transactions WHERE number IN ('RC-00000098', 'RC-00000044')")
for r in cur.fetchall():
    print(r)

print("\n--- TX_LINES for these transactions ---")
cur.execute("""
    SELECT tl.id, tl.transaction_id, t.number, a.code, a.name, tl.debit, tl.credit, tl.cross_doc_ref, tl.description 
    FROM tx_lines tl
    JOIN transactions t ON tl.transaction_id = t.id
    JOIN accounts a ON tl.account_id = a.id
    WHERE t.number IN ('RC-00000098', 'RC-00000044')
""")
for r in cur.fetchall():
    print(r)
