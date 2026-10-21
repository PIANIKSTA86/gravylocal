const http = require('http');

// Get all documents and check their items
http.get('http://127.0.0.1:8092/api/collections/electronic_documents/records', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Doc records length/data:', data.slice(0, 300));
  });
});
