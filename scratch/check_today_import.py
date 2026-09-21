import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

# Transacciones creadas en la carga de hoy (alrededor de 2026-09-21 06:34)
c.execute('''
    SELECT 
        tt.code,
        tt.name,
        count(distinct t.id) as total_tx,
        count(l.id) as total_lines,
        sum(case when l.cross_doc_ref is null or trim(l.cross_doc_ref) = '' then 1 else 0 end) as sin_cruce,
        sum(case when l.cross_doc_ref is not null and trim(l.cross_doc_ref) != '' then 1 else 0 end) as con_cruce
    FROM transactions t
    JOIN tx_lines l ON l.tx_id = t.id
    LEFT JOIN transaction_types tt ON t.tx_type_id = tt.id
    JOIN accounts a ON l.account_id = a.id
    WHERE (a.code LIKE '13%' OR a.code LIKE '22%' OR a.code LIKE '23%')
      AND t.created >= '2026-09-21 06:00:00'
    GROUP BY tt.code, tt.name
''')
print("=== LINEAS DE CARTERA IMPORTADAS HOY (2026-09-21) ===")
rows = c.fetchall()
if rows:
    for r in rows:
        print(r)
else:
    print("No se encontraron por t.created >= 2026-09-21 06:00:00, revisando por fecha de creación o id...")

# Veamos las últimas 20 transacciones creadas
c.execute('''
    SELECT t.id, t.number, tt.code, t.date, t.created, t.description
    FROM transactions t
    LEFT JOIN transaction_types tt ON t.tx_type_id = tt.id
    ORDER BY t.created DESC
    LIMIT 15
''')
print("\n=== ULTIMAS 15 TRANSACCIONES CREADAS ===")
for r in c.fetchall():
    print(r)
