import sqlite3

def check_collections():
    conn = sqlite3.connect('pb_data/data.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM _collections")
    collections = [row[0] for row in cursor.fetchall()]
    print("Collections found in pb_data/data.db:")
    for col in sorted(collections):
        print(f" - {col}")
    conn.close()

if __name__ == '__main__':
    check_collections()
