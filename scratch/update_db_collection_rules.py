import sqlite3

db_path = r"c:\Users\JULIAN\Desktop\GravyLocal2.0\pb_data\data.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

delete_rule_line = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')"

line_collections = ['tx_lines', 'invoice_lines', 'purchase_lines', 'purchase_invoice_lines', 'inventory_movement_lines', 'sales_order_lines', 'payroll_lines', 'payroll_novelties']

for col in line_collections:
    cursor.execute("UPDATE _collections SET deleteRule = ? WHERE name = ?", (delete_rule_line, col))
    print(f"Updated DB deleteRule for {col}")

conn.commit()
conn.close()
print("Database collections updated successfully.")
