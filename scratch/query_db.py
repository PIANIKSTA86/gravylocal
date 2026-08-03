import sqlite3
import json

def query():
    db_path = "pb_data/data.db"
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 1. Print accounts starting with 1105
        cursor.execute("SELECT id, code, name FROM accounts WHERE code LIKE '1105%'")
        rows = cursor.fetchall()
        print("\nAccounts starting with 1105:")
        for r in rows:
            print(f"ID: {r[0]} | Code: {r[1]} | Name: {r[2]}")
            
        # 2. Print settings for treasury rules
        cursor.execute("SELECT id, key, value FROM settings WHERE key='treasury_rules'")
        row = cursor.fetchone()
        print("\nTreasury Rules Setting:")
        if row:
            print(f"ID: {row[0]} | Key: {row[1]} | Value: {row[2]}")
        else:
            print("Not found")

        # 3. Print last POS shifts
        cursor.execute("SELECT id, opened_at, closed_at, cash_expected, cash_actual, cash_recaudos, cash_egresos FROM pos_shifts ORDER BY created DESC LIMIT 5")
        rows = cursor.fetchall()
        print("\nLast POS Shifts:")
        for r in rows:
            print(f"ID: {r[0]} | Opened: {r[1]} | Closed: {r[2]} | Expected: {r[3]} | Actual: {r[4]} | Recs: {r[5]} | Egrs: {r[6]}")

        # 4. Print transactions and lines
        cursor.execute("""
            SELECT t.id, t.number, t.pos_shift_id, t.status, tt.code 
            FROM transactions t 
            LEFT JOIN transaction_types tt ON t.tx_type_id = tt.id 
            ORDER BY t.id DESC LIMIT 10
        """)
        txs = cursor.fetchall()
        print("\nLast Transactions:")
        for t in txs:
            print(f"ID: {t[0]} | Num: {t[1]} | Shift: {t[2]} | Status: {t[3]} | Type: {t[4]}")
            cursor.execute("""
                SELECT tl.id, tl.account_id, tl.debit, tl.credit, a.code, a.name 
                FROM tx_lines tl 
                LEFT JOIN accounts a ON tl.account_id = a.id 
                WHERE tl.tx_id = ?
            """, (t[0],))
            lines = cursor.fetchall()
            for l in lines:
                print(f"  - Line ID: {l[0]} | Acc ID: {l[1]} | Code: {l[4]} | Name: {l[5]} | Debit: {l[2]} | Credit: {l[3]}")
                
        conn.close()
    except Exception as e:
        print("Error querying database directly:", e)

if __name__ == "__main__":
    query()
