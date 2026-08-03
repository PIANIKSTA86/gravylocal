import sqlite3

def inspect():
    conn = sqlite3.connect('pb_data/data.db')
    cursor = conn.cursor()
    
    # 1. List collections/tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [t[0] for t in cursor.fetchall()]
    print("Tables in database:", len(tables))
    
    # Check transactions table
    if 'transactions' in tables:
        cursor.execute("SELECT COUNT(*) FROM transactions;")
        count = cursor.fetchone()[0]
        print(f"Total transactions in DB: {count}")
        
        cursor.execute("SELECT id, number, date, tx_type_id, status FROM transactions ORDER BY date DESC LIMIT 10;")
        rows = cursor.fetchall()
        print("\nLast 10 transactions:")
        for r in rows:
            print(f"ID: {r[0]} | Number: {r[1]} | Date: {r[2]} | Type: {r[3]} | Status: {r[4]}")
            
        # Check transaction date formats
        cursor.execute("SELECT date, COUNT(*) FROM transactions GROUP BY date LIMIT 10;")
        date_groups = cursor.fetchall()
        print("\nDate format examples and counts:")
        for dg in date_groups:
            print(f"Date: '{dg[0]}' | Count: {dg[1]}")
            
    # Check users table
    if 'users' in tables:
        cursor.execute("SELECT id, email, role, active FROM users;")
        users = cursor.fetchall()
        print("\nUsers in DB:")
        for u in users:
            print(f"ID: {u[0]} | Email: {u[1]} | Role: {u[2]} | Active: {u[3]}")
    else:
        print("Table 'users' not found!")
        
    conn.close()

if __name__ == '__main__':
    inspect()
