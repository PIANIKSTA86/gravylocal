import sqlite3
conn = sqlite3.connect('empresas/empresa_8094/pb_data/data.db')
c = conn.cursor()
c.execute("SELECT * FROM ph_billing_concepts")
cols = [d[0] for d in c.description]
print("Columns:", cols)
for r in c.fetchall():
    print(dict(zip(cols, r)))
