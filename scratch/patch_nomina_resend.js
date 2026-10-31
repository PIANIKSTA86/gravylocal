const fs = require('fs');
const path = require('path');

const nominaFile = path.resolve('frontend', 'src', 'modules', 'nomina.ts');
let content = fs.readFileSync(nominaFile, 'utf8');

const targetStr = `(window as any).resendNominaEmail = async function(id) {
  try {
    const rec = await pb.get('electronic_payrolls', id, { expand: 'employee_id' });
    const emp = rec.expand?.employee_id || {};
    const defaultEmail = emp.email || '';

    const email = prompt(\`Ingresa el correo electrónico para enviar el comprobante de nómina de \${emp.name || 'Empleado'}:\`, defaultEmail);
    if (!email || !email.trim()) return;

    showToast(\`Enviando comprobante de nómina a \${email.trim()}...\`, 'info');
    const res = await pb.send('/api/dian/nomina/resend-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, email: email.trim() })
    });
    if (res && res.success) {
      showToast(res.message || 'Correo enviado exitosamente.', 'success');
    } else {
      showToast(res.message || 'Error al enviar correo.', 'error');
    }
  } catch (err) {
    showToast(err.message || 'Error al enviar correo.', 'error');
  }
};`;

const replacementStr = `(window as any).resendNominaEmail = async function(id) {
  try {
    showToast('Consultando información del comprobante...', 'info');
    const rec = await pb.get('electronic_payrolls', id, { expand: 'employee_id' });
    const emp = rec.expand?.employee_id || {};
    const defaultEmail = emp.email || '';
    const empName = emp.name || emp.first_name || 'Empleado';
    const prefijo = rec.prefijo || 'NOM';
    const consecutivo = rec.consecutivo || 1;
    const docNumber = \`\${prefijo}-\${consecutivo}\`;

    const modalBody = \`
      <div class="space-y-4">
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <i class="fas fa-file-invoice-dollar text-emerald-600 mt-1"></i>
          <div class="text-xs text-emerald-800">
            <p class="font-bold text-sm text-emerald-900 mb-1">Envío de Comprobante de Nómina Electrónica</p>
            <p>Se enviará al colaborador su comprobante formal DIAN (desprendible y XML oficial) correspondiente al documento <strong>\${esc(docNumber)}</strong>.</p>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label font-bold text-gray-700 text-sm">Colaborador / Empleado</label>
          <input type="text" class="form-input w-full bg-gray-100 text-gray-600 cursor-not-allowed text-sm" value="\${esc(empName)}" disabled readonly>
        </div>

        <div class="form-group">
          <label class="form-label font-bold text-gray-700 text-sm">Correo Electrónico Destinatario <span class="text-red-500">*</span></label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <i class="fas fa-envelope"></i>
            </span>
            <input id="resend-nomina-email-input" type="email" class="form-input w-full pl-9 text-sm" placeholder="colaborador@empresa.com" value="\${esc(defaultEmail)}">
          </div>
          <p class="text-xs text-gray-400 mt-1">Confirme o modifique el correo para el envío de este comprobante.</p>
        </div>
      </div>
    \`;

    const modalFooter = \`
      <button class="btn btn-outline text-sm" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary text-sm flex items-center gap-1.5" id="btn-confirm-resend-nomina">
        <i class="fas fa-paper-plane"></i> Enviar Comprobante
      </button>
    \`;

    openModal(\`Enviar Nómina \${docNumber}\`, modalBody, modalFooter);

    setTimeout(() => {
      const input = document.getElementById('resend-nomina-email-input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 150);

    const btnSend = document.getElementById('btn-confirm-resend-nomina') as HTMLButtonElement;
    btnSend?.addEventListener('click', async () => {
      const emailInput = (document.getElementById('resend-nomina-email-input') as HTMLInputElement)?.value || '';
      const cleanEmail = emailInput.trim();
      
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!cleanEmail || !emailRegex.test(cleanEmail)) {
        return showToast('Por favor ingrese un correo electrónico válido (ej: nombre@dominio.com).', 'warning');
      }

      btnSend.disabled = true;
      btnSend.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

      try {
        const res = await pb.send('/api/dian/nomina/resend-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, email: cleanEmail })
        });

        if (res && res.success) {
          closeModal();
          showToast(res.message || \`Comprobante de nómina enviado exitosamente a \${cleanEmail}.\`, 'success');
        } else {
          btnSend.disabled = false;
          btnSend.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Comprobante';
          showToast(res?.message || 'Error al enviar comprobante de nómina.', 'error');
        }
      } catch (sendErr: any) {
        btnSend.disabled = false;
        btnSend.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Comprobante';
        showToast(sendErr.message || 'Error al conectar con el servidor para enviar nómina.', 'error');
      }
    });

  } catch (err: any) {
    showToast(err.message || 'Error al preparar el envío del comprobante.', 'error');
  }
};`;

// Normalize newlines for search
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = targetStr.replace(/\r\n/g, '\n');

if (!normalizedContent.includes(normalizedTarget)) {
  console.error("Target string not found in nomina.ts!");
  process.exit(1);
}

const updatedContent = normalizedContent.replace(normalizedTarget, replacementStr);
fs.writeFileSync(nominaFile, updatedContent, 'utf8');
console.log("[+] Successfully updated frontend/src/modules/nomina.ts");

