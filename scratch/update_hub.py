import sqlite3

conn = sqlite3.connect('hub/pb_data/data.db')
c = conn.cursor()
c.execute("UPDATE companies SET name = 'DOMESTIKO SAS', nit = '901428834' WHERE port = 8090 OR id = 'kojdt7illwylll1'")
conn.commit()
print('Updated rows:', c.rowcount)
c.execute("SELECT id, name, nit, port, url, active FROM companies WHERE port = 8090")
print('Company in HUB:', c.fetchone())
conn.close()
