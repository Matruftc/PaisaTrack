import { Transaction, IncomeProfile, ThemeMode } from '../types/finance';

const STORAGE_KEY = 'paisatrack_transactions_v1';
const SETTINGS_KEY = 'paisatrack_settings_v1';
const INCOME_KEY = 'paisatrack_income_v1';
const THEME_KEY = 'paisatrack_theme_v1';

export interface AppSettings {
  currencySymbol: string;
  currencyCode: string;
  monthlyBudget: number;
  defaultUpiId?: string;
  defaultPayeeName?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  currencySymbol: '₹',
  currencyCode: 'INR',
  monthlyBudget: 35000,
  defaultUpiId: 'matru@okhdfcbank',
  defaultPayeeName: 'Matru',
};

export const INITIAL_SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Swiggy Food Delivery',
    amount: 380,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-10-16',
    time: '13:15',
    paymentMethod: 'UPI',
    upiDetails: {
      vpa: 'swiggy.pay@icici',
      refNumber: '429381928192',
      payeeName: 'Swiggy Bundl',
    },
    notes: 'Lunch paneer thali combo',
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'tx-2',
    title: 'Starbucks Coffee',
    amount: 345,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-10-16',
    time: '09:40',
    paymentMethod: 'UPI',
    upiDetails: {
      vpa: 'starbucks@okhdfcbank',
      refNumber: '429184719283',
      payeeName: 'Tata Starbucks Pvt Ltd',
    },
    notes: 'Morning iced Americano with cookie',
    createdAt: Date.now() - 3600000 * 6,
    updatedAt: Date.now() - 3600000 * 6,
  },
  {
    id: 'tx-3',
    title: 'Uber Cab Ride',
    amount: 235,
    type: 'expense',
    category: 'Travel & Transport',
    date: '2026-10-15',
    time: '18:50',
    paymentMethod: 'UPI',
    upiDetails: {
      vpa: 'uber.pay@hdfcbank',
      refNumber: '428819201948',
      payeeName: 'Uber India Systems',
    },
    notes: 'Ride back home from client office',
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'tx-4',
    title: 'Blinkit Instant Grocery',
    amount: 720,
    type: 'expense',
    category: 'Groceries & Essentials',
    date: '2026-10-14',
    time: '20:10',
    paymentMethod: 'UPI',
    upiDetails: {
      vpa: 'blinkit.groceries@icici',
      refNumber: '427194819284',
      payeeName: 'Blinkit Commerce',
    },
    notes: 'Organic milk, bread, fruits & yogurt',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'tx-5',
    title: 'Monthly Salary Credit',
    amount: 75000,
    type: 'income',
    category: 'Salary & Earnings',
    date: '2026-10-01',
    time: '10:00',
    paymentMethod: 'UPI',
    upiDetails: {
      vpa: 'payroll@hdfcbank',
      refNumber: '420194829104',
      payerName: 'Apex Tech Solutions Pvt Ltd',
    },
    notes: 'October 2026 Salary transfer via UPI ACH',
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 86400000 * 15,
  },
  {
    id: 'tx-6',
    title: 'Bescom Electricity Bill',
    amount: 1450,
    type: 'expense',
    category: 'Bills & Utilities',
    date: '2026-10-10',
    time: '11:20',
    paymentMethod: 'UPI',
    upiDetails: {
      vpa: 'bescom.billpay@sbi',
      refNumber: '425910294812',
      payeeName: 'Bescom Electricity',
    },
    notes: 'September month consumption',
    createdAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now() - 86400000 * 6,
  },
  {
    id: 'tx-7',
    title: 'Freelance UI Design Payout',
    amount: 18500,
    type: 'income',
    category: 'Freelance & Business',
    date: '2026-10-08',
    time: '16:45',
    paymentMethod: 'UPI',
    upiDetails: {
      vpa: 'vikram.client@okaxis',
      refNumber: '424194019281',
      payerName: 'Vikram Mehta Studios',
    },
    notes: 'Landing page design milestone completed',
    createdAt: Date.now() - 86400000 * 8,
    updatedAt: Date.now() - 86400000 * 8,
  },
  {
    id: 'tx-8',
    title: 'Amazon Online Order',
    amount: 1899,
    type: 'expense',
    category: 'Shopping & Retail',
    date: '2026-10-05',
    time: '15:20',
    paymentMethod: 'UPI',
    upiDetails: {
      vpa: 'amazonpay@apl',
      refNumber: '422194829104',
      payeeName: 'Amazon Seller Services',
    },
    notes: 'Wireless keyboard and desk mat',
    createdAt: Date.now() - 86400000 * 11,
    updatedAt: Date.now() - 86400000 * 11,
  },
  {
    id: 'tx-9',
    title: 'Chai Point Quick Snack',
    amount: 85,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-10-12',
    time: '17:15',
    paymentMethod: 'UPI',
    upiDetails: {
      vpa: 'chaipoint@icici',
      refNumber: '426194819201',
      payeeName: 'Chai Point Tech Park',
    },
    notes: 'Ginger chai & bun maska',
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'tx-10',
    title: 'Cult.fit Fitness Membership',
    amount: 1250,
    type: 'expense',
    category: 'Health & Medical',
    date: '2026-10-03',
    time: '08:30',
    paymentMethod: 'UPI',
    upiDetails: {
      vpa: 'cultfit@hdfcbank',
      refNumber: '421948192011',
      payeeName: 'Curefit Healthcare Pvt Ltd',
    },
    notes: 'Monthly pass renewal',
    createdAt: Date.now() - 86400000 * 13,
    updatedAt: Date.now() - 86400000 * 13,
  },
];

export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First time initialization: seed sample records so user has immediate visible data
      saveAllTransactions(INITIAL_SAMPLE_TRANSACTIONS);
      return INITIAL_SAMPLE_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load from LocalStorage:', err);
    return INITIAL_SAMPLE_TRANSACTIONS;
  }
}

export function saveAllTransactions(txs: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
  } catch (err) {
    console.error('Failed to save to LocalStorage:', err);
  }
}

export function addTransaction(tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
  const current = getStoredTransactions();
  const newTx: Transaction = {
    ...tx,
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const updated = [newTx, ...current];
  saveAllTransactions(updated);
  return newTx;
}

export function updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
  const current = getStoredTransactions();
  const index = current.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const updatedTx: Transaction = {
    ...current[index],
    ...updates,
    updatedAt: Date.now(),
  };
  current[index] = updatedTx;
  saveAllTransactions(current);
  return updatedTx;
}

export function deleteTransaction(id: string): void {
  const current = getStoredTransactions();
  const filtered = current.filter((t) => t.id !== id);
  saveAllTransactions(filtered);
}

export function clearAllTransactions(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}

export function resetToSampleData(): Transaction[] {
  saveAllTransactions(INITIAL_SAMPLE_TRANSACTIONS);
  return INITIAL_SAMPLE_TRANSACTIONS;
}

export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: Partial<AppSettings>): AppSettings {
  try {
    const current = getAppSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export const DEFAULT_INCOME_PROFILE: IncomeProfile = {
  isConfigured: false,
  monthlySalary: 75000,
  sourceName: 'Apex Tech Solutions (Salary)',
  payday: 1,
  secondaryIncome: 15000,
  secondarySource: 'Freelance & Consulting',
  targetSavingsPercent: 20,
};

export function getIncomeProfile(): IncomeProfile {
  try {
    const raw = localStorage.getItem(INCOME_KEY);
    if (!raw) return DEFAULT_INCOME_PROFILE;
    return { ...DEFAULT_INCOME_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_INCOME_PROFILE;
  }
}

export function saveIncomeProfile(profile: Partial<IncomeProfile>): IncomeProfile {
  try {
    const current = getIncomeProfile();
    const updated: IncomeProfile = {
      ...current,
      ...profile,
      isConfigured: true,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(INCOME_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_INCOME_PROFILE;
  }
}

export function getDefaultUpiSettings(): { upiId: string; payeeName: string } {
  try {
    const settings = getAppSettings();
    return {
      upiId: settings.defaultUpiId || 'matru@okhdfcbank',
      payeeName: settings.defaultPayeeName || 'Matru',
    };
  } catch {
    return { upiId: 'matru@okhdfcbank', payeeName: 'Matru' };
  }
}

export function saveDefaultUpiSettings(upiId: string, payeeName: string): void {
  try {
    const current = getAppSettings();
    saveAppSettings({
      ...current,
      defaultUpiId: upiId.trim(),
      defaultPayeeName: payeeName.trim(),
    });
  } catch {
    // ignore
  }
}

export function getThemeMode(): ThemeMode {
  try {
    const val = localStorage.getItem(THEME_KEY) as ThemeMode;
    return val === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch {
    // ignore
  }
}

export function getLocalStorageMetrics(): { bytesUsed: number; formattedSize: string; recordCount: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '[]';
    const bytesUsed = new Blob([raw]).size;
    const count = (JSON.parse(raw) as unknown[]).length;
    const formattedSize = bytesUsed < 1024 
      ? `${bytesUsed} B` 
      : `${(bytesUsed / 1024).toFixed(1)} KB`;
    return { bytesUsed, formattedSize, recordCount: count };
  } catch {
    return { bytesUsed: 0, formattedSize: '0 KB', recordCount: 0 };
  }
}

export function exportToJsonString(): string {
  const txs = getStoredTransactions();
  return JSON.stringify(txs, null, 2);
}

export function exportToCsvString(): string {
  const txs = getStoredTransactions();
  const headers = ['ID', 'Date', 'Time', 'Title', 'Type', 'Category', 'Amount', 'PaymentMethod', 'UPI_VPA', 'UPI_Ref', 'Notes'];
  
  const rows = txs.map((t) => [
    t.id,
    t.date,
    t.time,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.type,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    t.amount,
    t.paymentMethod,
    `"${(t.upiDetails?.vpa || '').replace(/"/g, '""')}"`,
    `"${(t.upiDetails?.refNumber || '').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function importFromJson(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, error: 'File does not contain a JSON array of transactions' };
    }
    // Basic validation
    const valid: Transaction[] = [];
    for (const item of parsed) {
      if (item && item.title && typeof item.amount === 'number' && item.date) {
        valid.push({
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
    if (valid.length === 0) {
      return { success: false, count: 0, error: 'No valid transactions found in file' };
    }
    saveAllTransactions(valid);
    return { success: true, count: valid.length };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid JSON file';
    return { success: false, count: 0, error: message };
  }
}
