/// <reference path="../pb_data/types.d.ts" />

/**
 * Endpoints públicos para la Tienda Virtual E-commerce.
 * GET /api/public/ecommerce/products - Catálogo seguro de productos con stock agregado.
 * POST /api/public/ecommerce/orders - Registro atómico de pedidos sin requerir autenticación.
 */

routerAdd("GET", "/api/public/ecommerce/products", (e) => {
  try {
    // 1. Obtener todos los productos activos
    const products = $app.findRecordsByFilter("products", "active = true", "name", 1000, 0) || [];
    
    // Obtener bodega de e-commerce si está configurada
    let ecommerceWarehouseId = "";
    try {
      const settingsRecord = $app.findFirstRecordByFilter("settings", "key = 'ecommerce_default_warehouse_id'");
      ecommerceWarehouseId = settingsRecord.getString("value");
    } catch (_) {}

    // 2. Obtener registros de inventario con existencias
    let filter = "qty_on_hand > 0";
    if (ecommerceWarehouseId) {
      filter += " && warehouse_id = '" + ecommerceWarehouseId + "'";
    }
    const stocks = $app.findRecordsByFilter("inventory_stock", filter, "", 10000, 0) || [];
    
    // 3. Crear mapa de stock acumulado por product_id
    const stockMap = {};
    for (const st of stocks) {
      const prodId = st.getString("product_id");
      const qty = st.getFloat("qty_on_hand") || 0;
      stockMap[prodId] = (stockMap[prodId] || 0) + qty;
    }

    // Obtener lista de precios configurada para la tienda virtual
    let priceListKey = "base_price";
    try {
      const settingsRecord = $app.findFirstRecordByFilter("settings", "key = 'ecommerce_price_list'");
      priceListKey = settingsRecord.getString("value") || "base_price";
    } catch (_) {}

    // 4. Mapear y sanitizar productos (excluyendo precios de costo y cuentas contables)
    const sanitizedProducts = [];
    for (const p of products) {
      const id = p.id;
      const code = p.getString("code");
      const name = p.getString("name");
      const description = p.getString("description");
      const basePrice = p.getFloat("base_price") || 0;
      const precio2 = p.getFloat("precio_venta_2") || 0;
      const presentacion = p.getString("presentacion");
      const categoria = p.getString("categoria");
      const linea = p.getString("linea");
      const active = p.getBool("active");
      const image = p.getString("image");

      if (!active) continue;

      // URL pública del archivo en PocketBase
      const imageUrl = image ? `/api/files/${p.collection().id}/${id}/${image}` : '';
      const stock = stockMap[id] || 0;

      // Seleccionar el precio a mostrar en base a la configuración
      const displayPrice = priceListKey === "precio_venta_2" ? precio2 : basePrice;

      sanitizedProducts.push({
        id: id,
        code: code,
        name: name,
        description: description,
        price: displayPrice,
        precio_venta_2: precio2,
        presentacion: presentacion,
        categoria: categoria,
        linea: linea,
        imageUrl: imageUrl,
        stock: stock
      });
    }

    return e.json(200, sanitizedProducts);
  } catch (err) {
    return e.json(500, { message: "Error al obtener catálogo de productos: " + String(err) });
  }
});

routerAdd("GET", "/api/public/ecommerce/config", (e) => {
  try {
    let whatsappNumber = "573000000000";
    let storeName = "GRAVY";

    try {
      const waRecord = $app.findFirstRecordByFilter("settings", "key = 'ecommerce_whatsapp_number'");
      whatsappNumber = waRecord.getString("value") || whatsappNumber;
    } catch (_) {}

    try {
      const nameRecord = $app.findFirstRecordByFilter("settings", "key = 'ecommerce_store_name'");
      storeName = nameRecord.getString("value") || storeName;
    } catch (_) {}

    return e.json(200, {
      whatsapp_number: whatsappNumber,
      store_name: storeName
    });
  } catch (err) {
    return e.json(500, { message: "Error al obtener configuración pública: " + String(err) });
  }
});

routerAdd("POST", "/api/public/ecommerce/orders", (e) => {
  try {
    const info = e.requestInfo();
    const body = info?.body || {};

    const docType = String(body.doc_type || "CC").toUpperCase();
    const docNumber = String(body.doc_number || "").trim().toUpperCase();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const address = String(body.address || "").trim();
    const entrega = String(body.entrega || "").trim();
    const referencias = String(body.referencias || "").trim();
    const notas = String(body.notas || "").trim();
    const items = body.items || []; // Array de { product_id, qty }

    if (!docNumber || !name) {
      return e.json(400, { message: "El número de documento y el nombre son campos obligatorios." });
    }

    if (!items.length) {
      return e.json(400, { message: "El pedido debe contener al menos un producto." });
    }

    // 1. Resolver o crear el cliente (tercero)
    let customerId = "";
    let customerRecord = null;
    try {
      customerRecord = $app.findFirstRecordByFilter("third_parties", "doc_number = '" + docNumber + "'");
      customerId = customerRecord.id;
    } catch (_) {
      // Registrar un tercero de tipo CLIENTE automáticamente
      const tpCol = $app.findCollectionByNameOrId("third_parties");
      customerRecord = new Record(tpCol, {
        type: "CLIENTE",
        doc_type: docType,
        doc_number: docNumber,
        name: name,
        email: email,
        phone: phone,
        address: address,
        active: true
      });
      $app.save(customerRecord);
      customerId = customerRecord.id;
    }

    // 2. Buscar usuario administrador/sistema para la auditoría y asignación requerida de user_id
    let defaultUserId = "";
    try {
      const settingsRecord = $app.findFirstRecordByFilter("settings", "key = 'ecommerce_default_user_id'");
      defaultUserId = settingsRecord.getString("value");
    } catch (_) {}

    if (!defaultUserId) {
      try {
        const adminRecord = $app.findFirstRecordByFilter("users", "active = true && role = 'superadmin'");
        defaultUserId = adminRecord.id;
      } catch (_) {
        try {
          const fallbackRecord = $app.findFirstRecordByFilter("users", "active = true");
          defaultUserId = fallbackRecord.id;
        } catch (_) {}
      }
    }

    if (!defaultUserId) {
      return e.json(500, { message: "Error interno: no se encontró un usuario responsable para el pedido." });
    }

    // 3. Obtener bodega por defecto
    let defaultWarehouseId = "";
    try {
      const settingsRecord = $app.findFirstRecordByFilter("settings", "key = 'ecommerce_default_warehouse_id'");
      defaultWarehouseId = settingsRecord.getString("value");
    } catch (_) {}

    if (!defaultWarehouseId) {
      try {
        const warehouseRecord = $app.findFirstRecordByFilter("warehouses", "active = true");
        defaultWarehouseId = warehouseRecord.id;
      } catch (_) {}
    }

    // 4. Generar consecutivo del pedido
    let consecutive = 0;
    let settingRecord = null;
    try {
      settingRecord = $app.findFirstRecordByFilter("settings", "key = 'order_consecutive'");
      consecutive = parseInt(settingRecord.getString("value") || "0", 10);
    } catch (err) {
      const settingsCol = $app.findCollectionByNameOrId("settings");
      settingRecord = new Record(settingsCol, { key: "order_consecutive", value: "0" });
    }

    consecutive += 1;
    settingRecord.set("value", String(consecutive));
    $app.save(settingRecord);
    const orderNumber = "PED-" + String(consecutive).padStart(8, "0");

    // 5. Validar disponibilidad de stock y acumular totales
    let subtotal = 0;
    let ivaTotal = 0;
    const linesToCreate = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const prodId = item.product_id;
      const requestedQty = parseFloat(item.qty || "0");

      if (!prodId || requestedQty <= 0) {
        return e.json(400, { message: "Producto o cantidad inválida en la línea " + (i + 1) });
      }

      // Validar producto existente e activo
      let product = null;
      try {
        product = $app.findRecordById("products", prodId);
      } catch (_) {
        return e.json(404, { message: "Producto no encontrado: ID " + prodId });
      }

      if (!product.getBool("active")) {
        return e.json(400, { message: "El producto " + product.getString("name") + " no está activo." });
      }

      // Validar existencias (si la bodega default de ecommerce está configurada, verificar en ella, si no, global)
      let availableStock = 0;
      let checkWarehouseId = "";
      try {
        const settingsRecord = $app.findFirstRecordByFilter("settings", "key = 'ecommerce_default_warehouse_id'");
        checkWarehouseId = settingsRecord.getString("value");
      } catch (_) {}

      if (checkWarehouseId) {
        try {
          const stockRec = $app.findFirstRecordByFilter("inventory_stock", "product_id = '" + prodId + "' && warehouse_id = '" + checkWarehouseId + "'");
          availableStock = stockRec.getFloat("qty_on_hand") || 0;
        } catch (_) {}
      } else {
        const stocks = $app.findRecordsByFilter("inventory_stock", "product_id = '" + prodId + "'", "", 100, 0) || [];
        for (const st of stocks) {
          availableStock += st.getFloat("qty_on_hand") || 0;
        }
      }

      if (availableStock < requestedQty) {
        return e.json(400, {
          message: "Stock insuficiente para el producto: " + product.getString("name") + ". Disponible: " + availableStock + ", solicitado: " + requestedQty
        });
      }

      // Calcular montos de la línea (respetando la lista de precios configurada)
      let priceListKey = "base_price";
      try {
        const settingsRecord = $app.findFirstRecordByFilter("settings", "key = 'ecommerce_price_list'");
        priceListKey = settingsRecord.getString("value") || "base_price";
      } catch (_) {}

      const basePrice = product.getFloat("base_price") || 0;
      const precio2 = product.getFloat("precio_venta_2") || 0;
      const price = priceListKey === "precio_venta_2" ? precio2 : basePrice;

      const lineSubtotal = price * requestedQty;
      const ivaRate = product.getFloat("iva_rate") || 0;
      const lineIvaAmount = Math.round(lineSubtotal * (ivaRate / 100) * 100) / 100;
      const lineTotal = lineSubtotal + lineIvaAmount;

      subtotal += lineSubtotal;
      ivaTotal += lineIvaAmount;

      linesToCreate.push({
        product_id: prodId,
        qty: requestedQty,
        unit_price: price,
        iva_rate: ivaRate,
        iva_amount: lineIvaAmount,
        subtotal: lineSubtotal,
        total: lineTotal,
        description: product.getString("name"),
        account_id: product.getString("income_account_id") || null
      });
    }

    const orderTotal = subtotal + ivaTotal;

    // 6. Crear cabecera del pedido (sales_orders)
    const ordersCol = $app.findCollectionByNameOrId("sales_orders");
    
    let orderNotes = "Pedido público registrado desde la Tienda Virtual E-commerce.";
    if (entrega) {
      orderNotes += "\nMétodo de entrega: " + entrega;
    }
    if (referencias) {
      orderNotes += "\nReferencias: " + referencias;
    }
    if (notas) {
      orderNotes += "\nNotas del cliente: " + notas;
    }

    // Obtener branch_id de la bodega seleccionada si está disponible
    let orderBranchId = "";
    if (defaultWarehouseId) {
      try {
        const whRecord = $app.findRecordById("warehouses", defaultWarehouseId);
        orderBranchId = whRecord.getString("branch_id") || "";
      } catch (_) {}
    }

    // Si la bodega no tiene branch_id, intentar con el default_branch_id del usuario e-commerce
    if (!orderBranchId && defaultUserId) {
      try {
        const userRecord = $app.findRecordById("users", defaultUserId);
        orderBranchId = userRecord.getString("default_branch_id") || "";
      } catch (_) {}
    }

    // Si sigue vacía, tomar la primera sucursal activa en la base de datos como fallback
    if (!orderBranchId) {
      try {
        const branchRecord = $app.findFirstRecordByFilter("branches", "active = true");
        orderBranchId = branchRecord.id;
      } catch (_) {}
    }

    const orderRecord = new Record(ordersCol, {
      number: orderNumber,
      customer_id: customerId,
      warehouse_id: defaultWarehouseId || null,
      branch_id: orderBranchId || null,
      date: new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10),
      notes: orderNotes,
      subtotal: subtotal,
      iva_total: ivaTotal,
      discount_amount: 0,
      total: orderTotal,
      status: "pending",
      user_id: defaultUserId
    });
    $app.save(orderRecord);

    // 7. Crear líneas del pedido (sales_order_lines)
    const linesCol = $app.findCollectionByNameOrId("sales_order_lines");
    for (let i = 0; i < linesToCreate.length; i++) {
      const lineData = linesToCreate[i];
      const lineRecord = new Record(linesCol, {
        sales_order_id: orderRecord.id,
        line_order: i + 1,
        product_id: lineData.product_id,
        qty: lineData.qty,
        unit_price: lineData.unit_price,
        iva_rate: lineData.iva_rate,
        iva_amount: lineData.iva_amount,
        subtotal: lineData.subtotal,
        total: lineData.total,
        description: lineData.description,
        account_id: lineData.account_id
      });
      $app.save(lineRecord);
    }

    // Registrar en auditoría
    try {
      const auditCol = $app.findCollectionByNameOrId("audit_log");
      const log = new Record(auditCol, {
        action: "CREATE",
        collection_name: "sales_orders",
        record_id: orderRecord.id,
        details: "Pedido E-commerce registrado públicamente " + orderNumber + " para cliente " + name + " (" + docNumber + "). Total: " + orderTotal,
        user_id: defaultUserId,
        timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 19)
      });
      $app.save(log);
    } catch (_) {}

    return e.json(200, {
      success: true,
      order_id: orderRecord.id,
      order_number: orderNumber,
      total: orderTotal,
      message: "Pedido registrado con éxito."
    });
  } catch (err) {
    return e.json(500, { message: "Error al registrar pedido: " + String(err) });
  }
});
