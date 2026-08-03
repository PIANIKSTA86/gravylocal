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

  // Find the ftech_password setting record
  const res = await fetch(`${pbUrl}/api/collections/settings/records?filter=key="ftech_password"`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  if (!data.items || !data.items.length) {
    console.error("ftech_password setting not found");
    return;
  }

  const record = data.items[0];
  console.log(`Current setting: id=${record.id}, key=${record.key}, value=${record.value}`);

  // Update value to "mock"
  const updateRes = await fetch(`${pbUrl}/api/collections/settings/records/${record.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ value: 'mock' })
  });

  if (updateRes.ok) {
    const updated = await updateRes.json();
    console.log(`Setting updated successfully! New value: ${updated.value}`);
  } else {
    console.error("Failed to update setting", await updateRes.json());
  }
}

run();
