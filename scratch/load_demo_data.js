const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'empresas', 'empresa_8093', 'pb_data', 'data.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

// Helper to run query inside promise
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
function genId() {
  return Array.from({ length: 15 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

async function main() {
  try {
    console.log("=== INICIANDO LIMPIEZA DE DATOS DEMO VIEJOS ===");
    const tablesToClean = [
      'invoice_lines',
      'invoices',
      'pos_shifts',
      'pos_registers',
      'purchase_invoice_lines',
      'purchase_invoices',
      'inmo_invoice_lines',
      'inmo_invoices',
      'inmo_contracts',
      'inmo_properties',
      'tx_lines',
      'transactions',
      'third_parties',
      'products'
    ];
    for (const table of tablesToClean) {
      await run(`DELETE FROM ${table}`);
      console.log(`- Limpiada tabla: ${table}`);
    }

    console.log("\n=== CREANDO TERCEROS ===");
    const thirdParties = [
      {
        id: 'cl_pos_cali',
        doc_type: 'CC',
        doc_number: '222222',
        name: 'Cliente POS Cali',
        type: 'CLIENTE',
        person_type: 'NATURAL',
        active: 1
      },
      {
        id: 'cl_pos_bun',
        doc_type: 'CC',
        doc_number: '333333',
        name: 'Cliente POS Buenaventura',
        type: 'CLIENTE',
        person_type: 'NATURAL',
        active: 1
      },
      {
        id: 'sup_occidente',
        doc_type: 'NIT',
        doc_number: '800111222',
        name: 'Distribuidora de Alimentos del Occidente',
        type: 'PROVEEDOR',
        person_type: 'JURIDICA',
        active: 1
      },
      {
        id: 'own_valle',
        doc_type: 'NIT',
        doc_number: '900999888',
        name: 'Inversiones Inmobiliarias del Valle SAS',
        type: 'AMBOS',
        person_type: 'JURIDICA',
        active: 1
      },
      {
        id: 'ten_sofia',
        doc_type: 'CC',
        doc_number: '31444555',
        name: 'Sofía del Mar Hurtado',
        type: 'CLIENTE',
        person_type: 'NATURAL',
        active: 1
      },
      {
        id: 'ten_local_bun',
        doc_type: 'CC',
        doc_number: '55555555',
        name: 'Inquilino Local Buenaventura',
        type: 'CLIENTE',
        person_type: 'NATURAL',
        active: 1
      }
    ];

    for (const tp of thirdParties) {
      await run(
        `INSERT INTO third_parties (id, doc_type, doc_number, name, type, person_type, active) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [tp.id, tp.doc_type, tp.doc_number, tp.name, tp.type, tp.person_type, tp.active]
      );
      console.log(`  - Creado tercero: ${tp.name}`);
    }

    console.log("\n=== CREANDO PRODUCTOS ===");
    // Accounts:
    // Income: 413505 [ID: 5574aa8arhiwxxk]
    // Cost: 613505 [ID: 1jrsw3ytkdw2a18]
    // Inventory: 14350501 [ID: tuam8ilzs3hr9h5]
    const products = [
      {
        id: 'prod_cafe',
        code: 'PROD-001',
        name: 'Café Expreso 8oz',
        description: 'Bebida de café caliente expreso de 8oz',
        base_price: 5000,
        cost_price: 1200,
        iva_rate: 0,
        income_account_id: '5574aa8arhiwxxk',
        cost_account_id: '1jrsw3ytkdw2a18',
        inventory_account_id: 'tuam8ilzs3hr9h5',
        unit: 'UND',
        type: 'Producto',
        active: 1
      },
      {
        id: 'prod_pandebono',
        code: 'PROD-002',
        name: 'Pan de Bono Tradicional',
        description: 'Pan de bono horneado tradicional del Valle',
        base_price: 3500,
        cost_price: 800,
        iva_rate: 0,
        income_account_id: '5574aa8arhiwxxk',
        cost_account_id: '1jrsw3ytkdw2a18',
        inventory_account_id: 'tuam8ilzs3hr9h5',
        unit: 'UND',
        type: 'Producto',
        active: 1
      },
      {
        id: 'prod_harina',
        code: 'MAT-001',
        name: 'Harina de Trigo Premium 50kg',
        description: 'Materia prima: bulto de harina de trigo de 50kg',
        base_price: 0,
        cost_price: 150000,
        iva_rate: 0,
        income_account_id: '5574aa8arhiwxxk',
        cost_account_id: '1jrsw3ytkdw2a18',
        inventory_account_id: 'tuam8ilzs3hr9h5',
        unit: 'BTO',
        type: 'Producto',
        active: 1
      },
      {
        id: 'prod_azucar',
        code: 'MAT-002',
        name: 'Azúcar Refinada 50kg',
        description: 'Materia prima: bulto de azúcar refinada de 50kg',
        base_price: 0,
        cost_price: 180000,
        iva_rate: 0,
        income_account_id: '5574aa8arhiwxxk',
        cost_account_id: '1jrsw3ytkdw2a18',
        inventory_account_id: 'tuam8ilzs3hr9h5',
        unit: 'BTO',
        type: 'Producto',
        active: 1
      }
    ];

    for (const prod of products) {
      await run(
        `INSERT INTO products (id, code, name, description, base_price, cost_price, iva_rate, income_account_id, cost_account_id, inventory_account_id, unit, type, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [prod.id, prod.code, prod.name, prod.description, prod.base_price, prod.cost_price, prod.iva_rate, prod.income_account_id, prod.cost_account_id, prod.inventory_account_id, prod.unit, prod.type, prod.active]
      );
      console.log(`  - Creado producto: ${prod.name}`);
    }

    console.log("\n=== CREANDO CAJAS Y TURNOS POS ===");
    // Branches:
    // Cali: eo3d07bscdpb7kd
    // Buenaventura: 8d30v195m0j3q3d
    await run(
      `INSERT INTO pos_registers (id, name, branch_id, active, terminal_key)
       VALUES (?, ?, ?, ?, ?)`,
      ['reg_cali', 'Caja Registradora Principal Cali', 'eo3d07bscdpb7kd', 1, 'term_cali']
    );
    await run(
      `INSERT INTO pos_registers (id, name, branch_id, active, terminal_key)
       VALUES (?, ?, ?, ?, ?)`,
      ['reg_bun', 'Caja Registradora Principal Buenaventura', '8d30v195m0j3q3d', 1, 'term_bun']
    );

    // Shifts
    await run(
      `INSERT INTO pos_shifts (id, user_id, opened_at, closed_at, cash_initial, cash_sales, cash_expected, cash_actual, status, notes, pos_register_id, branch_id, created, updated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      ['shift_cali', 'sc4ygzh4io727qh', '2026-08-01 08:00:00', '2026-08-01 18:00:00', 100000, 30500, 130500, 130500, 'closed', 'Turno demo Cali', 'reg_cali', 'eo3d07bscdpb7kd']
    );
    await run(
      `INSERT INTO pos_shifts (id, user_id, opened_at, closed_at, cash_initial, cash_sales, cash_expected, cash_actual, status, notes, pos_register_id, branch_id, created, updated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      ['shift_bun', 'sc4ygzh4io727qh', '2026-08-02 08:00:00', '2026-08-02 18:00:00', 100000, 85000, 185000, 185000, 'closed', 'Turno demo Buenaventura', 'reg_bun', '8d30v195m0j3q3d']
    );
    console.log("  - Creadas cajas y turnos POS en ambas sucursales.");

    console.log("\n=== CREANDO VENTAS POS CONTABILIZADAS ===");
    // Cali POS Sale
    await run(
      `INSERT INTO invoices (id, number, customer_id, warehouse_id, date, due_date, status, subtotal, iva_total, total, payable_total, payment_method, pos_shift_id, tx_id, tx_number, tx_type_id, branch_id, created, updated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      ['inv_pos_cali', 'POS-001', 'cl_pos_cali', '75npb0kfhhfdtmf', '2026-08-01 10:30:00', '2026-08-01', 'posted', 30500, 0, 30500, 30500, 'CASH', 'shift_cali', 'tx_pos_cali', 'POS-001', '5ei6osi31g54kln', 'eo3d07bscdpb7kd']
    );
    await run(
      `INSERT INTO invoice_lines (id, invoice_id, product_id, qty, unit_price, subtotal, iva_rate, iva_amount, total, description, account_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'inv_pos_cali', 'prod_cafe', 4, 5000, 20000, 0, 0, 20000, 'Café Expreso 8oz', '5574aa8arhiwxxk']
    );
    await run(
      `INSERT INTO invoice_lines (id, invoice_id, product_id, qty, unit_price, subtotal, iva_rate, iva_amount, total, description, account_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'inv_pos_cali', 'prod_pandebono', 3, 3500, 10500, 0, 0, 10500, 'Pan de Bono Tradicional', '5574aa8arhiwxxk']
    );

    // Cali POS Accounting Entry (Partida Doble)
    await run(
      `INSERT INTO transactions (id, number, date, description, status, third_party_id, tx_type_id, user_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['tx_pos_cali', 'POS-001', '2026-08-01', 'Venta POS Cali Tique POS-001', 'active', 'cl_pos_cali', '5ei6osi31g54kln', 'sc4ygzh4io727qh', 'eo3d07bscdpb7kd']
    );
    // Debito: Caja (11050501 - 3be2ubpnrhvb8na)
    await run(
      `INSERT INTO tx_lines (id, tx_id, account_id, debit, credit, description, line_order, third_party_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'tx_pos_cali', '3be2ubpnrhvb8na', 30500, 0, 'Recaudo Venta POS-001', 0, 'cl_pos_cali', 'eo3d07bscdpb7kd']
    );
    // Credito: Ventas Brutas (413505 - 5574aa8arhiwxxk)
    await run(
      `INSERT INTO tx_lines (id, tx_id, account_id, debit, credit, description, line_order, third_party_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'tx_pos_cali', '5574aa8arhiwxxk', 0, 30500, 'Ingreso Venta POS-001', 1, 'cl_pos_cali', 'eo3d07bscdpb7kd']
    );

    // Buenaventura POS Sale
    await run(
      `INSERT INTO invoices (id, number, customer_id, warehouse_id, date, due_date, status, subtotal, iva_total, total, payable_total, payment_method, pos_shift_id, tx_id, tx_number, tx_type_id, branch_id, created, updated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      ['inv_pos_bun', 'POS-002', 'cl_pos_bun', 'fclyvwpcomhq4gu', '2026-08-02 11:00:00', '2026-08-02', 'posted', 85000, 0, 85000, 85000, 'CASH', 'shift_bun', 'tx_pos_bun', 'POS-002', '5ei6osi31g54kln', '8d30v195m0j3q3d']
    );
    await run(
      `INSERT INTO invoice_lines (id, invoice_id, product_id, qty, unit_price, subtotal, iva_rate, iva_amount, total, description, account_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'inv_pos_bun', 'prod_cafe', 10, 5000, 50000, 0, 0, 50000, 'Café Expreso 8oz', '5574aa8arhiwxxk']
    );
    await run(
      `INSERT INTO invoice_lines (id, invoice_id, product_id, qty, unit_price, subtotal, iva_rate, iva_amount, total, description, account_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'inv_pos_bun', 'prod_pandebono', 10, 3500, 35000, 0, 0, 35000, 'Pan de Bono Tradicional', '5574aa8arhiwxxk']
    );

    // Buenaventura POS Accounting Entry
    await run(
      `INSERT INTO transactions (id, number, date, description, status, third_party_id, tx_type_id, user_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['tx_pos_bun', 'POS-002', '2026-08-02', 'Venta POS Buenaventura Tique POS-002', 'active', 'cl_pos_bun', '5ei6osi31g54kln', 'sc4ygzh4io727qh', '8d30v195m0j3q3d']
    );
    // Debito: Caja (11050501 - 3be2ubpnrhvb8na)
    await run(
      `INSERT INTO tx_lines (id, tx_id, account_id, debit, credit, description, line_order, third_party_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'tx_pos_bun', '3be2ubpnrhvb8na', 85000, 0, 'Recaudo Venta POS-002', 0, 'cl_pos_bun', '8d30v195m0j3q3d']
    );
    // Credito: Ventas Brutas (413505 - 5574aa8arhiwxxk)
    await run(
      `INSERT INTO tx_lines (id, tx_id, account_id, debit, credit, description, line_order, third_party_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'tx_pos_bun', '5574aa8arhiwxxk', 0, 85000, 'Ingreso Venta POS-002', 1, 'cl_pos_bun', '8d30v195m0j3q3d']
    );
    console.log("  - Creadas ventas POS con sus asientos contables balanceados.");

    console.log("\n=== CREANDO COMPRA DE MERCANCIAS ===");
    // Purchase Cali (FC-001)
    await run(
      `INSERT INTO purchase_invoices (id, number, supplier_id, warehouse_id, date, due_date, status, subtotal, iva_total, total, payable_total, tx_id, tx_number, tx_type_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['pi_cali', 'FC-001', 'sup_occidente', '75npb0kfhhfdtmf', '2026-08-03 09:00:00', '2026-09-03', 'posted', 300000, 30000, 330000, 330000, 'tx_fc_cali', 'FC-001', 'rsjmlgrraax4ol5', 'eo3d07bscdpb7kd']
    );
    await run(
      `INSERT INTO purchase_invoice_lines (id, invoice_id, product_id, qty, unit_price, subtotal, iva_rate, iva_amount, total, description, account_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'pi_cali', 'prod_harina', 1, 150000, 150000, 10, 15000, 165000, 'Harina de Trigo Premium 50kg', 'tuam8ilzs3hr9h5']
    );
    await run(
      `INSERT INTO purchase_invoice_lines (id, invoice_id, product_id, qty, unit_price, subtotal, iva_rate, iva_amount, total, description, account_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'pi_cali', 'prod_azucar', 1, 150000, 150000, 10, 15000, 165000, 'Azúcar Refinada 50kg', 'tuam8ilzs3hr9h5']
    );

    // Purchase Cali Accounting Entry
    await run(
      `INSERT INTO transactions (id, number, date, description, status, third_party_id, tx_type_id, user_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['tx_fc_cali', 'FC-001', '2026-08-03', 'Compra de mercancías Cali FC-001', 'active', 'sup_occidente', 'rsjmlgrraax4ol5', 'sc4ygzh4io727qh', 'eo3d07bscdpb7kd']
    );
    // Debito: Inventario (14350501 - tuam8ilzs3hr9h5)
    await run(
      `INSERT INTO tx_lines (id, tx_id, account_id, debit, credit, description, line_order, third_party_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'tx_fc_cali', 'tuam8ilzs3hr9h5', 300000, 0, 'Entrada Inventario Harina y Azúcar', 0, 'sup_occidente', 'eo3d07bscdpb7kd']
    );
    // Debito: IVA descontable (24080201 - 8jvbu2g7ooshle0)
    await run(
      `INSERT INTO tx_lines (id, tx_id, account_id, debit, credit, description, line_order, third_party_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'tx_fc_cali', '8jvbu2g7ooshle0', 300000 * 0.10, 0, 'IVA descontable compra 10%', 1, 'sup_occidente', 'eo3d07bscdpb7kd']
    );
    // Credito: Proveedores (22050501 - s3kgsy4rc8ys9q9)
    await run(
      `INSERT INTO tx_lines (id, tx_id, account_id, debit, credit, description, line_order, third_party_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'tx_fc_cali', 's3kgsy4rc8ys9q9', 0, 330000, 'Cuenta por pagar Distribuidora Occidente', 2, 'sup_occidente', 'eo3d07bscdpb7kd']
    );

    // Purchase Buenaventura (FC-002)
    await run(
      `INSERT INTO purchase_invoices (id, number, supplier_id, warehouse_id, date, due_date, status, subtotal, iva_total, total, payable_total, tx_id, tx_number, tx_type_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['pi_bun', 'FC-002', 'sup_occidente', 'fclyvwpcomhq4gu', '2026-08-04 10:00:00', '2026-09-04', 'posted', 300000, 30000, 330000, 330000, 'tx_fc_bun', 'FC-002', 'rsjmlgrraax4ol5', '8d30v195m0j3q3d']
    );
    await run(
      `INSERT INTO purchase_invoice_lines (id, invoice_id, product_id, qty, unit_price, subtotal, iva_rate, iva_amount, total, description, account_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'pi_bun', 'prod_harina', 1, 150000, 150000, 10, 15000, 165000, 'Harina de Trigo Premium 50kg', 'tuam8ilzs3hr9h5']
    );
    await run(
      `INSERT INTO purchase_invoice_lines (id, invoice_id, product_id, qty, unit_price, subtotal, iva_rate, iva_amount, total, description, account_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'pi_bun', 'prod_azucar', 1, 150000, 150000, 10, 15000, 165000, 'Azúcar Refinada 50kg', 'tuam8ilzs3hr9h5']
    );

    // Purchase Buenaventura Accounting Entry
    await run(
      `INSERT INTO transactions (id, number, date, description, status, third_party_id, tx_type_id, user_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['tx_fc_bun', 'FC-002', '2026-08-04', 'Compra de mercancías Buenaventura FC-002', 'active', 'sup_occidente', 'rsjmlgrraax4ol5', 'sc4ygzh4io727qh', '8d30v195m0j3q3d']
    );
    // Debito: Inventario (14350501 - tuam8ilzs3hr9h5)
    await run(
      `INSERT INTO tx_lines (id, tx_id, account_id, debit, credit, description, line_order, third_party_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'tx_fc_bun', 'tuam8ilzs3hr9h5', 300000, 0, 'Entrada Inventario Harina y Azúcar', 0, 'sup_occidente', '8d30v195m0j3q3d']
    );
    // Debito: IVA descontable (24080201 - 8jvbu2g7ooshle0)
    await run(
      `INSERT INTO tx_lines (id, tx_id, account_id, debit, credit, description, line_order, third_party_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'tx_fc_bun', '8jvbu2g7ooshle0', 30000, 0, 'IVA descontable compra 10%', 1, 'sup_occidente', '8d30v195m0j3q3d']
    );
    // Credito: Proveedores (22050501 - s3kgsy4rc8ys9q9)
    await run(
      `INSERT INTO tx_lines (id, tx_id, account_id, debit, credit, description, line_order, third_party_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'tx_fc_bun', 's3kgsy4rc8ys9q9', 0, 330000, 'Cuenta por pagar Distribuidora Occidente', 2, 'sup_occidente', '8d30v195m0j3q3d']
    );
    console.log("  - Creadas compras de mercancía con sus asientos contables balanceados.");

    console.log("\n=== CREANDO GESTION INMOBILIARIA ===");
    // Cali Real Estate Property
    await run(
      `INSERT INTO inmo_properties (id, code, title, type, address, city, neighborhood, owner_id, rental_price, commission_rate, status, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['prop_cali', 'PROP-CLI-01', 'Apartamento Duplex Cali', 'APARTAMENTO', 'Avenida 6 Norte #22-10', 'Cali', 'Chipichape', 'own_valle', 2500000, 10, 'ARRENDADO', 1]
    );
    // Buenaventura Real Estate Property
    await run(
      `INSERT INTO inmo_properties (id, code, title, type, address, city, neighborhood, owner_id, rental_price, commission_rate, status, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['prop_bun', 'PROP-BUN-02', 'Local Comercial Buenaventura', 'LOCAL', 'Calle Central Puerto #4-12', 'Buenaventura', 'El Centro', 'own_valle', 4000000, 8, 'ARRENDADO', 1]
    );

    // Contracts
    await run(
      `INSERT INTO inmo_contracts (id, number, property_id, tenant_id, start_date, end_date, monthly_rent, increment_percentage, status, active, lessor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['ctr_cali', 'CONTRATO-CLI-01', 'prop_cali', 'ten_sofia', '2026-01-01', '2026-12-31', 2500000, 5, 'VIGENTE', 1, 'own_valle']
    );
    await run(
      `INSERT INTO inmo_contracts (id, number, property_id, tenant_id, start_date, end_date, monthly_rent, increment_percentage, status, active, lessor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['ctr_bun', 'CONTRATO-BUN-02', 'prop_bun', 'ten_local_bun', '2026-01-01', '2026-12-31', 4000000, 5, 'VIGENTE', 1, 'own_valle']
    );

    // Inmo Rental Invoices (Cali)
    await run(
      `INSERT INTO inmo_invoices (id, number, period, contract_id, date, due_date, rent_amount, commission_amount, net_to_owner, total, status, tx_id, tax_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['ri_cali', 'IA-001', '2026-08', 'ctr_cali', '2026-08-05', '2026-08-10', 2500000, 250000, 2250000, 2500000, 'paid', 'tx_ia_cali', 0]
    );
    await run(
      `INSERT INTO inmo_invoice_lines (id, invoice_id, description, amount, account_code)
       VALUES (?, ?, ?, ?, ?)`,
      [genId(), 'ri_cali', 'Arrendamiento correspondiente al periodo 2026-08', 2500000, '41550501']
    );

    // Cali Inmo Accounting Entry
    // Clientes (Tenant accounts receivable): 13050501 [ID: 4ren7arg4ny71ou] -> DEBITO: 2,500,000
    // Acreedores / Arrendamientos por pagar (Owner accounts payable): 23354001 [ID: cgofcerz6a9uqfy] -> CREDITO: 2,250,000 (net)
    // Comisiones Inmobiliarias (Agency commission income): 41551001 [ID: es3uc8q6dzzfmw2] -> CREDITO: 250,000 (10%)
    await run(
      `INSERT INTO transactions (id, number, date, description, status, third_party_id, tx_type_id, user_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['tx_ia_cali', 'IA-001', '2026-08-05', 'Causación Arriendo mensual CONTRATO-CLI-01', 'active', 'ten_sofia', '6raxd1z9s08zp2h', 'sc4ygzh4io727qh', 'eo3d07bscdpb7kd']
    );
    await run(
      `INSERT INTO tx_lines (id, tx_id, account_id, debit, credit, description, line_order, third_party_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'tx_ia_cali', '4ren7arg4ny71ou', 2500000, 0, 'Cuenta por cobrar canon de arrendamiento inquilino', 0, 'ten_sofia', 'eo3d07bscdpb7kd']
    );
    await run(
      `INSERT INTO tx_lines (id, tx_id, account_id, debit, credit, description, line_order, third_party_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'tx_ia_cali', 'cgofcerz6a9uqfy', 0, 2250000, 'Canon neto por pagar a propietario', 1, 'own_valle', 'eo3d07bscdpb7kd']
    );
    await run(
      `INSERT INTO tx_lines (id, tx_id, account_id, debit, credit, description, line_order, third_party_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'tx_ia_cali', 'es3uc8q6dzzfmw2', 0, 250000, 'Ingreso comisión inmobiliaria 10%', 2, 'own_valle', 'eo3d07bscdpb7kd']
    );

    // Inmo Rental Invoices (Buenaventura)
    await run(
      `INSERT INTO inmo_invoices (id, number, period, contract_id, date, due_date, rent_amount, commission_amount, net_to_owner, total, status, tx_id, tax_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['ri_bun', 'IA-002', '2026-08', 'ctr_bun', '2026-08-05', '2026-08-10', 4000000, 320000, 3680000, 4000000, 'paid', 'tx_ia_bun', 0]
    );
    await run(
      `INSERT INTO inmo_invoice_lines (id, invoice_id, description, amount, account_code)
       VALUES (?, ?, ?, ?, ?)`,
      [genId(), 'ri_bun', 'Arrendamiento correspondiente al periodo 2026-08', 4000000, '41550501']
    );

    // Buenaventura Inmo Accounting Entry
    await run(
      `INSERT INTO transactions (id, number, date, description, status, third_party_id, tx_type_id, user_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['tx_ia_bun', 'IA-002', '2026-08-05', 'Causación Arriendo mensual CONTRATO-BUN-02', 'active', 'ten_local_bun', '6raxd1z9s08zp2h', 'sc4ygzh4io727qh', '8d30v195m0j3q3d']
    );
    await run(
      `INSERT INTO tx_lines (id, tx_id, account_id, debit, credit, description, line_order, third_party_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'tx_ia_bun', '4ren7arg4ny71ou', 4000000, 0, 'Cuenta por cobrar canon de arrendamiento inquilino', 0, 'ten_local_bun', '8d30v195m0j3q3d']
    );
    await run(
      `INSERT INTO tx_lines (id, tx_id, account_id, debit, credit, description, line_order, third_party_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'tx_ia_bun', 'cgofcerz6a9uqfy', 0, 3680000, 'Canon neto por pagar a propietario', 1, 'own_valle', '8d30v195m0j3q3d']
    );
    await run(
      `INSERT INTO tx_lines (id, tx_id, account_id, debit, credit, description, line_order, third_party_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [genId(), 'tx_ia_bun', 'es3uc8q6dzzfmw2', 0, 320000, 'Ingreso comisión inmobiliaria 8%', 2, 'own_valle', '8d30v195m0j3q3d']
    );
    console.log("  - Creada gestión inmobiliaria y facturación de arriendos con asientos contables.");

    console.log("\n=== COMPROBANDO BALANCE TOTAL (INTEGRIDAD CONTABLE) ===");
    // check if sum(debit) == sum(credit) for all loaded transactions
    db.all(
      `SELECT t.number, t.branch_id, SUM(l.debit) as debits, SUM(l.credit) as credits 
       FROM transactions t 
       JOIN tx_lines l ON t.id = l.tx_id 
       GROUP BY t.id`,
      [],
      (err, rows) => {
        if (err) console.error("Error al comprobar balance:", err);
        else {
          console.log("\nDetalle de Transacciones Cargadas:");
          let ok = true;
          rows.forEach(r => {
            const status = (r.debits === r.credits) ? "BALANCEADO (OK)" : "ERROR: DESBALANCEADO!";
            console.log(`  - Tx ${r.number} [Sucursal: ${r.branch_id}]: Débitos = $${r.debits}, Créditos = $${r.credits} -> ${status}`);
            if (r.debits !== r.credits) ok = false;
          });
          if (ok) {
            console.log("\n[✔] ÉXITO: Todos los registros contables se balancean matemáticamente.");
          } else {
            console.error("\n[X] ALERTA: Hay desbalances contables detectados.");
          }
        }
      }
    );

  } catch (err) {
    console.error("Error during seed process:", err);
  } finally {
    // Wait a little for the async check query to output logs before closing
    setTimeout(() => {
      db.close();
    }, 1000);
  }
}

main();
