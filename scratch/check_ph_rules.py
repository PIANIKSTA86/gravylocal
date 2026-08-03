import sqlite3
import json
import glob

def check_rules():
    db_files = glob.glob("**/data.db", recursive=True)
    print("Found DB files:", db_files)
    
    for db_path in db_files:
        print(f"\n--- Checking {db_path} ---")
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT name, createRule, updateRule, listRule, viewRule FROM _collections WHERE name IN ('ph_invoices', 'ph_invoice_lines', 'ph_properties')")
            rows = cursor.fetchall()
            for r in rows:
                print(f"Collection: {r[0]}")
                print(f"  createRule: {r[1]}")
                print(f"  updateRule: {r[2]}")
                print(f"  listRule:   {r[3]}")
                print(f"  viewRule:   {r[4]}")
            conn.close()
        except Exception as e:
            print("Error checking DB:", e)

if __name__ == '__main__':
    check_rules()
