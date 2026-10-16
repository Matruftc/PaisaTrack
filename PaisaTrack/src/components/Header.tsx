import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Settings,
  Sparkles,
  Sun,
  Moon,
  Coins,
  ArrowUpDown,
  MoreVertical,
  Check,
} from 'lucide-react';
import { ThemeMode } from '../types/finance';

interface HeaderProps {
  onOpenUpiModal: () => void;
  onOpenAddModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenIncomeModal: () => void;
  onOpenExportImportModal: () => void;
  recordCount: number;
  storageSize: string;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  isIncomeConfigured: boolean;
  monthlyIncomeAmount: number;
  currencySymbol?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenUpiModal,
  onOpenAddModal,
  onOpenSettingsModal,
  onOpenIncomeModal,
  onOpenExportImportModal,
  recordCount,
  storageSize,
  themeMode,
  onToggleTheme,
  isIncomeConfigured,
  monthlyIncomeAmount,
  currencySymbol = '₹',
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#09090b]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/5 transition-colors shadow-sm dark:shadow-lg dark:shadow-black/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Branding with Breathing Room */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-400 to-indigo-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-black text-xl shrink-0">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-xl tracking-tight text-slate-900 dark:text-white">
                  PaisaTrack
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Local Vault
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 mt-0.5">
                {recordCount} records · {storageSize}
              </p>
            </div>
          </div>

          {/* Right: Clean, Uncluttered 3-Button Strip */}
          <div className="flex items-center gap-2.5">
            {/* Primary Action: Add Record */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-lime-400 hover:opacity-95 active:scale-95 rounded-xl transition-all shadow-md shadow-emerald-500/20 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Add</span>
              <span className="hidden sm:inline">Record</span>
            </button>

            {/* Dark / Light Mode Switch */}
            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/80 active:scale-95 rounded-xl transition-all border border-slate-200 dark:border-white/10 cursor-pointer"
              title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {themeMode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Clean Dropdown / Overflow Menu (...) */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/80 active:scale-95 rounded-xl transition-all border cursor-pointer ${
                  isMenuOpen ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white border-slate-300 dark:border-white/20' : 'border-slate-200 dark:border-white/10'
                }`}
                title="More Tools & Settings"
                aria-label="More Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Overflow Dropdown Card */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-300/40 dark:shadow-black/60 p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  {/* Share UPI Details */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenUpiModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors font-semibold cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <span>Extract UPI / SMS</span>
                  </button>

                  {/* Income Profile */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenIncomeModal();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Income Profile</span>
                    </div>
                    {isIncomeConfigured && (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">
                        {currencySymbol}{(monthlyIncomeAmount / 1000).toFixed(0)}k
                      </span>
                    )}
                  </button>

                  {/* Export & Import Data */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenExportImportModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors font-semibold cursor-pointer"
                  >
                    <ArrowUpDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Export / Import Vault</span>
                  </button>

                  <div className="my-1 border-t border-slate-200 dark:border-white/10" />

                  {/* Privacy & Settings */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenSettingsModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors font-semibold cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                    <span>Privacy & Preferences</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
