const http = require('http');

http.get('http://127.0.0.1:8092/api/collections/settings/records', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Settings in 8092:');
      json.items.forEach(item => {
        console.log(`Key: ${item.key}, Value: ${item.value}`);
      });
    } catch (e) {
      console.log('Error parsing:', e.message, data);
    }
  });
}).on('error', err => console.error(err));
