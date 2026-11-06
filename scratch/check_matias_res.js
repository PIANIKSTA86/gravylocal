const https = require('https');

const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNGExY2UyYjdhNjM4YzU0YzY4OTY5ZjUyYTVmMzcxOTVmYTQ1MTQwMTU4YmQyYzcxMmU3YWQ1MDJiNDkxNzllODhmY2IwZmY5NzBmMzVlODkiLCJpYXQiOjE3OTI0MTg3ODIuNTA0ODcyLCJuYmYiOjE3OTI0MTg3ODIuNTA0ODczLCJleHAiOjE4MDAxOTQ3ODIuNTAzNjMsInN1YiI6IjEwNDUiLCJzY29wZXMiOltdfQ.hsxN8MvsX0H6hlnzTLcGxCkUS2JLFkRTn6k4PQKi2tuTaGV6Kp-ZJxICDYI0Af43cnhV5Kqpd6E3TowU36lsnP-0JpxI6wXRRpukqXW-m4EdYJ32_LqhCjbL4kWQswdRYvJ_i6GMa2Mn2cacmQD_whRQ80cPtvqZQ1j49CzJsQIDJy4j9hbf_SwbUwF0qh4Qiewft249IcJqASQQZFW6_XBLnOWVX5-fQ4KGnvJZL7uUQThkH3zQJx-IgyNJ0yOZdOpUJ3VTAsAIEMmI9QmILkoLtQuEAn_OUTy2o1q2PCEUXuDwYrbHLcvfuNG8W7AuSUfViSS360fBIzr8nqpVYtaSPLLW_tHxMWHJmGYTJDSRyArYO0za_f6LhZVewxaajfppCyRgU0oZLJQsxZ8jcBPKkHHPDpY709BTd0YRULf7cQh5fWsyOnOoCuLAw5vyAAG0s7PlddMvqDauH7MEP6dMrcBY9RIpGvIDKhY468w_-RQmXyN6z5KVDaM5Vt65XCIfIvSGhOCyhgwZ7BKGPlFtDlPI8uEG3OW6c9oGoaV8vvH9co8J2iwIjEKbQ5Fo04PcTCth1R54pXe98RxTJx8xlvIQug2sG_acT-sdntfqZW_GCQKAaw23ZbjW9soMl0-KpgcOtmG-VMKXmlagaYd4UKL6D6SoAQ2L8uIRPn4";
const clientUuid = "0c909a79-8aec-11f1-abbb-d843ae899220";
const url = `https://api-v2.matias-api.com/api/ubl2.1/resolutions?sync=1&client_uuid=${clientUuid}`;

const options = {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      console.log('Response:', JSON.stringify(JSON.parse(data), null, 2));
    } catch (_) {
      console.log('Raw:', data);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
