import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

terceros = ['05pofkghyv2lmkd', '0mh09a0ab6tpzq1', '1n12agozkgfx7ei', '2tdtclpiydehbq7', '0lhneu1lpk72e6n']

for tid in terceros:
    c.execute('SELECT name, doc_number FROM third_parties WHERE id = ?', (tid,))
    row = c.fetchone()
    if not row: continue
    tname, tdoc = row
    print(f'=== TERCERO: {tname} ({tdoc}) [ID: {tid}] ===')
    c.execute('''
        SELECT 
            t.number,
            tt.code,
            t.date,
            a.code,
            l.debit,
            l.credit,
            l.cross_doc_ref,
            t.description
        FROM tx_lines l
        JOIN transactions t ON l.tx_id = t.id
        LEFT JOIN transaction_types tt ON t.tx_type_id = tt.id
        JOIN accounts a ON l.account_id = a.id
        WHERE l.third_party_id = ?
          AND (a.code LIKE '13%' OR a.code LIKE '22%' OR a.code LIKE '23%')
          AND t.status = 'active'
        ORDER BY t.date
    ''', (tid,))
    rows = c.fetchall()
    for r in rows:
        print(f'  Tx:{r[0]} | Tipo:{r[1]} | Fecha:{r[2]} | Cta:{r[3]} | D:{r[4]} | C:{r[5]} | Ref:"{r[6]}" | Desc:{(r[7] or "")[:35]}')
    print()

