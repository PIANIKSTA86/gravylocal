import sqlite3
import json

db_path = 'pb_data/data.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Get settings related to payroll config
c.execute("SELECT key, value FROM settings WHERE key LIKE 'payroll%'")
for k, v in c.fetchall():
    print(f"Setting key: {k}")
    try:
        val = json.loads(v)
        if isinstance(val, list):
            print(f"  List with {len(val)} items. First item: {val[0] if val else 'empty'}")
        elif isinstance(val, dict):
            print(f"  Dict keys: {list(val.keys())}")
            if 'employee_rules' in val:
                print(f"  employee_rules: {val['employee_rules'][:2]}")
    except:
        print(f"  Raw value (first 100 chars): {str(v)[:100]}")

# Check periods
c.execute("SELECT id, name, date_from, date_to, status FROM payroll_periods ORDER BY date_from DESC LIMIT 5")
print("\nRecent payroll periods:")
for row in c.fetchall():
    print(" ", row)

# Check employees
c.execute("SELECT id, name, active FROM third_parties WHERE type='EMPLEADO' LIMIT 5")
print("\nEmployees:")
for row in c.fetchall():
    print(" ", row)
