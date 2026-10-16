import React, { useState } from 'react';
import {
  Coins,
  Sparkles,
  Settings2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { IncomeProfile } from '../types/finance';
import { SafeSpendDial } from './SafeSpendDial';

interface IncomeSectionProps {
  incomeProfile: IncomeProfile;
  onOpenIncomeModal: () => void;
  onQuickConfigureDefault: () => void;
  currentMonthExpenses: number;
  currencySymbol?: string;
}

export const IncomeSection: React.FC<IncomeSectionProps> = ({
  incomeProfile,
  onOpenIncomeModal,
  onQuickConfigureDefault,
  currentMonthExpenses,
  currencySymbol = '₹',
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const totalMonthlyInflow =
    incomeProfile.monthlySalary + (incomeProfile.secondaryIncome || 0);

  const targetSavingsAmount =
    (totalMonthlyInflow * (incomeProfile.targetSavingsPercent || 20)) / 100;

  const totalAvailableForSpending = Math.max(
    0,
    totalMonthlyInflow - targetSavingsAmount
  );

  const remainingSpendable = Math.max(
    0,
    totalAvailableForSpending - currentMonthExpenses
  );

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);

  const safeDailySpend = Math.round(remainingSpendable / daysRemaining);

  // Unconfigured state: Sleek, compact floating banner with dismissal
  if (!incomeProfile.isConfigured) {
    if (isDismissed) return null;

    return (
      <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-emerald-500/30 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white dark:from-zinc-950 dark:via-slate-900 dark:to-emerald-950/80 text-slate-900 dark:text-white shadow-xl shadow-slate-200/50 dark:shadow-black/40 backdrop-blur-xl animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 to-lime-400 text-slate-950 flex items-center justify-center font-black text-lg shrink-0 shadow-md shadow-emerald-500/20">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                  Calibrate Your Income Baseline
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Set your monthly salary to unlock the <strong className="text-emerald-700 dark:text-lime-300 font-semibold">Guilt-Free Daily Allowance Dial</strong> and savings projections.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={onOpenIncomeModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-lime-400 hover:opacity-95 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>Set Income</span>
            </button>
            <button
              onClick={onQuickConfigureDefault}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300/80 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white dark:border-white/15 font-semibold text-xs transition-colors cursor-pointer"
            >
              ₹75k Default
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Dismiss for now"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Configured state: Show sleek Safe-to-Spend Dial with toggle
  return (
    <div className="space-y-3">
      {/* Header Bar with Toggle */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
            Smart Financial Dial
          </span>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-lime-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Inflow: {currencySymbol}{(totalMonthlyInflow / 1000).toFixed(0)}k/mo
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenIncomeModal}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-md transition-colors"
            title={isExpanded ? 'Collapse Dial' : 'Expand Dial'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Dial Content */}
      {isExpanded && (
        <SafeSpendDial
          safeDailyAmount={safeDailySpend}
          totalMonthlyInflow={totalMonthlyInflow}
          currentMonthExpenses={currentMonthExpenses}
          currencySymbol={currencySymbol}
          targetSavingsPercent={incomeProfile.targetSavingsPercent}
        />
      )}
    </div>
  );
};
