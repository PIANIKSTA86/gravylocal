import sqlite3

def check_admins():
    conn = sqlite3.connect('pb_data/data.db')
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, email FROM _admins")
        print("Admins in _admins:", cursor.fetchall())
    except Exception as e:
        print("Error checking _admins:", e)
        
    try:
        cursor.execute("SELECT id, email, role FROM users WHERE role='superadmin' OR role='admin'")
        print("Admins in users:", cursor.fetchall())
    except Exception as e:
        print("Error checking users:", e)

    conn.close()

if __name__ == '__main__':
    check_admins()
