import sqlite3
import os
import glob

def patch_database_rules(db_path):
    if not os.path.exists(db_path):
        print(f"Skipping: {db_path} does not exist.")
        return
        
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Consultar si existe la colección 'users'
        cursor.execute("SELECT id FROM _collections WHERE name='users'")
        row = cursor.fetchone()
        if row:
            cursor.execute("""
                UPDATE _collections SET 
                    listRule = "@request.auth.collectionName = 'users' && @request.auth.role = 'superadmin'",
                    viewRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.id = id)",
                    updateRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || (@request.auth.id = id && @request.auth.role != 'viewer'))",
                    createRule = "@request.auth.collectionName = 'users' && @request.auth.role = 'superadmin'",
                    deleteRule = "@request.auth.collectionName = 'users' && @request.auth.role = 'superadmin'"
                WHERE name = 'users'
            """)
            conn.commit()
            print(f"Successfully patched users rules in: {db_path}")
        else:
            print(f"Collection 'users' not found in: {db_path}")
            
        conn.close()
    except Exception as e:
        print(f"Error patching rules in {db_path}: {e}")

if __name__ == '__main__':
    print("=== Patching Central Template DB Rules ===")
    patch_database_rules('c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db')
    
    print("\n=== Patching Tenant DBs Rules ===")
    companies_pattern = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/empresas/*/pb_data/data.db'
    company_dbs = glob.glob(companies_pattern)
    for db in company_dbs:
        patch_database_rules(db)
        
    print("\n=== Rules Patching Complete ===")
