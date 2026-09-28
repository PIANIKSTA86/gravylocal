import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()

# Check and delete orphan tx
cur.execute("DELETE FROM tx_lines WHERE tx_id = 'n82n6icffs4swy4'")
print("Deleted tx_lines count:", cur.rowcount)
cur.execute("DELETE FROM transactions WHERE id = 'n82n6icffs4swy4'")
print("Deleted transactions count:", cur.rowcount)
con.commit()
con.close()
print("Cleaned up orphan transaction n82n6icffs4swy4 successfully.")
