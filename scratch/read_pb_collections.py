import sqlite3
import json

def check():
    db_path = "pb_data/data.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, name, fields FROM _collections WHERE name='transactions' OR name='pos_shifts'")
    rows = cursor.fetchall()
    for r in rows:
        print(f"Collection: {r[1]} (ID: {r[0]})")
        try:
            schema = json.loads(r[2])
            print("Fields:")
            for field in schema:
                print(f"  - {field.get('name')} : {field.get('type')}")
        except Exception as e:
            print("  Error parsing schema:", e)
            print("  Raw Schema:", r[2])
            
    conn.close()

if __name__ == "__main__":
    check()
