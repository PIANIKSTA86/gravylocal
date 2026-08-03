import sqlite3
from datetime import datetime

def check():
    conn = sqlite3.connect('pb_data/data.db')
    cursor = conn.cursor()
    
    # Let's get active transactions and line items
    # Filter: transactions status = "active"
    cursor.execute("SELECT id, date FROM transactions WHERE status='active'")
    txs = cursor.fetchall()
    tx_ids = [tx[0] for tx in txs]
    print(f"Active transactions: {len(txs)}")
    
    # We want to calculate balances at a cutoff date, say 2026-05-31
    cutoff = '2026-05-31'
    
    # Load all accounts
    cursor.execute("SELECT id, code, name, level, parent_code FROM accounts")
    accounts = cursor.fetchall()
    # Map accounts
    acc_by_id = {a[0]: {'id': a[0], 'code': a[1], 'name': a[2], 'level': a[3], 'parent_code': a[4]} for a in accounts}
    print(f"Total accounts: {len(accounts)}")
    
    # Calculate balances
    # We only sum lines where tx is active and date <= cutoff
    cursor.execute("""
        SELECT tl.account_id, SUM(COALESCE(tl.debit, 0) - COALESCE(tl.credit, 0)) 
        FROM tx_lines tl
        JOIN transactions t ON tl.tx_id = t.id
        WHERE t.status = 'active' AND t.date <= ?
        GROUP BY tl.account_id
    """, (cutoff,))
    balances = {row[0]: row[1] for row in cursor.fetchall()}
    print(f"Accounts with non-zero balances at {cutoff}: {len(balances)}")
    
    # Now simulate syncFromReport for ESF (prefixes: '1', '2', '3')
    prefixes = ['1', '2', '3']
    grupo_map = {}
    
    for acc_id, acc in acc_by_id.items():
        code = acc['code'] or ''
        if not any(code.startswith(p) for p in prefixes):
            continue
        if acc['level'] != 2:
            continue
            
        raw_now = balances.get(acc_id, 0)
        
        # Calculate consolidated balance (including all descendants whose code starts with the parent code)
        sum_now = 0
        children_found = 0
        for child_id, child in acc_by_id.items():
            child_code = child['code'] or ''
            if child_code.startswith(code):
                sum_now += balances.get(child_id, 0)
                children_found += 1
                
        # Also print details for level 2 accounts
        print(f"Level 2 Account: {code} | Name: {acc['name']} | Direct Balance: {raw_now} | Consolidated Balance: {sum_now} | Children count: {children_found}")
        
        if abs(sum_now) >= 0.01:
            grupo_map[code] = {
                'titulo': acc['name'] or code,
                'saldoNow': sum_now
            }
            
    print(f"\nConsolidated active groups (Level 2): {len(grupo_map)}")
    for code, info in sorted(grupo_map.items()):
        print(f"  Code: {code} | Name: {info['titulo']} | Balance: {info['saldoNow']}")
        
    conn.close()

if __name__ == '__main__':
    check()
