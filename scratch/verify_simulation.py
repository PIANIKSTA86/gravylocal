import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

emp_id = 'vsu8bz83547sxrn'
settlement_date = '2026-09-15'
sem_start = '2026-07-01'

# 1. Sem Lines in payroll_lines
sem_prima = c.execute("""
    SELECT SUM(pl.prima)
    FROM payroll_lines pl
    JOIN payroll_periods pp ON pp.id = pl.period_id
    WHERE pl.employee_id = ? AND pp.date_from >= ? AND pp.date_from <= ?
""", (emp_id, sem_start, settlement_date)).fetchone()[0] or 0

# 2. Ledger balance in tx_lines for 26102001
acct_id = 'e7shjbscesldjnm' # 26102001
tx_data = c.execute("""
    SELECT SUM(tl.credit), SUM(tl.debit)
    FROM tx_lines tl
    WHERE tl.account_id = ? AND tl.third_party_id = ?
""", (acct_id, emp_id)).fetchone()

cred = tx_data[0] or 0
deb = tx_data[1] or 0
ledger_balance = cred - deb

# Hybrid prima
prima_final = min(sem_prima, ledger_balance) if ledger_balance > 0 else sem_prima

# CST liquidation value for 75 days
base_prest = 2423095.0
dias_prima = 75
prima_liquidada = round((base_prest * dias_prima) / 360, 2)

print(f"Semestre Evaluado: {sem_start} a {settlement_date}")
print(f"Prima provisionada en nómina semestre 2: ${sem_prima:,.2f}")
print(f"Créditos en libro mayor (26102001): ${cred:,.2f}")
print(f"Débitos por pago prima junio (26102001): ${deb:,.2f}")
print(f"Saldo real en libro mayor (26102001): ${ledger_balance:,.2f}")
print(f"Provisión acumulada asignada (Híbrido): ${prima_final:,.2f}")
print(f"Prima a liquidar (75 días): ${prima_liquidada:,.2f}")
diff = prima_liquidada - prima_final
print(f"Diferencia (Liquidado - Provisión): ${diff:,.2f} -> {'Subprovisión al gasto (normal)' if diff > 0 else 'Sobreprovisión'}")
