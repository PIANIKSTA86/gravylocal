import sqlite3
import json

conn = sqlite3.connect('empresas/empresa_8094/pb_data/data.db')
c = conn.cursor()
c.execute("SELECT fields FROM _collections WHERE name='ph_invoice_lines'")
fields = json.loads(c.fetchone()[0])
for f in fields:
    if f.get('name') == 'concept_id':
        print("concept_id field config:", f)
