import sqlite3
import json

conn = sqlite3.connect('empresas/empresa_8094/pb_data/auxiliary.db')
c = conn.cursor()
c.execute("""
    SELECT created, message, data 
    FROM _logs 
    WHERE json_extract(data, '$.status') = 400
    ORDER BY created DESC 
    LIMIT 20
""")
for r in c.fetchall():
    data = json.loads(r[2])
    print(f"[{r[0]}] {data.get('method')} {data.get('url')} -> Error: {data.get('error')}, Details: {data.get('details')}")
