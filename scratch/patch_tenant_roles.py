import sqlite3
import json

db_path = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT fields FROM _collections WHERE name='users'")
row = cursor.fetchone()
if row:
    fields_json = row[0]
    fields = json.loads(fields_json)
    
    modified = False
    for field in fields:
        if field.get('name') == 'role' and field.get('type') == 'select':
            values = field.get('values', [])
            for new_role in ['vendedor', 'propietario']:
                if new_role not in values:
                    values.append(new_role)
                    modified = True
                    print(f"Added '{new_role}' to users.role select values in Tenant DB.")
            field['values'] = values
            
    if modified:
        new_fields_json = json.dumps(fields)
        cursor.execute("UPDATE _collections SET fields = ? WHERE name = 'users'", (new_fields_json,))
        conn.commit()
        print("Tenant Database schema successfully patched for new user roles!")
    else:
        print("Roles 'vendedor' and 'propietario' were already present in select values or field not found.")
else:
    print("Collection 'users' not found in Tenant DB.")

conn.close()
