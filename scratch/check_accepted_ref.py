import sqlite3
import re

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

cursor.execute("SELECT id, tx_id, xml_content FROM einvoice_docs WHERE xml_content LIKE '%<REF>%'")
rows = cursor.fetchall()
print(f"Found {len(rows)} docs with <REF>")

for r in rows:
    xml = r[2]
    m = re.search(r'<REF>[\s\S]*?</REF>', xml)
    if m:
        print(f"Doc ID {r[0]} REF tag:")
        print(m.group(0))

conn.close()
