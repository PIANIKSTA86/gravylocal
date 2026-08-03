const fetch = globalThis.fetch || require('node-fetch');

async function main() {
  const authRes = await fetch('http://localhost:8090/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@gravy.com', password: '12345678' })
  });
  const authData = await authRes.json();
  const token = authData.token;
  const headers = { 'Content-Type': 'application/json', 'Authorization': token };

  const invRes = await fetch('http://localhost:8090/api/collections/invoices/records/ol3jkzm97rgppfi', {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ number: 'FV-00003765' })
  });
  console.log('Invoices update status:', invRes.status);
  console.log('Invoices update response:', await invRes.json());
}
main();
