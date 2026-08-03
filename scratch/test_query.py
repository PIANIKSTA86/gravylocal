import sqlite3

def test_query():
    conn = sqlite3.connect('pb_data/data.db')
    cursor = conn.cursor()
    
    start_date = '2026-07-01'
    end_date = '2026-07-08'
    
    cursor.execute("SELECT COUNT(*) FROM transactions WHERE date >= ? AND date <= ?", (start_date, end_date))
    count = cursor.fetchone()[0]
    print(f"Transactions between {start_date} and {end_date}: {count}")
    
    cursor.execute("SELECT id, number, date FROM transactions WHERE date >= ? AND date <= ? LIMIT 5", (start_date, end_date))
    rows = cursor.fetchall()
    for r in rows:
        print(f"ID: {r[0]} | Number: {r[1]} | Date: {r[2]}")
        
    conn.close()

if __name__ == '__main__':
    test_query()
