import sqlite3

print("--- Tenant (pb_data/data.db) ---")
try:
    conn = sqlite3.connect('pb_data/data.db')
    c = conn.cursor()
    c.execute("SELECT key, value FROM settings WHERE key IN ('company_name', 'company_nit')")
    for row in c.fetchall():
        print(row)
    conn.close()
except Exception as e:
    print('Error tenant:', e)

print("\n--- HUB (hub/pb_data/data.db) ---")
try:
    conn = sqlite3.connect('hub/pb_data/data.db')
    c = conn.cursor()
    c.execute("SELECT id, name, nit, port, active FROM companies")
    for row in c.fetchall():
        print(row)
    conn.close()
except Exception as e:
    print('Error hub:', e)
