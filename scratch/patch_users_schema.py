import sqlite3
import json
import os
import glob

# 1. Obtener los esquemas de referencia desde la base de datos central
template_db = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db'
ref_fields = {}

if os.path.exists(template_db):
    conn = sqlite3.connect(template_db)
    cursor = conn.cursor()
    cursor.execute("SELECT fields FROM _collections WHERE name='users'")
    row = cursor.fetchone()
    if row:
        fields = json.loads(row[0])
        for field in fields:
            if field.get('name') in ['role', 'full_name', 'active']:
                ref_fields[field.get('name')] = field
    conn.close()

print("Reference fields loaded:", list(ref_fields.keys()))

def fix_tenant_users_schema(db_path):
    if not os.path.exists(db_path):
        return
        
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT fields FROM _collections WHERE name='users'")
        row = cursor.fetchone()
        if row:
            fields = json.loads(row[0])
            existing_names = [f.get('name') for f in fields]
            
            modified = False
            for field_name in ['role', 'full_name', 'active']:
                if field_name not in existing_names:
                    if field_name in ref_fields:
                        fields.append(ref_fields[field_name])
                        modified = True
                        print(f"Added missing field '{field_name}' to users in: {db_path}")
                    else:
                        print(f"Reference field '{field_name}' not available.")
                        
            if modified:
                new_fields_json = json.dumps(fields)
                cursor.execute("UPDATE _collections SET fields = ? WHERE name = 'users'", (new_fields_json,))
                conn.commit()
                print(f"Successfully fixed users schema in: {db_path}")
            else:
                print(f"Schema is correct (no missing extended fields) in: {db_path}")
        else:
            print(f"Collection 'users' not found in: {db_path}")
        conn.close()
    except Exception as e:
        print(f"Error repairing {db_path}: {e}")

if __name__ == '__main__':
    if not ref_fields:
        print("Error: Could not load reference fields from template DB.")
        exit(1)
        
    print("\n=== Fixing Tenant DB Schemas ===")
    companies_pattern = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/empresas/*/pb_data/data.db'
    company_dbs = glob.glob(companies_pattern)
    for db in company_dbs:
        fix_tenant_users_schema(db)
        
    print("\n=== Schema Fix Complete ===")
