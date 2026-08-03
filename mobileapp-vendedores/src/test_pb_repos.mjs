import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function test() {
  try {
    const auth = await pb.collection('users').authWithPassword('caldana@gravy.com', '12345678');
    console.log('1. AUTH SUCCESS! User:', auth.record.email);

    // Test third_parties
    const customers = await pb.collection('third_parties').getFullList({
      filter: 'type = "CLIENTE"',
      sort: 'name',
    });
    console.log(`2. CUSTOMERS FETCHED: ${customers.length} clients found.`);
    if (customers.length > 0) {
      console.log('Sample client:', customers[0].name, 'NIT:', customers[0].doc_number);
    }

    // Test invoices
    const invoices = await pb.collection('invoices').getFullList({
      sort: '-due_date',
    });
    console.log(`3. INVOICES FETCHED: ${invoices.length} invoices found.`);

    // Test products
    const products = await pb.collection('products').getFullList({
      filter: 'active = true',
    });
    console.log(`4. PRODUCTS FETCHED: ${products.length} active products found.`);

    // Test branches
    const branches = await pb.collection('branches').getFullList();
    console.log(`5. BRANCHES FETCHED: ${branches.length} branches found.`);

  } catch (err) {
    console.error('ERROR IN TEST:', err?.status, err?.message, err?.data);
  }
}

test();
