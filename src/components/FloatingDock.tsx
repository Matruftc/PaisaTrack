import React from 'react';
import { Sparkles, Plus, ArrowUpDown } from 'lucide-react';

interface FloatingDockProps {
  onOpenUpiModal: () => void;
  onOpenAddModal: () => void;
  onOpenExportImportModal: () => void;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  onOpenUpiModal,
  onOpenAddModal,
  onOpenExportImportModal,
}) => {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[92vw]">
      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/95 dark:bg-black/90 backdrop-blur-2xl border border-slate-300/80 dark:border-white/20 shadow-2xl shadow-slate-300/50 dark:shadow-indigo-500/25 text-slate-900 dark:text-white transition-all hover:border-slate-400 dark:hover:border-white/30 hover:scale-[1.02]">
        {/* Main Glowing UPI Trigger */}
        <button
          onClick={onOpenUpiModal}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/30 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          title="Share UPI SMS or payment link"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="tracking-tight">Paste UPI / SMS</span>
        </button>

        {/* Add Transaction Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 active:scale-95 text-xs font-bold text-slate-800 dark:text-white transition-all border border-slate-200 dark:border-white/10 cursor-pointer"
          title="Add manual transaction"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </button>

        {/* Data Portability */}
        <button
          onClick={onOpenExportImportModal}
          className="flex items-center gap-1 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 active:scale-95 text-xs font-bold text-slate-800 dark:text-white transition-all border border-slate-200 dark:border-white/10 cursor-pointer"
          title="Export / Import records"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-300" />
          <span className="hidden sm:inline">Data</span>
        </button>
      </div>
    </div>
  );
};
