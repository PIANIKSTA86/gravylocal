import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

# Get accounts
cursor.execute("SELECT id, code, name, nature, maneja_cruce FROM accounts")
accounts = {r[0]: {'code': r[1], 'name': r[2], 'nature': r[3], 'maneja_cruce': r[4]} for r in cursor.fetchall()}

# Get third parties
cursor.execute("SELECT id, doc_number, name FROM third_parties")
thirds = {r[0]: {'doc': r[1], 'name': r[2]} for r in cursor.fetchall()}

# Opening balances for 13050501
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

# Period lines
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

# Simulate frontend logic
opening_by_key = {}
for b in openings:
    acc_id, third_id, doc_cruce, balance = b
    acc = accounts.get(acc_id, {})
    is_cruce = acc.get('maneja_cruce') in (1, '1', True)
    key = f"doc|{acc_id}|{third_id}|{doc_cruce}" if is_cruce else f"acc|{acc_id}|{third_id}"
    opening_by_key[key] = float(balance)

rows = []
for p in period_raw:
    is_cruce = p[7] in (1, '1', True)
    doc_cruce = p[11] or ''
    rows.append({
        'fecha': p[0],
        'comprobante': p[1],
        'txId': p[2],
        'accountId': p[3],
        'accountCode': p[4],
        'accountName': p[5],
        'thirdId': p[8],
        'thirdName': p[9],
        'thirdDoc': p[10],
        'doc_cruce': doc_cruce,
        'descripcion': p[12],
        'debito': float(p[13]),
        'credito': float(p[14]),
        'accountManejaCruce': is_cruce,
        'keyCuenta': f"{p[4]} - {p[5]}".strip(),
        'keyTercero': f"{p[10]} - {p[9]}" if p[10] else p[9],
    })

# Set of active keys in period
active_keys = set()
for r in rows:
    key = f"doc|{r['accountId']}|{r['thirdId']}|{r['doc_cruce'] or 'SIN_DOC'}" if r['accountManejaCruce'] else f"acc|{r['accountId']}|{r['thirdId']}"
    active_keys.add(key)

# Add synthetic opening rows for openingBalances that have no period movements
for b in openings:
    acc_id, third_id, doc_cruce, balance = b
    if abs(balance) < 0.001:
        continue
    acc = accounts.get(acc_id, {})
    is_cruce = acc.get('maneja_cruce') in (1, '1', True)
    key = f"doc|{acc_id}|{third_id}|{doc_cruce}" if is_cruce else f"acc|{acc_id}|{third_id}"
    if key not in active_keys:
        tp = thirds.get(third_id, {})
        t_name = tp.get('name', 'Sin tercero' if third_id == 'NO_TERCERO' else 'Tercero desconocido')
        t_doc = tp.get('doc', '')
        t_display = f"{t_doc} - {t_name}" if t_doc else t_name
        rows.append({
            'fecha': '2026-01-01',
            'comprobante': 'SALDO INICIAL',
            'txId': '',
            'accountId': acc_id,
            'accountCode': acc.get('code', ''),
            'accountName': acc.get('name', ''),
            'thirdId': third_id,
            'thirdName': t_name,
            'thirdDoc': t_doc,
            'doc_cruce': '' if doc_cruce in ('NO_CRUCE', 'SIN_DOC') else doc_cruce,
            'descripcion': 'SALDO ANTERIOR PENDIENTE',
            'debito': 0.0,
            'credito': 0.0,
            'accountManejaCruce': is_cruce,
            'keyCuenta': f"{acc.get('code')} - {acc.get('name')}".strip(),
            'keyTercero': t_display,
        })
        active_keys.add(key)

# Calculate balances
sorted_for_bal = sorted(rows, key=lambda r: f"{r['accountId']}|{r['thirdId']}|{r['fecha']}|{r['doc_cruce'] or 'SIN_DOC'}|{r['comprobante']}")
period_delta = {}
for r in sorted_for_bal:
    key = f"doc|{r['accountId']}|{r['thirdId']}|{r['doc_cruce'] or 'SIN_DOC'}" if r['accountManejaCruce'] else f"acc|{r['accountId']}|{r['thirdId']}"
    r['balanceKey'] = key
    opening = opening_by_key.get(key, 0.0)
    moved = period_delta.get(key, 0.0)
    delta = r['debito'] - r['credito']
    r['saldo_anterior'] = opening + moved
    r['saldo_actual'] = opening + moved + delta
    period_delta[key] = moved + delta

# Group and subtotal
grouped = {}
for r in rows:
    pk = r['keyCuenta']
    sk = r['keyTercero']
    if pk not in grouped: grouped[pk] = {}
    if sk not in grouped[pk]: grouped[pk][sk] = []
    grouped[pk][sk].append(r)

def calc_opening_total(items):
    seen = set()
    tot = 0.0
    for r in items:
        k = r['balanceKey']
        if not k or k in seen: continue
        seen.add(k)
        tot += r['saldo_anterior']
    return tot

def calc_closing_total(items):
    last_by_key = {}
    for r in items:
        k = r['balanceKey']
        if not k: continue
        last_by_key[k] = r['saldo_actual']
    return sum(last_by_key.values())

for pk, sec_map in grouped.items():
    p_rows = [r for sub in sec_map.values() for r in sub]
    p_prev = calc_opening_total(p_rows)
    p_deb = sum(r['debito'] for r in p_rows)
    p_cred = sum(r['credito'] for r in p_rows)
    p_curr = calc_closing_total(p_rows)
    print(f"\nSubTotal {pk}: SaldoAnt={p_prev:,.2f}, Deb={p_deb:,.2f}, Cred={p_cred:,.2f}, SaldoAct={p_curr:,.2f}")

tot_prev = calc_opening_total(rows)
tot_deb = sum(r['debito'] for r in rows)
tot_cred = sum(r['credito'] for r in rows)
tot_curr = calc_closing_total(rows)
print(f"\nGRAN TOTAL: SaldoAnt={tot_prev:,.2f}, Deb={tot_deb:,.2f}, Cred={tot_cred:,.2f}, SaldoAct={tot_curr:,.2f}")
