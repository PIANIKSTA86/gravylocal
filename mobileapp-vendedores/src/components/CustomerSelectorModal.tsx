import React, { useState } from 'react';
import { Customer } from '../types';
import { Search, X, Check, Building2, AlertCircle } from 'lucide-react';

interface CustomerSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  selectedCustomerId: string;
  onSelectCustomer: (customer: Customer) => void;
}

export const CustomerSelectorModal: React.FC<CustomerSelectorModalProps> = ({
  isOpen,
  onClose,
  customers,
  selectedCustomerId,
  onSelectCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nit.includes(searchTerm) ||
      c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-xl font-extrabold text-[#191c1e] tracking-tight">
              Select Client Portfolio
            </h3>
            <p className="text-xs text-[#6d797c]">
              Choose customer account for sales route
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-200/60 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Field */}
        <div className="p-4 bg-white border-b border-gray-100">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, NIT, or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm font-medium border-0 focus:ring-2 focus:ring-[#006876] outline-none"
            />
          </div>
        </div>

        {/* Customer List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.map((customer) => {
            const isSelected = customer.id === selectedCustomerId;
            const usagePercent = Math.round(
              (customer.creditUsed / customer.creditLimit) * 100
            );

            return (
              <div
                key={customer.id}
                onClick={() => {
                  onSelectCustomer(customer);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[#006876] bg-cyan-50/40 ring-1 ring-[#006876]'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#006876] text-white'
                          : 'bg-indigo-50 text-[#5355a9]'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#191c1e] text-base leading-snug">
                        {customer.name}
                      </h4>
                      <p className="text-xs text-gray-500 font-medium">
                        NIT: {customer.nit} · {customer.contactPerson}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-[#006876] text-white flex items-center justify-center text-xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Credit Limit & Balance Summary */}
                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500 font-medium block">
                      Credit Limit Used:
                    </span>
                    <span
                      className={`font-extrabold ${
                        usagePercent >= 85 ? 'text-red-600' : 'text-gray-900'
                      }`}
                    >
                      {usagePercent}% (${customer.creditUsed.toLocaleString()})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium block">
                      Balance Due:
                    </span>
                    <span className="font-extrabold text-[#006876] tabular-nums">
                      ${customer.balanceDue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="font-semibold text-sm">No clients matched your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
