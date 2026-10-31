const fs = require('fs');

const files = [
  'pb_hooks/reports_optimized.pb.js',
  'empresas/empresa_8094/pb_hooks/reports_optimized.pb.js'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // Replace ($apis.requestInfo(c) ? $apis.requestInfo(c).query : {}) || {} with safe extraction
  code = code.replaceAll(
    'const queryParams = ($apis.requestInfo(c) ? $apis.requestInfo(c).query : {}) || {};',
    'let queryParams = {};\n  try {\n    if (c && typeof c.requestInfo === "function") {\n      queryParams = c.requestInfo().query || {};\n    }\n  } catch (_) {}\n  if (!queryParams) queryParams = {};'
  );

  // Replace authRecord extraction to avoid calling $apis.requestInfo(c)
  code = code.replaceAll(
    'const authRecord = c.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(c).authRecord : null);',
    'let authRecord = null;\n  try {\n    if (c && c.auth) authRecord = c.auth;\n    else if (c && typeof c.requestInfo === "function") {\n      const ri = c.requestInfo();\n      authRecord = ri ? (ri.auth || ri.authRecord) : null;\n    }\n  } catch (_) {}'
  );

  fs.writeFileSync(file, code, 'utf8');
  console.log(`Updated ${file}`);
}
