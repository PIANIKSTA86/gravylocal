import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()
cur.execute("SELECT consecutivo, estado_dian, cufe FROM electronic_payrolls WHERE estado_dian != 'APROBADO'")
rows = cur.fetchall()
print(f"Non-approved count: {len(rows)}")
for r in rows:
    print(r)
con.close()
