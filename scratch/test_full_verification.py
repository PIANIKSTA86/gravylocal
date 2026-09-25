import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

cursor.execute("SELECT id, code, name, nature, maneja_cruce FROM accounts")
accounts = {r[0]: {'id': r[0], 'code': r[1], 'name': r[2], 'nature': r[3], 'maneja_cruce': r[4]} for r in cursor.fetchall()}

cursor.execute("SELECT id, doc_number, name FROM third_parties")
thirds = {r[0]: {'id': r[0], 'doc': r[1], 'name': r[2]} for r in cursor.fetchall()}

cursor.execute("""
    SELECT
        l.account_id AS accountId,
        COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS thirdId,
        (CASE WHEN a.maneja_cruce = 1 OR a.maneja_cruce = 'true' THEN COALESCE(NULLIF(TRIM(l.cross_doc_ref), ''), 'SIN_DOC') ELSE 'NO_CRUCE' END) AS docCruce,
        SUM(l.debit - l.credit) AS balance
    FROM tx_lines l
    INNER JOIN transactions t ON t.id = l.tx_id
    INNER JOIN accounts a ON a.id = l.account_id
    WHERE t.status = 'active'
      AND t.date < '2026-01-01'
      AND a.code = '13050501'
    GROUP BY
        l.account_id,
        COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO'),
        (CASE WHEN a.maneja_cruce = 1 OR a.maneja_cruce = 'true' THEN COALESCE(NULLIF(TRIM(l.cross_doc_ref), ''), 'SIN_DOC') ELSE 'NO_CRUCE' END)
""")
openings = cursor.fetchall()

cursor.execute("""
    SELECT
        t.date AS fecha,
        t.number AS comprobante,
        t.id AS txId,
        l.account_id AS accountId,
        a.code AS accountCode,
        a.name AS accountName,
        a.nature AS accountNature,
        a.maneja_cruce AS accountManejaCruce,
        COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS thirdId,
        COALESCE(tp.name, 'Sin tercero') AS thirdName,
        COALESCE(tp.doc_number, '') AS thirdDoc,
        COALESCE(TRIM(l.cross_doc_ref), '') AS doc_cruce,
        COALESCE(l.description, t.description, '') AS descripcion,
        l.debit AS debito,
        l.credit AS credito
    FROM tx_lines l
    INNER JOIN transactions t ON t.id = l.tx_id
    INNER JOIN accounts a ON a.id = l.account_id
    LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
    WHERE t.status = 'active'
      AND t.date >= '2026-01-01'
      AND t.date <= '2026-01-31 23:59:59'
      AND a.code = '13050501'
""")
period_raw = cursor.fetchall()

# Run the complete logic
def build_report_data(mode='cuenta-tercero'):
    # Maps
    opening_by_account = {}
    opening_by_third_account = {}
    opening_by_doc = {}
    
    for b in openings:
        acc_id, third_id, doc_cruce, bal = b[0], b[1], b[2], float(b[3])
        opening_by_account[acc_id] = opening_by_account.get(acc_id, 0.0) + bal
        tk = f"{acc_id}|{third_id}"
        opening_by_third_account[tk] = opening_by_third_account.get(tk, 0.0) + bal
        dk = f"{acc_id}|{third_id}|{doc_cruce}"
        opening_by_doc[dk] = opening_by_doc.get(dk, 0.0) + bal

    # Period lines
    rows = []
    active_doc_keys = set()
    active_third_keys = set()
    active_acc_keys = set()
    
    for p in period_raw:
        acc_id, third_id, doc_cruce = p[3], p[8], p[11] or ''
        is_cruce = p[7] in (1, '1', True)
        cruce_key = doc_cruce if (is_cruce and doc_cruce) else ('SIN_DOC' if is_cruce else 'NO_CRUCE')
        active_doc_keys.add(f"{acc_id}|{third_id}|{cruce_key}")
        active_third_keys.add(f"{acc_id}|{third_id}")
        active_acc_keys.add(acc_id)
        
        t_display = f"{p[10]} - {p[9]}" if p[10] else p[9]
        rows.append({
            'fecha': p[0],
            'comprobante': p[1],
            'txId': p[2],
            'accountId': acc_id,
            'accountCode': p[4],
            'accountName': p[5],
            'accountNature': p[6] or 'debit',
            'accountManejaCruce': is_cruce,
            'thirdId': third_id,
            'thirdName': p[9],
            'thirdDoc': p[10],
            'tercero': t_display,
            'doc_cruce': doc_cruce,
            'descripcion': p[12],
            'debito': float(p[13]),
            'credito': float(p[14]),
            'keyCuenta': f"{p[4]} - {p[5]}".strip(),
            'keyTercero': t_display,
            'isOpeningRow': False,
        })
        
    # Add opening rows for items with non-zero opening balance not in period
    for b in openings:
        acc_id, third_id, doc_cruce, bal = b[0], b[1], b[2], float(b[3])
        if abs(bal) < 0.001:
            continue
        acc = accounts.get(acc_id, {})
        is_cruce = acc.get('maneja_cruce') in (1, '1', True)
        
        need_row = False
        if mode == 'cuenta-sin-tercero':
            if acc_id not in active_acc_keys:
                need_row = True
                active_acc_keys.add(acc_id)
        else:
            if is_cruce:
                dk = f"{acc_id}|{third_id}|{doc_cruce}"
                if dk not in active_doc_keys:
                    need_row = True
                    active_doc_keys.add(dk)
            else:
                tk = f"{acc_id}|{third_id}"
                if tk not in active_third_keys:
                    need_row = True
                    active_third_keys.add(tk)
                    
        if need_row:
            tp = thirds.get(third_id, {})
            t_name = tp.get('name', 'Sin tercero' if third_id == 'NO_TERCERO' else 'Tercero desconocido')
            t_doc = tp.get('doc', '')
            t_display = f"{t_doc} - {t_name}" if t_doc else t_name
            clean_cruce = '' if doc_cruce in ('NO_CRUCE', 'SIN_DOC') else doc_cruce
            rows.append({
                'fecha': '—',
                'comprobante': 'SALDO INICIAL',
                'txId': '',
                'accountId': acc_id,
                'accountCode': acc.get('code', ''),
                'accountName': acc.get('name', ''),
                'accountNature': acc.get('nature', 'debit'),
                'accountManejaCruce': is_cruce,
                'thirdId': third_id,
                'thirdName': t_name,
                'thirdDoc': t_doc,
                'tercero': t_display,
                'doc_cruce': clean_cruce,
                'descripcion': 'SALDO ANTERIOR PENDIENTE',
                'debito': 0.0,
                'credito': 0.0,
                'keyCuenta': f"{acc.get('code')} - {acc.get('name')}".strip(),
                'keyTercero': t_display,
                'isOpeningRow': True,
            })

    # Pre-calculate balances per row
    if mode == 'cuenta-sin-tercero':
        sorted_for_balance = sorted(rows, key=lambda r: f"{r['accountId']}|{r['fecha']}|{r['comprobante']}|{r['txId']}")
        acc_delta = {}
        for r in sorted_for_balance:
            acc_id = r['accountId']
            opening = opening_by_account.get(acc_id, 0.0)
            moved = acc_delta.get(acc_id, 0.0)
            delta = r['debito'] - r['credito']
            r['saldo_anterior'] = opening + moved
            r['saldo_actual'] = opening + moved + delta
            acc_delta[acc_id] = moved + delta
    else:
        # Group by stream
        # When maneja_cruce: doc|accountId|thirdId|docCruce
        # Otherwise: acc|accountId|thirdId
        sorted_for_balance = sorted(rows, key=lambda r: f"{r['accountId']}|{r['thirdId']}|{r['doc_cruce'] or 'SIN_DOC'}|{r['fecha']}|{r['comprobante']}")
        stream_delta = {}
        for r in sorted_for_balance:
            is_cruce = r['accountManejaCruce']
            acc_id = r['accountId']
            third_id = r['thirdId']
            doc_cruce = r['doc_cruce'] or ''
            cruce_key = doc_cruce if (is_cruce and doc_cruce) else ('SIN_DOC' if is_cruce else 'NO_CRUCE')
            
            stream_key = f"{acc_id}|{third_id}|{cruce_key}" if is_cruce else f"{acc_id}|{third_id}"
            opening = opening_by_doc.get(stream_key, 0.0) if is_cruce else opening_by_third_account.get(stream_key, 0.0)
            moved = stream_delta.get(stream_key, 0.0)
            delta = r['debito'] - r['credito']
            r['saldo_anterior'] = opening + moved
            r['saldo_actual'] = opening + moved + delta
            stream_delta[stream_key] = moved + delta

    return rows, opening_by_account, opening_by_third_account

# Run test for both modes
rows_st, open_acc, _ = build_report_data('cuenta-sin-tercero')
rows_ct, _, open_third = build_report_data('cuenta-tercero')

print(f"=== SIN TERCEROS ===")
tot_ant_st = sum(open_acc.values())
tot_deb_st = sum(r['debito'] for r in rows_st)
tot_cred_st = sum(r['credito'] for r in rows_st)
tot_act_st = tot_ant_st + tot_deb_st - tot_cred_st
print(f"Gran Total Sin Terceros: Ant={tot_ant_st:,.2f} | Deb={tot_deb_st:,.2f} | Cred={tot_cred_st:,.2f} | Act={tot_act_st:,.2f}")

print(f"\n=== CUENTA -> TERCERO ===")
tot_ant_ct = sum(open_acc.values())
tot_deb_ct = sum(r['debito'] for r in rows_ct)
tot_cred_ct = sum(r['credito'] for r in rows_ct)
tot_act_ct = tot_ant_ct + tot_deb_ct - tot_cred_ct
print(f"Gran Total Cuenta->Tercero: Ant={tot_ant_ct:,.2f} | Deb={tot_deb_ct:,.2f} | Cred={tot_cred_ct:,.2f} | Act={tot_act_ct:,.2f}")

# Check Ricardo Rivera in Cuenta->Tercero
ricardo_rows = [r for r in rows_ct if 'RICARDO ESTEBAN RIVERA GALLO' in r['keyTercero']]
ricardo_ant = sum(v for k, v in open_third.items() if 'w1lcxrz81b5driu' in k)
ricardo_deb = sum(r['debito'] for r in ricardo_rows)
ricardo_cred = sum(r['credito'] for r in ricardo_rows)
ricardo_act = ricardo_ant + ricardo_deb - ricardo_cred
print(f"\nRicardo Rivera Subtotal: Ant={ricardo_ant:,.2f} | Deb={ricardo_deb:,.2f} | Cred={ricardo_cred:,.2f} | Act={ricardo_act:,.2f}")
print("Rows for Ricardo:")
for r in ricardo_rows:
    print(f"  {r['fecha']} | {r['comprobante']} | Cruce: {r['doc_cruce']:<6} | Ant: {r['saldo_anterior']:>12,.2f} | Deb: {r['debito']:>12,.2f} | Cred: {r['credito']:>12,.2f} | Act: {r['saldo_actual']:>12,.2f}")
