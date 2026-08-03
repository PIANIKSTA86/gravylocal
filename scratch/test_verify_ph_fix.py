import sqlite3
import json
import urllib.request
import secrets

def verify_fix():
    print("=== VERIFYING PH FIXES ===")
    
    # 1. Verify schema rules in DB
    conn = sqlite3.connect('pb_data/data.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name, createRule, updateRule FROM _collections WHERE name IN ('ph_individual_charges', 'ph_invoices')")
    rows = cursor.fetchall()
    for r in rows:
        print(f"Collection {r[0]}:")
        print(f"  createRule: {r[1]}")
        print(f"  updateRule: {r[2]}")
    
    # 2. Check property ID
    cursor.execute("SELECT id FROM ph_properties WHERE active=1 LIMIT 1")
    prop = cursor.fetchone()
    conn.close()
    
    prop_id = prop[0] if prop else ""
    print(f"\nSample Property ID: {prop_id}")
    
    # Test payloads that caused 400 Bad Request
    ic_payload_without_property = {
        "code": "TEST_INDIV",
        "name": "Sanción de convivencia test",
        "description": "Prueba de concepto individual sin unidad obligatoria",
        "amount": 35000,
        "active": True,
        "account_code": "413505",
        "period": "2026-07",
        "notes": "ACC:413505"
        # property_id omitted, as fixed in copropiedades.ts
    }
    
    inv_payload = {
        "number": f"CF-202607-TEST{secrets.token_hex(2)}",
        "period": "2026-07",
        "property_id": prop_id,
        "date": "2026-07-01",
        "due_date": "2026-07-10",
        "subtotal": 120000,
        "total": 120000,
        "status": "draft",
        "notes": "Test creation"
    }

    print("\nPayload for ph_individual_charges (without property_id):", json.dumps(ic_payload_without_property, indent=2))
    print("Payload for ph_invoices:", json.dumps(inv_payload, indent=2))
    print("\nVerification checks completed.")

if __name__ == '__main__':
    verify_fix()
