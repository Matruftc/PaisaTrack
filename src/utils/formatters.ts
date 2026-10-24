import { DEFAULT_CATEGORIES } from '../constants/categories';
import { DateFilterPreset, DateFilterRange, Transaction } from '../types/finance';

/**
 * Formats a number according to Indian Currency notation (e.g. ₹ 1,45,200.00)
 */
export function formatCurrency(amount: number, symbol = '₹'): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absVal);

  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

/**
 * Friendly date label (Today, Yesterday, or formatted date like "Fri, 16 Oct 2026")
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  
  const today = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

  if (dateStr === todayStr) {
    return 'Today';
  }
  if (dateStr === yesterdayStr) {
    return 'Yesterday';
  }

  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(dateObj);
  } catch {
    return dateStr;
  }
}

/**
 * Gets active date range for a custom monthly pay/salary cycle (e.g. 15th of month to 15th of next month).
 */
export function getMonthlyCycleRange(cycleStartDay: number = 15): { startDate: string; endDate: string } {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11
  const day = now.getDate();

  let startYear = year;
  let startMonth = month;

  if (day < cycleStartDay) {
    startMonth = month - 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear = year - 1;
    }
  }

  const daysInStartMonth = new Date(startYear, startMonth + 1, 0).getDate();
  const actualStartDay = Math.min(cycleStartDay, daysInStartMonth);
  const startDateObj = new Date(startYear, startMonth, actualStartDay);

  let endYear = startYear;
  let endMonth = startMonth + 1;
  if (endMonth > 11) {
    endMonth = 0;
    endYear = startYear + 1;
  }
  const daysInEndMonth = new Date(endYear, endMonth + 1, 0).getDate();
  const actualEndDay = Math.min(cycleStartDay, daysInEndMonth);
  const endDateObj = new Date(endYear, endMonth, actualEndDay);

  return {
    startDate: formatDate(startDateObj),
    endDate: formatDate(endDateObj),
  };
}

/**
 * Gets the start and end dates for a preset filter.
 */
export function getPresetDateRange(preset: DateFilterPreset): { startDate?: string; endDate?: string } {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const todayStr = formatDate(now);

  if (preset === 'all') {
    return {};
  }

  if (preset === 'today') {
    return { startDate: todayStr, endDate: todayStr };
  }

  if (preset === 'yesterday') {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    const yStr = formatDate(y);
    return { startDate: yStr, endDate: yStr };
  }

  if (preset === 'this_week') {
    const day = now.getDay(); // 0 is Sun, 1 is Mon
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const startOfWeek = new Date(now);
    startOfWeek.setDate(diff);
    return { startDate: formatDate(startOfWeek), endDate: todayStr };
  }

  if (preset === 'this_month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startDate: formatDate(startOfMonth), endDate: formatDate(endOfMonth) };
  }

  if (preset === 'last_month') {
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    return { startDate: formatDate(startOfLastMonth), endDate: formatDate(endOfLastMonth) };
  }

  if (preset === 'this_year') {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    return { startDate: formatDate(startOfYear), endDate: formatDate(endOfYear) };
  }

  return {};
}

/**
 * Filters a list of transactions based on date filter configuration.
 */
export function filterTransactionsByDate(transactions: Transaction[], filter: DateFilterRange): Transaction[] {
  if (filter.preset === 'all' && !filter.startDate && !filter.endDate) {
    return transactions;
  }

  let { startDate, endDate } = filter;
  if (filter.preset !== 'custom') {
    const range = getPresetDateRange(filter.preset);
    startDate = range.startDate;
    endDate = range.endDate;
  }

  return transactions.filter((t) => {
    if (startDate && t.date < startDate) return false;
    if (endDate && t.date > endDate) return false;
    return true;
  });
}

/**
 * Gets category information by name
 */
export function getCategoryInfo(name: string) {
  const match = DEFAULT_CATEGORIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
  if (match) return match;
  return DEFAULT_CATEGORIES.find((c) => c.id === 'other') || DEFAULT_CATEGORIES[0];
}

export interface UpiAppOrigin {
  name: string;
  shortName: string;
  badgeBg: string;
  textColor: string;
  dotColor: string;
}

/**
 * Detects UPI origin platform based on VPA handle suffix
 * e.g., @okhdfcbank -> Google Pay, @ybl -> PhonePe, @paytm -> Paytm, @apl -> Amazon Pay, @icici -> iMobile
 */
export function getUpiAppOriginInfo(vpa?: string): UpiAppOrigin | null {
  if (!vpa || !vpa.includes('@')) return null;
  const parts = vpa.toLowerCase().split('@');
  const handle = parts[1] || '';
  if (!handle) return null;

  if (
    handle.startsWith('okhdfcbank') ||
    handle.startsWith('okaxis') ||
    handle.startsWith('oksbi') ||
    handle.startsWith('okicici') ||
    handle.startsWith('gpay')
  ) {
    return {
      name: 'Google Pay',
      shortName: 'GPay',
      badgeBg: 'bg-blue-500/10 border-blue-500/25',
      textColor: 'text-blue-600 dark:text-blue-400',
      dotColor: 'bg-blue-400',
    };
  }

  if (
    handle.includes('ybl') ||
    handle.includes('ibl') ||
    handle.includes('axl') ||
    handle.includes('phonepe')
  ) {
    return {
      name: 'PhonePe',
      shortName: 'PhonePe',
      badgeBg: 'bg-purple-500/10 border-purple-500/25',
      textColor: 'text-purple-700 dark:text-purple-300',
      dotColor: 'bg-purple-400',
    };
  }

  if (handle.includes('paytm') || handle.includes('ptaxis') || handle.includes('ptyes')) {
    return {
      name: 'Paytm',
      shortName: 'Paytm',
      badgeBg: 'bg-cyan-500/10 border-cyan-500/25',
      textColor: 'text-cyan-700 dark:text-cyan-400',
      dotColor: 'bg-cyan-400',
    };
  }

  if (handle.includes('apl') || handle.includes('rapl') || handle.includes('amazon')) {
    return {
      name: 'Amazon Pay',
      shortName: 'Amazon',
      badgeBg: 'bg-amber-500/10 border-amber-500/25',
      textColor: 'text-amber-700 dark:text-amber-400',
      dotColor: 'bg-amber-400',
    };
  }

  if (handle.includes('icici')) {
    return {
      name: 'iMobile (ICICI)',
      shortName: 'iMobile',
      badgeBg: 'bg-orange-500/10 border-orange-500/25',
      textColor: 'text-orange-700 dark:text-orange-400',
      dotColor: 'bg-orange-400',
    };
  }

  if (handle.includes('hdfcbank') || handle.includes('hdfc')) {
    return {
      name: 'HDFC Bank',
      shortName: 'HDFC',
      badgeBg: 'bg-sky-500/10 border-sky-500/25',
      textColor: 'text-sky-700 dark:text-sky-400',
      dotColor: 'bg-sky-400',
    };
  }

  if (handle.includes('axisbank') || handle.includes('axis')) {
    return {
      name: 'Axis Mobile',
      shortName: 'Axis',
      badgeBg: 'bg-rose-500/10 border-rose-500/25',
      textColor: 'text-rose-700 dark:text-rose-400',
      dotColor: 'bg-rose-400',
    };
  }

  if (handle.includes('sbi') || handle.includes('sbiupi')) {
    return {
      name: 'BHIM SBI',
      shortName: 'SBI Pay',
      badgeBg: 'bg-blue-600/10 border-blue-600/25',
      textColor: 'text-blue-700 dark:text-blue-300',
      dotColor: 'bg-blue-400',
    };
  }

  if (handle.includes('cred')) {
    return {
      name: 'CRED UPI',
      shortName: 'CRED',
      badgeBg: 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-600',
      textColor: 'text-slate-800 dark:text-zinc-200',
      dotColor: 'bg-white',
    };
  }

  if (handle.includes('upi')) {
    return {
      name: 'BHIM UPI',
      shortName: 'BHIM',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/25',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      dotColor: 'bg-emerald-400',
    };
  }

  return {
    name: `@${handle}`,
    shortName: `@${handle}`,
    badgeBg: 'bg-slate-100 dark:bg-zinc-800/80 border-slate-200 dark:border-white/10',
    textColor: 'text-slate-600 dark:text-zinc-400',
    dotColor: 'bg-zinc-500',
  };
}
