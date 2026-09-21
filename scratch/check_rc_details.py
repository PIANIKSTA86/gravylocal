import sqlite3
import re

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

sample_rcs = ['RC-00000569', 'RC-00000568', 'RC-00000567', 'RC-00000565', 'RC-00000561']
for num in sample_rcs:
    c.execute('SELECT id, number, date, description, third_party_id FROM transactions WHERE number = ?', (num,))
    tx = c.fetchone()
    if not tx: continue
    print(f'*** TRANSACCION: {tx[1]} | Fecha: {tx[2]} | Desc: {tx[3]} ***')
    c.execute('''
        SELECT l.id, a.code, a.name, l.debit, l.credit, l.cross_doc_ref, l.third_party_id
        FROM tx_lines l
        JOIN accounts a ON l.account_id = a.id
        WHERE l.tx_id = ?
    ''', (tx[0],))
    for l in c.fetchall():
        print(f'   Cuenta: {l[1]} ({l[2][:20]}) | D: {l[3]} | C: {l[4]} | Ref: "{l[5]}" | Tercero: {l[6]}')
    
    m = re.search(r'(\d{3,5})', tx[3])
    if m:
        inv_num = m.group(1)
        print(f'   Buscando transacciones relacionadas con {inv_num}:')
        c.execute('''
            SELECT t.number, t.date, a.code, l.debit, l.credit, l.cross_doc_ref, l.third_party_id
            FROM transactions t
            JOIN tx_lines l ON l.tx_id = t.id
            JOIN accounts a ON l.account_id = a.id
            WHERE (t.number LIKE ? OR l.cross_doc_ref LIKE ?)
              AND (a.code LIKE '13%' OR a.code LIKE '22%')
        ''', (f'%{inv_num}%', f'%{inv_num}%'))
        matches = c.fetchall()
        for mat in matches:
            print(f'     -> Tx={mat[0]} | Fecha={mat[1]} | Cta={mat[2]} | D={mat[3]} | C={mat[4]} | Ref="{mat[5]}" | Tercero={mat[6]}')
    print()
