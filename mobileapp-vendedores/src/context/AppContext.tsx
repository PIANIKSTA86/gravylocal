import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Invoice, Order, PaymentReceipt, Product, SyncState } from '../types';
import { CustomerRepository } from '../repositories/CustomerRepository';
import { InvoiceRepository } from '../repositories/InvoiceRepository';
import { OrderRepository } from '../repositories/OrderRepository';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { AuthService } from '../services/AuthService';
import { SyncService } from '../services/SyncService';

interface AppContextType {
  // Autenticación & Empresa
  isAuthenticated: boolean;
  user: any;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;

  // Listas de datos reactivos del ERP
  customers: Customer[];
  currentCustomer: Customer | null;
  setCurrentCustomer: (customer: Customer) => void;
  invoices: Invoice[];
  orders: Order[];
  products: Product[];
  paymentReceipts: PaymentReceipt[];
  
  // Estado de sincronización & Conexión
  syncState: SyncState;
  syncData: () => Promise<void>;

  // Notificaciones Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Acciones de negocio
  handleOrderCreated: (order: Order) => Promise<void>;
  handleConfirmPaymentReceipt: (receipt: PaymentReceipt) => Promise<void>;
  handleApproveReceipt: (receiptId: string, notes?: string) => Promise<void>;
  handleRejectReceipt: (receiptId: string, notes: string) => Promise<void>;

  // Cargando
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(AuthService.isAuthenticated());
  const [user, setUser] = useState<any>(AuthService.getCurrentUser());

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentReceipts, setPaymentReceipts] = useState<PaymentReceipt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: navigator.onLine,
    lastSyncedTime: 'Hoy 08:00 AM',
    pendingOrdersCount: 0,
    pendingPaymentsCount: 0,
    erpSystem: 'GRAVY ERP (PocketBase / Postgres)',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Monitoreo de conectividad a Internet
  useEffect(() => {
    const handleOnline = () => {
      setSyncState((prev) => ({ ...prev, isOnline: true }));
      showToast('Conexión reestablecida. Sincronizando datos...');
      syncData();
    };

    const handleOffline = () => {
      setSyncState((prev) => ({ ...prev, isOnline: false }));
      showToast('Modo sin conexión. Guardando cambios en cola offline local.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carga inicial de repositorios
  const refreshData = async () => {
    if (!AuthService.isAuthenticated()) return;
    setIsLoading(true);
    try {
      const [cList, pList, oList, rList] = await Promise.all([
        CustomerRepository.getCustomers(),
        ProductRepository.getProducts(),
        OrderRepository.getOrders(),
        PaymentRepository.getPaymentReceipts(),
      ]);

      setCustomers(cList);
      if (cList.length > 0 && !currentCustomer) {
        setCurrentCustomer(cList[0]);
      }

      setProducts(pList);
      setOrders(oList);
      setPaymentReceipts(rList);

      if (cList.length > 0) {
        const invList = await InvoiceRepository.getInvoicesByCustomer();
        setInvoices(invList);
      }

      setSyncState((prev) => ({
        ...prev,
        lastSyncedTime: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        pendingOrdersCount: SyncService.getPendingQueue().filter((q) => q.type === 'ORDER').length,
        pendingPaymentsCount: SyncService.getPendingQueue().filter((q) => q.type === 'PAYMENT').length,
      }));
    } catch (err) {
      console.error('[AppContext] Error al cargar datos iniciales:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      await AuthService.login(email, pass);
      setIsAuthenticated(true);
      setUser(AuthService.getCurrentUser());
      showToast('¡Bienvenido al sistema de ventas GRAVY!');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Error de autenticación. Verifica tus credenciales.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setCustomers([]);
    setCurrentCustomer(null);
  };

  const syncData = async () => {
    const res = await SyncService.syncPendingQueue((msg) => showToast(msg));
    if (res.success > 0) {
      showToast(`¡Sincronización completada! ${res.success} registros subidos.`);
      await refreshData();
    }
  };

  const handleOrderCreated = async (newOrder: Order) => {
    if (!syncState.isOnline) {
      SyncService.enqueueOfflineItem('ORDER', newOrder);
      showToast(`Pedido ${newOrder.orderNumber} guardado en cola offline.`);
    } else {
      await OrderRepository.createOrder(newOrder);
      showToast(`¡Pedido ${newOrder.orderNumber} registrado con éxito!`);
    }
    await refreshData();
  };

  const handleConfirmPaymentReceipt = async (receipt: PaymentReceipt) => {
    if (!syncState.isOnline) {
      SyncService.enqueueOfflineItem('PAYMENT', receipt);
      showToast(`Recaudo ${receipt.receiptNumber} guardado offline.`);
    } else {
      await PaymentRepository.createPaymentReceipt(receipt);
      showToast(`¡Recibo ${receipt.receiptNumber} enviado a revisión de Tesorería!`);
    }
    await refreshData();
  };

  const handleApproveReceipt = async (receiptId: string, notes?: string) => {
    await PaymentRepository.approveReceipt(receiptId, notes);
    showToast('¡Recaudo aprobado y asentado en contabilidad!');
    await refreshData();
  };

  const handleRejectReceipt = async (receiptId: string, notes: string) => {
    await PaymentRepository.rejectReceipt(receiptId, notes);
    showToast('Recaudo devuelto con observaciones.');
    await refreshData();
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        customers,
        currentCustomer,
        setCurrentCustomer,
        invoices,
        orders,
        products,
        paymentReceipts,
        syncState,
        syncData,
        toastMessage,
        showToast,
        handleOrderCreated,
        handleConfirmPaymentReceipt,
        handleApproveReceipt,
        handleRejectReceipt,
        isLoading,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser utilizado dentro de un AppProvider');
  }
  return context;
};
