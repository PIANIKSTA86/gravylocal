import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

emp_id = 'vsu8bz83547sxrn'
novs = c.execute("SELECT id, type, date_from, date_to, amount, description FROM payroll_novelties WHERE employee_id = ?", (emp_id,)).fetchall()
print(f"Total novelties for Angelica: {len(novs)}")
for n in novs:
    print(n)
