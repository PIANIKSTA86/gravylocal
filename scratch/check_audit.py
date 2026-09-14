import sqlite3

con = sqlite3.connect('pb_data/data.db')
con.row_factory = sqlite3.Row
cur = con.cursor()

print("--- AUDIT LOGS FOR PURCHASE INVOICES ---")
cur.execute("SELECT * FROM audit_log WHERE entity_id IN ('75t0n9f18w0bj6p', 'pjff46mkkfmdd9l', 'zf8hjs91mgboufj') ORDER BY event_at")
for r in cur.fetchall():
    print(dict(r))

print("\n--- AUDIT LOGS FOR TX ---")
cur.execute("SELECT * FROM audit_log WHERE entity_id IN ('esr6au9ie588gph', 'lmsn9j7vswail53', '5wtbxesacba6ojd') ORDER BY event_at")
for r in cur.fetchall():
    print(dict(r))
