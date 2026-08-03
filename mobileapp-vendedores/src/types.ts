export type InvoiceStatus = 'Pagada' | 'Pendiente Tesorería' | 'Vencida' | 'En Proceso';

export type PaymentApprovalStatus = 'Pendiente Aprobación' | 'Aprobado Contabilidad' | 'Rechazado';

export interface PaymentReceiptInvoiceItem {
  invoiceId: string;
  invoiceNumber: string;
  amountPaid: number;
  totalInvoiceAmount: number;
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  paymentMethod: 'Transferencia' | 'Efectivo' | 'Cheque' | 'Datafono POS' | string;
  referenceNo: string;
  invoicesPaid: PaymentReceiptInvoiceItem[];
  totalAmount: number;
  evidenceUrl?: string;
  signatureDataUrl?: string;
  status: PaymentApprovalStatus;
  treasuryNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  description: string;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  customerId: string;
  category: string;
  agingDays: number; // 0 = Al día, 1-30, 31-60, 60+
}

export interface Customer {
  id: string;
  name: string;
  nit: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  region: string;
  creditLimit: number;
  creditUsed: number;
  balanceDue: number;
  avgPayCycleDays: number;
  status: 'ACTIVE PARTNER' | 'ON HOLD' | 'CREDIT RISK';
  agingSummary: {
    alDia: number;
    d1_30: number;
    d31_60: number;
    d60Plus: number;
  };
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'Beverages' | 'Dry Goods' | 'Perishables' | 'Cleaning';
  price: number;
  stock: number;
  unit: string;
  imageUrl?: string;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderType = 'Pedido' | 'Reserva';
export type OrderStatus = 'Borrador' | 'Pendiente Sincronización' | 'Sincronizado ERP' | 'Aprobado' | 'Modificado' | 'Cancelado';

export interface Order {
  id: string;
  orderNumber: string;
  documentType: OrderType;
  customerId: string;
  customerName: string;
  customerNit?: string;
  date: string;
  deliveryDate?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentTerms: string;
  notes?: string;
  createdBySeller?: string;
}

export interface SyncState {
  isOnline: boolean;
  lastSyncedTime: string;
  pendingOrdersCount: number;
  pendingPaymentsCount: number;
  erpSystem: 'SAP S/4HANA' | 'Dynamics 365' | 'Odoo Enterprise';
}

