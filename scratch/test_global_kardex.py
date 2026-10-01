import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

c.execute('SELECT id FROM products WHERE code = ?', ('PB3000',))
prod_id = c.fetchone()[0]

c.execute('SELECT id FROM warehouses WHERE name = ?', ('BODEGA CALI',))
cali_wh_id = c.fetchone()[0]

c.execute('SELECT id FROM warehouses WHERE name = ?', ('BODEGA BUENAVENTURA',))
btura_wh_id = c.fetchone()[0]

c.execute('''
    SELECT m.date, m.number, m.mov_type, m.warehouse_id, m.dest_warehouse_id, l.qty, l.unit_cost, p.cost_price
    FROM inventory_movement_lines l
    JOIN inventory_movements m ON l.movement_id = m.id
    JOIN products p ON l.product_id = p.id
    WHERE l.product_id = ? AND m.status = 'applied'
    ORDER BY m.date ASC, m.number ASC, l.line_order ASC
''', (prod_id,))
all_lines = c.fetchall()

def simulate_global_kardex(wh_id, wh_name, start_date='2026-06-28', end_date='2026-09-30'):
    global_qty = 0.0
    global_cost = 0.0
    wh_qty = 0.0
    
    opening_wh_qty = 0.0
    opening_cost = 0.0
    
    displayed_rows = []
    
    for row in all_lines:
        date, num, mtype, src_id, dst_id, qty, cost, p_cost = row
        if global_cost == 0 and p_cost:
            global_cost = float(p_cost)
        
        # 1. Update global cost
        if mtype in ('ENTRADA', 'AJUSTE_POSITIVO'):
            prev_g_qty = global_qty
            prev_g_cost = global_cost
            global_qty += qty
            if global_qty > 0 and cost > 0:
                global_cost = round(((max(0.0, prev_g_qty) * prev_g_cost) + (qty * cost)) / global_qty, 2)
            elif cost > 0:
                global_cost = cost
        elif mtype in ('SALIDA', 'AJUSTE_NEGATIVO'):
            global_qty -= qty
        elif mtype == 'TRASLADO':
            pass
            
        # 2. Check if touches target wh
        touches_wh = False
        is_in = False
        is_out = False
        
        if mtype == 'TRASLADO':
            if dst_id == wh_id:
                touches_wh = True
                is_in = True
            elif src_id == wh_id:
                touches_wh = True
                is_out = True
        else:
            if src_id == wh_id:
                touches_wh = True
                is_in = mtype in ('ENTRADA', 'AJUSTE_POSITIVO')
                is_out = mtype in ('SALIDA', 'AJUSTE_NEGATIVO')
                
        if touches_wh:
            qty_in = qty if is_in else 0.0
            cost_in = (cost if mtype != 'TRASLADO' else global_cost) if is_in else 0.0
            qty_out = qty if is_out else 0.0
            cost_out = global_cost if is_out else 0.0
            
            if is_in:
                wh_qty += qty
            elif is_out:
                wh_qty -= qty
            
            if start_date and date < start_date:
                opening_wh_qty = wh_qty
                opening_cost = global_cost
            elif (not start_date or date >= start_date) and (not end_date or date <= end_date):
                displayed_rows.append({
                    'date': date,
                    'num': num,
                    'mtype': mtype,
                    'qty_in': qty_in,
                    'cost_in': cost_in,
                    'qty_out': qty_out,
                    'cost_out': cost_out,
                    'bal_qty': wh_qty,
                    'bal_cost': global_cost,
                    'bal_total': round(wh_qty * global_cost, 2)
                })
                
    print(f'=== KARDEX {wh_name} (Initial Qty={opening_wh_qty}, Cost={opening_cost}) ===')
    for r in displayed_rows:
        print(f"{r['date']} | {r['num']:16} | {r['mtype']:8} | In: {r['qty_in']:6.2f} @ {r['cost_in']:8.2f} | Out: {r['qty_out']:6.2f} @ {r['cost_out']:8.2f} | Bal: {r['bal_qty']:6.2f} @ {r['bal_cost']:8.2f}")

simulate_global_kardex(btura_wh_id, 'BUENAVENTURA')
print()
simulate_global_kardex(cali_wh_id, 'CALI')
