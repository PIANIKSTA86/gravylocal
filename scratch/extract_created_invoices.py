import sqlite3
import json

db_path = 'empresas/pb_data/auxiliary.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Query _logs table for POST or PATCH requests to invoices or invoice_lines
cur.execute("""
    SELECT id, message, data, created 
    FROM _logs 
    WHERE (message LIKE 'POST %/invoices%' OR message LIKE 'POST %/invoice_lines%' OR message LIKE 'POST %/bulk-tx%')
      AND created >= '2026-07-01'
    ORDER BY created DESC
""")
rows = cur.fetchall()

print(f"Found {len(rows)} POST requests since July 1st:")
for r in rows:
    log_id, msg, data_json, created = r
    print(f"[{created}] {msg}")
    try:
        data = json.loads(data_json)
        # Check if requestBody or responseBody is logged
        req_body = data.get('requestBody') or data.get('reqBody')
        resp_body = data.get('responseBody') or data.get('resBody')
        
        # Let's inspect the keys inside data
        # data might have requestInfo/responseInfo depending on PocketBase version
        req_info = data.get('requestInfo', {})
        res_info = data.get('responseInfo', {})
        
        body = req_info.get('body') or data.get('body') or req_body
        
        if body:
            print("Request Body:")
            print(json.dumps(body, indent=2))
        else:
            # Print keys of data to help debug
            print("No body found. Available keys:", list(data.keys()))
            if 'requestInfo' in data:
                print("RequestInfo keys:", list(data['requestInfo'].keys()))
                if 'body' in data['requestInfo']:
                    print("RequestInfo body:", data['requestInfo']['body'])
    except Exception as e:
        print("Error parsing data JSON:", e)
    print("=" * 60)

conn.close()
