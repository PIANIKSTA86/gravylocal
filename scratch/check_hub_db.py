import sqlite3
import os

db_path = r"c:\Users\JULIAN\Desktop\GravyLocal2.0\hub\pb_data\data.db"

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Print all companies
    cursor.execute("SELECT id, name, url, port, active FROM companies;")
    print("=== COMPANIES ===")
    companies = cursor.fetchall()
    for c in companies:
        print(f"ID: {c[0]} | Name: {c[1]} | URL: {c[2]} | Port: {c[3]} | Active: {c[4]}")
        
    # 2. Print all users
    cursor.execute("SELECT id, email, full_name, is_superadmin FROM hub_users;")
    print("\n=== HUB USERS ===")
    users = cursor.fetchall()
    user_map = {}
    for u in users:
        print(f"ID: {u[0]} | Email: {u[1]} | Name: {u[2]} | SuperAdmin: {u[3]}")
        user_map[u[0]] = u[1]
        
    # 3. Print all accesses
    cursor.execute("SELECT id, hub_user_id, company_id, role, company_email, active FROM user_company_access;")
    print("\n=== USER COMPANY ACCESS ===")
    accesses = cursor.fetchall()
    for a in accesses:
        user_email = user_map.get(a[1], a[1])
        print(f"ID: {a[0]} | User: {user_email} | Company ID: {a[2]} | Role: {a[3]} | Email: {a[4]} | Active: {a[5]}")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
