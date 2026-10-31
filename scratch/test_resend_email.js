(async () => {
  const loginRes = await fetch("http://localhost:8092/api/collections/users/auth-with-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: "julian_piano@hotmail.com", password: "Admin1234!" })
  });
  const authData = await loginRes.json();
  const token = authData.token;

  console.log("Testing POST /api/dian/resend-email for FE-00000009...");
  const resendRes = await fetch("http://localhost:8092/api/dian/resend-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      txId: "1g00gxt00wondgq",
      email: "julian_piano@hotmail.com"
    })
  });

  const status = resendRes.status;
  const result = await resendRes.json();
  console.log("Status:", status);
  console.log("Result:", result);
})();
