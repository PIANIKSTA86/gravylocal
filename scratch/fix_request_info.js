const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '..', 'pb_hooks', 'reports_optimized.pb.js'),
  path.join(__dirname, '..', 'empresas', 'empresa_8094', 'pb_hooks', 'reports_optimized.pb.js')
];

for (const f of files) {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    // Reemplazar c.requestInfo().query por ($apis.requestInfo(c) ? $apis.requestInfo(c).query : {})
    content = content.replace(/c\.requestInfo\(\)\.query/g, '($apis.requestInfo(c) ? $apis.requestInfo(c).query : {})');
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed c.requestInfo in', f);
  }
}

