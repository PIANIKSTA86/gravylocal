const fs = require('fs');
const path = require('path');

// 1. Patch dashboard_summary.pb.js
const dashFiles = [
  'pb_hooks/dashboard_summary.pb.js',
  'empresas/pb_hooks/dashboard_summary.pb.js',
  'empresas/empresa_8091/pb_hooks/dashboard_summary.pb.js',
  'empresas/empresa_8092/pb_hooks/dashboard_summary.pb.js',
  'empresas/empresa_8093/pb_hooks/dashboard_summary.pb.js',
  'empresas/empresa_8094/pb_hooks/dashboard_summary.pb.js'
];

for (const f of dashFiles) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');

  // Replace CxC query in dashboard_summary
  content = content.replace(
    /AND\s+a\.code\s+LIKE\s+'13%'\s+AND\s+\(a\.maneja_cruce\s*=\s*1\s+OR\s+TRIM\(COALESCE\(l\.cross_doc_ref,\s*''\)\)\s*!=\s*''\)/g,
    "AND (a.code LIKE '1305%' OR (a.code LIKE '13%' AND (a.requires_third_party = 1 OR a.requires_third_party = 'true') AND (a.maneja_cruce = 1 OR a.maneja_cruce = 'true')))"
  );

  // Replace CxP query in dashboard_summary
  content = content.replace(
    /AND\s+\(a\.code\s+LIKE\s+'22%'\s+OR\s+a\.code\s+LIKE\s+'23%'\s+OR\s+a\.code\s+LIKE\s+'25%'\)\s+AND\s+\(a\.maneja_cruce\s*=\s*1\s+OR\s+TRIM\(COALESCE\(l\.cross_doc_ref,\s*''\)\)\s*!=\s*''\)/g,
    "AND (a.code LIKE '2205%' OR ((a.code LIKE '22%' OR a.code LIKE '23%' OR a.code LIKE '25%') AND (a.requires_third_party = 1 OR a.requires_third_party = 'true') AND (a.maneja_cruce = 1 OR a.maneja_cruce = 'true')))"
  );

  fs.writeFileSync(f, content, 'utf8');
  console.log('Patched dashboard_summary:', f);
}

// 2. Synchronize reports_optimized.pb.js from pb_hooks to all empresas
const repSource = 'pb_hooks/reports_optimized.pb.js';
const repTargets = [
  'empresas/pb_hooks/reports_optimized.pb.js',
  'empresas/empresa_8091/pb_hooks/reports_optimized.pb.js',
  'empresas/empresa_8092/pb_hooks/reports_optimized.pb.js',
  'empresas/empresa_8093/pb_hooks/reports_optimized.pb.js',
  'empresas/empresa_8094/pb_hooks/reports_optimized.pb.js'
];

const repContent = fs.readFileSync(repSource, 'utf8');
for (const t of repTargets) {
  if (fs.existsSync(path.dirname(t))) {
    fs.writeFileSync(t, repContent, 'utf8');
    console.log('Synchronized reports_optimized to:', t);
  }
}

