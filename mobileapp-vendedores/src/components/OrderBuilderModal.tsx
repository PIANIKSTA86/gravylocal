import React, { useState } from 'react';
import { Product, CartItem, Customer, OrderType, Order } from '../types';
import { formatCOP } from '../lib/utils';
import { X, Plus, Minus, ShoppingBag, Search, AlertTriangle, CheckCircle, ShieldAlert, Tag, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface OrderBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onOrderCreated: (newOrder: Order) => void;
}

export const OrderBuilderModal: React.FC<OrderBuilderModalProps> = ({
  isOpen,
  onClose,
  customer,
  onOrderCreated,
}) => {
  const { products } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [documentType, setDocumentType] = useState<OrderType>('Pedido');
  const [paymentTerms, setPaymentTerms] = useState<string>('Crédito 30 Días');
  const [deliveryDate, setDeliveryDate] = useState<string>('En 3 Días Hábiles');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const dynamicCategories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );
  const categories = ['All', ...dynamicCategories];

  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const updated = Math.max(0, current + delta);
      if (updated === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: updated };
    });
  };

  // Cart calculations
  const cartItems: CartItem[] = Object.entries(cart).map(([prodId, qty]) => {
    const product = products.find((p) => p.id === prodId)!;
    return { product, quantity: Number(qty) };
  }).filter((item) => item.product);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.19; // IVA 19% Colombia
  const total = subtotal + tax;

  const availableCredit = customer ? (customer.creditLimit - customer.creditUsed) : 0;
  const isCreditExceeded = total > availableCredit && customer?.creditLimit > 0;

  const handleCreateOrder = () => {
    if (cartItems.length === 0) return;
    setIsSubmitting(true);

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = new Date().toTimeString().slice(0, 5).replace(':', '');
    const newOrderNumber = `${documentType === 'Reserva' ? 'RES' : 'PED'}-${dateStr}-${timeStr}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: newOrderNumber,
      documentType,
      customerId: customer.id,
      customerName: customer.name,
      date: new Date().toLocaleDateString('es-CO', { dateStyle: 'short' }),
      deliveryDate,
      items: cartItems,
      subtotal,
      tax,
      discount: 0,
      total,
      status: 'Pendiente Sincronización',
      paymentTerms,
      notes,
    };

    setTimeout(() => {
      onOrderCreated(newOrder);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        {/* Modal Header */}
        <div className="p-4 bg-[#191c1e] text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-cyan-400/20 text-cyan-300 px-2 py-0.5 rounded-full">
                Emisión Móvil
              </span>
              <span className="text-xs text-gray-400 font-medium">NIT: {customer?.nit}</span>
            </div>
            <h2 className="text-lg font-extrabold text-white truncate max-w-[240px]">
              {customer?.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Header */}
        <div className="p-3 bg-gray-50 border-b border-gray-200 shrink-0 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar productos por SKU o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl text-xs font-semibold border border-gray-200 outline-none focus:ring-2 focus:ring-[#006876]"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold whitespace-nowrap border ${
                  selectedCategory === cat
                    ? 'bg-[#006876] text-white border-[#006876]'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Catalog List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-100/50">
          {filteredProducts.map((prod) => {
            const qty = cart[prod.id] || 0;
            return (
              <div
                key={prod.id}
                className="bg-white rounded-xl p-3 border border-gray-200 shadow-2xs flex items-center justify-between"
              >
                <div className="flex-1 pr-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[9px] font-black text-[#5355a9] bg-indigo-50 px-1.5 py-0.5 rounded">
                      {prod.sku}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      Stock: {prod.stock} {prod.unit}s
                    </span>
                  </div>
                  <h4 className="font-extrabold text-xs text-gray-900 mt-0.5">
                    {prod.name}
                  </h4>
                  <span className="text-xs font-black text-[#006876] block mt-0.5">
                    {formatCOP(prod.price)}
                  </span>
                </div>

                <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl p-1 shrink-0">
                  <button
                    onClick={() => updateQuantity(prod.id, -1)}
                    disabled={qty === 0}
                    className="w-7 h-7 rounded-lg bg-white shadow-2xs flex items-center justify-center text-gray-700 disabled:opacity-30"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center text-xs font-extrabold text-gray-900">
                    {qty}
                  </span>
                  <button
                    onClick={() => updateQuantity(prod.id, 1)}
                    className="w-7 h-7 rounded-lg bg-[#006876] text-white shadow-2xs flex items-center justify-center active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Order Summary & Submit */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-white border-t border-gray-200 shadow-xl shrink-0 space-y-3 animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-center text-xs text-gray-500 font-semibold">
              <span>Subtotal ({cartItems.reduce((a, b) => a + b.quantity, 0)} ítems)</span>
              <span>{formatCOP(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 font-semibold">
              <span>IVA (19% DIAN)</span>
              <span>{formatCOP(tax)}</span>
            </div>
            <div className="flex justify-between items-center text-base font-black text-gray-900 pt-1 border-t border-gray-100">
              <span>Total Pedido:</span>
              <span className="text-[#006876] text-lg">{formatCOP(total)}</span>
            </div>

            {isCreditExceeded && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Excede cupo disponible ({formatCOP(availableCredit)})</span>
              </div>
            )}

            <button
              onClick={handleCreateOrder}
              disabled={isSubmitting}
              className="w-full py-3 bg-[#006876] text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center space-x-2 active:scale-98 transition-all disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isSubmitting ? 'Procesando...' : 'Confirmar y Guardar Pedido'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
