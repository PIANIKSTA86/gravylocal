import sqlite3

def inspect_hub():
    db_path = 'hub/pb_data/data.db'
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        
        print("=== HUB USERS ===")
        cur.execute("SELECT id, email, full_name, is_superadmin FROM hub_users")
        for r in cur.fetchall():
            print(r)
            
        print("\n=== COMPANIES ===")
        cur.execute("SELECT id, name, url, active FROM companies")
        for r in cur.fetchall():
            print(r)
            
        print("\n=== USER COMPANY ACCESS ===")
        cur.execute("SELECT id, hub_user_id, company_id, role, company_email, active FROM user_company_access")
        for r in cur.fetchall():
            print(r)
            
        conn.close()
    except Exception as e:
        print("Error:", e)

inspect_hub()
