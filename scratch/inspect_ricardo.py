import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

# Find Ricardo Esteban Rivera Gallo
cursor.execute("SELECT id, name, doc_number FROM third_parties WHERE name LIKE '%RICARDO ESTEBAN RIVERA GALLO%'")
third = cursor.fetchone()
print('Third party:', third)
third_id = third[0]

# All lines for this third party in account 13050501 before 2026-01-01
print('\n--- Lines BEFORE 2026-01-01 ---')
cursor.execute("""
    SELECT t.date, t.number, l.cross_doc_ref, l.debit, l.credit, (l.debit - l.credit) as delta
    FROM tx_lines l
    JOIN transactions t ON t.id = l.tx_id
    JOIN accounts a ON a.id = l.account_id
    WHERE t.status = 'active'
      AND a.code = '13050501'
      AND COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id) = ?
      AND t.date < '2026-01-01'
    ORDER BY t.date, t.number
""", (third_id,))
for row in cursor.fetchall():
    print(row)

# All lines for this third party in account 13050501 DURING Jan 2026
print('\n--- Lines DURING Jan 2026 ---')
cursor.execute("""
    SELECT t.date, t.number, l.cross_doc_ref, l.debit, l.credit
    FROM tx_lines l
    JOIN transactions t ON t.id = l.tx_id
    JOIN accounts a ON a.id = l.account_id
    WHERE t.status = 'active'
      AND a.code = '13050501'
      AND COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id) = ?
      AND t.date >= '2026-01-01' AND t.date <= '2026-01-31 23:59:59'
    ORDER BY t.date, t.number
""", (third_id,))
for row in cursor.fetchall():
    print(row)
