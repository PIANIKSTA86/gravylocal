const fs = require('fs');
const path = require('path');

const hookPath = path.resolve('pb_hooks', 'ph_email.pb.js');
let code = fs.readFileSync(hookPath, 'utf8');

// 1. Remove all remaining occurrences of the destructive sqlDebt wipeout
const sqlDebtRegex = /\s*\/\/\s*Validación de deuda neta previa: si la unidad estaba a paz y salvo en cartera contable antes de este período, omitir saldo anterior[\s\S]*?if\s*\(\s*Number\(\s*resDebt\.net_cartera\s*\|\|\s*0\s*\)\s*<\s*0\.01\s*\)\s*\{\s*outstandingInvoices\s*=\s*\[\];\s*\}\s*\}\s*catch\s*\(_\)\s*\{\}\s*\}/g;

const matchCount = (code.match(sqlDebtRegex) || []).length;
console.log(`Found ${matchCount} sqlDebt wipeout blocks to remove.`);
code = code.replace(sqlDebtRegex, '');

// 2. Build the new clean executive buildPhEmailHtml function
const newBuildPhEmailHtmlBody = `  const numberText = (invoice && invoice.getString) ? (invoice.getString("number") || "") : (invoice?.number || "");
  const pName = propertyName || "Unidad";
  const oName = ownerName || "Copropietario";
  const cName = companyName || "Copropiedad";

  const list = conceptsList || [];
  const sAntVal = (typeof saldoAnterior !== 'undefined' && saldoAnterior !== null)
    ? Number(saldoAnterior)
    : list.reduce(function(s, c) { return s + (Number(c.saldoAnterior) || 0); }, 0);
  const cMesVal = (typeof cobrosMes !== 'undefined' && cobrosMes !== null)
    ? Number(cobrosMes)
    : list.reduce(function(s, c) { return s + (Number(c.cobrosMes) || 0); }, 0);
  const totVal = (typeof totalActual !== 'undefined' && totalActual !== null)
    ? Number(totalActual)
    : (sAntVal + cMesVal);

  const cleanFmt = function(value) {
    if (value === undefined || value === null || isNaN(Number(value))) return "0.00";
    var num = Number(value);
    var isNeg = num < 0;
    var absParts = Math.abs(num).toFixed(2).split('.');
    absParts[0] = absParts[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, ".");
    return (isNeg ? "- " : "") + absParts[0];
  };

  const numeroALetras = function(num) {
    var rawFloat = parseFloat(String(num));
    if (isNaN(rawFloat) || Math.abs(rawFloat) < 0.01) return 'SON: CERO PESOS M/CTE';
    var isNegative = rawFloat < 0;
    var absVal = Math.abs(rawFloat);
    var tempNum = absVal.toFixed(2).split('.');
    var entero = parseInt(tempNum[0], 10);
    if (entero === 0) return 'SON: CERO PESOS M/CTE';
    function letras(n) {
      if (n <= 0) return '';
      if (n < 10) return ['', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'][n] || '';
      if (n < 20) return ['Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve'][n - 10] || '';
      if (n < 30) return n === 20 ? 'Veinte' : 'Veinti' + letras(n - 20).toLowerCase();
      if (n < 100) {
        var u = n % 10;
        var d = Math.floor(n / 10);
        var decenas = ['', '', '', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
        return (decenas[d] || '') + (u > 0 ? ' y ' + letras(u).toLowerCase() : '');
      }
      if (n < 1000) {
        var d_u = n % 100;
        var c = Math.floor(n / 100);
        var centenas = ['', 'Cien', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos', 'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'];
        if (n === 100) return 'Cien';
        if (c === 1) return 'Ciento ' + letras(d_u).toLowerCase();
        return (centenas[c] || '') + (d_u > 0 ? ' ' + letras(d_u).toLowerCase() : '');
      }
      if (n < 1000000) {
        var mil = Math.floor(n / 1000);
        var resto = n % 1000;
        var t = mil === 1 ? 'Mil' : letras(mil) + ' mil';
        return t + (resto > 0 ? ' ' + letras(resto).toLowerCase() : '');
      }
      if (n < 1000000000) {
        var millon = Math.floor(n / 1000000);
        var resto = n % 1000000;
        var t = millon === 1 ? 'Un millón' : letras(mil) + ' millones';
        return t + (resto > 0 ? ' ' + letras(resto).toLowerCase() : '');
      }
      return String(n);
    }
    var res = letras(entero) || 'Cero';
    res = res.charAt(0).toUpperCase() + res.slice(1);
    var prefix = isNegative ? 'MENOS ' : '';
    return ('Son: ' + prefix + res + ' PESOS M/CTE').toUpperCase();
  };

  const pNameTitle = (periodName || '') + (periodYear ? (' ' + periodYear) : '');

  return \`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Estado de Cuenta — \${pName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px 12px; -webkit-text-size-adjust: 100%;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    
    <!-- Header Corporativo -->
    <div style="background-color: #0f172a; padding: 24px 28px; color: #ffffff;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: middle;">
            \${companyLogo 
              ? \`<img src="data:image/png;base64,\${companyLogo}" style="max-height: 52px; max-width: 160px; object-fit: contain; display: block; margin-bottom: 8px;" alt="Logo Copropiedad" />\`
              : ''
            }
            <div style="font-size: 16px; font-weight: 800; color: #ffffff; letter-spacing: -0.2px; text-transform: uppercase;">\${cName}</div>
            \${companyNit ? \`<div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">NIT \${companyNit}</div>\` : ''}
          </td>
          <td style="vertical-align: middle; text-align: right;">
            <div style="display: inline-block; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 6px 12px; text-align: right;">
              <div style="font-size: 9.5px; font-weight: 700; color: #93c5fd; text-transform: uppercase; letter-spacing: 0.5px;">ESTADO DE CUENTA</div>
              <div style="font-size: 13px; font-weight: 800; color: #ffffff; font-family: monospace;">No. \${numberText}</div>
              \${pNameTitle ? \`<div style="font-size: 9.5px; color: #cbd5e1; text-transform: uppercase; margin-top: 1px;">\${pNameTitle}</div>\` : ''}
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Contenido Principal -->
    <div style="padding: 28px 28px 20px 28px;">
      
      <!-- Saludo y Mensaje de Texto -->
      <div style="font-size: 14.5px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
        \${customMessageHtml ? customMessageHtml : \`
          <p style="margin: 0 0 12px 0;">Estimado(a) <strong>\${oName}</strong>,</p>
          <p style="margin: 0 0 12px 0;">Le compartimos su <strong>Estado de Cuenta integral</strong> correspondiente al período <strong>\${pNameTitle || 'facturado'}</strong> para la unidad <strong>\${pName}</strong>.</p>
        \`}
      </div>

      <!-- Aviso Importante de Administración -->
      \${customNoticeHtml ? \`
      <div style="margin-bottom: 22px; padding: 14px 16px; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 6px; font-size: 12.5px; line-height: 1.5; color: #92400e;">
        <div style="font-weight: 700; margin-bottom: 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.3px;">📢 Aviso Importante de la Administración</div>
        <div>\${customNoticeHtml}</div>
      </div>\` : ''}

      <!-- TARJETA RESUMEN DE LA CUENTA A PAGAR -->
      <div style="background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
        <div style="background-color: #f1f5f9; padding: 10px 16px; border-bottom: 1px solid #cbd5e1;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Resumen de Cobro</td>
              <td style="font-size: 11px; font-weight: 700; color: #475569; text-align: right;">Inmueble: <strong style="color: #0f172a;">\${pName}</strong></td>
            </tr>
          </table>
        </div>
        
        <div style="padding: 16px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 14px;">
            <tr style="border-bottom: 1px dashed #e2e8f0;">
              <td style="padding: 7px 0; color: #64748b;">Saldo Anterior (Meses anteriores):</td>
              <td style="padding: 7px 0; text-align: right; font-weight: 700; font-family: monospace; \${sAntVal > 0.01 ? 'color: #b91c1c;' : (sAntVal < -0.01 ? 'color: #047857;' : 'color: #334155;')}">
                \${sAntVal > 0.01 ? '+ $ ' + cleanFmt(sAntVal) : (sAntVal < -0.01 ? '- $ ' + cleanFmt(Math.abs(sAntVal)) : '$ 0 (Al día)')}
              </td>
            </tr>
            <tr style="border-bottom: 1px dashed #e2e8f0;">
              <td style="padding: 7px 0; color: #64748b;">Cobros del Mes (\${pNameTitle || 'Actual'}):</td>
              <td style="padding: 7px 0; text-align: right; font-weight: 700; font-family: monospace; color: #334155;">
                $ \${cleanFmt(cMesVal)}
              </td>
            </tr>
            \${dueDate ? \`
            <tr>
              <td style="padding: 7px 0; color: #64748b;">Fecha Límite / Vencimiento:</td>
              <td style="padding: 7px 0; text-align: right; font-weight: 700; color: #334155;">
                \${dueDate}
              </td>
            </tr>\` : ''}
          </table>

          <!-- Bloque Total Destacado -->
          <div style="background-color: #0f172a; border-radius: 8px; padding: 14px 18px; color: #ffffff;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle;">
                  <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">TOTAL A PAGAR</div>
                  <div style="font-size: 10px; color: #cbd5e1; margin-top: 2px; text-transform: uppercase;">\${numeroALetras(totVal)}</div>
                </td>
                <td style="vertical-align: middle; text-align: right;">
                  <div style="font-size: 22px; font-weight: 800; color: #ffffff; font-family: monospace; letter-spacing: -0.5px;">
                    $ \${cleanFmt(totVal)}
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <!-- Callout de Archivo PDF Adjunto -->
      <div style="background-color: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; margin-bottom: 22px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 28px; vertical-align: middle; font-size: 18px;">📎</td>
            <td style="vertical-align: middle; font-size: 12.5px; color: #1e40af; line-height: 1.4;">
              <strong>Archivo PDF oficial adjunto:</strong> Encuentre anexo el <strong>Estado de Cuenta oficial</strong> con el detalle completo de saldos anteriores, movimientos y conceptos discriminados.
            </td>
          </tr>
        </table>
      </div>

      <!-- Instrucciones de Pago -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-bottom: 18px;">
        <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
          💳 Instrucciones de Pago
        </div>
        <div style="font-size: 11.5px; line-height: 1.5; color: #475569; font-style: italic; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px;">
          \${customNotes ? customNotes.replace(/\\n/g, '<br>') : 'CONSIGNAR EN LAS CUENTAS BANCARIAS AUTORIZADAS DE LA COPROPIEDAD INDICANDO LA REFERENCIA DE UNIDAD PARA RECAUDO.'}
        </div>
      </div>

      <!-- Despedida -->
      <div style="font-size: 12.5px; color: #64748b; line-height: 1.5;">
        Agradecemos realizar su pago oportunamente.<br>
        <strong>Administración \${cName}</strong>
      </div>

    </div>

    <!-- Footer de Software -->
    <div style="background-color: #f1f5f9; padding: 12px 20px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #64748b; text-align: center;">
      Documento emitido por GRAVY v2.0 | Desarrollado por JULIAN ESPINOSA ARRUBLA, NIT. 1130636393-2 — Sistema Integral de Control y Gestión de Propiedad Horizontal.
    </div>

  </div>
</body>
</html>\`;`;

// Replace all 3 buildPhEmailHtml definitions with the new executive implementation
const buildPhEmailRegex = /(?:function|const)\s+buildPhEmailHtml\s*=\s*(?:function\s*)?\([\s\S]*?\)\s*\{[\s\S]*?return\s*`[\s\S]*?<\/html>`;\s*\}/g;
const bCount = (code.match(buildPhEmailRegex) || []).length;
console.log(`Found ${bCount} buildPhEmailHtml definitions.`);

let replacedB = 0;
code = code.replace(buildPhEmailRegex, (match) => {
  replacedB++;
  return `function buildPhEmailHtml({\n  invoice,\n  conceptsList,\n  propertyName,\n  propertyCode,\n  propertyArea,\n  propertyCoef,\n  propertyMatricula,\n  ownerName,\n  ownerDocNumber,\n  ownerAddress,\n  ownerPhone,\n  companyName,\n  companyNit,\n  companyAddress,\n  companyPhone,\n  companyEmail,\n  companyCity,\n  companyLogo,\n  totalActual,\n  saldoAnterior,\n  cobrosMes,\n  dueDate,\n  periodName,\n  periodYear,\n  notes: customNotes,\n  customMessageHtml,\n  customNoticeHtml\n}) {\n${newBuildPhEmailHtmlBody}\n}`;
});
console.log(`Replaced ${replacedB} buildPhEmailHtml functions.`);

// 3. In generatePhPdfAttachment (all occurrences): ensure docType is ALWAYS 'statement' and filename is ALWAYS EstadoCuenta_
const genPdfRegex = /const\s+numberText\s*=\s*invoice\.getString\("number"\)\s*\|\|\s*"cuenta";\s*const\s+docType\s*=\s*type\s*\|\|\s*'invoice';\s*const\s+filename\s*=\s*`\$\{docType\s*===\s*'statement'\s*\?\s*'EstadoCuenta'\s*:\s*'CuentaCobro'\}_\$\{numberText\}`;/g;
code = code.replace(genPdfRegex, `const numberText = invoice.getString("number") || "cuenta";\n    const docType = 'statement';\n    const filename = \`EstadoCuenta_\${numberText}\`;`);

// Also ensure statementData.docType in generatePhPdfAttachment is 'statement'
code = code.replace(/statementData:\s*\{([\s\S]*?)docType,/g, `statementData: {\n          docType: 'statement',`);

// 4. In send-invoice-email:
// Change: const type = String(body?.type || 'invoice').trim();
code = code.replace(/const\s+type\s*=\s*String\(body\?\.type\s*\|\|\s*'invoice'\)\.trim\(\);/g, `const type = 'statement';\n  const customMessage = String(body?.message || '').trim();`);

// Unconditionally fetch outstandingInvoices in send-invoice-email and download-invoice-pdf
code = code.replace(/const\s+outstandingInvoices\s*=\s*\[\];\s*if\s*\(\s*type\s*===\s*'statement'\s*\)\s*\{/g, `const outstandingInvoices = [];\n    {`);

// In send-invoice-email: interpolate customMessage and tokens, and pass saldoAnterior, cobrosMes, dueDate, periodName, periodYear to buildPhEmailHtml
const targetSendInvoiceHtmlCall = `    const docLabel = type === 'statement' ? 'Estado de Cuenta' : 'Cuenta de Cobro';
    const emailSubject = customSubject || \`\${companyName} - \${docLabel} No. \${invoice.getString("number")} - Unidad \${prop.getString("name")}\`;`;

const newSendInvoiceEmailCall = `    const saldoAnterior = conceptsList.reduce(function(s, c) { return s + (c.saldoAnterior || 0); }, 0);
    const cobrosMes = conceptsList.reduce(function(s, c) { return s + (c.cobrosMes || 0), 0; }, 0);
    const totalPagar = totalActual;
    const periodParts = String(invoice.getString("period") || "").split("-");
    const periodMonthName = getMonthNameUpper(invoice.getString("period"));
    const periodYear = periodParts.length > 0 ? periodParts[0] : "";
    const periodLabel = periodMonthName + (periodYear ? (" " + periodYear) : "");
    const dueDateFormatted = fmtDateDDMMYYYY(invoice.getString("due_date") || invoice.getString("date"));

    const defaultSubjectTemplate = getSetting("ph_email_template_statement_subject", "") || "{copropiedad} — Estado de Cuenta {periodo} — Unidad {unidad}";
    const defaultBodyTemplate = getSetting("ph_email_template_statement_body", "") || "Estimado(a) {propietario},\\n\\nLe compartimos su estado de cuenta integral correspondiente al período {periodo} para la unidad {unidad}.\\n\\n{aviso_adicional}\\n\\nAdjunto a este correo encontrará su documento oficial en formato PDF.\\n\\nInstrucciones de Pago:\\n{instrucciones_pago}\\n\\nAgradecemos realizar su pago oportunamente.\\nAtentamente,\\nAdministración {copropiedad}";
    const rawNotice = getSetting("ph_email_monthly_notice", "");

    const interpolatePhTokens = function(templateStr, ctx) {
      if (!templateStr) return "";
      let res = String(templateStr);
      res = res.replace(/\\{aviso_adicional\\}/gi, ctx.noticeText || "");
      res = res.replace(/\\{propietario\\}/gi, ctx.ownerName || "Copropietario");
      res = res.replace(/\\{unidad\\}/gi, ctx.unitName || "Unidad");
      res = res.replace(/\\{periodo\\}/gi, ctx.periodLabel || "");
      res = res.replace(/\\{numero_factura\\}/gi, ctx.invoiceNumber || "");
      res = res.replace(/\\{total_mes\\}/gi, ctx.totalMesFmt || "$ 0");
      res = res.replace(/\\{saldo_anterior\\}/gi, ctx.saldoAnteriorFmt || "$ 0");
      res = res.replace(/\\{total_pagar\\}/gi, ctx.totalPagarFmt || "$ 0");
      res = res.replace(/\\{fecha_emision\\}/gi, ctx.dateFmt || "");
      res = res.replace(/\\{fecha_vencimiento\\}/gi, ctx.dueDateFmt || "");
      res = res.replace(/\\{copropiedad\\}/gi, ctx.companyName || "Copropiedad");
      res = res.replace(/\\{nit_copropiedad\\}/gi, ctx.companyNit || "");
      res = res.replace(/\\{instrucciones_pago\\}/gi, ctx.paymentInstructions || "");
      return res;
    };

    const tokenCtx = {
      ownerName: owner ? (owner.getString("name") || "Copropietario") : "Copropietario",
      unitName: prop.getString("name") || prop.getString("code") || "Unidad",
      periodLabel: periodLabel,
      invoiceNumber: invoice.getString("number"),
      totalMesFmt: fmtCurrency(cobrosMes),
      saldoAnteriorFmt: fmtCurrency(saldoAnterior),
      totalPagarFmt: fmtCurrency(totalPagar),
      dateFmt: fmtDateDDMMYYYY(invoice.getString("date")),
      dueDateFmt: dueDateFormatted,
      companyName: companyName,
      companyNit: companyNit,
      paymentInstructions: invoiceNotes,
      noticeText: rawNotice
    };

    const emailSubject = customSubject ? interpolatePhTokens(customSubject, tokenCtx) : interpolatePhTokens(defaultSubjectTemplate, tokenCtx);

    let messageParagraphsHtml = "";
    if (customMessage) {
      messageParagraphsHtml = customMessage.split('\\n').map(function(p) { return p.trim() ? \`<p style="margin: 0 0 8px 0;">\${p}</p>\` : ''; }).join('');
    } else {
      const interpolatedBody = interpolatePhTokens(defaultBodyTemplate, tokenCtx);
      messageParagraphsHtml = interpolatedBody.split('\\n').map(function(p) { return p.trim() ? \`<p style="margin: 0 0 8px 0;">\${p}</p>\` : ''; }).join('');
    }

    let noticeBlockHtml = "";
    if (rawNotice && (!defaultBodyTemplate.includes("{aviso_adicional}") || customMessage)) {
      noticeBlockHtml = rawNotice.split('\\n').map(function(p) { return p.trim() ? \`<p style="margin: 0 0 6px 0;">\${p}</p>\` : ''; }).join('');
    }`;

// Replace the buildPhEmailHtml call in send-invoice-email:
const oldBuildCallRegex = /const\s+htmlContent\s*=\s*buildPhEmailHtml\(\{\s*invoice,[\s\S]*?prevMonthName\s*\}\);\s*const\s+docLabel[\s\S]*?Unidad\s*\$\{prop\.getString\("name"\)\}`;/;

code = code.replace(oldBuildCallRegex, `${newSendInvoiceEmailCall}\n\n    const htmlContent = buildPhEmailHtml({\n      invoice,\n      conceptsList,\n      propertyName: prop.getString("name") || prop.getString("code") || "Unidad",\n      propertyCode: prop.getString("code") || "",\n      propertyArea: prop.getString("area_m2") || prop.getString("area") || "",\n      propertyCoef: prop.getString("coef_participacion") ? (prop.getString("coef_participacion") + "%") : "",\n      propertyMatricula: prop.getString("matricula") || "",\n      ownerName: owner ? owner.getString("name") : "Copropietario",\n      ownerDocNumber,\n      ownerAddress: owner ? owner.getString("address") : "",\n      ownerPhone,\n      companyName,\n      companyNit,\n      companyAddress,\n      companyPhone,\n      companyEmail,\n      companyCity,\n      companyLogo,\n      totalActual,\n      saldoAnterior,\n      cobrosMes,\n      dueDate: dueDateFormatted,\n      periodName: periodMonthName,\n      periodYear,\n      notes: invoiceNotes,\n      customMessageHtml: messageParagraphsHtml,\n      customNoticeHtml: noticeBlockHtml\n    });`);

// 5. In download-invoice-pdf:
// Ensure filename and docType
code = code.replace(/const\s+docType\s*=\s*type\s*\|\|\s*'invoice';\s*const\s+rawUnit\s*=\s*prop\.getString\("name"\)[\s\S]*?const\s+filename\s*=\s*`\$\{docType\s*===\s*'statement'\s*\?\s*'EstadoCuenta'\s*:\s*'CuentaCobro'\}_\$\{numberText\}_\$\{cleanUnit\}`;/g,
  `const docType = 'statement';\n    const rawUnit = prop.getString("name") || prop.getString("code") || "Unidad";\n    const cleanUnit = rawUnit.replace(/[^a-zA-Z0-9_\\-]/g, '_');\n    const filename = \`EstadoCuenta_\${numberText}_\${cleanUnit}\`;`);

fs.writeFileSync(hookPath, code, 'utf8');
console.log('Successfully updated pb_hooks/ph_email.pb.js!');

// 6. Sync changes to all tenant directories
const tenantHookPaths = [
  path.resolve('empresas', 'empresa_8091', 'pb_hooks', 'ph_email.pb.js'),
  path.resolve('empresas', 'empresa_8092', 'pb_hooks', 'ph_email.pb.js'),
  path.resolve('empresas', 'empresa_8093', 'pb_hooks', 'ph_email.pb.js'),
  path.resolve('empresas', 'empresa_8094', 'pb_hooks', 'ph_email.pb.js'),
  path.resolve('empresas', 'pb_hooks', 'ph_email.pb.js')
];

for (const dest of tenantHookPaths) {
  if (fs.existsSync(path.dirname(dest))) {
    fs.copyFileSync(hookPath, dest);
    console.log(`Copied updated hook to: ${dest}`);
  }
}
