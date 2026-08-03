const lineXml = `<cac:InvoiceLine><cbc:ID>1</cbc:ID><cbc:Note/><cbc:InvoicedQuantity unitCode="MTR">1.0</cbc:InvoicedQuantity><cbc:LineExtensionAmount currencyID="COP">42016.80</cbc:LineExtensionAmount><cac:TaxTotal><cbc:TaxAmount currencyID="COP">7983.19</cbc:TaxAmount><cac:TaxSubtotal><cbc:TaxableAmount currencyID="COP">42016.80</cbc:TaxableAmount><cbc:TaxAmount currencyID="COP">7983.19</cbc:TaxAmount><cac:TaxCategory><cbc:Percent>19.00</cbc:Percent><cac:TaxScheme><cbc:ID>01</cbc:ID><cbc:Name>IVA</cbc:Name></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal></cac:TaxTotal><cac:Item><cbc:Description>ADAPT.SANIT.INF.GRIS 54CM*20CM</cbc:Description><cac:StandardItemIdentification><cbc:ID schemeAgencyID="10" schemeID="999" schemeName="UNSPSC">10ASE1</cbc:ID></cac:StandardItemIdentification></cac:Item><cac:Price><cbc:PriceAmount currencyID="COP">42016.80</cbc:PriceAmount><cbc:BaseQuantity unitCode="MTR">1.0</cbc:BaseQuantity></cac:Price></cac:InvoiceLine>`;

const stripTags = (str) => String(str || '').replace(/<[^>]*>/g, '').trim();

// Corrected regex
const regexCorrected = /<(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount(?:\s[^>]*?)?>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount>/i;

const match = lineXml.match(regexCorrected);
console.log("Match:", match);
if (match) {
  console.log("Extracted:", match[1]);
  console.log("Parsed float:", parseFloat(stripTags(match[1])));
} else {
  console.log("No match found!");
}
