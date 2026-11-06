const fs = require('fs');

const files = [
  'pb_hooks/dian.pb.js',
  'empresas/pb_hooks/dian.pb.js',
  'empresas/empresa_8091/pb_hooks/dian.pb.js',
  'empresas/empresa_8092/pb_hooks/dian.pb.js',
  'empresas/empresa_8093/pb_hooks/dian.pb.js',
  'empresas/empresa_8094/pb_hooks/dian.pb.js',
  'pb_hooks/dian_mailer.js',
  'empresas/pb_hooks/dian_mailer.js',
  'empresas/empresa_8091/pb_hooks/dian_mailer.js',
  'empresas/empresa_8092/pb_hooks/dian_mailer.js',
  'empresas/empresa_8093/pb_hooks/dian_mailer.js',
  'empresas/empresa_8094/pb_hooks/dian_mailer.js'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/key ~ 'payroll_accounting_config_v1_employee_rules%'/g, "key ~ 'payroll_accounting_config_v1_employee_rules'");
  fs.writeFileSync(f, c);
  console.log('Fixed ' + f);
});
