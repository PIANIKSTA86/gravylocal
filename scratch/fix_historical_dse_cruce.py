import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

# 1. Buscar transacciones de DSE donde la cuenta de proveedores tenga cross_doc_ref vacío
cursor.execute('''
    SELECT tl.id, tl.tx_id, t.number, tl.account_id, a.code, a.name, tl.credit, tl.cross_doc_ref, pi.id, pi.number
    FROM tx_lines tl
    JOIN transactions t ON t.id = tl.tx_id
    JOIN accounts a ON a.id = tl.account_id
    LEFT JOIN purchase_invoices pi ON pi.tx_id = t.id
    WHERE (t.number LIKE 'DSE%' OR t.number LIKE 'DS-%' OR (pi.id IS NOT NULL AND (pi.number LIKE 'DSE%' OR pi.number LIKE 'DS%')))
      AND a.maneja_cruce = 1
      AND (tl.cross_doc_ref IS NULL OR TRIM(tl.cross_doc_ref) = '')
''')

rows = cursor.fetchall()
print(f"Líneas de cuentas con cruce sin cross_doc_ref encontradas: {len(rows)}")

fixed = 0
for r in rows:
    line_id, tx_id, tx_num, acc_id, acc_code, acc_name, credit, current_ref, pi_id, pi_num = r
    # Determinar el consecutivo oficial
    consecutivo = pi_num or tx_num
    if consecutivo:
        print(f"  Reparando línea {line_id} (Tx: {tx_num}, Cuenta: {acc_code}): asignando cross_doc_ref='{consecutivo}'")
        cursor.execute("UPDATE tx_lines SET cross_doc_ref = ? WHERE id = ?", (consecutivo, line_id))
        fixed += 1

# También actualizar purchase_invoices.supplier_ref si está vacío para estos DSE
cursor.execute('''
    UPDATE purchase_invoices
    SET supplier_ref = number
    WHERE (number LIKE 'DSE%' OR number LIKE 'DS%')
      AND (supplier_ref IS NULL OR TRIM(supplier_ref) = '')
''')
pi_updated = cursor.rowcount
print(f"purchase_invoices actualizados con supplier_ref = number: {pi_updated}")

conn.commit()
print(f"Total líneas reparadas: {fixed}")

# 2. Verificación final
cursor.execute('''
    SELECT t.number, a.code, tl.debit, tl.credit, tl.cross_doc_ref
    FROM tx_lines tl
    JOIN transactions t ON t.id = tl.tx_id
    JOIN accounts a ON a.id = tl.account_id
    WHERE t.number IN ('DSE-00000316', 'DSE-00000317', 'DSE-315')
      AND a.maneja_cruce = 1
''')
print("\nVerificación de líneas DSE recientes:")
for r in cursor.fetchall():
    print(r)

conn.close()
