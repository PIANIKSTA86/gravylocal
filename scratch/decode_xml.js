const fs = require('fs');

const content = JSON.parse(fs.readFileSync('scratch/nc466_content.json', 'utf8'));
const xml = Buffer.from(content.XmlBytesBase64, 'base64').toString('utf8');
fs.writeFileSync('scratch/nc466_full_decoded.xml', xml);
console.log("Decoded XML saved, length:", xml.length);

// Let's inspect root tags and reference tags in the XML
const lines = xml.split('\n');
console.log("First 30 lines:");
console.log(lines.slice(0, 30).join('\n'));

// Search for BillingReference or DiscrepancyResponse or CustomizationID
console.log("\n--- CustomizationID & ProfileID ---");
const customMatches = xml.match(/<cbc:CustomizationID[\s\S]*?<\/cbc:CustomizationID>/g);
console.log(customMatches);

console.log("\n--- BillingReference ---");
const billRefMatches = xml.match(/<cac:BillingReference[\s\S]*?<\/cac:BillingReference>/g);
console.log(billRefMatches);

console.log("\n--- DiscrepancyResponse ---");
const discMatches = xml.match(/<cac:DiscrepancyResponse[\s\S]*?<\/cac:DiscrepancyResponse>/g);
console.log(discMatches);

