import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()

prod_id = 'qv46yr2j9xkv7cp'

cur.execute("""
    SELECT m.id, m.date, m.number, m.mov_type, m.warehouse_id, m.dest_warehouse_id, l.product_id, l.qty, l.unit_cost, l.line_order,
           CASE 
               WHEN m.mov_type IN ('ENTRADA', 'AJUSTE_POSITIVO') THEN 1
               WHEN m.mov_type = 'TRASLADO' THEN 2
               WHEN m.mov_type IN ('SALIDA', 'AJUSTE_NEGATIVO') THEN 3
               ELSE 4
           END as type_order
    FROM inventory_movements m
    JOIN inventory_movement_lines l ON l.movement_id = m.id
    WHERE m.status = 'applied' AND l.product_id = ?
    ORDER BY m.date ASC, type_order ASC, m.number ASC, l.line_order ASC
""", (prod_id,))

mov_lines = cur.fetchall()

stock_map = {}

def adjust(wh_id, qty_delta, unit_cost, date_str, mov_num, mov_type):
    if wh_id not in stock_map:
        stock_map[wh_id] = {'qty': 0.0, 'avg_cost': 0.0}
    st = stock_map[wh_id]
    current_qty = st['qty']
    current_cost = st['avg_cost']
    
    new_qty = current_qty + qty_delta
    new_cost = current_cost
    
    if qty_delta > 0 and unit_cost is not None and unit_cost > 0:
        if new_qty > 0:
            new_cost = ((current_qty * current_cost) + (qty_delta * unit_cost)) / new_qty
        else:
            new_cost = unit_cost
        new_cost = round(new_cost, 2)
        
    st['qty'] = new_qty
    st['avg_cost'] = new_cost
    return new_cost

for r in mov_lines:
    m_id, m_date, m_num, m_type, wh_id, dest_wh_id, p_id, qty, cost, line_order, t_ord = r
    if m_type in ('ENTRADA', 'AJUSTE_POSITIVO'):
        adjust(wh_id, qty, cost, m_date, m_num, m_type)
    elif m_type in ('SALIDA', 'AJUSTE_NEGATIVO'):
        adjust(wh_id, -qty, None, m_date, m_num, m_type)
    elif m_type == 'TRASLADO':
        src_cost = stock_map.get(wh_id, {}).get('avg_cost', 0)
        # Priority: explicit unit_cost on the line, else source avg cost
        effective_transfer_cost = cost if (cost is not None and cost > 0) else (src_cost if src_cost > 0 else 0)
        adjust(wh_id, -qty, None, m_date, m_num, m_type + "_OUT")
        if dest_wh_id:
            adjust(dest_wh_id, qty, effective_transfer_cost, m_date, m_num, m_type + "_IN")

print("\nFINAL STOCK_MAP WITH (cost > 0 ? cost : src_cost):")
for wh, st in stock_map.items():
    print(wh, st)
