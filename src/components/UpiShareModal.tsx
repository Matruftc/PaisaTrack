import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Clock,
  Tag,
  Hash,
} from 'lucide-react';
import { parseUpiString } from '../services/upiParser';
import { ParsedUpiResult, Transaction, TransactionType } from '../types/finance';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';

interface UpiShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  currencySymbol?: string;
}

const SAMPLE_UPI_INPUTS = [
  {
    label: '🍔 Swiggy Debit SMS',
    text: 'Paid Rs. 380.00 on 16-Oct-2026 to SWIGGY UPI Ref 429381928192. Bal Rs 18,200.00',
  },
  {
    label: '💼 Salary Credit SMS',
    text: 'Your A/C ending 4912 is credited by Rs 75,000.00 on 01-10-2026 by salary transfer UPI/420194829104',
  },
  {
    label: '☕ Starbucks UPI Link',
    text: 'upi://pay?pa=starbucks@okhdfcbank&pn=Starbucks%20Coffee&am=345.00&cu=INR&tn=Cold%20Brew',
  },
  {
    label: '🛒 Blinkit Grocery SMS',
    text: 'Debited INR 720.00 from A/C XX4921 on 14/10/26 to BLINKIT UPI Ref: 427194819284',
  },
];

export const UpiShareModal: React.FC<UpiShareModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  currencySymbol = '₹',
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [parsed, setParsed] = useState<ParsedUpiResult | null>(null);

  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<string>('Food & Dining');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [vpa, setVpa] = useState<string>('');
  const [refNumber, setRefNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSuccessFeedback, setIsSuccessFeedback] = useState<boolean>(false);

  useEffect(() => {
    if (!inputText.trim()) {
      setParsed(null);
      return;
    }

    const result = parseUpiString(inputText);
    if (result) {
      setParsed(result);
      setTitle(result.title);
      setAmount(result.amount > 0 ? result.amount.toString() : '');
      setType(result.type);
      setCategory(result.category);
      setDate(result.date);
      setTime(result.time);
      setVpa(result.upiDetails.vpa || '');
      setRefNumber(result.upiDetails.refNumber || '');
      setNotes(result.notes || '');
    } else {
      setParsed(null);
    }
  }, [inputText]);

  if (!isOpen) return null;

  const handleUseSample = (sampleText: string) => {
    setInputText(sampleText);
  };

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please specify a valid amount greater than 0');
      return;
    }
    if (!title.trim()) {
      alert('Please specify a title or payee name');
      return;
    }

    onAddTransaction({
      title: title.trim(),
      amount: numAmount,
      type,
      category,
      date: date || new Date().toISOString().split('T')[0],
      time: time || '12:00',
      paymentMethod: 'UPI',
      upiDetails: {
        vpa: vpa.trim() || undefined,
        refNumber: refNumber.trim() || undefined,
        payeeName: type === 'expense' ? title.trim() : undefined,
        payerName: type === 'income' ? title.trim() : undefined,
        rawString: inputText,
      },
      notes: notes.trim() || undefined,
    });

    setIsSuccessFeedback(true);
    setTimeout(() => {
      setIsSuccessFeedback(false);
      setInputText('');
      setParsed(null);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-[#141417] w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-zinc-100">
        {/* Header with gradient */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 via-white to-white dark:from-indigo-950/40 dark:via-[#141417] dark:to-[#141417]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-cyan-300 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                Extract UPI Details
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Paste payment SMS, bank notification, or UPI QR intent string
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Quick Samples Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Paste UPI Text, SMS, or QR Link
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Quick test presets:</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {SAMPLE_UPI_INPUTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUseSample(sample.text)}
                  className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-300 dark:hover:border-indigo-700 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>

            {/* Input Textarea */}
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Example: 'Paid Rs. 380.00 on 16-Oct-26 to Swiggy UPI Ref 429381928...' or paste 'upi://pay?pa=...'"
                rows={3}
                className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 outline-hidden font-mono transition-all resize-none placeholder:text-slate-400"
              />
              {inputText && (
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600 shadow-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Details Extracted Status Banner */}
          {parsed ? (
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/40 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>UPI Details Extracted! Review & confirm below:</span>
              </div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-mono bg-white/80 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                {parsed.detectedFormat}
              </span>
            </div>
          ) : inputText.trim() ? (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/80 dark:bg-amber-950/40 p-3.5 flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Could not detect full fields automatically. Adjust values manually below.</span>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
              Paste or tap a quick preset above to instantly fetch the payee name, amount, category, date, and UPI reference.
            </div>
          )}

          {/* Preview / Editable Form */}
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Extracted Record Details
              </span>
              
              {/* Type Switcher */}
              <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-all ${
                    type === 'expense'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-all ${
                    type === 'income'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  Income
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Title / Merchant */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Payee / Merchant / Description
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Swiggy, Starbucks, Salary"
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-indigo-500 outline-hidden font-bold text-slate-900 dark:text-white"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Amount ({currencySymbol})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm font-bold text-slate-400 dark:text-slate-500">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-xs sm:text-sm pl-7 pr-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-indigo-500 outline-hidden font-extrabold tabular-nums text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-slate-400" />
                  Auto-Inferred Category
                </label>
                <div className="flex items-center gap-2">
                  <CategoryIcon category={category} size="sm" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex-1 text-xs sm:text-sm px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-indigo-500 outline-hidden text-slate-900 dark:text-white font-medium"
                  >
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Date & Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-indigo-500 outline-hidden text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-indigo-500 outline-hidden text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* UPI ID / VPA */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  UPI ID (VPA)
                </label>
                <input
                  type="text"
                  value={vpa}
                  onChange={(e) => setVpa(e.target.value)}
                  placeholder="e.g. merchant@icici"
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-indigo-500 outline-hidden font-mono text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* UTR / Ref Number */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-slate-400" />
                  UPI Reference / UTR
                </label>
                <input
                  type="text"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  placeholder="e.g. 429381928192"
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-indigo-500 outline-hidden font-mono text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Notes & Remarks
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-indigo-500 outline-hidden text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Stored exclusively in your private browser storage.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl transition-all shadow-md"
            >
              {isSuccessFeedback ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Confirm & Save Record</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
