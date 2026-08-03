import React from 'react';
import { Invoice, Customer } from '../types';
import { formatCOP } from '../lib/utils';
import { X, DollarSign, CheckCircle2, AlertTriangle, Download } from 'lucide-react';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  customer: Customer;
  onClose: () => void;
  onOpenPaymentModal: (invoice: Invoice) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  customer,
  onClose,
  onOpenPaymentModal,
}) => {
  if (!invoice) return null;

  const isOverdue = invoice.status === 'Vencida';
  const isPaid = invoice.status === 'Pagada';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-extrabold text-[#191c1e]">
                {invoice.invoiceNumber}
              </h3>
              {invoice.status === 'Pagada' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Pagada
                </span>
              )}
              {invoice.status === 'Pendiente Tesorería' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                  Pendiente
                </span>
              )}
              {invoice.status === 'Vencida' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                  Vencida
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Cliente: {customer.name} · NIT: {customer.nit}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-200/60 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          
          {/* Main Status & Amount Banner */}
          <div className={`p-4 rounded-2xl border ${
            isPaid
              ? 'bg-emerald-50 border-emerald-200'
              : isOverdue
              ? 'bg-rose-50 border-rose-200'
              : 'bg-indigo-50/60 border-indigo-100'
          }`}>
            <span className="text-xs uppercase font-bold text-gray-500 block">
              Monto de la Factura
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className={`text-2xl font-black tabular-nums ${
                isOverdue ? 'text-rose-700' : 'text-[#191c1e]'
              }`}>
                {formatCOP(invoice.totalAmount)}
              </span>
              <span className="text-xs font-bold text-gray-600">
                Vence: {invoice.dueDate}
              </span>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-200/60">
              <span className="text-gray-500 font-medium">Fecha Emisión</span>
              <span className="font-bold text-gray-800">{invoice.date}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200/60">
              <span className="text-gray-500 font-medium">Categoría</span>
              <span className="font-bold text-gray-800">{invoice.category}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200/60">
              <span className="text-gray-500 font-medium">Descripción</span>
              <span className="font-bold text-gray-800">{invoice.description}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500 font-medium">Estado de Pago</span>
              <span className="font-bold text-gray-800">
                {invoice.status === 'Pagada' ? 'Pagado Total' : `Saldo Pendiente: ${formatCOP(invoice.totalAmount)}`}
              </span>
            </div>
          </div>

          {/* Overdue Alert Notice if Vencida */}
          {isOverdue && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-xs text-rose-800 font-semibold">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-900">Aviso de Factura Vencida</p>
                <p className="mt-0.5 text-rose-700 font-normal">
                  Esta factura está vencida por {invoice.agingDays} días. Registrar el cobro liberará automáticamente el cupo de crédito del cliente.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center space-x-3">
          <button
            onClick={() => {
              alert(`Descargando PDF simulado para ${invoice.invoiceNumber}`);
            }}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-xl flex items-center justify-center space-x-2 transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>

          {!isPaid ? (
            <button
              onClick={() => {
                onClose();
                onOpenPaymentModal(invoice);
              }}
              className="flex-1 py-3 bg-[#006876] hover:bg-[#005662] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-98"
            >
              <DollarSign className="w-4 h-4" />
              <span>Registrar Cobro</span>
            </button>
          ) : (
            <div className="flex-1 py-3 bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-xl flex items-center justify-center space-x-1.5 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pago Completado</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

