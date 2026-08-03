const fs = require('fs');

let content = fs.readFileSync('pb_hooks/dian.pb.js', 'utf8');

// 1. Replace DFE_5
content = content.replace(/<DFE_5>COLOMBIA<\/DFE_5>/g, '<DFE_5>Colombia</DFE_5>');

const lines = content.split(/\r?\n/);

let standardAdqIndex = -1;
let posAdqIndex = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line === '<ADQ_11>${adqDeptCode}</ADQ_11>') {
    if (lines[i+1] && lines[i+1].trim() === '<ADQ_13>${adqCityName}</ADQ_13>' &&
        lines[i+2] && lines[i+2].trim() === '<ADQ_15>${adqCountryCode}</ADQ_15>' &&
        lines[i+3] && lines[i+3].trim() === '<ADQ_22>${adqDv}</ADQ_22>') {
      if (standardAdqIndex === -1) {
        standardAdqIndex = i;
      } else {
        posAdqIndex = i;
      }
    }
  }
}

if (standardAdqIndex !== -1 && posAdqIndex !== -1) {
  // Let's replace standard ADQ block
  const standardReplacement = [
    '    <ADQ_11>${adqDeptCode}</ADQ_11>',
    '    <ADQ_12>${adqDeptName}</ADQ_12>',
    '    <ADQ_13>${adqCityName}</ADQ_13>',
    '    <ADQ_14>${adqPostal}</ADQ_14>',
    '    <ADQ_15>${adqCountryCode}</ADQ_15>',
    '    <ADQ_22>${adqDv}</ADQ_22>',
    '    <ADQ_23>${adqCityCode}</ADQ_23>'
  ];
  
  // We insert at posAdqIndex first because changing lines at standardAdqIndex shifts the rest of the array.
  // Actually, let's patch POS ADQ first, then Standard ADQ, or reconstruct the array.
  // Reconstructing the array is cleaner and avoids shift math errors.
  
  const newLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (i === standardAdqIndex) {
      newLines.push(...standardReplacement);
      i += 3; // skip the old 4 lines (i, i+1, i+2, i+3)
    } else if (i === posAdqIndex) {
      newLines.push(...standardReplacement);
      i += 3; // skip the old 4 lines
    } else {
      newLines.push(lines[i]);
    }
  }
  
  fs.writeFileSync('pb_hooks/dian.pb.js', newLines.join('\r\n'), 'utf8');
  console.log("Successfully patched dian.pb.js!");
} else {
  console.log(`Error: Could not find both ADQ blocks. Standard: ${standardAdqIndex}, POS: ${posAdqIndex}`);
}
