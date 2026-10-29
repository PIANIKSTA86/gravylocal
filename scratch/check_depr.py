import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

print('=== NIIF ASSET EVENTS ===')
for row in c.execute("SELECT id, event_type, date, description, amount, transaction_id FROM niif_asset_events"):
    print(row)

print('\n=== TRANSACTIONS (depreciaci) ===')
for row in c.execute("SELECT id, number, date, description, status, book_type FROM transactions WHERE description LIKE '%depreciaci%'"):
    print(row)

print('\n=== TRANSACTIONS 2026-01 ===')
for row in c.execute("SELECT id, number, date, description, status, book_type FROM transactions WHERE date LIKE '2026-01%'"):
    print(row)

print('\n=== NIIF ASSETS last_depreciation_period ===')
for row in c.execute("SELECT code, name, accumulated_depreciation_niif, accumulated_depreciation_fiscal, last_depreciation_period FROM niif_assets WHERE last_depreciation_period IS NOT NULL AND last_depreciation_period != ''"):
    print(row)
