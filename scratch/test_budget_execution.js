const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

if (fs.existsSync('pb_data/data.db')) {
  try {
    const db = new DatabaseSync('pb_data/data.db');
    
    // Simulate API.getAccounts(false)
    const allAccounts = db.prepare("SELECT * FROM accounts").all();
    console.log(`Loaded ${allAccounts.length} accounts.`);
    
    // Simulate budget ID
    const budgetId = '0fpqb69qitnz8d5';
    const year = 2026;
    
    // Simulate API.getPhBudgetLines(budgetId)
    // In PB, this returns lines with expand: account_id
    const rawLines = db.prepare("SELECT * FROM ph_budget_lines WHERE budget_id = ?").all(budgetId);
    const lines = rawLines.map(l => {
      const acc = allAccounts.find(a => a.id === l.account_id);
      return {
        ...l,
        expand: {
          account_id: acc
        }
      };
    });
    
    console.log(`Budget Lines for budgetId ${budgetId}:`);
    lines.forEach(l => {
      console.log(`  - Account: ${l.expand.account_id.code} (${l.expand.account_id.name}), Budget: ${l.annual_amount}`);
    });
    
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // 1. Create a mapping of each budget line to its matching sub-account IDs
    const lineSubAccountMap = new Map();
    const allSubAccountIds = new Set();

    lines.forEach(l => {
      const code = l.expand?.account_id?.code;
      let matchIds = [l.account_id];
      if (code) {
        const matched = allAccounts.filter(a => a.code && a.code.startsWith(code));
        if (matched.length > 0) {
          matchIds = matched.map(a => a.id);
        }
      }
      lineSubAccountMap.set(l.id, matchIds);
      matchIds.forEach(id => allSubAccountIds.add(id));
    });

    const uniqueAccountIds = Array.from(allSubAccountIds);
    console.log(`\nUnique matching sub-account IDs (${uniqueAccountIds.length}):`);
    uniqueAccountIds.forEach(id => {
      const acc = allAccounts.find(a => a.id === id);
      console.log(`  - ${acc.code}: ${acc.name}`);
    });

    if (uniqueAccountIds.length === 0) {
      console.log("No sub-accounts found.");
      return;
    }

    // 2. Fetch all movements for the accounts in the budget for that year
    // Simulate: pb.listAll('tx_lines', { filter: fullFilter, expand: 'tx_id' })
    const placeholders = uniqueAccountIds.map(() => '?').join(',');
    const txLines = db.prepare(`
      SELECT tl.*, t.date as tx_date, t.number as tx_number, t.status as tx_status
      FROM tx_lines tl
      JOIN transactions t ON tl.tx_id = t.id
      WHERE tl.account_id IN (${placeholders})
        AND t.date >= ?
        AND t.date <= ?
        AND t.status = 'active'
    `).all(...uniqueAccountIds, startDate, endDate);

    console.log(`\nFound matching transaction lines: ${txLines.length}`);

    // 3. Aggregate monthly execution by individual account ID
    const executionMap = {};
    for (const tl of txLines) {
      const dStr = tl.tx_date;
      if (!dStr) continue;
      // getUTCMonth simulation: new Date('2026-05-01T00:00:00Z').getUTCMonth() -> 4
      const month = new Date(dStr + 'T00:00:00Z').getUTCMonth();
      if (month < 0 || month >= 12) continue;
      if (!executionMap[tl.account_id]) executionMap[tl.account_id] = new Array(12).fill(0);
      executionMap[tl.account_id][month] += (tl.debit || 0) - (tl.credit || 0);
    }

    // 4. Map budget lines to consolidated sub-account execution totals
    const result = lines.map(l => {
      const matchedIds = lineSubAccountMap.get(l.id) || [l.account_id];
      const execArr = new Array(12).fill(0);
      
      for (const accId of matchedIds) {
        const accVals = executionMap[accId];
        if (accVals) {
          for (let m = 0; m < 12; m++) {
            execArr[m] += accVals[m];
          }
        }
      }
      
      const totalExec = execArr.reduce((a, b) => a + b, 0);
      return {
        code: l.expand.account_id.code,
        name: l.expand.account_id.name,
        annual_amount: l.annual_amount,
        executed: totalExec,
        monthly_executed: execArr
      };
    });

    console.log("\nExecution results:");
    result.forEach(r => {
      console.log(`  * Account ${r.code} (${r.name}):`);
      console.log(`    Budget: ${r.annual_amount}`);
      console.log(`    Executed Total: ${r.executed}`);
      console.log(`    Executed Monthly:`, r.monthly_executed);
    });

  } catch (err) {
    console.error("Error in simulation:", err);
  }
} else {
  console.log("pb_data/data.db does not exist");
}
