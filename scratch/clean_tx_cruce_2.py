import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

# Check settlement for 572osx968vgrgxy
c.execute("SELECT ps.id, tp.doc_number, ps.settlement_date FROM payroll_settlements ps JOIN third_parties tp ON ps.employee_id = tp.id WHERE ps.tx_id = '572osx968vgrgxy'")
settle = c.fetchone()
if settle:
    emp_doc = settle[1] or ''
    s_date = (settle[2] or '').replace('-', '')
    ref = f"LIQ-{s_date}-EMP-{emp_doc}"
    print("Setting ref for 2505 in 572osx968vgrgxy:", ref)
    c.execute("""
        UPDATE tx_lines 
        SET cross_doc_ref = ? 
        WHERE tx_id = '572osx968vgrgxy' 
          AND account_id IN (SELECT id FROM accounts WHERE code LIKE '2505%' AND maneja_cruce = 1)
    """, (ref,))
    conn.commit()

c.execute("""
    SELECT tl.id, a.code, a.name, tl.debit, tl.credit, tl.cross_doc_ref 
    FROM tx_lines tl 
    JOIN accounts a ON tl.account_id = a.id 
    WHERE tl.tx_id = '572osx968vgrgxy'
""")
for r in c.fetchall():
    print(r)
