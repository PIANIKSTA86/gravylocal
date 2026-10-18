const fs = require('fs');

const content = fs.readFileSync('c:\\Users\\JULIAN\\Desktop\\GravyLocalTABS\\pb_hooks\\dian.pb.js', 'utf8');

const idx = content.indexOf("routerAdd('POST', '/api/dian/check-status'");
const reqIdx = content.indexOf("e.requestInfo", idx);
console.log(content.slice(reqIdx - 50, reqIdx + 2000));
