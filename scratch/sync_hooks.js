const fs = require('fs');
const path = require('path');

const src = path.resolve('pb_hooks', 'ph_email.pb.js');
const destinations = [
  path.resolve('empresas', 'empresa_8091', 'pb_hooks', 'ph_email.pb.js'),
  path.resolve('empresas', 'empresa_8092', 'pb_hooks', 'ph_email.pb.js'),
  path.resolve('empresas', 'empresa_8093', 'pb_hooks', 'ph_email.pb.js'),
  path.resolve('empresas', 'empresa_8094', 'pb_hooks', 'ph_email.pb.js'),
  path.resolve('empresas', 'pb_hooks', 'ph_email.pb.js')
];

const content = fs.readFileSync(src, 'utf8');

destinations.forEach(dst => {
  const dir = path.dirname(dst);
  if (fs.existsSync(dir)) {
    fs.writeFileSync(dst, content, 'utf8');
    console.log(`Copied successfully to ${dst}`);
  } else {
    console.log(`Directory does not exist: ${dir}`);
  }
});
