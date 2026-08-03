import React, { useState, useRef, useEffect } from 'react';
import { Invoice, Customer, PaymentReceipt, PaymentReceiptInvoiceItem } from '../types';
import { formatCOP } from '../lib/utils';
import { 
  X, 
  CheckCircle2, 
  DollarSign, 
  CreditCard, 
  Banknote, 
  ShieldCheck, 
  Upload, 
  Camera, 
  PenTool, 
  RotateCcw, 
  Check, 
  FileCheck, 
  Layers,
  Sparkles
} from 'lucide-react';

interface PaymentModalProps {
  invoice?: Invoice | null;
  customerInvoices?: Invoice[];
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPaymentReceipt: (receipt: PaymentReceipt) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  invoice,
  customerInvoices = [],
  customer,
  isOpen,
  onClose,
  onConfirmPaymentReceipt,
}) => {
  // Combine all open invoices for customer
  const availableInvoices = customerInvoices.length > 0 
    ? customerInvoices.filter((inv) => inv.customerId === customer.id && inv.status !== 'Pagada')
    : invoice && invoice.status !== 'Pagada' ? [invoice] : [];

  // Selected invoices state: map invoice.id -> amount to pay
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>(() => {
    if (invoice && invoice.status !== 'Pagada') return [invoice.id];
    return availableInvoices.slice(0, 2).map((inv) => inv.id);
  });

  const [paymentAmounts, setPaymentAmounts] = useState<{ [id: string]: number }>(() => {
    const initialAmounts: { [id: string]: number } = {};
    availableInvoices.forEach((inv) => {
      initialAmounts[inv.id] = inv.totalAmount - inv.paidAmount;
    });
    return initialAmounts;
  });

  const [paymentMethod, setPaymentMethod] = useState<'Transferencia' | 'Efectivo' | 'Cheque' | 'Datafono POS'>('Transferencia');
  const [referenceNo, setReferenceNo] = useState<string>(`REC-${Math.floor(100000 + Math.random() * 900000)}`);
  
  // Evidence attachment
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Canvas Signature state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync selection if prop invoice changes
  useEffect(() => {
    if (invoice && invoice.status !== 'Pagada') {
      setSelectedInvoiceIds([invoice.id]);
    }
  }, [invoice]);

  if (!isOpen) return null;

  // Toggle invoice selection
  const handleToggleInvoice = (invId: string) => {
    if (selectedInvoiceIds.includes(invId)) {
      if (selectedInvoiceIds.length === 1) return; // Keep at least one selected
      setSelectedInvoiceIds((prev) => prev.filter((id) => id !== invId));
    } else {
      setSelectedInvoiceIds((prev) => [...prev, invId]);
    }
  };

  // Select all or clear
  const handleSelectAll = () => {
    setSelectedInvoiceIds(availableInvoices.map((i) => i.id));
  };

  // Compute total payment collection amount
  const totalCollectionAmount = selectedInvoiceIds.reduce(
    (sum, id) => sum + (paymentAmounts[id] || 0),
    0
  );

  // Handle File upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidenceUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulate Camera Photo voucher
  const handleSimulateCameraPhoto = () => {
    const mockVouchers = [
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1556742049-0a674640c662?auto=format&fit=crop&w=600&q=80'
    ];
    const randomVoucher = mockVouchers[Math.floor(Math.random() * mockVouchers.length)];
    setEvidenceUrl(randomVoucher);
  };

  // Canvas Signature Mouse / Touch handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#005662';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Auto-generate realistic signature
  const handleAutoSign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = '#005662';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    // Draw wave pattern signature
    ctx.moveTo(30, 40);
    ctx.bezierCurveTo(70, 10, 90, 70, 130, 30);
    ctx.bezierCurveTo(150, 10, 170, 50, 220, 35);
    ctx.stroke();

    // Underline
    ctx.beginPath();
    ctx.moveTo(40, 55);
    ctx.lineTo(210, 52);
    ctx.stroke();

    setHasSignature(true);
  };

  // Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInvoiceIds.length === 0 || totalCollectionAmount <= 0) return;

    setIsSubmitting(true);

    // Get signature data URL if drawn
    let signatureDataUrl: string | undefined = undefined;
    if (hasSignature && canvasRef.current) {
      signatureDataUrl = canvasRef.current.toDataURL('image/png');
    }

    const invoicesPaidItems: PaymentReceiptInvoiceItem[] = selectedInvoiceIds.map((id) => {
      const inv = availableInvoices.find((i) => i.id === id);
      return {
        invoiceId: id,
        invoiceNumber: inv ? inv.invoiceNumber : id,
        amountPaid: paymentAmounts[id] || 0,
        totalInvoiceAmount: inv ? inv.totalAmount : paymentAmounts[id] || 0,
      };
    });

    const newReceipt: PaymentReceipt = {
      id: `rec-${Date.now()}`,
      receiptNumber: referenceNo,
      customerId: customer.id,
      customerName: customer.name,
      date: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
      paymentMethod,
      referenceNo,
      invoicesPaid: invoicesPaidItems,
      totalAmount: totalCollectionAmount,
      evidenceUrl: evidenceUrl || undefined,
      signatureDataUrl,
      status: 'Pendiente Aprobación',
      treasuryNotes: 'Recaudo generado por Vendedor de Campo. Pendiente validación de evidencia en Tesorería.',
    };

    setTimeout(() => {
      onConfirmPaymentReceipt(newReceipt);
      setIsSubmitting(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div>
            <h3 className="text-lg font-extrabold text-[#191c1e] flex items-center gap-1.5">
              <Layers className="w-5 h-5 text-[#006876]" />
              Recibo de Recaudo / Tesorería
            </h3>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              Cliente: <span className="text-gray-900 font-bold">{customer.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200/70 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          
          {/* 1. Multi-Invoice Selector */}
          <div className="bg-cyan-50/50 p-3.5 rounded-2xl border border-cyan-200/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase text-[#005662] tracking-wider flex items-center gap-1">
                <FileCheck className="w-4 h-4 text-[#006876]" />
                Facturas a Saldar ({selectedInvoiceIds.length})
              </label>

              {availableInvoices.length > 1 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[10px] font-extrabold text-[#006876] hover:underline"
                >
                  Seleccionar Todas
                </button>
              )}
            </div>

            {availableInvoices.length === 0 ? (
              <p className="text-xs text-gray-500 italic p-2 bg-white rounded-xl">
                Este cliente no tiene facturas pendientes.
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {availableInvoices.map((inv) => {
                  const isSelected = selectedInvoiceIds.includes(inv.id);
                  const pendingBalance = inv.totalAmount - inv.paidAmount;

                  return (
                    <div
                      key={inv.id}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between bg-white ${
                        isSelected
                          ? 'border-[#006876] ring-1 ring-[#006876]/30 shadow-2xs'
                          : 'border-gray-200 opacity-70'
                      }`}
                    >
                      <div
                        onClick={() => handleToggleInvoice(inv.id)}
                        className="flex items-center space-x-2.5 cursor-pointer flex-1"
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[#006876] text-white'
                              : 'border border-gray-300 bg-gray-50'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="font-black text-gray-900 block">
                            {inv.invoiceNumber}
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium">
                            {inv.description} · Vence: {inv.dueDate}
                          </span>
                        </div>
                      </div>

                      <div className="text-right pl-2">
                        <span className="font-extrabold text-[#006876] block tabular-nums">
                          {formatCOP(pendingBalance)}
                        </span>
                        {isSelected && (
                          <input
                            type="number"
                            step="1000"
                            min="1000"
                            max={pendingBalance}
                            value={paymentAmounts[inv.id] || 0}
                            onChange={(e) =>
                              setPaymentAmounts({
                                ...paymentAmounts,
                                [inv.id]: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-24 text-right px-2 py-0.5 border border-cyan-300 rounded-md text-[11px] font-bold text-gray-900 outline-none focus:ring-1 focus:ring-[#006876]"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total Collection Badge */}
            <div className="pt-2 border-t border-cyan-200/80 flex items-center justify-between text-xs font-black text-[#005662]">
              <span>Monto Total del Recibo:</span>
              <span className="text-base text-[#006876] tabular-nums">
                {formatCOP(totalCollectionAmount)}
              </span>
            </div>
          </div>

          {/* 2. Payment Method */}
          <div>
            <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1.5">
              Medio de Pago
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Transferencia', label: 'Transferencia', icon: Banknote },
                { id: 'Efectivo', label: 'Efectivo', icon: DollarSign },
                { id: 'Cheque', label: 'Cheque', icon: CreditCard },
                { id: 'Datafono POS', label: 'Datáfono POS', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-2.5 rounded-xl border font-bold text-xs flex items-center space-x-2 transition-all ${
                      isSelected
                        ? 'border-[#006876] bg-cyan-50 text-[#006876] ring-1 ring-[#006876]'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reference / Voucher Code */}
          <div>
            <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
              N° Recibo / Comprobante
            </label>
            <input
              type="text"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 rounded-xl font-bold text-xs text-gray-900 border-0 focus:ring-2 focus:ring-[#006876] outline-none"
              required
            />
          </div>

          {/* 3. Evidence Capture / Photo Upload */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-gray-500 block">
              Evidencia del Pago (Comprobante / Voucher)
            </label>

            {evidenceUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-emerald-300 bg-emerald-50/50 p-2 flex items-center space-x-3">
                <img
                  src={evidenceUrl}
                  alt="Comprobante"
                  className="w-16 h-16 object-cover rounded-xl border border-gray-200 shrink-0"
                />
                <div className="flex-1">
                  <span className="font-extrabold text-emerald-900 text-xs block">
                    Comprobante Adjunto
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    Listo para revisión de Tesorería
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEvidenceUrl(null)}
                  className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 font-extrabold text-[10px] rounded-lg border border-rose-200"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-dashed border-gray-300 text-gray-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span>Subir Archivo</span>
                </button>

                <button
                  type="button"
                  onClick={handleSimulateCameraPhoto}
                  className="p-3 bg-cyan-50 hover:bg-cyan-100/70 rounded-xl border border-cyan-200 text-[#006876] font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>Tomar Foto (Cámara)</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. Digital Signature Canvas Pad */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-extrabold uppercase text-gray-500 flex items-center gap-1">
                <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                Firma Digital del Cliente
              </label>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleAutoSign}
                  className="text-[10px] font-bold text-[#5355a9] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Auto-Firma
                </button>
                {hasSignature && (
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Limpiar
                  </button>
                )}
              </div>
            </div>

            <div className="relative bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
              <canvas
                ref={canvasRef}
                width={360}
                height={90}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-24 touch-none cursor-crosshair bg-white"
              />
              {!hasSignature && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-gray-400 font-medium text-[11px]">
                  Firme aquí con el dedo o puntero...
                </div>
              )}
            </div>
            {hasSignature && (
              <span className="text-[10px] text-emerald-700 font-bold block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Firma capturada correctamente
              </span>
            )}
          </div>

          {/* Impact Info */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 space-y-0.5">
            <div className="flex items-center space-x-1.5 font-extrabold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Flujo de Tesorería y Liberación de Cupo:</span>
            </div>
            <p className="font-medium text-emerald-800">
              El recibo pasará a revisión de Tesorería para aprobación final en Contabilidad SAP.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || selectedInvoiceIds.length === 0 || totalCollectionAmount <= 0}
              className="w-full py-3.5 bg-[#006876] hover:bg-[#005662] text-white font-extrabold text-xs rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Emitiendo Recibo de Tesorería...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-cyan-300" />
                  <span>Emitir Recibo de Cobro ({formatCOP(totalCollectionAmount)})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
