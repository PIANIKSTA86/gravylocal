const fs = require('fs');

function dumpAllBlocks(step) {
  const f = `C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\${step}\\content.md`;
  if (!fs.existsSync(f)) return;
  const txt = fs.readFileSync(f, 'utf8');
  const blocks = txt.match(/<code class="codeBlockLines[^"]*"[^>]*>([\s\S]*?)<\/code>/g) || [];
  console.log(`\n================ STEP ${step} (${blocks.length} blocks) ================`);
  blocks.forEach((b, idx) => {
    const clean = b.replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
    console.log(`--- Block ${idx} ---`);
    console.log(clean.slice(0, 1500));
  });
}

dumpAllBlocks('446');
dumpAllBlocks('442');
