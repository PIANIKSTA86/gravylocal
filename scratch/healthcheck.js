const http = require('http');

http.get('http://127.0.0.1:8088/api/orchestrate/companies', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Orchestrator companies status:', res.statusCode, data));
}).on('error', err => console.error('Orchestrator error:', err.message));

http.get('http://127.0.0.1:8092/api/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('PocketBase 8092 health:', res.statusCode, data));
}).on('error', err => console.error('PocketBase error:', err.message));
