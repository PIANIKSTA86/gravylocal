const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const cutoffDate = '2026-06-30';

// Let's get the exact list of properties from the UI in Image 2
// In Image 2:
// Total general (105 unidades):
// Capital: 55,136,149.00
// Mora: 1,750,553.00
// Subtotal: 56,886,702.00
// Anticipos: (1,066,564.00)
// Total: 55,820,138.00

// In Image 1:
// Total 13459501:
// Débito: 87,945,248.00
// Crédito: 33,678,707.00
// Saldo: 54,266,541.00

// Let's analyze:
// 1) What is the difference between total credits applied in Contabilidad ($33,678,707) and payments recognized in Cartera?
// Facturas emitidas hasta 2026-06-30 = 87,945,248
// In Cartera:
// Cartera Exigible = 56,886,702
// Therefore, payments applied against invoices in Cartera = 87,945,248 - 56,886,702 = 31,058,546!
// But in Contabilidad, total credits on 13459501 = 33,678,707!
// The difference in credits:
// 33,678,707 - 31,058,546 = 2,620,161!
// Look at that:
// Contabilidad credited 13459501 by 2,620,161 MORE than what was applied to invoices in Cartera!
// And in Cartera, Anticipos = 1,066,564!
// So: 2,620,161 - 1,066,564 = 1,553,597!
// EXACT TO THE CENT: 2,620,161 - 1,066,564 = 1,553,597!
console.log('2620161 - 1066564 =', 2620161 - 1066564);
