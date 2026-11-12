const json = '{"document_number":"7","prefix":"NANE","period":{"settlement_start_date":"2026-09-01"}}';
console.log('original length:', json.length);
console.log('!json.includes(<):', !json.includes('<'));
const decoded = Buffer.from(json, 'base64').toString('utf8');
console.log('decoded sample:', decoded.slice(0, 50));
console.log('decoded startsWith {:', decoded.startsWith('{'));

