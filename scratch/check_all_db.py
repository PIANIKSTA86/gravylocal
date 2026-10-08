import sqlite3
import os
import glob

def check_db(path, label):
    if not os.path.exists(path):
        return
    print(f"=== {label} ({path}) ===")
    try:
        conn = sqlite3.connect(path)
        c = conn.cursor()
        c.execute("SELECT key, value FROM settings WHERE key IN ('company_name', 'company_nit')")
        for row in c.fetchall():
            print("  setting:", row)
        conn.close()
    except Exception as e:
        print("  Error:", e)

check_db('pb_data/data.db', 'ROOT Tenant (puerto 8090)')
for d in sorted(glob.glob('empresas/empresa_*/pb_data/data.db')):
    check_db(d, d.split('/')[1] if '/' in d else d.split('\\')[1])

print("\n=== HUB (hub/pb_data/data.db) ===")
try:
    conn = sqlite3.connect('hub/pb_data/data.db')
    c = conn.cursor()
    c.execute("SELECT id, name, nit, port, active FROM companies")
    for row in c.fetchall():
        print("  company in HUB:", row)
    conn.close()
except Exception as e:
    print('  Error hub:', e)
