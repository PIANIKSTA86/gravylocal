import React, { useState } from 'react';
import { PaymentReceipt, PaymentApprovalStatus } from '../types';
import { formatCOP } from '../lib/utils';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Image as ImageIcon, 
  PenTool, 
  ShieldCheck, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft,
  X,
  ExternalLink,
  Lock,
  Filter
} from 'lucide-react';

interface TreasuryManagementViewProps {
  receipts: PaymentReceipt[];
  onApproveReceipt: (receiptId: string, notes?: string) => void;
  onRejectReceipt: (receiptId: string, notes: string) => void;
  onClose?: () => void;
  onOpenPaymentModal?: () => void;
}

export const TreasuryManagementView: React.FC<TreasuryManagementViewProps> = ({
  receipts,
  onApproveReceipt,
  onRejectReceipt,
  onClose,
  onOpenPaymentModal,
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | PaymentApprovalStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedReceiptId, setExpandedReceiptId] = useState<string | null>(receipts[0]?.id || null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [rejectingReceiptId, setRejectingReceiptId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  // Stats
  const totalPending = receipts.filter((r) => r.status === 'Pendiente Aprobación').length;
  const totalApproved = receipts.filter((r) => r.status === 'Aprobado Contabilidad').length;
  const pendingAmount = receipts
    .filter((r) => r.status === 'Pendiente Aprobación')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  const filteredReceipts = receipts.filter((r) => {
    const matchesStatus =
      filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch =
      r.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referenceNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleConfirmReject = (id: string) => {
    if (!rejectNote.trim()) return;
    onRejectReceipt(id, rejectNote);
    setRejectingReceiptId(null);
    setRejectNote('');
  };

  return (
    <div className="pb-28 pt-4 px-4 space-y-4 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onClose && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-extrabold text-[#191c1e] tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#006876]" />
              Gestión de Tesorería
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Aprobación de recaudos, evidencias y firmas en Contabilidad
            </p>
          </div>
        </div>

        {onOpenPaymentModal && (
          <button
            onClick={onOpenPaymentModal}
            className="px-3 py-2 bg-[#006876] hover:bg-[#005662] text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-all active:scale-95"
          >
            <span>+ Nuevo Recaudo</span>
          </button>
        )}
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200 rounded-2xl shadow-2xs">
          <div className="flex items-center space-x-1.5 text-amber-800 mb-1">
            <Clock className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-extrabold uppercase">Por Aprobar Tesorería</span>
          </div>
          <span className="text-xl font-black text-amber-950 block tabular-nums">
            {formatCOP(pendingAmount)}
          </span>
          <span className="text-[10px] font-bold text-amber-700 block mt-0.5">
            {totalPending} documento(s) con evidencia
          </span>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200 rounded-2xl shadow-2xs">
          <div className="flex items-center space-x-1.5 text-emerald-800 mb-1">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-extrabold uppercase">Aprobados SAP</span>
          </div>
          <span className="text-xl font-black text-emerald-950 block tabular-nums">
            {totalApproved}
          </span>
          <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">
            Contabilizados y liberados
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por N° Recibo, Cliente o Comprobante..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#006876]"
          />
        </div>

        <div className="flex space-x-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'Pendiente Aprobación', label: `Pendientes (${totalPending})` },
            { id: 'Aprobado Contabilidad', label: 'Aprobados' },
            { id: 'Rechazado', label: 'Rechazados' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs shrink-0 transition-all ${
                filterStatus === tab.id
                  ? 'bg-[#006876] text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Receipts List */}
      <div className="space-y-3">
        {filteredReceipts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-gray-200 p-6">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-extrabold text-gray-700">
              No hay recibos de recaudo en este filtro
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Los pagos registrados aparecerán aquí para revisión de evidencia y firma.
            </p>
          </div>
        ) : (
          filteredReceipts.map((r) => {
            const isExpanded = expandedReceiptId === r.id;
            const isPending = r.status === 'Pendiente Aprobación';
            const isApproved = r.status === 'Aprobado Contabilidad';
            const isRejected = r.status === 'Rechazado';

            return (
              <div
                key={r.id}
                className={`bg-white rounded-2xl border transition-all shadow-2xs overflow-hidden ${
                  isPending
                    ? 'border-amber-300 ring-2 ring-amber-200/50'
                    : isApproved
                    ? 'border-emerald-200'
                    : 'border-rose-200'
                }`}
              >
                {/* Card Header Bar */}
                <div
                  onClick={() => setExpandedReceiptId(isExpanded ? null : r.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isPending
                          ? 'bg-amber-100 text-amber-900'
                          : isApproved
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-rose-100 text-rose-900'
                      }`}
                    >
                      {r.receiptNumber.split('-')[1] || 'REC'}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-gray-900">
                          {r.receiptNumber}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                            isPending
                              ? 'bg-amber-100 text-amber-800'
                              : isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 font-bold mt-0.5">
                        {r.customerName} · {r.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex items-center space-x-3">
                    <div>
                      <span className="text-sm font-black text-[#006876] block tabular-nums">
                        {formatCOP(r.totalAmount)}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold block">
                        {r.invoicesPaid.length} factura(s)
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 bg-gray-50/70 border-t border-gray-100 space-y-4 text-xs">
                    
                    {/* Method & Ref */}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-white rounded-xl border border-gray-200">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-gray-400 block">
                          Medio de Pago
                        </span>
                        <span className="font-extrabold text-gray-800 text-xs">
                          {r.paymentMethod}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-gray-400 block">
                          N° Comprobante / Ref
                        </span>
                        <span className="font-extrabold text-[#006876] text-xs">
                          {r.referenceNo}
                        </span>
                      </div>
                    </div>

                    {/* Paid Invoices Table / List */}
                    <div>
                      <h4 className="font-extrabold text-gray-700 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-gray-500" />
                        Facturas liquidadas en este recibo:
                      </h4>
                      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                        {r.invoicesPaid.map((item) => (
                          <div
                            key={item.invoiceId}
                            className="p-2.5 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-extrabold text-gray-900 block">
                                {item.invoiceNumber}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">
                                Total factura: {formatCOP(item.totalInvoiceAmount)}
                              </span>
                            </div>
                            <span className="font-black text-emerald-700 tabular-nums">
                              Abono: {formatCOP(item.amountPaid)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Evidence & Signature Section */}
                    <div className="grid grid-cols-2 gap-3">
                      
                      {/* Evidence Photo */}
                      <div>
                        <h4 className="font-extrabold text-gray-700 uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-cyan-600" />
                          Evidencia de Pago
                        </h4>
                        {r.evidenceUrl ? (
                          <div
                            onClick={() => setPreviewImage(r.evidenceUrl!)}
                            className="relative h-28 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 cursor-pointer group shadow-2xs"
                          >
                            <img
                              src={r.evidenceUrl}
                              alt="Evidencia recaudo"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-[10px] gap-1">
                              <ExternalLink className="w-3.5 h-3.5" /> Ver Grande
                            </div>
                          </div>
                        ) : (
                          <div className="h-28 bg-gray-100 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[11px] font-medium text-center p-2">
                            Sin imagen adjunta
                          </div>
                        )}
                      </div>

                      {/* Customer Signature */}
                      <div>
                        <h4 className="font-extrabold text-gray-700 uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
                          <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                          Firma del Cliente
                        </h4>
                        {r.signatureDataUrl ? (
                          <div
                            onClick={() => setPreviewImage(r.signatureDataUrl!)}
                            className="h-28 bg-white rounded-xl border border-gray-200 p-2 flex flex-col items-center justify-center cursor-pointer group shadow-2xs relative"
                          >
                            <img
                              src={r.signatureDataUrl}
                              alt="Firma cliente"
                              className="max-h-20 max-w-full object-contain"
                            />
                            <span className="text-[9px] text-gray-400 font-bold mt-1">
                              Firma Digital Verificada
                            </span>
                          </div>
                        ) : (
                          <div className="h-28 bg-gray-100 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[11px] font-medium text-center p-2">
                            Sin firma capturada
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Treasury Approval Status / Form */}
                    {isPending ? (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                        <div className="flex items-center space-x-1.5 font-bold text-amber-900 text-xs">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Evaluación para Contabilidad:</span>
                        </div>
                        <p className="text-[11px] text-amber-800">
                          Al aprobar este recaudo, el pago se asentará formalmente en SAP S/4HANA y se liberará el cupo de crédito asignado.
                        </p>

                        {rejectingReceiptId === r.id ? (
                          <div className="pt-2 space-y-2 bg-white p-3 rounded-lg border border-rose-200">
                            <label className="font-bold text-rose-800 text-[11px] block">
                              Causa o Motivo de Rechazo:
                            </label>
                            <textarea
                              value={rejectNote}
                              onChange={(e) => setRejectNote(e.target.value)}
                              placeholder="Escriba la razón para la devolución al vendedor..."
                              className="w-full p-2 border border-rose-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-rose-500"
                              rows={2}
                            />
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setRejectingReceiptId(null)}
                                className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleConfirmReject(r.id)}
                                className="px-3 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                              >
                                Confirmar Rechazo
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => setRejectingReceiptId(r.id)}
                              className="py-2 px-3 border border-rose-300 text-rose-700 bg-white hover:bg-rose-50 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Rechazar</span>
                            </button>

                            <button
                              onClick={() => onApproveReceipt(r.id)}
                              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                              <span>Aprobar en SAP</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : isApproved ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-extrabold block">
                              Aprobado y Contabilizado en SAP
                            </span>
                            <span className="text-[10px] text-emerald-700">
                              Aprobado por {r.approvedBy || 'Tesorería Central'} · {r.approvedAt || 'Hace un momento'}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-200/80 text-emerald-900 text-[10px] font-black rounded-md">
                          SAP OK
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs space-y-1">
                        <div className="flex items-center space-x-1.5 font-bold text-rose-800">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Recaudo Rechazado por Tesorería</span>
                        </div>
                        {r.treasuryNotes && (
                          <p className="text-[11px] text-rose-700 font-medium">
                            Motivo: {r.treasuryNotes}
                          </p>
                        )}
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Image Fullscreen Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-4 max-w-lg w-full relative shadow-2xl space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="font-extrabold text-sm text-gray-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#006876]" /> Vista Previa de Evidencia / Firma
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-gray-900/5 rounded-2xl p-2 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={previewImage}
                alt="Vista Previa"
                className="max-h-[65vh] max-w-full object-contain rounded-xl"
              />
            </div>
            <button
              onClick={() => setPreviewImage(null)}
              className="w-full py-2.5 bg-gray-900 text-white font-extrabold text-xs rounded-xl"
            >
              Cerrar Vista
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
