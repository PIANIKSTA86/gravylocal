import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

# Update transaction lines so only accounts starting with 2505 and maneja_cruce = 1 have cross_doc_ref
c.execute("""
    UPDATE tx_lines 
    SET cross_doc_ref = '' 
    WHERE tx_id = 'byy5ot31xou05tl' 
      AND account_id NOT IN (
          SELECT id FROM accounts WHERE code LIKE '2505%' AND maneja_cruce = 1
      )
""")
conn.commit()
print("Updated rows:", c.rowcount)

# Verify
c.execute("""
    SELECT tl.id, a.code, a.name, tl.debit, tl.credit, tl.cross_doc_ref 
    FROM tx_lines tl 
    JOIN accounts a ON tl.account_id = a.id 
    WHERE tl.tx_id = 'byy5ot31xou05tl'
""")
for r in c.fetchall():
    print(r)
