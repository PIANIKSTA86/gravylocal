import sqlite3

db_path = 'empresas/empresa_8094/pb_data/data.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Buscar una factura no pagada cuya propiedad tenga saldo a favor
c.execute("""
    SELECT 
        i.id, i.number, i.total, i.property_id, p.code, p.owner_id, tp.name,
        ROUND(SUM(l.credit) - SUM(l.debit), 2) AS saldo_ant
    FROM ph_invoices i
    JOIN ph_properties p ON p.id = i.property_id
    LEFT JOIN third_parties tp ON tp.id = p.owner_id
    JOIN tx_lines l ON l.cross_doc_ref = 'ANT-' || p.id
    JOIN accounts a ON a.id = l.account_id AND a.code LIKE '28%'
    JOIN transactions t ON t.id = l.tx_id AND t.status = 'active'
    WHERE i.status != 'paid' AND i.status != 'voided'
    GROUP BY i.id
    HAVING saldo_ant > 0
    ORDER BY i.date DESC
    LIMIT 3
""")

rows = c.fetchall()
print(f"Facturas pendientes con anticipo disponible: {len(rows)}")
for r in rows:
    print(f"  Factura: {r[1]} | Total: ${r[2]:,.2f} | Propiedad: {r[4]} | Propietario: {r[6]} | Anticipo Disp: ${r[7]:,.2f}")

conn.close()
