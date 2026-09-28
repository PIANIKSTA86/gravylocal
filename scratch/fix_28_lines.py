import sqlite3

db_path = './empresas/empresa_8094/pb_data/data.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# ID de la cuenta 13459501
cur.execute("SELECT id, code, name FROM accounts WHERE code = '13459501'")
acc_1345 = cur.fetchone()
print(f"Cuenta Cartera PH 13459501: {acc_1345}")

# Buscar las 6 líneas que debitan a cuentas 2805
cur.execute("""
    SELECT tl.id, t.number, a.code, tl.debit, tl.credit, tl.cross_doc_ref, tl.description
    FROM tx_lines tl
    JOIN accounts a ON tl.account_id = a.id
    JOIN transactions t ON tl.tx_id = t.id
    WHERE a.code LIKE '2805%'
""")
rows = cur.fetchall()
print(f"\nLineas encontradas en 2805: {len(rows)}")
for r in rows:
    print(" ", r)

if acc_1345 and len(rows) > 0:
    for r in rows:
        line_id = r[0]
        tx_num = r[1]
        print(f"Reclasificando linea {line_id} (Doc: {tx_num}): 28050501 -> 13459501")
        cur.execute("""
            UPDATE tx_lines
            SET account_id = ?
            WHERE id = ?
        """, (acc_1345[0], line_id))
    conn.commit()
    print("\n[OK] Todas las 6 líneas fueron reclasificadas a la cuenta 13459501.")
else:
    print("No se encontraron líneas.")

# Verificar estado final de cuentas 28 en empresa_8094
cur.execute("""
    SELECT tl.id, t.number, a.code, tl.debit, tl.credit, tl.description
    FROM tx_lines tl
    JOIN accounts a ON tl.account_id = a.id
    JOIN transactions t ON tl.tx_id = t.id
    WHERE a.code LIKE '28%'
""")
remaining_28 = cur.fetchall()
print(f"\nLineas restantes en clase 28 en empresa_8094: {len(remaining_28)}")
for r in remaining_28:
    print(" ", r)

conn.close()
