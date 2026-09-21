import sqlite3
conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in c.fetchall()]
print("Tablas en la BD:")
for t in sorted(tables):
    if any(k in t.lower() for k in ['cartera', 'cxc', 'cxp', 'pay', 'cobro', 'saldo', 'invoic', 'trans']):
        print('  ', t)
