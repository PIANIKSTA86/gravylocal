import sqlite3, json

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

import_id = 'zva62hh26xjxn50'

# 1. Obtener la importación
cursor.execute("""
    SELECT number, status, exchange_rate, proration_method, fob_total, 
           total_gastos_cif, total_gastos_locales, total, stage_expenses
    FROM imports 
    WHERE id = ?
""", (import_id,))
imp = cursor.fetchone()
print("Importación encontrada:", imp[:8])

# 2. Obtener los conceptos reales desde tx_lines
cursor.execute("""
    SELECT import_concept, SUM(debit - credit), tx_id
    FROM tx_lines
    WHERE import_id = ?
    GROUP BY import_concept
""", (import_id,))
concept_rows = cursor.fetchall()
concept_sums = {}
concept_tx_ids = {}
for concept, net_val, tx_id in concept_rows:
    concept_sums[concept] = net_val
    concept_tx_ids[concept] = tx_id
    print(f"  Concepto '{concept}': ${net_val:,.2f} (TX: {tx_id})")

fob_cop = concept_sums.get('fob', 0.0)
freight_cop = concept_sums.get('freight', 0.0)
insurance_cop = concept_sums.get('insurance', 0.0)
customs_cop = concept_sums.get('customs', 0.0)
carrier_cop = concept_sums.get('local_carrier', 0.0)
other_cop = concept_sums.get('local_other', 0.0)
bank_fees_cop = concept_sums.get('bank_fees', 0.0)

total_cif_cop = freight_cop + insurance_cop
total_locales_cop = customs_cop + carrier_cop + other_cop + bank_fees_cop
total_expenses_to_prorate = total_cif_cop + total_locales_cop
grand_total_cop = fob_cop + total_expenses_to_prorate

print(f"\nNuevos Totales Calculados:")
print(f"  FOB COP: ${fob_cop:,.2f}")
print(f"  CIF COP: ${total_cif_cop:,.2f}")
print(f"  Locales COP (con Bank Fees): ${total_locales_cop:,.2f}")
print(f"  Gastos Bancarios COP: ${bank_fees_cop:,.2f}")
print(f"  Total a Prorratear: ${total_expenses_to_prorate:,.2f}")
print(f"  Total Importación: ${grand_total_cop:,.2f}")

# 3. Obtener líneas de import_lines
cursor.execute("""
    SELECT id, qty, fob_price, arancel_rate, arancel_amount, 
           peso_bruto_total, cubic_meters_total, unit_cost_cop, total_cop
    FROM import_lines
    WHERE import_id = ?
    ORDER BY line_order ASC, id ASC
""", (import_id,))
lines = cursor.fetchall()
print(f"\nTotal líneas de producto: {len(lines)}")

proration_method = imp[3] or 'GROSS_WEIGHT'
total_weight = sum((l[5] or 0) for l in lines)
total_volume = sum((l[6] or 0) for l in lines)
total_fob_prod = sum(((l[1] or 0) * (l[2] or 0)) for l in lines)

updated_lines = []
accum_total_cop = 0.0

for idx, l in enumerate(lines):
    lid, qty, fob_price, arancel_rate, arancel_amt, peso_bruto, cbm, old_unit, old_tot = l
    
    # Calcular factor de prorrateo
    factor = 0.0
    if proration_method == 'GROSS_WEIGHT' and total_weight > 0:
        factor = (peso_bruto or 0) / total_weight
    elif proration_method == 'CUBIC_VOLUME' and total_volume > 0:
        factor = (cbm or 0) / total_volume
    elif total_fob_prod > 0:
        factor = (qty * fob_price) / total_fob_prod
    else:
        factor = 1.0 / len(lines)
        
    line_fob_share = (qty * fob_price) / total_fob_prod if total_fob_prod > 0 else (1.0 / len(lines))
    line_fob_cop = fob_cop * line_fob_share
    
    prorated_cost = factor * total_expenses_to_prorate
    line_arancel = arancel_amt or 0.0
    line_total_cop = line_fob_cop + prorated_cost + line_arancel
    line_unit_cost_cop = line_total_cop / qty if qty > 0 else 0.0
    
    updated_lines.append({
        'id': lid,
        'prorated_cost': round(prorated_cost, 2),
        'unit_cost_cop': round(line_unit_cost_cop, 2),
        'total_cop': round(line_total_cop, 2)
    })
    accum_total_cop += round(line_total_cop, 2)

# Ajuste fino por redondeo con grand_total_cop
diff = round(grand_total_cop - accum_total_cop, 2)
if abs(diff) > 0 and len(updated_lines) > 0:
    updated_lines[0]['total_cop'] = round(updated_lines[0]['total_cop'] + diff, 2)
    cursor.execute("SELECT qty FROM import_lines WHERE id = ?", (updated_lines[0]['id'],))
    q = cursor.fetchone()[0]
    if q > 0:
        updated_lines[0]['unit_cost_cop'] = round(updated_lines[0]['total_cop'] / q, 2)

# 4. Actualizar import_lines
for ul in updated_lines:
    cursor.execute("""
        UPDATE import_lines 
        SET prorated_cost = ?, unit_cost_cop = ?, total_cop = ?
        WHERE id = ?
    """, (ul['prorated_cost'], ul['unit_cost_cop'], ul['total_cop'], ul['id']))

# 5. Actualizar imports
bank_fees_tx = concept_tx_ids.get('bank_fees', '')
cursor.execute("""
    UPDATE imports
    SET total_gastos_cif = ?,
        total_gastos_locales = ?,
        total = ?,
        bank_fees_cost = ?,
        bank_fees_trm = 1,
        tx_bank_fees_id = ?
    WHERE id = ?
""", (total_cif_cop, total_locales_cop, grand_total_cop, bank_fees_cop, bank_fees_tx, import_id))

conn.commit()

# Verificación final
cursor.execute("SELECT total, total_gastos_locales, bank_fees_cost, tx_bank_fees_id FROM imports WHERE id = ?", (import_id,))
print("\nImports verificado:", cursor.fetchone())

cursor.execute("SELECT sum(total_cop), sum(prorated_cost) FROM import_lines WHERE import_id = ?", (import_id,))
sum_lines = cursor.fetchone()
print("Suma import_lines total_cop:", sum_lines[0])
print("Suma import_lines prorated_cost:", sum_lines[1])
print("Diferencia import_lines vs imports.total:", round(sum_lines[0] - grand_total_cop, 4))

conn.close()
print("Saneamiento de IMP-93 finalizado exitosamente.")
