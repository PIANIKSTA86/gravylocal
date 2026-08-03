import React from 'react';
import { Package, Users, RefreshCw, ClipboardList } from 'lucide-react';
import { GravyLogo } from './GravyLogo';

export type NavTab = 'dashboard' | 'customers' | 'orders' | 'inventory' | 'treasury' | 'sync' | 'more';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenOrderBuilder?: () => void;
  cartItemsCount?: number;
  pendingSyncCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingSyncCount = 0,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto px-4 pb-4 pt-1 pointer-events-none">
      {/* Outer rounded floating container */}
      <div className="bg-[#5355a9] text-white rounded-3xl p-1.5 shadow-2xl border border-white/20 backdrop-blur-xl flex items-center justify-between pointer-events-auto relative">
        
        {/* Tab 1: Clientes */}
        <button
          onClick={() => onTabChange('customers')}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all ${
            activeTab === 'customers'
              ? 'bg-[#6567c9] text-cyan-200 font-bold'
              : 'text-indigo-200 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-tight">Clientes</span>
        </button>

        {/* Tab 2: Pedidos y Reservas */}
        <button
          onClick={() => onTabChange('orders')}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all ${
            activeTab === 'orders'
              ? 'bg-[#6567c9] text-cyan-200 font-bold'
              : 'text-indigo-200 hover:text-white'
          }`}
        >
          <ClipboardList className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-tight">Pedidos</span>
        </button>

        {/* Central Bulging Action Button (Redirect to Main Executive Dashboard) */}
        <div className="relative -top-5 px-0.5 shrink-0">
          <button
            onClick={() => onTabChange('dashboard')}
            title="Ir al Dashboard Principal"
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all relative border-2 border-white overflow-hidden p-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-white ring-4 ring-cyan-300/60 scale-105'
                : 'bg-white/95 hover:bg-white'
            }`}
          >
            <GravyLogo className="w-full h-full object-contain drop-shadow-xs" />
          </button>
        </div>

        {/* Tab 3: Inventario */}
        <button
          onClick={() => onTabChange('inventory')}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all ${
            activeTab === 'inventory'
              ? 'bg-[#6567c9] text-cyan-200 font-bold'
              : 'text-indigo-200 hover:text-white'
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-tight">Inventario</span>
        </button>

        {/* Tab 4: Sync */}
        <button
          onClick={() => onTabChange('sync')}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all relative ${
            activeTab === 'sync'
              ? 'bg-[#6567c9] text-cyan-200 font-bold'
              : 'text-indigo-200 hover:text-white'
          }`}
        >
          <RefreshCw className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-tight">Sincro</span>
          {pendingSyncCount > 0 && (
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-amber-400 rounded-full" />
          )}
        </button>

      </div>
    </div>
  );
};
