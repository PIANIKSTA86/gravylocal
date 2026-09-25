import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

# 1. Opening balances from DB (same query as reports_optimized.pb.js)
cursor.execute("""
    SELECT
        l.account_id AS accountId,
        COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS thirdId,
        (CASE WHEN a.maneja_cruce = 1 OR a.maneja_cruce = 'true' THEN COALESCE(NULLIF(TRIM(l.cross_doc_ref), ''), 'SIN_DOC') ELSE 'NO_CRUCE' END) AS docCruce,
        SUM(l.debit - l.credit) AS balance
    FROM tx_lines l
    INNER JOIN transactions t ON t.id = l.tx_id
    INNER JOIN accounts a ON a.id = l.account_id
    WHERE t.status = 'active'
      AND t.date < '2026-01-01'
      AND a.code = '13050501'
    GROUP BY
        l.account_id,
        COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO'),
        (CASE WHEN a.maneja_cruce = 1 OR a.maneja_cruce = 'true' THEN COALESCE(NULLIF(TRIM(l.cross_doc_ref), ''), 'SIN_DOC') ELSE 'NO_CRUCE' END)
""")
openings = cursor.fetchall()
print(f"Total opening balance records: {len(openings)}")
total_opening = sum(o[3] for o in openings)
print(f"Total opening balance sum: {total_opening:,.2f}")

# 2. Period lines from DB (same query as reports_optimized.pb.js)
cursor.execute("""
    SELECT
        t.date AS fecha,
        t.number AS comprobante,
        t.id AS txId,
        l.account_id AS accountId,
        a.code AS accountCode,
        a.name AS accountName,
        a.nature AS accountNature,
        a.maneja_cruce AS accountManejaCruce,
        COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS thirdId,
        COALESCE(tp.name, 'Sin tercero') AS thirdName,
        COALESCE(tp.doc_number, '') AS thirdDoc,
        COALESCE(TRIM(l.cross_doc_ref), '') AS doc_cruce,
        COALESCE(l.description, t.description, '') AS descripcion,
        l.debit AS debito,
        l.credit AS credito
    FROM tx_lines l
    INNER JOIN transactions t ON t.id = l.tx_id
    INNER JOIN accounts a ON a.id = l.account_id
    LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
    WHERE t.status = 'active'
      AND t.date >= '2026-01-01'
      AND t.date <= '2026-01-31 23:59:59'
      AND a.code = '13050501'
""")
period_lines = cursor.fetchall()
print(f"Total period lines: {len(period_lines)}")
total_deb = sum(p[13] for p in period_lines)
total_cred = sum(p[14] for p in period_lines)
print(f"Period Debits: {total_deb:,.2f} | Credits: {total_cred:,.2f}")
print(f"Calculated Ending Balance: {total_opening + total_deb - total_cred:,.2f}")
