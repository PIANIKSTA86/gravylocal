import sqlite3
import os

db_path = r"c:\Users\JULIAN\Desktop\GravyLocal2.0\pb_data\data.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check audit logs for UPDATE on transactions
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='audit_logs'")
has_audit = cursor.fetchone()

if has_audit:
    cursor.execute("SELECT * FROM audit_logs WHERE action='UPDATE' AND entity_type IN ('transactions', 'Transaccion') ORDER BY id DESC LIMIT 20")
    logs = cursor.fetchall()
    print("Recent Audit Logs for UPDATE transactions:")
    for l in logs:
        print(l)

# Check transactions where total_debit != total_credit OR where line count is double
cursor.execute("""
    SELECT tx_id, COUNT(*) as cnt, SUM(debit) as total_debit, SUM(credit) as total_credit
    FROM tx_lines
    GROUP BY tx_id
    HAVING cnt > 2
""")
tx_list = cursor.fetchall()
print(f"\nTransactions with > 2 lines: {len(tx_list)}")

# Let's inspect some of those
for t in tx_list[:10]:
    tx_id = t[0]
    cursor.execute("SELECT id, number, date, description FROM transactions WHERE id = ?", (tx_id,))
    tx = cursor.fetchone()
    cursor.execute("SELECT id, account_id, debit, credit, line_order, description FROM tx_lines WHERE tx_id = ?", (tx_id,))
    lines = cursor.fetchall()
    print(f"TX: {tx} | Total Debit: {t[2]} | Total Credit: {t[3]}")
    for l in lines:
        print(f"   Line: {l}")

conn.close()
