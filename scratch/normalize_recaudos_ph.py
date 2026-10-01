import sqlite3
import shutil
import json
import os
import datetime

db_path = 'empresas/empresa_8094/pb_data/data.db'
backup_path = f'empresas/empresa_8094/pb_data/data_backup_before_rc_norm_{datetime.datetime.now().strftime("%Y%m%d_%H%M%S")}.db'

print(f"Creating backup: {backup_path}")
shutil.copy2(db_path, backup_path)
print("Backup created successfully.")

conn = sqlite3.connect(db_path)
c = conn.cursor()

# Find affected transactions
c.execute("""
SELECT DISTINCT t.id, t.number, t.date, t.description, t.teso_params
FROM transactions t
JOIN tx_lines l ON l.tx_id = t.id
WHERE l.description LIKE '%Aplicación saldo a favor%' 
   OR l.description LIKE '%Abono desde anticipo%'
ORDER BY t.date ASC, t.number ASC
""")
affected_txs = c.fetchall()

print(f"\nFound {len(affected_txs)} transactions to normalize.\n")

report_units = {}
total_normalized = 0

for tid, num, dt, desc, teso_params in affected_txs:
    # Get property & owner info
    p_json = {}
    if teso_params:
        try:
            p_json = json.loads(teso_params)
        except:
            pass
            
    pid = p_json.get('ph_property_id')
    p_code = 'N/A'
    p_name = 'N/A'
    owner_name = 'N/A'
    owner_doc = 'N/A'
    
    if pid:
        c.execute('SELECT code, name, owner_id FROM ph_properties WHERE id = ?', (pid,))
        p_row = c.fetchone()
        if p_row:
            p_code = p_row[0]
            p_name = p_row[1]
            c.execute('SELECT name, doc_number FROM third_parties WHERE id = ?', (p_row[2],))
            t_row = c.fetchone()
            if t_row:
                owner_name = t_row[0]
                owner_doc = t_row[1]

    # Fetch lines of transaction
    c.execute("""
        SELECT l.id, a.code, l.debit, l.credit, l.cross_doc_ref, l.description, l.account_id, l.third_party_id
        FROM tx_lines l 
        JOIN accounts a ON a.id = l.account_id 
        WHERE l.tx_id = ?
        ORDER BY l.id ASC
    """, (tid,))
    lines = c.fetchall()
    
    bank_lines = []
    ant_deb_lines = []
    ant_from_lines = []
    cash_cf_lines = []
    new_ant_lines = []
    
    for lid, acode, deb, cred, ref, ldesc, acc_id, tp_id in lines:
        item = {
            'id': lid, 'code': acode, 'deb': deb, 'cred': cred, 
            'ref': ref, 'desc': ldesc, 'acc_id': acc_id, 'tp_id': tp_id
        }
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
    
    # Invoices and their total payments targeted by this RC:
    invoice_payments = {}
    cxc_account_id = None
    cxc_tp_id = None
    
    for af in ant_from_lines:
        ref = af['ref']
        invoice_payments[ref] = invoice_payments.get(ref, 0) + af['cred']
        cxc_account_id = af['acc_id']
        cxc_tp_id = af['tp_id']
    for cf in cash_cf_lines:
        ref = cf['ref']
        invoice_payments[ref] = invoice_payments.get(ref, 0) + cf['cred']
        cxc_account_id = cf['acc_id']
        cxc_tp_id = cf['tp_id']
        
    # Delete the lines to be removed
    lines_to_delete = []
    for l in ant_deb_lines:
        lines_to_delete.append(l['id'])
    for l in ant_from_lines:
        lines_to_delete.append(l['id'])
    for l in cash_cf_lines:
        lines_to_delete.append(l['id'])
    for l in new_ant_lines:
        lines_to_delete.append(l['id'])
        
    for lid in lines_to_delete:
        c.execute("DELETE FROM tx_lines WHERE id = ?", (lid,))
        
    # Recreate pristine portfolio lines paid by the bank cash:
    rem_cash = total_bank
    recreated_lines = []
    
    # Sort invoice payments by invoice number (which usually matches period order e.g. CF-202606 before CF-202607)
    for ref in sorted(invoice_payments.keys()):
        amt = invoice_payments[ref]
        pay_from_cash = min(rem_cash, amt)
        if pay_from_cash > 0:
            import random, string
            new_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=15))
            c.execute("""
                INSERT INTO tx_lines (id, tx_id, account_id, third_party_id, debit, credit, cross_doc_ref, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (new_id, tid, cxc_account_id, cxc_tp_id, 0, pay_from_cash, ref, f"Abono a {ref}"))
            recreated_lines.append((ref, pay_from_cash))
            rem_cash -= pay_from_cash
            
    # If genuine excess bank cash remains:
    if rem_cash > 0.01:
        import random, string
        new_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=15))
        ref_ant = new_ant_lines[0]['ref'] if new_ant_lines else f"ANTICIPO-{dt[:7].replace('-','')}-{pid}"
        c.execute("""
            INSERT INTO tx_lines (id, tx_id, account_id, third_party_id, debit, credit, cross_doc_ref, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (new_id, tid, cxc_account_id, cxc_tp_id, 0, rem_cash, ref_ant, f"Abono anticipado cuota {dt[:7]} - {p_code}"))
        recreated_lines.append((ref_ant, rem_cash))
        rem_cash = 0
        
    # Update teso_params to reflect cruzar_anticipos = false
    if teso_params:
        try:
            p_dict = json.loads(teso_params)
            p_dict['cruzar_anticipos'] = False
            c.execute("UPDATE transactions SET teso_params = ? WHERE id = ?", (json.dumps(p_dict), tid))
        except:
            pass

    # Verify transaction balance
    c.execute("SELECT SUM(debit), SUM(credit) FROM tx_lines WHERE tx_id = ?", (tid,))
    tot_deb, tot_cred = c.fetchone()
    diff = round(abs(tot_deb - tot_cred), 2)
    if diff > 0.01:
        raise Exception(f"Balance check failed on {num}: deb={tot_deb} cred={tot_cred}")
        
    total_normalized += 1
    
    if p_code not in report_units:
        report_units[p_code] = {
            'name': p_name,
            'owner': owner_name,
            'doc': owner_doc,
            'txs': []
        }
    report_units[p_code]['txs'].append({
        'number': num,
        'date': dt,
        'bank_amount': total_bank,
        'recreated': recreated_lines
    })

conn.commit()
print(f"COMMITTED: {total_normalized} transactions successfully normalized and verified!\n")

# Print structured report
print("="*95)
print("REPORTE DE UNIDADES HABITACIONALES Y TRANSACCIONES NORMALIZADAS")
print("="*95)
for code in sorted(report_units.keys()):
    u = report_units[code]
    print(f"\nUnidad: {code} | {u['name']} | Propietario: {u['owner']} [CC/NIT: {u['doc']}]")
    for t in u['txs']:
        rec_str = ", ".join([f"{r[0]}: ${r[1]:,.2f}" for r in t['recreated']])
        print(f"  • {t['number']} ({t['date']}) - Recaudo Banco: ${t['bank_amount']:,.2f} -> {rec_str}")
