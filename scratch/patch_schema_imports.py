import sqlite3
import json

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

# 1. Obtener id de third_parties
cursor.execute("SELECT id FROM _collections WHERE name='third_parties'")
tp_row = cursor.fetchone()
third_parties_id = tp_row[0] if tp_row else ""
print("Third parties collection ID:", third_parties_id)

# 2. Leer colección imports
cursor.execute("SELECT id, fields FROM _collections WHERE name='imports'")
imp_row = cursor.fetchone()
if not imp_row:
    print("ERROR: Colección imports no encontrada!")
    conn.close()
    exit(1)

imp_id, fields_raw = imp_row
fields = json.loads(fields_raw)
field_names = [f.get('name') for f in fields]
print("Campos actuales en imports:", len(field_names))

changed = False

# is_consolidated
if 'is_consolidated' not in field_names:
    fields.append({
        "autogeneratePattern": "",
        "hidden": False,
        "id": "bool_is_consolidated",
        "name": "is_consolidated",
        "presentable": False,
        "required": False,
        "system": False,
        "type": "bool"
    })
    changed = True
    print("+ Agregado campo 'is_consolidated'")

# forwarder_supplier_id
if 'forwarder_supplier_id' not in field_names and third_parties_id:
    fields.append({
        "cascadeDelete": False,
        "collectionId": third_parties_id,
        "hidden": False,
        "id": "relation_forwarder_supplier",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "forwarder_supplier_id",
        "presentable": False,
        "required": False,
        "system": False,
        "type": "relation"
    })
    changed = True
    print("+ Agregado campo 'forwarder_supplier_id'")

# supplier_id required = False
for f in fields:
    if f.get('name') == 'supplier_id':
        if f.get('required') is True:
            f['required'] = False
            changed = True
            print("~ supplier_id actualizado a required=False")

if changed:
    cursor.execute("UPDATE _collections SET fields=? WHERE id=?", (json.dumps(fields), imp_id))
    print("Colección imports actualizada en _collections.")

# 3. Columnas SQLite en la tabla imports
cursor.execute("PRAGMA table_info(imports)")
existing_cols = [row[1] for row in cursor.fetchall()]

if 'is_consolidated' not in existing_cols:
    cursor.execute("ALTER TABLE imports ADD COLUMN is_consolidated INTEGER DEFAULT 0")
    print("+ Columna 'is_consolidated' agregada a tabla imports")
else:
    print("Columna 'is_consolidated' ya existía en tabla imports")

if 'forwarder_supplier_id' not in existing_cols:
    cursor.execute("ALTER TABLE imports ADD COLUMN forwarder_supplier_id TEXT DEFAULT ''")
    print("+ Columna 'forwarder_supplier_id' agregada a tabla imports")
else:
    print("Columna 'forwarder_supplier_id' ya existía en tabla imports")

conn.commit()
conn.close()
print("¡Migración de esquema completada exitosamente!")
