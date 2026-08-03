import sqlite3
import os

def copy_admin_user():
    src_db = "pb_data/data.db"
    dest_db = "empresas/empresa_8091/pb_data/data.db"
    
    if not os.path.exists(src_db):
        print(f"Source database {src_db} does not exist!")
        return
    if not os.path.exists(dest_db):
        print(f"Destination database {dest_db} does not exist!")
        return
        
    src_conn = sqlite3.connect(src_db)
    src_cursor = src_conn.cursor()
    
    # Get the admin@contaco.com user from source database
    src_cursor.execute("SELECT * FROM users WHERE email=?", ("admin@contaco.com",))
    user_row = src_cursor.fetchone()
    
    if not user_row:
        print("Could not find admin@contaco.com in source database.")
        src_conn.close()
        return
        
    # Get column names
    src_cursor.execute("PRAGMA table_info(users)")
    cols = [col[1] for col in src_cursor.fetchall()]
    
    src_conn.close()
    
    # Open destination and check columns
    dest_conn = sqlite3.connect(dest_db)
    dest_cursor = dest_conn.cursor()
    dest_cursor.execute("PRAGMA table_info(users)")
    dest_cols = [col[1] for col in dest_cursor.fetchall()]
    
    # Find matching columns
    common_cols = [c for c in cols if c in dest_cols]
    print("Common columns:", common_cols)
    
    # Build select query from user_row dict
    user_dict = dict(zip(cols, user_row))
    
    # Check if user already exists in destination
    dest_cursor.execute("SELECT id FROM users WHERE email=?", ("admin@contaco.com",))
    existing = dest_cursor.fetchone()
    
    # Insert or update
    col_str = ", ".join(common_cols)
    placeholders = ", ".join(["?" for _ in common_cols])
    val_tuple = tuple(user_dict[c] for c in common_cols)
    
    if existing:
        print("User admin@contaco.com already exists in destination. Updating...")
        update_sets = ", ".join([f"{c}=?" for c in common_cols if c != 'id'])
        update_vals = tuple(user_dict[c] for c in common_cols if c != 'id') + (existing[0],)
        dest_cursor.execute(f"UPDATE users SET {update_sets} WHERE id=?", update_vals)
    else:
        print("Inserting admin@contaco.com into destination...")
        dest_cursor.execute(f"INSERT INTO users ({col_str}) VALUES ({placeholders})", val_tuple)
        
    dest_conn.commit()
    dest_conn.close()
    print("Done copying admin user.")

if __name__ == "__main__":
    copy_admin_user()
