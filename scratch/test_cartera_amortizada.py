import sqlite3

db_path = 'empresas/empresa_8094/pb_data/data.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

def test_unit_cartera(prop_code):
    print(f"\n--- Cartera para unidad {prop_code} ---")
    c.execute("SELECT id, owner_id FROM ph_properties WHERE code = ?", (prop_code,))
    prop = c.fetchone()
    if not prop:
        print("Propiedad no encontrada")
        return
    prop_id, owner_id = prop

    # 1. Facturas
    c.execute("SELECT id, number, date, total, status FROM ph_invoices WHERE property_id = ? AND status != 'voided'", (prop_id,))
    invs = c.fetchall()
    print("Facturas registradas:")
    total_invs = 0
    for inv in invs:
        print(f"  {inv[1]} | Fecha: {inv[2]} | Total: ${inv[3]:,.2f} | Estado: {inv[4]}")
        if inv[4] != 'paid':
            total_invs += inv[3]

    # 2. Cartera CxC en 13 (saldo neto por factura)
    c.execute("""
        SELECT l.cross_doc_ref, ROUND(SUM(l.debit) - SUM(l.credit), 2) AS saldo_cxc
        FROM tx_lines l
        JOIN accounts a ON a.id = l.account_id AND a.code LIKE '13%'
        JOIN transactions t ON t.id = l.tx_id AND t.status = 'active'
        WHERE (t.cross_number IN (SELECT number FROM ph_invoices WHERE property_id = ?)
           OR l.cross_doc_ref IN (SELECT number FROM ph_invoices WHERE property_id = ?))
        GROUP BY l.cross_doc_ref
    """, (prop_id, prop_id))
    cxc_lines = c.fetchall()
    print("Partidas abiertas en CxC (13):")
    total_cxc = 0
    for cl in cxc_lines:
        print(f"  Ref: {cl[0]} | Saldo: ${cl[1]:,.2f}")
        total_cxc += cl[1]

    # 3. Anticipos en 28
    c.execute("""
        SELECT l.cross_doc_ref, ROUND(SUM(l.credit) - SUM(l.debit), 2) AS saldo_ant
        FROM tx_lines l
        JOIN accounts a ON a.id = l.account_id AND a.code LIKE '28%'
        JOIN transactions t ON t.id = l.tx_id AND t.status = 'active'
        WHERE l.cross_doc_ref = ? OR l.third_party_id = ?
        GROUP BY l.cross_doc_ref
    """, (f"ANT-{prop_id}", owner_id))
    ant_lines = c.fetchall()
    print("Anticipos en cuenta 28:")
    total_ant = 0
    for al in ant_lines:
        print(f"  Ref: {al[0]} | Saldo a favor: ${al[1]:,.2f}")
        total_ant += al[1]

    neto_cartera = max(0, total_cxc - total_ant)
    print(f"RESUMEN UNIDAD {prop_code}:")
    print(f"  Cartera bruta (13):    ${total_cxc:,.2f}")
    print(f"  (-) Saldo a favor (28): ${total_ant:,.2f}")
    print(f"  (=) Cartera neta real:  ${neto_cartera:,.2f}")
    if total_ant >= total_cxc:
        print(f"  -> La unidad está al día con remanente a favor de ${total_ant - total_cxc:,.2f}. No debe cobrarse mora!")

test_unit_cartera('4204')
test_unit_cartera('4702')

conn.close()
