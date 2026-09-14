import glob, sqlite3, uuid, time

def gen_id():
    return 'r' + uuid.uuid4().hex[:14]

for path in glob.glob('./**/data.db', recursive=True):
    try:
        conn = sqlite3.connect(path)
        c = conn.cursor()
        c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ph_billing_concepts'")
        if not c.fetchone():
            continue

        print(f"--- Database: {path} ---")
        # 1. Check if MORA exists
        c.execute("SELECT id, code, name FROM ph_billing_concepts WHERE code = 'MORA'")
        mora = c.fetchone()
        if not mora:
            mora_id = gen_id()
            c.execute("""
                INSERT INTO ph_billing_concepts (id, code, name, description, amount, is_variable, applies_coef, active, account_id)
                VALUES (?, 'MORA', 'INTERESES DE MORA', 'Intereses de mora por pagos de administración vencidos', 0, 1, 0, 1, '')
            """, (mora_id,))
            conn.commit()
            print(f"  [+] Created MORA concept with id: {mora_id}")
        else:
            mora_id = mora[0]
            print(f"  [=] Found existing MORA concept with id: {mora_id}")

        # 2. Check ph_invoice_lines
        c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ph_invoice_lines'")
        if c.fetchone():
            c.execute("""
                SELECT COUNT(*) FROM ph_invoice_lines 
                WHERE (concept_id IS NULL OR concept_id = '') 
                AND (lower(description) LIKE '%mora%' OR lower(description) LIKE '%interes%')
            """)
            orphan_count = c.fetchone()[0]
            print(f"  [i] Found {orphan_count} orphan mora lines")
            if orphan_count > 0:
                c.execute("""
                    UPDATE ph_invoice_lines 
                    SET concept_id = ? 
                    WHERE (concept_id IS NULL OR concept_id = '') 
                    AND (lower(description) LIKE '%mora%' OR lower(description) LIKE '%interes%')
                """, (mora_id,))
                conn.commit()
                print(f"  [✓] Linked {orphan_count} orphan mora lines to concept_id {mora_id}")

        conn.close()
    except Exception as e:
        print(f"Error on {path}: {e}")
