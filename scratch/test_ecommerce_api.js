const http = require('http');

http.get('http://127.0.0.1:8090/api/public/ecommerce/products', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const products = JSON.parse(data);
      console.log('Total products returned:', products.length);
      const withImg = products.filter(p => p.imageUrl && p.imageUrl.trim() !== '');
      console.log('Products WITH imageUrl:', withImg.length);
      const withoutImg = products.filter(p => !p.imageUrl || p.imageUrl.trim() === '');
      console.log('Products WITHOUT imageUrl:', withoutImg.length);
      
      console.log('\nFirst 5 products:');
      products.slice(0, 5).forEach(p => {
        console.log(`- [${p.code}] ${p.name}: imageUrl="${p.imageUrl}"`);
      });

      console.log('\nFirst 5 products that HAVE imageUrl:');
      withImg.slice(0, 5).forEach(p => {
        console.log(`- [${p.code}] ${p.name}: imageUrl="${p.imageUrl}"`);
      });
    } catch (e) {
      console.error('Failed to parse:', e, data.substring(0, 200));
    }
  });
}).on('error', err => {
  console.error('HTTP Error:', err.message);
});
