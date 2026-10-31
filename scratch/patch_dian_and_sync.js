const fs = require('fs');
const path = require('path');

const dianFile = path.resolve('pb_hooks', 'dian.pb.js');
let content = fs.readFileSync(dianFile, 'utf8');

// 1. Replace resend-email try block
const resendTarget = `  try {
    sendInvoiceEmailHelper(txId, body.email || body.custEmail);
    e.json(200, { success: true, message: "Correo reenviado exitosamente." });
  } catch (err) {`;

const resendReplacement = `  try {
    let fnSend = null;
    try {
      const { sendInvoiceEmailHelper: mailerHelper } = require(\`\${__hooks}/dian_mailer.js\`);
      fnSend = mailerHelper;
    } catch (_) {}
    if (!fnSend && typeof sendInvoiceEmailHelper === 'function') fnSend = sendInvoiceEmailHelper;
    if (!fnSend && typeof globalThis.sendInvoiceEmailHelper === 'function') fnSend = globalThis.sendInvoiceEmailHelper;

    if (!fnSend) {
      throw new Error("El servicio de envío de correos (sendInvoiceEmailHelper) no está disponible.");
    }

    fnSend(txId, body.email || body.custEmail);
    e.json(200, { success: true, message: "Correo reenviado exitosamente." });
  } catch (err) {`;

if (content.includes(resendTarget)) {
  content = content.replace(resendTarget, resendReplacement);
  console.log("[+] Replaced resend-email helper invocation");
} else {
  console.warn("[-] resendTarget not found verbatim in dian.pb.js");
}

fs.writeFileSync(dianFile, content, 'utf8');
console.log("[+] pb_hooks/dian.pb.js updated successfully.");

// Copy dian_mailer.js and dian.pb.js to all tenants
const mailerSrc = path.resolve('pb_hooks', 'dian_mailer.js');
const dianSrc = path.resolve('pb_hooks', 'dian.pb.js');

const tenants = ['8091', '8092', '8093', '8094'];
tenants.forEach(port => {
  const tDir = path.resolve('empresas', `empresa_${port}`, 'pb_hooks');
  if (fs.existsSync(tDir)) {
    fs.copyFileSync(mailerSrc, path.join(tDir, 'dian_mailer.js'));
    fs.copyFileSync(dianSrc, path.join(tDir, 'dian.pb.js'));
    console.log(`[+] Sincronizado tenant ${port}`);
  }
});
console.log("[OK] Sincronización multi-tenant completa.");

