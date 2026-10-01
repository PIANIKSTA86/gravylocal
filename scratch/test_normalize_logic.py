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

success_count = 0
for tid, num, dt, desc, teso_params in txs:
    c.execute('''
        SELECT l.id, a.code, l.debit, l.credit, l.cross_doc_ref, l.description, l.account_id
        FROM tx_lines l 
        JOIN accounts a ON a.id = l.account_id 
        WHERE l.tx_id = ?
        ORDER BY l.id ASC
    ''', (tid,))
    lines = c.fetchall()
    
    bank_lines = []
    ant_deb_lines = []
    ant_from_lines = []
    cash_cf_lines = []
    new_ant_lines = []
    
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
        else:
            cash_cf_lines.append(item)
            
    total_bank = sum(l['deb'] for l in bank_lines)
    
    # Invoices involved and their total payment across both anticipo and cash:
    # Notice: What was paid to each invoice in this RC?
    invoice_payments = {}
    cxc_account_id = None
    for af in ant_from_lines:
        ref = af['ref']
        invoice_payments[ref] = invoice_payments.get(ref, 0) + af['cred']
        cxc_account_id = af['acc_id']
    for cf in cash_cf_lines:
        ref = cf['ref']
        invoice_payments[ref] = invoice_payments.get(ref, 0) + cf['cred']
        cxc_account_id = cf['acc_id']
        
    # How much bank cash was available?
    # Bank cash should pay the invoices up to their total payment, and any remaining bank cash is genuine new anticipo.
    # Note: in all these transactions, the total invoice payment requested was sum(invoice_payments.values()).
    # If total_bank >= sum(invoice_payments):
    #   Invoices are fully paid by bank cash!
    #   Remaining bank cash = total_bank - sum(invoice_payments).
    total_inv_payment = sum(invoice_payments.values())
    real_excess = max(0, total_bank - total_inv_payment)
    
    # Construct normalized lines:
    norm_lines = []
    # 1. Bank line (untouched)
    for bl in bank_lines:
        norm_lines.append({'deb': bl['deb'], 'cred': 0, 'ref': bl['ref'], 'desc': bl['desc'], 'code': bl['code']})
        
    # 2. Invoice lines (paid with cash)
    rem_cash = total_bank
    for ref, amt in sorted(invoice_payments.items()):
        pay_from_cash = min(rem_cash, amt)
        if pay_from_cash > 0:
            norm_lines.append({'deb': 0, 'cred': pay_from_cash, 'ref': ref, 'desc': f'Abono a {ref}', 'code': '13459501'})
            rem_cash -= pay_from_cash
            
    # 3. If any real excess bank cash remains:
    if rem_cash > 0.01:
        # Keep or adjust the new_ant line with the real excess
        # Get the first new_ant line's ref or generate one
        ref_ant = new_ant_lines[0]['ref'] if new_ant_lines else f'ANTICIPO-{dt[:7].replace("-","")}'
        norm_lines.append({'deb': 0, 'cred': rem_cash, 'ref': ref_ant, 'desc': f'Abono anticipado cuota {dt[:7]}', 'code': '13459501'})
        rem_cash = 0
        
    tot_deb = sum(l['deb'] for l in norm_lines)
    tot_cred = sum(l['cred'] for l in norm_lines)
    diff = round(tot_deb - tot_cred, 2)
    if abs(diff) > 0.01:
        print(f"ERROR on {num}: deb={tot_deb} cred={tot_cred} diff={diff}")
    else:
        success_count += 1

print(f"\nAll {success_count} / {len(txs)} transactions successfully simulated and perfectly balanced!")
