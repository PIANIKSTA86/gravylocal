const http = require('http');

http.get('http://127.0.0.1:8090/api/files/pbc_4092854851/hg26gps5q3v0ljg/pared_acari_lixvdl166b.jpeg', res => {
  console.log("Direct file HTTP status on 8090:", res.statusCode);
  console.log("Content-Type:", res.headers['content-type']);
  console.log("Content-Length:", res.headers['content-length']);
});

http.get('http://127.0.0.1:8090/api/files/products/hg26gps5q3v0ljg/pared_acari_lixvdl166b.jpeg', res => {
  console.log("products file HTTP status on 8090:", res.statusCode);
});
