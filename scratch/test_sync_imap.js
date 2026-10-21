const { syncImapInvoices } = require('../hub/imap-service');

(async () => {
  try {
    console.log('Testing syncImapInvoices...');
    const result = await syncImapInvoices({
      host: 'imap.gmail.com',
      port: 993,
      user: 'ventas.gravy@gmail.com',
      pass: 'wlok jiad elst juir',
      tls: true,
      maxEmails: 10
    });
    console.log('SYNC RESULT:', JSON.stringify({ success: result.success, foundCount: result.foundCount, invoicesCount: result.invoices.length }));
  } catch (err) {
    console.error('SYNC ERROR:', err.message);
  }
})();
