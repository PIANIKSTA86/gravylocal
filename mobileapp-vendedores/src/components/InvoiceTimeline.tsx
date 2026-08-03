import React from 'react';
import { Invoice } from '../types';
import { formatCOP } from '../lib/utils';
import { ChevronRight, FileText } from 'lucide-react';

interface InvoiceTimelineProps {
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
  onViewAll?: () => void;
}

export const InvoiceTimeline: React.FC<InvoiceTimelineProps> = ({
  invoices,
  onSelectInvoice,
  onViewAll,
}) => {
  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'Pagada':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#dcfce7] text-[#15803d]">
            Pagada
          </span>
        );
      case 'Pendiente Tesorería':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold border border-[#fde047] bg-[#fefce8] text-[#363789]">
            Pendiente Tesorería
          </span>
        );
      case 'Vencida':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#fee2e2] text-[#991b1b]">
            Vencida
          </span>
        );
      case 'En Proceso':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#e0f2fe] text-[#0369a1]">
            En Proceso
          </span>
        );
    }
  };

  const getDotColor = (status: Invoice['status']) => {
    switch (status) {
      case 'Pagada':
        return 'bg-emerald-500';
      case 'Pendiente Tesorería':
        return 'bg-amber-400';
      case 'Vencida':
        return 'bg-rose-500';
      default:
        return 'bg-cyan-500';
    }
  };

  return (
    <div className="bg-white mt-6 rounded-t-[2.2rem] pt-3 pb-24 px-5 sheet-shadow min-h-[380px]">
      {/* Top Handle Bar */}
      <div className="w-10 h-1 bg-[#d8dadc] rounded-full mx-auto my-2" />

      {/* Header */}
      <div className="flex items-center justify-between mt-2 mb-5">
        <h3 className="text-xl font-extrabold text-[#191c1e] tracking-tight">
          Historial de Facturas
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-[#006876] hover:text-[#005662] hover:underline"
        >
          Ver Todas
        </button>
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 space-y-4">
        {/* Timeline Vertical Line */}
        <div className="absolute left-[7px] top-3 bottom-5 w-[2px] bg-[#e0e3e5]" />

        {invoices.map((inv) => {
          const isOverdue = inv.status === 'Vencida';
          return (
            <div key={inv.id} className="relative group">
              {/* Timeline Status Dot */}
              <div
                className={`absolute -left-[23px] top-4 w-3.5 h-3.5 rounded-full ${getDotColor(
                  inv.status
                )} border-2 border-white shadow-sm z-10`}
              />

              {/* Invoice Card */}
              <div
                onClick={() => onSelectInvoice(inv)}
                className="bg-[#f7f9fb] hover:bg-[#eceef0] transition-all rounded-2xl p-4 border border-[#e2e8f0] cursor-pointer shadow-sm active:scale-[0.99]"
              >
                {/* Top Row: Invoice Number, Date, Status */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-base font-extrabold text-[#191c1e] tracking-tight">
                      {inv.invoiceNumber}
                    </h4>
                    <p className="text-xs text-[#6d797c] font-medium">
                      {inv.date}
                    </p>
                  </div>
                  <div>{getStatusBadge(inv.status)}</div>
                </div>

                {/* Bottom Row: Description, Amount */}
                <div className="flex items-center justify-between pt-2 border-t border-[#e6e8ea]">
                  <span className="text-xs font-semibold text-[#3d494b] truncate max-w-[160px]">
                    {inv.description}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span
                      className={`text-sm font-black tabular-nums ${
                        isOverdue ? 'text-[#ba1a1a]' : 'text-[#191c1e]'
                      }`}
                    >
                      {formatCOP(inv.totalAmount)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#6d797c]" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

