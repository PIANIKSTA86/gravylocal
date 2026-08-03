async function test() {
  const pbUrl = 'http://localhost:8090';
  
  try {
    console.log("Logging in as admin...");
    const loginRes = await fetch(`${pbUrl}/api/collections/users/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@contaco.com', password: 'Admin1234!' })
    });
    const loginData = await loginRes.json();
    if (!loginData.token) {
      console.error("Login failed:", loginData);
      return;
    }
    const token = loginData.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log("Login successful!");

    const whId = 'fclyvwpcomhq4gu'; // BODEGA BOGOTA
    const date = '2026-07-08';
    const accContraId = '9kg84pub73dxfjj'; // CAPITAL SOCIAL

    const validRows = [
      {
        productId: 'q7comz1lxlevns2', 
        inventoryAccId: 'tuam8ilzs3hr9h5',
        qty: 100,
        cost: 5000,
        subtotal: 500000,
        details: 'Saldo Inicial Test Excel 1'
      },
      {
        productId: 'odc1jxmvuq9v5x3', 
        inventoryAccId: 'tuam8ilzs3hr9h5',
        qty: 50,
        cost: 12000,
        subtotal: 600000,
        details: 'Saldo Inicial Test Excel 2'
      }
    ];

    const debitMap = new Map();
    validRows.forEach(r => {
      const accId = r.inventoryAccId;
      const current = debitMap.get(accId) || 0;
      debitMap.set(accId, current + r.subtotal);
    });

    let totalTransactionValue = 0;
    const txLines = [];
    let order = 1;

    debitMap.forEach((val, accId) => {
      const roundedVal = Math.round(val * 100) / 100;
      if (roundedVal <= 0) return;
      totalTransactionValue += roundedVal;

      txLines.push({
        account_id: accId,
        debit: roundedVal,
        credit: 0,
        description: `Carga masiva de inventario - Ingreso mercancía`,
        line_order: order++
      });
    });

    const roundedTotal = Math.round(totalTransactionValue * 100) / 100;
    txLines.push({
      account_id: accContraId,
      debit: 0,
      credit: roundedTotal,
      description: `Contrapartida de carga masiva de inventarios`,
      line_order: order++
    });

    // Buscar o crear tipo de transacción AJ (como hace el frontend)
    let txTypeId = '';
    const typeRes = await fetch(`${pbUrl}/api/collections/transaction_types/records?filter=code="AJ"`, { headers });
    const typeData = await typeRes.json();
    if (typeData.items && typeData.items.length > 0) {
      txTypeId = typeData.items[0].id;
      console.log("Transaction type AJ found:", txTypeId);
    } else {
      console.log("Transaction type AJ not found. Creating it...");
      const createTypeRes = await fetch(`${pbUrl}/api/collections/transaction_types/records`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          code: 'AJ',
          prefix: 'AJ',
          name: 'Ajuste de Inventario',
          description: 'Ajustes por toma física de inventario',
          consecutive: 0,
          active: true
        })
      });
      const createTypeData = await createTypeRes.json();
      txTypeId = createTypeData.id;
      console.log("Transaction type AJ created:", txTypeId);
    }

    const rand = String(Date.now()).slice(-4);
    const txNumber = `AJ-${date.replaceAll('-', '')}-${rand}`;

    console.log("Creating transaction in draft via bulk-tx...");
    const txRes = await fetch(`${pbUrl}/api/gravy/bulk-tx`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        txData: {
          tx_type_id: txTypeId,
          number: txNumber,
          date,
          description: `Carga masiva de inventario en bodega`,
          status: 'draft',
          payment_days: 0,
          cross_enabled: false,
          branch_id: null
        },
        lines: txLines
      })
    });
    
    console.log("bulk-tx status:", txRes.status);
    const tx = await txRes.json();
    console.log("Transaction created:", tx.id);

    // 4. Crear movimiento de inventario en draft
    console.log("Creating inventory movement in draft...");
    const movRes = await fetch(`${pbUrl}/api/collections/inventory_movements/records`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        number: `ENT-${date.replaceAll('-', '')}-${rand}`,
        mov_type: 'ENTRADA',
        date,
        warehouse_id: whId,
        notes: `Carga masiva de inventario - Ref Tx ${txNumber}`,
        status: 'draft',
        tx_id: tx.id,
        branch_id: null
      })
    });
    const mov = await movRes.json();
    console.log("Inventory movement created:", mov.id);

    // 5. Crear líneas de movimiento
    console.log("Creating inventory movement lines...");
    for (let i = 0; i < validRows.length; i++) {
      const r = validRows[i];
      const lineRes = await fetch(`${pbUrl}/api/collections/inventory_movement_lines/records`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          movement_id: mov.id,
          product_id: r.productId,
          qty: r.qty,
          unit_cost: r.cost,
          notes: r.details,
          line_order: i + 1
        })
      });
      const line = await lineRes.json();
      console.log(`Line ${i + 1} created:`, line.id);
    }

    // 6. Aplicar el movimiento de inventario
    console.log("Fetching movement lines to apply...");
    const linesFetch = await fetch(`${pbUrl}/api/collections/inventory_movement_lines/records?filter=movement_id="${mov.id}"`, { headers });
    const linesData = await linesFetch.json();
    const lines = linesData.items;

    console.log("Applying inventory lines stock updates...");
    for (const line of lines) {
      // Buscar registro de stock existente
      const stockFetch = await fetch(`${pbUrl}/api/collections/inventory_stock/records?filter=product_id="${line.product_id}"%26%26warehouse_id="${whId}"`, { headers });
      const stockData = await stockFetch.json();
      
      if (stockData.items.length) {
        const stockRec = stockData.items[0];
        const newQty = (stockRec.qty_on_hand || 0) + line.qty;
        const newCost = ((stockRec.qty_on_hand || 0) * (stockRec.avg_cost || 0) + line.qty * line.unit_cost) / newQty;
        
        await fetch(`${pbUrl}/api/collections/inventory_stock/records/${stockRec.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            qty_on_hand: newQty,
            avg_cost: Math.round(newCost * 100) / 100,
            last_mov_date: date
          })
        });
        console.log(`Updated stock for product ${line.product_id} to Qty: ${newQty}`);
      } else {
        await fetch(`${pbUrl}/api/collections/inventory_stock/records`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            product_id: line.product_id,
            warehouse_id: whId,
            qty_on_hand: line.qty,
            avg_cost: line.unit_cost,
            last_mov_date: date
          })
        });
        console.log(`Created new stock for product ${line.product_id} with Qty: ${line.qty}`);
      }
    }

    // c. Actualizar estado del movimiento a aplicado
    await fetch(`${pbUrl}/api/collections/inventory_movements/records/${mov.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: 'applied' })
    });
    console.log("Movement marked as applied.");

    // 7. Aprobar la transacción contable
    await fetch(`${pbUrl}/api/collections/transactions/records/${tx.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: 'active' })
    });
    console.log("Transaction marked as active.");

    console.log("=== INVENTARIO CARGADO EXITOSAMENTE ===");

  } catch (err) {
    console.error("Error during test:", err);
  }
}

test();
