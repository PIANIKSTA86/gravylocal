import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function test() {
  try {
    const auth = await pb.collection('users').authWithPassword('caldana@gravy.com', '12345678');
    console.log('1. LOGGED IN AS:', auth.record.email, 'Branch:', auth.record.default_branch_id);

    const branchId = auth.record.default_branch_id || 'eo3d07bscdpb7kd';

    // 1. Customer query (no sort or sort by name)
    const customers = await pb.collection('third_parties').getFullList({
      filter: 'type = "CLIENTE"',
      sort: 'name',
    });
    console.log(`2. CUSTOMERS: ${customers.length} records.`);

    // 2. Invoices query with branch_id filter and sort by -due_date
    const invoices = await pb.collection('invoices').getFullList({
      filter: `branch_id = "${branchId}" && status != "paid" && status != "voided" && status != "cancelled"`,
      sort: '-due_date',
    });
    console.log(`3. INVOICES (Branch ${branchId}): ${invoices.length} active invoices.`);

    // 3. Sales Orders query
    const salesOrders = await pb.collection('sales_orders').getFullList({
      filter: `branch_id = "${branchId}"`,
      sort: '-created',
    });
    console.log(`4. SALES ORDERS (Branch ${branchId}): ${salesOrders.length} orders.`);

    // 4. Payments query without sort or sort by -date
    const payments = await pb.collection('payments').getFullList({
      sort: '-date',
    });
    console.log(`5. PAYMENTS: ${payments.length} payment records.`);

    // 5. Products query
    const products = await pb.collection('products').getFullList({
      filter: 'active = true',
      sort: 'name',
    });
    console.log(`6. PRODUCTS: ${products.length} active products.`);

    console.log('\n=== ALL QUERIES SUCCEEDED 100% WITH ZERO 400 ERRORS! ===');
  } catch (err) {
    console.error('QUERY FAILED:', err?.status, err?.message, err?.data);
  }
}

test();
