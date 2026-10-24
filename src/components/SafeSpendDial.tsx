import React from 'react';
import { Sparkles, Flame, ShieldAlert, Rocket, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { AnimatedCounter } from './AnimatedCounter';

interface SafeSpendDialProps {
  safeDailyAmount: number;
  totalMonthlyInflow: number;
  currentMonthExpenses: number;
  currencySymbol?: string;
  targetSavingsPercent?: number;
}

export const SafeSpendDial: React.FC<SafeSpendDialProps> = ({
  safeDailyAmount,
  totalMonthlyInflow,
  currentMonthExpenses,
  currencySymbol = '₹',
  targetSavingsPercent = 20,
}) => {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);

  // Available spending budget after planned savings
  const targetSavings = (totalMonthlyInflow * targetSavingsPercent) / 100;
  const availableBudget = Math.max(0, totalMonthlyInflow - targetSavings);
  const remainingBudget = Math.max(0, availableBudget - currentMonthExpenses);

  // Spend ratio (0 to 100)
  const budgetRatio = availableBudget > 0 ? (remainingBudget / availableBudget) * 100 : 0;

  // Gen-Z status badge calculation
  let statusBadge = {
    label: 'Healthy Vibing ✨',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:text-lime-300 dark:border-emerald-500/30',
    description: 'Safe daily spend is well-calibrated. Enjoy guilt-free!',
    ringGradient: 'url(#limeMintGlow)',
    glowClass: 'shadow-emerald-500/20',
  };

  if (currentMonthExpenses > availableBudget) {
    statusBadge = {
      label: 'Down Bad 💀',
      color: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
      description: 'Monthly spend exceeded allowance! Tap the brakes.',
      ringGradient: 'url(#hotPunchGlow)',
      glowClass: 'shadow-rose-500/20',
    };
  } else if (budgetRatio > 75) {
    statusBadge = {
      label: 'Saving Spree 🚀',
      color: 'bg-cyan-50 text-cyan-800 border-cyan-300 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30',
      description: 'You are retaining massive surplus this month!',
      ringGradient: 'url(#cyanLimeGlow)',
      glowClass: 'shadow-cyan-500/20',
    };
  } else if (budgetRatio < 30) {
    statusBadge = {
      label: 'Locked In 🎯',
      color: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
      description: 'Entering tight territory. Watch spontaneous UPI taps.',
      ringGradient: 'url(#amberPunchGlow)',
      glowClass: 'shadow-amber-500/20',
    };
  }

  // Circular ring calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, budgetRatio)) / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-3xl p-5 border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 transition-all hover:border-slate-300 dark:hover:border-white/20">
      {/* Soft background ambient glow */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
        {/* Left: Interactive Ring Dial */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg className="w-32 h-32 -rotate-90 transform" viewBox="0 0 128 128">
            <defs>
              <linearGradient id="limeMintGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#a3e635" />
              </linearGradient>
              <linearGradient id="cyanLimeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="hotPunchGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
              <linearGradient id="amberPunchGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>

            {/* Background track */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="9"
              className="text-slate-200 dark:text-zinc-800/80 fill-transparent"
            />

            {/* Glowing progress ring */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke={statusBadge.ringGradient}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="fill-transparent transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Centered Dial Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-400">
              Daily
            </span>
            <span className="font-sans font-black text-xl sm:text-2xl text-slate-900 dark:text-white tracking-[-0.03em] tabular-nums">
              <AnimatedCounter
                value={safeDailyAmount}
                currencySymbol={currencySymbol}
                decimals={0}
                duration={1800}
              />
            </span>
            <span className="text-[9px] font-semibold text-slate-400 dark:text-zinc-500">
              /day allowance
            </span>
          </div>
        </div>

        {/* Right: Info & Gen-Z Status Pill */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide border shadow-xs transition-transform hover:scale-105 ${statusBadge.color}`}
            >
              {statusBadge.label}
            </span>
            <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
              {daysRemaining} days left in {now.toLocaleString('default', { month: 'short' })}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-zinc-100">
            Guilt-Free Spending Dial
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            {statusBadge.description}
          </p>

          <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-600 dark:text-zinc-300">
            <div>
              <span className="text-slate-400 dark:text-zinc-500 text-[11px]">Spend Cushion: </span>
              <strong className="font-bold text-slate-900 dark:text-white tabular-nums">
                <AnimatedCounter value={remainingBudget} currencySymbol={currencySymbol} duration={1800} />
              </strong>
            </div>
            <span>·</span>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 text-[11px]">Spent So Far: </span>
              <strong className="font-bold text-rose-500 tabular-nums">
                <AnimatedCounter value={currentMonthExpenses} currencySymbol={currencySymbol} duration={1800} />
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
