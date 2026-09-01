import React from 'react';
import { Customer, Invoice, Order, VendorVisit, VisitStatus } from '../types';
import { formatCOP, formatCOPShort } from '../lib/utils';
import { GravyLogo } from './GravyLogo';
import { NavTab } from './BottomNav';
import { VendorRouteAgenda } from './VendorRouteAgenda';
import { 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  RefreshCw, 
  ClipboardList, 
  ChevronRight, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Bell,
  MapPin,
  Route
} from 'lucide-react';

interface DashboardViewProps {
  customers: Customer[];
  orders: Order[];
  invoices: Invoice[];
  visits: VendorVisit[];
  currentCustomer: Customer;
  onSelectCustomer: (customer: Customer) => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenOrderBuilder: () => void;
  onOpenPaymentModal: (invoice?: Invoice) => void;
  onOpenAiAssistant: () => void;
  onOpenNotifications: () => void;
  onCheckIn: (visit: VendorVisit) => Promise<void>;
  onCheckOut: (visitId: string, outcome: { status: VisitStatus; noOrderReason?: string; notes?: string }) => Promise<void>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  customers,
  orders,
  invoices,
  visits,
  currentCustomer,
  onSelectCustomer,
  onNavigateTab,
  onOpenOrderBuilder,
  onOpenPaymentModal,
  onOpenAiAssistant,
  onOpenNotifications,
  onCheckIn,
  onCheckOut,
}) => {
  // Global calculations
  const totalBalanceDue = customers.reduce((sum, c) => sum + c.balanceDue, 0);
  const totalCreditLimit = customers.reduce((sum, c) => sum + c.creditLimit, 0);
  const totalCreditUsed = customers.reduce((sum, c) => sum + c.creditUsed, 0);
  const globalUsagePercent = totalCreditLimit > 0 ? Math.round((totalCreditUsed / totalCreditLimit) * 100) : 0;

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pendiente Sincronización').length;
  const totalOrdersValue = orders.reduce((sum, o) => sum + o.total, 0);

  const overdueInvoices = invoices.filter((i) => i.status !== 'Pagada' && i.agingDays > 0);
  const overdueAmount = overdueInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

  // Highest balance customer or overdue invoice for quick payment
  const highestOverdueInvoice = overdueInvoices.sort((a, b) => b.totalAmount - a.totalAmount)[0];

  return (
    <div className="pb-28 pt-4 px-4 space-y-5 animate-in fade-in duration-300">
      
      {/* Executive Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-11 h-11 rounded-2xl bg-white border border-gray-200 p-1 flex items-center justify-center shadow-md shrink-0">
            <GravyLogo className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#191c1e] tracking-tight leading-none">
              Dashboard Vendedor
            </h1>
            <span className="text-[11px] font-bold text-[#006876] bg-cyan-50 px-2 py-0.5 rounded-full inline-block mt-1 border border-cyan-100">
              GRAVY ERP · Fuerza Comercial
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenAiAssistant}
            className="w-10 h-10 rounded-2xl bg-white text-[#5355a9] border border-gray-200 flex items-center justify-center shadow-2xs hover:bg-indigo-50 transition-all active:scale-95"
            title="Asistente IA"
          >
            <Sparkles className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenNotifications}
            className="w-10 h-10 rounded-2xl bg-white text-gray-700 border border-gray-200 flex items-center justify-center shadow-2xs hover:bg-gray-50 transition-all active:scale-95 relative"
            title="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* 🚀 SECCIÓN VITAL: AGENDA DE RUTAS Y VISITAS DEL DÍA */}
      <VendorRouteAgenda
        visits={visits}
        customers={customers}
        currentCustomer={currentCustomer}
        onSelectCustomer={onSelectCustomer}
        onCheckIn={onCheckIn}
        onCheckOut={onCheckOut}
        onOpenOrderBuilder={() => onOpenOrderBuilder()}
        onOpenPaymentModal={() => onOpenPaymentModal()}
      />

      {/* Quick Action Grid */}
      <div>
        <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2.5 px-1 flex items-center gap-1.5">
          <span>Accesos Rápidos</span>
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onOpenOrderBuilder}
            className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-all text-left flex items-center space-x-3 active:scale-98 group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#006876] flex items-center justify-center shrink-0 group-hover:bg-[#006876] group-hover:text-white transition-colors">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-extrabold text-gray-900 leading-tight">
                Emitir Pedido
              </span>
              <span className="text-[10px] text-gray-500 font-medium">
                Venta / Reserva
              </span>
            </div>
          </button>

          <button
            onClick={() => {
              if (highestOverdueInvoice) {
                onOpenPaymentModal(highestOverdueInvoice);
              } else if (invoices[0]) {
                onOpenPaymentModal(invoices[0]);
              } else {
                onOpenPaymentModal();
              }
            }}
            className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-all text-left flex items-center space-x-3 active:scale-98 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-extrabold text-gray-900 leading-tight">
                Registrar Cobro
              </span>
              <span className="text-[10px] text-gray-500 font-medium">
                Recibo de Caja
              </span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('orders')}
            className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-all text-left flex items-center space-x-3 active:scale-98 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5355a9] flex items-center justify-center shrink-0 group-hover:bg-[#5355a9] group-hover:text-white transition-colors">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-extrabold text-gray-900 leading-tight">
                Mis Pedidos
              </span>
              <span className="text-[10px] text-gray-500 font-medium">
                {orders.length} Emitidos
              </span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('sync')}
            className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-all text-left flex items-center space-x-3 active:scale-98 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-extrabold text-gray-900 leading-tight">
                Sincro Offline
              </span>
              <span className="text-[10px] text-amber-800 font-bold">
                {pendingOrdersCount} Pendientes
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Main KPI Summary Card */}
      <div className="bg-gradient-to-br from-[#191c1e] to-[#2d3135] text-white rounded-3xl p-5 shadow-xl relative overflow-hidden border border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
            Total Cartera Activa Clientes
          </span>
          <span className="bg-white/10 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md">
            {customers.length} Clientes
          </span>
        </div>

        <div className="text-2xl font-black tabular-nums tracking-tight mb-3">
          {formatCOP(totalBalanceDue)}
        </div>

        {/* Global Credit Progress Bar */}
        <div className="space-y-1.5 pt-2.5 border-t border-white/10">
          <div className="flex justify-between text-xs font-semibold text-gray-300">
            <span>Uso de Cupo de Crédito</span>
            <span className="font-extrabold text-cyan-300">{globalUsagePercent}%</span>
          </div>
          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                globalUsagePercent > 85 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(globalUsagePercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 font-medium pt-0.5">
            <span>Usado: {formatCOPShort(totalCreditUsed)}</span>
            <span>Cupo Total: {formatCOPShort(totalCreditLimit)}</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center space-x-2 text-rose-700 mb-1">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-extrabold uppercase">Cartera Vencida</span>
          </div>
          <span className="text-base font-black text-rose-900 block tabular-nums">
            {formatCOP(overdueAmount)}
          </span>
          <span className="text-[10px] font-bold text-rose-600 block mt-0.5">
            {overdueInvoices.length} facturas con mora
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center space-x-2 text-emerald-700 mb-1">
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-extrabold uppercase">Ventas / Pedidos</span>
          </div>
          <span className="text-base font-black text-emerald-900 block tabular-nums">
            {formatCOP(totalOrdersValue)}
          </span>
          <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
            {orders.length} pedidos generados
          </span>
        </div>
      </div>
    </div>
  );
};
