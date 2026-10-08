import sqlite3
con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()
rows = cur.execute('''
    SELECT id, code, name, cost, useful_life_niif, useful_life_fiscal, purchase_date, start_service_date, initial_depreciation_niif, accumulated_depreciation_niif
    FROM niif_assets
    WHERE category_id = "brd8qkny60ycrmc"
''').fetchall()
for r in rows:
    print(r)
