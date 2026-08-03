import React, { useState } from 'react';
import { formatCOP } from '../lib/utils';
import { Search, Package, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface InventoryViewProps {
  onOpenOrderBuilder: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onOpenOrderBuilder }) => {
  const { products } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  // Obtener categorías únicas dinámicamente de los productos reales de PocketBase
  const dynamicCategories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );
  const categories = ['Todos', ...dynamicCategories];

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === 'Todos' || p.category === activeCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="px-5 pt-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#191c1e] tracking-tight">
            Inventario de Productos ({products.length})
          </h2>
          <p className="text-xs text-[#6d797c] font-semibold">
            Catálogo en tiempo real sincronizado con PocketBase / PostgreSQL
          </p>
        </div>
        <button
          onClick={onOpenOrderBuilder}
          className="px-3.5 py-2 bg-[#006876] text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 active:scale-95 transition-all"
        >
          <ShoppingBag className="w-4 h-4 text-cyan-200" />
          <span>Emitir</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Buscar por código SKU o nombre de producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl text-sm font-semibold border border-gray-200 shadow-2xs focus:ring-2 focus:ring-[#006876] outline-none"
        />
      </div>

      {/* Category Pills */}
      {categories.length > 1 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-3 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
                activeCategory === cat
                  ? 'bg-[#191c1e] text-white border-[#191c1e]'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-3 mt-2">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 text-gray-500 text-xs">
            No se encontraron productos en el inventario.
          </div>
        ) : (
          filtered.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs flex items-center justify-between"
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#006876] shrink-0 font-black">
                  {prod.imageUrl ? (
                    <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Package className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase text-[#5355a9]">
                      {prod.sku}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {prod.stock} {prod.unit}s disp.
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-gray-900 mt-0.5">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                    {prod.description}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 ml-2">
                <span className="text-sm font-black text-[#006876] tabular-nums block">
                  {formatCOP(prod.price)}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">
                  Por {prod.unit}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
