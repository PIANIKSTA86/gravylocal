const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function matchesPrefix(code, prefixes) {
  if (!code) return false;
  return prefixes.some(p => code.startsWith(p));
}

function run() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);

    // Get settings
    const settings = db.prepare("SELECT * FROM settings").all();
    const pracAccountsStr = settings.find(s => s.key === 'report_ret_practicadas')?.value || '2365';
    const favorAccountsStr = settings.find(s => s.key === 'report_ret_favor')?.value || '1355';

    const pracPrefixes = pracAccountsStr.split(',').map(s => s.trim()).filter(Boolean);
    const favorPrefixes = favorAccountsStr.split(',').map(s => s.trim()).filter(Boolean);

    // Let's get active tx lines from June 2026
    const query = `
      SELECT tl.*, t.number as tx_number, t.date as tx_date, a.code as acc_code, a.name as acc_name,
             a.ret_rate_reterenta, a.ret_rate_reteiva, a.ret_rate_reteica
      FROM tx_lines tl
      JOIN transactions t ON tl.tx_id = t.id
      JOIN accounts a ON tl.account_id = a.id
      WHERE t.status = 'active'
        AND t.date >= '2026-06-01' AND t.date <= '2026-06-30'
    `;
    const rawTxLines = db.prepare(query).all();

    // Replicate crossDocRefsMap fetching from SQLite
    const txIds = [...new Set(rawTxLines.map(l => l.tx_id))];
    const crossDocRefsMap = new Map();
    if (txIds.length > 0) {
      // Query tx_lines for those txIds where cross_doc_ref is not empty
      const placeholders = txIds.map(() => '?').join(',');
      const crossLinesQuery = `
        SELECT tx_id, cross_doc_ref 
        FROM tx_lines 
        WHERE tx_id IN (${placeholders}) AND cross_doc_ref != ''
      `;
      const crossLines = db.prepare(crossLinesQuery).all(...txIds);
      for (const cl of crossLines) {
        if (cl.cross_doc_ref) {
          crossDocRefsMap.set(cl.tx_id, cl.cross_doc_ref);
        }
      }
    }

    const resolveRetRateAndBase = (line, rowNet, code, acc) => {
      let rate = Number(line.ret_rate || 0);
      if (rate <= 0) {
        if (acc) {
          if (code.startsWith('2365') && Number(acc.ret_rate_reterenta || 0) > 0) {
            rate = Number(acc.ret_rate_reterenta);
          } else if (code.startsWith('2367') && Number(acc.ret_rate_reteiva || 0) > 0) {
            rate = Number(acc.ret_rate_reteiva);
          } else if (code.startsWith('2368') && Number(acc.ret_rate_reteica || 0) > 0) {
            rate = Number(acc.ret_rate_reteica);
          } else if (code.startsWith('1355') && Number(acc.ret_rate_reterenta || 0) > 0) {
            rate = Number(acc.ret_rate_reterenta);
          }
        }
        if (rate <= 0) {
          if (code.startsWith('2365') || code.startsWith('1355')) rate = 3.5;
          else if (code.startsWith('2367')) rate = 15;
          else if (code.startsWith('2368')) rate = 0.414;
          else rate = 0;
        }
      }
      let base = Number(line.ret_base || 0);
      const amount = Math.abs(rowNet);
      if (base <= 0.01 || Math.abs(base - amount) < 0.05) {
        base = rate > 0 ? (amount / (rate / 100)) : amount;
      }
      base = Math.round(base * 100) / 100;
      return { rate, base };
    };

    console.log("\n=== VERIFIED REPORT ROWS (WITH RESOLVED NumExterno / crossDocRef) ===");
    for (const l of rawTxLines) {
      const code = l.acc_code;
      if (matchesPrefix(code, pracPrefixes)) {
        const rowNet = Number(l.credit || 0) - Number(l.debit || 0);
        const { rate, base } = resolveRetRateAndBase(l, rowNet, code, l);
        
        const crossDocRef = l.cross_doc_ref || crossDocRefsMap.get(l.tx_id) || '';
        
        console.log(`Tx: ${l.tx_number} | Acc: ${code} | Base: ${base} | Net: ${rowNet} | NumExterno (Cruce): "${crossDocRef}"`);
      }
    }

  } catch (err) {
    console.error("Error:", err);
  }
}
run();
