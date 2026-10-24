import { CategoryDefinition } from '../types/finance';

export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'food',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: '#F97316', // orange-500
    bgLight: '#FFF7ED', // orange-50
    type: 'expense',
  },
  {
    id: 'groceries',
    name: 'Groceries & Essentials',
    icon: 'ShoppingBag',
    color: '#10B981', // emerald-500
    bgLight: '#ECFDF5', // emerald-50
    type: 'expense',
  },
  {
    id: 'transport',
    name: 'Travel & Transport',
    icon: 'Car',
    color: '#06B6D4', // cyan-500
    bgLight: '#ECFEFF', // cyan-50
    type: 'expense',
  },
  {
    id: 'shopping',
    name: 'Shopping & Retail',
    icon: 'Store',
    color: '#EC4899', // pink-500
    bgLight: '#FDF2F8', // pink-50
    type: 'expense',
  },
  {
    id: 'bills',
    name: 'Bills & Utilities',
    icon: 'Zap',
    color: '#8B5CF6', // purple-500
    bgLight: '#F5F3FF', // purple-50
    type: 'expense',
  },
  {
    id: 'entertainment',
    name: 'Entertainment & OTT',
    icon: 'Film',
    color: '#3B82F6', // blue-500
    bgLight: '#EFF6FF', // blue-50
    type: 'expense',
  },
  {
    id: 'health',
    name: 'Health & Medical',
    icon: 'HeartPulse',
    color: '#EF4444', // red-500
    bgLight: '#FEF2F2', // red-50
    type: 'expense',
  },
  {
    id: 'investment',
    name: 'Investments & Savings',
    icon: 'TrendingUp',
    color: '#059669', // emerald-600
    bgLight: '#ECFDF5',
    type: 'both',
  },
  {
    id: 'salary',
    name: 'Salary & Earnings',
    icon: 'Briefcase',
    color: '#16A34A', // green-600
    bgLight: '#F0FDF4',
    type: 'income',
  },
  {
    id: 'freelance',
    name: 'Freelance & Business',
    icon: 'Laptop',
    color: '#0284C7', // sky-600
    bgLight: '#F0F9FF',
    type: 'income',
  },
  {
    id: 'refund',
    name: 'Refund & Cashback',
    icon: 'RotateCcw',
    color: '#14B8A6', // teal-500
    bgLight: '#F0FDFA',
    type: 'income',
  },
  {
    id: 'transfer',
    name: 'Transfers & Family',
    icon: 'ArrowLeftRight',
    color: '#6366F1', // indigo-500
    bgLight: '#EEF2FF',
    type: 'both',
  },
  {
    id: 'other',
    name: 'General & Others',
    icon: 'Layers',
    color: '#64748B', // slate-500
    bgLight: '#F8FAFC',
    type: 'both',
  },
];

export const CATEGORY_KEYWORD_MAP: Record<string, string[]> = {
  'Food & Dining': [
    'swiggy', 'zomato', 'mcdonald', 'kfc', 'domino', 'pizza', 'burger', 'subway',
    'starbucks', 'cafe', 'coffee', 'chai', 'tea', 'dhaba', 'restaurant', 'eats',
    'baker', 'bakery', 'sweets', 'biryani', 'kitchen', 'food', 'dine', 'haldiram',
    'barbeque', 'chaayos', 'blue tokai', 'third wave'
  ],
  'Groceries & Essentials': [
    'blinkit', 'zepto', 'instamart', 'bigbasket', 'bbdaily', 'dmart', 'spencer',
    'grocery', 'supermarket', 'mart', 'kirana', 'nature basket', 'milk', 'dairy',
    'country delight', 'fresh', 'vegetables', 'fruits'
  ],
  'Travel & Transport': [
    'uber', 'ola', 'rapido', 'metro', 'irctc', 'train', 'bus', 'redbus', 'flight',
    'indigo', 'air india', 'petrol', 'fuel', 'diesel', 'hpcl', 'bpcl', 'iocl',
    'shell', 'fastag', 'toll', 'parking', 'cab', 'auto'
  ],
  'Shopping & Retail': [
    'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'tata cliq', 'zara', 'h&m',
    'uniqlo', 'retail', 'croma', 'reliance digital', 'apple', 'lulu', 'lifestyle',
    'westside', 'decathlon'
  ],
  'Bills & Utilities': [
    'bescom', 'tneb', 'electricity', 'power', 'water', 'gas', 'indane', 'hp gas',
    'bharat gas', 'airtel', 'jio', 'vi', 'vodafone', 'bsnl', 'broadband', 'act fibernet',
    'recharge', 'dth', 'tata play', 'maintenance', 'bill'
  ],
  'Entertainment & OTT': [
    'netflix', 'hotstar', 'disney', 'prime video', 'spotify', 'apple music',
    'youtube', 'bookmyshow', 'pvr', 'inox', 'cinepolis', 'movie', 'game', 'playstation',
    'steam'
  ],
  'Health & Medical': [
    'apollo', '1mg', 'tata 1mg', 'pharmeasy', 'medplus', 'netmeds', 'pharmacy',
    'chemist', 'hospital', 'clinic', 'doctor', 'lab', 'diagnostics', 'cult.fit',
    'gym', 'fitness', 'wellness'
  ],
  'Investments & Savings': [
    'zerodha', 'groww', 'kuvera', 'coin', 'upstox', 'angel one', 'mutual fund',
    'sip', 'stocks', 'epf', 'ppf', 'nps', 'gold', 'fixed deposit'
  ],
  'Salary & Earnings': [
    'salary', 'payroll', 'wages', 'stipend', 'employer', 'infosys', 'tcs',
    'wipro', 'google', 'accenture', 'cognizant'
  ],
  'Refund & Cashback': [
    'cashback', 'reward', 'refund', 'reversal', 'bonus'
  ],
};
