import sqlite3
import json

db_path = './empresas/empresa_8094/pb_data/data.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# 1. Obtener ID de la cuenta 13459501
cur.execute("SELECT id, code, name FROM accounts WHERE code = '13459501'")
acc_1345 = cur.fetchone()
print(f"Cuenta destino 13459501: {acc_1345}")

# 2. Obtener ID de la cuenta 1305
cur.execute("SELECT id, code, name FROM accounts WHERE code = '1305'")
acc_1305 = cur.fetchone()
print(f"Cuenta origen 1305: {acc_1305}")

# 3. Buscar las líneas afectadas en tx_lines
cur.execute("""
    SELECT tl.id, t.id, t.number, t.teso_params, tl.cross_doc_ref, tl.description, tl.credit
    FROM tx_lines tl
    JOIN transactions t ON tl.tx_id = t.id
    WHERE tl.account_id = ? AND tl.description LIKE 'Abono anticipado%'
""", (acc_1305[0],))
affected = cur.fetchall()
print(f"\nPartidas encontradas con cuenta 1305 en anticipos: {len(affected)}")
for r in affected:
    print(r)

if acc_1345 and len(affected) > 0:
    for line_id, tx_id, tx_num, teso_params_str, current_ref, desc, credit in affected:
        prop_id = ""
        if teso_params_str:
            try:
                p = json.loads(teso_params_str)
                prop_id = p.get("ph_property_id", "")
            except:
                pass
        
        # Extraer periodo de la descripción ej: 'Abono anticipado cuota 2026-07 - 1201' -> '202607'
        p_code = "202607"
        if "2026-" in desc:
            idx = desc.find("2026-")
            p_code = desc[idx:idx+7].replace("-", "")
            
        new_ref = f"ANTICIPO-{p_code}-{prop_id}" if prop_id else current_ref
        print(f"\nActualizando Linea {line_id} (Tx: {tx_num}):")
        print(f"  Cambiar account_id de {acc_1305[0]} -> {acc_1345[0]}")
        print(f"  Cambiar cross_doc_ref de '{current_ref}' -> '{new_ref}'")
        
        cur.execute("""
            UPDATE tx_lines
            SET account_id = ?, cross_doc_ref = ?
            WHERE id = ?
        """, (acc_1345[0], new_ref, line_id))
    
    conn.commit()
    print("\n[ÉXITO] Actualización completada y guardada en base de datos.")
else:
    print("No se requirieron modificaciones.")

conn.close()
