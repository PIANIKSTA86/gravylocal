async function test() {
  try {
    const res = await fetch('http://127.0.0.1:8090/api/collections/dian_resolutions/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resolution_number: "123",
        document_type: "NC",
        prefix: "NC",
        resolution_date: "2026-06-07 10:00:00Z",
        expiration_date: "2027-06-07 10:00:00Z",
        number_from: 1,
        number_to: 100,
        current_number: 1,
        active: true
      })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
