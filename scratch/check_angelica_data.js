const PocketBase = require('./frontend/node_modules/pocketbase');
const pb = new PocketBase('http://127.0.0.1:8090');

async function test() {
  await pb.admins.authWithPassword('admin@gravy.com', '1234567890');
  const empId = 'vsu8bz83547sxrn'; // Angelica Moncada
  const ymPrefix = '2026-09';
  const periods = await pb.collection('payroll_periods').getFullList({
    filter: `date_from ~ "${ymPrefix}" || date_to ~ "${ymPrefix}"`
  });
  console.log('Periods found:', periods.length);
  const pIds = periods.map(p => p.id);
  const filterExpr = pIds.map(id => `period_id = "${id}"`).join(' || ');
  const lines = await pb.collection('payroll_lines').getFullList({
    filter: `employee_id = "${empId}" && (${filterExpr})`
  });
  console.log('Lines found:', lines.length);
  lines.forEach(l => {
    console.log('Line salary:', l.base_salary, 'worked days:', l.days_worked, 'trans:', l.transport_allowance, 'salud:', l.health_deduction, 'pension:', l.pension_deduction);
  });

  const txs = await pb.collection('transactions').getFullList({
    filter: `cross_type = "payroll_settlement" && date >= "2026-09-01" && date <= "2026-09-30" && status != "void"`
  });
  console.log('Transactions found:', txs.length);
  for (const t of txs) {
    if (t.third_party_id === empId) {
      console.log('Transaction for Angelica:', t.number, t.total);
      const items = await pb.collection('transaction_items').getFullList({
        filter: `transaction_id = "${t.id}"`
      });
      items.forEach(it => console.log('Item:', it.account_code, it.concept, it.debit, it.credit));
    }
  }
}
test().catch(e => console.error(e));
