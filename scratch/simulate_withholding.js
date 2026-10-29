function calculateWithholdingTax(ingresoBruto, health, pension, fsp, uvtValue = 52374, rateOverride = 0) {
  const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  const uvt = uvtValue || 52374;
  const ingresoNeto = Math.max(0, (ingresoBruto || 0) - ((health || 0) + (pension || 0) + (fsp || 0)));
  if (ingresoNeto <= 0) return 0;

  if (rateOverride > 0) {
    return round2(ingresoNeto * rateOverride);
  }

  const rentaExenta25 = Math.min(ingresoNeto * 0.25, ingresoNeto * 0.40);
  const baseGravableCop = Math.max(0, ingresoNeto - rentaExenta25);
  const baseUvt = baseGravableCop / uvt;

  let retencionUvt = 0;
  if (baseUvt <= 95) {
    retencionUvt = 0;
  } else if (baseUvt <= 150) {
    retencionUvt = (baseUvt - 95) * 0.19;
  } else if (baseUvt <= 360) {
    retencionUvt = (baseUvt - 150) * 0.28 + 10;
  } else if (baseUvt <= 640) {
    retencionUvt = (baseUvt - 640) * 0.33 + 69;
  } else if (baseUvt <= 945) {
    retencionUvt = (baseUvt - 640) * 0.35 + 162;
  } else if (baseUvt <= 2300) {
    retencionUvt = (baseUvt - 945) * 0.37 + 268;
  } else {
    retencionUvt = (baseUvt - 2300) * 0.39 + 770;
  }

  return {
    ingresoBruto,
    health,
    pension,
    fsp,
    uvt,
    ingresoNeto,
    rentaExenta25,
    baseGravableCop,
    baseUvt,
    retencionUvt,
    retencionCop: round2(retencionUvt * uvt)
  };
}

// Let's test what UVT was used
console.log('Testing UVT values:');
for (const uvt of [47065, 49799, 52374, 42412]) {
  // Option A: totalEarnings = 8345279.92 (salary + gastos + prima)
  const resA = calculateWithholdingTax(8345279.92, 152605.60, 152605.60, 0, uvt);
  // Option B: salary only = 3815140
  const resB = calculateWithholdingTax(3815140, 152605.60, 152605.60, 0, uvt);
  // Option C: salary + gastos = 4530140
  const resC = calculateWithholdingTax(4530140, 152605.60, 152605.60, 0, uvt);
  // Option D: salary + prima = 7630279.92
  const resD = calculateWithholdingTax(7630279.92, 152605.60, 152605.60, 0, uvt);

  console.log(`UVT ${uvt}:`);
  console.log(`  Opt A (8.345.279,92): ${resA.retencionCop} (baseUvt: ${resA.baseUvt})`);
  console.log(`  Opt B (3.815.140,00): ${resB.retencionCop} (baseUvt: ${resB.baseUvt})`);
  console.log(`  Opt C (4.530.140,00): ${resC.retencionCop} (baseUvt: ${resC.baseUvt})`);
  console.log(`  Opt D (7.630.279,92): ${resD.retencionCop} (baseUvt: ${resD.baseUvt})`);
}

// Let's check if there is an exact match for 200359.09:
console.log('\nReverse engineering exact formula for 200359.09:');
// Notice: 200359.09 / UVT:
for (const uvt of [47065, 49799, 52374]) {
  console.log(`200359.09 / ${uvt} = ${200359.09 / uvt} UVT`);
}

