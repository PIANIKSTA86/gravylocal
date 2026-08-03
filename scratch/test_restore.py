import json
import sqlite3
import shutil
import os

# Copy the DB to a temp file for testing
db_src = 'empresas/empresa_8091/pb_data/data.db'
db_dest = 'scratch/test_restore_data.db'
os.makedirs('scratch', exist_ok=True)
shutil.copyfile(db_src, db_dest)

print("Copied DB to", db_dest)

# Connect to the temp DB
conn = sqlite3.connect(db_dest)
cur = conn.cursor()

# Enable foreign keys (though PocketBase might not have them defined, let's check what errors happen)
cur.execute("PRAGMA foreign_keys = ON;")

# Load the backup file
backup_path = 'DatosReferencia/EMPRESA_DE_PRUEBA_SAS_plantilla_config_2026-06-24_02-51.json'
with open(backup_path, 'r', encoding='utf-8') as f:
    backup = json.load(f)

ORDER = [
    'settings',
    'treasury_settings',
    'licenses',
    'geo_countries',
    'geo_departments',
    'geo_municipalities',
    'branches',
    'dian_resolutions',
    'exogena_concepts',
    'financial_notes',
    'logistica_vehicles',
    'ph_common_areas',
    'ph_budgets',
    'warehouses',
    'account_types',
    'accounts',
    'third_parties',
    'transaction_types',
    'users',
    'commission_rules',
    'ph_billing_concepts',
    'ph_budget_lines',
    'ph_properties',
    'inmo_properties',
    'pos_registers',
    'products',
    'pets',
    'transactions',
    'tx_lines',
    'bank_accounts',
    'bank_movements',
    'payroll_periods',
    'payroll_lines',
    'einvoice_docs',
    'inventory_movements',
    'inventory_movement_lines',
    'inventory_stock',
    'purchase_invoices',
    'purchase_invoice_lines',
    'pos_shifts',
    'invoices',
    'invoice_lines',
    'sales_orders',
    'sales_order_lines',
    'sales_reservations',
    'sales_reservation_lines',
    'appointments',
    'ph_invoices',
    'ph_invoice_lines',
    'ph_reservations',
    'ph_pqrs',
    'ph_individual_charges',
    'inmo_contracts',
    'inmo_invoices',
    'inmo_invoice_lines',
    'inmo_property_history',
    'crm_deals',
    'crm_interactions',
    'logistica_deliveries',
    'logistica_delivery_lines',
    'imports',
    'import_lines',
    'product_components',
    'audit_log',
]

# Reverse cleanup phase
REVERSE_ORDER = list(reversed(ORDER))
print("--- CLEANUP PHASE ---")
for col in REVERSE_ORDER:
    if col not in backup['collections']:
        continue
    # Count rows before
    try:
        cur.execute(f"select count(*) from {col}")
        count_before = cur.fetchone()[0]
        if count_before > 0:
            print(f"Cleaning {col} ({count_before} records)...")
            cur.execute(f"delete from {col}")
            conn.commit()
    except Exception as e:
        print(f"Error cleaning {col}: {e}")

print("--- INSERT PHASE ---")
for col in ORDER:
    if col not in backup['collections'] or not backup['collections'][col]:
        continue
    
    rows = backup['collections'][col]
    print(f"Restoring {col} ({len(rows)} records)...")
    
    # Get columns of the table
    try:
        cur.execute(f"PRAGMA table_info({col})")
        table_cols = {c[1] for c in cur.fetchall()}
    except Exception as e:
        print(f"Could not get table info for {col}: {e}")
        continue

    restored = 0
    errors = 0
    for row in rows:
        # Build insert query matching SQLite table columns
        clean_row = {}
        for k, v in row.items():
            if k in table_cols:
                # Convert bools to 1/0
                if isinstance(v, bool):
                    v = 1 if v else 0
                clean_row[k] = v
        
        # Try to insert or update (upsert)
        col_names = list(clean_row.keys())
        placeholders = ', '.join(['?'] * len(col_names))
        
        # We try to use REPLACE or INSERT OR REPLACE
        try:
            query = f"INSERT OR REPLACE INTO {col} ({', '.join(col_names)}) VALUES ({placeholders})"
            cur.execute(query, list(clean_row.values()))
            restored += 1
        except Exception as e:
            errors += 1
            if errors <= 5:
                print(f"Error inserting into {col} with id {row.get('id')}: {e}")
    
    conn.commit()
    print(f"Finished {col}: {restored} restored, {errors} errors")

conn.close()
