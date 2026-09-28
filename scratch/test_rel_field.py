import sqlite3
import urllib.request
import json

# Get a user from users table
conn = sqlite3.connect('empresas/empresa_8094/pb_data/data.db')
c = conn.cursor()
c.execute("SELECT id, email, passwordHash FROM users LIMIT 1")
user = c.fetchone()
print("User:", user[0], user[1])

# Also check an invoice in ph_invoices
c.execute("SELECT id FROM ph_invoices LIMIT 1")
inv = c.fetchone()
print("Sample invoice:", inv[0] if inv else "None")
