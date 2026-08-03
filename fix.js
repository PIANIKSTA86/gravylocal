const fs = require('fs');
const file = 'C:/Users/JULIAN/Desktop/GravyLocal2.0/frontend/src/modules/superadmin.ts';

// Read file as buffer
let buffer = fs.readFileSync(file);
let text;

// Determine encoding and convert to string
if (buffer[0] === 0xff && buffer[1] === 0xfe) {
    text = buffer.toString('utf16le');
} else {
    // If not utf16le BOM, just try utf8 but strip bad chars
    text = buffer.toString('utf8');
}

// Remove any null bytes or garbage that might have been injected
text = text.replace(/\x00/g, '');

// Fix the syntax error injected by Powershell
text = text.replace(/\\'Authorization\\': \\`Bearer \\\${localStorage\.getItem\(\\'gravy_hub_token\\'\)}\\`/g, "'Authorization': `Bearer ${localStorage.getItem('gravy_hub_token')}`");
text = text.replace(/\\`Bearer \\\${localStorage\.getItem\('gravy_hub_token'\)}\\`/g, "`Bearer ${localStorage.getItem('gravy_hub_token')}`");

// Actually, the syntax error was:
// 'Authorization': \`Bearer \${localStorage.getItem('gravy_hub_token')}\`
text = text.replace(/\\`Bearer \\\${localStorage\.getItem\('gravy_hub_token'\)}\\`/g, "`Bearer ${localStorage.getItem('gravy_hub_token')}`");

// A simpler replace for the exact bad string:
text = text.replace("'Authorization': \\`Bearer \\${localStorage.getItem('gravy_hub_token')}\\`", "'Authorization': `Bearer ${localStorage.getItem('gravy_hub_token')}`");

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed file');
