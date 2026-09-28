import sqlite3
import json
import glob

def migrate_db(db_path):
    print(f"\nMigrando base de datos: {db_path}")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # 1. Verificar si existe la tabla purchase_invoices
    c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='purchase_invoices'")
    if not c.fetchone():
        print("  Tabla purchase_invoices no existe, omitiendo.")
        conn.close()
        return

    # 2. Agregar columnas físicas a purchase_invoices si no existen
    c.execute("PRAGMA table_info(purchase_invoices)")
    existing_cols = {row[1] for row in c.fetchall()}
    
    fields_to_add = [
        ("payment_form", "TEXT"),
        ("payment_dian_code", "TEXT"),
        ("payment_method", "TEXT"),
        ("bank_account_id", "TEXT"),
    ]
    
    for col_name, col_type in fields_to_add:
        if col_name not in existing_cols:
            try:
                c.execute(f"ALTER TABLE purchase_invoices ADD COLUMN {col_name} {col_type}")
                print(f"  Columna física añadida a purchase_invoices: {col_name} ({col_type})")
            except Exception as e:
                print(f"  Error al añadir columna física {col_name}: {e}")
        else:
            print(f"  Columna física ya existe: {col_name}")

    # 3. Actualizar _collections para purchase_invoices
    c.execute("SELECT id, fields FROM _collections WHERE name='purchase_invoices'")
    row = c.fetchone()
    if row:
        col_id, fields_raw = row
        fields = json.loads(fields_raw)
        field_names = {f.get('name') for f in fields}
        
        # Buscar collectionId de bank_accounts si existe
        c.execute("SELECT id FROM _collections WHERE name='bank_accounts'")
        bank_col = c.fetchone()
        bank_col_id = bank_col[0] if bank_col else ""

        changed = False
        if 'payment_form' not in field_names:
            fields.append({
                "autogeneratePattern": "",
                "hidden": False,
                "id": "text_pur_pay_form",
                "max": 10,
                "min": 0,
                "name": "payment_form",
                "pattern": "",
                "presentable": False,
                "primaryKey": False,
                "required": False,
                "system": False,
                "type": "text"
            })
            changed = True
            print("  Campo 'payment_form' añadido al schema de _collections.")

        if 'payment_dian_code' not in field_names:
            fields.append({
                "autogeneratePattern": "",
                "hidden": False,
                "id": "text_pur_dian_code",
                "max": 10,
                "min": 0,
                "name": "payment_dian_code",
                "pattern": "",
                "presentable": False,
                "primaryKey": False,
                "required": False,
                "system": False,
                "type": "text"
            })
            changed = True
            print("  Campo 'payment_dian_code' añadido al schema de _collections.")

        if 'payment_method' not in field_names:
            fields.append({
                "autogeneratePattern": "",
                "hidden": False,
                "id": "text_pur_pay_method",
                "max": 50,
                "min": 0,
                "name": "payment_method",
                "pattern": "",
                "presentable": False,
                "primaryKey": False,
                "required": False,
                "system": False,
                "type": "text"
            })
            changed = True
            print("  Campo 'payment_method' añadido al schema de _collections.")

        if 'bank_account_id' not in field_names:
            if bank_col_id:
                fields.append({
                    "cascadeDelete": False,
                    "collectionId": bank_col_id,
                    "hidden": False,
                    "id": "rel_pur_bank_acc",
                    "maxSelect": 1,
                    "minSelect": 0,
                    "name": "bank_account_id",
                    "presentable": False,
                    "primaryKey": False,
                    "required": False,
                    "system": False,
                    "type": "relation"
                })
            else:
                fields.append({
                    "autogeneratePattern": "",
                    "hidden": False,
                    "id": "text_pur_bank_acc",
                    "max": 50,
                    "min": 0,
                    "name": "bank_account_id",
                    "pattern": "",
                    "presentable": False,
                    "primaryKey": False,
                    "required": False,
                    "system": False,
                    "type": "text"
                })
            changed = True
            print("  Campo 'bank_account_id' añadido al schema de _collections.")

        if changed:
            c.execute("UPDATE _collections SET fields=? WHERE id=?", (json.dumps(fields), col_id))
            conn.commit()
            print("  _collections actualizada exitosamente.")
        else:
            print("  _collections ya tenía todos los campos.")
    
    conn.commit()
    conn.close()

all_dbs = glob.glob("empresas/**/data.db", recursive=True) + glob.glob("pb_data/data.db")
for db in set(all_dbs):
    try:
        migrate_db(db)
    except Exception as e:
        print(f"Error en {db}: {e}")
