import React from 'react';
import { Customer } from '../types';
import { Sparkles, Shield, Database, MapPin, UserCheck, ShieldCheck, LogOut } from 'lucide-react';

interface MoreViewProps {
  customer: Customer;
  onOpenAiAssistant: () => void;
  onOpenSync: () => void;
  onOpenCustomerSelector: () => void;
  onOpenTreasury?: () => void;
}

export const MoreView: React.FC<MoreViewProps> = ({
  customer,
  onOpenAiAssistant,
  onOpenSync,
  onOpenCustomerSelector,
  onOpenTreasury,
}) => {
  return (
    <div className="px-5 pt-4 pb-28 space-y-4">
      <div>
        <h2 className="text-2xl font-extrabold text-[#191c1e] tracking-tight">
          Ajustes & Herramientas
        </h2>
        <p className="text-xs text-[#6d797c] font-semibold">
          Control de región, políticas de crédito, tesorería y replicación ERP
        </p>
      </div>

      {/* AI Assistant Banner */}
      <div
        onClick={onOpenAiAssistant}
        className="p-4 rounded-2xl bg-gradient-to-r from-[#5355a9] to-[#363789] text-white shadow-md cursor-pointer hover:opacity-95 transition-all flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#80deea] text-[#005662] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">GRAVY AI Sales Copilot</h3>
            <p className="text-xs text-cyan-200">Recomendaciones de pedido y riesgo crediticio</p>
          </div>
        </div>
      </div>

      {/* Quick Menu Options */}
      <div className="bg-white rounded-2xl p-2 border border-gray-200 shadow-2xs divide-y divide-gray-100">
        
        {onOpenTreasury && (
          <div
            onClick={onOpenTreasury}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-purple-50/60 rounded-xl transition-colors"
          >
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-purple-700" />
              <div>
                <span className="font-bold text-sm text-gray-900 block">Gestión de Tesorería</span>
                <span className="text-xs text-purple-700 font-semibold">Aprobar recaudos, evidencias y firmas en SAP</span>
              </div>
            </div>
          </div>
        )}

        <div
          onClick={onOpenCustomerSelector}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-xl transition-colors"
        >
          <div className="flex items-center space-x-3">
            <UserCheck className="w-5 h-5 text-[#5355a9]" />
            <div>
              <span className="font-bold text-sm text-gray-900 block">Cambiar Cliente Activo</span>
              <span className="text-xs text-gray-500">Actual: {customer.name}</span>
            </div>
          </div>
        </div>

        <div
          onClick={onOpenSync}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-xl transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-[#006876]" />
            <div>
              <span className="font-bold text-sm text-gray-900 block">Ajustes Replicación ERP</span>
              <span className="text-xs text-gray-500">Motor SAP S/4HANA Cloud</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-xl transition-colors">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <div>
              <span className="font-bold text-sm text-gray-900 block">Territory & Route</span>
              <span className="text-xs text-gray-500">North East Region - Sector 4</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-xl transition-colors">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-amber-600" />
            <div>
              <span className="font-bold text-sm text-gray-900 block">Credit Policy Guidelines</span>
              <span className="text-xs text-gray-500">Max threshold 85% before block</span>
            </div>
          </div>
        </div>

      </div>

      <div className="pt-2">
        <button
          onClick={() => alert('Logged out from GRAVY Mobile Sales')}
          className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors border border-rose-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Sales Session</span>
        </button>
      </div>
    </div>
  );
};
