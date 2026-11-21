const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

// Let's check ph_invoices
console.log('--- ph_invoices info ---');
const phInv = db.prepare(`
  SELECT 
    MIN(issue_date) as min_issue,
    MAX(issue_date) as max_issue,
    MIN(period) as min_period,
    MAX(period) as max_period,
    COUNT(*) as total_invoices,
    SUM(total) as sum_total,
    SUM(balance) as sum_balance
  FROM ph_invoices
`).get();
console.log('ph_invoices:', phInv);

// Check periods in ph_invoices
const periods = db.prepare(`
  SELECT period, COUNT(*) as count, SUM(total) as sum_total, SUM(balance) as sum_balance
  FROM ph_invoices
  GROUP BY period
  ORDER BY period
`).all();
console.log('Invoices by period:', periods);
