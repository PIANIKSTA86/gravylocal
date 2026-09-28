import sqlite3
import json

conn = sqlite3.connect('empresas/empresa_8094/pb_data/data.db')
c = conn.cursor()
c.execute("SELECT name, createRule, updateRule, listRule, viewRule FROM _collections WHERE name IN ('ph_billing_concepts', 'ph_invoice_lines', 'ph_invoices')")
for r in c.fetchall():
    print(r)
