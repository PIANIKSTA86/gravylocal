import sqlite3
import json

db_path = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/hub/pb_data/data.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT fields FROM _collections WHERE name='licenses'")
row = cursor.fetchone()
if row:
    fields_json = row[0]
    fields = json.loads(fields_json)
    
    modified = False
    for field in fields:
        if field.get('name') == 'enabled' and field.get('required') is True:
            field['required'] = False
            modified = True
            print("Found 'enabled' field. Changed required to False.")
            
    if modified:
        new_fields_json = json.dumps(fields)
        cursor.execute("UPDATE _collections SET fields = ? WHERE name = 'licenses'", (new_fields_json,))
        conn.commit()
        print("Database schema successfully patched in SQLite _collections table!")
    else:
        print("'enabled' field was already required: False or not found.")
else:
    print("Collection 'licenses' not found.")

conn.close()
