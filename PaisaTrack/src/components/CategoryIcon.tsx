import React from 'react';
import {
  Utensils,
  ShoppingBag,
  Car,
  Store,
  Zap,
  Film,
  HeartPulse,
  TrendingUp,
  Briefcase,
  Laptop,
  RotateCcw,
  ArrowLeftRight,
  Layers,
} from 'lucide-react';
import { getCategoryInfo } from '../utils/formatters';

interface CategoryIconProps {
  category: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBackground?: boolean;
  merchantName?: string;
}

// Gen-Z & Modern merchant emoji badges
const MERCHANT_EMOJI_MAP: Record<string, string> = {
  swiggy: '🍔',
  zomato: '🍕',
  starbucks: '☕',
  coffee: '☕',
  chai: '🫖',
  uber: '🚕',
  ola: '🚖',
  rapido: '🛵',
  blinkit: '🛒',
  zepto: '⚡',
  instamart: '🛍️',
  bigbasket: '🥦',
  amazon: '📦',
  flipkart: '🛍️',
  myntra: '👗',
  netflix: '🍿',
  spotify: '🎧',
  prime: '🎬',
  hotstar: '📺',
  cultfit: '🏋️',
  gym: '💪',
  bescom: '⚡',
  airtel: '📶',
  jio: '📱',
  salary: '💼',
  payroll: '💰',
  freelance: '💻',
  zerodha: '📈',
  groww: '🚀',
};

const CATEGORY_EMOJI_MAP: Record<string, string> = {
  'Food & Dining': '🍔',
  'Groceries & Essentials': '🥦',
  'Travel & Transport': '🚕',
  'Shopping & Retail': '🛍️',
  'Bills & Utilities': '⚡',
  'Entertainment & OTT': '🍿',
  'Health & Medical': '🩺',
  'Investments & Savings': '📈',
  'Salary & Earnings': '💼',
  'Freelance & Business': '💻',
  'Refund & Cashback': '✨',
  'Transfers & Family': '💸',
  'General & Others': '💳',
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 'md',
  showBackground = true,
  merchantName = '',
}) => {
  const info = getCategoryInfo(category);

  // Check if merchant matches specific emoji
  let emoji = CATEGORY_EMOJI_MAP[category];
  const lowerMerchant = merchantName.toLowerCase();
  for (const [key, val] of Object.entries(MERCHANT_EMOJI_MAP)) {
    if (lowerMerchant.includes(key)) {
      emoji = val;
      break;
    }
  }

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-xl',
    xl: 'w-14 h-14 text-2xl',
  };

  const getFallbackIcon = () => {
    const iconSizeClass = {
      sm: 'w-3.5 h-3.5',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-7 h-7',
    }[size];

    switch (info.icon) {
      case 'Utensils':
        return <Utensils className={iconSizeClass} />;
      case 'ShoppingBag':
        return <ShoppingBag className={iconSizeClass} />;
      case 'Car':
        return <Car className={iconSizeClass} />;
      case 'Store':
        return <Store className={iconSizeClass} />;
      case 'Zap':
        return <Zap className={iconSizeClass} />;
      case 'Film':
        return <Film className={iconSizeClass} />;
      case 'HeartPulse':
        return <HeartPulse className={iconSizeClass} />;
      case 'TrendingUp':
        return <TrendingUp className={iconSizeClass} />;
      case 'Briefcase':
        return <Briefcase className={iconSizeClass} />;
      case 'Laptop':
        return <Laptop className={iconSizeClass} />;
      case 'RotateCcw':
        return <RotateCcw className={iconSizeClass} />;
      case 'ArrowLeftRight':
        return <ArrowLeftRight className={iconSizeClass} />;
      case 'Layers':
      default:
        return <Layers className={iconSizeClass} />;
    }
  };

  if (!showBackground) {
    return emoji ? (
      <span className="inline-block select-none transform group-hover:scale-110 transition-transform">{emoji}</span>
    ) : (
      <span style={{ color: info.color }}>{getFallbackIcon()}</span>
    );
  }

  return (
    <div
      className={`rounded-2xl flex items-center justify-center shrink-0 border border-white/20 dark:border-white/10 shadow-xs select-none transition-transform group-hover:scale-105 ${sizeClasses[size]}`}
      style={{
        backgroundColor: info.bgLight,
        color: info.color,
      }}
      title={info.name}
    >
      {emoji ? (
        <span className="leading-none">{emoji}</span>
      ) : (
        getFallbackIcon()
      )}
    </div>
  );
};
