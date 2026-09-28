import sqlite3
import os
import glob

dbs = glob.glob('**/*.db', recursive=True)
print('Found DBs:', dbs)

for db_path in dbs:
    if 'pb_data' in db_path:
        print(f"\n--- Checking {db_path} ---")
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in c.fetchall()]
        print('Tables:', [t for t in tables if 'payroll' in t or 'third' in t or 'contract' in t or 'settle' in t])
        for target in ['third_parties', 'payroll_periods', 'payroll_lines', 'payroll_settlements']:
            if target in tables:
                c.execute(f"PRAGMA table_info({target})")
                cols = [r[1] for r in c.fetchall()]
                print(f"  {target} columns: {cols}")
