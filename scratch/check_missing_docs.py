import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

mismatched_names = [
    'NELSON LEONARDO MU%OZ ROJAS',
    'ANDREA ESTEFANIA LOPEZ%VAQUERO',
    'CERAMICAS Y ACABADOS FLOREZ SAS'
]

for pat in mismatched_names:
    cursor.execute("SELECT id, name FROM third_parties WHERE name LIKE ?", (pat,))
    t = cursor.fetchone()
    tid, name = t[0], t[1]
    print(f"\n==========================================")
    print(f"TERCERO: {name}")
    
    # Opening lines before 2026-01-01
    cursor.execute("""
        SELECT l.cross_doc_ref, SUM(l.debit - l.credit)
        FROM tx_lines l
        JOIN transactions t ON t.id = l.tx_id
        JOIN accounts a ON a.id = l.account_id
        WHERE t.status = 'active'
          AND a.code = '13050501'
          AND COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id) = ?
          AND t.date < '2026-01-01'
        GROUP BY l.cross_doc_ref
    """, (tid,))
    openings_by_doc = cursor.fetchall()
    print("Documentos con saldo anterior al 2026-01-01:")
    for doc, bal in openings_by_doc:
        print(f"  Doc Cruce '{doc}': {bal:,.2f}")
        
    # Period lines in Jan 2026
    cursor.execute("""
        SELECT DISTINCT l.cross_doc_ref
        FROM tx_lines l
        JOIN transactions t ON t.id = l.tx_id
        JOIN accounts a ON a.id = l.account_id
        WHERE t.status = 'active'
          AND a.code = '13050501'
          AND COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id) = ?
          AND t.date >= '2026-01-01' AND t.date <= '2026-01-31 23:59:59'
    """, (tid,))
    period_docs = set(r[0] for r in cursor.fetchall())
    print(f"Documentos con movimientos en enero 2026: {period_docs}")
    
    missing_docs = [d for d in openings_by_doc if d[0] not in period_docs]
    print(f"Documentos con saldo anterior SIN movimientos en enero 2026:")
    for doc, bal in missing_docs:
        print(f"  --> Doc Cruce '{doc}': {bal:,.2f}")
