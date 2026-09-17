import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
c.execute("SELECT * FROM einvoice_docs WHERE id = 'dorw11wig9x80gz'")
doc = c.fetchone()
cols = [d[0] for d in c.description]
for col, val in zip(cols, doc):
    if col == 'xml_content':
        print(f'{col}: length {len(val) if val else 0}')
    else:
        print(f'{col}: {val}')

print('\nTransaction:')
c.execute("SELECT * FROM transactions WHERE id = 's5vwzu5ybbg8kaq'")
tx = c.fetchone()
tx_cols = [d[0] for d in c.description]
for col, val in zip(tx_cols, tx):
    print(f'{col}: {val}')
