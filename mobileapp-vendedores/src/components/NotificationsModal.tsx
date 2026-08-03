import React from 'react';
import { X, Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'n1',
      title: 'Credit Limit Alert',
      message: 'Tienda La Esperanza has reached 85% of credit limit ($25,500 / $30,000).',
      time: '10 mins ago',
      type: 'warning',
    },
    {
      id: 'n2',
      title: 'Invoice Overdue',
      message: 'INV-2024-055 ($950.00) is past due by 45 days. Collect payment on route.',
      time: '1 hour ago',
      type: 'alert',
    },
    {
      id: 'n3',
      title: 'ERP Sync Successful',
      message: 'Beverage Batch A2 delivery order synced with SAP S/4HANA.',
      time: '3 hours ago',
      type: 'success',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-[#5355a9]" />
            <h3 className="text-lg font-extrabold text-[#191c1e]">Notifications & Alerts</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50 flex items-start space-x-3"
            >
              {n.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
              {n.type === 'alert' && <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
              {n.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-gray-900">{n.title}</h4>
                  <span className="text-[10px] text-gray-400 font-medium">{n.time}</span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
