import sqlite3

def check():
    db_path = "pb_data/data.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("PRAGMA table_info(_collections)")
    cols = cursor.fetchall()
    print("Columns in _collections table:")
    for c in cols:
        print(f"  - {c[1]} ({c[2]})")
        
    conn.close()

if __name__ == "__main__":
    check()
