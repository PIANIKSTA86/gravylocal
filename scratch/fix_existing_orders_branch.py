import sqlite3

db_path = r'c:\Users\JULIAN\Desktop\GravyLocal2.0\pb_data\data.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get orders
cursor.execute("SELECT id, number, warehouse_id, branch_id FROM sales_orders")
orders = cursor.fetchall()

print("Updating existing sales orders:")
for o in orders:
    order_id, number, wh_id, current_branch = o
    target_branch = None
    
    # Map warehouse to branch
    if wh_id == '75npb0kfhhfdtmf':  # BODEGA CALI
        target_branch = 'eo3d07bscdpb7kd'  # Cali branch
    elif wh_id == 'fclyvwpcomhq4gu':  # BODEGA BOGOTA
        target_branch = '8d30v195m0j3q3d'  # Bogota branch
    else:
        target_branch = 'eo3d07bscdpb7kd'  # Fallback to Cali branch (01)
        
    print(f"  Order: {number} | Current Branch: '{current_branch}' | Warehouse: {wh_id} -> Assigning Branch: {target_branch}")
    cursor.execute("UPDATE sales_orders SET branch_id = ? WHERE id = ?", (target_branch, order_id))

# Also let's update warehouses to have branch relationships to avoid future discrepancies!
print("\nUpdating warehouses to link them to their respective branches:")
# BODEGA CALI -> Cali branch
cursor.execute("UPDATE warehouses SET branch_id = 'eo3d07bscdpb7kd' WHERE id = '75npb0kfhhfdtmf'")
# BODEGA BOGOTA -> Bogota branch
cursor.execute("UPDATE warehouses SET branch_id = '8d30v195m0j3q3d' WHERE id = 'fclyvwpcomhq4gu'")

conn.commit()
conn.close()
print("\nUpdate completed successfully!")
