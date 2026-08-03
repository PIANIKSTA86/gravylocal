import React, { useState } from 'react';
import { Invoice, Order } from './types';
import { formatCOP } from './lib/utils';
import { Header } from './components/Header';
import { CustomerCard } from './components/CustomerCard';
import { PortfolioAging } from './components/PortfolioAging';
import { InvoiceTimeline } from './components/InvoiceTimeline';
import { BottomNav, NavTab } from './components/BottomNav';
import { CustomerSelectorModal } from './components/CustomerSelectorModal';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { PaymentModal } from './components/PaymentModal';
import { OrderBuilderModal } from './components/OrderBuilderModal';
import { SyncDashboardModal } from './components/SyncDashboardModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { NotificationsModal } from './components/NotificationsModal';
import { InventoryView } from './components/InventoryView';
import { MoreView } from './components/MoreView';
import { OrdersManagementView } from './components/OrdersManagementView';
import { EditOrderModal } from './components/EditOrderModal';
import { DashboardView } from './components/DashboardView';
import { TreasuryManagementView } from './components/TreasuryManagementView';
import { AppProvider, useApp } from './context/AppContext';
import { LoginView } from './components/auth/LoginView';

function MainAppContent() {
  const {
    isAuthenticated,
    customers,
    currentCustomer,
    setCurrentCustomer,
    invoices,
    orders,
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
  } = useApp();

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [agingFilter, setAgingFilter] = useState<string | null>(null);

  // Modals state
  const [isCustomerSelectorOpen, setIsCustomerSelectorOpen] = useState(false);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<Invoice | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isOrderBuilderOpen, setIsOrderBuilderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  if (isLoading && customers.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4" />
        <p className="text-sm font-medium text-slate-300">Cargando ERP GRAVY Mobile...</p>
      </div>
    );
  }

  const activeCust = currentCustomer || customers[0];

  // Filter invoices for current customer
  const customerInvoices = activeCust ? invoices.filter((inv) => inv.customerId === activeCust.id) : invoices;

  const filteredInvoices = customerInvoices.filter((inv) => {
    if (!agingFilter) return true;
    if (agingFilter === 'al_dia') return inv.status === 'Pagada';
    if (agingFilter === '1_30') return inv.agingDays >= 1 && inv.agingDays <= 30 && inv.status !== 'Pagada';
    if (agingFilter === '31_60') return inv.agingDays >= 31 && inv.agingDays <= 60 && inv.status !== 'Pagada';
    if (agingFilter === '60_plus') return inv.agingDays > 60 && inv.status !== 'Pagada';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans antialiased text-gray-900 flex justify-center selection:bg-teal-500 selection:text-white">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col pb-28">
        
        {/* Global Toast Feedback Banner */}
        {toastMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-xs w-full bg-gray-900/95 text-white text-xs px-4 py-3 rounded-2xl shadow-2xl border border-gray-700/80 flex items-center justify-between animate-bounce">
            <span className="font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* View Switcher */}
        {activeTab === 'dashboard' && (
          <DashboardView
            customers={customers}
            currentCustomer={activeCust}
            invoices={invoices}
            orders={orders}
            onSelectCustomer={(c) => {
              setCurrentCustomer(c);
              setActiveTab('customers');
            }}
            onOpenOrderBuilder={() => setIsOrderBuilderOpen(true)}
            onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
            onOpenSync={() => setIsSyncModalOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          />
        )}

        {activeTab === 'customers' && activeCust && (
          <>
            <Header
              currentCustomer={activeCust}
              onOpenCustomerSelector={() => setIsCustomerSelectorOpen(true)}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
            />

            <CustomerCard
              customer={activeCust}
              onOpenCreditDetails={() => setIsAiAssistantOpen(true)}
            />

            <PortfolioAging
              customer={activeCust}
              selectedFilter={agingFilter}
              onSelectFilter={(f) => setAgingFilter(f)}
            />

            <InvoiceTimeline
              invoices={filteredInvoices}
              onSelectInvoice={(inv) => setSelectedInvoiceForDetail(inv)}
              onViewAll={() => setAgingFilter(null)}
            />
          </>
        )}

        {activeTab === 'orders' && (
          <OrdersManagementView
            orders={orders}
            onOpenOrderBuilder={() => setIsOrderBuilderOpen(true)}
            onEditOrder={(ord) => setEditingOrder(ord)}
            onSyncOrder={() => syncData()}
            onDeleteOrder={() => {}}
            onConvertType={() => {}}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            onOpenOrderBuilder={() => setIsOrderBuilderOpen(true)}
          />
        )}

        {activeTab === 'treasury' && (
          <TreasuryManagementView
            receipts={paymentReceipts}
            onApproveReceipt={handleApproveReceipt}
            onRejectReceipt={handleRejectReceipt}
            onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
          />
        )}

        {activeTab === 'more' && (
          <MoreView
            customer={activeCust}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
            onOpenSync={() => setIsSyncModalOpen(true)}
            onOpenCustomerSelector={() => setIsCustomerSelectorOpen(true)}
            onOpenTreasury={() => setActiveTab('treasury')}
          />
        )}

        {/* Floating Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'sync') {
              setIsSyncModalOpen(true);
            } else {
              if (tab === 'customers') setAgingFilter(null);
              setActiveTab(tab);
            }
          }}
          onOpenOrderBuilder={() => setIsOrderBuilderOpen(true)}
          pendingSyncCount={syncState.pendingOrdersCount}
        />

        {/* Modals & Drawers */}
        {activeCust && (
          <CustomerSelectorModal
            isOpen={isCustomerSelectorOpen}
            onClose={() => setIsCustomerSelectorOpen(false)}
            customers={customers}
            selectedCustomerId={activeCust.id}
            onSelectCustomer={(cust) => {
              setCurrentCustomer(cust);
              setAgingFilter(null);
              showToast(`Cliente activo: ${cust.name}`);
            }}
          />
        )}

        <InvoiceDetailModal
          invoice={selectedInvoiceForDetail}
          customer={activeCust}
          onClose={() => setSelectedInvoiceForDetail(null)}
          onOpenPaymentModal={(inv) => setSelectedInvoiceForPayment(inv)}
        />

        {activeCust && (
          <PaymentModal
            invoice={selectedInvoiceForPayment}
            customerInvoices={customerInvoices}
            customer={activeCust}
            isOpen={isPaymentModalOpen || !!selectedInvoiceForPayment}
            onClose={() => {
              setSelectedInvoiceForPayment(null);
              setIsPaymentModalOpen(false);
            }}
            onConfirmPaymentReceipt={handleConfirmPaymentReceipt}
          />
        )}

        {activeCust && (
          <OrderBuilderModal
            isOpen={isOrderBuilderOpen}
            onClose={() => setIsOrderBuilderOpen(false)}
            customer={activeCust}
            onOrderCreated={handleOrderCreated}
          />
        )}

        <EditOrderModal
          order={editingOrder}
          isOpen={!!editingOrder}
          onClose={() => setEditingOrder(null)}
          onSaveOrder={() => setEditingOrder(null)}
        />

        <SyncDashboardModal
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
          syncState={syncState}
          onTriggerSync={syncData}
        />

        <AiAssistantModal
          isOpen={isAiAssistantOpen}
          onClose={() => setIsAiAssistantOpen(false)}
          customer={activeCust}
          invoices={customerInvoices}
          onOpenOrderBuilder={() => {
            setIsAiAssistantOpen(false);
            setIsOrderBuilderOpen(true);
          }}
        />

        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
