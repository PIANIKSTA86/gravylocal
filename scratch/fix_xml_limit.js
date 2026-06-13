const pbUrl = 'http://127.0.0.1:8090';

async function run() {
  try {
    const login = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    });
    const { token } = await login.json();
    const headers = { 
      'Authorization': token,
      'Content-Type': 'application/json'
    };

    // 1. Fetch current collection schema
    const res = await fetch(`${pbUrl}/api/collections/einvoice_docs`, { headers });
    const collection = await res.json();
    
    // 2. Modify max limit for xml_content
    const xmlField = collection.fields.find(f => f.name === 'xml_content');
    if (xmlField) {
      xmlField.max = 1000000;
      console.log("Found xml_content field. Setting max to 1000000...");
    } else {
      console.log("xml_content field not found in collection!");
      return;
    }

    // 3. Update the collection schema
    const updateRes = await fetch(`${pbUrl}/api/collections/einvoice_docs`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(collection)
    });

    if (updateRes.ok) {
      console.log("Collection schema updated successfully! xml_content limit is now 1,000,000 characters.");
    } else {
      console.error("Failed to update schema:", await updateRes.json());
    }
  } catch (err) {
    console.error(err);
  }
}
run();
