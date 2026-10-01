import sqlite3
import json

db = 'empresas/empresa_8094/pb_data/data.db'
conn = sqlite3.connect(db)
c = conn.cursor()

c.execute('''
SELECT DISTINCT t.id, t.number, t.date, t.description, t.teso_params
FROM transactions t
JOIN tx_lines l ON l.tx_id = t.id
WHERE l.description LIKE '%Aplicación saldo a favor%' 
   OR l.description LIKE '%Abono desde anticipo%'
ORDER BY t.number ASC
''')
txs = c.fetchall()

print(f"Total TXs to normalize: {len(txs)}")

for tid, num, dt, desc, teso_params in txs:
    c.execute('''
        SELECT l.id, a.code, l.debit, l.credit, l.cross_doc_ref, l.description, l.account_id
        FROM tx_lines l 
        JOIN accounts a ON a.id = l.account_id 
        WHERE l.tx_id = ?
        ORDER BY l.id ASC
    ''', (tid,))
    lines = c.fetchall()
    
    # Classify lines
    bank_lines = []
    ant_deb_lines = []
    ant_from_lines = []
    cash_cf_lines = []
    new_ant_lines = []
    other_lines = []
    
    for lid, acode, deb, cred, ref, ldesc, acc_id in lines:
        item = {'id': lid, 'code': acode, 'deb': deb, 'cred': cred, 'ref': ref, 'desc': ldesc, 'acc_id': acc_id}
        if acode.startswith('11'):
            bank_lines.append(item)
        elif 'Aplicación saldo a favor' in ldesc or 'Aplicación anticipo' in ldesc:
            ant_deb_lines.append(item)
        elif 'Abono desde anticipo' in ldesc:
            ant_from_lines.append(item)
        elif 'Abono anticipado' in ldesc or 'Anticipo / Saldo a favor' in ldesc:
            new_ant_lines.append(item)
        elif ldesc.startswith('Abono a ') or ref.startswith('CF-'):
            cash_cf_lines.append(item)
        else:
            other_lines.append(item)
            
    total_bank = sum(l['deb'] for l in bank_lines)
    total_ant_deb = sum(l['deb'] for l in ant_deb_lines)
    total_ant_from = sum(l['cred'] for l in ant_from_lines)
    total_cash_cf = sum(l['cred'] for l in cash_cf_lines)
    total_new_ant = sum(l['cred'] for l in new_ant_lines)
    
    print(f"\nTX: {num} ({dt}) | Bank: {total_bank:,.2f}")
    print(f"  AntDeb: {total_ant_deb:,.2f}, AntFrom: {total_ant_from:,.2f}, CashCF: {total_cash_cf:,.2f}, NewAnt: {total_new_ant:,.2f}")
    for af in ant_from_lines:
        print(f"    AntFrom -> Ref: {af['ref']} | Amt: {af['cred']:,.2f}")
    for cf in cash_cf_lines:
        print(f"    CashCF  -> Ref: {cf['ref']} | Amt: {cf['cred']:,.2f}")
    for na in new_ant_lines:
        print(f"    NewAnt  -> Ref: {na['ref']} | Amt: {na['cred']:,.2f}")
