import sqlite3, json

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
row = c.execute("SELECT * FROM _collections WHERE name='payroll_novelties'").fetchone()
desc = [d[0] for d in c.description]
print(dict(zip(desc, row)))
conn.close()
