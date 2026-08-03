import sqlite3
import os

def inspect_db(db_path):
    print(f"=== Inspecting {db_path} ===")
    if not os.path.exists(db_path):
        print("File does not exist!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        # Check table columns
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        print("Columns in 'users' table:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
            
        # Get users
        cursor.execute("SELECT id, email, password, tokenKey, role, active, verified FROM users")
        users = cursor.fetchall()
        print(f"Found {len(users)} users:")
        for u in users:
            print(f"  ID: {u[0]}, Email: {u[1]}, PasswordHash: {u[2][:20]}..., TokenKey: {u[3][:10]}..., Role: {u[4]}, Active: {u[5]}, Verified: {u[6]}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    inspect_db("pb_data/data.db")
    inspect_db("empresas/empresa_8091/pb_data/data.db")
