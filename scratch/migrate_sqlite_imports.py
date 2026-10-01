import sqlite3, json

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

# 1. Obtener la colección imports de _collections
cursor.execute("SELECT id, fields FROM _collections WHERE name = 'imports'")
col_id, fields_json = cursor.fetchone()
fields = json.loads(fields_json)
field_names = {f['name'] for f in fields}

# Obtener IDs de colecciones relacionadas (transactions y third_parties)
cursor.execute("SELECT id FROM _collections WHERE name = 'transactions'")
tx_col_id = cursor.fetchone()[0]

cursor.execute("SELECT id FROM _collections WHERE name = 'third_parties'")
tp_col_id = cursor.fetchone()[0]

new_fields = []
# tx_bank_fees_id
if 'tx_bank_fees_id' not in field_names:
    new_fields.append({
        "cascadeDelete": False,
        "collectionId": tx_col_id,
        "help": "",
        "hidden": False,
        "id": "relation_tx_bank_fees",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "tx_bank_fees_id",
        "presentable": False,
        "required": False,
        "system": False,
        "type": "relation"
    })

# bank_fees_supplier_id
if 'bank_fees_supplier_id' not in field_names:
    new_fields.append({
        "cascadeDelete": False,
        "collectionId": tp_col_id,
        "help": "",
        "hidden": False,
        "id": "relation_bank_fees_supp",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "bank_fees_supplier_id",
        "presentable": False,
        "required": False,
        "system": False,
        "type": "relation"
    })

# bank_fees_invoice_num
if 'bank_fees_invoice_num' not in field_names:
    new_fields.append({
        "autogeneratePattern": "",
        "help": "",
        "hidden": False,
        "id": "text_bank_fees_inv",
        "max": 0,
        "min": 0,
        "name": "bank_fees_invoice_num",
        "pattern": "",
        "presentable": False,
        "primaryKey": False,
        "required": False,
        "system": False,
        "type": "text"
    })

# bank_fees_cost
if 'bank_fees_cost' not in field_names:
    new_fields.append({
        "help": "",
        "hidden": False,
        "id": "number_bank_fees_cost",
        "max": None,
        "min": 0,
        "name": "bank_fees_cost",
        "onlyInt": False,
        "presentable": False,
        "required": False,
        "system": False,
        "type": "number"
    })

# bank_fees_trm
if 'bank_fees_trm' not in field_names:
    new_fields.append({
        "help": "",
        "hidden": False,
        "id": "number_bank_fees_trm",
        "max": None,
        "min": 0,
        "name": "bank_fees_trm",
        "onlyInt": False,
        "presentable": False,
        "required": False,
        "system": False,
        "type": "number"
    })

if new_fields:
    fields.extend(new_fields)
    cursor.execute("UPDATE _collections SET fields = ? WHERE id = ?", (json.dumps(fields), col_id))
    print(f"Campos agregados a _collections: {[f['name'] for f in new_fields]}")
else:
    print("Todos los campos ya estaban en _collections.")

# 2. Agregar columnas físicas en la tabla imports si no existen
cursor.execute("PRAGMA table_info(imports)")
existing_cols = {row[1] for row in cursor.fetchall()}

cols_to_add = [
    ('tx_bank_fees_id', 'TEXT DEFAULT ""'),
    ('bank_fees_supplier_id', 'TEXT DEFAULT ""'),
    ('bank_fees_invoice_num', 'TEXT DEFAULT ""'),
    ('bank_fees_cost', 'REAL DEFAULT 0'),
    ('bank_fees_trm', 'REAL DEFAULT 1')
]

for col_name, col_def in cols_to_add:
    if col_name not in existing_cols:
        cursor.execute(f"ALTER TABLE imports ADD COLUMN {col_name} {col_def}")
        print(f"Columna {col_name} agregada a tabla imports.")
    else:
        print(f"Columna {col_name} ya existe en tabla imports.")

conn.commit()
conn.close()
print("Migración SQLite completada con éxito.")
