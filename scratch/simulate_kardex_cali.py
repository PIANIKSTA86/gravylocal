import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()

wh_cali = '75npb0kfhhfdtmf'
prod_id = 'qv46yr2j9xkv7cp'

cur.execute("""
    SELECT m.date, m.number, m.mov_type, m.warehouse_id, m.dest_warehouse_id, l.qty, l.unit_cost, l.line_order, m.id
    FROM inventory_movement_lines l
    JOIN inventory_movements m ON m.id = l.movement_id
    WHERE l.product_id = ? AND m.status = 'applied'
    ORDER BY m.date ASC, l.line_order ASC
""", (prod_id,))

rows = cur.fetchall()

running_qty = 0
running_avg_cost = 0

print(f"{'FECHA':<12} | {'DOC':<16} | {'TIPO':<10} | {'IN/OUT':<6} | {'CANT':>8} | {'UNIT COST':>12} | {'RUNNING QTY':>12} | {'RUNNING AVG COST':>16} | {'TOTAL BAL':>16}")
print("-" * 115)

for r in rows:
    m_date, m_num, m_type, m_wh, m_dest_wh, qty, cost, line_order, mov_id = r
    
    is_input = False
    is_output = False
    
    if m_type == 'TRASLADO':
        if m_dest_wh == wh_cali:
            is_input = True
        elif m_wh == wh_cali:
            is_output = True
        else:
            continue
    else:
        if m_wh != wh_cali:
            continue
        is_input = m_type in ('ENTRADA', 'AJUSTE_POSITIVO')
        is_output = m_type in ('SALIDA', 'AJUSTE_NEGATIVO')
        
    if is_input:
        prev_qty = running_qty
        prev_cost = running_avg_cost
        running_qty += qty
        if running_qty > 0:
            running_avg_cost = ((prev_qty * prev_cost) + (qty * cost)) / running_qty
        else:
            running_avg_cost = cost
        running_avg_cost = round(running_avg_cost, 2)
        print(f"{m_date:<12} | {m_num:<16} | {m_type:<10} | {'IN':<6} | {qty:>8.2f} | {cost:>12.2f} | {running_qty:>12.2f} | {running_avg_cost:>16.2f} | {running_qty * running_avg_cost:>16.2f}")
    elif is_output:
        running_qty -= qty
        print(f"{m_date:<12} | {m_num:<16} | {m_type:<10} | {'OUT':<6} | {qty:>8.2f} | {running_avg_cost:>12.2f} | {running_qty:>12.2f} | {running_avg_cost:>16.2f} | {running_qty * running_avg_cost:>16.2f}")
