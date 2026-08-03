const fetch = require('node-fetch');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '..', 'pb_data', 'data.db'));

async function testPostFix() {
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
      console.log('Logged in as admin@contaco.com');
    } else {
      console.log('User login failed');
      db.close();
      return;
    }

    // Invoice jx6nmym0godz59k (FV-00003773)
    db.get("SELECT * FROM invoices WHERE id = 'jx6nmym0godz59k'", async (err, inv) => {
      if (err || !inv) {
        console.error('Invoice jx6nmym0godz59k not found');
        db.close();
        return;
      }
      console.log('Invoice to post:', inv.number, 'ID:', inv.id, 'status:', inv.status);

      const txNumber = String(inv.tx_number || inv.number || 'AUTO').trim();

      // Check if a transaction with that number exists
      const searchRes = await fetch(`http://127.0.0.1:8090/api/collections/transactions/records?filter=number="${txNumber}"`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const searchData = await searchRes.json();
      const existingTx = searchData.items && searchData.items.length ? searchData.items[0] : null;

      console.log('Existing tx found in DB:', existingTx ? { id: existingTx.id, number: existingTx.number, status: existingTx.status } : 'NONE');

      const txPayload = {
        tx_type_id: inv.tx_type_id,
        number: txNumber,
        date: inv.date || '2026-07-29',
        description: `Venta ${inv.number}`,
        third_party_id: inv.customer_id,
        payment_days: 0,
        cross_enabled: true,
        cross_type: 'invoices',
        cross_number: inv.number,
        cross_amount: inv.payable_total || inv.total,
        cross_purpose: 'Causar',
        status: 'active',
        branch_id: inv.branch_id || null,
      };

      const txLines = [
        {
          account_id: 'tuam8ilzs3hr9h5',
          third_party_id: inv.customer_id,
          debit: inv.payable_total || inv.total,
          credit: 0,
          description: `Venta ${inv.number}`,
          line_order: 1
        },
        {
          account_id: 'l0f3kb7mydvt4n8',
          third_party_id: inv.customer_id,
          debit: 0,
          credit: inv.subtotal,
          description: `Ingresos ${inv.number}`,
          line_order: 2
        }
      ];

      let finalTx = null;

      if (existingTx && (existingTx.status === 'draft' || existingTx.id === inv.tx_id)) {
        console.log(`Updating existing draft transaction ${existingTx.id}...`);
        
        // Update header
        const updateHeaderRes = await fetch(`http://127.0.0.1:8090/api/collections/transactions/records/${existingTx.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify(txPayload)
        });
        console.log('Update header status:', updateHeaderRes.status);

        // Delete old lines
        const oldLinesRes = await fetch(`http://127.0.0.1:8090/api/collections/tx_lines/records?filter=tx_id="${existingTx.id}"`, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const oldLinesData = await oldLinesRes.json();
        for (const line of oldLinesData.items || []) {
          await fetch(`http://127.0.0.1:8090/api/collections/tx_lines/records/${line.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
          });
        }

        // Create new lines
        for (const line of txLines) {
          await fetch(`http://127.0.0.1:8090/api/collections/tx_lines/records`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ tx_id: existingTx.id, ...line })
          });
        }

        finalTx = existingTx;
        console.log('SUCCESSFULLY updated draft transaction!', finalTx.id);

      } else {
        console.log('Creating new transaction via bulk-tx...');
        const createRes = await fetch('http://127.0.0.1:8090/api/gravy/bulk-tx', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ txData: txPayload, lines: txLines })
        });
        console.log('Create status:', createRes.status);
        finalTx = await createRes.json();
        console.log('Result:', finalTx);
      }

      // Link invoice to tx_id and status posted
      const invUpdateRes = await fetch(`http://127.0.0.1:8090/api/collections/invoices/records/${inv.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'posted', tx_id: finalTx.id })
      });

      console.log('\nInvoice update status:', invUpdateRes.status);
      const updatedInv = await invUpdateRes.json();
      console.log('Updated Invoice:', { id: updatedInv.id, number: updatedInv.number, status: updatedInv.status, tx_id: updatedInv.tx_id });

      db.close();
    });

  } catch (err) {
    console.error('Error in test:', err);
    db.close();
  }
}

testPostFix();
