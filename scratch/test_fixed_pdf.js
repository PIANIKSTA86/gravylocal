const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const BASE_DIR = path.resolve(__dirname, '..', 'empresas', 'empresa_8092');

// Read orchestrator code and load dependencies
const orchestratorCode = fs.readFileSync(path.resolve(__dirname, '..', 'hub', 'orchestrator.js'), 'utf8');

// We will test what generateInvoicePdf does
console.log('Testing generateInvoicePdf...');
