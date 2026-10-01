import sqlite3

conn = sqlite3.connect('empresas/empresa_8094/pb_data/data.db')
c = conn.cursor()
c.execute("""
SELECT l.id, l.invoice_id, i.number, l.concept_id, bc.name, bc.code, l.description, l.amount 
FROM ph_invoice_lines l 
JOIN ph_invoices i ON i.id = l.invoice_id 
LEFT JOIN ph_billing_concepts bc ON bc.id = l.concept_id 
WHERE i.number LIKE '%000007'
ORDER BY i.number, l.line_order
""")
for r in c.fetchall():
    print(r)
