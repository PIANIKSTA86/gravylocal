const url = 'http://127.0.0.1:8088/api/dian/sign-and-send';

async function testSimulated() {
  console.log("Testing simulated mode (no cert)...");
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        xmlContent: '<?xml version="1.0" encoding="UTF-8"?><Invoice><!-- SIGNATURE_PLACEHOLDER --></Invoice>',
        documentType: 'Invoice',
        documentNumber: '123',
        dianNit: '900123456',
        dianEnvironment: '2'
      })
    });
    console.log("Simulated mode status:", res.status);
    const data = await res.json();
    console.log("Simulated mode response success:", data.success);
  } catch (e) {
    console.error("Simulated mode error:", e.message);
  }
}

async function testRealInvalidCert() {
  console.log("Testing real mode with invalid base64 cert...");
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        xmlContent: '<?xml version="1.0" encoding="UTF-8"?><Invoice><!-- SIGNATURE_PLACEHOLDER --></Invoice>',
        certBase64: 'INVALID_BASE64_DATA',
        certPassword: 'password',
        documentType: 'Invoice',
        documentNumber: '124',
        dianNit: '900123456',
        dianEnvironment: '2'
      })
    });
    console.log("Real mode invalid cert status:", res.status);
    const data = await res.json();
    console.log("Real mode invalid cert response:", data);
  } catch (e) {
    console.error("Real mode invalid cert error:", e.message);
  }
}

async function run() {
  await testSimulated();
  await testRealInvalidCert();
  
  // Check if port 8088 is still alive
  console.log("Checking if orchestrator is still alive...");
  try {
    const res = await fetch('http://127.0.0.1:8088/api/dian/download-zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xmlContent: '<test/>', filename: 'test' })
    });
    console.log("Orchestrator is alive, status of download-zip:", res.status);
  } catch (e) {
    console.error("Orchestrator seems DEAD:", e.message);
  }
}

run();
