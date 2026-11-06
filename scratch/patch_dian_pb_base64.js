const fs = require('fs');

const dianFiles = [
  'pb_hooks/dian.pb.js',
  'empresas/pb_hooks/dian.pb.js',
  'empresas/empresa_8091/pb_hooks/dian.pb.js',
  'empresas/empresa_8092/pb_hooks/dian.pb.js',
  'empresas/empresa_8093/pb_hooks/dian.pb.js',
  'empresas/empresa_8094/pb_hooks/dian.pb.js'
];

dianFiles.forEach((file) => {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf8');

  // Add format: "base64" to generate-pdf payload
  c = c.replace(
    'isNomina: true,\n        payrollData: payrollData',
    'isNomina: true,\n        format: "base64",\n        payrollData: payrollData'
  );
  c = c.replace(
    'isNomina: true,\r\n        payrollData: payrollData',
    'isNomina: true,\r\n        format: "base64",\r\n        payrollData: payrollData'
  );

  // Replace reading raw with JSON parsing of base64
  const oldRespHandling = `    if (pdfRes.statusCode === 200) {
      const pdfB64 = $security.base64Encode(pdfRes.raw);
      return e.json(200, {
        success: true,
        pdfBase64: pdfB64,
        filename: filename
      });
    }`;
  const oldRespHandlingCRLF = oldRespHandling.replace(/\n/g, '\r\n');

  const newRespHandling = `    if (pdfRes.statusCode === 200) {
      const data = JSON.parse(pdfRes.raw);
      if (data.success && data.pdfBase64) {
        return e.json(200, {
          success: true,
          pdfBase64: data.pdfBase64,
          filename: filename
        });
      }
    }`;
  const newRespHandlingCRLF = newRespHandling.replace(/\n/g, '\r\n');

  if (c.includes(oldRespHandling)) {
    c = c.replace(oldRespHandling, newRespHandling);
  } else if (c.includes(oldRespHandlingCRLF)) {
    c = c.replace(oldRespHandlingCRLF, newRespHandlingCRLF);
  }

  fs.writeFileSync(file, c, 'utf8');
  console.log('Updated ' + file);
});

console.log('Done patching dian.pb.js');

