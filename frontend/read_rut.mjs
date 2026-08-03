import * as fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

function parseRUTText(items) {
  const rut = {
    doc_number: '',
    dv: '',
    first_name: '',
    last_name: '',
    business_name: '',
    commercial_name: '',
    address: '',
    email: '',
    phone: '',
    ciiu: '',
    department: '',
    city: '',
    responsabilidades: []
  };

  const rowsMap = new Map();
  for (const item of items) {
    const y = Math.round(item.transform[5]);
    const x = Math.round(item.transform[4]);
    const str = item.str.trim();
    if (!str) continue;

    let foundY = y;
    for (const existingY of rowsMap.keys()) {
      if (Math.abs(existingY - y) <= 4) {
        foundY = existingY;
        break;
      }
    }
    if (!rowsMap.has(foundY)) {
      rowsMap.set(foundY, []);
    }
    rowsMap.get(foundY).push({ str, x, y });
  }

  const sortedY = Array.from(rowsMap.keys()).sort((a, b) => b - a);
  const rows = sortedY.map(y => {
    const rowItems = rowsMap.get(y).sort((a, b) => a.x - b.x);
    return {
      y,
      items: rowItems,
      text: rowItems.map(item => item.str).join(" "),
      rawText: rowItems.map(item => item.str).join("")
    };
  });

  // Find NIT
  for (const row of rows) {
    const matches = row.text.match(/(\d\s+){6,9}\d/);
    if (matches) {
      const cleanNum = matches[0].replace(/\s+/g, "");
      if (cleanNum.length >= 7 && cleanNum.length <= 10) {
        rut.doc_number = cleanNum;
        break;
      }
    }
  }

  if (!rut.doc_number) {
    for (const row of rows) {
      const cleanText = row.text.replace(/\s+/g, "");
      const matches = cleanText.match(/\b\d{7,10}\b/);
      if (matches) {
        rut.doc_number = matches[0];
        break;
      }
    }
  }

  // Calculate DV
  if (rut.doc_number) {
    const nit = rut.doc_number;
    const vpri = [0, 3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
    let x = 0;
    let y = 0;
    const z = nit.length;
    for (let i = 0; i < z; i++) {
      y = parseInt(nit.charAt(z - 1 - i), 10);
      x += y * vpri[i + 1];
    }
    y = x % 11;
    rut.dv = (y > 1) ? String(11 - y) : String(y);
  }

  // Person Type
  let isNatural = true;
  for (const row of rows) {
    if (row.text.includes("Persona natural") || row.text.includes("Cédula de Ciudadanía")) {
      isNatural = true;
      break;
    }
    if (row.text.includes("Persona jurídica")) {
      isNatural = false;
      break;
    }
  }

  // Names / Last names
  if (isNatural) {
    for (const row of rows) {
      if (row.y >= 510 && row.y <= 535) {
        const uppercaseWords = row.items.map(item => item.str).filter(s => /^[A-ZÑ\s]+$/.test(s) && s.length > 2);
        if (uppercaseWords.length >= 2) {
          const items = row.items.filter(item => /^[A-ZÑ\s]+$/.test(item.str) && item.str.length > 2);
          if (items.length >= 3) {
            rut.last_name = `${items[0].str} ${items[1].str}`.trim();
            rut.first_name = items.slice(2).map(item => item.str).join(" ");
          } else if (items.length === 2) {
            rut.last_name = items[0].str;
            rut.first_name = items[1].str;
          }
          break;
        }
      }
    }
  } else {
    for (const row of rows) {
      if (row.y >= 490 && row.y <= 535) {
        const matches = row.text.match(/^[A-Z0-9Ñ\s.,&-]{6,}$/);
        if (matches) {
          rut.business_name = row.text;
          break;
        }
      }
    }
  }

  // Location: Department and City
  for (const row of rows) {
    if (row.text.includes("COLOMBIA")) {
      for (const item of row.items) {
        const cleanName = item.str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
        if (cleanName === "VALLE DEL CAUCA") {
          rut.department = item.str;
          const idx = row.items.indexOf(item);
          if (idx !== -1) {
            for (let i = idx + 1; i < row.items.length; i++) {
              const str = row.items[i].str;
              if (/^[a-zA-ZÑñ\s]+$/.test(str) && str.length > 2) {
                rut.city = str;
                break;
              }
            }
          }
          break;
        }
      }
      if (rut.department) break;
    }
  }

  // Address
  for (const row of rows) {
    if (row.y >= 405 && row.y <= 425) {
      if (/^(CL|CR|AV|CLL|CRA|DG|TV|KM|AUTO|TRANS|DIAG|CALLE|CARRERA)/i.test(row.text)) {
        rut.address = row.text;
        break;
      }
    }
  }

  // Email
  for (const row of rows) {
    const emailMatch = row.text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      rut.email = emailMatch[0].toLowerCase();
      break;
    }
  }

  // Phone
  for (const row of rows) {
    if (row.y >= 370 && row.y <= 395) {
      for (const item of row.items) {
        const clean = item.str.replace(/\s+/g, "");
        if (/^\d{7,10}$/.test(clean)) {
          rut.phone = clean;
          break;
        }
      }
      if (rut.phone) break;
    }
  }

  // CIIU Code
  for (const row of rows) {
    if (row.y >= 320 && row.y <= 340) {
      const digits = row.items.map(item => item.str).filter(s => /^\d$/.test(s));
      if (digits.length >= 4) {
        rut.ciiu = digits.slice(0, 4).join("");
        break;
      }
    }
  }

  // Responsabilidades
  const responsabilidades = [];
  for (const row of rows) {
    const matches = row.text.match(/\b(\d{2})\s*-\s*/g);
    if (matches) {
      matches.forEach(m => {
        const code = m.match(/\d{2}/)[0];
        responsabilidades.push(code);
      });
    }
  }
  rut.responsabilidades = [...new Set(responsabilidades)];

  return rut;
}

async function run() {
  const data = new Uint8Array(fs.readFileSync('c:/Users/JULIAN/Desktop/GravyLocal2.0/DatosReferencia/Terceros/141259778952.pdf'));
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const textContent = await page.getTextContent();
  
  const rutData = parseRUTText(textContent.items);
  console.log("PARSED RUT DATA:", JSON.stringify(rutData, null, 2));
}

run().catch(console.error);
