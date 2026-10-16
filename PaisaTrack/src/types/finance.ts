export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'UPI' | 'Card' | 'Cash' | 'NetBanking' | 'Wallet';

export interface UpiMetadata {
  vpa?: string; // UPI ID e.g. "swiggy@icici" or "merchant@okaxis"
  refNumber?: string; // UTR / Reference No e.g. "429381928192"
  payeeName?: string; // Merchant or person name
  payerName?: string;
  rawString?: string;
  bankName?: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: PaymentMethod;
  upiDetails?: UpiMetadata;
  merchant?: string;
  splitDetails?: {
    totalAmount: number;
    perPersonShare: number;
    totalPeople: number;
    payeeUpi: string;
    payeeName: string;
  };
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface IncomeProfile {
  isConfigured: boolean;
  monthlySalary: number;
  sourceName: string;
  payday: number; // Day of month 1-31
  secondaryIncome?: number;
  secondarySource?: string;
  targetSavingsPercent: number; // e.g. 20%
  lastUpdated?: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface CategoryDefinition {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgLight: string;
  type: TransactionType | 'both';
}

export type DateFilterPreset = 
  | 'all'
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'custom';

export interface DateFilterRange {
  preset: DateFilterPreset;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export interface ParsedUpiResult {
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  time: string;
  paymentMethod: PaymentMethod;
  upiDetails: UpiMetadata;
  notes?: string;
  confidence: number;
  detectedFormat: 'upi_uri' | 'sms_debit' | 'sms_credit' | 'quick_text' | 'qr_intent';
}
