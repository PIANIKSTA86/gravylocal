import React, { useState } from 'react';
import { Order, OrderType, OrderStatus } from '../types';
import { formatCOP } from '../lib/utils';
import {
  ShoppingBag,
  Clock,
  Search,
  Filter,
  Edit3,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  User,
  ArrowRightLeft,
  ChevronRight,
  PackageCheck,
  Building2,
  Trash2,
  Copy,
} from 'lucide-react';

interface OrdersManagementViewProps {
  orders: Order[];
  onOpenOrderBuilder: () => void;
  onEditOrder: (order: Order) => void;
  onSyncOrder: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onConvertType: (orderId: string) => void;
}

export const OrdersManagementView: React.FC<OrdersManagementViewProps> = ({
  orders,
  onOpenOrderBuilder,
  onEditOrder,
  onSyncOrder,
  onDeleteOrder,
  onConvertType,
}) => {
  const [activeTypeTab, setActiveTypeTab] = useState<'Todos' | OrderType>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter calculations
  const filteredOrders = orders.filter((ord) => {
    const matchesType = activeTypeTab === 'Todos' || ord.documentType === activeTypeTab;
    const matchesStatus = selectedStatus === 'Todos' || ord.status === selectedStatus;
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ord.customerNit && ord.customerNit.includes(searchTerm)) ||
      ord.items.some((i) => i.product.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesType && matchesStatus && matchesSearch;
  });

  // KPI Calculations
  const totalPedidosAmount = orders
    .filter((o) => o.documentType === 'Pedido' && o.status !== 'Cancelado')
    .reduce((sum, o) => sum + o.total, 0);

  const totalReservasAmount = orders
    .filter((o) => o.documentType === 'Reserva' && o.status !== 'Cancelado')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingSyncCount = orders.filter((o) => o.status === 'Pendiente Sincronización').length;

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'Pendiente Sincronización':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Sincronizado ERP':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'Aprobado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Borrador':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'Modificado':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Cancelado':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="flex-1 pb-24 bg-[#f7f9fb] min-h-screen">
      
      {/* Curved Curved Top Header */}
      <div className="bg-[#5355a9] text-white pt-6 pb-8 px-5 rounded-b-[2rem] shadow-md relative">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-cyan-300 bg-white/10 px-2.5 py-0.5 rounded-full">
              Panel del Vendedor
            </span>
            <h2 className="text-xl font-extrabold tracking-tight mt-1">
              Pedidos y Reservas
            </h2>
            <p className="text-xs text-indigo-100">
              Gestión directa de documentos emitidos
            </p>
          </div>

          <button
            onClick={onOpenOrderBuilder}
            className="px-3.5 py-2.5 bg-cyan-300 hover:bg-cyan-200 text-[#005662] font-black text-xs rounded-2xl shadow-lg flex items-center space-x-1.5 active:scale-95 transition-transform shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Emitir Nuevo</span>
          </button>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10">
            <p className="text-[10px] text-indigo-200 font-bold uppercase">Pedidos</p>
            <p className="text-xs font-black text-white mt-0.5 tabular-nums">
              {formatCOP(totalPedidosAmount)}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10">
            <p className="text-[10px] text-indigo-200 font-bold uppercase">Reservas</p>
            <p className="text-xs font-black text-cyan-200 mt-0.5 tabular-nums">
              {formatCOP(totalReservasAmount)}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10">
            <p className="text-[10px] text-indigo-200 font-bold uppercase">Pend. Sincro</p>
            <p className="text-xs font-black text-amber-300 mt-0.5">
              {pendingSyncCount} Docus
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3 relative z-10 space-y-3">
        
        {/* Document Type Filter Tabs */}
        <div className="bg-white rounded-2xl p-1 shadow-md border border-gray-100 flex items-center justify-between">
          {(['Todos', 'Pedido', 'Reserva'] as const).map((tab) => {
            const count =
              tab === 'Todos'
                ? orders.length
                : orders.filter((o) => o.documentType === tab).length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTypeTab(tab)}
                className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-1 ${
                  activeTypeTab === tab
                    ? 'bg-[#006876] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>
                  {tab === 'Todos'
                    ? 'Todos'
                    : tab === 'Pedido'
                    ? 'Pedidos'
                    : 'Reservas'}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTypeTab === tab
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Status Filters */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por # pedido, cliente, NIT o producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl text-xs font-semibold text-gray-800 border border-gray-200 shadow-2xs focus:ring-2 focus:ring-[#006876] outline-none"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['Todos', 'Pendiente Sincronización', 'Sincronizado ERP', 'Aprobado', 'Borrador', 'Modificado'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-all border ${
                  selectedStatus === st
                    ? 'bg-[#5355a9] text-white border-[#5355a9] shadow-2xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Order Cards List */}
        <div className="space-y-3 pt-1">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 shadow-2xs">
              <PackageCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-extrabold text-gray-800">
                No se encontraron documentos
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                No hay pedidos o reservas registrados con los filtros seleccionados.
              </p>
              <button
                onClick={onOpenOrderBuilder}
                className="mt-4 px-4 py-2 bg-[#006876] text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Emitir Nuevo Pedido / Reserva
              </button>
            </div>
          ) : (
            filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-3xl p-4 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Left Colored Accent Stripe */}
                <div
                  className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                    ord.documentType === 'Pedido' ? 'bg-[#006876]' : 'bg-[#5355a9]'
                  }`}
                />

                <div className="pl-2 space-y-3">
                  
                  {/* Top Line: Doc Number, Type Tag & Status */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-sm text-gray-900 tracking-tight">
                          {ord.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            ord.documentType === 'Pedido'
                              ? 'bg-cyan-100 text-[#005662]'
                              : 'bg-indigo-100 text-[#5355a9]'
                          }`}
                        >
                          {ord.documentType}
                        </span>
                      </div>
                      <p className="text-xs font-extrabold text-gray-800 mt-1 flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{ord.customerName}</span>
                      </p>
                      {ord.customerNit && (
                        <p className="text-[11px] font-medium text-gray-500">
                          NIT: {ord.customerNit}
                        </p>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(
                        ord.status
                      )}`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  {/* Dates & Payment terms */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50/80 rounded-2xl p-2.5 border border-gray-100">
                    <div>
                      <span className="text-gray-400 font-medium block">Fecha Emisión:</span>
                      <span className="font-bold text-gray-800">{ord.date}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Fecha Entrega:</span>
                      <span className="font-bold text-gray-800">
                        {ord.deliveryDate || 'Por definir'}
                      </span>
                    </div>
                  </div>

                  {/* Item Breakdown Preview */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-extrabold uppercase text-gray-400 tracking-wider">
                      Resumen de Productos ({ord.items.length})
                    </p>
                    <div className="space-y-1">
                      {ord.items.slice(0, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-xs font-medium text-gray-700"
                        >
                          <span className="truncate max-w-[200px]">
                            • {item.quantity}x {item.product.name}
                          </span>
                          <span className="font-bold tabular-nums text-gray-900">
                            {formatCOP(item.product.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                      {ord.items.length > 3 && (
                        <p className="text-[10px] text-indigo-600 font-bold italic">
                          + {ord.items.length - 3} producto(s) más...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Notes if exists */}
                  {ord.notes && (
                    <div className="text-[11px] bg-amber-50/70 border border-amber-200/60 rounded-xl p-2 text-amber-900 font-medium">
                      <strong className="font-extrabold">Nota:</strong> {ord.notes}
                    </div>
                  )}

                  {/* Total & Action Buttons */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">
                        Valor Total COP
                      </span>
                      <span className="text-base font-black text-[#006876] tabular-nums">
                        {formatCOP(ord.total)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      
                      {/* Convert Pedido <-> Reserva button */}
                      <button
                        onClick={() => onConvertType(ord.id)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#5355a9] rounded-xl text-xs font-extrabold transition-colors flex items-center space-x-1"
                        title={ord.documentType === 'Reserva' ? 'Convertir a Pedido' : 'Convertir a Reserva'}
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {ord.documentType === 'Reserva' ? 'A Pedido' : 'A Reserva'}
                        </span>
                      </button>

                      {/* Modify / Edit Button */}
                      <button
                        onClick={() => onEditOrder(ord)}
                        className="px-3 py-1.5 bg-[#006876] hover:bg-[#005662] text-white rounded-xl text-xs font-extrabold shadow-xs transition-all active:scale-95 flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Modificar</span>
                      </button>

                      {/* ERP Sync button if pending */}
                      {ord.status === 'Pendiente Sincronización' && (
                        <button
                          onClick={() => onSyncOrder(ord.id)}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl border border-amber-200"
                          title="Sincronizar a ERP"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}

                    </div>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
