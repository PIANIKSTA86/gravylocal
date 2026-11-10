const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const backupDbPath = 'pb_data/data_backup_before_ds_cruce_fix_1793191198719.db';
if (fs.existsSync(backupDbPath)) {
  const db = new DatabaseSync(backupDbPath);
  const tp = db.prepare("SELECT id, name, doc_number FROM third_parties WHERE id IN ('5996dibwttdpjg2', '4yi78j1v008eogt', 'wtfcr6m7wmw49qi', 't1hbrdpojdhv980', 'giyd2rz4d0gv7ik', 'bnfw0wuy9usg65y')").all();
  console.log('In backup DB third_parties:', tp);
} else {
  console.log('Backup DB not found');
}

