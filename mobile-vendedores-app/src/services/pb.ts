import PocketBase from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEFAULT_PB_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8090' : 'http://localhost:8090';
export const PB_URL = process.env.EXPO_PUBLIC_PB_URL || DEFAULT_PB_URL;

export const pb = new PocketBase(PB_URL);

export async function loginWithPassword(email: string, password: string) {
  return pb.collection('users').authWithPassword(email.trim(), password);
}

// --- TIPOS DE DATOS DEL SISTEMA DE VENTAS ---

export type ListaPrecio = {
  id: string;
  nombre: string;
  activo: boolean;
};

export type PrecioProducto = {
  id: string;
  producto_id: string;
  lista_precio_id: string;
  precio: number;
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  base_price: number;
  stock: number;
};

export type Cliente = {
  id: string;
  nombre: string;
  documento: string;
  limite_credito?: number;
  saldo_actual?: number;
  lista_precio_defecto?: string;
  expand?: {
    lista_precio_defecto?: ListaPrecio;
  };
};

export type SalesInvoice = {
  id: string;
  customer_id: string;
  number: string;
  total: number;
  due_date: string;
  status: 'draft' | 'unpaid' | 'partial' | 'paid' | string;
  expand?: {
    customer_id?: Cliente;
  };
};

export type Payment = {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  date: string;
  expand?: {
    invoice_id?: SalesInvoice;
  };
};

export type OrderDetailInput = {
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  lista_precio_id: string;
};

export type OrderInput = {
  cliente_id: string;
  vendedor_id: string;
  detalles: OrderDetailInput[];
  observaciones?: string;
};

// --- SERVICIOS API PARA VENDEDORES ---

/**
 * Obtener todos los clientes asignados o disponibles
 */
export async function getClientes(): Promise<Cliente[]> {
  const [records, invoices] = await Promise.all([
    pb.collection('third_parties').getFullList({
      filter: 'type = "CLIENTE"',
      sort: 'name',
    }),
    pb.collection('invoices').getFullList({
      filter: 'status != "paid" && status != "voided" && status != "cancelled"',
    })
  ]);

  // Agrupar saldos por cliente
  const saldosMap: Record<string, number> = {};
  invoices.forEach((inv) => {
    const cid = inv.customer_id;
    if (cid) {
      saldosMap[cid] = (saldosMap[cid] || 0) + (inv.total || 0);
    }
  });

  return records.map((r) => ({
    id: r.id,
    nombre: r.name,
    documento: r.doc_number || '',
    limite_credito: r.credit_limit || 0,
    saldo_actual: saldosMap[r.id] || 0,
    lista_precio_defecto: '', // se puede asignar vacío por defecto
  }));
}

/**
 * Obtener el historial de facturas y cartera de un cliente específico
 */
export async function getCarteraCliente(clienteId: string): Promise<SalesInvoice[]> {
  return pb.collection('invoices').getFullList<SalesInvoice>({
    filter: `customer_id = "${clienteId}"`,
    sort: '-due_date',
  });
}

/**
 * Obtener el historial de abonos de una factura específica
 */
export async function getAbonosFactura(invoiceId: string): Promise<Payment[]> {
  return pb.collection('payments').getFullList<Payment>({
    filter: `invoice_id = "${invoiceId}"`,
    sort: '-date',
  });
}

/**
 * Obtener las listas de precios habilitadas
 */
export async function getListasPrecios(): Promise<ListaPrecio[]> {
  return pb.collection('listas_precios').getFullList<ListaPrecio>({
    filter: 'activo = true',
  });
}

/**
 * Obtener precios específicos de productos para una lista de precios dada
 */
export async function getPreciosPorLista(listaPrecioId: string): Promise<PrecioProducto[]> {
  return pb.collection('precios_producto').getFullList<PrecioProducto>({
    filter: `lista_precio_id = "${listaPrecioId}"`,
  });
}

/**
 * Obtener catálogo completo de productos con inventario
 */
export async function getCatalogoProductos(): Promise<Product[]> {
  return pb.collection('products').getFullList<Product>({
    filter: 'active = true',
  });
}

/**
 * Enviar / Sincronizar un nuevo pedido a PocketBase
 */
export async function crearPedido(pedido: OrderInput): Promise<any> {
  // 1. Generar un número de pedido único basado en fecha y hora (evita error 403 en tabla settings)
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
  const msStr = String(now.getMilliseconds()).padStart(3, '0');
  const orderNum = `PED-${dateStr}-${timeStr}-${msStr}`;

  // 2. Calcular los totales de las líneas
  let subtotal = 0;
  let ivaTot = 0;

  // Por ahora, asumiremos que las líneas incluyen un cálculo de IVA del 19% por defecto o 0% si corresponde.
  // Buscaremos detalles sobre los productos para asignarles el nombre a la línea de pedido.
  const detallesConInfo = await Promise.all(
    pedido.detalles.map(async (d, index) => {
      let description = "Línea de Pedido";
      let ivaRate = 19; // Asumiendo IVA general del 19% por defecto
      try {
        const prod = await pb.collection('products').getOne(d.producto_id);
        description = prod.name || description;
        // Si el producto especifica una tasa de IVA diferente, la asignamos aquí.
        if (prod.iva_rate !== undefined) ivaRate = Number(prod.iva_rate);
      } catch (_) {}

      // Cálculo del IVA
      const lineSub = d.cantidad * d.precio_unitario;
      const lineIva = lineSub * (ivaRate / 100);
      const lineTotal = lineSub + lineIva;

      subtotal += lineSub;
      ivaTot += lineIva;

      return {
        line_order: index + 1,
        product_id: d.producto_id,
        description,
        qty: d.cantidad,
        unit_price: d.precio_unitario,
        iva_rate: ivaRate,
        iva_amount: lineIva,
        subtotal: lineSub,
        total: lineTotal,
      };
    })
  );

  const total = subtotal + ivaTot;

  // Buscar el ID del vendedor correspondiente en third_parties mediante su correo electrónico
  let sellerId: string | null = null;
  try {
    const userEmail = pb.authStore.record?.email;
    if (userEmail) {
      const tp = await pb.collection('third_parties').getFirstListItem(`email="${userEmail}"`);
      if (tp) sellerId = tp.id;
    }
  } catch (_) {}

  // 3. Crear cabecera de pedido de venta
  const order = await pb.collection('sales_orders').create({
    number: orderNum,
    customer_id: pedido.cliente_id,
    warehouse_id: null,
    date: new Date().toISOString().slice(0, 10),
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // Vence en 5 días
    notes: pedido.observaciones || 'Pedido registrado desde la App Móvil de Vendedores.',
    subtotal,
    iva_total: ivaTot,
    discount_amount: 0,
    total,
    status: 'pending',
    user_id: pb.authStore.record?.id,
    seller_id: sellerId,
  });

  // 4. Crear las líneas de pedido de venta
  for (const line of detallesConInfo) {
    // Obtener la cuenta contable de ingresos asociada al producto si existe (igual a ecommerce)
    let prodAccountId = null;
    try {
      const prod = await pb.collection('products').getOne(line.product_id);
      prodAccountId = prod.income_account_id || null;
    } catch (_) {}

    await pb.collection('sales_order_lines').create({
      sales_order_id: order.id,
      line_order: line.line_order,
      product_id: line.product_id,
      qty: line.qty,
      unit_price: line.unit_price,
      iva_rate: line.iva_rate,
      iva_amount: line.iva_amount,
      subtotal: line.subtotal,
      total: line.total,
      description: line.description,
      account_id: prodAccountId,
    });
  }

  return order;
}
