const fs = require('fs');
const path = require('path');

const dirs = [
  ['endpoints_overview', '9'],
  ['invoices_pos', '315'],
  ['billing_fields', '319'],
  ['support_docs', '446'],
  ['payroll', '442'],
  ['payroll_fields', '553'],
  ['events_radian', '13']
];

for (const [name, step] of dirs) {
  const filePath = path.join('C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps', step, 'content.md');
  if (!fs.existsSync(filePath)) continue;
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log(`\n========================================\n=== ${name.toUpperCase()} (Step ${step}) ===\n========================================`);

  // Extract URLs or Endpoints
  const endpoints = content.match(/\/(api\/ubl2\.1\/[a-zA-Z0-9_\-\/]+|[a-zA-Z0-9_\-]+\/[a-zA-Z0-9_\-\/]+)/g) || [];
  const uniqueEndpoints = [...new Set(endpoints)].filter(e => e.includes('/') && !e.includes('img') && !e.includes('docs') && !e.includes('github'));
  console.log('Sample paths found:', uniqueEndpoints.slice(0, 15));

  // Extract headings or markdown headers
  const mdHeadings = content.match(/#{1,4}\s+[^\n]+/g) || [];
  if (mdHeadings.length) {
    console.log('Markdown Headings:', mdHeadings.slice(0, 12));
  } else {
    // HTML headings
    const htmlHeadings = content.match(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/gi) || [];
    console.log('HTML Headings:', htmlHeadings.map(h => h.replace(/<[^>]+>/g, '').trim()).slice(0, 12));
  }
}
