const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

function _normText(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function _textOverlap(a, b) {
  const stop = new Set(['de','la','el','los','las','por','para','con','del','y','en','a','un','una']);
  const wa = new Set(_normText(a).split(' ').filter(w => w.length >= 4 && !stop.has(w)));
  const wb = new Set(_normText(b).split(' ').filter(w => w.length >= 4 && !stop.has(w)));
  if (!wa.size || !wb.size) return 0;
  let common = 0;
  wa.forEach(w => { if (wb.has(w)) common++; });
  return common / Math.max(wa.size, wb.size);
}

function _asDateOnly(s) {
  if (!s) return null;
  const d = new Date(String(s).slice(0, 10) + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

function _daysDiff(a, b) {
  const da = _asDateOnly(a);
  const db = _asDateOnly(b);
  if (!da || !db) return 999;
  return Math.round(Math.abs((da - db) / 86400000));
}

db.all(`
  SELECT m.* 
  FROM bank_movements m 
  WHERE m.bank_account_id = 'qoc9o8krztojvpj'
  ORDER BY m.date ASC
`, (err, movs) => {
  console.log('Total bank_movements for account qoc9o8krztojvpj:', movs.length);

  db.all(`
    SELECT tl.*, t.number as tx_number, t.date as tx_date, t.status as tx_status, t.description as tx_desc
    FROM tx_lines tl
    JOIN transactions t ON tl.tx_id = t.id
    WHERE tl.account_id = 'f6s9lpt10605ma3' AND t.status != 'voided'
    ORDER BY t.date ASC
  `, (err2, lines) => {
    console.log('Total tx_lines for account f6s9lpt10605ma3:', lines.length);

    // Let's analyze movements vs lines
    // Check how many movements matched in the db
    const matchedMovs = movs.filter(m => m.tx_line_id);
    console.log('Movs already with tx_line_id in DB:', matchedMovs.length);

    // Check how many lines have a movement pointing to them
    const lineIdsWithMov = new Set(matchedMovs.map(m => m.tx_line_id));
    console.log('Distinct tx_lines referenced by bank_movements:', lineIdsWithMov.size);

    // Unmatched movements
    const unmatchedMovs = movs.filter(m => !m.tx_line_id);
    console.log('Unmatched bank_movements:', unmatchedMovs.length);

    // Unmatched lines
    const unmatchedLines = lines.filter(l => !lineIdsWithMov.has(l.id));
    console.log('Unmatched tx_lines:', unmatchedLines.length);

    // Check if there are exact amount matches in unmatched!
    let exactAmtMatches = 0;
    for (const m of unmatchedMovs) {
      const amt = +(m.debit > 0 ? m.debit : m.credit || 0);
      const mSide = m.debit > 0 ? 'credit' : 'debit';
      const mDate = m.date;
      const candidates = unmatchedLines.filter(l => {
        const lAmt = +(l[mSide] || 0);
        return Math.abs(lAmt - amt) < 1.0;
      });
      if (candidates.length > 0) {
        exactAmtMatches++;
        console.log(`Potential match for mov [${m.date}] ${m.description} (${amt}): found ${candidates.length} lines:`, candidates.map(c => `[${c.tx_date}] ${c.tx_number} (${c[mSide]}) diffDays=${_daysDiff(mDate, c.tx_date)}`));
      }
    }
    console.log('Exact amount matches among unmatched:', exactAmtMatches);
  });
});
