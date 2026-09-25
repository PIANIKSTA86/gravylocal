import sqlite3
import json
import glob
import os

new_field = {
    "autogeneratePattern": "",
    "help": "Fecha de entrega material del inmueble para cobro proporcional de administración",
    "hidden": False,
    "id": "text1789714793",
    "max": 0,
    "min": 0,
    "name": "delivery_date",
    "pattern": "",
    "presentable": False,
    "primaryKey": False,
    "required": False,
    "system": False,
    "type": "text"
}

db_paths = glob.glob('empresas/*/pb_data/data.db')
if os.path.exists('pb_data/data.db'):
    db_paths.append('pb_data/data.db')

for db_path in db_paths:
    print(f"Procesando: {db_path}")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # 1. Comprobar si existe la columna en ph_properties
    c.execute("PRAGMA table_info(ph_properties)")
    cols = [col[1] for col in c.fetchall()]
    if 'delivery_date' not in cols:
        print(f"  Agregando columna delivery_date a ph_properties en {db_path}...")
        c.execute("ALTER TABLE ph_properties ADD COLUMN delivery_date TEXT DEFAULT ''")
    else:
        print(f"  Columna delivery_date ya existe en ph_properties.")
        
    # 2. Actualizar el registro en _collections
    c.execute("SELECT id, fields FROM _collections WHERE name = 'ph_properties'")
    row = c.fetchone()
    if row:
        cid, fields_json = row
        fields = json.loads(fields_json)
        has_field = any(f.get('name') == 'delivery_date' for f in fields)
        if not has_field:
            print(f"  Agregando definición de delivery_date a _collections...")
            fields.append(new_field)
            c.execute("UPDATE _collections SET fields = ? WHERE id = ?", (json.dumps(fields), cid))
        else:
            print(f"  Campo delivery_date ya registrado en _collections.")
            
    conn.commit()
    conn.close()

print("\nActualización de base de datos completada exitosamente.")
