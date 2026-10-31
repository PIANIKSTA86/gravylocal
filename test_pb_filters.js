async function testPurFilter() {
  const authRes = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test@admin.com', password: '1234567890' })
  });
  const authData = await authRes.json();
  const token = authData.token;

  // Test resolutions
  const resCol = await fetch('http://127.0.0.1:8090/api/collections/dian_resolutions/records?filter=' + encodeURIComponent('active=true && (document_type="DS" || document_type="NDS")'), { headers: { Authorization: 'Bearer ' + token } });
  const dataCol = await resCol.json();
  console.log('dian_resolutions status:', resCol.status, 'items:', dataCol.items?.length);

  // Test purchase_invoices with purFilter
  const filter = 'number ~ "DS" || number ~ "NDS" || tx_type_id.code="DS" || tx_type_id.code="NDS" || number ~ "DSE" || tx_type_id.prefix="DSE"';
  const url = 'http://127.0.0.1:8090/api/collections/purchase_invoices/records?filter=' + encodeURIComponent(filter);
  const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  const data = await res.json();
  console.log('purchase_invoices status:', res.status, data);

  // Test support_documents
  const suppRes = await fetch('http://127.0.0.1:8090/api/collections/support_documents/records?expand=supplier_id,tx_type_id,cost_center_id', { headers: { Authorization: 'Bearer ' + token } });
  const suppData = await suppRes.json();
  console.log('support_documents status:', suppRes.status, 'items:', suppData.items?.length);
}

testPurFilter();

