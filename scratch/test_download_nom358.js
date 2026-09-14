const https = require('https');

const envelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-nomina.facturatech.co/v1/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.downloadXML soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">901428834</username>
         <password xsi:type="xsd:string">8cd4dfbf5b0ddad5e99debcd9d30920a232eedbf8dc3bc0173c4d79dfbf627fb</password>
         <prefix xsi:type="xsd:string">NOM</prefix>
         <number xsi:type="xsd:integer">358</number>
      </urn:FtechAction.downloadXML>
   </soapenv:Body>
</soapenv:Envelope>`;

const req = https.request({
  hostname: "ws-nomina.facturatech.co",
  path: "/v1/pro/index.php",
  method: "POST",
  headers: {
    "Content-Type": "text/xml;charset=UTF-8",
    "SOAPAction": "urn:https://ws-nomina.facturatech.co/v1/pro/#FtechAction.downloadXML",
    "Content-Length": Buffer.byteLength(envelope)
  }
}, res => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    console.log("STATUS:", res.statusCode);
    console.log("RESPONSE:", data);
  });
});
req.write(envelope);
req.end();
