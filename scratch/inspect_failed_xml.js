const pbUrl = 'http://127.0.0.1:8090';

async function run() {
  try {
    const login = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    });
    const { token } = await login.json();
    const headers = { 'Authorization': token };

    const res = await fetch(`${pbUrl}/api/collections/einvoice_docs/records?perPage=15`, { headers });
    const data = await res.json();
    console.log("=== RECENT PROCESSED DOCUMENTS ===");
    data.items.forEach(doc => {
      console.log(`\nDocument ID: ${doc.id}`);
      console.log(`  Status: ${doc.status}`);
      console.log(`  Response: ${doc.dian_response}`);
      console.log(`  Sent At: ${doc.sent_at}`);
      if (doc.xml_content) {
        const root = doc.xml_content.match(/<(FACTURA|NOTA)>/)?.[0];
        const enc1 = doc.xml_content.match(/<ENC_1>(.*?)<\/ENC_1>/)?.[1];
        const enc6 = doc.xml_content.match(/<ENC_6>(.*?)<\/ENC_6>/)?.[1];
        const ipv1 = doc.xml_content.match(/<IPV_1>(.*?)<\/IPV_1>/)?.[1];
        const drf1 = doc.xml_content.match(/<DRF_1>(.*?)<\/DRF_1>/)?.[1];
        const drf4 = doc.xml_content.match(/<DRF_4>(.*?)<\/DRF_4>/)?.[1];
        console.log(`  XML Root: ${root}`);
        console.log(`  ENC_1 (Doc Type): ${enc1}`);
        console.log(`  ENC_6 (Number): ${enc6}`);
        console.log(`  IPV_1 (Res Num): ${ipv1}`);
        console.log(`  DRF_1 (Res Num): ${drf1}`);
        console.log(`  DRF_4 (Prefix): ${drf4}`);
      } else {
        console.log(`  XML Content: [EMPTY]`);
      }
    });
  } catch (err) {
    console.error(err);
  }
}
run();
