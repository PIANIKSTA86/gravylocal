import sqlite3
import json

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
c.execute("SELECT value FROM settings WHERE key='inventory_settings_v1'")
row = c.fetchone()
val = json.loads(row[0]) if row else {}
val['costing_scope'] = 'GLOBAL'
c.execute("UPDATE settings SET value=? WHERE key='inventory_settings_v1'", (json.dumps(val),))
conn.commit()
print('Updated inventory_settings_v1:', val)
