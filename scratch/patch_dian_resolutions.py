import sqlite3
import json
import os

def patch_db(db_path):
    print(f"=== Patching {db_path} ===")
    if not os.path.exists(db_path):
        print("Database not found")
        return
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        # Get the fields column
        cursor.execute("SELECT fields FROM _collections WHERE name='dian_resolutions'")
        row = cursor.fetchone()
        if not row:
            print("dian_resolutions collection not found")
            return
            
        fields_data = json.loads(row[0])
        modified = False
        
        # Check if list format
        if isinstance(fields_data, list):
            for field in fields_data:
                if field.get("name") == "document_type":
                    current_values = field.get("values", [])
                    target_values = ["FV", "POS", "DS", "NE", "NC", "ND", "NDS"]
                    # If any target value is missing
                    if any(v not in current_values for v in target_values):
                        # Union of current and target values preserving order
                        new_values = current_values + [v for v in target_values if v not in current_values]
                        field["values"] = new_values
                        modified = True
                        print(f"Updating values to: {new_values}")
                        
        if modified:
            new_fields_json = json.dumps(fields_data)
            cursor.execute("UPDATE _collections SET fields=? WHERE name='dian_resolutions'", (new_fields_json,))
            conn.commit()
            print("Successfully updated database schema.")
        else:
            print("No updates needed (values already present).")
            
    except Exception as e:
        print("Error:", e)
    finally:
        conn.close()

if __name__ == "__main__":
    patch_db("empresas/empresa_8091/pb_data_test/data.db")
    patch_db("empresas/empresa_8091/pb_data/data.db")
