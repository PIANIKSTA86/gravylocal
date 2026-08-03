/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1. Colección de listas de precios
  const listasPrecios = new Collection({
    name: "listas_precios",
    type: "base",
    system: false,
    fields: [
      {
        name: "id",
        type: "text",
        required: true,
        system: true,
        primaryKey: true,
        autogeneratePattern: "[a-z0-9]{15}"
      },
      {
        name: "nombre",
        type: "text",
        required: true,
        max: 100
      },
      {
        name: "activo",
        type: "bool",
        required: false
      }
    ],
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
    updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
    deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'"
  });
  app.save(listasPrecios);

  // Obtener ID de products dinámicamente
  const productsCol = app.findCollectionByNameOrId("products");

  // 2. Colección de precios específicos de productos por lista
  const preciosProducto = new Collection({
    name: "precios_producto",
    type: "base",
    system: false,
    fields: [
      {
        name: "id",
        type: "text",
        required: true,
        system: true,
        primaryKey: true,
        autogeneratePattern: "[a-z0-9]{15}"
      },
      {
        name: "producto_id",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: productsCol.id,
        cascadeDelete: true
      },
      {
        name: "lista_precio_id",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: listasPrecios.id,
        cascadeDelete: true
      },
      {
        name: "precio",
        type: "number",
        required: true
      }
    ],
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
    updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
    deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'"
  });
  app.save(preciosProducto);

  // 3. Colección de clientes
  const clientes = new Collection({
    name: "clientes",
    type: "base",
    system: false,
    fields: [
      {
        name: "id",
        type: "text",
        required: true,
        system: true,
        primaryKey: true,
        autogeneratePattern: "[a-z0-9]{15}"
      },
      {
        name: "nombre",
        type: "text",
        required: true
      },
      {
        name: "documento",
        type: "text",
        required: true
      },
      {
        name: "limite_credito",
        type: "number",
        required: false
      },
      {
        name: "saldo_actual",
        type: "number",
        required: false
      },
      {
        name: "lista_precio_defecto",
        type: "relation",
        required: false,
        maxSelect: 1,
        collectionId: listasPrecios.id,
        cascadeDelete: false
      }
    ],
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''"
  });
  app.save(clientes);

  // Obtener ID de invoices dinámicamente
  const invoicesCol = app.findCollectionByNameOrId("invoices");

  // 4. Colección de abonos / pagos
  const payments = new Collection({
    name: "payments",
    type: "base",
    system: false,
    fields: [
      {
        name: "id",
        type: "text",
        required: true,
        system: true,
        primaryKey: true,
        autogeneratePattern: "[a-z0-9]{15}"
      },
      {
        name: "invoice_id",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: invoicesCol.id,
        cascadeDelete: false
      },
      {
        name: "amount",
        type: "number",
        required: true
      },
      {
        name: "payment_method",
        type: "text",
        required: true
      },
      {
        name: "date",
        type: "date",
        required: true
      }
    ],
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''"
  });
  app.save(payments);

}, (app) => {
  const p = app.findCollectionByNameOrId("payments");
  if (p) app.delete(p);
  
  const c = app.findCollectionByNameOrId("clientes");
  if (c) app.delete(c);

  const pp = app.findCollectionByNameOrId("precios_producto");
  if (pp) app.delete(pp);

  const lp = app.findCollectionByNameOrId("listas_precios");
  if (lp) app.delete(lp);
});
