import React from 'react';

interface PaisaTrackLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
}

export const PaisaTrackLogo: React.FC<PaisaTrackLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  animated = true,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textMap = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Premium Multi-Layer Fintech Icon Emblem */}
      <div
        className={`relative ${sizeMap[size]} shrink-0 rounded-2xl p-0.5 bg-gradient-to-br from-emerald-400 via-teal-300 to-indigo-600 shadow-xl shadow-emerald-500/25 group transition-transform duration-300 hover:scale-105`}
      >
        {/* Outer Glow Halo */}
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-40 blur-md group-hover:opacity-80 transition duration-500" />

        {/* Inner Obsidian Vault Shield Surface */}
        <div className="relative w-full h-full rounded-[14px] bg-[#0c0d12] flex items-center justify-center overflow-hidden border border-white/15 backdrop-blur-md">
          {/* Subtle Cyber Grid Background Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:8px_8px] opacity-20" />

          {/* SVG Vector Graphic: Intertwined Rupee + Upward Tech Wave + Vault Spark */}
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`w-3/4 h-3/4 drop-shadow-[0_2px_10px_rgba(16,185,129,0.5)] ${
              animated ? 'transition-transform duration-500 group-hover:rotate-6' : ''
            }`}
          >
            <defs>
              <linearGradient id="ptGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>

              <linearGradient id="ptGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>

              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Geometric Outer Security Vault Hex-Shield Outline */}
            <path
              d="M50 8L85 24V50C85 71.5 69.8 90.8 50 96C30.2 90.8 15 71.5 15 50V24L50 8Z"
              stroke="url(#ptGrad1)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-40"
            />

            {/* Stylized Indian Rupee ₹ integrated with dynamic growth trend arrow */}
            {/* Top Bar 1 */}
            <path
              d="M32 30H68"
              stroke="url(#ptGrad1)"
              strokeWidth="7"
              strokeLinecap="round"
            />

            {/* Top Bar 2 */}
            <path
              d="M32 42H62"
              stroke="url(#ptGrad1)"
              strokeWidth="6.5"
              strokeLinecap="round"
            />

            {/* Main Rupee Loop & Dynamic Upward Arrow Trajectory */}
            <path
              d="M36 30V54C36 54 58 54 58 42C58 30 36 30 36 30Z"
              stroke="url(#ptGrad1)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Growth Rocket Leg / Diagonal Ascent */}
            <path
              d="M36 54L64 78"
              stroke="url(#ptGrad2)"
              strokeWidth="7"
              strokeLinecap="round"
            />

            {/* Floating Spark Point / Security Diamond */}
            <path
              d="M72 26L76 32L82 36L76 40L72 46L68 40L62 36L68 32L72 26Z"
              fill="#38bdf8"
              filter="url(#neonGlow)"
              className="animate-pulse"
            />
          </svg>
        </div>
      </div>

      {/* Optional Brand Text */}
      {showText && (
        <div>
          <div className="flex items-center gap-1.5">
            <span
              className={`font-display font-black tracking-tight text-slate-900 dark:text-white ${textMap[size]}`}
            >
              Paisa<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Track</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
