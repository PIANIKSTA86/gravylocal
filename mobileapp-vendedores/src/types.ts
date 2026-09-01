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
  category: string;
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
  reservationExpiresAt?: string; // Fecha límite de vigencia de la reserva
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

export type VisitStatus = 'PROGRAMADA' | 'EN_CURSO' | 'COMPLETADA_PEDIDO' | 'COMPLETADA_RECAUDO' | 'NO_EFECTIVA' | 'REPROGRAMADA';
export type VisitObjective = 'VENTA' | 'COBRO' | 'SEGUIMIENTO' | 'PROSPECCION';

export interface VendorVisit {
  id: string;
  sellerId: string;
  sellerName?: string;
  customerId: string;
  customerName: string;
  customerAddress?: string;
  customerPhone?: string;
  customerCity?: string;
  date: string;
  orderSeq: number;
  status: VisitStatus;
  objective: VisitObjective;
  checkinTime?: string;
  checkoutTime?: string;
  geoLat?: number;
  geoLng?: number;
  salesOrderId?: string;
  salesOrderNumber?: string;
  noOrderReason?: 'STOCK_SUFICIENTE' | 'LOCAL_CERRADO' | 'ENCARGADO_NO_DISPONIBLE' | 'PRECIO' | 'OTRO' | string;
  notes?: string;
  customerBalanceDue?: number;
  customerCreditLimit?: number;
}

export interface SyncState {
  isOnline: boolean;
  lastSyncedTime: string;
  pendingOrdersCount: number;
  pendingPaymentsCount: number;
  pendingVisitsCount?: number;
  erpSystem: string;
}
