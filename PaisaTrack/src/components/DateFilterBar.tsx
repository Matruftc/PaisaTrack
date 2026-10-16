import React, { useState } from 'react';
import { Calendar, RotateCcw, SlidersHorizontal, Sparkles } from 'lucide-react';
import { DateFilterPreset, DateFilterRange } from '../types/finance';
import { getPresetDateRange } from '../utils/formatters';

interface DateFilterBarProps {
  filter: DateFilterRange;
  onChangeFilter: (newFilter: DateFilterRange) => void;
  filteredCount: number;
  totalCount: number;
}

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  filter,
  onChangeFilter,
  filteredCount,
  totalCount,
}) => {
  const [isCustomExpanded, setIsCustomExpanded] = useState<boolean>(filter.preset === 'custom');
  const [customStart, setCustomStart] = useState<string>(filter.startDate || '');
  const [customEnd, setCustomEnd] = useState<string>(filter.endDate || '');

  const presets: { id: DateFilterPreset; label: string; emoji: string }[] = [
    { id: 'all', label: 'All Records', emoji: '⚡' },
    { id: 'today', label: 'Today', emoji: '✨' },
    { id: 'yesterday', label: 'Yesterday', emoji: '⏮️' },
    { id: 'this_week', label: 'This Week', emoji: '🗓️' },
    { id: 'this_month', label: 'This Month', emoji: '🎯' },
    { id: 'last_month', label: 'Last Month', emoji: '⏳' },
    { id: 'this_year', label: 'This Year', emoji: '🚀' },
    { id: 'custom', label: 'Custom Dates', emoji: '📅' },
  ];

  const handleSelectPreset = (preset: DateFilterPreset) => {
    if (preset === 'custom') {
      setIsCustomExpanded(true);
      onChangeFilter({
        preset: 'custom',
        startDate: customStart,
        endDate: customEnd,
      });
    } else {
      setIsCustomExpanded(false);
      onChangeFilter({ preset });
    }
  };

  const handleApplyCustom = () => {
    onChangeFilter({
      preset: 'custom',
      startDate: customStart || undefined,
      endDate: customEnd || undefined,
    });
  };

  const handleReset = () => {
    setCustomStart('');
    setCustomEnd('');
    setIsCustomExpanded(false);
    onChangeFilter({ preset: 'all' });
  };

  const handleQuickPastDays = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const startStr = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
    const endStr = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;
    setCustomStart(startStr);
    setCustomEnd(endStr);
    onChangeFilter({
      preset: 'custom',
      startDate: startStr,
      endDate: endStr,
    });
  };

  const getActiveRangeDescription = () => {
    if (filter.preset === 'all') return 'Showing all recorded expenses & income';
    if (filter.preset !== 'custom') {
      const { startDate, endDate } = getPresetDateRange(filter.preset);
      return `Active Window: ${startDate} to ${endDate}`;
    }
    if (filter.startDate && filter.endDate) {
      return `Custom: ${filter.startDate} → ${filter.endDate}`;
    }
    if (filter.startDate) return `From ${filter.startDate} onwards`;
    if (filter.endDate) return `Up to ${filter.endDate}`;
    return 'Custom range active';
  };

  return (
    <div className="relative rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl p-3 sm:p-4 shadow-xl shadow-slate-200/50 dark:shadow-black/30 transition-all">
      {/* Top Header & Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Edge-Faded Horizontal Scrollable Pill Strip */}
        <div className="relative flex-1 overflow-hidden">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none py-0.5">
            {presets.map((p) => {
              const isActive = filter.preset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                      : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700/80 border border-slate-200/60 dark:border-white/5'
                  }`}
                >
                  <span className="text-[11px] leading-none">{p.emoji}</span>
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status & Reset */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-xs text-slate-500 dark:text-zinc-400">
          <span className="font-mono text-[11px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/10 tabular-nums">
            {filteredCount} / {totalCount} records
          </span>
          {filter.preset !== 'all' && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white font-bold transition-colors cursor-pointer"
              title="Reset date filter"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Custom Date Window Expanded Drawer */}
      {isCustomExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-white/5 p-3.5 rounded-2xl animate-in fade-in zoom-in-98 duration-150">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
              Custom Date Window:
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-1">
                <span className="text-slate-400 text-[11px]">From</span>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="text-xs text-slate-800 dark:text-zinc-100 bg-transparent focus:outline-hidden font-mono"
                />
              </div>
              <span className="text-slate-400">to</span>
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-1">
                <span className="text-slate-400 text-[11px]">To</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="text-xs text-slate-800 dark:text-zinc-100 bg-transparent focus:outline-hidden font-mono"
                />
              </div>
            </div>
            <button
              onClick={handleApplyCustom}
              className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold rounded-xl shadow-xs hover:opacity-95 active:scale-95 transition-all"
            >
              Apply Filter
            </button>
          </div>

          <div className="flex items-center gap-1.5 self-start md:self-center">
            <span className="text-slate-400 text-[11px]">Shortcuts:</span>
            <button
              onClick={() => handleQuickPastDays(7)}
              className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-[11px] font-semibold transition-colors"
            >
              Past 7 Days
            </button>
            <button
              onClick={() => handleQuickPastDays(30)}
              className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-[11px] font-semibold transition-colors"
            >
              Past 30 Days
            </button>
          </div>
        </div>
      )}

      {/* Quiet Status Label */}
      <div className="mt-2 text-[10px] font-mono text-slate-400 dark:text-zinc-500 flex items-center justify-between px-1">
        <span>{getActiveRangeDescription()}</span>
      </div>
    </div>
  );
};
