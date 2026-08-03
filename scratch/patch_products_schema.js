const pbUrl = 'http://127.0.0.1:8090';

async function tryAuth(url, identity, password) {
  try {
    const res = await fetch(`${pbUrl}/api/${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity, password })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.token) return data.token;
    }
  } catch (e) {
    // Ignore error
  }
  return null;
}

async function run() {
  const credentials = [
    { url: 'admins/auth-with-password', id: 'test2@admin.com', pass: 'test123456' },
    { url: 'admins/auth-with-password', id: 'admin@gravy.com', pass: 'admin123456' },
    { url: 'admins/auth-with-password', id: 'admin@gravy.com', pass: 'admin' },
    { url: 'collections/_superusers/auth-with-password', id: 'test2@admin.com', pass: 'test123456' },
    { url: 'collections/_superusers/auth-with-password', id: 'admin@gravy.com', pass: 'admin123456' },
    { url: 'collections/_superusers/auth-with-password', id: 'admin@gravy.com', pass: 'admin' }
  ];

  let token = null;
  for (const cred of credentials) {
    token = await tryAuth(cred.url, cred.id, cred.pass);
    if (token) {
      console.log(`Authenticated successfully!`);
      break;
    }
  }

  if (!token) {
    console.error("Auth failed");
    return;
  }

  // Fetch products collection
  const colRes = await fetch(`${pbUrl}/api/collections/products`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (!colRes.ok) {
    console.error("Could not fetch products collection", await colRes.text());
    return;
  }

  const collection = await colRes.json();
  const isV23 = Array.isArray(collection.fields);
  const schemaArray = isV23 ? collection.fields : collection.schema;

  let changed = false;

  const hasMin = schemaArray.some(f => f.name === 'stock_min');
  if (!hasMin) {
    console.log("Adding stock_min field...");
    schemaArray.push({
      name: 'stock_min',
      type: 'number',
      min: 0,
      max: null,
      onlyInt: false,
      required: false,
      hidden: false,
      system: false
    });
    changed = true;
  } else {
    console.log("stock_min field already exists");
  }

  const hasMax = schemaArray.some(f => f.name === 'stock_max');
  if (!hasMax) {
    console.log("Adding stock_max field...");
    schemaArray.push({
      name: 'stock_max',
      type: 'number',
      min: 0,
      max: null,
      onlyInt: false,
      required: false,
      hidden: false,
      system: false
    });
    changed = true;
  } else {
    console.log("stock_max field already exists");
  }

  if (changed) {
    const updateRes = await fetch(`${pbUrl}/api/collections/products`, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(isV23 ? { fields: schemaArray } : { schema: schemaArray })
    });
    if (updateRes.ok) {
      console.log("Successfully updated products collection schema with stock_min and stock_max!");
    } else {
      console.error("Failed to update schema:", await updateRes.text());
    }
  } else {
    console.log("No changes needed.");
  }
}

run();
