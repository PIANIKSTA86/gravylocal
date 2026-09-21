import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

cases = [
    ('830008524', 'RHENUS LOGISTICS COLOMBIA SAS', '22%'),
    ('800084048', 'SOCIEDAD PORTUARIA TERMINAL CO', '22%'),
    ('901127967', 'CENTRO MEDICO EN SEG.Y SALUD E', '22%'),
    ('29900833', 'LUZ DENICE LOPEZ VARGAS', '13%')
]

for nit, name, acc_pref in cases:
    print(f"\n==================================================")
    print(f"CASO: {name} (NIT: {nit})")
    print(f"==================================================")
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
        JOIN third_parties tp ON l.third_party_id = tp.id
        WHERE tp.doc_number = ?
          AND a.code LIKE ?
          AND t.status = 'active'
        ORDER BY t.date, t.number
    ''', (nit, acc_pref))
    for r in c.fetchall():
        print(f"  Tx:{r[0]} | Tipo:{r[1]} | Fecha:{r[2]} | Cta:{r[3]} | D:{r[4]:,.2f} | C:{r[5]:,.2f} | Ref:\"{r[6]}\" | Desc:{(r[7] or '')[:35]}")
