import sqlite3

db_path = r"c:\Users\JULIAN\Desktop\GravyLocal2.0\pb_data\data.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Find transactions where there are multiple lines with different branch_id or null branch_id
cursor.execute("""
    SELECT tx_id, COUNT(DISTINCT branch_id) as branch_cnt, COUNT(*) as line_cnt
    FROM tx_lines
    GROUP BY tx_id
    HAVING line_cnt >= 4
""")
rows = cursor.fetchall()

print(f"Transactions with >= 4 lines and multiple branch_ids: {len(rows)}")
for r in rows[:10]:
    cursor.execute("SELECT id, number, date, description FROM transactions WHERE id = ?", (r[0],))
    tx = cursor.fetchone()
    cursor.execute("SELECT id, account_id, debit, credit, line_order, branch_id FROM tx_lines WHERE tx_id = ?", (r[0],))
    lines = cursor.fetchall()
    print(f"TX: {tx}")
    for l in lines:
        print(f"   Line {l[0]} | order: {l[4]} | acc: {l[1]} | D: {l[2]} | C: {l[3]} | branch: {l[5]}")

conn.close()
