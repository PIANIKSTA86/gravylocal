// Test the dryRun mode to see what XML gets generated for FV-00003749
const loginAndEmit = async () => {
  const API_BASE = 'http://127.0.0.1:8090';
  
  // Try to log in as a user instead of admin
  const identities = [
    { identity: 'admin@gravy.com', password: 'admin' },
    { identity: 'admin@gravy.com', password: 'admin123456' },
    { identity: 'admin@gravy.com', password: 'Domestiko123*' },
  ];

  let token = '';
  // Try admin API first
  for (const cred of identities) {
    try {
      const loginRes = await fetch(`${API_BASE}/api/admins/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cred)
      });
      if (loginRes.status === 200) {
        const data = await loginRes.json();
        token = data.token;
        console.log(`Logged in as admin with ${cred.identity}`);
        break;
      }
    } catch(e) {}
  }

  // Try users collection
  if (!token) {
    const userCreds = [
      { identity: 'admin@gravy.com', password: 'admin' },
      { identity: 'admin@gravy.com', password: 'Domestiko123*' },
    ];
    for (const cred of userCreds) {
      try {
        const loginRes = await fetch(`${API_BASE}/api/collections/users/auth-with-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cred)
        });
        if (loginRes.status === 200) {
          const data = await loginRes.json();
          token = data.token;
          console.log(`Logged in as user with ${cred.identity}`);
          break;
        }
      } catch(e) {}
    }
  }

  if (!token) {
    console.error("Could not authenticate. Try checking the credentials.");
    return;
  }

  console.log("Calling emit with dryRun for FV-00003749 (txId: x8tfl0c9ul9dvsm)...");
  try {
    const res = await fetch(`${API_BASE}/api/dian/emit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ txId: 'x8tfl0c9ul9dvsm', dryRun: true })
    });
    console.log("HTTP Status:", res.status);
    if (res.status === 200) {
      const body = await res.json();
      console.log("Generated XML:");
      // print just the ADQ section
      const adqMatch = body.xml ? body.xml.match(/<ADQ>([\s\S]*?)<\/ADQ>/) : null;
      if (adqMatch) {
        console.log("ADQ Block:", adqMatch[0]);
      } else {
        console.log("Full XML:", body.xml?.substring(0, 2000));
      }
    } else {
      const text = await res.text();
      console.log("Error:", text);
    }
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
};

loginAndEmit();
