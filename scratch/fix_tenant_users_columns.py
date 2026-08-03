import sqlite3
import os

def fix_tenant_db():
    db_path = 'empresas/empresa_8091/pb_data/data.db'
    if not os.path.exists(db_path):
        print(f"DB not found at: {db_path}")
        return
        
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check current columns of users table
        cursor.execute("PRAGMA table_info(users)")
        columns = [r[1] for r in cursor.fetchall()]
        print(f"Original columns in users table: {columns}")
        
        modified = False
        if 'role' not in columns:
            print("Adding 'role' column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT '' NOT NULL")
            modified = True
            
        if 'full_name' not in columns:
            print("Adding 'full_name' column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN full_name TEXT DEFAULT '' NOT NULL")
            modified = True
            
        if 'active' not in columns:
            print("Adding 'active' column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT 0 NOT NULL")
            modified = True
            
        if modified:
            conn.commit()
            print("Columns added successfully.")
        else:
            print("All columns already present.")
            
        # Verify the user admin@contaco.com
        cursor.execute("SELECT id, email, role, full_name, active FROM users WHERE email='admin@contaco.com'")
        row = cursor.fetchone()
        if row:
            print(f"Found admin@contaco.com: ID={row[0]}, Role={row[2]}, FullName={row[3]}, Active={row[4]}")
            # Update the user's role to superadmin, name to SuperAdmin, active to 1
            if row[2] != 'superadmin' or row[3] == '' or row[4] != 1:
                print("Updating user admin@contaco.com to superadmin with active=1...")
                cursor.execute(
                    "UPDATE users SET role='superadmin', full_name='SuperAdministrador', active=1 WHERE email='admin@contaco.com'"
                )
                conn.commit()
                print("User updated successfully.")
            else:
                print("User already correctly configured as superadmin.")
        else:
            print("User admin@contaco.com NOT found in users table!")
            
        # Re-check columns
        cursor.execute("PRAGMA table_info(users)")
        columns = [r[1] for r in cursor.fetchall()]
        print(f"Updated columns in users table: {columns}")
        
        conn.close()
    except Exception as e:
        print("Error during execution:", e)

if __name__ == '__main__':
    fix_tenant_db()
