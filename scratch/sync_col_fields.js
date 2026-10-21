const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.get("SELECT fields FROM _collections WHERE name='purchase_invoices'", (err, row) => {
  if (err) {
    console.error('Error fetching collection:', err);
    db.close();
    return;
  }

  const fields = JSON.parse(row.fields);
  const newFields = [
    { name: 'status_dian', id: 'text_status_dian' },
    { name: 'cuds', id: 'text_cuds' },
    { name: 'dian_response', id: 'text_dian_response' },
    { name: 'xml_content', id: 'text_xml_content' }
  ];

  let added = 0;
  for (const nf of newFields) {
    if (!fields.some(f => f.name === nf.name)) {
      fields.push({
        autogeneratePattern: '',
        help: '',
        hidden: false,
        id: nf.id,
        max: 0,
        min: 0,
        name: nf.name,
        pattern: '',
        presentable: false,
        primaryKey: false,
        required: false,
        system: false,
        type: 'text'
      });
      added++;
    }
  }

  if (added > 0) {
    const updatedJson = JSON.stringify(fields);
    db.run("UPDATE _collections SET fields = ? WHERE name = 'purchase_invoices'", [updatedJson], (updateErr) => {
      if (updateErr) console.error('Error updating _collections:', updateErr);
      else console.log(`Successfully added ${added} fields to _collections for purchase_invoices!`);
      db.close();
    });
  } else {
    console.log('All fields already present in _collections.');
    db.close();
  }
});
