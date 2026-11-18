const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const srcHooks = path.join(ROOT, 'pb_hooks');
const empresasDir = path.join(ROOT, 'empresas');

const filesToSync = [
  'migrate_dian.pb.js',
  'dian_mailer.js',
  'dian.pb.js',
  'ph_email.pb.js'
];

const entries = fs.readdirSync(empresasDir);
entries.forEach(entry => {
  if (entry.startsWith('empresa_')) {
    const destHooks = path.join(empresasDir, entry, 'pb_hooks');
    if (fs.existsSync(destHooks)) {
      filesToSync.forEach(f => {
        const srcFile = path.join(srcHooks, f);
        const destFile = path.join(destHooks, f);
        if (fs.existsSync(srcFile)) {
          fs.copyFileSync(srcFile, destFile);
          console.log(`Synced ${f} -> ${entry}/pb_hooks`);
        }
      });
    }
  }
});
console.log("All tenant pb_hooks successfully synchronized!");
