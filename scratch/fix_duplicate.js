const fs = require('fs');
let lines = fs.readFileSync('pb_hooks/ph_email.pb.js', 'utf8').split(/\r?\n/);
console.log('Line 3070:', lines[3069]);
console.log('Line 3071:', lines[3070]);
console.log('Line 3072:', lines[3071]);
console.log('Line 3073:', lines[3072]);

// If line 3070 is customMessage, remove it:
if (lines[3069].includes('customMessage') && lines[3071].includes('customMessage')) {
  lines.splice(3069, 1);
  fs.writeFileSync('pb_hooks/ph_email.pb.js', lines.join('\r\n'), 'utf8');
  console.log('Removed line 3069 successfully');
}
