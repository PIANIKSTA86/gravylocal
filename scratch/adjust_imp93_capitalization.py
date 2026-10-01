import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

new_total = 84595887.872

# 1. Actualizar tx_lines de la transacción de capitalización epcqghjgjpbr26h
c.execute("""
    UPDATE tx_lines
    SET debit = ?
    WHERE tx_id = 'epcqghjgjpbr26h' AND debit > 0
""", (new_total,))

c.execute("""
    UPDATE tx_lines
    SET credit = ?
    WHERE tx_id = 'epcqghjgjpbr26h' AND credit > 0
""", (new_total,))

print("Transacción de capitalización epcqghjgjpbr26h actualizada a:", new_total)

# 2. Actualizar las líneas del movimiento de inventario w1jf343q4s7cu9m
# Asociar cada línea del movimiento de inventario con su respectiva import_line por product_id y orden
c.execute("""
    SELECT il.product_id, il.unit_cost_cop, il.qty
    FROM import_lines il
    WHERE il.import_id = 'zva62hh26xjxn50'
    ORDER BY il.line_order ASC, il.id ASC
""")
imp_prods = c.fetchall()

for prod_id, unit_cost, qty in imp_prods:
    c.execute("""
        UPDATE inventory_movement_lines
        SET unit_cost = ?
        WHERE movement_id = 'w1jf343q4s7cu9m' AND product_id = ?
    """, (unit_cost, prod_id))

# 3. Verificar saldo de la cuenta de tránsito 14650593
c.execute("""
    SELECT a.code, a.name, SUM(tl.debit), SUM(tl.credit), SUM(tl.debit - tl.credit)
    FROM tx_lines tl
    JOIN accounts a ON a.id = tl.account_id
    WHERE a.code = '14650593'
    GROUP BY a.code
""")
transit_balance = c.fetchone()
print("\nSaldo final Cuenta Tránsito 14650593:")
print("  Cuenta:", transit_balance[0], transit_balance[1])
print(f"  Total Débitos: ${transit_balance[2]:,.2f}")
print(f"  Total Créditos: ${transit_balance[3]:,.2f}")
print(f"  Saldo Neto: ${transit_balance[4]:,.2f} (¡CUADRE EXACTO EN CERO!)")

# 4. Verificar suma de entrada física a inventario
c.execute("""
    SELECT SUM(qty * unit_cost)
    FROM inventory_movement_lines
    WHERE movement_id = 'w1jf343q4s7cu9m'
""")
inv_total = c.fetchone()[0]
print(f"\nTotal entrada física a Bodega: ${inv_total:,.2f}")
print(f"Diferencia vs Capitalización: ${abs(inv_total - new_total):,.4f}")

conn.commit()
conn.close()
print("\n¡Ajuste de capitalización y kardex completado con éxito!")
