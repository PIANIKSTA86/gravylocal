import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
c.execute("SELECT id, type, title, due_date, amount, status FROM agenda_vencimientos WHERE title LIKE '%DSE%' OR title LIKE '%DS%' LIMIT 10")
rows = c.fetchall()
print(f"Registros encontrados en agenda_vencimientos: {len(rows)}")
for r in rows:
    print(r)
