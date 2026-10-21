const http = require('http');

const req = http.request('http://127.0.0.1:8092/api/collections/users/auth-with-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const auth = JSON.parse(data);
      if (auth.token) {
        http.get('http://127.0.0.1:8092/api/collections/electronic_documents/records', {
          headers: { 'Authorization': auth.token }
        }, (res2) => {
          let data2 = '';
          res2.on('data', c2 => data2 += c2);
          res2.on('end', () => {
            const list = JSON.parse(data2);
            console.log('Total electronic documents:', list.totalItems);
            list.items.forEach(d => console.log(` * ${d.number} - ${d.supplier_name} - $${d.total} (${d.status})`));
          });
        });
      } else {
        console.log('Auth response:', data);
      }
    } catch (e) {
      console.log('Error:', e.message, data);
    }
  });
});

req.write(JSON.stringify({ identity: 'admin@gravy.com', password: 'password123' }));
req.end();
