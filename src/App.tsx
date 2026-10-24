/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Coins,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { DateFilterRange, IncomeProfile, ThemeMode, Transaction } from './types/finance';
import {
  getStoredTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  clearAllTransactions,
  resetToSampleData,
  getAppSettings,
  saveAppSettings,
  getIncomeProfile,
  saveIncomeProfile,
  getThemeMode,
  saveThemeMode,
  getLocalStorageMetrics,
  AppSettings,
} from './services/storage';
import { filterTransactionsByDate } from './utils/formatters';
import { Header } from './components/Header';
import { IncomeSection } from './components/IncomeSection';
import { SummaryCards } from './components/SummaryCards';
import { DateFilterBar } from './components/DateFilterBar';
import { TransactionList } from './components/TransactionList';
import { AnalyticsSection } from './components/AnalyticsSection';
import { UpiShareModal } from './components/UpiShareModal';
import { TransactionModal } from './components/TransactionModal';
import { PrivacyBackupModal } from './components/PrivacyBackupModal';
import { IncomeSetupModal } from './components/IncomeSetupModal';
import { DataExportImportModal } from './components/DataExportImportModal';
import { FloatingDock } from './components/FloatingDock';
import { SplashScreen } from './components/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [incomeProfile, setIncomeProfile] = useState<IncomeProfile>(getIncomeProfile());
  const [themeMode, setThemeMode] = useState<ThemeMode>(getThemeMode());
  const [filter, setFilter] = useState<DateFilterRange>({ preset: 'all' });
  const [activeModal, setActiveModal] = useState<'upi' | 'add' | 'edit' | 'privacy' | 'income' | 'export_import' | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showWipeConfirm, setShowWipeConfirm] = useState<boolean>(false);

  const applyTheme = (mode: ThemeMode) => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = getThemeMode();
    setThemeMode(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
    saveThemeMode(nextTheme);
    applyTheme(nextTheme);
  };

  // Load records from local storage
  const reloadData = () => {
    const data = getStoredTransactions();
    setTransactions(data);
    setSettings(getAppSettings());
    setIncomeProfile(getIncomeProfile());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Calculate current month's expenses for dynamic safe spend calculation
  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const currentMonthPrefix = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    return transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Filtered transactions based on custom date range or preset
  const filteredTransactions = useMemo(() => {
    return filterTransactionsByDate(transactions, filter);
  }, [transactions, filter]);

  // Aggregate metrics for the filtered view
  const { totalIncome, totalExpense, netBalance, incomeCount, expenseCount } = useMemo(() => {
    let income = 0;
    let expense = 0;
    let incCount = 0;
    let expCount = 0;

    for (const tx of filteredTransactions) {
      if (tx.type === 'income') {
        income += tx.amount;
        incCount += 1;
      } else {
        expense += tx.amount;
        expCount += 1;
      }
    }

    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense,
      incomeCount: incCount,
      expenseCount: expCount,
    };
  }, [filteredTransactions]);

  // Storage metrics
  const storageMetrics = useMemo(() => {
    return getLocalStorageMetrics();
  }, [transactions]);

  // Handlers
  const handleAddTransaction = (txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = addTransaction(txData);
    reloadData();
    triggerToast(`Added "${created.title}" successfully to local storage`);
  };

  const handleUpdateTransaction = (txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTransaction) return;
    updateTransaction(editingTransaction.id, txData);
    setEditingTransaction(null);
    reloadData();
    triggerToast(`Updated transaction record`);
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    reloadData();
    triggerToast(`Transaction record deleted`);
  };

  const handleResetSampleData = () => {
    resetToSampleData();
    reloadData();
    triggerToast(`Sample transactions restored`);
  };

  const handleClearAllData = () => {
    clearAllTransactions();
    reloadData();
    triggerToast(`All local transaction records wiped`);
  };

  const handleSaveSettings = (newSettings: Partial<AppSettings>) => {
    saveAppSettings(newSettings);
    reloadData();
    triggerToast(`Settings updated`);
  };

  const handleSaveIncomeProfile = (profile: IncomeProfile, syncToTransactions: boolean) => {
    saveIncomeProfile(profile);

    if (syncToTransactions && profile.monthlySalary > 0) {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const salaryDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(Math.min(profile.payday, 28))}`;

      // Check if monthly salary already logged for this month
      const existing = transactions.find(
        (t) =>
          t.type === 'income' &&
          t.category === 'Salary & Earnings' &&
          t.date.startsWith(`${now.getFullYear()}-${pad(now.getMonth() + 1)}`)
      );

      if (!existing) {
        addTransaction({
          title: `${profile.sourceName || 'Monthly Salary'}`,
          amount: profile.monthlySalary,
          type: 'income',
          category: 'Salary & Earnings',
          date: salaryDate,
          time: '09:00',
          paymentMethod: 'UPI',
          upiDetails: {
            payerName: profile.sourceName || 'Salary Provider',
          },
          notes: 'Auto-synced monthly salary inflow from Income Profile',
        });
      }
    }

    reloadData();
    triggerToast(`Income details configured! Inflow set to ₹${profile.monthlySalary.toLocaleString('en-IN')}/mo`);
  };

  const handleQuickConfigureDefault = () => {
    handleSaveIncomeProfile(
      {
        isConfigured: true,
        monthlySalary: 75000,
        sourceName: 'Apex Tech Solutions (Salary)',
        payday: 1,
        secondaryIncome: 15000,
        secondarySource: 'Freelance & Consulting',
        targetSavingsPercent: 20,
        lastUpdated: Date.now(),
      },
      true
    );
  };

  const handleEditClick = (tx: Transaction) => {
    setEditingTransaction(tx);
    setActiveModal('edit');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col antialiased transition-colors duration-200 pb-28">
      {/* Animated Splash Screen on App Launch */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 bg-slate-900 dark:bg-zinc-950 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700/50 dark:border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        onOpenUpiModal={() => setActiveModal('upi')}
        onOpenAddModal={() => setActiveModal('add')}
        onOpenSettingsModal={() => setActiveModal('privacy')}
        onOpenIncomeModal={() => setActiveModal('income')}
        onOpenExportImportModal={() => setActiveModal('export_import')}
        recordCount={transactions.length}
        storageSize={storageMetrics.formattedSize}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        isIncomeConfigured={incomeProfile.isConfigured}
        monthlyIncomeAmount={incomeProfile.monthlySalary + (incomeProfile.secondaryIncome || 0)}
        currencySymbol={settings.currencySymbol}
      />

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5 flex-1">
        {/* Income Setup & Control Section with Dial */}
        <IncomeSection
          incomeProfile={incomeProfile}
          onOpenIncomeModal={() => setActiveModal('income')}
          onQuickConfigureDefault={handleQuickConfigureDefault}
          currentMonthExpenses={currentMonthExpenses}
          currencySymbol={settings.currencySymbol}
        />

        {/* Date Filter Bar - Pill-Based Ribbon */}
        <DateFilterBar
          filter={filter}
          onChangeFilter={setFilter}
          filteredCount={filteredTransactions.length}
          totalCount={transactions.length}
        />

        {/* Summary Metrics with Responsive Numbers & Quick Budget Burn-Down Bar */}
        <SummaryCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          netBalance={netBalance}
          incomeCount={incomeCount}
          expenseCount={expenseCount}
          currencySymbol={settings.currencySymbol}
          monthlyBudget={settings.monthlyBudget}
        />

        {/* View Switcher / Analytics Section Toggle */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 border ${
                showAnalytics
                  ? 'bg-indigo-50 dark:bg-gradient-to-r dark:from-indigo-500/20 dark:to-cyan-500/20 border-indigo-300 dark:border-indigo-500/30 text-indigo-700 dark:text-cyan-300 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{showAnalytics ? 'Hide Analytics' : 'Show Spending Charts'}</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px]">100% Local Device Storage</span>
          </div>
        </div>

        {/* Visual Analytics */}
        {showAnalytics && (
          <AnalyticsSection
            transactions={filteredTransactions}
            currencySymbol={settings.currencySymbol}
          />
        )}

        {/* Detailed Transactions List */}
        <TransactionList
          transactions={filteredTransactions}
          onEdit={handleEditClick}
          onDelete={handleDeleteTransaction}
          onOpenUpiModal={() => setActiveModal('upi')}
          onOpenAddModal={() => setActiveModal('add')}
          currencySymbol={settings.currencySymbol}
          defaultUpiId={settings.defaultUpiId}
          defaultPayeeName={settings.defaultPayeeName}
          onUpdateTransaction={handleUpdateTransaction}
        />

        {/* Wipe All Records Action at bottom */}
        <div className="pt-8 pb-4 border-t border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-3 text-center">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Want to start fresh or remove all stored data from this device?
          </p>
          {showWipeConfirm ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-rose-50 dark:bg-rose-950/70 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-800 animate-in fade-in zoom-in-95 duration-150 shadow-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 animate-bounce" />
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                  Wipe all {transactions.length} local records permanently?
                </span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    handleClearAllData();
                    setShowWipeConfirm(false);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Confirm Wipe
                </button>
                <button
                  onClick={() => setShowWipeConfirm(false)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowWipeConfirm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Wipe All Records</span>
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#09090b] py-6 mt-12 text-center text-xs text-zinc-400 transition-colors">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-zinc-200">
              PaisaTrack · Privacy-First Local Expense Manager
            </span>
          </div>
          
          {/* Requested attribution */}
          <div className="text-xs text-zinc-400">
            Powered by{' '}
            <a
              href="https://onmegabyte.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-extrabold text-emerald-400 hover:underline decoration-2 underline-offset-2"
            >
              Megabyte
            </a>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
            <span>Zero Cloud DB</span>
            <span>·</span>
            <span>100% LocalStorage</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DataExportImportModal
        isOpen={activeModal === 'export_import'}
        onClose={() => setActiveModal(null)}
        onDataChanged={reloadData}
        recordCount={transactions.length}
        storageSize={storageMetrics.formattedSize}
      />

      <IncomeSetupModal
        isOpen={activeModal === 'income'}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveIncomeProfile}
        currentProfile={incomeProfile}
        currencySymbol={settings.currencySymbol}
      />

      <UpiShareModal
        isOpen={activeModal === 'upi'}
        onClose={() => setActiveModal(null)}
        onAddTransaction={handleAddTransaction}
        currencySymbol={settings.currencySymbol}
      />

      <TransactionModal
        isOpen={activeModal === 'add'}
        onClose={() => setActiveModal(null)}
        onSave={handleAddTransaction}
        currencySymbol={settings.currencySymbol}
      />

      <TransactionModal
        isOpen={activeModal === 'edit'}
        onClose={() => {
          setActiveModal(null);
          setEditingTransaction(null);
        }}
        onSave={handleUpdateTransaction}
        initialData={editingTransaction}
        currencySymbol={settings.currencySymbol}
      />

      <PrivacyBackupModal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        recordCount={transactions.length}
        storageSize={storageMetrics.formattedSize}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetSampleData={handleResetSampleData}
        onClearAllData={handleClearAllData}
        onDataImported={reloadData}
      />

      {/* Floating Quick Action Dock */}
      <FloatingDock
        onOpenUpiModal={() => setActiveModal('upi')}
        onOpenAddModal={() => setActiveModal('add')}
        onOpenExportImportModal={() => setActiveModal('export_import')}
      />
    </div>
  );
}
