import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()

print("--- PRODUCT ---")
cur.execute("SELECT id, code, name, cost_price, unit FROM products WHERE code LIKE '%PB3000%'")
prods = cur.fetchall()
for p in prods:
    print(p)
    prod_id = p[0]

    print("\n--- INVENTORY_STOCK ---")
    cur.execute("SELECT s.id, s.warehouse_id, w.name, s.qty_on_hand, s.avg_cost, s.last_mov_date FROM inventory_stock s LEFT JOIN warehouses w ON w.id = s.warehouse_id WHERE s.product_id = ?", (prod_id,))
    stocks = cur.fetchall()
    for s in stocks:
        print(s)

    print("\n--- INVENTORY_MOVEMENTS & LINES ---")
    cur.execute("""
        SELECT m.id, m.date, m.number, m.mov_type, m.status, m.warehouse_id, w1.name as wh_name, m.dest_warehouse_id, w2.name as dest_wh_name, l.qty, l.unit_cost, l.original_unit_cost, m.notes
        FROM inventory_movement_lines l
        JOIN inventory_movements m ON m.id = l.movement_id
        LEFT JOIN warehouses w1 ON w1.id = m.warehouse_id
        LEFT JOIN warehouses w2 ON w2.id = m.dest_warehouse_id
        WHERE l.product_id = ?
        ORDER BY m.date ASC, l.line_order ASC
    """, (prod_id,))
    movs = cur.fetchall()
    for m in movs:
        print(m)
