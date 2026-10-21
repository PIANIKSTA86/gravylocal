const fs = require('fs');

const { daneMap } = JSON.parse(fs.readFileSync('scratch/matias_cities_map.json', 'utf8'));
const daneMapJson = JSON.stringify(daneMap);

function applyFix(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  const oldTarget = `      const resNum = resolution ? resolution.getString("resolution_number") : getSetting("dian_resolution_number", "18760000001");
      const cleanDocNum = String(folio || tx.getInt("number") || "1");

      const matiasPayload = {
        resolution_number: String(resNum || "18760000001"),
        prefix: prefix || "",
        document_number: cleanDocNum,
        operation_type_id: matiasOperationTypeId,
        type_document_id: matiasTypeDocId,
        date: issueDate,
        time: issueTime ? issueTime.slice(0, 8) : "12:00:00",
        notes: tx.getString("description") || "Generado por GRAVY ERP",
        send_email: (isDS || isNDS) ? 1 : 0,
        customer: {
          identification_number: String(custDocNum || "222222222222"),
          dni: String(custDocNum || "222222222222"),
          name: custName || "Consumidor Final",
          company_name: custName || "Consumidor Final",
          email: custEmail || "facturacion@cliente.com",
          phone: validPhone,
          mobile: validPhone,
          address: custAddress || "Ciudad",
          postal_code: (customer && customer.getString("city_code")) ? customer.getString("city_code") : "760001",
          merchant_registration: "0000000-00",
          identity_document_id: matiasIdDocType,
          type_document_identification_id: matiasIdDocType,
          type_organization_id: custDIANDocType === "31" ? 1 : 2,
          tax_regime_id: (customer && (customer.getString("tax_regime") === 'common' || customer.getString("tax_regime") === 'responsable')) ? 1 : 2,
          tax_level_id: (customer && (customer.getString("tax_regime") === 'common' || customer.getString("tax_regime") === 'responsable')) ? 4 : 5,
          type_liability_id: (customer && (customer.getString("tax_regime") === 'common' || customer.getString("tax_regime") === 'responsable')) ? 116 : 117,
          municipality_id: 149,
          country_id: 45,
          city_id: 149
        },`;

  const newReplacement = `      const resNum = resolution ? resolution.getString("resolution_number") : getSetting("dian_resolution_number", "18760000001");
      const cleanDocNum = String(folio || tx.getInt("number") || "1");

      // Catálogo oficial DANE a ID interno de municipio en MATIAS API (1.122 municipios)
      const MATIAS_DANE_CITIES = ${daneMapJson};

      function resolveMatiasCityId(cust, defaultCityId) {
        if (!cust) return defaultCityId || 1006;
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
        return defaultCityId || 1006;
      }

      const companyCityCode = (companyThird ? companyThird.getString("city_code") : "") || "76001";
      const companyDefaultCityId = MATIAS_DANE_CITIES[companyCityCode] || 1006;
      const resolvedCustomerCityId = resolveMatiasCityId(customer, companyDefaultCityId);
      const custPostalCode = (customer && customer.getString("city_code")) ? customer.getString("city_code") : (companyCityCode || "760001");

      const matiasPayload = {
        resolution_number: String(resNum || "18760000001"),
        prefix: prefix || "",
        document_number: cleanDocNum,
        operation_type_id: matiasOperationTypeId,
        type_document_id: matiasTypeDocId,
        date: issueDate,
        time: issueTime ? issueTime.slice(0, 8) : "12:00:00",
        notes: tx.getString("description") || "Generado por GRAVY ERP",
        send_email: (isDS || isNDS) ? 1 : 0,
        customer: {
          identification_number: String(custDocNum || "222222222222"),
          dni: String(custDocNum || "222222222222"),
          name: custName || "Consumidor Final",
          company_name: custName || "Consumidor Final",
          email: custEmail || "facturacion@cliente.com",
          phone: validPhone,
          mobile: validPhone,
          address: custAddress || (companyThird ? companyThird.getString("address") : "") || "CALLE 79 8N 58",
          postal_code: custPostalCode,
          merchant_registration: "0000000-00",
          identity_document_id: matiasIdDocType,
          type_document_identification_id: matiasIdDocType,
          type_organization_id: custDIANDocType === "31" ? 1 : 2,
          tax_regime_id: (customer && (customer.getString("tax_regime") === 'common' || customer.getString("tax_regime") === 'responsable')) ? 1 : 2,
          tax_level_id: (customer && (customer.getString("tax_regime") === 'common' || customer.getString("tax_regime") === 'responsable')) ? 4 : 5,
          type_liability_id: (customer && (customer.getString("tax_regime") === 'common' || customer.getString("tax_regime") === 'responsable')) ? 116 : 117,
          municipality_id: resolvedCustomerCityId,
          country_id: 45,
          city_id: resolvedCustomerCityId,
          dv: custDIANDocType === "31" ? (customer ? (customer.getString("dv") || calcularDV(custDocNum)) : calcularDV(custDocNum)) : null
        },`;

  // Normalize line endings for replacement
  const normContent = content.replace(/\r\n/g, '\n');
  const normOld = oldTarget.replace(/\r\n/g, '\n');
  const normNew = newReplacement.replace(/\r\n/g, '\n');

  if (!normContent.includes(normOld)) {
    console.error('Target chunk not found in:', filePath);
    return false;
  }

  const updated = normContent.replace(normOld, normNew);
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log('Successfully applied fix to:', filePath);
  return true;
}

applyFix('pb_hooks/dian.pb.js');
applyFix('empresas/empresa_8092/pb_hooks/dian.pb.js');
