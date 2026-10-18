const fs = require('fs');

function inspectPayloads() {
  const steps = ['315', '319', '446', '442', '553'];
  for (const s of steps) {
    const f = `C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\${s}\\content.md`;
    if (!fs.existsSync(f)) continue;
    const txt = fs.readFileSync(f, 'utf8');
    const jsons = txt.match(/<code class="codeBlockLines[^>]*>([\s\S]*?)<\/code>/g) || [];
    console.log(`\n=== STEP ${s} CODE BLOCKS (${jsons.length} found) ===`);
    if (jsons.length > 0) {
      const clean = jsons[0].replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
      console.log(clean.slice(0, 1000));
    }
  }
}

inspectPayloads();
