import sqlite3

conn = sqlite3.connect('empresas/empresa_8094/pb_data/data.db')
c = conn.cursor()
c.execute("SELECT id, code, name, amount, applies_coef, is_variable, active FROM ph_billing_concepts")
rows = c.fetchall()
print("Conceptos de facturacion PH:")
for r in rows:
    print(f"  {r[1]} - {r[2]} | Monto: ${r[3]:,.2f} | Aplica Coef: {r[4]} | Variable: {r[5]} | Activo: {r[6]}")
conn.close()
