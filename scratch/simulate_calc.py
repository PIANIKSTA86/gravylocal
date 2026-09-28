import sqlite3

# Datos de las líneas en la imagen del usuario:
# Línea 1: qty=806.4, fob=10.92, peso=3500, cbm=25.2
# Línea 2: qty=864.0, fob=3.01, peso=3450, cbm=27.0
# Línea 3: qty=806.4, fob=2.90, peso=15512, cbm=25.2
# Línea 4: qty=576.0, fob=?, peso=2500, cbm=18.0
# Línea 5: qty=748.8, fob=?, peso=3250, cbm=23.4
# Línea 6: qty=172.8, fob=?, peso=750, cbm=5.4

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
c.execute("SELECT id, product_id, qty, fob_price, peso_bruto_total, cubic_meters_total FROM import_lines WHERE import_id = 'zva62hh26xjxn50'")
lines = c.fetchall()

inverseFobCOP = 56232315.072
effectiveTrm = 3144.14

print("Calculando según fórmula del frontend...")
totalFOB_USD = inverseFobCOP / effectiveTrm
print(f"FOB total en USD contable = {totalFOB_USD:.2f}")

totalMetric = sum(l[2] * l[3] for l in lines)
print(f"TotalMetric con fob_price actual = {totalMetric}")

for l in lines:
    rawFob = l[2] * l[3]
    ratio = rawFob / totalMetric
    lineFobCop = ratio * inverseFobCOP
    fobUSD = (lineFobCop / l[2]) / effectiveTrm
    print(f"Línea {l[0]}: qty={l[2]}, current_fob={l[3]}, ratio={ratio:.4f}, calc_fob={fobUSD:.2f}")
