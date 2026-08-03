import React, { useState, useEffect } from 'react';
import { Order, CartItem, Product, OrderType, OrderStatus } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockData';
import { formatCOP } from '../lib/utils';
import {
  X,
  Plus,
  Minus,
  Save,
  Trash2,
  Calendar,
  FileText,
  AlertCircle,
  Tag,
  Clock,
  CheckCircle2,
  PackageCheck,
  Ban,
} from 'lucide-react';

interface EditOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveOrder: (updatedOrder: Order) => void;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onSaveOrder,
}) => {
  if (!isOpen || !order) return null;

  const [documentType, setDocumentType] = useState<OrderType>(order.documentType || 'Pedido');
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [items, setItems] = useState<CartItem[]>(order.items || []);
  const [paymentTerms, setPaymentTerms] = useState(order.paymentTerms || 'Crédito 30 Días');
  const [deliveryDate, setDeliveryDate] = useState(order.deliveryDate || '');
  const [notes, setNotes] = useState(order.notes || '');
  const [discount, setDiscount] = useState<number>(order.discount || 0);

  // Selector for adding new products
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  useEffect(() => {
    if (order) {
      setDocumentType(order.documentType || 'Pedido');
      setStatus(order.status);
      setItems(order.items ? [...order.items] : []);
      setPaymentTerms(order.paymentTerms || 'Crédito 30 Días');
      setDeliveryDate(order.deliveryDate || '');
      setNotes(order.notes || '');
      setDiscount(order.discount || 0);
    }
  }, [order]);

  // Handle item quantity change
  const handleQuantityChange = (productId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Handle adding product from dropdown
  const handleAddProduct = (prodId: string) => {
    if (!prodId) return;
    const targetProduct = INITIAL_PRODUCTS.find((p) => p.id === prodId);
    if (!targetProduct) return;

    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === prodId);
      if (existing) {
        return prev.map((i) =>
          i.product.id === prodId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product: targetProduct, quantity: 1 }];
    });
    setSelectedProductId('');
  };

  // Handle removing an item
  const handleRemoveItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  // Calculations
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const tax = Math.round((subtotal - discount) * 0.19);
  const total = Math.max(0, subtotal - discount + tax);

  const handleSave = () => {
    if (items.length === 0) {
      alert('El pedido debe tener al menos un producto.');
      return;
    }

    const updated: Order = {
      ...order,
      documentType,
      status: status === 'Pendiente Sincronización' ? 'Modificado' : status,
      items,
      subtotal,
      tax,
      discount,
      total,
      paymentTerms,
      deliveryDate,
      notes,
    };

    onSaveOrder(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="p-4 bg-[#5355a9] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <PackageCheck className="w-5 h-5 text-cyan-300" />
              <h3 className="text-lg font-extrabold tracking-tight">
                Modificar {documentType}
              </h3>
            </div>
            <p className="text-xs text-indigo-100 font-medium">
              Documento: <span className="font-bold text-white">{order.orderNumber}</span> • {order.customerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Document Type & Status Switch */}
          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200 space-y-3">
            <div>
              <label className="text-xs font-extrabold text-gray-700 mb-1.5 block">
                Tipo de Emisión
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDocumentType('Pedido')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 ${
                    documentType === 'Pedido'
                      ? 'bg-[#006876] text-white border-[#006876] shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Pedido de Venta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDocumentType('Reserva')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 ${
                    documentType === 'Reserva'
                      ? 'bg-[#5355a9] text-white border-[#5355a9] shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Reserva de Stock</span>
                </button>
              </div>
            </div>

            {/* Status Selector */}
            <div>
              <label className="text-xs font-extrabold text-gray-700 mb-1 block">
                Estado del Documento
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#006876]"
              >
                <option value="Pendiente Sincronización">Pendiente Sincronización</option>
                <option value="Sincronizado ERP">Sincronizado ERP</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Borrador">Borrador</option>
                <option value="Modificado">Modificado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                Productos del Documento
              </h4>
              <span className="text-[11px] font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-full">
                {items.length} Ítems
              </span>
            </div>

            {/* Item List */}
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white rounded-2xl p-3 border border-gray-200 shadow-2xs flex items-center justify-between"
                >
                  <div className="flex-1 pr-2">
                    <p className="text-xs font-extrabold text-gray-900 leading-tight">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
                      Precio Unitario: {formatCOP(item.product.price)}
                    </p>
                    <p className="text-xs font-black text-[#006876] mt-0.5">
                      Subtotal: {formatCOP(item.product.price * item.quantity)}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1 border border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.product.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white text-gray-700 flex items-center justify-center font-bold active:scale-95 text-xs shadow-2xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-extrabold text-gray-900 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.product.id, 1)}
                        className="w-6 h-6 rounded-lg bg-[#006876] text-white flex items-center justify-center font-bold active:scale-95 text-xs shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.product.id)}
                      className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Product Dropdown */}
            <div className="pt-2">
              <select
                value={selectedProductId}
                onChange={(e) => handleAddProduct(e.target.value)}
                className="w-full bg-indigo-50/60 border border-indigo-200 text-[#5355a9] rounded-xl px-3 py-2 text-xs font-extrabold outline-none focus:ring-2 focus:ring-[#5355a9]"
              >
                <option value="">+ Agregar Producto al {documentType}...</option>
                {INITIAL_PRODUCTS.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} ({formatCOP(prod.price)} / {prod.unit})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Delivery & Terms Fields */}
          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-extrabold text-gray-700 mb-1 block flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-[#006876]" />
                  <span>Fecha Entrega</span>
                </label>
                <input
                  type="text"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  placeholder="e.g. 28 Jul 2026"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#006876]"
                />
              </div>

              <div>
                <label className="font-extrabold text-gray-700 mb-1 block">
                  Condiciones Pago
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#006876]"
                >
                  <option value="Contado contra entrega">Contado contra entrega</option>
                  <option value="Crédito 15 Días">Crédito 15 Días</option>
                  <option value="Crédito 30 Días">Crédito 30 Días</option>
                  <option value="Anticipado 50%">Anticipado 50%</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-extrabold text-gray-700 mb-1 block">
                Descuento Especial ($ COP)
              </label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#006876]"
              />
            </div>

            <div>
              <label className="font-extrabold text-gray-700 mb-1 block flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-[#006876]" />
                <span>Notas del Vendedor</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones de entrega, empaque o cliente..."
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 font-medium text-gray-800 outline-none focus:ring-2 focus:ring-[#006876]"
              />
            </div>
          </div>

        </div>

        {/* Footer Summary & Save */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 shrink-0 space-y-3">
          <div className="space-y-1 text-xs font-semibold text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold text-gray-900">{formatCOP(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Descuento:</span>
                <span className="font-bold">-{formatCOP(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>IVA (19%):</span>
              <span className="font-bold text-gray-900">{formatCOP(tax)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-gray-900 pt-1 border-t border-gray-200">
              <span>Total Re-calculado:</span>
              <span className="text-[#006876]">{formatCOP(total)}</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-[#006876] hover:bg-[#005662] text-white font-extrabold text-xs rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios en {documentType}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
