const express = require('express');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const BASE_DIR = path.resolve(__dirname, '..');
const EMPRESAS_DIR = path.join(BASE_DIR, 'empresas');
const PB_HOOKS_DIR = path.join(BASE_DIR, 'pb_hooks');
const PB_PUBLIC_DIR = path.join(BASE_DIR, 'pb_public');

if (!fs.existsSync(EMPRESAS_DIR)) {
  fs.mkdirSync(EMPRESAS_DIR);
}

// Store active processes
const activeProcesses = {};

app.post('/api/orchestrate/create', async (req, res) => {
  try {
    const { name, nit, color, modules, email, password } = req.body;
    
    // Find next available port starting from 8091
    let port = 8091;
    while (true) {
      const isTaken = Object.values(activeProcesses).some(p => p.port === port);
      if (!isTaken) {
        // Double check if directory exists
        if (!fs.existsSync(path.join(EMPRESAS_DIR, `empresa_${port}`))) {
          break;
        }
      }
      port++;
    }

    const companyDir = path.join(EMPRESAS_DIR, `empresa_${port}`);
    const companyPbData = path.join(companyDir, 'pb_data');
    const companyPbHooks = path.join(companyDir, 'pb_hooks');
    
    fs.mkdirSync(companyDir, { recursive: true });
    fs.mkdirSync(companyPbData, { recursive: true });
    
    // Create isolated pb_hooks for this tenant
    // We copy standard pb_hooks to the new company's pb_hooks dir
    fs.cpSync(PB_HOOKS_DIR, companyPbHooks, { recursive: true });
    
    // Add seed script for the initial user
    const seedScript = `
onBootstrap((e) => {
  e.next();
  try {
    const users = $app.findCollectionByNameOrId("users");
    let existing;
    try { existing = $app.findFirstRecordByData("users", "email", "${email}"); } catch(_) {}
    if (!existing) {
      const rec = new Record(users, {
        email: "${email}",
        role: "admin",
        full_name: "Super Admin",
        active: true
      });
      rec.setPassword("${password}");
      $app.save(rec);
      console.log("[GRAVY ORCHESTRATOR] Seeded initial user ${email} in tenant ${port}");
    }
  } catch(err) {
    console.error("[GRAVY ORCHESTRATOR] Error seeding user:", err);
  }
});
    `;
    fs.writeFileSync(path.join(companyPbHooks, 'zz_seed_user.pb.js'), seedScript);

    // Update settings in setup.pb.js to use the new company name
    const setupScriptPath = path.join(companyPbHooks, 'setup.pb.js');
    if (fs.existsSync(setupScriptPath)) {
      let setupContent = fs.readFileSync(setupScriptPath, 'utf8');
      setupContent = setupContent.replace(/const settingsData = \[([\s\S]*?)\];/, () => {
        return `const settingsData = [
          { key: "company_name", value: "${name}" },
          { key: "company_nit", value: "${nit}" },
          { key: "company_address", value: "Por definir" },
          { key: "company_phone", value: "" },
          { key: "company_email", value: "${email}" },
          { key: "currency", value: "COP" },
          { key: "fiscal_year", value: "2026" },
          { key: "closing_month", value: "12" },
        ];`;
      });
      fs.writeFileSync(setupScriptPath, setupContent);
    }

    // Spawn PocketBase
    const pbExe = path.join(BASE_DIR, 'pocketbase.exe');
    console.log(`Starting PocketBase for ${name} on port ${port}...`);
    
    const pbProcess = spawn(pbExe, [
      'serve',
      `--http=127.0.0.1:${port}`,
      `--dir=${companyPbData}`,
      `--hooksDir=${companyPbHooks}`,
      `--publicDir=${PB_PUBLIC_DIR}`
    ], {
      cwd: companyDir,
      detached: true, // run independent of orchestrator
      stdio: 'ignore'
    });
    
    pbProcess.unref();

    // Register active process
    activeProcesses[port] = { port, pid: pbProcess.pid };
    
    // Add to start.bat so it survives reboots
    const startBatPath = path.join(BASE_DIR, 'start.bat');
    let startBat = fs.readFileSync(startBatPath, 'utf8');
    
    const startCmd = `echo  Iniciando Empresa: ${name} (localhost:${port})...\r\nstart "Gravy Empresa ${port}" cmd /k "cd /d "%ROOT%" && pocketbase.exe serve --http=127.0.0.1:${port} --dir="%ROOT%empresas\\empresa_${port}\\pb_data" --publicDir="%ROOT%pb_public" --hooksDir="%ROOT%empresas\\empresa_${port}\\pb_hooks""`;
    
    if (!startBat.includes(`empresa_${port}`)) {
      startBat = startBat.replace('echo.\r\necho  URLs locales:', `${startCmd}\r\n\r\necho.\r\necho  URLs locales:`);
      fs.writeFileSync(startBatPath, startBat);
    }

    res.json({
      success: true,
      port: port,
      url: `http://localhost:${port}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

const ORCHESTRATOR_PORT = 8088;
app.listen(ORCHESTRATOR_PORT, () => {
  console.log(`GRAVY Orchestrator running on port ${ORCHESTRATOR_PORT}`);
});
