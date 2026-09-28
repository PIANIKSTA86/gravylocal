import urllib.request
import json

# Test PocketBase behavior with amount: 0 and concept_id: null
url = "http://localhost:8094/api/collections/ph_billing_concepts/records"

# We don't have auth token directly in python unless we login or test DB schema
# Let's inspect all databases _collections to see what schemas exist across empresa_8091..8094 and root pb_data!
import sqlite3, glob

for dbpath in glob.glob("empresas/**/data.db", recursive=True) + glob.glob("pb_data/data.db"):
    conn = sqlite3.connect(dbpath)
    c = conn.cursor()
    c.execute("SELECT fields FROM _collections WHERE name='ph_billing_concepts'")
    row = c.fetchone()
    if row:
        fields = json.loads(row[0])
        amt_field = [f for f in fields if f.get('name') == 'amount']
        print(dbpath, "ph_billing_concepts.amount:", amt_field)
