const fs = require('fs');

const content = fs.readFileSync('pb_hooks/dian.pb.js', 'utf8');
const idx = content.indexOf('MATIAS_DANE_CITIES =');
const end = content.indexOf(';', idx);
const mapJson = content.slice(idx + 21, end);

const code = `/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — matias_cities.js
 * Mapeo oficial DANE a ID MATIAS API para todos los municipios de Colombia.
 */

const MATIAS_DANE_CITIES = ${mapJson};

function resolveMatiasCityId(codeOrName, defaultId) {
  if (!codeOrName) return defaultId || 1006;
  const str = String(codeOrName).trim();
  const num = parseInt(str, 10);
  if (!isNaN(num) && num > 0 && num <= 1200 && str.length <= 4) {
    return num;
  }
  if (MATIAS_DANE_CITIES[str]) {
    return MATIAS_DANE_CITIES[str];
  }
  const padded = str.padStart(5, "0");
  if (MATIAS_DANE_CITIES[padded]) {
    return MATIAS_DANE_CITIES[padded];
  }
  const low = str.toLowerCase();
  if (low.includes("palmira")) return 1032;
  if (low.includes("cali")) return 1006;
  if (low.includes("bogot")) return 149;
  if (low.includes("medell")) return 1;
  if (low.includes("barranqu")) return 126;
  if (low.includes("bucaramanga")) return 846;
  if (low.includes("pereira")) return 832;
  if (low.includes("cartagena")) return 150;
  if (low.includes("manizales")) return 319;
  if (low.includes("armenia")) return 820;
  return defaultId || 1006;
}

module.exports = {
  MATIAS_DANE_CITIES,
  resolveMatiasCityId
};
`;

fs.writeFileSync('pb_hooks/matias_cities.js', code, 'utf8');
console.log('pb_hooks/matias_cities.js written successfully');

