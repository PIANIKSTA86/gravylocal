async function testEmit() {
  try {
    const res = await fetch('http://127.0.0.1:8091/api/dian/emit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txId: 'e7at7ig46055tsl' })
    });
    const data = await res.json();
    console.log('HTTP status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testEmit();
