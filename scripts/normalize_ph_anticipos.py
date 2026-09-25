"""
scripts/normalize_ph_anticipos.py
Normaliza las líneas históricas contables en cuentas 28% que tienen cross_doc_ref vacío o nulo,
asignándoles la referencia canónica ANT-<property_id> o ANT-<third_party_id>.
"""
import sqlite3
import glob
import os

def normalize_database(db_path):
    if not os.path.exists(db_path):
        return
    print(f"\n=======================================================")
    print(f"Normalizando anticipos en: {db_path}")
    print(f"=======================================================")
    
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Verificar si tiene tablas de PH
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ph_properties'")
    if not cur.fetchone():
        print("No contiene tabla ph_properties. Omitiendo.")
        conn.close()
        return

    # 1. Buscar líneas de cuenta 28% con cross_doc_ref vacío o nulo
    cur.execute("""
        SELECT l.id, l.tx_id, t.number, t.date, l.third_party_id, tp.name, a.code, l.credit, l.debit, l.cross_doc_ref
        FROM tx_lines l
        JOIN accounts a ON a.id = l.account_id
        JOIN transactions t ON t.id = l.tx_id
        LEFT JOIN third_parties tp ON tp.id = l.third_party_id
        WHERE a.code LIKE '28%' AND (l.cross_doc_ref = '' OR l.cross_doc_ref IS NULL)
    """)
    empty_lines = cur.fetchall()
    print(f"Líneas encontradas en cuentas 28% sin cross_doc_ref: {len(empty_lines)}")
    
    if not empty_lines:
        conn.close()
        return

    updated_count = 0
    for row in empty_lines:
        line_id, tx_id, tx_num, tx_date, third_id, third_name, acct_code, credit, debit, current_ref = row
        
        # Buscar la unidad que pertenece a este propietario
        target_ref = ""
        if third_id:
            cur.execute("SELECT id, code, name FROM ph_properties WHERE owner_id = ?", (third_id,))
            props = cur.fetchall()
            if len(props) == 1:
                target_ref = f"ANT-{props[0][0]}"
                prop_info = f"Unidad {props[0][1]} ({props[0][2]})"
            elif len(props) > 1:
                # Si tiene varias unidades, asignamos a la primera o referencia de tercero
                target_ref = f"ANT-{props[0][0]}"
                prop_info = f"Unidad múltiple -> {props[0][1]}"
            else:
                target_ref = f"ANT-{third_id}"
                prop_info = "Sin unidad directa -> ANT-tercero"
        else:
            prop_info = "Sin tercero asociado"
            
        if target_ref:
            cur.execute("UPDATE tx_lines SET cross_doc_ref = ? WHERE id = ?", (target_ref, line_id))
            updated_count += 1
            print(f"  [OK] Línea {line_id} (Tx: {tx_num}, {third_name}, Val: {credit or debit}): ref -> {target_ref} [{prop_info}]")
        else:
            print(f"  [SKIP] Línea {line_id} no pudo asociarse.")
            
    conn.commit()
    print(f"Total líneas actualizadas con referencia canónica: {updated_count}")
    conn.close()

if __name__ == '__main__':
    databases = [
        'empresas/empresa_8094/pb_data/data.db',
        'pb_data/data.db'
    ]
    for db in databases:
        if os.path.exists(db):
            normalize_database(db)
