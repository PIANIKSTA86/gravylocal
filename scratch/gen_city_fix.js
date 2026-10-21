const fs = require('fs');

const { daneMap } = JSON.parse(fs.readFileSync('scratch/matias_cities_map.json', 'utf8'));

// Generate the JS helper code
const daneMapJson = JSON.stringify(daneMap);

const helperCode = `
      // Catálogo DANE a ID interno de municipio en MATIAS API (1.122 municipios de Colombia)
      const MATIAS_DANE_CITIES = ${daneMapJson};

      function resolveMatiasCityId(cust, defaultCityId = 1006) {
        if (!cust) return defaultCityId;
        const cCode = String(cust.getString("city_code") || "").trim();
        if (cCode && MATIAS_DANE_CITIES[cCode]) {
          return MATIAS_DANE_CITIES[cCode];
        }
        const cName = String(cust.getString("city") || "").trim().toLowerCase();
        if (cName.includes("cali")) return 1006;
        if (cName.includes("bogot")) return 149;
        if (cName.includes("medell")) return 1;
        if (cName.includes("barranqu")) return 126;
        if (cName.includes("bucaramanga")) return 846;
        if (cName.includes("pereira")) return 832;
        if (cName.includes("cartagena")) return 150;
        if (cName.includes("manizales")) return 319;
        if (cName.includes("armenia")) return 820;
        if (cName.includes("cucuta") || cName.includes("cúcuta")) return 780;
        if (cName.includes("ibague") || cName.includes("ibagué")) return 959;
        if (cName.includes("pasto")) return 716;
        if (cName.includes("popayan") || cName.includes("popayán")) return 362;
        if (cName.includes("neiva")) return 605;
        if (cName.includes("villavicencio")) return 687;
        if (cName.includes("santa marta")) return 657;
        if (cName.includes("valledupar")) return 404;
        if (cName.includes("monteria") || cName.includes("montería")) return 429;
        if (cName.includes("sincelejo")) return 933;
        if (cName.includes("tunja")) return 196;
        if (cName.includes("florencia")) return 346;
        if (cName.includes("riohacha")) return 642;
        if (cName.includes("quibdo") || cName.includes("quibdó")) return 575;
        if (cName.includes("yopal")) return 1055;
        return defaultCityId;
      }

      const companyCityCode = (companyThird ? companyThird.getString("city_code") : "") || "76001";
      const companyDefaultCityId = MATIAS_DANE_CITIES[companyCityCode] || 1006;
      const resolvedCustomerCityId = resolveMatiasCityId(customer, companyDefaultCityId);
      const custPostalCode = (customer && customer.getString("city_code")) ? customer.getString("city_code") : (companyCityCode || "760001");
`;

console.log('Helper code generated, length:', helperCode.length);
