import React from 'react';
import { getUpiAppOriginInfo } from '../utils/formatters';

interface UpiBrandBadgeProps {
  vpa?: string;
  size?: 'xs' | 'sm' | 'md';
  showText?: boolean;
}

/**
 * Renders an app brand logo icon & label based on UPI VPA suffix (@icici, @paytm, @okhdfcbank, etc.)
 */
export const UpiBrandBadge: React.FC<UpiBrandBadgeProps> = ({
  vpa,
  size = 'xs',
  showText = true,
}) => {
  const origin = getUpiAppOriginInfo(vpa);
  if (!origin) return null;

  const handle = vpa ? vpa.toLowerCase().split('@')[1] || '' : '';

  // Determine Brand Logo SVG
  const renderBrandIcon = () => {
    if (origin.shortName === 'GPay' || handle.startsWith('ok')) {
      // Google Pay multi-color dot or logo
      return (
        <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4" />
          <path d="M12 5a7 7 0 100 14 7 7 0 000-14z" fill="#fff" opacity="0.2" />
          <path d="M12 7v10M7 12h10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    }

    if (origin.shortName === 'PhonePe' || handle.includes('ybl') || handle.includes('ibl') || handle.includes('phonepe')) {
      // PhonePe Purple Symbol
      return (
        <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="12" fill="#5f259f" />
          <text x="12" y="17" fill="white" fontSize="13" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">पे</text>
        </svg>
      );
    }

    if (origin.shortName === 'Paytm' || handle.includes('paytm')) {
      // Paytm Cyan / Blue
      return (
        <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="12" fill="#00b9f5" />
          <text x="12" y="16.5" fill="white" fontSize="10" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">PAY</text>
        </svg>
      );
    }

    if (origin.shortName === 'Amazon' || handle.includes('apl') || handle.includes('amazon')) {
      // Amazon Pay Amber
      return (
        <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="12" fill="#FF9900" />
          <path d="M6 15c3.5 2 8.5 2 12 0" stroke="#111" strokeWidth="2" strokeLinecap="round" />
          <path d="M17 13.5l1.5 1.5-1.5 1.5" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    if (origin.shortName === 'iMobile' || handle.includes('icici')) {
      // ICICI Orange
      return (
        <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="12" fill="#F37021" />
          <text x="12" y="16.5" fill="white" fontSize="11" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">i</text>
        </svg>
      );
    }

    if (origin.shortName === 'HDFC' || handle.includes('hdfc')) {
      // HDFC Blue
      return (
        <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="12" fill="#004c8f" />
          <rect x="7" y="7" width="10" height="10" stroke="white" strokeWidth="2" fill="#ed232a" />
        </svg>
      );
    }

    if (origin.shortName === 'Axis' || handle.includes('axis')) {
      // Axis Maroon
      return (
        <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="12" fill="#97144d" />
          <path d="M12 6L7 17h4l1-2.5 1 2.5h4L12 6z" fill="white" />
        </svg>
      );
    }

    if (origin.shortName === 'SBI Pay' || handle.includes('sbi')) {
      // SBI Blue Keyhole
      return (
        <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" fill="#280071" />
          <circle cx="12" cy="12" r="7" fill="#00a1e0" />
          <circle cx="12" cy="10" r="2.5" fill="white" />
          <rect x="11" y="10" width="2" height="7" fill="white" />
        </svg>
      );
    }

    if (origin.shortName === 'CRED' || handle.includes('cred')) {
      // CRED Black
      return (
        <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="12" fill="#18181b" stroke="#fff" strokeWidth="1.5" />
          <text x="12" y="16.5" fill="white" fontSize="10" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">C</text>
        </svg>
      );
    }

    // Default BHIM / NPCI
    return (
      <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="12" fill="#00796B" />
        <path d="M7 16L12 8l5 8H7z" fill="#FF9933" />
        <path d="M9 16l3-5 3 5H9z" fill="#FFFFFF" />
      </svg>
    );
  };

  const isSmall = size === 'xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${
        isSmall ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
      } font-mono font-semibold rounded-lg border backdrop-blur-sm transition-transform hover:scale-102 ${origin.badgeBg} ${origin.textColor}`}
      title={`UPI VPA: ${vpa} (${origin.name})`}
    >
      {renderBrandIcon()}
      {showText && <span className="font-sans font-bold tracking-tight">{origin.shortName}</span>}
    </span>
  );
};
