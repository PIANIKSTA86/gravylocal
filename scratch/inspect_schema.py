import sqlite3
import json
import os

def inspect_schema():
    databases = [
        "pb_data/data.db",
        "empresas/empresa_8091/pb_data/data.db"
    ]
    
    for db_path in databases:
        print(f"=== {db_path} ===")
        if not os.path.exists(db_path):
            print("File not found")
            continue
            
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        try:
            cursor.execute("PRAGMA table_info(_collections)")
            cols = [c[1] for c in cursor.fetchall()]
            print("Columns in _collections:", cols)
            
            # Select record for dian_resolutions
            cursor.execute("SELECT * FROM _collections WHERE name='dian_resolutions'")
            row = cursor.fetchone()
            if row:
                row_dict = dict(zip(cols, row))
                # Let's find any column containing JSON or fields
                fields_col = 'fields' if 'fields' in cols else ('schema' if 'schema' in cols else None)
                if fields_col:
                    fields_data = json.loads(row_dict[fields_col])
                    # If it's a list (old schema)
                    if isinstance(fields_data, list):
                        for field in fields_data:
                            if field.get("name") == "document_type":
                                print("document_type field:")
                                print(json.dumps(field, indent=2))
                    # If it's a dict (newer pocketbase schemas might be different)
                    elif isinstance(fields_data, dict):
                        print("document_type field in dict:")
                        print(json.dumps(fields_data.get("document_type"), indent=2))
                    else:
                        print("Unknown fields format:", type(fields_data))
                else:
                    print("Could not find fields/schema column")
            else:
                print("dian_resolutions collection not found")
        except Exception as e:
            print("Error:", e)
        finally:
            conn.close()

if __name__ == "__main__":
    inspect_schema()
