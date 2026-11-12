(async () => {
  for (const p of ['8091', '8092', '8093', '8094']) {
    try {
      const res = await fetch('http://127.0.0.1:' + p + '/api/ph/integrity-check');
      const d = await res.json();
      console.log('Port ' + p + ':', 'unitsCount:', d.unitsCount, 'mismatchedCount:', d.mismatchedCount, 'dif:', d.diferenciaGlobal, 'ok:', d.ok);
      if (d.mismatches && d.mismatches.length > 0) {
        console.log('Sample mismatch port ' + p + ':', d.mismatches.slice(0, 3));
      }
    } catch (e) {
      console.log('Port ' + p + ': offline/err -', e.message);
    }
  }
})();

