import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Users,
  Copy,
  Check,
  Share2,
  ExternalLink,
  QrCode,
  DollarSign,
  ArrowRight,
  Sparkles,
  BookmarkCheck,
} from 'lucide-react';
import { buildUpiPayUrl } from '../utils/upi';
import { Transaction } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface BillSplitModalProps {
  transaction: Transaction;
  defaultUpiId?: string;
  defaultPayeeName?: string;
  onClose: () => void;
  onSaveSplit?: (updatedTx: Transaction) => void;
}

export const BillSplitModal: React.FC<BillSplitModalProps> = ({
  transaction,
  defaultUpiId = 'matru@okhdfcbank',
  defaultPayeeName = 'Matru',
  onClose,
  onSaveSplit,
}) => {
  // Initial states - load previous split if already saved
  const initialPeople = transaction.splitDetails?.totalPeople || 3;
  const initialUpi = transaction.splitDetails?.payeeUpi || defaultUpiId;
  const initialName = transaction.splitDetails?.payeeName || defaultPayeeName;

  const [payeeUpi, setPayeeUpi] = useState(initialUpi);
  const [payeeName, setPayeeName] = useState(initialName);
  const [peopleCount, setPeopleCount] = useState(initialPeople);
  const [copied, setCopied] = useState(false);
  const [savedSplit, setSavedSplit] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const totalAmount = transaction.amount;
  const validPeopleCount = Math.max(1, peopleCount);
  const perPersonShare = Math.round((totalAmount / validPeopleCount) * 100) / 100;
  const merchantName = transaction.merchant || transaction.upiDetails?.payeeName || transaction.title || 'Expense';

  // Build NPCI compliant UPI deep link
  const upiLink = buildUpiPayUrl({
    pa: payeeUpi,
    pn: payeeName,
    am: perPersonShare,
    tn: `Split: ${merchantName} via PaisaTrack`,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(upiLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = upiLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleWhatsApp = () => {
    const formattedPerShare = formatCurrency(perPersonShare);
    const message = encodeURIComponent(
      `Hey! Your share for "${merchantName}" is ${formattedPerShare}.\n\nPay securely via UPI:\n${upiLink}\n\nSplit seamlessly using PaisaTrack.`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleSaveToTransaction = () => {
    if (onSaveSplit) {
      const updated: Transaction = {
        ...transaction,
        splitDetails: {
          totalAmount,
          perPersonShare,
          totalPeople: validPeopleCount,
          payeeUpi: payeeUpi.trim(),
          payeeName: payeeName.trim(),
        },
      };
      onSaveSplit(updated);
      setSavedSplit(true);
      setTimeout(() => setSavedSplit(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#141417] border border-slate-200 dark:border-white/10 p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-white space-y-4 my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-gradient-to-tr dark:from-amber-500/20 dark:to-lime-400/20 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                ⚡ Split & Settle Up
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate max-w-[210px]">
                {merchantName} • {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors text-sm font-semibold cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Real-time Per-Person Share Display */}
        <div className="rounded-2xl p-4 bg-slate-50 dark:bg-gradient-to-b dark:from-zinc-900/90 dark:to-zinc-900/40 border border-slate-200 dark:border-white/10 text-center relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-lime-400/50 to-transparent" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Per-Person Share ({validPeopleCount} ways)
          </span>
          <div className="font-sans font-black text-3xl sm:text-4xl text-emerald-600 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-lime-300 dark:via-emerald-300 dark:to-teal-300 tracking-[-0.03em] my-1 tabular-nums">
            {formatCurrency(perPersonShare)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">
            Total {formatCurrency(totalAmount)} divided equally amongst {validPeopleCount} people
          </p>
        </div>

        {/* Split Stepper & Quick Preset Chips */}
        <div className="space-y-2 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/5 rounded-2xl p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-lime-400" /> Split between
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPeopleCount((p) => Math.max(2, p - 1))}
                className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 active:scale-95 text-slate-800 dark:text-zinc-200 flex items-center justify-center font-bold border border-slate-200 dark:border-white/10 transition-all text-sm cursor-pointer"
                title="Decrease people"
              >
                -
              </button>
              <span className="text-sm font-black text-slate-900 dark:text-zinc-100 min-w-[65px] text-center font-mono">
                {validPeopleCount} {validPeopleCount === 1 ? 'person' : 'people'}
              </span>
              <button
                type="button"
                onClick={() => setPeopleCount((p) => Math.min(50, p + 1))}
                className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 active:scale-95 text-slate-800 dark:text-zinc-200 flex items-center justify-center font-bold border border-slate-200 dark:border-white/10 transition-all text-sm cursor-pointer"
                title="Increase people"
              >
                +
              </button>
            </div>
          </div>

          {/* Quick preset pills */}
          <div className="flex items-center gap-1.5 pt-1">
            {[2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPeopleCount(num)}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  peopleCount === num
                    ? 'bg-lime-500/20 text-emerald-700 dark:text-lime-300 border border-lime-400/40 shadow-xs'
                    : 'bg-white dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-white/5'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* QR Code Container (Crisp White Pad for Camera Scanning) */}
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/5 space-y-2.5">
          <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200/80 dark:border-white/10 inline-flex items-center justify-center transition-transform hover:scale-102">
            <QRCodeSVG
              value={upiLink}
              size={168}
              level="M"
              includeMargin={false}
              className="w-40 h-40"
            />
          </div>

          <div className="text-center space-y-0.5">
            <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Pay to <span className="font-mono text-emerald-700 dark:text-lime-300 font-bold">{payeeUpi}</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400">
              Scan with Google Pay, PhonePe, Paytm, or BHIM
            </p>
          </div>
        </div>

        {/* UPI Details Customization Toggle */}
        <div className="border border-slate-200 dark:border-white/5 rounded-2xl p-2.5 bg-slate-50 dark:bg-zinc-900/40">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="w-full flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors font-medium cursor-pointer"
          >
            <span>Customise Receiving UPI ID & Name</span>
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-lime-400">
              {showConfig ? 'Hide' : 'Edit'}
            </span>
          </button>

          {showConfig && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-white/5 space-y-2 text-xs">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold block mb-1">
                  Receiving UPI VPA (ID)
                </label>
                <input
                  type="text"
                  value={payeeUpi}
                  onChange={(e) => setPayeeUpi(e.target.value)}
                  placeholder="yourname@bank"
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 font-mono text-xs focus:outline-hidden focus:border-emerald-500 dark:focus:border-lime-400 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold block mb-1">
                  Payee / Your Name
                </label>
                <input
                  type="text"
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  placeholder="e.g. Matru"
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 text-xs focus:outline-hidden focus:border-emerald-500 dark:focus:border-lime-400 transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Copy UPI Link & Share WhatsApp */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 dark:border-white/10 active:scale-95'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Link!' : 'Copy UPI Link'}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-lime-400 hover:from-emerald-300 hover:to-lime-300 shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <span className="text-sm">💬</span>
            <span>WhatsApp</span>
          </button>
        </div>

        {/* Save Split into Expense record if supported */}
        {onSaveSplit && (
          <button
            type="button"
            onClick={handleSaveToTransaction}
            className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              savedSplit
                ? 'bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 dark:border-white/5'
            }`}
          >
            {savedSplit ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Split Saved to Expense!</span>
              </>
            ) : (
              <>
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Save Split Breakdown to this Expense</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
