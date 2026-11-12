const fs = require('fs');

const xml = fs.readFileSync('scratch/nc466_full_decoded.xml', 'utf8');
const refMatches = xml.match(/<cac:[a-zA-Z0-9]*Reference[\s\S]*?<\/cac:[a-zA-Z0-9]*Reference>/g);
console.log("cac Reference matches:", refMatches);

const cbcRefMatches = xml.match(/<cbc:[a-zA-Z0-9]*Reference[\s\S]*?<\/cbc:[a-zA-Z0-9]*Reference>/g);
console.log("cbc Reference matches:", cbcRefMatches);

// Let's print from <CreditNote> down to <cac:AccountingSupplierParty>
const headerEnd = xml.indexOf('<cac:AccountingSupplierParty>');
console.log("\n--- HEADER SECTION ---");
console.log(xml.substring(xml.indexOf('<cbc:UBLVersionID>'), headerEnd));

