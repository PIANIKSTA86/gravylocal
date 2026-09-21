import os
import sqlite3
import json

def migrate_db(db_path):
    print(f"\n--- Migrando {db_path} ---")
    con = sqlite3.connect(db_path)
    cur = con.cursor()
    
    # Verificar si existe la tabla ph_invoices
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ph_invoices'")
    if not cur.fetchone():
        print("ph_invoices no existe en esta DB, omitiendo.")
        con.close()
        return

    # 1. Agregar columnas a SQLite si no existen
    cur.execute("PRAGMA table_info(ph_invoices)")
    existing_cols = [c[1] for c in cur.fetchall()]
    
    cols_to_add = [
        ("email_sent", "INTEGER DEFAULT 0"),
        ("email_sent_to", "TEXT DEFAULT ''"),
        ("email_sent_at", "TEXT DEFAULT ''"),
        ("email_status", "TEXT DEFAULT ''"),
        ("email_last_error", "TEXT DEFAULT ''"),
    ]
    
    for col_name, col_type in cols_to_add:
        if col_name not in existing_cols:
            try:
                cur.execute(f"ALTER TABLE ph_invoices ADD COLUMN {col_name} {col_type}")
                print(f"  Columna añadida a ph_invoices: {col_name}")
            except Exception as e:
                print(f"  Error añadiendo {col_name}: {e}")
        else:
            print(f"  Columna ya existía: {col_name}")
            
    # 2. Actualizar metadata de PocketBase (_collections)
    cur.execute("SELECT id, fields FROM _collections WHERE name='ph_invoices'")
    row = cur.fetchone()
    if row:
        col_id, fields_json = row[0], row[1]
        try:
            fields = json.loads(fields_json or '[]')
            field_names = [f.get('name') for f in fields]
            
            pb_fields_to_add = [
                {
                    "name": "email_sent",
                    "type": "bool",
                    "required": False,
                    "presentable": False,
                    "system": False,
                    "hidden": False
                },
                {
                    "name": "email_sent_to",
                    "type": "text",
                    "required": False,
                    "presentable": False,
                    "system": False,
                    "hidden": False
                },
                {
                    "name": "email_sent_at",
                    "type": "text",
                    "required": False,
                    "presentable": False,
                    "system": False,
                    "hidden": False
                },
                {
                    "name": "email_status",
                    "type": "text",
                    "required": False,
                    "presentable": False,
                    "system": False,
                    "hidden": False
                },
                {
                    "name": "email_last_error",
                    "type": "text",
                    "required": False,
                    "presentable": False,
                    "system": False,
                    "hidden": False
                }
            ]
            
            changed = False
            for pbf in pb_fields_to_add:
                if pbf["name"] not in field_names:
                    fields.append(pbf)
                    changed = True
                    print(f"  Campo PB metadata añadido: {pbf['name']}")
                    
            if changed:
                cur.execute("UPDATE _collections SET fields = ? WHERE id = ?", (json.dumps(fields), col_id))
                print("  _collections metadata actualizada exitosamente.")
        except Exception as e:
            print(f"  Error actualizando _collections: {e}")

    # 3. Marcar las primeras 15 facturas del período 2026-09 como ya enviadas
    # Números CF-202609-000001 a CF-202609-000015
    first_15 = [f"CF-202609-{str(i).zfill(6)}" for i in range(1, 16)]
    placeholders = ','.join(['?'] * len(first_15))
    cur.execute(f"""
        UPDATE ph_invoices 
        SET email_sent = 1, email_status = 'sent', email_sent_at = '2026-09-18 18:30:00'
        WHERE number IN ({placeholders})
    """, first_15)
    updated_count = cur.rowcount
    if updated_count > 0:
        print(f"  Marcadas {updated_count} facturas (1 al 15) como ya enviadas para evitar reenvíos.")
        
    con.commit()
    con.close()

# Buscar todas las data.db
dbs = []
for root, dirs, files in os.walk('.'):
    for f in files:
        if f == 'data.db':
            dbs.append(os.path.join(root, f))

for db_path in dbs:
    try:
        migrate_db(db_path)
    except Exception as e:
        print(f"Error procesando {db_path}: {e}")

print("\n¡Migración de base de datos finalizada!")
