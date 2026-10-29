import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

emp_id = 'vsu8bz83547sxrn' # Angelica

lines = c.execute("""
    SELECT pp.name, pp.date_from, pp.date_to, pl.salary_base, pl.transport_allowance,
           pl.cesantias, pl.intereses_ces
    FROM payroll_lines pl
    JOIN payroll_periods pp ON pp.id = pl.period_id
    WHERE pl.employee_id = ?
    ORDER BY pp.date_from ASC
""", (emp_id,)).fetchall()

print(f"Quincenas de Angelica (Total: {len(lines)}):")
for l in lines:
    print(f"{l[0]}: Cesantias={l[5]} | IntCes={l[6]}")
