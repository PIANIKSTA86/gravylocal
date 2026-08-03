async function run() {
  try {
    const res = await fetch('http://127.0.0.1:8090/api/collections/financial_notes/records?perPage=100&sort=nota_num');
    const data = await res.json();
    console.log("=== FINANCIAL NOTES IN DB ===");
    console.log(`Total records: ${data.items?.length || 0}`);
    for (const record of data.items || []) {
      console.log(`[Note ${record.nota_num}] Tipo: ${record.tipo_informe} | Titulo: ${record.titulo} | Cuenta: ${record.cuenta_codigo}`);
      console.log(`Contenido: ${record.contenido.substring(0, 100)}...`);
      console.log("-".repeat(40));
    }
  } catch (err) {
    console.error("Error connecting to PB:", err);
  }
}
run();
