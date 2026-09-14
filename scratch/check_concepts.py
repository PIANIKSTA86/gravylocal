import glob, sqlite3

for path in glob.glob('./**/data.db', recursive=True):
    try:
        conn = sqlite3.connect(path)
        c = conn.cursor()
        c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ph_billing_concepts'")
        if c.fetchone():
            c.execute('SELECT COUNT(*) FROM ph_billing_concepts')
            cnt = c.fetchone()[0]
            if cnt > 0:
                print(f"{path}: {cnt} concepts")
                c.execute('SELECT id, code, name FROM ph_billing_concepts')
                for r in c.fetchall():
                    print('  ', r)
    except Exception as e:
        print(path, e)
