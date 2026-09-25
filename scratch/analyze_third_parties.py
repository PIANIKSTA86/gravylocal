import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

# Get opening balance per third party for account 13050501
cursor.execute("""
    SELECT COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS third_id,
           tp.name,
           tp.doc_number,
           SUM(l.debit - l.credit) as opening_balance
    FROM tx_lines l
    JOIN transactions t ON t.id = l.tx_id
    JOIN accounts a ON a.id = l.account_id
    LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
    WHERE t.status = 'active'
      AND a.code = '13050501'
      AND t.date < '2026-01-01'
    GROUP BY third_id
    HAVING ABS(SUM(l.debit - l.credit)) > 0.001
""")
openings = cursor.fetchall()
print(f'Total third parties with opening balance: {len(openings)}')
total_opening = sum(o[3] for o in openings)
print(f'Sum of all third parties opening balance: {total_opening}')

# Get third parties with movements in Jan 2026
cursor.execute("""
    SELECT DISTINCT COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS third_id
    FROM tx_lines l
    JOIN transactions t ON t.id = l.tx_id
    JOIN accounts a ON a.id = l.account_id
    WHERE t.status = 'active'
      AND a.code = '13050501'
      AND t.date >= '2026-01-01' AND t.date <= '2026-01-31 23:59:59'
""")
period_thirds = set(r[0] for r in cursor.fetchall())
print(f'Third parties with movements in period: {len(period_thirds)}')

# Check which third parties with opening balance are NOT in period
missing_in_period = [o for o in openings if o[0] not in period_thirds]
print(f'\nThird parties with opening balance but NO movements in Jan 2026: {len(missing_in_period)}')
missing_sum = sum(m[3] for m in missing_in_period)
print(f'Sum of opening balances of missing third parties: {missing_sum}')
for m in missing_in_period:
    print(f'  - {m[2]} {m[1]}: {m[3]:,.2f}')

# Also check third parties that ARE in period, what is their opening sum?
present_in_period = [o for o in openings if o[0] in period_thirds]
present_sum = sum(p[3] for p in present_in_period)
print(f'\nSum of opening balances of third parties WITH movements in Jan 2026: {present_sum:,.2f}')
