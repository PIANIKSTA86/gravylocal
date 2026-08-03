import sqlite3
import os

def fix_hub_uca():
    db_path = 'hub/pb_data/data.db'
    if not os.path.exists(db_path):
        print(f"HUB DB not found at: {db_path}")
        return
        
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # We need to find the access record for admin@contaco.com (hub_user_id = 'j9dvhyje9q8d5pj') and ze3jmw3xw35hqxu (EMPRESA LOGISTICA SAS)
        cursor.execute(
            "SELECT id, role, active FROM user_company_access WHERE hub_user_id='j9dvhyje9q8d5pj' AND company_id='ze3jmw3xw35hqxu'"
        )
        row = cursor.fetchone()
        if row:
            print(f"Found HUB access record: ID={row[0]}, Role={row[1]}, Active={row[2]}")
            if row[1] != 'admin' or row[2] != 1:
                print("Updating HUB access record to role='admin' and active=1...")
                cursor.execute(
                    "UPDATE user_company_access SET role='admin', active=1 WHERE id=?",
                    (row[0],)
                )
                conn.commit()
                print("Record updated successfully.")
            else:
                print("Record already correctly configured.")
        else:
            print("Access record not found! Creating new active access record...")
            # Let's insert a new record
            # In user_company_access: id, hub_user_id, company_id, role, company_email, company_pass, active, created, updated
            import uuid
            new_id = 'acc_' + os.urandom(6).hex()
            cursor.execute(
                "INSERT INTO user_company_access (id, hub_user_id, company_id, role, company_email, company_pass, active, created, updated) "
                "VALUES (?, 'j9dvhyje9q8d5pj', 'ze3jmw3xw35hqxu', 'admin', 'admin@contaco.com', 'Admin1234!', 1, datetime('now'), datetime('now'))",
                (new_id,)
            )
            conn.commit()
            print(f"Created new access record with ID {new_id}")
            
        conn.close()
    except Exception as e:
        print("Error during execution:", e)

if __name__ == '__main__':
    fix_hub_uca()
