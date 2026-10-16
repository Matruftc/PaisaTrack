import React, { useState } from 'react';
import { PieChart, TrendingUp, ArrowDownLeft, ArrowUpRight, Flame, Calendar, Sparkles } from 'lucide-react';
import { Transaction } from '../types/finance';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency, getCategoryInfo } from '../utils/formatters';

interface AnalyticsSectionProps {
  transactions: Transaction[];
  currencySymbol?: string;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  transactions,
  currencySymbol = '₹',
}) => {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  // 1. Category Totals for Donut & Progress bars
  const categoryTotals: Record<string, { total: number; count: number }> = {};
  let totalExpenses = 0;
  let totalIncome = 0;

  for (const t of transactions) {
    if (t.type === 'expense') {
      totalExpenses += t.amount;
      if (!categoryTotals[t.category]) {
        categoryTotals[t.category] = { total: 0, count: 0 };
      }
      categoryTotals[t.category].total += t.amount;
      categoryTotals[t.category].count += 1;
    } else {
      totalIncome += t.amount;
    }
  }

  const sortedCategories = Object.entries(categoryTotals)
    .map(([cat, data]) => ({
      category: cat,
      amount: data.total,
      count: data.count,
      percent: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
      color: getCategoryInfo(cat).color || '#6366f1',
    }))
    .sort((a, b) => b.amount - a.amount);

  // 2. 7-Day Spending Trend (Mon - Sun)
  const getWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    // Monday as start of week: Sun is 0 (diff -6), Mon is 1 (diff 0), Tue is 2 (diff -1), etc.
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMon);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const isWeekend = i === 5 || i === 6; // Sat, Sun
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      // Sum all debits matching this date across loaded transactions
      const dayDebit = transactions
        .filter((t) => t.type === 'expense' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);

      const count = transactions.filter((t) => t.type === 'expense' && t.date === dateStr).length;

      week.push({
        dayIndex: i,
        dayLabel: dayNames[i],
        dateStr,
        formattedDate: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`,
        isWeekend,
        isToday,
        totalDebit: dayDebit,
        count,
      });
    }

    return week;
  };

  const weekData = getWeekDates();
  const maxDebit = Math.max(...weekData.map((w) => w.totalDebit), 1);
  const weekendSplurgeTotal = weekData
    .filter((w) => w.isWeekend)
    .reduce((sum, w) => sum + w.totalDebit, 0);
  const weekdayTotal = weekData
    .filter((w) => !w.isWeekend)
    .reduce((sum, w) => sum + w.totalDebit, 0);

  // 3. Compact Donut Chart Geometry (Radius 38, Box 100x100)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  const donutSlices = sortedCategories.slice(0, 5).map((cat) => {
    const arcLength = (cat.percent / 100) * circumference;
    const slice = {
      category: cat.category,
      color: cat.color,
      dasharray: `${arcLength} ${circumference}`,
      dashoffset: -accumulatedOffset,
      percent: cat.percent,
    };
    accumulatedOffset += arcLength;
    return slice;
  });

  const cashFlowMax = Math.max(totalIncome, totalExpenses, 1);
  const incomeWidth = Math.round((totalIncome / cashFlowMax) * 100);
  const expenseWidth = Math.round((totalExpenses / cashFlowMax) * 100);

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Category Breakdown with Donut Chart (7 Cols) */}
      <div className="lg:col-span-7 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/30 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h3 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                Spending Distribution
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold tabular-nums">
              Total Outflow: <span className="text-rose-600 dark:text-[#f43f5e] font-extrabold">{formatCurrency(totalExpenses, currencySymbol)}</span>
            </span>
          </div>

          {sortedCategories.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-zinc-500 py-10 text-center font-mono">
              No expense records in this timeframe.
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* SVG Donut Chart with Centered Metric */}
              <div className="relative shrink-0 flex items-center justify-center">
                <svg className="w-32 h-32 -rotate-90 transform" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="11"
                    className="text-slate-200 dark:text-zinc-800/80 fill-transparent"
                  />

                  {/* Category Slices */}
                  {donutSlices.map((slice, idx) => (
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke={slice.color}
                      strokeWidth="11"
                      strokeDasharray={slice.dasharray}
                      strokeDashoffset={slice.dashoffset}
                      className="fill-transparent transition-all duration-700 ease-out"
                    />
                  ))}
                </svg>

                {/* Donut Hole Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                    DEBIT
                  </span>
                  <span className="font-sans font-black text-sm text-slate-900 dark:text-white tracking-[-0.02em] tabular-nums">
                    {formatCurrency(totalExpenses, currencySymbol).replace('.00', '')}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400">
                    {sortedCategories.length} {sortedCategories.length === 1 ? 'cat' : 'cats'}
                  </span>
                </div>
              </div>

              {/* Category Badges & Progress Bars */}
              <div className="flex-1 w-full space-y-3">
                {sortedCategories.slice(0, 4).map((item) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <CategoryIcon category={item.category} size="sm" />
                        <span className="font-bold text-slate-800 dark:text-zinc-200 truncate">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono shrink-0">
                          ({item.count})
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                          {formatCurrency(item.amount, currencySymbol)}
                        </span>
                        <span className="text-slate-400 dark:text-zinc-400 ml-1.5 font-mono text-[10px]">
                          {item.percent.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-zinc-800/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percent}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 mt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-500">
          <span>Top Share: {sortedCategories[0]?.category || 'None'}</span>
          <span className="text-cyan-600 dark:text-cyan-400 font-bold">
            {sortedCategories[0]?.percent.toFixed(0) || 0}% of all debits
          </span>
        </div>
      </div>

      {/* 7-Day Spending Trend Bar Chart (5 Cols) */}
      <div className="lg:col-span-5 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/30 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <h3 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                7-Day Spending Trend
              </h3>
            </div>
            {weekendSplurgeTotal > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-2 py-0.5 rounded-full font-bold">
                <Flame className="w-3 h-3 text-rose-500 dark:text-rose-400" />
                Weekend Splurge
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
            Debits across Mon–Sun. <span className="text-rose-600 dark:text-rose-400 font-bold">Weekends</span> highlighted in vivid coral.
          </p>

          {/* 7-Day Bar Chart Track */}
          <div className="pt-4 pb-2">
            <div className="grid grid-cols-7 gap-2 items-end h-28 px-1">
              {weekData.map((day) => {
                const heightPercent = maxDebit > 0 ? Math.round((day.totalDebit / maxDebit) * 100) : 0;
                const isHovered = hoveredDay === day.dateStr;

                return (
                  <div
                    key={day.dayLabel}
                    onMouseEnter={() => setHoveredDay(day.dateStr)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="flex flex-col items-center justify-end h-full group cursor-pointer relative"
                  >
                    {/* Tooltip on Hover */}
                    {isHovered && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 bg-slate-900 dark:bg-zinc-950 border border-slate-700 dark:border-white/20 text-white text-[10px] font-mono px-2 py-1 rounded-md shadow-xl whitespace-nowrap animate-in fade-in duration-150">
                        <span className="font-bold">{day.formattedDate}:</span>{' '}
                        {formatCurrency(day.totalDebit, currencySymbol)}
                      </div>
                    )}

                    {/* Bar Pillar */}
                    <div className="w-full flex justify-center items-end h-full">
                      <div
                        className={`w-full max-w-[28px] rounded-lg transition-all duration-300 ${
                          day.isWeekend
                            ? day.totalDebit > 0
                              ? 'bg-gradient-to-t from-rose-600 via-[#f43f5e] to-[#fb7185] shadow-md shadow-rose-500/30 group-hover:scale-105'
                              : 'bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/30'
                            : day.totalDebit > 0
                            ? 'bg-gradient-to-t from-slate-400 to-slate-600 dark:from-zinc-700 dark:to-slate-400 group-hover:from-indigo-600 group-hover:to-cyan-400 group-hover:scale-105'
                            : 'bg-slate-200 dark:bg-zinc-800/60'
                        }`}
                        style={{
                          height: day.totalDebit > 0 ? `${Math.max(14, heightPercent)}%` : '6px',
                        }}
                      />
                    </div>

                    {/* Day Label & Dot */}
                    <div className="mt-2 text-center">
                      <span
                        className={`text-[11px] font-bold block ${
                          day.isToday
                            ? 'text-cyan-600 dark:text-cyan-400 font-extrabold'
                            : day.isWeekend
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        {day.dayLabel}
                      </span>
                      {day.isToday && (
                        <span className="w-1 h-1 rounded-full bg-cyan-500 dark:bg-cyan-400 mx-auto block mt-0.5" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend / Metrics Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-rose-500" />
            <span>Weekend: {formatCurrency(weekendSplurgeTotal, currencySymbol).replace('.00', '')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-slate-400" />
            <span>Weekdays: {formatCurrency(weekdayTotal, currencySymbol).replace('.00', '')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
