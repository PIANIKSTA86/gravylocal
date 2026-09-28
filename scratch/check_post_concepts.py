import sqlite3
import json

conn = sqlite3.connect('empresas/empresa_8094/pb_data/auxiliary.db')
c = conn.cursor()
c.execute("SELECT id, message, data, created FROM _logs WHERE message LIKE '%POST /api/collections/ph_billing_concepts%' OR message LIKE '%POST /api/collections/ph_invoice_lines%' ORDER BY rowid DESC LIMIT 10")
for r in c.fetchall():
    print(r[0], r[1], r[3])
    print(r[2])
