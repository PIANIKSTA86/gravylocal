import sqlite3

con = sqlite3.connect('pb_data/data.db')
con.row_factory = sqlite3.Row
cur = con.cursor()

date_from = '2026-08-01'
date_to = '2026-08-31'

# 1. Fetch valid purchase invoices (excluding voided/cancelled)
cur.execute("SELECT * FROM purchase_invoices WHERE date >= ? AND date <= ? AND status NOT IN ('voided', 'cancelled')", (date_from, date_to))
purchase_invoices = [dict(r) for r in cur.fetchall()]

purchase_map = {}
purchase_by_num_map = {}

for pinv in purchase_invoices:
    if pinv['status'] in ('voided', 'cancelled'):
        continue
    if pinv['tx_id']:
        existing = purchase_map.get(pinv['tx_id'])
        if not existing:
            purchase_map[pinv['tx_id']] = pinv
        elif existing['number'] != existing.get('tx_number') and pinv['number'] == pinv.get('tx_number'):
            purchase_map[pinv['tx_id']] = pinv
    if pinv['number']:
        key = f"{pinv.get('tx_type_id', '')}_{pinv['number']}"
        purchase_by_num_map[key] = pinv

# 2. Fetch transactions for FC
cur.execute("""
    SELECT t.id, t.number, t.date, t.description, t.tx_type_id, t.status, tp.name as third_party_name, tp.doc_number as third_party_doc
    FROM transactions t
    LEFT JOIN third_parties tp ON t.third_party_id = tp.id
    WHERE t.date >= ? AND t.date <= ? AND t.number LIKE 'FC%'
    ORDER BY t.number
""", (date_from, date_to))
tx_list = [dict(r) for r in cur.fetchall()]

print(f"Total FC transactions found: {len(tx_list)}")

for tx in tx_list:
    if tx['number'] not in ('FC-00000237', 'FC-00000238', 'FC-00000239'):
        continue
    
    # Lines
    cur.execute("""
        SELECT tl.*, a.code as acc_code
        FROM tx_lines tl
        LEFT JOIN accounts a ON tl.account_id = a.id
        WHERE tl.tx_id = ?
    """, (tx['id'],))
    lines = [dict(r) for r in cur.fetchall()]
    
    tot_debit = sum(l['debit'] or 0 for l in lines)
    tot_credit = sum(l['credit'] or 0 for l in lines)
    
    line_iva = 0
    line_retefuente = 0
    line_reteica = 0
    line_reteiva = 0
    line_affects = ''
    
    for l in lines:
        code = l['acc_code'] or ''
        val = abs((l['debit'] or 0) - (l['credit'] or 0))
        if code.startswith('24'):
            line_iva += val
        if code.startswith('2365') or code.startswith('135515') or (code.startswith('1355') and not code.startswith('135517') and not code.startswith('135518')):
            line_retefuente += val
        if code.startswith('2368') or code.startswith('135518'):
            line_reteica += val
        if code.startswith('2367') or code.startswith('135517'):
            line_reteiva += val
        ref = (l.get('cross_doc_ref') or '').strip()
        if ref and not line_affects:
            line_affects = ref

    line_ret = line_retefuente + line_reteica + line_reteiva
    
    # Safe match
    pinv = None
    if tx['id'] in purchase_map:
        cand = purchase_map[tx['id']]
        if not cand.get('number') or not tx['number'] or cand['number'] == tx['number'] or cand.get('tx_number') == tx['number']:
            pinv = cand
    if not pinv:
        cand = purchase_by_num_map.get(f"{tx.get('tx_type_id', '')}_{tx['number']}")
        if cand and cand['status'] not in ('voided', 'cancelled'):
            pinv = cand

    if pinv:
        ext_ref = pinv.get('supplier_ref') or line_affects or ''
        subtotal = float(pinv.get('subtotal') or 0)
        iva = float(pinv['iva_total']) if (pinv.get('iva_total') is not None and pinv['iva_total'] > 0) else line_iva
        retefuente = line_retefuente
        reteica = line_reteica
        retenciones = line_ret or float(pinv.get('ret_total') or 0)
        total = float(pinv['total']) if (pinv.get('total') and abs(float(pinv['total']) - tot_debit) < 1) else (tot_debit or (subtotal + iva))
        if subtotal == 0 and total > 0:
            subtotal = max(0, total - iva)
        neto = total - retenciones
        affects = line_affects or ext_ref
    else:
        iva = line_iva
        retefuente = line_retefuente
        reteica = line_reteica
        retenciones = line_ret
        total = tot_debit if tot_debit > 0 else tot_credit
        subtotal = max(0, total - iva)
        neto = total - retenciones
        ext_ref = line_affects or ''
        affects = line_affects or ''

    print(f"\n==================== {tx['number']} ====================")
    print(f"Descripcion: {tx['description']}")
    print(f"Tercero: {tx['third_party_name']} ({tx['third_party_doc']})")
    print(f"[AUDITORIA CONTABLE]  Débito: {tot_debit:,.2f} | Crédito: {tot_credit:,.2f} | Diferencia: {abs(tot_debit - tot_credit):,.2f}")
    print(f"[DETALLE COMERCIAL]   No Ext: '{ext_ref}' | Afecta: '{affects}'")
    print(f"                      Subtotal: {subtotal:,.2f} | IVA: {iva:,.2f} | Total: {total:,.2f} | Ret: {retenciones:,.2f} | Neto: {neto:,.2f}")
    print(f"Matched pinv: {pinv['id'] if pinv else 'None (Clean Accounting Fallback)'}")
