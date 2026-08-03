const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

if (fs.existsSync('pb_data/data.db')) {
  try {
    const db = new DatabaseSync('pb_data/data.db');
    
    // Select all transaction lines in 2026
    const txLines = db.prepare(`
      SELECT tl.*, t.date as tx_date, t.number as tx_number, t.status as tx_status, a.code as account_code, a.name as account_name
      FROM tx_lines tl
      JOIN transactions t ON tl.tx_id = t.id
      JOIN accounts a ON tl.account_id = a.id
      WHERE t.date >= '2026-01-01' AND t.date <= '2026-12-31'
    `).all();
    
    console.log(`Total transaction lines in 2026: ${txLines.length}`);
    
    // Group by account code
    const accountSummary = {};
    txLines.forEach(tl => {
      const code = tl.account_code;
      if (!accountSummary[code]) {
        accountSummary[code] = {
          name: tl.account_name,
          count: 0,
          totalDebit: 0,
          totalCredit: 0
        };
      }
      accountSummary[code].count++;
      accountSummary[code].totalDebit += tl.debit || 0;
      accountSummary[code].totalCredit += tl.credit || 0;
    });
    
    console.log("Account Summary for 2026 Transactions:");
    Object.keys(accountSummary).sort().forEach(code => {
      const s = accountSummary[code];
      console.log(`  - Code: ${code} (${s.name}): Count: ${s.count}, Debit: ${s.totalDebit}, Credit: ${s.totalCredit}`);
    });
    
  } catch (err) {
    console.error("Error checking transactions:", err);
  }
} else {
  console.log("pb_data/data.db does not exist");
}
