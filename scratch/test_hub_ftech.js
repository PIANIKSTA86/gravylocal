async function testHubFacturatech() {
  try {
    const hubUrl = "http://127.0.0.1:8088/api/facturatech/upload-and-send";
    console.log("Testing POST to Hub:", hubUrl);
    
    const requestBody = {
      xmlContent: "<Invoice><ID>FV-00003785</ID></Invoice>",
      ftechUsername: "901428834",
      ftechPassword: "8cd4dfbf5b0ddad5e99debcd9d30920a232eedbf8dc3bc0173c4d79dfbf6",
      ftechEnvironment: "1",
      documentType: 'Invoice',
      documentNumber: 'FV-00003785',
      prefix: 'FV',
      folio: '3785',
      isPOS: false,
      isDS: false,
      isNDS: false
    };

    const res = await fetch(hubUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    console.log("Hub HTTP Status:", res.status);
    console.log("Hub HTTP Response:", await res.text());
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

testHubFacturatech();
