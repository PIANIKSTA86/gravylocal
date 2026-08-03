import React from 'react';
import { Customer } from '../types';
import { formatCOP, formatCOPShort } from '../lib/utils';

interface PortfolioAgingProps {
  customer?: Customer | null;
  selectedFilter: string | null;
  onSelectFilter: (filter: string | null) => void;
}

export const PortfolioAging: React.FC<PortfolioAgingProps> = ({
  customer,
  selectedFilter,
  onSelectFilter,
}) => {
  if (!customer || !customer.agingSummary) return null;

  const agingItems = [
    {
      id: 'al_dia',
      label: 'Al Día',
      dotColor: 'bg-emerald-500',
      amount: customer.agingSummary.alDia || 0,
    },
    {
      id: '1_30',
      label: '1–30 Días',
      dotColor: 'bg-amber-400',
      amount: customer.agingSummary.d1_30 || 0,
    },
    {
      id: '31_60',
      label: '31–60 Días',
      dotColor: 'bg-orange-500',
      amount: customer.agingSummary.d31_60 || 0,
    },
    {
      id: '60_plus',
      label: '> 60 Días',
      dotColor: 'bg-rose-600',
      amount: customer.agingSummary.d60Plus || 0,
    },
  ];

  return (
    <div className="px-5 mt-6 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#6d797c]">
          Estado de Cartera por Edades
        </h3>
        {selectedFilter && (
          <button
            onClick={() => onSelectFilter(null)}
            className="text-xs text-[#5355a9] font-bold hover:underline"
          >
            Limpiar Filtro
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {agingItems.map((item) => {
          const isSelected = selectedFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectFilter(isSelected ? null : item.id)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-[#5355a9] text-white border-[#5355a9] shadow-md scale-[1.02]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1">
                <span className={`w-2 h-2 rounded-full ${item.dotColor}`} />
                <span
                  className={`text-[10px] font-bold tracking-tight truncate ${
                    isSelected ? 'text-indigo-100' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
              <p
                className={`text-xs font-extrabold tracking-tight ${
                  isSelected ? 'text-white' : 'text-gray-900'
                }`}
              >
                {formatCOPShort(item.amount)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
