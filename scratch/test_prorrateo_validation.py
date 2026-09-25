import sqlite3
import datetime

db_path = 'empresas/empresa_8094/pb_data/data.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

def simulate_prorrateo(period, raw_delivery, base_fee=250000):
    print(f"\n--- Simulación Período {period} | Entrega: {raw_delivery} | Cuota Base: ${base_fee:,.2f} ---")
    if not raw_delivery:
        print("  Sin fecha de entrega -> Facturación ordinaria al 100%: $" + f"{base_fee:,.2f}")
        return base_fee

    delivery_period = raw_delivery[:7]
    if period < delivery_period:
        print(f"  Período {period} es ANTERIOR a entrega ({delivery_period}) -> Factura OMITIDA ($0)")
        return 0

    if period == delivery_period:
        d_year, d_month, d_day = [int(x) for x in raw_delivery.split('-')]
        # Calcular total de días del mes
        if d_month == 12:
            next_month = datetime.date(d_year + 1, 1, 1)
        else:
            next_month = datetime.date(d_year, d_month + 1, 1)
        total_days = (next_month - datetime.date(d_year, d_month, 1)).days
        
        billable_days = total_days if d_day <= 1 else max(1, total_days - d_day)
        prop_factor = min(1.0, max(0.01, billable_days / total_days))
        prorrated_fee = round(base_fee * prop_factor)
        print(f"  MES DE ENTREGA:")
        print(f"    Día de entrega:        {d_day}")
        print(f"    Total días del mes:    {total_days}")
        print(f"    Días computables:      {billable_days}")
        print(f"    Factor de proporción:  {prop_factor:.4f} ({prop_factor*100:.2f}%)")
        print(f"    Cuota resultante:      ${prorrated_fee:,.2f}")
        print(f"    Línea de factura:      CUOTA ADMINISTRACION (Proporcional {billable_days}/{total_days} días - Entrega: {raw_delivery})")
        return prorrated_fee

    print(f"  Período {period} es POSTERIOR a entrega ({delivery_period}) -> Facturación ordinaria al 100%: ${base_fee:,.2f}")
    return base_fee

# Escenario 1: Entrega a mitad de mes (15 de septiembre de 2026 - mes de 30 días)
simulate_prorrateo('2026-09', '2026-09-15', 250000)

# Escenario 2: Período anterior a la entrega
simulate_prorrateo('2026-08', '2026-09-15', 250000)

# Escenario 3: Período posterior a la entrega
simulate_prorrateo('2026-10', '2026-09-15', 250000)

# Escenario 4: Entrega el primer día del mes (1 de agosto de 2026)
simulate_prorrateo('2026-08', '2026-08-01', 250000)

# Escenario 5: Sin fecha de entrega (unidad antigua normal)
simulate_prorrateo('2026-09', None, 250000)

conn.close()
