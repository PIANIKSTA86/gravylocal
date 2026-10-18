const fs = require('fs');

const content = fs.readFileSync('c:\\Users\\JULIAN\\Desktop\\GravyLocalTABS\\pb_hooks\\dian.pb.js', 'utf8');

function inspectRoute(name, startPattern) {
  const idx = content.indexOf(startPattern);
  if (idx !== -1) {
    console.log(`\n================ ROUTE: ${name} ================`);
    console.log(content.slice(idx, idx + 2000));
  } else {
    console.log(`Route ${name} not found with pattern ${startPattern}`);
  }
}

inspectRoute('check-status', "routerAdd('POST', '/api/dian/check-status'");
inspectRoute('nomina/check-status', "routerAdd('POST', '/api/dian/nomina/check-status'");
inspectRoute('nomina/emit', "routerAdd('POST', '/api/dian/nomina/emit'");
