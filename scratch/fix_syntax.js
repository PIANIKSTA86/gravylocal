const fs = require('fs');

const files = [
  'pb_hooks/reports_optimized.pb.js',
  'empresas/empresa_8094/pb_hooks/reports_optimized.pb.js'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  code = code.replace(
    'routerAdd("GET", "/api/gravy/report-auxiliary", (c) => {\n  try {\n    let authRecord',
    'routerAdd("GET", "/api/gravy/report-auxiliary", (c) => {\n  let authRecord'
  );

  fs.writeFileSync(file, code, 'utf8');
}
console.log('Fixed syntax error in reports_optimized.pb.js');

