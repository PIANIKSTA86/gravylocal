import sqlite3
import json

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

# 1. Periodo 0vvtpmccx32ejs2
c.execute("SELECT * FROM payroll_periods WHERE id = '0vvtpmccx32ejs2'")
p = c.fetchone()
c.execute("PRAGMA table_info(payroll_periods)")
p_cols = [r[1] for r in c.fetchall()]
print("=== PERIODO ===")
print(dict(zip(p_cols, p)))

# 2. Linea 3fmenqh0lyy74l2
c.execute("SELECT * FROM payroll_lines WHERE id = '3fmenqh0lyy74l2'")
l = c.fetchone()
c.execute("PRAGMA table_info(payroll_lines)")
l_cols = [r[1] for r in c.fetchall()]
print("\n=== PAYROLL_LINE ===")
print(dict(zip(l_cols, l)))

# 3. Empleado gyilekodzdj1sde
c.execute("SELECT * FROM third_parties WHERE id = 'gyilekodzdj1sde'")
emp = c.fetchone()
c.execute("PRAGMA table_info(third_parties)")
emp_cols = [r[1] for r in c.fetchall()]
print("\n=== EMPLEADO ===")
print(dict(zip(emp_cols, emp)))

# 4. Settings de nomina para gyilekodzdj1sde
c.execute("SELECT key, value FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules%'")
chunks = c.fetchall()
chunks.sort(key=lambda x: x[0])
merged = "".join([chunk[1] for chunk in chunks])
rules = json.loads(merged)
amparo_rule = next((r for r in rules if r.get('employee_id') == 'gyilekodzdj1sde'), None)
print("\n=== REGLA DE AMPARO ===")
print(json.dumps(amparo_rule, indent=2))
