import sqlite3

for dbpath in ['empresas/empresa_8094/pb_data/data.db', 'pb_data/data.db']:
    conn = sqlite3.connect(dbpath)
    c = conn.cursor()
    c.execute("SELECT id, name FROM _collections WHERE name='ph_billing_concepts' OR id='pbc_446239205'")
    print(dbpath, c.fetchall())
