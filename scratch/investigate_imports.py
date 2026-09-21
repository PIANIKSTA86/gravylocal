import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

# Buscar en audit_log o en transactions cómo se originaron las transacciones
c.execute('''
    SELECT action, entity, count(*) 
    FROM audit_log 
    GROUP BY action, entity
''')
print("=== AUDIT LOGS ===")
for r in c.fetchall():
    print(r)

# Ver tipos de transacción (transaction_types)
print("\n=== TRANSACTION TYPES ===")
c.execute('SELECT id, code, prefix, name FROM transaction_types')
for r in c.fetchall():
    print(r)

# Ver cuántas transacciones tienen description que indica importación o lectura
print("\n=== DESCRIPCIONES DE TRANSACCIONES SOSPECHOSAS DE IMPORTACION ===")
c.execute('''
    SELECT distinct substr(description, 1, 40), count(*)
    FROM transactions
    WHERE description LIKE '%import%' OR description LIKE '%masiv%' OR description LIKE '%saldo inicial%' OR description LIKE '%apertura%'
    GROUP BY substr(description, 1, 40)
''')
for r in c.fetchall():
    print(r)
