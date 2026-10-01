import sqlite3

conn = sqlite3.connect('pb_data/data.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Get product PB3000
cursor.execute("SELECT id, code, name, cost_price FROM products WHERE code = 'PB3000'")
prod = cursor.fetchone()
print("Product:", dict(prod))

# Get all applied movements of PB3000
cursor.execute("""
    SELECT m.id as mov_id, m.number, m.date, m.mov_type, m.warehouse_id, m.dest_warehouse_id, 
           l.id as line_id, l.qty, l.unit_cost, l.original_unit_cost,
           CASE 
               WHEN m.mov_type IN ('ENTRADA', 'AJUSTE_POSITIVO') THEN 1
               WHEN m.mov_type = 'TRASLADO' THEN 2
               WHEN m.mov_type IN ('SALIDA', 'AJUSTE_NEGATIVO') THEN 3
               ELSE 4
           END as type_order
    FROM inventory_movement_lines l
    JOIN inventory_movements m ON m.id = l.movement_id
    WHERE l.product_id = ? AND m.status = 'applied'
    ORDER BY m.date ASC, type_order ASC, m.number ASC, m.id ASC, l.line_order ASC
""", (prod['id'],))

movements = cursor.fetchall()
print(f"Total movements for PB3000: {len(movements)}")

# Global simulation
global_qty = 0.0
global_cost = 0.0

cali_id = '75npb0kfhhfdtmf'
btura_id = 'fclyvwpcomhq4gu'

stock = {cali_id: {'qty': 0.0, 'cost': 0.0}, btura_id: {'qty': 0.0, 'cost': 0.0}}

for m in movements:
    mtype = m['mov_type']
    qty = float(m['qty'])
    cost = float(m['unit_cost'])
    num = m['number']
    dt = m['date']
    wid = m['warehouse_id']
    dest = m['dest_warehouse_id']

    if mtype in ('ENTRADA', 'AJUSTE_POSITIVO'):
        prev_g_qty = global_qty
        prev_g_cost = global_cost
        global_qty += qty
        if global_qty > 0 and cost > 0:
            global_cost = round(((max(0.0, prev_g_qty) * prev_g_cost) + (qty * cost)) / global_qty, 2)
        stock[wid]['qty'] += qty
        print(f"[{dt}] {num} ENTRADA at {wid[:6]}: qty={qty}, cost={cost} -> GlobalCost={global_cost}, GlobalQty={global_qty}")

    elif mtype == 'TRASLADO':
        stock[wid]['qty'] -= qty
        if dest:
            stock[dest]['qty'] += qty
        print(f"[{dt}] {num} TRASLADO from {wid[:6]} to {dest[:6]}: qty={qty}, recorded_cost={cost} -> TrueGlobalCost={global_cost}")

    elif mtype in ('SALIDA', 'AJUSTE_NEGATIVO'):
        global_qty -= qty
        stock[wid]['qty'] -= qty

print("\n--- FINAL GLOBAL RESULTS ---")
print(f"Global Cost: {global_cost}")
print(f"Global Qty: {global_qty}")
print(f"Cali Qty: {stock[cali_id]['qty']}")
print(f"Buenaventura Qty: {stock[btura_id]['qty']}")
