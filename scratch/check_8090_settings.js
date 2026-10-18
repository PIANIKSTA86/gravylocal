const fs = require('fs');

// Let's test checking settings using a query via http or reading pb_data directly
async function checkSettings() {
  try {
    const res = await fetch('http://127.0.0.1:8090/api/collections/settings/records?perPage=100');
    if (res.ok) {
      const data = await res.json();
      console.log('Total settings on 8090:', data.totalItems);
      const matiasKeys = data.items.filter(i => i.key.includes('matias') || i.key.includes('einvoice') || i.key.includes('dian') || i.key.includes('ftech'));
      console.log('Matias / Dian settings:');
      matiasKeys.forEach(k => {
        // Obfuscate token for safety
        const val = k.value && k.key.includes('token') ? (k.value.slice(0, 10) + '...' + k.value.slice(-6)) : k.value;
        console.log(` - ${k.key}: ${val}`);
      });
    } else {
      console.log('Response not ok:', res.status, res.statusText);
    }
  } catch (e) {
    console.error('Fetch error:', e.message);
  }
}

checkSettings();
