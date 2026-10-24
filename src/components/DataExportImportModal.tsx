import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Upload,
  FileCode,
  FileSpreadsheet,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Database,
  ArrowRight,
} from 'lucide-react';
import {
  exportToCsvString,
  exportToJsonString,
  importFromJson,
  getStoredTransactions,
  saveAllTransactions,
} from '../services/storage';
import { Transaction } from '../types/finance';
import { parseCsvOrSpreadsheetText } from '../utils/csvImporter';

interface DataExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
  recordCount: number;
  storageSize: string;
}

export const DataExportImportModal: React.FC<DataExportImportModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
  recordCount,
  storageSize,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState<boolean>(false);
  const [pastedJson, setPastedJson] = useState<string>('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  const handleDownloadJson = () => {
    const jsonStr = exportToJsonString();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paisatrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback({ text: 'JSON backup downloaded successfully!' });
  };

  const handleDownloadCsv = () => {
    const csvStr = exportToCsvString();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paisatrack_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback({ text: 'CSV spreadsheet exported successfully!' });
  };

  const handleCopyJson = () => {
    const jsonStr = exportToJsonString();
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setFeedback({ text: 'Raw JSON data copied to clipboard!' });
    setTimeout(() => setCopied(false), 2500);
  };

  const processImportString = (content: string) => {
    let validRecords: Transaction[] = [];
    let isCsvImport = false;

    // 1. Try parsing JSON first
    if (content.trim().startsWith('[') || content.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item && item.title && typeof item.amount === 'number' && item.date) {
              validRecords.push({
                id: item.id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                title: String(item.title),
                amount: Number(item.amount),
                type: item.type === 'income' ? 'income' : 'expense',
                category: item.category || 'General & Others',
                date: item.date,
                time: item.time || '12:00',
                paymentMethod: item.paymentMethod || 'UPI',
                upiDetails: item.upiDetails || undefined,
                notes: item.notes || '',
                createdAt: item.createdAt || Date.now(),
                updatedAt: Date.now(),
              });
            }
          }
        }
      } catch {
        // Fallback to CSV parsing below
      }
    }

    // 2. If not valid JSON or returned 0 records, attempt CSV / Excel Spreadsheet parsing
    if (validRecords.length === 0) {
      const csvResult = parseCsvOrSpreadsheetText(content);
      if (csvResult.success && csvResult.records.length > 0) {
        validRecords = csvResult.records;
        isCsvImport = true;
      } else if (csvResult.error && !content.trim().startsWith('[')) {
        setFeedback({ text: `Import failed: ${csvResult.error}`, isError: true });
        return;
      }
    }

    if (validRecords.length === 0) {
      setFeedback({
        text: 'No valid transaction records found in the uploaded file or text. Ensure columns for Title and Amount exist.',
        isError: true,
      });
      return;
    }

    // 3. Save or Merge records into local storage
    if (importMode === 'replace') {
      saveAllTransactions(validRecords);
      setFeedback({
        text: `Successfully replaced records with ${validRecords.length} transactions imported from ${
          isCsvImport ? 'CSV/Excel Spreadsheet' : 'JSON Backup'
        }!`,
      });
    } else {
      const current = getStoredTransactions();
      const existingIds = new Set(current.map((t) => t.id));
      const newRecords = validRecords.filter((t) => !existingIds.has(t.id));
      const merged = [...newRecords, ...current];
      saveAllTransactions(merged);
      setFeedback({
        text: `Successfully merged ${newRecords.length} transactions from ${
          isCsvImport ? 'CSV/Excel Spreadsheet' : 'JSON Backup'
        } (${validRecords.length - newRecords.length} duplicates skipped)!`,
      });
    }

    onDataChanged();
    setPastedJson('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processImportString(content);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handlePasteImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedJson.trim()) {
      setFeedback({ text: 'Please paste valid JSON data to import', isError: true });
      return;
    }
    processImportString(pastedJson);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-[#141417] w-full max-w-xl rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-zinc-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-slate-900 dark:text-white tracking-tight">
                Export & Import Vault
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                100% On-device data portability · {recordCount} records ({storageSize})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="p-6 pb-0">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setActiveTab('export');
                setFeedback(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'export'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Download className="w-4 h-4 text-indigo-500" />
              <span>Export Data ({recordCount})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('import');
                setFeedback(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'import'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4 text-emerald-500" />
              <span>Import Data</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                feedback.isError
                  ? 'bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {feedback.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* EXPORT TAB */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Download your complete expense and income history anytime. Your data is never stored on a cloud database.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* JSON Download */}
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 text-left transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      .JSON
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      Download JSON Backup
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Includes full metadata, custom dates, and UPI details.
                    </p>
                  </div>
                </button>

                {/* CSV Download */}
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:border-emerald-300 dark:hover:border-emerald-700 text-left transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      .CSV
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      Export CSV Spreadsheet
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Open with Microsoft Excel, Apple Numbers, or Google Sheets.
                    </p>
                  </div>
                </button>
              </div>

              {/* Copy to Clipboard Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Copied JSON to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>Copy Full JSON Data to Clipboard</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* IMPORT TAB */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              {/* Import Mode Selector */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Import Mode:
                </span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="accent-emerald-600"
                    />
                    <span className="text-slate-700 dark:text-slate-300">Merge with existing</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer ml-2">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="accent-rose-600"
                    />
                    <span className="text-slate-700 dark:text-slate-300">Replace all</span>
                  </label>
                </div>
              </div>

              {/* File Upload Box */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.txt,.tsv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="import-backup-file-input"
                />
                <label
                  htmlFor="import-backup-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-2xl bg-white dark:bg-slate-800/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all text-center group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    Upload CSV, Excel Spreadsheet or JSON File
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Supports <strong className="text-emerald-600 dark:text-emerald-400">.csv</strong>, <strong className="text-emerald-600 dark:text-emerald-400">.xlsx</strong>, <strong className="text-indigo-600 dark:text-indigo-400">.json</strong> &amp; tab-separated spreadsheets
                  </span>
                </label>
              </div>

              {/* Direct Paste CSV / Excel / JSON Option */}
              <form onSubmit={handlePasteImport} className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Or Paste CSV, Excel, or JSON Data:
                  </label>
                  {pastedJson && (
                    <button
                      type="button"
                      onClick={() => setPastedJson('')}
                      className="text-[11px] text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <textarea
                  rows={4}
                  value={pastedJson}
                  onChange={(e) => setPastedJson(e.target.value)}
                  placeholder={`Paste CSV, Excel rows, or JSON array.\n\nExample CSV:\nTitle, Amount, Type, Category, Date\nSwiggy Lunch, 380, expense, Food, 2026-10-16\nSalary Credit, 75000, income, Salary, 2026-10-01`}
                  className="w-full text-xs p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:border-emerald-500 outline-hidden leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer"
                  >
                    <span>Import Records</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Records stored on this device only</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
