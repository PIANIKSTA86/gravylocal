import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

c.execute("SELECT id, number, status, fob_total, total, proration_method, tx_fob_id FROM imports ORDER BY rowid DESC LIMIT 5")
imports = c.fetchall()
print("\nImports:")
for imp in imports:
    print(imp)
    c.execute("SELECT id, import_id, product_id, qty, fob_price, prorated_cost, unit_cost_cop, total_cop FROM import_lines WHERE import_id = ?", (imp[0],))
    lines = c.fetchall()
    print("  Lines count:", len(lines))
    for l in lines:
        print("   Line:", l)
