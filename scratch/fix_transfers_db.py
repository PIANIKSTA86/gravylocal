import sqlite3
import json

conn = sqlite3.connect('pb_data/data.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# 0. Check costing_scope
cursor.execute("SELECT value FROM settings WHERE key='inventory_settings_v1'")
row = cursor.fetchone()
costing_scope = 'GLOBAL'
if row:
    try:
        cfg = json.loads(row['value'])
        costing_scope = cfg.get('costing_scope', 'GLOBAL')
    except:
        pass
print(f"Costing scope: {costing_scope}")

# 1. Run full chronological simulation to know exact cost at each movement
cursor.execute("""
    SELECT m.id as mov_id, m.number, m.date, m.mov_type, m.warehouse_id, m.dest_warehouse_id, 
           l.id as line_id, l.product_id, l.qty, l.unit_cost,
           CASE 
               WHEN m.mov_type IN ('ENTRADA', 'AJUSTE_POSITIVO') THEN 1
               WHEN m.mov_type = 'TRASLADO' THEN 2
               WHEN m.mov_type IN ('SALIDA', 'AJUSTE_NEGATIVO') THEN 3
               ELSE 4
           END as type_order
    FROM inventory_movement_lines l
    JOIN inventory_movements m ON m.id = l.movement_id
    WHERE m.status = 'applied'
    ORDER BY m.date ASC, type_order ASC, m.number ASC, m.id ASC, l.line_order ASC
""")

all_lines = cursor.fetchall()

global_stock = {} # prod_id -> {'qty': 0.0, 'cost': 0.0}
wh_stock = {}     # (prod_id, wh_id) -> {'qty': 0.0, 'cost': 0.0}

lines_to_update = []

for line in all_lines:
    pid = line['product_id']
    mtype = line['mov_type']
    qty = float(line['qty'] or 0.0)
    cost = float(line['unit_cost'] or 0.0)
    wid = line['warehouse_id']
    dest_wid = line['dest_warehouse_id']
    lid = line['line_id']
    num = line['number']

    if costing_scope == 'GLOBAL':
        g = global_stock.setdefault(pid, {'qty': 0.0, 'cost': 0.0})
        prior_g_qty = g['qty']
        prior_g_cost = g['cost']

        if mtype in ('ENTRADA', 'AJUSTE_POSITIVO'):
            new_g_qty = prior_g_qty + qty
            if qty > 0 and cost > 0:
                if new_g_qty > 0:
                    new_cost = round(((max(0.0, prior_g_qty) * prior_g_cost) + (qty * cost)) / new_g_qty, 2)
                else:
                    new_cost = cost
                g['cost'] = new_cost
            g['qty'] = new_g_qty

        elif mtype in ('SALIDA', 'AJUSTE_NEGATIVO'):
            g['qty'] -= qty
            exit_cost = g['cost']
            if exit_cost > 0 and abs(cost - exit_cost) > 0.009:
                lines_to_update.append((exit_cost, lid, f"{num} SALIDA"))

        elif mtype == 'TRASLADO':
            transfer_cost = g['cost'] if g['cost'] > 0 else cost
            if transfer_cost > 0 and abs(cost - transfer_cost) > 0.009:
                lines_to_update.append((transfer_cost, lid, f"{num} TRASLADO"))

    else:
        # POR_BODEGA
        st_src = wh_stock.setdefault((pid, wid), {'qty': 0.0, 'cost': 0.0})
        st_dst = wh_stock.setdefault((pid, dest_wid), {'qty': 0.0, 'cost': 0.0}) if dest_wid else None

        if mtype in ('ENTRADA', 'AJUSTE_POSITIVO'):
            new_qty = st_src['qty'] + qty
            if qty > 0 and cost > 0:
                new_cost = round(((max(0.0, st_src['qty']) * st_src['cost']) + (qty * cost)) / new_qty, 2) if new_qty > 0 else cost
                st_src['cost'] = new_cost
            st_src['qty'] = new_qty

        elif mtype in ('SALIDA', 'AJUSTE_NEGATIVO'):
            st_src['qty'] -= qty
            exit_cost = st_src['cost']
            if exit_cost > 0 and abs(cost - exit_cost) > 0.009:
                lines_to_update.append((exit_cost, lid, f"{num} SALIDA"))

        elif mtype == 'TRASLADO':
            transfer_cost = st_src['cost'] if st_src['cost'] > 0 else cost
            if transfer_cost > 0 and abs(cost - transfer_cost) > 0.009:
                lines_to_update.append((transfer_cost, lid, f"{num} TRASLADO"))
            st_src['qty'] -= qty
            if st_dst:
                new_dst_qty = st_dst['qty'] + qty
                st_dst['cost'] = round(((max(0.0, st_dst['qty']) * st_dst['cost']) + (qty * transfer_cost)) / new_dst_qty, 2) if new_dst_qty > 0 else transfer_cost
                st_dst['qty'] = new_dst_qty

print(f"Total lines needing cost update: {len(lines_to_update)}")
for cost, lid, desc in lines_to_update:
    print(f"Updating {desc} (line {lid}) -> {cost}")

# Apply updates
for cost, lid, _ in lines_to_update:
    cursor.execute("UPDATE inventory_movement_lines SET unit_cost = ? WHERE id = ?", (cost, lid))

conn.commit()
print("Updates committed successfully.")
