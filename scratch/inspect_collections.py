import sqlite3
import os

def check_counts():
    db_path = "empresas/empresa_8091/pb_data/data.db"
    if not os.path.exists(db_path):
        print("Database not found")
        return
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [t[0] for t in cursor.fetchall()]
    
    # Exclude system tables starting with underscore unless they are data tables
    ignore_prefixes = ("_migrations", "_params", "_collections", "_mfas", "sqlite_", "_otps", "_externalAuths", "_authOrigins")
    
    print("Record counts in tables:")
    for t in sorted(tables):
        if any(t.startswith(p) for p in ignore_prefixes):
            continue
        try:
            cursor.execute(f"SELECT COUNT(*) FROM `{t}`")
            count = cursor.fetchone()[0]
            if count > 0 or t in ("users", "_superusers"):
                print(f"  {t}: {count}")
        except Exception as e:
            print(f"  Error reading {t}: {e}")
            
    conn.close()

if __name__ == "__main__":
    check_counts()
