async function main() {
  try {
    const res = await fetch("http://localhost:8090/api/health");
    console.log("Health status:", res.status, await res.json());
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}
main();
