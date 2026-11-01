const http = require('http');

[8090, 8091, 8092, 8093, 8094].forEach(port => {
  http.get(`http://127.0.0.1:${port}/api/collections/settings/records?filter=key~'matias'`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(`Port ${port} status:`, res.statusCode, 'Data:', data));
  }).on('error', err => console.log(`Port ${port} error:`, err.message));
});

