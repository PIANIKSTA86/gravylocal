import sqlite3
import os
import random
import string
import json

def recalculate_stock_db():
    db_path = 'pb_data/data.db'
    if not os.path.exists(db_path):
        print(f"Error: No se encontró la base de datos en {db_path}")
        return

    print("=== INICIANDO RECALCULACIÓN DE STOCK EN SQLITE ===")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        # 0. Leer enfoque de costeo
        cursor.execute("SELECT value FROM settings WHERE key='inventory_settings_v1'")
        s_row = cursor.fetchone()
        costing_scope = 'GLOBAL'
        if s_row:
            try:
                cfg = json.loads(s_row['value'])
                costing_scope = cfg.get('costing_scope', 'GLOBAL')
            except:
                pass
        print(f"Enfoque de costeo activo: {costing_scope}")

        # 1. Obtener todos los registros de stock y resetear existencias y costo
        cursor.execute("SELECT id, product_id, warehouse_id FROM inventory_stock")
        stocks = cursor.fetchall()
        print(f"Encontrados {len(stocks)} registros de stock rápido. Reseteando a 0...")

        stock_map = {}
        for st in stocks:
            pid = st['product_id']
            wid = st['warehouse_id']
            db_id = st['id']
            stock_map[(pid, wid)] = {'qty': 0.0, 'cost': 0.0, 'id': db_id, 'last_date': ''}

        global_stock = {} # pid -> {'qty': 0.0, 'cost': 0.0}

        # 2. Cargar todos los movimientos aplicados ordenados cronológicamente
        cursor.execute("""
            SELECT id, mov_type, warehouse_id, dest_warehouse_id, date, number,
                   CASE 
                       WHEN mov_type IN ('ENTRADA', 'AJUSTE_POSITIVO') THEN 1
                       WHEN mov_type = 'TRASLADO' THEN 2
                       WHEN mov_type IN ('SALIDA', 'AJUSTE_NEGATIVO') THEN 3
                       ELSE 4
                   END as type_order
            FROM inventory_movements 
            WHERE status = 'applied'
            ORDER BY date ASC, type_order ASC, number ASC, id ASC
        """)
        movements = cursor.fetchall()
        print(f"Procesando {len(movements)} movimientos aplicados...")

        # Helper para ajustar valores de stock en memoria
        def adjust_stock_values(prod_id, wh_id, qty_delta, unit_cost, date_str):
            if not prod_id or not wh_id:
                return 0.0
            
            key = (prod_id, wh_id)
            if key not in stock_map:
                stock_map[key] = {'qty': 0.0, 'cost': 0.0, 'id': None, 'last_date': date_str}
            
            st = stock_map[key]
            current_qty = st['qty']
            current_cost = st['cost']

            new_qty = current_qty + qty_delta
            new_cost = current_cost

            if costing_scope == 'GLOBAL':
                g = global_stock.setdefault(prod_id, {'qty': 0.0, 'cost': 0.0})
                prior_g_qty = g['qty']
                prior_g_cost = g['cost']

                if qty_delta > 0 and unit_cost is not None and unit_cost > 0:
                    new_g_qty = prior_g_qty + qty_delta
                    if new_g_qty > 0:
                        new_cost = ((max(0.0, prior_g_qty) * prior_g_cost) + (qty_delta * unit_cost)) / new_g_qty
                    else:
                        new_cost = unit_cost
                    new_cost = round(new_cost, 2)
                    g['qty'] = new_g_qty
                    g['cost'] = new_cost
                elif qty_delta < 0:
                    g['qty'] += qty_delta
                    new_cost = g['cost']
            else:
                if qty_delta > 0 and unit_cost is not None and unit_cost > 0:
                    if new_qty > 0:
                        new_cost = ((current_qty * current_cost) + (qty_delta * unit_cost)) / new_qty
                    else:
                        new_cost = unit_cost
                    new_cost = round(new_cost, 2)

            st['qty'] = new_qty
            st['cost'] = new_cost
            st['last_date'] = date_str
            return new_cost

        # 3. Iterar movimientos y líneas
        for mov in movements:
            mov_id = mov['id']
            mov_type = mov['mov_type']
            wh_id = mov['warehouse_id']
            dest_wh_id = mov['dest_warehouse_id']
            mov_date = mov['date'] or '2026-07-08'

            cursor.execute("""
                SELECT product_id, qty, unit_cost 
                FROM inventory_movement_lines 
                WHERE movement_id = ?
                ORDER BY line_order ASC, id ASC
            """, (mov_id,))
            lines = cursor.fetchall()

            for line in lines:
                pid = line['product_id']
                qty = float(line['qty'] or 0.0)
                cost = float(line['unit_cost'] or 0.0)

                if mov_type in ('ENTRADA', 'AJUSTE_POSITIVO'):
                    adjust_stock_values(pid, wh_id, qty, cost, mov_date)
                elif mov_type in ('SALIDA', 'AJUSTE_NEGATIVO'):
                    if costing_scope == 'GLOBAL':
                        g = global_stock.get(pid, {'qty': 0.0, 'cost': 0.0})
                        exit_cost = g['cost'] if g['cost'] > 0 else cost
                    else:
                        key_origin = (pid, wh_id)
                        exit_cost = stock_map.get(key_origin, {}).get('cost', 0.0)
                    if exit_cost > 0 and abs(cost - exit_cost) > 0.009:
                        cursor.execute("UPDATE inventory_movement_lines SET unit_cost = ? WHERE id = ?", (exit_cost, line['id']))
                    adjust_stock_values(pid, wh_id, -qty, None, mov_date)
                elif mov_type == 'TRASLADO':
                    if costing_scope == 'GLOBAL':
                        g = global_stock.get(pid, {'qty': 0.0, 'cost': 0.0})
                        transfer_cost = g['cost'] if g['cost'] > 0 else cost
                        if transfer_cost > 0 and abs(cost - transfer_cost) > 0.009:
                            cursor.execute("UPDATE inventory_movement_lines SET unit_cost = ? WHERE id = ?", (transfer_cost, line['id']))
                        adjust_stock_values(pid, wh_id, -qty, None, mov_date)
                        if dest_wh_id:
                            adjust_stock_values(pid, dest_wh_id, qty, None, mov_date)
                    else:
                        key_origin = (pid, wh_id)
                        source_avg_cost = stock_map.get(key_origin, {}).get('cost', 0.0)
                        transfer_cost = source_avg_cost if source_avg_cost > 0 else cost
                        if transfer_cost > 0 and abs(cost - transfer_cost) > 0.009:
                            cursor.execute("UPDATE inventory_movement_lines SET unit_cost = ? WHERE id = ?", (transfer_cost, line['id']))
                        adjust_stock_values(pid, wh_id, -qty, None, mov_date)
                        if dest_wh_id:
                            adjust_stock_values(pid, dest_wh_id, qty, transfer_cost, mov_date)

        # 4. Actualizar base de datos
        conn.execute("BEGIN TRANSACTION")
        
        updates_count = 0
        inserts_count = 0
        
        for (pid, wid), st in stock_map.items():
            db_id = st['id']
            qty = st['qty']
            if costing_scope == 'GLOBAL':
                cost = global_stock.get(pid, {}).get('cost', st['cost'])
            else:
                cost = st['cost']
            ldate = st['last_date'] or '2026-07-08'
            
            if db_id:
                cursor.execute("""
                    UPDATE inventory_stock 
                    SET qty_on_hand = ?, avg_cost = ?, last_mov_date = ?
                    WHERE id = ?
                """, (qty, cost, ldate, db_id))
                updates_count += 1
            else:
                new_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=15))
                cursor.execute("""
                    INSERT INTO inventory_stock (id, product_id, warehouse_id, qty_on_hand, avg_cost, last_mov_date)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (new_id, pid, wid, qty, cost, ldate))
                inserts_count += 1

        # 5. Sincronizar costo en productos
        if costing_scope == 'GLOBAL':
            for pid, g in global_stock.items():
                if g['cost'] > 0:
                    cursor.execute("UPDATE products SET cost_price = ? WHERE id = ?", (g['cost'], pid))
        else:
            for (pid, wid), st in stock_map.items():
                if st['cost'] > 0:
                    cursor.execute("UPDATE products SET cost_price = ? WHERE id = ?", (st['cost'], pid))

        conn.commit()
        print(f"Recalculación completada con éxito:")
        print(f"- Actualizados: {updates_count} registros de stock.")
        print(f"- Creados nuevos: {inserts_count} registros de stock.")

    except Exception as e:
        conn.rollback()
        print(f"Error durante la recalculación: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    recalculate_stock_db()
