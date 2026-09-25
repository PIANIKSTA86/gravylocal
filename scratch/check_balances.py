import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

cursor.execute("""
    SELECT a.code, a.name, a.id,
           SUM(CASE WHEN t.date < '2026-01-01' THEN (l.debit - l.credit) ELSE 0 END) as opening,
           SUM(CASE WHEN t.date >= '2026-01-01' AND t.date <= '2026-01-31 23:59:59' THEN l.debit ELSE 0 END) as debit,
           SUM(CASE WHEN t.date >= '2026-01-01' AND t.date <= '2026-01-31 23:59:59' THEN l.credit ELSE 0 END) as credit
    FROM tx_lines l
    JOIN transactions t ON t.id = l.tx_id
    JOIN accounts a ON a.id = l.account_id
    WHERE t.status = 'active'
      AND a.code LIKE '130505%'
    GROUP BY a.code, a.name, a.id
""")
rows = cursor.fetchall()
for r in rows:
    print(r)
