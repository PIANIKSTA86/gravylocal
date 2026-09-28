import sqlite3
import json

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

c.execute("SELECT id, number, status, fob_total, total, exchange_rate, proration_method, is_consolidated, stage_expenses FROM imports")
imps = c.fetchall()
print(f"Total imports: {len(imps)}")
for imp in imps:
    print(f"\nImport: {imp[1]} (ID: {imp[0]}, Status: {imp[2]}, TRM: {imp[5]}, Proration: {imp[6]}, FOB Total: {imp[3]}, Total: {imp[4]})")
    c.execute("SELECT id, product_id, qty, fob_price, prorated_cost, unit_cost_cop, total_cop, peso_bruto_total, cubic_meters_total FROM import_lines WHERE import_id = ?", (imp[0],))
    lines = c.fetchall()
    for l in lines:
        print(f"   Line {l[0]}: prod={l[1]}, qty={l[2]}, fob_price={l[3]}, prorated={l[4]}, unit_cop={l[5]}, total_cop={l[6]}, peso={l[7]}, cbm={l[8]}")
