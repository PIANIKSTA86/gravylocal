(async () => {
  const res = await fetch('http://127.0.0.1:8094/api/ph/integrity-check');
  const d = await res.json();
  console.log('Endpoint 8094:', 'unitsCount:', d.unitsCount, 'mismatchedCount:', d.mismatchedCount, 'dif:', d.diferenciaGlobal);
  console.log('Codes in endpoint mismatches:');
  console.log(d.mismatches.map(m => m.code).join(', '));
})();

