import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()
cur.execute("""
    SELECT m.number, m.date, m.notes, l.product_id, l.qty, l.unit_cost, l.original_unit_cost
    FROM inventory_movements m 
    JOIN inventory_movement_lines l ON l.movement_id = m.id 
    WHERE m.number = 'TRA-202609-0001'
""")
for row in cur.fetchall():
    print(row)
