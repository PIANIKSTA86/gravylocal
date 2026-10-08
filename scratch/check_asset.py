import sqlite3
con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()
rows = cur.execute('SELECT id, code, name, cost, initial_depreciation_niif, initial_depreciation_fiscal, accumulated_depreciation_niif, accumulated_depreciation_fiscal, last_depreciation_period, category_id, purchase_date, start_service_date FROM niif_assets').fetchall()
for r in rows:
    print(r)

print("\n--- CATEGORIES ---")
cats = cur.execute('SELECT id, code, name, account_asset_id, account_depr_accum_id, account_depr_expense_id FROM niif_asset_categories').fetchall()
for c in cats:
    print(c)

print("\n--- ACCOUNTS 1592 ---")
accs = cur.execute('SELECT id, code, name, nature FROM accounts WHERE code LIKE "1592%" OR code LIKE "1540%"').fetchall()
for a in accs:
    print(a)
