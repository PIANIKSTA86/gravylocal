const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const empIds = [
  'gyilekodzdj1sde', 'cz5t165sse24oa2', 'vsu8bz83547sxrn',
  'b6c3mvlw6b9rodf', 'v21xfu4abpcba2f', 'j8jctmcchsrgm5b',
  'waykc023e9kpeen', 'cm6g6vpckf15ct8', 'quzokljc9p33j75'
];

empIds.forEach(id => {
  const row = db.prepare("SELECT * FROM third_parties WHERE id = ?").get(id);
  console.log(`\n=== EMPLOYEE ${row.name} (${row.id}) ===`);
  for (const [k, v] of Object.entries(row)) {
    if (v !== '' && v !== null && v !== 0 && v !== false) {
      console.log(`  ${k}: ${v}`);
    }
  }
});

