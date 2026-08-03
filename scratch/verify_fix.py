import sqlite3

db_path = r"c:\Users\JULIAN\Desktop\GravyLocal2.0\pb_data\data.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Verify that all tx_lines for a specific transaction are fetched regardless of branch_id when branch filtering is ignored.
cursor.execute("SELECT id, number FROM transactions ORDER BY id DESC LIMIT 10")
recent_txs = cursor.fetchall()

print("--- Transaction Verification ---")
for tx in recent_txs:
    tx_id, tx_num = tx
    cursor.execute("SELECT id, account_id, debit, credit, branch_id FROM tx_lines WHERE tx_id = ?", (tx_id,))
    all_lines = cursor.fetchall()
    
    # Check lines with branch_id vs without
    branches = set(l[4] for l in all_lines)
    debit_sum = sum(l[2] for l in all_lines)
    credit_sum = sum(l[3] for l in all_lines)
    
    print(f"TX {tx_num} ({tx_id}): {len(all_lines)} lines | Branches: {branches} | Sum Debit: {debit_sum} | Sum Credit: {credit_sum}")

conn.close()
print("\nVerification script executed successfully.")
