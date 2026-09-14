async function test() {
  const ports = [8090, 8091, 8094];
  for (const port of ports) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/collections/_superusers/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: 'admin@gravy.com', password: 'admin' })
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`Logged in on port ${port}, token:`, !!data.token);
        return { port, token: data.token };
      }
    } catch (_) {}
  }
}
test();
