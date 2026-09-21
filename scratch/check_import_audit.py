import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

c.execute('''
    SELECT created, details 
    FROM audit_log 
    WHERE action = 'IMPORT' AND entity = 'transactions'
    ORDER BY created DESC
''')
print("=== IMPORT AUDIT LOGS ===")
for r in c.fetchall():
    print(f'{r[0]}: {r[1]}')
