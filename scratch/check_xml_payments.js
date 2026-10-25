const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db');
db.get("SELECT xml_content FROM einvoice_docs WHERE id = 'l2u7td19o9njyai'", (err, row) => {
  if (err || !row) return console.error(err || 'No doc');
  const xml = row.xml_content;
  console.log('Total XML length:', xml.length);
  
  const mMeans = xml.match(/<cac:PaymentMeans>[\s\S]*?<\/cac:PaymentMeans>/g);
  console.log('PaymentMeans in XML:', mMeans);
  
  const mTerms = xml.match(/<cac:PaymentTerms>[\s\S]*?<\/cac:PaymentTerms>/g);
  console.log('PaymentTerms in XML:', mTerms);
  
  const mDue = xml.match(/<cbc:PaymentDueDate>.*?<\/cbc:PaymentDueDate>/g);
  console.log('PaymentDueDate occurrences:', mDue);
  
  const mDur = xml.match(/<cbc:DurationMeasure.*?<\/cbc:DurationMeasure>/g);
  console.log('DurationMeasure occurrences:', mDur);
  
  db.close();
});
