import urllib.request
import json
import sqlite3

# Let's inspect users
conn = sqlite3.connect('empresas/empresa_8094/pb_data/data.db')
c = conn.cursor()
c.execute("SELECT id, email, role FROM users")
users = c.fetchall()
print("Users:", users)

# Check settings or login tests in codebase
