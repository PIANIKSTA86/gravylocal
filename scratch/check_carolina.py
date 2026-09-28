import sqlite3
conn = sqlite3.connect('empresas/empresa_8094/pb_data/data.db')
c = conn.cursor()
p = c.execute("SELECT id, name, code, owner_id FROM ph_properties WHERE name LIKE '%A-104%' OR code LIKE '%104%'").fetchall()
print('Property:', p)
if p:
    pid = p[0][0]
    invs = c.execute("SELECT id, number, period, total, status FROM ph_invoices WHERE property_id=?", (pid,)).fetchall()
    print('Invoices:', invs)
    txs = c.execute("SELECT l.id, a.code, l.debit, l.credit, l.cross_doc_ref, t.date, t.number FROM tx_lines l INNER JOIN transactions t ON t.id=l.tx_id INNER JOIN accounts a ON a.id=l.account_id WHERE (l.cross_doc_ref LIKE ? OR l.cross_doc_ref LIKE ?) AND t.status='active'", (f'%{pid}%', '%1104%')).fetchall()
    print('Tx lines with prop or ref 1104:', txs)
    if p[0][3]:
        oid = p[0][3]
        txs_owner = c.execute("SELECT l.id, a.code, l.debit, l.credit, l.cross_doc_ref, t.date, t.number FROM tx_lines l INNER JOIN transactions t ON t.id=l.tx_id INNER JOIN accounts a ON a.id=l.account_id WHERE (l.third_party_id=? OR t.third_party_id=?) AND t.status='active'", (oid, oid)).fetchall()
        print('Tx lines with owner:', txs_owner)
