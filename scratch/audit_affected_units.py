import sqlite3
import glob
import json

db = 'empresas/empresa_8094/pb_data/data.db'
conn = sqlite3.connect(db)
c = conn.cursor()

query = """
SELECT DISTINCT t.id, t.number, t.date, t.description, t.teso_params
FROM transactions t
JOIN tx_lines l ON l.tx_id = t.id
WHERE l.description LIKE '%Aplicación saldo a favor%' 
   OR l.description LIKE '%Abono desde anticipo%'
ORDER BY t.date ASC, t.number ASC
"""
c.execute(query)
rows = c.fetchall()
print(f"Total transacciones afectadas: {len(rows)}")

affected_units = {}
for tx_id, num, date, desc, teso_params in rows:
    p_json = json.loads(teso_params) if teso_params else {}
    pid = p_json.get('ph_property_id')
    p_code = 'N/A'
    p_name = 'N/A'
    owner_name = 'N/A'
    if pid:
        c.execute('SELECT code, name, owner_id FROM ph_properties WHERE id = ?', (pid,))
        p_row = c.fetchone()
        if p_row:
            p_code = p_row[0]
            p_name = p_row[1]
            c.execute('SELECT name, doc_number FROM third_parties WHERE id = ?', (p_row[2],))
            t_row = c.fetchone()
            if t_row:
                owner_name = f"{t_row[0]} [CC/NIT: {t_row[1]}]"
    if p_code not in affected_units:
        affected_units[p_code] = {'name': p_name, 'owner': owner_name, 'txs': []}
    
    # Analyze lines of this transaction
    c.execute("""
        SELECT l.id, a.code, l.debit, l.credit, l.cross_doc_ref, l.description
        FROM tx_lines l
        JOIN accounts a ON a.id = l.account_id
        WHERE l.tx_id = ?
    """, (tx_id,))
    tx_lines = c.fetchall()
    affected_units[p_code]['txs'].append({
        'id': tx_id,
        'number': num,
        'date': date,
        'description': desc,
        'lines': tx_lines
    })

print(f"Total unidades habitacionales únicas afectadas: {len(affected_units)}")
print("="*80)
for code in sorted(affected_units.keys()):
    data = affected_units[code]
    tx_nums = [t['number'] for t in data['txs']]
    print(f"Unidad: {code:6} | {data['name']:25} | {data['owner']} | Comprobantes: {', '.join(tx_nums)}")
