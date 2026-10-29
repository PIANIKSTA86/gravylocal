import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

emp_id = 'vsu8bz83547sxrn'

for acct_code in ['26100501', '26101001', '26101501']:
    acct = c.execute("SELECT id, name FROM accounts WHERE code = ?", (acct_code,)).fetchone()
    if acct:
        txs = c.execute("""
            SELECT SUM(tl.debit), SUM(tl.credit)
            FROM tx_lines tl
            WHERE tl.account_id = ? AND tl.third_party_id = ?
        """, (acct[0], emp_id)).fetchone()
        print(f"Account {acct_code} ({acct[1]}): Debits = {txs[0] or 0:,.2f} | Credits = {txs[1] or 0:,.2f} | Balance = {((txs[1] or 0) - (txs[0] or 0)):,.2f}")
