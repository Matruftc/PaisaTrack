import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  incomeCount: number;
  expenseCount: number;
  currencySymbol?: string;
  monthlyBudget?: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalIncome,
  totalExpense,
  netBalance,
  incomeCount,
  expenseCount,
  currencySymbol = '₹',
  monthlyBudget,
}) => {
  const now = new Date();
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthElapsedPercent = Math.min(100, Math.round((currentDay / daysInMonth) * 100));
  const benchmarkBudget =
    monthlyBudget && monthlyBudget > 0
      ? monthlyBudget
      : totalIncome > 0
      ? totalIncome
      : 35000;
  const budgetUsedPercent = Math.round((totalExpense / benchmarkBudget) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Net Balance Card with Quick Budget Burn-Down Bar */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/40 transition-all hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-white/20 flex flex-col justify-between">
        {/* Subtle ambient violet aura */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 dark:bg-violet-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Net Surplus / Cash
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-700/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
              <Wallet className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div
              className={`font-sans font-black text-2xl sm:text-3xl lg:text-4xl tracking-[-0.03em] tabular-nums ${
                netBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-[#f43f5e]'
              }`}
              title={formatCurrency(netBalance, currencySymbol)}
            >
              {formatCurrency(netBalance, currencySymbol)}
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 truncate">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
              <span className="truncate">
                {netBalance >= 0 ? 'Retained surplus across records' : 'Overdraft / Expenses exceed inflow'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Budget Burn-Down Bar */}
        <div className="relative z-10 mt-4 pt-3.5 border-t border-slate-200 dark:border-white/10 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono leading-none">
            <span className="text-slate-500 dark:text-zinc-400">
              Day {currentDay} of {daysInMonth} · {monthElapsedPercent}% elapsed
            </span>
            <span
              className={`font-bold ${
                budgetUsedPercent > monthElapsedPercent ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {budgetUsedPercent}% budget used
            </span>
          </div>

          {/* Interactive dual-tone progress track */}
          <div className="relative w-full bg-slate-200 dark:bg-zinc-800/90 h-2 rounded-full overflow-hidden">
            {/* Month elapsed watermark */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-slate-300/60 dark:bg-white/10 rounded-full"
              style={{ width: `${monthElapsedPercent}%` }}
              title={`${monthElapsedPercent}% of month elapsed`}
            />
            {/* Budget used bar */}
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                budgetUsedPercent > 100
                  ? 'bg-rose-500 shadow-xs shadow-rose-500/50'
                  : budgetUsedPercent > monthElapsedPercent
                  ? 'bg-amber-500 dark:bg-amber-400'
                  : 'bg-gradient-to-r from-emerald-500 to-lime-500 dark:from-emerald-400 dark:to-lime-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(2, budgetUsedPercent))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Total Income Card - Electric Lime / Neon Mint */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/40 transition-all hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-white/20 flex flex-col justify-between">
        {/* Subtle ambient lime aura */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/10 dark:bg-lime-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Total Inflow
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-700/50 text-emerald-600 dark:text-lime-300 flex items-center justify-center shadow-xs">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div
              className="font-sans font-black text-2xl sm:text-3xl lg:text-4xl tracking-[-0.03em] tabular-nums text-emerald-600 dark:text-[#10b981]"
              title={formatCurrency(totalIncome, currencySymbol)}
            >
              {formatCurrency(totalIncome, currencySymbol)}
            </div>

            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 truncate">
              {incomeCount} credit {incomeCount === 1 ? 'record' : 'records'} in active window
            </p>
          </div>
        </div>

        {/* Subtle credit health tag */}
        <div className="relative z-10 mt-4 pt-3.5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400">
          <span>Inflow Health</span>
          <span className="text-emerald-600 dark:text-lime-300 font-bold">
            {incomeCount > 0 ? 'Verified Inflows' : 'No Inflow Logged'}
          </span>
        </div>
      </div>

      {/* Total Expenses Card - Vivid Coral / Hot Punch */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/40 transition-all hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-white/20 flex flex-col justify-between">
        {/* Subtle ambient coral aura */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-[#fb7185] flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Total Outflow
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-700/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div
              className="font-sans font-black text-2xl sm:text-3xl lg:text-4xl tracking-[-0.03em] tabular-nums text-rose-600 dark:text-[#f43f5e]"
              title={formatCurrency(totalExpense, currencySymbol)}
            >
              {formatCurrency(totalExpense, currencySymbol)}
            </div>

            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 truncate">
              {expenseCount} debit {expenseCount === 1 ? 'record' : 'records'} in active window
            </p>
          </div>
        </div>

        {/* Subtle outflow velocity tag */}
        <div className="relative z-10 mt-4 pt-3.5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400">
          <span>Burn Velocity</span>
          <span className="text-rose-600 dark:text-[#fb7185] font-bold">
            {expenseCount > 0
              ? `${formatCurrency(Math.round(totalExpense / Math.max(1, currentDay)), currencySymbol)}/day avg`
              : '₹0/day'}
          </span>
        </div>
      </div>
    </div>
  );
};

