import React, { useState } from 'react';
import { Customer, VendorVisit, VisitStatus } from '../types';
import { formatCOP, formatCOPShort } from '../lib/utils';
import { 
  MapPin, 
  Phone, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShoppingBag, 
  DollarSign, 
  Calendar, 
  ChevronRight, 
  Sparkles,
  X,
  Check,
  RotateCcw,
  Building2,
  FileCheck
} from 'lucide-react';

interface VendorRouteAgendaProps {
  visits: VendorVisit[];
  customers: Customer[];
  currentCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
  onCheckIn: (visit: VendorVisit) => Promise<void>;
  onCheckOut: (visitId: string, outcome: { status: VisitStatus; noOrderReason?: string; notes?: string }) => Promise<void>;
  onOpenOrderBuilder: (customer: Customer) => void;
  onOpenPaymentModal: (customer: Customer) => void;
  onDateChange?: (date: string) => void;
}

const VISIT_STATUS_CONFIG: Record<VisitStatus, { label: string; badgeClass: string; borderClass: string; bgClass: string; icon: any }> = {
  PROGRAMADA: {
    label: 'Pendiente',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    borderClass: 'border-slate-200',
    bgClass: 'bg-white',
    icon: Clock,
  },
  EN_CURSO: {
    label: 'En Curso (Check-in)',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300 font-extrabold animate-pulse',
    borderClass: 'border-sky-400 ring-2 ring-sky-200',
    bgClass: 'bg-sky-50/40',
    icon: Navigation,
  },
  COMPLETADA_PEDIDO: {
    label: 'Venta Exitosa',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold',
    borderClass: 'border-emerald-200',
    bgClass: 'bg-emerald-50/30',
    icon: CheckCircle2,
  },
  COMPLETADA_RECAUDO: {
    label: 'Recaudo Exitoso',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-300 font-extrabold',
    borderClass: 'border-teal-200',
    bgClass: 'bg-teal-50/30',
    icon: DollarSign,
  },
  NO_EFECTIVA: {
    label: 'No Efectiva',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
    borderClass: 'border-amber-200',
    bgClass: 'bg-amber-50/20',
    icon: AlertTriangle,
  },
  REPROGRAMADA: {
    label: 'Reprogramada',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300 font-bold',
    borderClass: 'border-purple-200',
    bgClass: 'bg-purple-50/20',
    icon: RotateCcw,
  },
};

const NO_ORDER_REASONS = [
  { key: 'STOCK_SUFICIENTE', label: 'Cliente tiene suficiente inventario' },
  { key: 'LOCAL_CERRADO', label: 'Local / Negocio cerrado' },
  { key: 'ENCARGADO_NO_DISPONIBLE', label: 'Encargado de compras ausente' },
  { key: 'PRECIO', label: 'Objeción en precios / presupuesto' },
  { key: 'OTRO', label: 'Otro motivo / Novedad' },
];

export const VendorRouteAgenda: React.FC<VendorRouteAgendaProps> = ({
  visits,
  customers,
  currentCustomer,
  onSelectCustomer,
  onCheckIn,
  onCheckOut,
  onOpenOrderBuilder,
  onOpenPaymentModal,
  onDateChange,
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'DONE'>('ALL');
  const [activeModalVisit, setActiveModalVisit] = useState<VendorVisit | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<VisitStatus>('COMPLETADA_PEDIDO');
  const [selectedReason, setSelectedReason] = useState<string>('STOCK_SUFICIENTE');
  const [checkoutNotes, setCheckoutNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Match visits with customers data
  const enrichedVisits = visits.map((v) => {
    const cust = customers.find((c) => c.id === v.customerId || c.name.toLowerCase() === v.customerName.toLowerCase());
    return {
      ...v,
      customerObj: cust,
    };
  });

  // Calculate Progress Stats
  const totalVisits = enrichedVisits.length;
  const completedCount = enrichedVisits.filter((v) =>
    ['COMPLETADA_PEDIDO', 'COMPLETADA_RECAUDO', 'NO_EFECTIVA', 'REPROGRAMADA'].includes(v.status)
  ).length;
  const progressPercent = totalVisits > 0 ? Math.round((completedCount / totalVisits) * 100) : 0;
  const inProgressCount = enrichedVisits.filter((v) => v.status === 'EN_CURSO').length;
  const exitosasCount = enrichedVisits.filter((v) => v.status === 'COMPLETADA_PEDIDO' || v.status === 'COMPLETADA_RECAUDO').length;

  const filteredVisits = enrichedVisits.filter((v) => {
    if (filterTab === 'PENDING') return v.status === 'PROGRAMADA' || v.status === 'EN_CURSO';
    if (filterTab === 'DONE') return ['COMPLETADA_PEDIDO', 'COMPLETADA_RECAUDO', 'NO_EFECTIVA', 'REPROGRAMADA'].includes(v.status);
    return true;
  });

  const handleOpenNavigation = (address?: string, city?: string) => {
    const query = encodeURIComponent(`${address || ''} ${city || ''}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleStartCheckIn = async (visit: VendorVisit, custObj?: Customer) => {
    if (custObj) {
      onSelectCustomer(custObj);
    }
    await onCheckIn(visit);
  };

  const handleConfirmCheckOut = async () => {
    if (!activeModalVisit) return;
    setIsSubmitting(true);
    try {
      await onCheckOut(activeModalVisit.id, {
        status: checkoutStatus,
        noOrderReason: checkoutStatus === 'NO_EFECTIVA' ? selectedReason : undefined,
        notes: checkoutNotes,
      });
      setActiveModalVisit(null);
      setCheckoutNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Route Header Card */}
      <div className="bg-gradient-to-br from-[#006876] to-[#00424b] text-white p-4.5 rounded-3xl shadow-lg border border-cyan-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-black uppercase tracking-widest text-cyan-200">
              Ruta del Día · Vendedor
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs font-bold bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-md">
            <Calendar className="w-3.5 h-3.5 text-cyan-300" />
            <span>{new Date().toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-black tracking-tight text-white">
              Agenda de Visitas
            </h2>
            <span className="text-sm font-extrabold text-cyan-200">
              {completedCount} de {totalVisits} ({progressPercent}%)
            </span>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="w-full bg-black/25 h-2.5 rounded-full mt-2 overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-cyan-300 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 text-center pt-2 border-t border-white/10">
            <div>
              <span className="text-[10px] text-cyan-200 block font-semibold uppercase">Exitosas</span>
              <span className="text-sm font-black text-white">{exitosasCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-cyan-200 block font-semibold uppercase">En Curso</span>
              <span className="text-sm font-black text-white">{inProgressCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-cyan-200 block font-semibold uppercase">Pendientes</span>
              <span className="text-sm font-black text-white">{totalVisits - completedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 px-1">
        <button
          onClick={() => setFilterTab('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
            filterTab === 'ALL'
              ? 'bg-[#191c1e] text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Todas ({totalVisits})
        </button>
        <button
          onClick={() => setFilterTab('PENDING')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
            filterTab === 'PENDING'
              ? 'bg-[#191c1e] text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Pendientes ({totalVisits - completedCount})
        </button>
        <button
          onClick={() => setFilterTab('DONE')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
            filterTab === 'DONE'
              ? 'bg-[#191c1e] text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Gestionadas ({completedCount})
        </button>
      </div>

      {/* Visits List Timeline */}
      <div className="space-y-3">
        {filteredVisits.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 shadow-2xs space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto text-xl font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-gray-900">¡Al día con las visitas!</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              No tienes visitas pendientes en esta sección. Puedes programar una nueva ruta desde el ERP o atender clientes libres.
            </p>
          </div>
        ) : (
          filteredVisits.map((visit, index) => {
            const cfg = VISIT_STATUS_CONFIG[visit.status] || VISIT_STATUS_CONFIG.PROGRAMADA;
            const StatusIcon = cfg.icon;
            const cust = visit.customerObj;
            const isSelected = currentCustomer?.id === cust?.id;
            const isEnCurso = visit.status === 'EN_CURSO';

            return (
              <div
                key={visit.id}
                className={`rounded-3xl p-4 transition-all duration-200 border shadow-2xs ${cfg.borderClass} ${cfg.bgClass} ${
                  isSelected ? 'ring-2 ring-[#006876]' : ''
                }`}
              >
                {/* Top Row: Seq + Status Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-7 h-7 rounded-xl bg-gray-900 text-white text-xs font-black flex items-center justify-center shrink-0">
                      #{visit.orderSeq || index + 1}
                    </span>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                      {visit.objective || 'Venta'}
                    </span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border flex items-center space-x-1 ${cfg.badgeClass}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span>{cfg.label}</span>
                  </span>
                </div>

                {/* Customer Details */}
                <div className="mt-2.5">
                  <h3 className="font-extrabold text-base text-gray-900 leading-tight">
                    {visit.customerName}
                  </h3>
                  
                  <div className="flex items-start space-x-1.5 text-xs text-gray-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{visit.customerAddress} {visit.customerCity ? `· ${visit.customerCity}` : ''}</span>
                  </div>

                  {/* Customer Financial Pill if available */}
                  {cust && (
                    <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-100 text-[11px]">
                      <span className="font-bold text-gray-500">Saldo Cartera:</span>
                      <span className={`font-extrabold ${cust.balanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {formatCOPShort(cust.balanceDue)}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="font-bold text-gray-500">Cupo Disp:</span>
                      <span className="font-extrabold text-[#006876]">
                        {formatCOPShort(Math.max(0, cust.creditLimit - cust.creditUsed))}
                      </span>
                    </div>
                  )}

                  {/* Notes / Reason Badge if already done */}
                  {visit.notes && (
                    <p className="text-xs italic text-gray-500 bg-white/60 p-2 rounded-xl mt-2 border border-gray-100">
                      "{visit.notes}"
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-3 pt-2.5 border-t border-gray-200/70 flex flex-wrap items-center justify-between gap-2">
                  {/* Left: Map & Phone buttons */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleOpenNavigation(visit.customerAddress, visit.customerCity)}
                      className="p-2 bg-white text-gray-700 hover:text-sky-600 rounded-xl border border-gray-200 shadow-2xs flex items-center space-x-1 text-xs font-bold active:scale-95 transition-all"
                      title="Navegar en Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5 text-sky-600" />
                      <span className="hidden sm:inline">Mapa</span>
                    </button>

                    {visit.customerPhone && (
                      <a
                        href={`tel:${visit.customerPhone}`}
                        className="p-2 bg-white text-gray-700 hover:text-emerald-600 rounded-xl border border-gray-200 shadow-2xs flex items-center space-x-1 text-xs font-bold active:scale-95 transition-all"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Llamar</span>
                      </a>
                    )}
                  </div>

                  {/* Right: Operational Actions based on status */}
                  <div className="flex items-center space-x-1.5">
                    {visit.status === 'PROGRAMADA' && (
                      <button
                        onClick={() => handleStartCheckIn(visit, cust)}
                        className="px-3.5 py-2 bg-[#006876] text-white text-xs font-black rounded-xl shadow-xs flex items-center space-x-1.5 hover:bg-[#004f5a] active:scale-95 transition-all"
                      >
                        <Clock className="w-3.5 h-3.5 text-cyan-200" />
                        <span>Check-In</span>
                      </button>
                    )}

                    {isEnCurso && (
                      <>
                        <button
                          onClick={() => {
                            if (cust) onSelectCustomer(cust);
                            if (cust) onOpenOrderBuilder(cust);
                          }}
                          className="px-3 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl shadow-xs flex items-center space-x-1 hover:bg-emerald-700 active:scale-95 transition-all"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Pedido</span>
                        </button>

                        <button
                          onClick={() => {
                            if (cust) onSelectCustomer(cust);
                            if (cust) onOpenPaymentModal(cust);
                          }}
                          className="px-3 py-2 bg-teal-600 text-white text-xs font-black rounded-xl shadow-xs flex items-center space-x-1 hover:bg-teal-700 active:scale-95 transition-all"
                        >
                          <DollarSign className="w-3.5 h-3.5 text-teal-200" />
                          <span>Cobrar</span>
                        </button>

                        <button
                          onClick={() => setActiveModalVisit(visit)}
                          className="px-3 py-2 bg-gray-900 text-white text-xs font-black rounded-xl shadow-xs flex items-center space-x-1 hover:bg-black active:scale-95 transition-all"
                        >
                          <Check className="w-3.5 h-3.5 text-gray-200" />
                          <span>Finalizar</span>
                        </button>
                      </>
                    )}

                    {['COMPLETADA_PEDIDO', 'COMPLETADA_RECAUDO', 'NO_EFECTIVA'].includes(visit.status) && (
                      <button
                        onClick={() => setActiveModalVisit(visit)}
                        className="px-2.5 py-1.5 bg-white text-gray-600 hover:text-gray-900 text-[11px] font-bold rounded-xl border border-gray-200 shadow-2xs"
                      >
                        Editar Cierre
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Check-Out / Finalizar Visita Modal Bottom Sheet */}
      {activeModalVisit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#006876] tracking-wider">
                  Cierre de Visita en Terreno
                </span>
                <h3 className="font-extrabold text-base text-gray-900">
                  {activeModalVisit.customerName}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalVisit(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1.5">
                  Resultado de la Visita
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStatus('COMPLETADA_PEDIDO')}
                    className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                      checkoutStatus === 'COMPLETADA_PEDIDO'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200'
                        : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
                    <span>Venta / Pedido</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutStatus('COMPLETADA_RECAUDO')}
                    className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                      checkoutStatus === 'COMPLETADA_RECAUDO'
                        ? 'bg-teal-50 border-teal-500 text-teal-900 ring-2 ring-teal-200'
                        : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    <DollarSign className="w-4 h-4 text-teal-600 mb-1" />
                    <span>Recaudo Cartera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutStatus('NO_EFECTIVA')}
                    className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                      checkoutStatus === 'NO_EFECTIVA'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-200'
                        : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 mb-1" />
                    <span>No Efectiva (Sin Venta)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutStatus('REPROGRAMADA')}
                    className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                      checkoutStatus === 'REPROGRAMADA'
                        ? 'bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-200'
                        : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4 text-purple-600 mb-1" />
                    <span>Reprogramar</span>
                  </button>
                </div>
              </div>

              {checkoutStatus === 'NO_EFECTIVA' && (
                <div className="animate-in fade-in">
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">
                    Motivo de No Compra
                  </label>
                  <select
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#006876]"
                  >
                    {NO_ORDER_REASONS.map((r) => (
                      <option key={r.key} value={r.key}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">
                  Notas de Cierre / Novedades
                </label>
                <textarea
                  rows={2}
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  placeholder="Ej: Cliente pide visitarlo de nuevo el jueves para confirmar pedido..."
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#006876]"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModalVisit(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-extrabold text-xs rounded-2xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmCheckOut}
                className="flex-1 py-3 bg-[#006876] text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center space-x-1.5"
              >
                {isSubmitting ? <span>Guardando...</span> : <span>Confirmar Cierre</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
