const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// Check all tables and text columns for employee IDs or contract dates
const empIds = ['gyilekodzdj1sde', 'cz5t165sse24oa2', 'vsu8bz83547sxrn', 'b6c3mvlw6b9rodf', 'v21xfu4abpcba2f', 'cm6g6vpckf15ct8'];

console.log('--- CHECKING ALL TABLES FOR EMPLOYEES / CONTRACTS ---');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name).filter(t => !t.startsWith('_'));

tables.forEach(tbl => {
  const cols = db.prepare(`PRAGMA table_info(${tbl})`).all();
  const colNames = cols.map(c => c.name);
  
  // Check if table has columns related to hire, contract, employee, date
  const contractCols = colNames.filter(c => c.includes('contract') || c.includes('hire') || c.includes('ingreso') || c.includes('employee'));
  if (contractCols.length > 0) {
    console.log(`Table ${tbl} has matching columns:`, contractCols);
    try {
      const rows = db.prepare(`SELECT * FROM ${tbl} LIMIT 3`).all();
      console.log(`Sample from ${tbl}:`, rows);
    } catch(e) {}
  }
});

