const fs = require('fs');

const path = 'frontend/src/api.ts';
let content = fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

const target = `    const findAccByCode = async (code: string) => {
      if (!String(code || '').trim()) throw new Error('Hay una cuenta sin código en la configuración de compras.');
      const key = String(code).trim();
      if (accountByCodeCache[key]) return accountByCodeCache[key];
      const safeCode = pb.escapeFilterValue(key);
      const res = await pb.list('accounts', { filter: \`code="\${safeCode}"\`, perPage: 1 });
      if (!res.items.length) {
        // Fallback por prefijo si la subcuenta no existe
        const prefixSafe = safeCode.length > 4 ? safeCode.substring(0, 4) : safeCode;
        const resPref = await pb.list('accounts', { filter: \`code ~ "\${prefixSafe}"\`, perPage: 1 });
        if (resPref.items.length) {
          accountByCodeCache[key] = resPref.items[0];
          accountByIdCache[resPref.items[0].id] = resPref.items[0];
          return resPref.items[0];
        }
        throw new Error(\`Cuenta contable \${key} no encontrada en el plan de cuentas.\`);
      }
      accountByCodeCache[key] = res.items[0];
      accountByIdCache[res.items[0].id] = res.items[0];
      return res.items[0];
    };`;

const replacement = `    const findAccByCode = async (code: string) => {
      if (!String(code || '').trim()) throw new Error('Hay una cuenta sin código en la configuración de compras.');
      const key = String(code).trim();
      if (accountByCodeCache[key]) return accountByCodeCache[key];
      const safeCode = pb.escapeFilterValue(key);
      const res = await pb.list('accounts', { filter: \`code="\${safeCode}" && active=true\`, perPage: 1 });
      let candidate = res.items.length ? res.items[0] : null;

      // Si la cuenta encontrada es de mayor (<= 4 dígitos) o no existe exacta, buscar un auxiliar activo (longitud >= 6)
      const candidateDigits = candidate ? String(candidate.code || '').replace(/\\D/g, '') : '';
      if (!candidate || candidateDigits.length <= 4) {
        const prefixSafe = safeCode.length > 4 ? safeCode.substring(0, 4) : safeCode;
        const resPref = await pb.list('accounts', { filter: \`code ~ "\${prefixSafe}" && active=true\`, sort: '-code', perPage: 20 });
        const bestAux = resPref.items.find((a: any) => String(a.code || '').replace(/\\D/g, '').length >= 6);
        if (bestAux) {
          candidate = bestAux;
        } else if (!candidate) {
          throw new Error(\`Cuenta contable \${key} no encontrada o inactiva en el plan de cuentas.\`);
        }
      }

      accountByCodeCache[key] = candidate;
      accountByIdCache[candidate.id] = candidate;
      return candidate;
    };`;

if (!content.includes(target)) {
  console.error('Target not found!');
  process.exit(1);
}

content = content.replace(target, replacement);
fs.writeFileSync(path, content.replace(/\n/g, '\r\n'), 'utf8');
console.log('Successfully updated findAccByCode in api.ts');
