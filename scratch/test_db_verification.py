import sqlite3
import json

db_path = 'empresas/empresa_8094/pb_data/data.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

# 1. Comprobar setting ph_config_v1
c.execute("SELECT value FROM settings WHERE key = 'ph_config_v1'")
row = c.fetchone()
if row:
    cfg = json.loads(row[0])
    print('ph_config_v1 keys:', list(cfg.keys()))
    print('cruce_anticipo_tx_type_id:', cfg.get('cruce_anticipo_tx_type_id'))
else:
    print('ph_config_v1 no encontrado')

# 2. Comprobar tipos de transaccion NC, CC, AJ, CA
c.execute("SELECT id, code, name, active FROM transaction_types WHERE active = 1 ORDER BY code")
types = c.fetchall()
print('\nTipos de transaccion activos:')
for t in types:
    print(f'  {t[1]}: {t[2]} (ID: {t[0]})')

# 3. Comprobar saldos en cuenta 28
c.execute("""
    SELECT 
        l.cross_doc_ref,
        COUNT(*),
        ROUND(SUM(l.credit) - SUM(l.debit), 2) AS saldo_favor
    FROM tx_lines l
    JOIN accounts a ON a.id = l.account_id
    JOIN transactions t ON t.id = l.tx_id
    WHERE t.status = 'active' AND a.code LIKE '28%'
    GROUP BY l.cross_doc_ref
    HAVING saldo_favor > 0
    ORDER BY saldo_favor DESC
    LIMIT 5
""")
anticipos = c.fetchall()
print('\nTop 5 anticipos disponibles:')
for ant in anticipos:
    print(f'  Ref: {ant[0]} | Saldo a favor: ${ant[2]:,.2f} | Movimientos: {ant[1]}')

conn.close()
