import sqlite3
db = sqlite3.connect('empresas/empresa_8094/pb_data/data.db')
c = db.cursor()
c.execute("SELECT id, number, period, status, total, due_date, property_id FROM ph_invoices WHERE status != 'paid' AND status != 'voided'")
rows = c.fetchall()
print(f'Total unpaid non-voided invoices: {len(rows)}')
for r in rows[:10]:
    print(r)
