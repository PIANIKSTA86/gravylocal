async function testHealth() {
  try {
    const res = await fetch('http://127.0.0.1:8090/api/health');
    console.log('Health status:', res.status);
    const data = await res.json();
    console.log('Health data:', data);
  } catch (e) {
    console.log('Health error:', e.message);
  }
}

testHealth();
