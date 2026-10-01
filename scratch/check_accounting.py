import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()

# Find invoice FV-00003902 or movement SAL-202609-0063
cur.execute("""
    SELECT m.number, m.date, m.tx_id, t.number as tx_number, t.description
    FROM inventory_movements m
    LEFT JOIN transactions t ON t.id = m.tx_id
    WHERE m.number = 'SAL-202609-0063'
""")
print("Movement & Tx:", cur.fetchall())

cur.execute("""
    SELECT i.number, i.date, i.tx_id, t.number as tx_number
    FROM invoices i
    LEFT JOIN transactions t ON t.id = i.tx_id
    WHERE i.number LIKE '%3902%'
""")
inv = cur.fetchall()
print("Invoice:", inv)

if inv and inv[0][2]:
    tx_id = inv[0][2]
    cur.execute("""
        SELECT l.account_id, a.code, a.name, l.debit, l.credit, l.description
        FROM tx_lines l
        LEFT JOIN accounts a ON a.id = l.account_id
        WHERE l.tx_id = ?
        ORDER BY l.line_order ASC
    """, (tx_id,))
    print("\nAccounting Lines for Invoice:")
    for line in cur.fetchall():
        print(line)
