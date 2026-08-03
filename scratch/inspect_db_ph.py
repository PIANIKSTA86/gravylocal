import sqlite3
import json

def inspect_ph():
    conn = sqlite3.connect('pb_data/data.db')
    cursor = conn.cursor()
    
    # Check _collections table for ph_invoices
    cursor.execute("SELECT name, fields FROM _collections WHERE name IN ('ph_invoices', 'ph_properties', 'ph_billing_concepts')")
    cols = cursor.fetchall()
    print("=== COLLECTIONS IN PB_DATA ===")
    for name, fields_json in cols:
        print(f"\nCollection: {name}")
        try:
            fields = json.loads(fields_json)
            for field in fields:
                print(f"  Field: {field.get('name')} | Type: {field.get('type')} | Required: {field.get('required')}")
        except Exception as e:
            print("  Raw fields:", fields_json)
            
    # Check rows in ph_properties
    try:
        cursor.execute("SELECT id, code, name FROM ph_properties LIMIT 5")
        props = cursor.fetchall()
        print("\n=== SAMPLE PROPERTIES ===")
        print(props)
    except Exception as e:
        print("Error fetching ph_properties:", e)

    # Check rows in ph_invoices
    try:
        cursor.execute("SELECT id, number, period, property_id, total, status FROM ph_invoices LIMIT 5")
        invs = cursor.fetchall()
        print("\n=== SAMPLE INVOICES ===")
        print(invs)
    except Exception as e:
        print("Error fetching ph_invoices:", e)

    conn.close()

if __name__ == '__main__':
    inspect_ph()
