async function run() {
  try {
    const res = await fetch('http://127.0.0.1:8090/api/collections/settings/records?perPage=100');
    const data = await res.json();
    console.log("=== SETTINGS ===");
    for (const record of data.items || []) {
      console.log(`${record.key}: ${record.value}`);
    }

    const res3 = await fetch('http://127.0.0.1:8090/api/collections/third_parties/records?perPage=100');
    const data3 = await res3.json();
    console.log("\n=== THIRD PARTIES ===");
    for (const record of data3.items || []) {
      console.log(`ID: ${record.id}, Name: ${record.name}, DocType: ${record.doc_type}, DocNum: ${record.doc_number}, DV: ${record.dv}`);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
