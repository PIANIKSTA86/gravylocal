const { createWorker } = require('tesseract.js');
const fs = require('fs');
const path = require('path');

async function run() {
  const screenshotsDir = 'c:\\Users\\JULIAN\\Desktop\\GravyLocal2.0\\Landing\\screenshots';
  const files = fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png'));

  console.log('Initializing Tesseract worker...');
  let worker;
  try {
    worker = await createWorker('spa');
  } catch (err) {
    console.log('Failed to init spa worker, trying eng...');
    worker = await createWorker('eng');
  }

  for (const file of files) {
    const filePath = path.join(screenshotsDir, file);
    console.log(`========================================`);
    console.log(`FILE: ${file}`);
    console.log(`----------------------------------------`);
    try {
      const { data: { text } } = await worker.recognize(filePath);
      console.log(text);
    } catch (err) {
      console.error('Error recognizing:', err);
    }
    console.log(`========================================\n`);
  }

  await worker.terminate();
  console.log('Done!');
}

run().catch(console.error);
