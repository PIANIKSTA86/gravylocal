import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('pb_data/data.db');
const rTok = db.prepare("SELECT value FROM settings WHERE key = 'matias_api_token'").get();
const token = rTok?.value;
const baseUrl = 'https://api-v2.matias-api.com/api/ubl2.1';
const cune = 'f0917999b67720e82c07637fe5d8f82295df0fe7a38b898ba1ed515a7116a967bf3e1b0fc6b57b67df0de62d5c4e2d55';

async function run() {
  const res = await fetch(`${baseUrl}/documents/xml/${encodeURIComponent(cune)}`, {
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/json'
    }
  });
  const json = await res.json();
  const b64 = json.content?.XmlBytesBase64;
  if (b64) {
    const xml = Buffer.from(b64, 'base64').toString('utf8');
    // Save to scratch file for full inspection
    const fs = await import('node:fs');
    fs.writeFileSync('scratch/doc_373_dian.xml', xml, 'utf8');
    console.log('Saved scratch/doc_373_dian.xml, length:', xml.length);
  }
}

run();

