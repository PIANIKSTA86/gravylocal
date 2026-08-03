import React from 'react';
import { Bell, ChevronDown, Sparkles } from 'lucide-react';
import { Customer } from '../types';
import { GravyLogo } from './GravyLogo';

interface HeaderProps {
  currentCustomer?: Customer | null;
  onOpenCustomerSelector: () => void;
  onOpenNotifications: () => void;
  onOpenAiAssistant: () => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentCustomer,
  onOpenCustomerSelector,
  onOpenNotifications,
  onOpenAiAssistant,
  unreadNotificationsCount = 2,
}) => {
  return (
    <div className="bg-[#5355a9] text-white pt-5 pb-12 px-5 rounded-b-[2rem] shadow-md relative">
      <div className="flex items-center justify-between mb-4">
        {/* User Profile & App Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg border border-white/30 shrink-0">
            <GravyLogo className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5 leading-tight">
              GRAVY Mobile
            </h1>
            <p className="text-xs text-indigo-100 font-medium">
              Ventas de Campo · SAP S/4HANA
            </p>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center space-x-2">
          {/* AI Sales Assistant trigger */}
          <button
            onClick={onOpenAiAssistant}
            title="AI Sales Assistant"
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all flex items-center justify-center text-cyan-200 border border-white/20 backdrop-blur-md"
          >
            <Sparkles className="w-5 h-5 text-[#80deea] animate-pulse" />
          </button>

          {/* Notifications button */}
          <button
            onClick={onOpenNotifications}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all flex items-center justify-center text-white relative border border-white/20 backdrop-blur-md"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#5355a9]" />
            )}
          </button>
        </div>
      </div>

      {/* Customer Quick Selector Ribbon */}
      <div className="mt-2 flex items-center justify-between bg-white/10 hover:bg-white/15 transition-all rounded-xl px-3.5 py-2 border border-white/15 backdrop-blur-md cursor-pointer" onClick={onOpenCustomerSelector}>
        <div className="flex items-center space-x-2 overflow-hidden">
          <span className="text-xs uppercase tracking-wider text-indigo-200 font-bold shrink-0">
            Cliente Activo:
          </span>
          <span className="text-sm font-bold text-white truncate">
            {currentCustomer?.name || 'Seleccionar Cliente'}
          </span>
        </div>
        <div className="flex items-center space-x-1 text-cyan-200 text-xs font-semibold shrink-0">
          <span>Cambiar</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
