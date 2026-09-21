import sqlite3
import json

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

print("--- INVOICES ---")
c.execute("""
    SELECT id, number, notes, payment_method, cross_doc_ref, tx_id, tx_number, tx_type_id, payment_split 
    FROM invoices 
    WHERE number IN ('NC-00000458', 'NC-00000459')
""")
for row in c.fetchall():
    print(row)

print("\n--- TRANSACTIONS ---")
c.execute("""
    SELECT id, number, date, description, status 
    FROM transactions 
    WHERE number IN ('NC-00000458', 'NC-00000459')
""")
for row in c.fetchall():
    print(row)

print("\n--- TRANSACTIONS FULL ---")
c.execute("""
    SELECT id, number, date, description, status, cross_enabled, cross_number, cross_type
    FROM transactions 
    WHERE number IN ('NC-00000458', 'NC-00000459')
""")
for row in c.fetchall():
    print('Tx:', row)

print("\n--- AUDIT 2026-09-11 15:26 - 15:29 ---")
c.execute("""
    SELECT event_at, action, entity, entity_id, username, details 
    FROM audit_log 
    WHERE event_at BETWEEN '2026-09-11 15:25:00' AND '2026-09-11 15:30:00'
    ORDER BY event_at
""")
for r in c.fetchall():
    print([str(x).encode('ascii', errors='replace').decode('ascii') for x in r])


print("\n--- TX 3804 ---")
c.execute("SELECT id, number, date, description FROM transactions WHERE number LIKE '%3804%'")
for r in c.fetchall():
    print(r)

print("\n--- TX_LINES FOR TX 3804 ---")
c.execute("""
    SELECT t.number, l.line_order, a.code, l.description, l.cross_doc_ref, l.debit, l.credit
    FROM tx_lines l
    JOIN transactions t ON l.tx_id = t.id
    JOIN accounts a ON l.account_id = a.id
    WHERE t.number LIKE '%3804%'
    ORDER BY t.number, l.line_order
""")
for r in c.fetchall():
    print(r)







print("\n--- ACCOUNT 11050502 ---")
c.execute("SELECT id, code, name, maneja_cruce, requires_third_party FROM accounts WHERE code = '11050502'")
print(c.fetchall())

print("\n--- TABLES WITH SETTINGS ---")
c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%setting%'")
print(c.fetchall())

print("\n--- SALES_SETTINGS_V2 ---")
c.execute("SELECT value FROM settings WHERE key = 'sales_settings_v2'")
row = c.fetchone()
if row:
    cfg = json.loads(row[0])
    print(json.dumps(cfg, indent=2))





