const http = require('http');

http.get('http://127.0.0.1:8092/api/collections/electronic_documents/records', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`Total electronic_documents in 8092: ${json.totalItems}`);
      json.items.forEach(doc => {
        console.log(` - Doc: ${doc.number} | Supplier: ${doc.supplier_name} (NIT ${doc.supplier_nit}) | Total: $${doc.total} | Date: ${doc.issue_date} | Source: ${doc.reception_source}`);
      });
    } catch (e) {
      console.error(e.message, data);
    }
  });
});
