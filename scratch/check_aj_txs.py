import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()

cur.execute("""
    SELECT t.id, t.number, t.date, t.description, t.status, tt.code, tt.name
    FROM transactions t
    JOIN transaction_types tt ON tt.id = t.tx_type_id
    WHERE tt.code = 'AJ' OR t.number LIKE 'AJ%'
    ORDER BY t.date DESC
""")
rows = cur.fetchall()
print(f"Total AJ transactions found: {len(rows)}")
for r in rows[:15]:
    print(r)
