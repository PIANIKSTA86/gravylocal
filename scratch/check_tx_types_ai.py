import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()

cur.execute("SELECT id, code, name, prefix FROM transaction_types")
for r in cur.fetchall():
    print(r)

print("\nTransactions with prefix AI or AJ or containing Ajuste:")
cur.execute("""
    SELECT t.id, t.number, t.date, t.description, tt.code
    FROM transactions t
    JOIN transaction_types tt ON tt.id = t.tx_type_id
    WHERE tt.code LIKE '%A%' OR t.description LIKE '%Ajuste%' OR t.number LIKE 'A%'
""")
for r in cur.fetchall():
    print(r)
