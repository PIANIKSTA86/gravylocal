import sqlite3

def check_users():
    conn = sqlite3.connect('pb_data/data.db')
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(users)")
    cols = [c[1] for c in cursor.fetchall()]
    print("Users table columns:", cols)
    cursor.execute(f"SELECT id, email, role FROM users")
    rows = cursor.fetchall()
    print("Users in pb_data/data.db:")
    for r in rows:
        print(f"  ID: {r[0]} | Email: {r[1]} | Role: {r[2]}")
    conn.close()

if __name__ == '__main__':
    check_users()
