import sqlite3
import os

def update_company_settings(db_path, name, nit):
    if not os.path.exists(db_path):
        print(f"Db path not found: {db_path}")
        return
        
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Guardar company_name
        cursor.execute("SELECT id FROM settings WHERE key='company_name'")
        row = cursor.fetchone()
        if row:
            cursor.execute("UPDATE settings SET value=? WHERE key='company_name'", (name,))
        else:
            cursor.execute("INSERT INTO settings (key, value) VALUES ('company_name', ?)", (name,))
            
        # Guardar company_nit
        cursor.execute("SELECT id FROM settings WHERE key='company_nit'")
        row = cursor.fetchone()
        if row:
            cursor.execute("UPDATE settings SET value=? WHERE key='company_nit'", (nit,))
        else:
            cursor.execute("INSERT INTO settings (key, value) VALUES ('company_nit', ?)", (nit,))
            
        conn.commit()
        print(f"Successfully updated company name to '{name}' and nit to '{nit}' in: {db_path}")
        conn.close()
    except Exception as e:
        print(f"Error updating settings in {db_path}: {e}")

def cleanup_hub_accesses(hub_db_path, company_id, allowed_emails):
    if not os.path.exists(hub_db_path):
        print(f"HUB DB path not found: {hub_db_path}")
        return
        
    try:
        conn = sqlite3.connect(hub_db_path)
        cursor = conn.cursor()
        
        # Primero buscar los hub_user_id correspondientes a los correos permitidos
        allowed_user_ids = []
        for email in allowed_emails:
            cursor.execute("SELECT id FROM hub_users WHERE email=?", (email,))
            row = cursor.fetchone()
            if row:
                allowed_user_ids.append(row[0])
                
        # Eliminar accesos de usuarios no permitidos a la empresa
        placeholders = ','.join('?' for _ in allowed_user_ids)
        if allowed_user_ids:
            cursor.execute(f"DELETE FROM user_company_access WHERE company_id=? AND hub_user_id NOT IN ({placeholders})", (company_id, *allowed_user_ids))
        else:
            cursor.execute("DELETE FROM user_company_access WHERE company_id=?", (company_id,))
            
        deleted_count = cursor.rowcount
        conn.commit()
        print(f"Deleted {deleted_count} incorrect access records to company '{company_id}' in HUB DB.")
        conn.close()
    except Exception as e:
        print(f"Error cleaning up accesses in HUB DB: {e}")

if __name__ == '__main__':
    # 1. Corregir configuración de la Empresa Demo
    print("=== Restoring Demo Company settings ===")
    update_company_settings(
        db_path='c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db',
        name='EMPRESA DE PRUEBA SAS',
        nit='800123456-5'
    )
    
    # 2. Corregir configuración de la Empresa 8091 (Empresa Logística)
    print("\n=== Setting Empresa 8091 settings ===")
    update_company_settings(
        db_path='c:/Users/JULIAN/Desktop/GravyLocal2.0/empresas/empresa_8091/pb_data/data.db',
        name='EMPRESA LOGISTICA SAS',
        nit='800987654-4'
    )
    
    # 3. Limpiar accesos duplicados en el HUB para Empresa Logística (ze3jmw3xw35hqxu)
    # Solo admin@contaco.com debería tener acceso a esta empresa nueva desde el HUB
    print("\n=== Cleaning up HUB accesses ===")
    cleanup_hub_accesses(
        hub_db_path='c:/Users/JULIAN/Desktop/GravyLocal2.0/hub/pb_data/data.db',
        company_id='ze3jmw3xw35hqxu',
        allowed_emails=['admin@contaco.com']
    )
    
    print("\n=== Cleanup Complete ===")
