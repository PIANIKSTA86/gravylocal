const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("=========================================");
console.log("GRAVY DIAGNOSTIC: POCKETBASE & HOOKS");
console.log("=========================================\n");

// 1. Get running pocketbase.exe processes
const queryCmd = `powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process -Filter \\"name = 'pocketbase.exe'\\" | Select-Object ProcessId, ExecutablePath, CommandLine | ConvertTo-Json"`;

exec(queryCmd, (err, stdout) => {
  if (err) {
    console.error("Error query process list:", err.message);
    return;
  }

  let processes = [];
  try {
    processes = JSON.parse(stdout || '[]');
    if (!Array.isArray(processes)) {
      processes = [processes];
    }
  } catch (parseErr) {
    console.warn("No active pocketbase processes found or parsed.");
  }

  if (processes.length === 0) {
    console.log("[-] No se encontraron procesos 'pocketbase.exe' activos en memoria.");
    console.log("    Asegúrate de que el servidor está corriendo en este equipo.\n");
    return;
  }

  console.log(`[+] Se encontraron ${processes.length} procesos de PocketBase ejecutándose:`);
  
  processes.forEach((p, idx) => {
    console.log(`\n--- PROCESO #${idx + 1} (PID: ${p.ProcessId}) ---`);
    console.log(`Ruta ejecutable: ${p.ExecutablePath}`);
    console.log(`Línea de comando: ${p.CommandLine}`);

    // Parse hooksDir from command line
    let hooksDir = "";
    const hooksMatch = p.CommandLine.match(/--hooksDir=["']?([^"'\s]+)["']?/);
    if (hooksMatch) {
      hooksDir = hooksMatch[1];
    } else {
      // Default hooks dir is adjacent to executable
      const exeDir = path.dirname(p.ExecutablePath);
      hooksDir = path.join(exeDir, 'pb_hooks');
    }

    // Resolve hooks path relative to executable if necessary
    if (hooksDir.startsWith('%ROOT%') || hooksDir.startsWith('.')) {
      const cleanHooks = hooksDir.replace('%ROOT%', '').replace(/^\.\\/, '').replace(/^\.\//, '');
      const exeDir = path.dirname(p.ExecutablePath);
      hooksDir = path.resolve(exeDir, cleanHooks);
    } else if (!path.isAbsolute(hooksDir)) {
      const exeDir = path.dirname(p.ExecutablePath);
      hooksDir = path.resolve(exeDir, hooksDir);
    }

    console.log(`Ruta de Hooks resuelta: ${hooksDir}`);

    const dianHookFile = path.join(hooksDir, 'dian.pb.js');
    if (fs.existsSync(dianHookFile)) {
      console.log(`[OK] Archivo dian.pb.js ENCONTRADO en esta carpeta de hooks.`);
      const content = fs.readFileSync(dianHookFile, 'utf8');
      
      // Check if sendInvoiceEmailHelper is defined
      const hasHelper = content.includes("function sendInvoiceEmailHelper") || content.includes("const sendInvoiceEmailHelper");
      if (hasHelper) {
        console.log(`[OK] La función 'sendInvoiceEmailHelper' SÍ está declarada en este archivo.`);
      } else {
        console.log(`[ERROR] La función 'sendInvoiceEmailHelper' NO existe en este archivo.`);
      }

      // Check buildFtechPosXml
      const hasPosXml = content.includes("function buildFtechPosXml") || content.includes("const buildFtechPosXml");
      if (hasPosXml) {
        console.log(`[OK] La función 'buildFtechPosXml' SÍ existe en este archivo.`);
      } else {
        console.log(`[ERROR] La función 'buildFtechPosXml' NO existe en este archivo.`);
      }
    } else {
      console.log(`[ERROR] Archivo dian.pb.js NO EXISTE en esta carpeta de hooks.`);
    }
  });
  console.log("\n=========================================");
});
