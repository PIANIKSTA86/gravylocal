const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sqlite3 = require('sqlite3').verbose();

const testDir = path.join(__dirname, 'test_remap');

if (fs.existsSync(testDir)) {
  fs.rmSync(testDir, { recursive: true, force: true });
}

fs.mkdirSync(path.join(testDir, 'hub', 'pb_data'), { recursive: true });
fs.mkdirSync(path.join(testDir, 'empresas', 'empresa_8093'), { recursive: true });
fs.mkdirSync(path.join(testDir, 'empresas', 'empresa_8094'), { recursive: true });
fs.mkdirSync(path.join(testDir, 'pb_public'), { recursive: true });

// Copiar data.db original de prueba
fs.copyFileSync(
  path.join(__dirname, '..', 'hub', 'pb_data', 'data.db'),
  path.join(testDir, 'hub', 'pb_data', 'data.db')
);

console.log('1. Entorno de prueba preparado.');

// Ejecutar remapear_puertos.js
const nodeBin = path.join(__dirname, '..', 'bin', 'node.exe');
const remapperScript = path.join(__dirname, '..', 'scripts', 'remapear_puertos.js');

console.log('2. Ejecutando remapeo con puerto base 9090...');
const output = execSync(`"${nodeBin}" "${remapperScript}" --base-port 9090 --root "${testDir}"`, { encoding: 'utf8' });
console.log(output);

// Validar base de datos
console.log('3. Validando registros en SQLite...');
const db = new sqlite3.Database(path.join(testDir, 'hub', 'pb_data', 'data.db'));
db.all('SELECT name, port, url FROM companies', (err, rows) => {
  if (err) {
    console.error('Error consultando companies:', err);
    process.exit(1);
  }
  console.log('COMPANIES VALIDATION RESULT:');
  console.log(JSON.stringify(rows, null, 2));

  // Validar carpetas
  const folders = fs.readdirSync(path.join(testDir, 'empresas'));
  console.log('EMPRESAS FOLDERS:', folders);

  // Validar ports.env
  const portsEnv = fs.readFileSync(path.join(testDir, 'config', 'ports.env'), 'utf8');
  console.log('CONFIG PORTS.ENV:\n' + portsEnv);

  // Validar runtime config
  const runtimeConfig = fs.readFileSync(path.join(testDir, 'pb_public', 'gravy-runtime-config.js'), 'utf8');
  console.log('GRAVY RUNTIME CONFIG:\n' + runtimeConfig);

  db.close();

  // Aserciones
  const domestiko = rows.find(r => r.name.includes('DOMESTIKO'));
  const demoInmo = rows.find(r => r.name.includes('DEMO_INMO'));
  const arya = rows.find(r => r.name.includes('ARYA'));

  if (domestiko.port === 9090 && domestiko.url === 'http://localhost:9090' &&
      demoInmo.port === 9093 && demoInmo.url === 'http://localhost:9093' &&
      arya.port === 9094 && arya.url === 'http://localhost:9094' &&
      folders.includes('empresa_9093') && folders.includes('empresa_9094')) {
    console.log('\n>>> ¡TODAS LAS VALIDACIONES DE REMAPEO PASARON CON ÉXITO! <<<');
  } else {
    console.error('\n>>> ERROR EN LAS VALIDACIONES <<<');
    process.exit(1);
  }
});
