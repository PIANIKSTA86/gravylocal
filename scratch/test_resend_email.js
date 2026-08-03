const pbUrl = 'http://127.0.0.1:8090';

async function tryAuth() {
  try {
    const res = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    });
    const data = await res.json();
    return data.token;
  } catch (e) {
    console.error("Auth error", e);
  }
  return null;
}

async function run() {
  const token = await tryAuth();
  if (!token) {
    console.error("Failed to authenticate");
    return;
  }

  const txId = 'wid30ti2e2irdtp'; // 4P1C-00000008
  console.log(`Triggering resend-email for Tx ID: ${txId}`);

  const res = await fetch(`${pbUrl}/api/dian/resend-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ txId })
  });

  console.log(`Resend-Email Response Status: ${res.status}`);
  try {
    const data = await res.json();
    console.log("Response JSON:");
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.log("Response text (not JSON):", await res.text());
  }
}

run();
