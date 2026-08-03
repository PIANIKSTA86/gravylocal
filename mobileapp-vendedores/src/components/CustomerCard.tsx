import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Customer } from '../types';
import { formatCOP } from '../lib/utils';

interface CustomerCardProps {
  customer?: Customer | null;
  onOpenCreditDetails?: () => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onOpenCreditDetails }) => {
  if (!customer) {
    return (
      <div className="mx-5 -mt-8 relative z-10 bg-white rounded-2xl p-5 card-shadow border border-[#e2e8f0] text-center text-gray-500 text-xs">
        Cargando datos del cliente...
      </div>
    );
  }

  const usagePercentage = customer.creditLimit > 0 
    ? Math.round((customer.creditUsed / customer.creditLimit) * 100)
    : 0;
  const isHighRisk = usagePercentage >= 80;

  return (
    <div className="mx-5 -mt-8 relative z-10 bg-white rounded-2xl p-5 card-shadow border border-[#e2e8f0]">
      {/* Header Info */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-2xl font-extrabold text-[#191c1e] tracking-tight leading-snug">
            {customer.name}
          </h2>
          <p className="text-xs text-[#6d797c] font-semibold tracking-wide">
            NIT: {customer.nit}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-[#6d797c] tracking-widest uppercase">
            CLIENTE
          </span>
          <span className="text-[10px] font-extrabold text-[#5355a9] tracking-wider uppercase">
            ACTIVO
          </span>
        </div>
      </div>

      {/* Credit Limit Usage Bar Section */}
      <div className="mt-4 mb-3">
        <div className="flex items-center justify-between text-sm mb-1.5 font-semibold">
          <span className="text-[#3d494b] font-medium">Uso Cupo de Crédito</span>
          <span className={`font-bold ${isHighRisk ? 'text-rose-600' : 'text-[#5355a9]'}`}>
            {usagePercentage}%
          </span>
        </div>
        <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200/60">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isHighRisk
                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                : 'bg-gradient-to-r from-teal-400 to-[#5355a9]'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Financial Details Grid */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#f1f5f9] text-xs">
        <div>
          <span className="text-[#6d797c] font-semibold block text-[11px]">Cupo Asignado:</span>
          <span className="font-extrabold text-[#191c1e] text-sm">
            {formatCOP(customer.creditLimit)}
          </span>
        </div>
        <div>
          <span className="text-[#6d797c] font-semibold block text-[11px]">Saldo por Cobrar:</span>
          <span className="font-extrabold text-rose-600 text-sm">
            {formatCOP(customer.balanceDue)}
          </span>
        </div>
      </div>

      {isHighRisk && (
        <div className="mt-3.5 pt-2.5 border-t border-rose-100 bg-rose-50/80 -mx-5 -mb-5 p-3 px-5 rounded-b-2xl flex items-center justify-between text-xs text-rose-700 font-bold">
          <div className="flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Alerta de Cupo: Excede el 80% del límite</span>
          </div>
          <button
            onClick={onOpenCreditDetails}
            className="text-[11px] underline hover:text-rose-900 font-extrabold"
          >
            Ver Análisis
          </button>
        </div>
      )}
    </div>
  );
};
