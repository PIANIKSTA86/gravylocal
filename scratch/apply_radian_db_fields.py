import sqlite3
import json
import random

fields_to_add = [
    "radian_030_status",
    "radian_030_date",
    "radian_030_cude",
    "radian_032_status",
    "radian_032_date",
    "radian_032_cude",
    "radian_033_status",
    "radian_033_date",
    "radian_033_cude",
    "radian_031_status",
    "radian_031_claim_code",
    "radian_031_notes",
    "radian_last_response",
    "reception_source",
    "matias_reception_id"
]

conn = sqlite3.connect('pb_data/data.db')
cur = conn.cursor()

# 1. Update _collections fields definition
cur.execute("SELECT id, fields FROM _collections WHERE name='electronic_documents'")
row = cur.fetchone()
if not row:
    print("Collection electronic_documents not found!")
    exit(1)

col_id, fields_json = row
fields = json.loads(fields_json)
existing_names = {f.get('name') for f in fields}

added = 0
for f_name in fields_to_add:
    if f_name not in existing_names:
        field_id = f"text{random.randint(1000000000, 9999999999)}"
        new_field = {
            "autogeneratePattern": "",
            "help": "",
            "hidden": False,
            "id": field_id,
            "max": 0,
            "min": 0,
            "name": f_name,
            "pattern": "",
            "presentable": False,
            "primaryKey": False,
            "required": False,
            "system": False,
            "type": "text"
        }
        fields.append(new_field)
        added += 1

if added > 0:
    cur.execute("UPDATE _collections SET fields=? WHERE id=?", (json.dumps(fields), col_id))
    print(f"Updated _collections with {added} new fields.")

# 2. Add columns to electronic_documents table if they do not exist
cur.execute("PRAGMA table_info(electronic_documents)")
existing_table_cols = {r[1] for r in cur.fetchall()}

for f_name in fields_to_add:
    if f_name not in existing_table_cols:
        try:
            cur.execute(f"ALTER TABLE electronic_documents ADD COLUMN `{f_name}` TEXT DEFAULT ''")
            print(f"Added column `{f_name}` to table electronic_documents")
        except Exception as e:
            print(f"Error adding column `{f_name}`: {e}")

conn.commit()
conn.close()
print("Database schema migration complete!")
