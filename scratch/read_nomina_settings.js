async function checkPort(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/collections/settings/records?filter=(key~"nomina_config")`);
    const data = await res.json();
    if (data.items?.length) {
      console.log(`Port ${port} has settings:`, data.items.length);
      for (const item of data.items) {
        console.log(`[${port}] KEY:`, item.key);
        if (item.key.includes('mappings')) {
          const val = JSON.parse(item.value);
          console.log(val.map(m => `${m.concept} (${m.side}) -> account ${m.account_id}`));
        }
      }
    }
  } catch (e) {
    // ignore
  }
}

async function main() {
  for (const port of [8090, 8091, 8092, 8093, 8094]) {
    await checkPort(port);
  }
}
main();
