import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

# Simular la lógica exacta de getOpenItems para CXC (Recaudos)
# y encontrar qué documentos aparecen con saldo abierto > 0 cuando el tercero ya está en cero,
# o cuando el pago se registró sin cross_doc_ref, o con cross_doc_ref diferente.

c.execute('''
    SELECT 
        l.third_party_id,
        tp.name as tercero_nombre,
        tp.doc_number as tercero_doc,
        l.cross_doc_ref,
        a.code as account_code,
        a.name as account_name,
        sum(l.debit) as deb,
        sum(l.credit) as cred,
        round(sum(l.debit) - sum(l.credit), 2) as saldo_doc
    FROM tx_lines l
    JOIN transactions t ON l.tx_id = t.id
    JOIN accounts a ON l.account_id = a.id
    LEFT JOIN third_parties tp ON l.third_party_id = tp.id
    WHERE t.status = 'active'
      AND a.code LIKE '13%'
      AND a.code NOT LIKE '1330%'
      AND l.cross_doc_ref IS NOT NULL 
      AND trim(l.cross_doc_ref) != ''
    GROUP BY l.third_party_id, l.cross_doc_ref, a.code
    HAVING abs(sum(l.debit) - sum(l.credit)) > 1.0
''')

cxc_open = c.fetchall()
print(f"Total documentos CXC con saldo abierto según doc_cruce: {len(cxc_open)}")

# Ahora veamos cuántos de estos terceros tienen saldo contable global menor o igual a 0 en la cuenta 13!
cxc_phantom = []
for row in cxc_open:
    t_id = row[0]
    doc_ref = row[3]
    saldo_doc = row[8]
    # Saldo contable global del tercero en la cuenta 13
    c.execute('''
        SELECT round(sum(l.debit) - sum(l.credit), 2)
        FROM tx_lines l
        JOIN transactions t ON l.tx_id = t.id
        JOIN accounts a ON l.account_id = a.id
        WHERE t.status = 'active'
          AND a.code LIKE '13%'
          AND a.code NOT LIKE '1330%'
          AND l.third_party_id = ?
    ''', (t_id,))
    res = c.fetchone()
    global_saldo = res[0] if res and res[0] is not None else 0.0
    
    # Si el saldo contable global es 0 (o mucho menor que el saldo del documento), significa que contablemente ya fue cancelado!
    if global_saldo <= 1.0 and saldo_doc > 1.0:
        cxc_phantom.append({
            'third_id': t_id,
            'third_name': row[1],
            'third_doc': row[2],
            'cross_doc_ref': doc_ref,
            'account': row[4],
            'saldo_doc': saldo_doc,
            'global_saldo': global_saldo
        })

print(f"\nDocumentos CXC que APARECEN PENDIENTES en Tesorería pero el tercero ya tiene saldo contable <= 0: {len(cxc_phantom)}")
for p in cxc_phantom[:15]:
    print(f"  Tercero: {p['third_name']} ({p['third_doc']}) | Doc: {p['cross_doc_ref']} | Saldo Doc: {p['saldo_doc']} | Saldo Contable Global: {p['global_saldo']}")

# Lo mismo para CXP (Proveedores - Cuentas 22, 23)
c.execute('''
    SELECT 
        l.third_party_id,
        tp.name as tercero_nombre,
        tp.doc_number as tercero_doc,
        l.cross_doc_ref,
        a.code as account_code,
        a.name as account_name,
        sum(l.debit) as deb,
        sum(l.credit) as cred,
        round(sum(l.credit) - sum(l.debit), 2) as saldo_doc
    FROM tx_lines l
    JOIN transactions t ON l.tx_id = t.id
    JOIN accounts a ON l.account_id = a.id
    LEFT JOIN third_parties tp ON l.third_party_id = tp.id
    WHERE t.status = 'active'
      AND (a.code LIKE '22%' OR a.code LIKE '23%')
      AND l.cross_doc_ref IS NOT NULL 
      AND trim(l.cross_doc_ref) != ''
    GROUP BY l.third_party_id, l.cross_doc_ref, a.code
    HAVING abs(sum(l.credit) - sum(l.debit)) > 1.0
''')
cxp_open = c.fetchall()
print(f"\nTotal documentos CXP con saldo abierto según doc_cruce: {len(cxp_open)}")

cxp_phantom = []
for row in cxp_open:
    t_id = row[0]
    doc_ref = row[3]
    saldo_doc = row[8]
    c.execute('''
        SELECT round(sum(l.credit) - sum(l.debit), 2)
        FROM tx_lines l
        JOIN transactions t ON l.tx_id = t.id
        JOIN accounts a ON l.account_id = a.id
        WHERE t.status = 'active'
          AND (a.code LIKE '22%' OR a.code LIKE '23%')
          AND l.third_party_id = ?
    ''', (t_id,))
    res = c.fetchone()
    global_saldo = res[0] if res and res[0] is not None else 0.0
    
    if global_saldo <= 1.0 and saldo_doc > 1.0:
        cxp_phantom.append({
            'third_id': t_id,
            'third_name': row[1],
            'third_doc': row[2],
            'cross_doc_ref': doc_ref,
            'account': row[4],
            'saldo_doc': saldo_doc,
            'global_saldo': global_saldo
        })

print(f"\nDocumentos CXP que APARECEN PENDIENTES en Tesorería pero el proveedor ya tiene saldo contable <= 0: {len(cxp_phantom)}")
for p in cxp_phantom[:15]:
    print(f"  Tercero: {p['third_name']} ({p['third_doc']}) | Doc: {p['cross_doc_ref']} | Saldo Doc: {p['saldo_doc']} | Saldo Contable Global: {p['global_saldo']}")
