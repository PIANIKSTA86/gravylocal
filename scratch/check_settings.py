import sqlite3
conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
c.execute("SELECT key, value FROM settings WHERE key LIKE 'ftech_%' OR key LIKE 'einvoice_%' OR key LIKE 'dian_%'")
for row in c.fetchall():
    if 'password' in row[0]:
        print(f'{row[0]}: [HIDDEN]')
    else:
        print(f'{row[0]}: {row[1]}')
