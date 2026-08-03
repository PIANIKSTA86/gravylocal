/**
 * migrate_email_sent_fields.js
 * Adds email_sent (boolean) and email_sent_at (text) columns to the
 * einvoice_docs table in SQLite, and registers them in PocketBase metadata.
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'pb_data', 'data.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) { console.error('Error opening DB:', err); process.exit(1); }
});

db.serialize(() => {
  // 1. Add columns to SQLite table (ignore if already exist)
  db.run("ALTER TABLE einvoice_docs ADD COLUMN email_sent INTEGER DEFAULT 0", (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding email_sent column:', err.message);
    } else {
      console.log('✅ Column email_sent: OK');
    }
  });

  db.run("ALTER TABLE einvoice_docs ADD COLUMN email_sent_at TEXT DEFAULT ''", (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding email_sent_at column:', err.message);
    } else {
      console.log('✅ Column email_sent_at: OK');
    }
  });

  // 2. Update PocketBase collection metadata (fields JSON)
  db.get("SELECT id, fields FROM _collections WHERE name = 'einvoice_docs'", (err, row) => {
    if (err || !row) {
      console.error('Could not find einvoice_docs collection in _collections:', err);
      db.close();
      return;
    }

    let fields = [];
    try {
      fields = JSON.parse(row.fields || '[]');
    } catch (e) {
      console.error('Error parsing fields JSON:', e);
      db.close();
      return;
    }

    const hasEmailSent = fields.some(f => f.name === 'email_sent');
    const hasEmailSentAt = fields.some(f => f.name === 'email_sent_at');

    if (!hasEmailSent) {
      fields.push({
        id: 'email_sent_bool',
        name: 'email_sent',
        type: 'bool',
        required: false,
        presentable: false,
        options: {}
      });
      console.log('✅ PocketBase field email_sent added to metadata');
    } else {
      console.log('ℹ️  PocketBase field email_sent already registered');
    }

    if (!hasEmailSentAt) {
      fields.push({
        id: 'email_sent_at_txt',
        name: 'email_sent_at',
        type: 'text',
        required: false,
        presentable: false,
        options: { min: null, max: null, pattern: '' }
      });
      console.log('✅ PocketBase field email_sent_at added to metadata');
    } else {
      console.log('ℹ️  PocketBase field email_sent_at already registered');
    }

    db.run(
      "UPDATE _collections SET fields = ? WHERE id = ?",
      [JSON.stringify(fields), row.id],
      (updateErr) => {
        if (updateErr) {
          console.error('Error updating _collections fields:', updateErr);
        } else {
          console.log('✅ PocketBase _collections metadata updated');
        }
        db.close();
        console.log('\n🎉 Migration complete. Restart PocketBase to apply schema changes.');
      }
    );
  });
});
