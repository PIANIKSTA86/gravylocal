import sqlite3, json

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

print('=== PRODUCT ===')
cursor.execute("SELECT id, code, name, track_lots, track_pallets, unit FROM products WHERE code LIKE '%1C1251A2%'")
products = cursor.fetchall()
for p in products:
    print(p)
prod_id = products[0][0] if products else None

if prod_id:
    print('\n=== INVENTORY LOTS ===')
    cursor.execute("SELECT id, lot_number, warehouse_id, qty_on_hand, status, initial_qty, import_id FROM inventory_lots WHERE product_id = ?", (prod_id,))
    for l in cursor.fetchall():
        print(l)

    print('\n=== INVENTORY PALLETS ===')
    cursor.execute("SELECT id, pallet_number, warehouse_id, boxes_initial, boxes_current, units_available, status FROM inventory_pallets WHERE product_id = ?", (prod_id,))
    for pl in cursor.fetchall():
        print(pl)

    print('\n=== MOVEMENTS LINES FOR THIS PRODUCT ===')
    cursor.execute("""
        SELECT m.number, m.mov_type, m.date, m.status, l.qty, l.unit_cost, l.lot_id, l.lot_number, l.pallet_id, l.pallet_code, l.boxes_qty 
        FROM inventory_movement_lines l
        JOIN inventory_movements m ON l.movement_id = m.id
        WHERE l.product_id = ?
        ORDER BY m.date, m.number
    """, (prod_id,))
    for ml in cursor.fetchall():
        print(ml)

    print('\n=== INVOICE LINES FOR THIS PRODUCT ===')
    cursor.execute("""
        SELECT i.number, i.date, i.status, il.qty, il.lot_id, il.lot_number, il.pallet_id, il.pallet_code, il.boxes_qty
        FROM invoice_lines il
        JOIN invoices i ON il.invoice_id = i.id
        WHERE il.product_id = ?
        ORDER BY i.date, i.number
    """, (prod_id,))
    for il in cursor.fetchall():
        print(il)
