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

  const hasManifest = schemaArray.some(f => f.name === 'manifest_pdf');
  if (!hasManifest) {
    console.log("Adding manifest_pdf field...");
    schemaArray.push({
      name: 'manifest_pdf',
      type: 'file',
      maxSelect: 1,
      maxSize: 10485760, // 10MB
      thumbs: [],
      mimeTypes: ["application/pdf"],
      required: false,
      hidden: false,
      system: false
    });
    changed = true;
  } else {
    console.log("manifest_pdf field already exists");
  }

  const hasImage = schemaArray.some(f => f.name === 'image');
  if (!hasImage) {
    console.log("Adding image field...");
    schemaArray.push({
      name: 'image',
      type: 'file',
      maxSelect: 1,
      maxSize: 5242880, // 5MB
      thumbs: ["100x100", "300x300"],
      mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
      required: false,
      hidden: false,
      system: false
    });
    changed = true;
  } else {
    console.log("image field already exists");
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
      console.log("Successfully updated products collection schema with manifest_pdf and image!");
    } else {
      console.error("Failed to update schema:", await updateRes.text());
    }
  } else {
    console.log("No changes needed.");
  }
}

run();
