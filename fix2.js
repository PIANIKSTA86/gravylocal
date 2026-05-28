const fs = require('fs');
const file = 'C:/Users/JULIAN/Desktop/GravyLocal2.0/frontend/src/modules/superadmin.ts';
let text = fs.readFileSync(file, 'utf8');
text = text.replace("'Authorization': \\Bearer \\\\", "'Authorization': `Bearer ${localStorage.getItem('gravy_hub_token')}`");
fs.writeFileSync(file, text, 'utf8');
console.log('Fixed file');
