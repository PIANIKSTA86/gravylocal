import urllib.request
import urllib.error
import json

# Primero loguearse como admin o usuario
auth_url = 'http://127.0.0.1:8090/api/collections/users/auth-with-password'
# Busquemos un usuario en la bd
import sqlite3
conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
c.execute("SELECT email FROM users LIMIT 1")
user_email = c.fetchone()[0]
print("User email:", user_email)

# Para no necesitar la contraseña, usemos token de superadmin si lo hay, o probemos directamente la coleccion
# Veamos las reglas de payroll_lines en collections
c.execute("SELECT updateRule FROM _collections WHERE name = 'payroll_lines'")
rule = c.fetchone()
print("payroll_lines updateRule:", rule)
