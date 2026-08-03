import sqlite3

def inspect_admins():
    conn = sqlite3.connect('pb_data/data.db')
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT email FROM _admins;")
        admins = cursor.fetchall()
        print("Admins in DB:")
        for a in admins:
            print(a[0])
    except Exception as e:
        print("Error reading _admins:", e)
    conn.close()

if __name__ == '__main__':
    inspect_admins()
