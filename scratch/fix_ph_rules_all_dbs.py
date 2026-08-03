import sqlite3
import glob

def fix_all_dbs():
    db_files = glob.glob("**/data.db", recursive=True)
    print("Found DB files:", db_files)
    
    write_rule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar' || @request.auth.role = 'superadmin')"
    
    for db_path in db_files:
        print(f"\n--- Updating {db_path} ---")
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            for col in ['ph_invoices', 'ph_invoice_lines', 'ph_properties']:
                cursor.execute(
                    "UPDATE _collections SET createRule = ?, updateRule = ? WHERE name = ?",
                    (write_rule, write_rule, col)
                )
                print(f"  Updated {col} in {db_path} (rows affected: {cursor.rowcount})")
            
            conn.commit()
            conn.close()
        except Exception as e:
            print("Error updating DB:", e)

if __name__ == '__main__':
    fix_all_dbs()
