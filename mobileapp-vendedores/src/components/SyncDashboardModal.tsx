import React, { useState } from 'react';
import { SyncState } from '../types';
import { RefreshCw, CheckCircle2, Server, Wifi, Database, X, Zap } from 'lucide-react';

interface SyncDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: SyncState;
  onTriggerSync: () => void;
}

export const SyncDashboardModal: React.FC<SyncDashboardModalProps> = ({
  isOpen,
  onClose,
  syncState,
  onTriggerSync,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      onTriggerSync();
      setIsSyncing(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#5355a9] text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-cyan-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">
                ERP Sync Center
              </h3>
              <p className="text-xs text-indigo-100 font-medium">
                Connected to {syncState.erpSystem}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Cards */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* Connection Status Box */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wifi className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-gray-700">Network State</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping" />
                Online & Synchronized
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-xs">
              <span className="text-gray-500 font-medium">Last Sync Timestamp</span>
              <span className="font-bold text-gray-800">{syncState.lastSyncedTime}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Offline Queue Orders</span>
              <span className="font-bold text-[#006876]">{syncState.pendingOrdersCount} Pending</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Offline Collections</span>
              <span className="font-bold text-[#006876]">{syncState.pendingPaymentsCount} Pending</span>
            </div>
          </div>

          {/* Sync Information notice */}
          <div className="p-3.5 bg-cyan-50/60 border border-cyan-100 rounded-2xl flex items-start space-x-2.5 text-xs text-[#005662]">
            <Zap className="w-5 h-5 text-[#006876] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Automated Background Replication</p>
              <p className="mt-0.5 text-gray-600">
                New sales orders and collection receipts are saved locally first and pushed seamlessly to the ERP backend.
              </p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="w-full py-3.5 bg-[#006876] hover:bg-[#005662] text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-98 disabled:opacity-60"
          >
            <RefreshCw className={`w-5 h-5 text-cyan-300 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Replicating Data to ERP...' : 'Force Sync Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
