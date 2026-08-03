import sqlite3
import glob
import os

def update_ph_rules():
    db_files = ['pb_data/data.db'] + glob.glob("empresas/*/pb_data/data.db")
    print("DB files to update:", db_files)
    
    write_rule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')"
    delete_rule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador')"
    
    collections = ['ph_invoices', 'ph_invoice_lines', 'ph_individual_charges', 'ph_billing_concepts', 'ph_common_areas', 'ph_properties', 'ph_pqrs', 'ph_reservations', 'ph_budgets', 'ph_budget_lines']
    
    for db_path in db_files:
        if not os.path.exists(db_path):
            continue
        print(f"\n--- Updating DB: {db_path} ---")
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            for col in collections:
                cursor.execute(
                    "UPDATE _collections SET createRule = ?, updateRule = ?, deleteRule = ? WHERE name = ?",
                    (write_rule, write_rule, delete_rule, col)
                )
                if cursor.rowcount > 0:
                    print(f"  Updated rules for collection '{col}' ({cursor.rowcount} row(s))")
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"  Error updating {db_path}: {e}")

if __name__ == '__main__':
    update_ph_rules()
