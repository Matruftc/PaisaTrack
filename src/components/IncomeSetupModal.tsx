import React, { useState, useEffect } from 'react';
import {
  X,
  Coins,
  ArrowDownLeft,
  Building2,
  Calendar,
  PiggyBank,
  CheckCircle2,
  Sparkles,
  Percent,
} from 'lucide-react';
import { IncomeProfile } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface IncomeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    profile: IncomeProfile,
    syncToTransactions: boolean
  ) => void;
  currentProfile: IncomeProfile;
  currencySymbol?: string;
}

export const IncomeSetupModal: React.FC<IncomeSetupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentProfile,
  currencySymbol = '₹',
}) => {
  const [salary, setSalary] = useState<string>(
    currentProfile.monthlySalary > 0 ? currentProfile.monthlySalary.toString() : '75000'
  );
  const [sourceName, setSourceName] = useState<string>(
    currentProfile.sourceName || 'Primary Employer Salary'
  );
  const [payday, setPayday] = useState<number>(currentProfile.payday || 1);
  const [hasSecondary, setHasSecondary] = useState<boolean>(
    Boolean(currentProfile.secondaryIncome && currentProfile.secondaryIncome > 0)
  );
  const [secondaryIncome, setSecondaryIncome] = useState<string>(
    currentProfile.secondaryIncome ? currentProfile.secondaryIncome.toString() : '15000'
  );
  const [secondarySource, setSecondarySource] = useState<string>(
    currentProfile.secondarySource || 'Freelance / Consulting'
  );
  const [targetSavingsPercent, setTargetSavingsPercent] = useState<number>(
    currentProfile.targetSavingsPercent || 20
  );
  const [syncToTransactions, setSyncToTransactions] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setSalary(currentProfile.monthlySalary > 0 ? currentProfile.monthlySalary.toString() : '75000');
      setSourceName(currentProfile.sourceName || 'Primary Employer Salary');
      setPayday(currentProfile.payday || 1);
      setHasSecondary(Boolean(currentProfile.secondaryIncome && currentProfile.secondaryIncome > 0));
      setSecondaryIncome(currentProfile.secondaryIncome ? currentProfile.secondaryIncome.toString() : '15000');
      setSecondarySource(currentProfile.secondarySource || 'Freelance / Consulting');
      setTargetSavingsPercent(currentProfile.targetSavingsPercent || 20);
    }
  }, [isOpen, currentProfile]);

  if (!isOpen) return null;

  const numSalary = parseFloat(salary) || 0;
  const numSecondary = hasSecondary ? parseFloat(secondaryIncome) || 0 : 0;
  const totalMonthlyInflow = numSalary + numSecondary;
  const plannedSavingsAmount = (totalMonthlyInflow * targetSavingsPercent) / 100;
  const availableSpendingBudget = Math.max(0, totalMonthlyInflow - plannedSavingsAmount);
  const estimatedDailyAllowance = Math.round(availableSpendingBudget / 30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numSalary <= 0) {
      alert('Please enter a valid primary income amount');
      return;
    }

    const updated: IncomeProfile = {
      isConfigured: true,
      monthlySalary: numSalary,
      sourceName: sourceName.trim() || 'Salary',
      payday,
      secondaryIncome: hasSecondary ? numSecondary : 0,
      secondarySource: hasSecondary ? secondarySource.trim() : undefined,
      targetSavingsPercent,
      lastUpdated: Date.now(),
    };

    onSave(updated, syncToTransactions);
    onClose();
  };

  const PRESET_TIERS = [
    { label: '₹35k', value: '35000' },
    { label: '₹50k', value: '50000' },
    { label: '₹75k', value: '75000' },
    { label: '₹1.2L', value: '120000' },
    { label: '₹2.0L', value: '200000' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-[#141417] w-full max-w-xl rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-zinc-100">
        {/* Header with vibrant fintech gradient */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-white/10 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-black text-xl tracking-tight text-white">
                  Income Baseline Profile
                </h2>
                <p className="text-xs text-emerald-100">
                  Calibrate your safe daily allowance & savings targets
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Monthly Net Take-Home Salary *
              </label>
              <span className="text-[11px] text-slate-400">Quick suggestions:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {PRESET_TIERS.map((tier) => (
                <button
                  key={tier.value}
                  type="button"
                  onClick={() => setSalary(tier.value)}
                  className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all border ${
                    salary === tier.value
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>

            {/* Salary Input */}
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-base font-bold text-slate-400 dark:text-slate-500">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="100"
                required
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="75000"
                className="w-full text-lg pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-emerald-500 dark:focus:border-emerald-400 outline-hidden font-extrabold tabular-nums text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Employer / Source & Payday */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Income Source / Employer
              </label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="e.g. Apex Tech Solutions"
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Payday of Month
              </label>
              <select
                value={payday}
                onChange={(e) => setPayday(parseInt(e.target.value, 10))}
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-hidden focus:border-emerald-500"
              >
                {[1, 2, 3, 5, 7, 10, 15, 20, 25, 28, 30, 31].map((d) => (
                  <option key={d} value={d}>
                    Day {d} of month
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Secondary Income Toggle */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Secondary / Freelance Inflow
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Add consulting, rental, dividends, or side income
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHasSecondary(!hasSecondary)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  hasSecondary ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    hasSecondary ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {hasSecondary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Monthly Secondary Amount ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={secondaryIncome}
                    onChange={(e) => setSecondaryIncome(e.target.value)}
                    placeholder="15000"
                    className="w-full text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold tabular-nums outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Secondary Source Name
                  </label>
                  <input
                    type="text"
                    value={secondarySource}
                    onChange={(e) => setSecondarySource(e.target.value)}
                    placeholder="e.g. Freelance Client"
                    className="w-full text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Target Savings Percentage */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <PiggyBank className="w-3.5 h-3.5 text-indigo-500" />
                Target Monthly Savings Goal: {targetSavingsPercent}%
              </label>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatCurrency(plannedSavingsAmount, currencySymbol)} / month
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={targetSavingsPercent}
              onChange={(e) => setTargetSavingsPercent(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>5% (Casual)</span>
              <span>20% (Recommended)</span>
              <span>40% (Aggressive)</span>
              <span>60% (F.I.R.E)</span>
            </div>
          </div>

          {/* Real-time Calculation Summary Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 via-slate-50 to-emerald-50 dark:from-slate-800 dark:via-indigo-950/40 dark:to-slate-800 border border-indigo-100 dark:border-indigo-900/60 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
              Live Financial Projection
            </span>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Total Inflow</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(totalMonthlyInflow, currencySymbol)}
                </span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Planned Savings</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatCurrency(plannedSavingsAmount, currencySymbol)}
                </span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Daily Spend Limit</span>
                <span className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {formatCurrency(estimatedDailyAllowance, currencySymbol)}/day
                </span>
              </div>
            </div>
          </div>

          {/* Sync Checkbox */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="sync-to-transactions"
              checked={syncToTransactions}
              onChange={(e) => setSyncToTransactions(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
            />
            <label
              htmlFor="sync-to-transactions"
              className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Log this salary as an active transaction in records for this month
              </span>{' '}
              (helps calibrate your net balance and cash flow charts immediately).
            </label>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-md transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Activate Income Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
