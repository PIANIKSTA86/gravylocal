import sqlite3
conn = sqlite3.connect('empresas/empresa_8094/pb_data/data.db')
c = conn.cursor()
c.execute("SELECT id, code, name, amount, is_variable, applies_coef, active, created, updated FROM ph_billing_concepts")
for r in c.fetchall():
    print(r)
