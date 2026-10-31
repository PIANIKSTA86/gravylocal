const fs = require('fs');
const path = require('path');

const srcHook = path.resolve('pb_hooks', 'dian.pb.js');
if (!fs.existsSync(srcHook)) {
  console.error("Source hook not found:", srcHook);
  process.exit(1);
}

const content = fs.readFileSync(srcHook, 'utf8');

const targets = [
  path.resolve('empresas', 'empresa_8091', 'pb_hooks', 'dian.pb.js'),
  path.resolve('empresas', 'empresa_8092', 'pb_hooks', 'dian.pb.js'),
  path.resolve('empresas', 'empresa_8093', 'pb_hooks', 'dian.pb.js'),
  path.resolve('empresas', 'empresa_8094', 'pb_hooks', 'dian.pb.js'),
];

targets.forEach(target => {
  const dir = path.dirname(target);
  if (fs.existsSync(dir)) {
    fs.writeFileSync(target, content, 'utf8');
    console.log(`[+] Propagado con éxito a: ${target}`);
  } else {
    console.warn(`[-] Carpeta destino no existe: ${dir}`);
  }
});

console.log("[OK] Propagación completa.");

