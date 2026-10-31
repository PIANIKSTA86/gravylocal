(async () => {
  const loginRes = await fetch("http://localhost:8092/api/collections/users/auth-with-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: "julian_piano@hotmail.com", password: "Admin1234!" })
  });
  const data = await loginRes.json();
  console.log('Login 8092 status:', loginRes.status, 'Token:', data.token ? data.token.slice(0, 20) + '...' : data);
})();

