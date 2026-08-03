import sqlite3
import json
import os

paths = {
  'hub': 'c:/Users/JULIAN/Desktop/GravyLocal2.0/hub/pb_data/data.db',
  'demo': 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db',
  'empresa_8091': 'c:/Users/JULIAN/Desktop/GravyLocal2.0/empresas/empresa_8091/pb_data/data.db'
}

for key, db_path in paths.items():
    if not os.path.exists(db_path):
        print(f"[{key}] DB not found at: {db_path}")
        continue
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT fields FROM _collections WHERE name='users'")
        row = cursor.fetchone()
        if row:
            fields = json.loads(row[0])
            role_field = next((f for f in fields if f.get('name') == 'role'), None)
            if role_field:
                print(f"[{key}] users.role select values: {role_field.get('values')}")
            else:
                print(f"[{key}] role field not found in users collection")
        else:
            print(f"[{key}] users collection not found")
        
        # Also check user_company_access if it exists
        cursor.execute("SELECT fields FROM _collections WHERE name='user_company_access'")
        row_uca = cursor.fetchone()
        if row_uca:
            fields_uca = json.loads(row_uca[0])
            role_field_uca = next((f for f in fields_uca if f.get('name') == 'role'), None)
            if role_field_uca:
                print(f"[{key}] user_company_access.role select values: {role_field_uca.get('values')}")
        
        conn.close()
    except Exception as e:
        print(f"[{key}] Error: {e}")
