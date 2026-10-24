import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number; // duration in ms
  currencySymbol?: string;
  decimals?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  showCurrency?: boolean;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1800,
  currencySymbol = '₹',
  decimals = 2,
  className = '',
  prefix = '',
  suffix = '',
  showCurrency = true,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(true);
  const startTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    const targetValue = value;
    const startValue = 0;
    startTimestampRef.current = null;
    setIsSpinning(true);

    const animate = (timestamp: number) => {
      if (!startTimestampRef.current) startTimestampRef.current = timestamp;
      const elapsed = timestamp - startTimestampRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Lottery slot machine spin curve: rapid roll then deceleration lock
      const easeOutQuint = 1 - Math.pow(1 - progress, 4);
      let current = startValue + (targetValue - startValue) * easeOutQuint;

      // During active lottery spin phase (0% - 85%), add slot reel jitter on trailing digits
      if (progress < 0.82 && targetValue > 100) {
        const jitterMagnitude = Math.max(1, (1 - progress) * (targetValue * 0.05));
        const randomJitter = (Math.random() - 0.5) * jitterMagnitude;
        current = Math.max(0, current + randomJitter);
      }

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
        setIsSpinning(false);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(displayValue));

  const isNegative = value < 0;

  return (
    <span
      className={`inline-flex items-center tabular-nums font-mono tracking-tight transition-transform duration-75 ${
        isSpinning ? 'scale-[1.02] text-cyan-400 dark:text-cyan-300' : ''
      } ${className}`}
    >
      {prefix}
      {isNegative ? '-' : ''}
      {showCurrency && currencySymbol}
      {formatted}
      {suffix}
    </span>
  );
};
