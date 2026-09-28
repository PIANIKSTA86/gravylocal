import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()
for tt in cur.execute("SELECT id, name, prefix, code, consecutive FROM transaction_types WHERE prefix = 'IMP' OR name LIKE '%import%'").fetchall():
    print("TxType:", tt)
