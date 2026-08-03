const fs = require('fs');
const path = require('path');

for (let i = 1; i <= 6; i++) {
  const file = `c:/Users/JULIAN/Desktop/GravyLocal2.0/scratch/decoded_xml_49_${i}.xml`;
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const adqMatch = content.match(/<ADQ>([\s\S]*?)<\/ADQ>/);
    if (adqMatch) {
      console.log(`--- XML 49_${i} ---`);
      const lines = adqMatch[1].split('\n').map(l => l.trim()).filter(l => l.startsWith('<ADQ_'));
      console.log(lines.join('\n'));
    }
  }
}
