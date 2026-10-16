import React, { useRef, useState } from 'react';
import {
  X,
  ShieldCheck,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  FileSpreadsheet,
  FileCode,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import {
  exportToCsvString,
  exportToJsonString,
  importFromJson,
  AppSettings,
} from '../services/storage';

interface PrivacyBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordCount: number;
  storageSize: string;
  settings: AppSettings;
  onSaveSettings: (settings: Partial<AppSettings>) => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
  onDataImported: () => void;
}

export const PrivacyBackupModal: React.FC<PrivacyBackupModalProps> = ({
  isOpen,
  onClose,
  recordCount,
  storageSize,
  settings,
  onSaveSettings,
  onResetSampleData,
  onClearAllData,
  onDataImported,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [budgetInput, setBudgetInput] = useState<string>(settings.monthlyBudget.toString());
  const [currencySymbol, setCurrencySymbol] = useState<string>(settings.currencySymbol);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(
    null
  );
  const [confirmWipe, setConfirmWipe] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExportJson = () => {
    const jsonStr = exportToJsonString();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paisatrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage({ text: 'JSON backup downloaded successfully!' });
  };

  const handleExportCsv = () => {
    const csvStr = exportToCsvString();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paisatrack_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage({ text: 'CSV spreadsheet exported successfully!' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importFromJson(content);
      if (res.success) {
        setStatusMessage({ text: `Successfully restored ${res.count} transactions!` });
        onDataImported();
      } else {
        setStatusMessage({ text: res.error || 'Failed to import JSON', isError: true });
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(budgetInput);
    if (!isNaN(parsed) && parsed >= 0) {
      onSaveSettings({
        monthlyBudget: parsed,
        currencySymbol,
      });
      setStatusMessage({ text: 'Preferences updated successfully!' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-[#141417] w-full max-w-xl rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-zinc-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-lime-300 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-slate-900 dark:text-white tracking-tight">
                Vault, Privacy & Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                100% Client-side local architecture details and data export
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                statusMessage.isError
                  ? 'bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {statusMessage.isError ? (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              ) : (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Privacy Guarantee Card */}
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-800/80 text-xs text-emerald-950 dark:text-emerald-200 space-y-1.5">
            <div className="flex items-center gap-2 font-extrabold text-emerald-900 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>100% Zero-Database Privacy Guarantee</span>
            </div>
            <p className="text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed text-[11px]">
              Your financial records are never saved to a database, cloud server, or remote backend. Everything stays strictly inside your browser's persistent LocalStorage.
            </p>
            <div className="pt-1 flex items-center gap-3 font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
              <span>Records: {recordCount}</span>
              <span>·</span>
              <span>Storage used: {storageSize}</span>
            </div>
          </div>

          {/* Preferences Form */}
          <form onSubmit={handleSaveBudget} className="space-y-3 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Personal Finance Preferences
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Monthly Target Budget
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="w-full text-xs pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold tabular-nums outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Currency Symbol
                </label>
                <select
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden font-medium"
                >
                  <option value="₹">₹ (INR - Indian Rupee)</option>
                  <option value="$">$ (USD - US Dollar)</option>
                  <option value="€">€ (EUR - Euro)</option>
                  <option value="£">£ (GBP - British Pound)</option>
                  <option value="¥">¥ (JPY - Yen)</option>
                  <option value="AED">AED (UAE Dirham)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="text-xs px-3 py-1.5 bg-slate-900 dark:bg-emerald-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-emerald-500 font-semibold transition-colors"
            >
              Update Preferences
            </button>
          </form>

          {/* Export & Import Data */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Data Portability & Backup
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export your data anytime or move your records to another device or spreadsheet.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
              >
                <FileCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Export JSON Backup</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Export CSV Spreadsheet</span>
              </button>
            </div>

            <div className="pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                id="restore-file-input"
              />
              <label
                htmlFor="restore-file-input"
                className="cursor-pointer flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl transition-colors border border-dashed border-slate-300 dark:border-slate-700"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Import JSON Backup File</span>
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Reset & Wipe Options
            </h3>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetSampleData();
                  setStatusMessage({ text: 'Sample records restored!' });
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                Reset to Sample Records
              </button>

              {confirmWipe ? (
                <div className="flex-1 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClearAllData();
                      setConfirmWipe(false);
                      setStatusMessage({ text: 'All local records cleared.' });
                    }}
                    className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
                  >
                    Confirm Wipe
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmWipe(false)}
                    className="px-2 py-2 text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmWipe(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 rounded-xl transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  Wipe All Local Data
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
