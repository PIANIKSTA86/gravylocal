const fetch = require('node-fetch');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '..', 'pb_data', 'data.db'));

async function testDuplicateNumber() {
  try {
    let token = '';
    let loginRes = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@contaco.com', password: 'admin123456' })
    });
    
    if (loginRes.ok) {
      const data = await loginRes.json();
      token = data.token;
    } else {
      console.log('User login failed');
      db.close();
      return;
    }

    // Invoice jx6nmym0godz59k has number FV-00003773 which ALREADY EXISTS in transactions table
    db.get("SELECT * FROM invoices WHERE id = 'jx6nmym0godz59k'", async (err, inv) => {
      if (err || !inv) {
        console.error('Invoice jx6nmym0godz59k not found');
        db.close();
        return;
      }
      console.log('Testing invoice with duplicate number:', inv.number, 'ID:', inv.id);

      const payload = {
        txData: {
          tx_type_id: inv.tx_type_id,
          number: inv.number, // "FV-00003773"
          date: inv.date || '2026-07-29',
          description: `Venta ${inv.number}`,
          third_party_id: inv.customer_id,
          status: 'active',
          branch_id: inv.branch_id || null,
          cross_enabled: true,
          cross_type: 'invoices',
          cross_number: inv.number,
          cross_amount: inv.payable_total || inv.total,
          cross_purpose: 'Causar'
        },
        lines: [
          {
            account_id: 'tuam8ilzs3hr9h5',
            debit: 1000,
            credit: 0,
            description: 'line 1'
          },
          {
            account_id: 'l0f3kb7mydvt4n8',
            debit: 0,
            credit: 1000,
            description: 'line 2'
          }
        ]
      };

      const res = await fetch('http://127.0.0.1:8090/api/gravy/bulk-tx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('\n=======================================');
      console.log('HTTP STATUS:', res.status);
      console.log('RESPONSE TEXT:', await res.text());
      console.log('=======================================\n');
      db.close();
    });

  } catch (err) {
    console.error('Error in test:', err);
    db.close();
  }
}

testDuplicateNumber();
