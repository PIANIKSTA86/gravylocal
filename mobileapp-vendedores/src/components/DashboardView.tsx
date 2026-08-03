import React from 'react';
import { Customer, Invoice, Order } from '../types';
import { formatCOP, formatCOPShort } from '../lib/utils';
import { GravyLogo } from './GravyLogo';
import { NavTab } from './BottomNav';
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
  Bell
} from 'lucide-react';

interface DashboardViewProps {
  customers: Customer[];
  orders: Order[];
  invoices: Invoice[];
  currentCustomer: Customer;
  onSelectCustomer: (customer: Customer) => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenOrderBuilder: () => void;
  onOpenPaymentModal: (invoice: Invoice) => void;
  onOpenAiAssistant: () => void;
  onOpenNotifications: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  customers,
  orders,
  invoices,
  currentCustomer,
  onSelectCustomer,
  onNavigateTab,
  onOpenOrderBuilder,
  onOpenPaymentModal,
  onOpenAiAssistant,
  onOpenNotifications,
}) => {
  // Global calculations
  const totalBalanceDue = customers.reduce((sum, c) => sum + c.balanceDue, 0);
  const totalCreditLimit = customers.reduce((sum, c) => sum + c.creditLimit, 0);
  const totalCreditUsed = customers.reduce((sum, c) => sum + c.creditUsed, 0);
  const globalUsagePercent = Math.round((totalCreditUsed / totalCreditLimit) * 100);

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
              Dashboard Principal
            </h1>
            <span className="text-[11px] font-bold text-[#006876] bg-cyan-50 px-2 py-0.5 rounded-full inline-block mt-1 border border-cyan-100">
              GRAVY · SAP S/4HANA Conectado
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

      {/* Main KPI Summary Card */}
      <div className="bg-gradient-to-br from-[#006876] to-[#004f5a] text-white rounded-3xl p-5 shadow-xl relative overflow-hidden border border-cyan-700">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-cyan-200 tracking-wider uppercase">
            Total Cartera Activa Global
          </span>
          <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md">
            {customers.length} Clientes
          </span>
        </div>

        <div className="text-3xl font-black tabular-nums tracking-tight mb-4">
          {formatCOP(totalBalanceDue)}
        </div>

        {/* Global Credit Progress Bar */}
        <div className="space-y-1.5 pt-3 border-t border-white/15">
          <div className="flex justify-between text-xs font-semibold text-cyan-100">
            <span>Uso de Cupo Global</span>
            <span className="font-extrabold text-white">{globalUsagePercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                globalUsagePercent > 85 ? 'bg-amber-300' : 'bg-cyan-300'
              }`}
              style={{ width: `${Math.min(globalUsagePercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-cyan-200/90 font-medium pt-0.5">
            <span>Usado: {formatCOPShort(totalCreditUsed)}</span>
            <span>Cupo: {formatCOPShort(totalCreditLimit)}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div>
        <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2.5 px-1">
          Acciones Rápidas
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
                Gestionar Pedidos
              </span>
              <span className="text-[10px] text-gray-500 font-medium">
                {orders.length} Emitidos
              </span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('treasury')}
            className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-all text-left flex items-center space-x-3 active:scale-98 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-extrabold text-gray-900 leading-tight">
                Gestión Tesorería
              </span>
              <span className="text-[10px] text-purple-800 font-bold">
                Aprobación & Firma
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
                Sincro ERP
              </span>
              <span className="text-[10px] text-amber-800 font-bold">
                {pendingOrdersCount} Pendientes
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center space-x-2 text-rose-700 mb-1">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-extrabold uppercase">Facturas Vencidas</span>
          </div>
          <span className="text-lg font-black text-rose-900 block tabular-nums">
            {formatCOP(overdueAmount)}
          </span>
          <span className="text-[10px] font-bold text-rose-600 block mt-0.5">
            {overdueInvoices.length} facturas con mora
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center space-x-2 text-[#006876] mb-1">
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-extrabold uppercase">Ventas emitidas</span>
          </div>
          <span className="text-lg font-black text-gray-900 block tabular-nums">
            {formatCOP(totalOrdersValue)}
          </span>
          <span className="text-[10px] font-bold text-gray-500 block mt-0.5">
            {orders.length} pedidos y reservas
          </span>
        </div>
      </div>

      {/* Active Clients Portfolio Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-base font-extrabold text-[#191c1e] tracking-tight">
            Clientes Activos
          </h3>
          <button
            onClick={() => onNavigateTab('customers')}
            className="text-xs font-bold text-[#006876] hover:underline flex items-center"
          >
            Ver Detalle Individual <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {customers.map((c) => {
            const usage = Math.round((c.creditUsed / c.creditLimit) * 100);
            const isCurrent = c.id === currentCustomer.id;

            return (
              <div
                key={c.id}
                onClick={() => {
                  onSelectCustomer(c);
                  onNavigateTab('customers');
                }}
                className={`p-3.5 bg-white rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-md flex items-center justify-between ${
                  isCurrent ? 'border-[#006876] ring-2 ring-[#006876]/20' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5355a9] flex items-center justify-center font-bold shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 leading-tight">
                      {c.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                      NIT: {c.nit} · Cupo {usage}% usado
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-[#006876] block tabular-nums">
                    {formatCOP(c.balanceDue)}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold block">
                    Saldo
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-gray-900">
            Últimos Pedidos / Reservas Emitidos
          </h3>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-[#006876] hover:underline"
          >
            Ver Todos
          </button>
        </div>

        <div className="space-y-2">
          {orders.slice(0, 3).map((ord) => (
            <div
              key={ord.id}
              className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-gray-900">
                    {ord.orderNumber}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                      ord.documentType === 'Reserva'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-cyan-100 text-cyan-900'
                    }`}
                  >
                    {ord.documentType}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                  {ord.customerName} · {ord.items.length} ítems
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-[#006876] block tabular-nums">
                  {formatCOP(ord.total)}
                </span>
                <span
                  className={`text-[9px] font-bold ${
                    ord.status === 'Sincronizado ERP'
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  {ord.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
