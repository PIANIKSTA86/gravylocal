async function test() {
  const baseUrl = 'http://127.0.0.1:8090'; // Default PocketBase port
  
  const queries = [
    {
      name: 'Stock',
      url: `${baseUrl}/api/collections/inventory_stock/records?perPage=5`
    },
    {
      name: 'Purchase Lines',
      url: `${baseUrl}/api/collections/purchase_invoice_lines/records?perPage=5&expand=invoice_id,invoice_id.supplier_id`
    },
    {
      name: 'Sales Lines Relation Filter',
      url: `${baseUrl}/api/collections/invoice_lines/records?perPage=5&filter=invoice_id.status%3D%22posted%22%20%26%26%20invoice_id.date%20%3E%3D%20%222026-06-03%22`
    }
  ];

  for (const q of queries) {
    try {
      const res = await fetch(q.url);
      const data = await res.json();
      console.log(`Query: ${q.name} | Status: ${res.status}`);
      if (!res.ok) {
        console.error(JSON.stringify(data, null, 2));
      } else {
        console.log(`Success, found ${data.items?.length || 0} items`);
      }
    } catch (err) {
      console.error(`Failed to fetch ${q.name}:`, err.message);
    }
  }
}

test();
