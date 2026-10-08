import sqlite3
con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()

# Update Deepal S05 with 3 months of 2025: $6.649.500 and period 2025-12
cur.execute('''
    UPDATE niif_assets 
    SET initial_depreciation_niif = 6649500,
        initial_depreciation_fiscal = 6649500,
        last_depreciation_period = '2025-12'
    WHERE code = '15400501'
''')
con.commit()

row = cur.execute('''
    SELECT code, name, cost, initial_depreciation_niif, last_depreciation_period
    FROM niif_assets
    WHERE code = '15400501'
''').fetchone()
print("Updated asset:", row)
