import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()
row = cur.execute("SELECT name, createRule, updateRule, listRule, viewRule FROM _collections WHERE name = 'inventory_movements'").fetchone()
print("Collection:", row[0])
print("createRule:", repr(row[1]))
print("updateRule:", repr(row[2]))
print("listRule:", repr(row[3]))
