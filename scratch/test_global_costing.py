import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()

prod_id = 'qv46yr2j9xkv7cp'

cur.execute("""
    SELECT m.date, m.number, m.mov_type, m.warehouse_id, m.dest_warehouse_id, l.qty, l.unit_cost
    FROM inventory_movements m
    JOIN inventory_movement_lines l ON l.movement_id = m.id
    WHERE m.status = 'applied' AND l.product_id = ?
    ORDER BY m.date ASC, 
      CASE 
        WHEN m.mov_type IN ('ENTRADA', 'AJUSTE_POSITIVO') THEN 1
        WHEN m.mov_type = 'TRASLADO' THEN 2
        WHEN m.mov_type IN ('SALIDA', 'AJUSTE_NEGATIVO') THEN 3
        ELSE 4
      END ASC, m.number ASC, l.line_order ASC
""", (prod_id,))

rows = cur.fetchall()

global_qty = 0.0
global_cost = 0.0

wh_stocks = {}

print("=== SIMULACIÓN COSTO PROMEDIO GLOBAL (EMPRESA) ===")
for r in rows:
    m_date, m_num, m_type, wh_src, wh_dst, qty, cost = r
    qty = float(qty)
    cost = float(cost or 0)
    
    if m_type in ('ENTRADA', 'AJUSTE_POSITIVO'):
        prev_g_qty = global_qty
        prev_g_cost = global_cost
        global_qty += qty
        if qty > 0 and cost > 0:
            if global_qty > 0:
                global_cost = ((prev_g_qty * prev_g_cost) + (qty * cost)) / global_qty
            else:
                global_cost = cost
            global_cost = round(global_cost, 2)
        wh_stocks[wh_src] = wh_stocks.get(wh_src, 0.0) + qty
        print(f"[{m_date}] {m_num:<16} {m_type:<10} +{qty:>8.2f} @ {cost:>10.2f} | Global Qty: {global_qty:>8.2f} | Global Avg Cost: {global_cost:>10.2f}")
    elif m_type in ('SALIDA', 'AJUSTE_NEGATIVO'):
        global_qty -= qty
        wh_stocks[wh_src] = wh_stocks.get(wh_src, 0.0) - qty
        print(f"[{m_date}] {m_num:<16} {m_type:<10} -{qty:>8.2f} @ {global_cost:>10.2f} | Global Qty: {global_qty:>8.2f} | Global Avg Cost: {global_cost:>10.2f}")
    elif m_type == 'TRASLADO':
        wh_stocks[wh_src] = wh_stocks.get(wh_src, 0.0) - qty
        wh_stocks[wh_dst] = wh_stocks.get(wh_dst, 0.0) + qty
        print(f"[{m_date}] {m_num:<16} {m_type:<10}  {qty:>8.2f} TRASLADO    | Global Qty: {global_qty:>8.2f} | Global Avg Cost: {global_cost:>10.2f} (INALTERADO)")

print("\nRESULTADOS GLOBALES FINALES:")
print(f"Stock Total Empresa: {global_qty:.2f}")
print(f"Costo Promedio Global Empresa: ${global_cost:,.2f}")
print("Por Bodega:")
for wh, q in wh_stocks.items():
    print(f"  Bodega {wh}: {q:.2f} unidades @ ${global_cost:,.2f} = ${q * global_cost:,.2f}")
