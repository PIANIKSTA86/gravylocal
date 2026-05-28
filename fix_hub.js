const http = require('http');

const loginData = JSON.stringify({ identity: "admin@gravy.local", password: "admin12345" });

const req = http.request({
  hostname: 'localhost',
  port: 8089,
  path: '/api/collections/hub_users/auth-with-password',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const token = JSON.parse(body).token;
    
    // Get access record
    http.get('http://localhost:8089/api/collections/user_company_access/records', { headers: { 'Authorization': 'Bearer ' + token } }, res2 => {
      let body2 = '';
      res2.on('data', d => body2 += d);
      res2.on('end', () => {
        const item = JSON.parse(body2).items[0];
        
        // Update record
        const updateData = JSON.stringify({ company_email: "admin@contaco.com", company_pass: "Admin1234!" });
        const req3 = http.request({
          hostname: 'localhost',
          port: 8089,
          path: '/api/collections/user_company_access/records/' + item.id,
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
            'Content-Length': updateData.length
          }
        }, res3 => {
          console.log("Updated access record status:", res3.statusCode);
        });
        req3.write(updateData);
        req3.end();
      });
    });
  });
});
req.write(loginData);
req.end();
