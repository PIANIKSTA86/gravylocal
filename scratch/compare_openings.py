import sqlite3
import re

def parse_html_table(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()
    rows = []
    for tr in re.findall(r'<tr.*?>(.*?)</tr>', html, re.DOTALL):
        tds = re.findall(r'<td.*?>(.*?)</td>', tr, re.DOTALL)
        if not tds:
            tds = re.findall(r'<th.*?>(.*?)</th>', tr, re.DOTALL)
        clean_tds = [re.sub(r'<[^>]+>', '', td).strip() for td in tds]
        rows.append(clean_tds)
    return rows

err_rows = parse_html_table(r'c:\Users\JULIAN\Desktop\GravyLocalTABS\DatosReferencia\libro_auxiliar_2026-09-22 error.xls')

# Extract subtotals from error.xls
excel_subtotals = {}
for r in err_rows:
    if len(r) >= 10 and 'SubTotal ' in r[4] and r[4] != 'SubTotal CLIENTES NACIONALES':
        name = r[4].replace('SubTotal ', '').strip()
        # Parse currency formatted like 118.524.466,90
        val_str = r[6].replace('.', '').replace(',', '.')
        saldo_ant = float(val_str)
        excel_subtotals[name] = saldo_ant

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

# Get DB opening per third
cursor.execute("""
    SELECT tp.name,
           tp.doc_number,
           SUM(l.debit - l.credit) as db_opening
    FROM tx_lines l
    JOIN transactions t ON t.id = l.tx_id
    JOIN accounts a ON a.id = l.account_id
    LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
    WHERE t.status = 'active'
      AND a.code = '13050501'
      AND t.date < '2026-01-01'
    GROUP BY tp.name, tp.doc_number
""")
db_openings = {r[0]: r[2] for r in cursor.fetchall()}

print(f"{'Tercero':<40} | {'Excel SaldoAnt':>15} | {'DB SaldoAnt':>15} | {'Diferencia':>15}")
print('-' * 95)
total_diff = 0
for name, exc_val in excel_subtotals.items():
    # find matching in db_openings
    db_val = 0
    matched_db = None
    for db_name, val in db_openings.items():
        if db_name and (db_name.strip().upper() == name.strip().upper() or name.strip().upper() in db_name.strip().upper()):
            matched_db = db_name
            db_val = val
            break
    diff = db_val - exc_val
    total_diff += diff
    if abs(diff) > 0.01:
        print(f"{name[:40]:<40} | {exc_val:>15,.2f} | {db_val:>15,.2f} | {diff:>15,.2f}  <-- MISMATCH!")
    else:
        print(f"{name[:40]:<40} | {exc_val:>15,.2f} | {db_val:>15,.2f} | {diff:>15,.2f}")

print('-' * 95)
print(f"Total diferencia en terceros que aparecen en Excel: {total_diff:,.2f}")
