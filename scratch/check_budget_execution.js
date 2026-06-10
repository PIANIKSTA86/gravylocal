const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

if (fs.existsSync('pb_data/data.db')) {
  try {
    const db = new DatabaseSync('pb_data/data.db');
    
    // 1. Get all budgets
    const budgets = db.prepare("SELECT * FROM ph_budgets").all();
    console.log("Budgets in DB:", budgets);
    
    for (const b of budgets) {
      console.log(`\n--- Budget: ${b.name} (${b.year}) ---`);
      
      // Get budget lines and join accounts
      const lines = db.prepare(`
        SELECT bl.*, a.code as account_code, a.name as account_name 
        FROM ph_budget_lines bl
        LEFT JOIN accounts a ON bl.account_id = a.id
        WHERE bl.budget_id = ?
      `).all(b.id);
      
      console.log(`Budget Lines (${lines.length}):`);
      lines.forEach(l => {
        console.log(`  - Account ID: ${l.account_id}, Code: ${l.account_code}, Name: ${l.account_name}, Annual Amount: ${l.annual_amount}`);
      });
      
      // 2. For each account, search for transaction lines in that year
      const accountIds = lines.map(l => l.account_id).filter(Boolean);
      if (accountIds.length === 0) {
        console.log("No accounts associated with budget lines.");
        continue;
      }
      
      const startDate = `${b.year}-01-01`;
      const endDate = `${b.year}-12-31`;
      
      const placeholders = accountIds.map(() => '?').join(',');
      const txLines = db.prepare(`
        SELECT tl.*, t.date as tx_date, t.number as tx_number, t.status as tx_status, a.code as account_code
        FROM tx_lines tl
        JOIN transactions t ON tl.tx_id = t.id
        JOIN accounts a ON tl.account_id = a.id
        WHERE tl.account_id IN (${placeholders})
          AND t.date >= ?
          AND t.date <= ?
      `).all(...accountIds, startDate, endDate);
      
      console.log(`Matching Transaction Lines (${txLines.length}):`);
      txLines.forEach(tl => {
        console.log(`  - Tx Date: ${tl.tx_date}, Tx Num: ${tl.tx_number}, Status: ${tl.tx_status}, Account: ${tl.account_code}, Debit: ${tl.debit}, Credit: ${tl.credit}`);
      });
    }
  } catch (err) {
    console.error("Error checking budget execution in DB:", err);
  }
} else {
  console.log("pb_data/data.db does not exist");
}
