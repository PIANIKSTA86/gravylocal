import sqlite3, json

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
c.execute("SELECT stage_expenses, freight_cost, insurance_cost, gastos_nacionalizacion, transporte_nacional, otros_gastos, total_gastos_cif, total_gastos_locales FROM imports WHERE id = 'zva62hh26xjxn50'")
row = c.fetchone()
print("Campos base:")
print("  freight_cost:", row[1])
print("  insurance_cost:", row[2])
print("  gastos_nacionalizacion:", row[3])
print("  transporte_nacional:", row[4])
print("  otros_gastos:", row[5])
print("  total_gastos_cif:", row[6])
print("  total_gastos_locales:", row[7])

se = json.loads(row[0] or '{}')
print("\nContenido de stage_expenses:")
for k, v in se.items():
    print(f"  {k}: {v}")

print("\nLíneas de tx_lines vinculadas a esta importación:")
c.execute("""
    SELECT tl.id, tl.import_concept, tl.debit, tl.credit, a.code, a.name, tp.name, t.number, t.description
    FROM tx_lines tl
    LEFT JOIN accounts a ON a.id = tl.account_id
    LEFT JOIN third_parties tp ON tp.id = tl.third_party_id
    LEFT JOIN transactions t ON t.id = tl.tx_id
    WHERE tl.import_id = 'zva62hh26xjxn50'
    ORDER BY tl.import_concept, tl.debit DESC
""")
for r in c.fetchall():
    print(f"  Concept: {r[1]:15} | Net: ${r[2]-r[3]:>12,.2f} | Acct: {r[4]} | Third: {r[6]} | TX: {r[7]} - {r[8]}")
