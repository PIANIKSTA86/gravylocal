import sqlite3
import json

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

# Periodo
c.execute("SELECT * FROM payroll_periods WHERE id = '0vvtpmccx32ejs2'")
p_row = c.fetchone()
c.execute("PRAGMA table_info(payroll_periods)")
period = dict(zip([r[1] for r in c.fetchall()], p_row))
print("Period:", period)

# Amparo
c.execute("SELECT * FROM third_parties WHERE id = 'gyilekodzdj1sde'")
emp_row = c.fetchone()
c.execute("PRAGMA table_info(third_parties)")
emp = dict(zip([r[1] for r in c.fetchall()], emp_row))
print("Employee:", emp['name'], "Active:", emp['active'])

# Regla
c.execute("SELECT key, value FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules%'")
chunks = c.fetchall()
chunks.sort(key=lambda x: x[0])
merged = "".join([chunk[1] for chunk in chunks])
rules = json.loads(merged)
emp_rule = next((r for r in rules if r.get('employee_id') == 'gyilekodzdj1sde'), None)
print("Rule:", emp_rule)

# Novedades para Amparo en este periodo
c.execute("SELECT * FROM payroll_novelties WHERE period_id = '0vvtpmccx32ejs2' AND employee_id = 'gyilekodzdj1sde'")
print("Novelties:", c.fetchall())

# Linea actual
c.execute("SELECT * FROM payroll_lines WHERE id = '3fmenqh0lyy74l2'")
l_row = c.fetchone()
c.execute("PRAGMA table_info(payroll_lines)")
line = dict(zip([r[1] for r in c.fetchall()], l_row))
print("Current Line in DB:", line)
