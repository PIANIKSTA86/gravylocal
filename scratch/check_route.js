async function check() {
  const res = await fetch("http://127.0.0.1:8090/api/gravy/bulk-replace-third-party/preview");
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Snippet:", text.slice(0, 150));
}
check();