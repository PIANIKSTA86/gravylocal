import sqlite3
import json
import os
import glob

def patch_users_collection(db_path):
    if not os.path.exists(db_path):
        print(f"Skipping: {db_path} does not exist.")
        return
        
    try:
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
                    expected_roles = ["superadmin", "admin", "contador", "auxiliar", "cajero", "auditor", "viewer", "vendedor", "propietario"]
                    for new_role in expected_roles:
                        if new_role not in values:
                            values.append(new_role)
                            modified = True
                            print(f"Added '{new_role}' to users.role select values in: {db_path}")
                    field['values'] = values
                    
            if modified:
                new_fields_json = json.dumps(fields)
                cursor.execute("UPDATE _collections SET fields = ? WHERE name = 'users'", (new_fields_json,))
                conn.commit()
                print(f"Successfully patched users collection schema in: {db_path}")
            else:
                print(f"No changes needed for users collection in: {db_path}")
        else:
            print(f"Collection 'users' not found in: {db_path}")
            
        conn.close()
    except Exception as e:
        print(f"Error patching {db_path}: {e}")

def patch_hub_uca_collection(db_path):
    if not os.path.exists(db_path):
        print(f"Skipping: {db_path} does not exist.")
        return
        
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT fields FROM _collections WHERE name='user_company_access'")
        row = cursor.fetchone()
        if row:
            fields_json = row[0]
            fields = json.loads(fields_json)
            
            modified = False
            for field in fields:
                if field.get('name') == 'role' and field.get('type') == 'select':
                    values = field.get('values', [])
                    expected_roles = ["admin", "contador", "auxiliar", "cajero", "auditor", "viewer", "vendedor", "propietario"]
                    for new_role in expected_roles:
                        if new_role not in values:
                            values.append(new_role)
                            modified = True
                            print(f"Added '{new_role}' to user_company_access.role select values in: {db_path}")
                    field['values'] = values
                    
            if modified:
                new_fields_json = json.dumps(fields)
                cursor.execute("UPDATE _collections SET fields = ? WHERE name = 'user_company_access'", (new_fields_json,))
                conn.commit()
                print(f"Successfully patched user_company_access collection schema in: {db_path}")
            else:
                print(f"No changes needed for user_company_access collection in: {db_path}")
        else:
            print(f"Collection 'user_company_access' not found in: {db_path}")
            
        conn.close()
    except Exception as e:
        print(f"Error patching HUB DB: {e}")

if __name__ == '__main__':
    # 1. Parchar DB de la plantilla central / Empresa Demo
    print("=== Patching Demo DB ===")
    patch_users_collection('c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db')
    
    # 2. Parchar DB del HUB
    print("\n=== Patching Central HUB DB ===")
    patch_hub_uca_collection('c:/Users/JULIAN/Desktop/GravyLocal2.0/hub/pb_data/data.db')
    
    # 3. Parchar DBs de todas las empresas existentes
    print("\n=== Patching Tenant DBs ===")
    companies_pattern = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/empresas/*/pb_data/data.db'
    company_dbs = glob.glob(companies_pattern)
    for db in company_dbs:
        patch_users_collection(db)
        
    print("\n=== Database Schema Patching Complete ===")
