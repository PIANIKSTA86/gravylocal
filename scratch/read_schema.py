import sqlite3

def check():
    db_path = "pb_data/data.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Print all column names in transactions table
    cursor.execute("PRAGMA table_info(transactions)")
    cols = cursor.fetchall()
    print("Columns in transactions table:")
    for c in cols:
        print(f"  - {c[1]} ({c[2]})")
        
    # 2. Print all column names in pos_shifts table
    cursor.execute("PRAGMA table_info(pos_shifts)")
    cols = cursor.fetchall()
    print("\nColumns in pos_shifts table:")
    for c in cols:
        print(f"  - {c[1]} ({c[2]})")
        
    conn.close()

if __name__ == "__main__":
    check()
