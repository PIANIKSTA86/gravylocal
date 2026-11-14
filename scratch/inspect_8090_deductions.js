const http = require("http");

http.get("http://localhost:8090/api/collections/electronic_payrolls/records?perPage=10&sort=-created", (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    try {
      const json = JSON.parse(data);
      console.log("Total items:", json.totalItems);
      if (json.items && json.items.length) {
        json.items.forEach(it => {
          console.log("=== ID:", it.id, "Prefijo:", it.prefijo, "Consecutivo:", it.consecutivo, "Estado:", it.estado_dian, "DIAN resp:", it.dian_response);
          const raw = it.xml_generado || "";
          if (raw.startsWith("{")) {
            const p = JSON.parse(raw);
            console.log("Deductions keys:", Object.keys(p.deductions || {}));
            console.log("Deductions content:", JSON.stringify(p.deductions));
          } else {
            console.log("Raw is XML, length:", raw.length);
          }
        });
      }
    } catch (e) {
      console.error(e.message);
    }
  });
}).on("error", err => console.error(err.message));
