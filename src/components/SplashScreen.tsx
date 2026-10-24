import React, { useEffect, useState } from 'react';
import { PaisaTrackLogo } from './PaisaTrackLogo';
import { ShieldCheck, Lock } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState<boolean>(false);

  useEffect(() => {
    // Hold splash screen for 1.8 seconds, then trigger fade out transition
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        onFinish();
      }, 500); // 500ms fade transition
    }, 1800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#09090b] text-white flex flex-col items-center justify-between py-12 px-6 transition-opacity duration-500 select-none ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient lighting halos */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Tag */}
      <div className="relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider animate-in fade-in duration-500">
        <Lock className="w-3.5 h-3.5 text-emerald-400" />
        <span>Local Privacy Vault</span>
      </div>

      {/* Center Animated Logo & Branding */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-5 my-auto">
        {/* Glowing Logo Container */}
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 opacity-40 blur-xl animate-pulse" />
          <PaisaTrackLogo size="xl" animated={true} />
        </div>

        {/* Animated Brand Title */}
        <div className="space-y-1">
          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-white animate-in zoom-in-90 duration-700">
            Paisa<span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Track</span>
          </h1>
          <p className="text-xs text-zinc-400 font-medium">
            Smart Expense &amp; Inflow Intelligence
          </p>
        </div>

        {/* Sleek Loading Bar */}
        <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden relative mt-4">
          <div className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full animate-[ping_1.5s_infinite] w-full" />
        </div>
      </div>

      {/* Footer Security Badge */}
      <div className="relative z-10 flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>100% On-Device LocalStorage Encryption</span>
      </div>
    </div>
  );
};
