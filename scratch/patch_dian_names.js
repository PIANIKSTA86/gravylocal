const fs = require('fs');

let content = fs.readFileSync('pb_hooks/dian.pb.js', 'utf8');
const lines = content.split(/\r?\n/);

let standardStart = -1;
let standardEnd = -1;
let posStart = -1;
let posEnd = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line === "let adqNamesXml = '';") {
    if (standardStart === -1) {
      standardStart = i;
      for (let j = i; j < lines.length; j++) {
        if (lines[j].trim() === "if (isDS) {") {
          standardEnd = j;
          break;
        }
      }
    } else {
      posStart = i;
      for (let j = i; j < lines.length; j++) {
        if (lines[j].trim() === "xml += `") {
          posEnd = j;
          break;
        }
      }
    }
  }
}

if (standardStart !== -1 && posStart !== -1) {
  const standardReplacement = [
    "    let adqNamesXml = '';",
    "    if (adq1 === '2') {",
    "      let pName = '', oName = '', pLastName = '', sLastName = '';",
    "      const dbFirstName = customer ? String(customer.getString('first_name') || '').trim() : '';",
    "      const dbLastName = customer ? String(customer.getString('last_name') || '').trim() : '';",
    "      ",
    "      if (dbFirstName && dbLastName) {",
    "        const fParts = dbFirstName.split(/\\s+/);",
    "        const lParts = dbLastName.split(/\\s+/);",
    "        pName = fParts[0] || '';",
    "        oName = fParts.slice(1).join(' ') || '';",
    "        pLastName = lParts[0] || '';",
    "        sLastName = lParts.slice(1).join(' ') || '';",
    "      } else {",
    "        const parts = String(isPurchaseDoc ? emitterName : custName).trim().split(/\\s+/);",
    "        if (parts.length === 1) {",
    "          pLastName = parts[0];",
    "          pName = 'N/A';",
    "        } else if (parts.length === 2) {",
    "          pName = parts[0];",
    "          pLastName = parts[1];",
    "        } else if (parts.length === 3) {",
    "          pName = parts[0];",
    "          pLastName = parts[1];",
    "          sLastName = parts[2];",
    "        } else {",
    "          pName = parts[0];",
    "          oName = parts[1];",
    "          pLastName = parts[2];",
    "          sLastName = parts.slice(3).join(' ');",
    "        }",
    "      }",
    "      adqNamesXml = `",
    "    <ADQ_6>\${escXml(pLastName)}</ADQ_6>",
    "    <ADQ_7>\${escXml(sLastName)}</ADQ_7>",
    "    <ADQ_8>\${escXml(pName)}</ADQ_8>",
    "    <ADQ_9>\${escXml(oName)}</ADQ_9>\`;",
    "    } else {",
    "      adqNamesXml = `",
    "    <ADQ_6>\${escXml(isPurchaseDoc ? emitterName : custName)}</ADQ_6>\`;",
    "    }"
  ];

  const posReplacement = [
    "    let adqNamesXml = '';",
    "    if (adq1 === '2') {",
    "      let pName = '', oName = '', pLastName = '', sLastName = '';",
    "      const dbFirstName = customer ? String(customer.getString('first_name') || '').trim() : '';",
    "      const dbLastName = customer ? String(customer.getString('last_name') || '').trim() : '';",
    "      ",
    "      if (dbFirstName && dbLastName) {",
    "        const fParts = dbFirstName.split(/\\s+/);",
    "        const lParts = dbLastName.split(/\\s+/);",
    "        pName = fParts[0] || '';",
    "        oName = fParts.slice(1).join(' ') || '';",
    "        pLastName = lParts[0] || '';",
    "        sLastName = lParts.slice(1).join(' ') || '';",
    "      } else {",
    "        const parts = String(custName).trim().split(/\\s+/);",
    "        if (parts.length === 1) {",
    "          pLastName = parts[0];",
    "          pName = 'N/A';",
    "        } else if (parts.length === 2) {",
    "          pName = parts[0];",
    "          pLastName = parts[1];",
    "        } else if (parts.length === 3) {",
    "          pName = parts[0];",
    "          pLastName = parts[1];",
    "          sLastName = parts[2];",
    "        } else {",
    "          pName = parts[0];",
    "          oName = parts[1];",
    "          pLastName = parts[2];",
    "          sLastName = parts.slice(3).join(' ');",
    "        }",
    "      }",
    "      adqNamesXml = `",
    "    <ADQ_6>\${escXml(pLastName)}</ADQ_6>",
    "    <ADQ_7>\${escXml(sLastName)}</ADQ_7>",
    "    <ADQ_8>\${escXml(pName)}</ADQ_8>",
    "    <ADQ_9>\${escXml(oName)}</ADQ_9>\`;",
    "    } else {",
    "      adqNamesXml = `",
    "    <ADQ_6>\${escXml(custName)}</ADQ_6>\`;",
    "    }"
  ];

  const newLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (i === standardStart) {
      newLines.push(...standardReplacement);
      i = standardEnd - 1; // skip lines up to standardEnd
    } else if (i === posStart) {
      newLines.push(...posReplacement);
      i = posEnd - 1; // skip lines up to posEnd
    } else {
      newLines.push(lines[i]);
    }
  }

  fs.writeFileSync('pb_hooks/dian.pb.js', newLines.join('\r\n'), 'utf8');
  console.log("Successfully patched name splitting logic in dian.pb.js!");
} else {
  console.log("Error: ADQ starts not found.");
}
