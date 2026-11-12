const http = require('http');
http.get('http://127.0.0.1:8090/api/health', (res) => {
  console.log('Status code:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Body:', data));
}).on('error', (e) => {
  console.error('Error connecting:', e.message);
});

