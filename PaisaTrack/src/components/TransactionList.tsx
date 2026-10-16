import React, { useState } from 'react';
import {
  Search,
  Trash2,
  Edit3,
  Calendar,
  Layers,
  Sparkles,
  Plus,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Zap,
  Users,
  QrCode,
  Share2,
} from 'lucide-react';
import { Transaction, TransactionType } from '../types/finance';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency, formatDisplayDate, getUpiAppOriginInfo } from '../utils/formatters';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { UpiBrandBadge } from './UpiBrandBadge';
import { BillSplitModal } from './BillSplitModal';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onOpenUpiModal: () => void;
  onOpenAddModal: () => void;
  currencySymbol?: string;
  defaultUpiId?: string;
  defaultPayeeName?: string;
  onUpdateTransaction?: (tx: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onOpenUpiModal,
  onOpenAddModal,
  currencySymbol = '₹',
  defaultUpiId = 'matru@okhdfcbank',
  defaultPayeeName = 'Matru',
  onUpdateTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [groupByDate, setGroupByDate] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Bill Split Modal State
  const [splitModalTx, setSplitModalTx] = useState<Transaction | null>(null);

  const handleCopy = (text: string, key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Filter transactions
  const filtered = transactions.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchCat = t.category.toLowerCase().includes(q);
      const matchNotes = t.notes?.toLowerCase().includes(q);
      const matchVpa = t.upiDetails?.vpa?.toLowerCase().includes(q);
      const matchRef = t.upiDetails?.refNumber?.toLowerCase().includes(q);
      const matchPayee = t.upiDetails?.payeeName?.toLowerCase().includes(q);
      const matchMerchant = t.merchant?.toLowerCase().includes(q);
      return matchTitle || matchCat || matchNotes || matchVpa || matchRef || matchPayee || matchMerchant;
    }
    return true;
  });

  // Group transactions by date string
  const groupedByDate = filtered.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const key = tx.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => (a < b ? 1 : -1));

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDeleteConfirm = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
    setDeletingId(null);
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 overflow-hidden transition-all">
      {/* Header & Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-200/80 dark:border-white/5 space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Transaction Activity</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-white/10">
                {filtered.length} of {transactions.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Tap any entry to expand UTR, UPI metadata, and ⚡ Split Bill with friends
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGroupByDate(!groupByDate)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-150 border cursor-pointer ${
                groupByDate
                  ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-200 border-slate-300 dark:border-white/10 shadow-xs'
                  : 'bg-white dark:bg-zinc-900/60 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-white/5'
              }`}
              title="Toggle Group By Date"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Group by Date</span>
            </button>

            <button
              onClick={onOpenUpiModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 border border-cyan-200 dark:border-cyan-800/60 rounded-xl transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Smart UPI</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-lime-400 hover:from-emerald-300 hover:to-lime-300 rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Search & Type Segmented Control */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by merchant, UPI ID (@icici), UTR ref, note..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-hidden focus:border-indigo-500/60 transition-colors font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Type Filter Pills */}
          <div className="flex p-1 bg-slate-100 dark:bg-zinc-900/90 rounded-xl border border-slate-200 dark:border-white/10 shrink-0">
            {(['all', 'expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                  typeFilter === t
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-white/10'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                {t === 'all' ? 'All Flow' : t === 'expense' ? 'Debits' : 'Credits'}
              </button>
            ))}
          </div>
        </div>

        {/* Instant Inline Category Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`shrink-0 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/30'
                : 'bg-slate-100 dark:bg-zinc-900/80 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 border border-slate-200 dark:border-white/5'
            }`}
          >
            All Categories
          </button>
          {DEFAULT_CATEGORIES.map((cat) => {
            const isSelected = categoryFilter === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(isSelected ? 'all' : cat.name)}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-white border border-slate-300 dark:border-white/20 shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-900/80 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 border border-slate-200 dark:border-white/5'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="truncate max-w-[120px]">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Transaction List Body */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center space-y-3 px-4">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-400 dark:text-zinc-500">
            <Layers className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">No transactions match your criteria</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-500 max-w-sm mx-auto">
              {searchQuery || categoryFilter !== 'all' || typeFilter !== 'all'
                ? 'Try clearing the search query or category filters above.'
                : 'Tap "+ Add" or use the Smart UPI Extractor to log your first record.'}
            </p>
          </div>
          {(searchQuery || categoryFilter !== 'all' || typeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setTypeFilter('all');
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-4 cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : groupByDate ? (
        // Grouped by Date View
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {sortedDates.map((dateStr) => {
            const dateTxs = groupedByDate[dateStr];
            const dateDayTotal = dateTxs.reduce(
              (sum, t) => sum + (t.type === 'expense' ? -t.amount : t.amount),
              0
            );

            return (
              <div key={dateStr} className="bg-transparent">
                {/* Date Group Header */}
                <div className="px-4 sm:px-6 py-2.5 bg-slate-100/90 dark:bg-zinc-950/60 border-y border-slate-200 dark:border-white/5 flex items-center justify-between text-xs sticky top-0 backdrop-blur-md z-10">
                  <span className="font-extrabold text-slate-800 dark:text-zinc-300 tracking-wide flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    <span>{formatDisplayDate(dateStr)}</span>
                    <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-500 font-normal">
                      ({dateTxs.length})
                    </span>
                  </span>
                  <span
                    className={`font-mono text-xs font-bold ${
                      dateDayTotal >= 0 ? 'text-emerald-600 dark:text-lime-400' : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    {dateDayTotal >= 0 ? '+' : ''}
                    {formatCurrency(dateDayTotal, currencySymbol)}
                  </span>
                </div>

                {/* Date's Transactions */}
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {dateTxs.map((tx) => (
                    <TransactionRowItem
                      key={tx.id}
                      tx={tx}
                      currencySymbol={currencySymbol}
                      isExpanded={expandedId === tx.id}
                      onToggle={() => toggleExpand(tx.id)}
                      onCopy={(txt, key, e) => handleCopy(txt, key, e)}
                      copiedKey={copiedKey}
                      onEdit={() => onEdit(tx)}
                      onDelete={() => setDeletingId(tx.id)}
                      isDeleting={deletingId === tx.id}
                      onConfirmDelete={(e) => handleDeleteConfirm(tx.id, e)}
                      onCancelDelete={(e) => {
                        e.stopPropagation();
                        setDeletingId(null);
                      }}
                      onSplit={(t) => setSplitModalTx(t)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Flat List View
        <div className="divide-y divide-white/5">
          {filtered.map((tx) => (
            <TransactionRowItem
              key={tx.id}
              tx={tx}
              currencySymbol={currencySymbol}
              isExpanded={expandedId === tx.id}
              onToggle={() => toggleExpand(tx.id)}
              onCopy={(txt, key, e) => handleCopy(txt, key, e)}
              copiedKey={copiedKey}
              onEdit={() => onEdit(tx)}
              onDelete={() => setDeletingId(tx.id)}
              isDeleting={deletingId === tx.id}
              onConfirmDelete={(e) => handleDeleteConfirm(tx.id, e)}
              onCancelDelete={(e) => {
                e.stopPropagation();
                setDeletingId(null);
              }}
              onSplit={(t) => setSplitModalTx(t)}
            />
          ))}
        </div>
      )}

      {/* Bill Split & Settle-up QR Generator Modal */}
      {splitModalTx && (
        <BillSplitModal
          transaction={splitModalTx}
          defaultUpiId={defaultUpiId}
          defaultPayeeName={defaultPayeeName}
          onClose={() => setSplitModalTx(null)}
          onSaveSplit={(updatedTx) => {
            onUpdateTransaction?.(updatedTx);
            setSplitModalTx(null);
          }}
        />
      )}
    </div>
  );
};

interface TransactionRowItemProps {
  tx: Transaction;
  currencySymbol: string;
  isExpanded: boolean;
  onToggle: () => void;
  onCopy: (text: string, key: string, e: React.MouseEvent) => void;
  copiedKey: string | null;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  onConfirmDelete: (e: React.MouseEvent) => void;
  onCancelDelete: (e: React.MouseEvent) => void;
  onSplit: (tx: Transaction) => void;
}

const TransactionRowItem: React.FC<TransactionRowItemProps> = ({
  tx,
  currencySymbol,
  isExpanded,
  onToggle,
  onCopy,
  copiedKey,
  onEdit,
  onDelete,
  isDeleting,
  onConfirmDelete,
  onCancelDelete,
  onSplit,
}) => {
  const isIncome = tx.type === 'income';
  const upiOrigin = getUpiAppOriginInfo(tx.upiDetails?.vpa);

  return (
    <div
      onClick={onToggle}
      className="cursor-pointer transition-all duration-200 hover:bg-slate-100/70 dark:hover:bg-zinc-800/40 hover:-translate-y-0.5 group px-4 sm:px-6 py-3.5 select-none"
    >
      {/* Main Row Overview */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Avatar & Title */}
        <div className="flex items-center gap-3.5 min-w-0">
          <CategoryIcon
            category={tx.category}
            merchantName={tx.title}
            size="md"
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {tx.title}
              </h4>

              {/* Payment Method Label */}
              <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/5">
                {tx.paymentMethod}
              </span>

              {/* UPI Brand Logo Icon next to payment method label */}
              {tx.upiDetails?.vpa && (
                <UpiBrandBadge vpa={tx.upiDetails.vpa} size="xs" showText={true} />
              )}

              {/* Split Bill Badge if already split */}
              {tx.splitDetails && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-lime-500/10 text-emerald-700 dark:text-lime-300 border border-lime-500/30">
                  <Zap className="w-2.5 h-2.5 fill-lime-400 text-lime-500 dark:text-lime-400" />
                  Split ({tx.splitDetails.totalPeople}P)
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              <span>{tx.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px]">{tx.time || tx.date}</span>

              {tx.upiDetails?.refNumber && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-500">
                    UTR: {tx.upiDetails.refNumber.slice(-6)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Amount & Toggle Chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div
              className={`font-sans font-black text-base sm:text-lg tabular-nums tracking-[-0.02em] ${
                isIncome ? 'text-emerald-600 dark:text-lime-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              <span>{isIncome ? '+' : '-'}</span>
              <span>{formatCurrency(tx.amount, currencySymbol)}</span>
            </div>
            {tx.upiDetails?.vpa && (
              <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 block truncate max-w-[120px]">
                {tx.upiDetails.vpa}
              </span>
            )}
          </div>

          <div className="text-slate-400 group-hover:text-slate-700 dark:text-zinc-400 dark:group-hover:text-zinc-200 transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Tap-to-Expand Detailed Drawer */}
      {isExpanded && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 pt-3 border-t border-slate-200 dark:border-white/5 space-y-3 cursor-default animate-in fade-in zoom-in-98 duration-150"
        >
          {/* Active Split Summary Banner if present */}
          {tx.splitDetails && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-lime-50 dark:bg-lime-950/40 border border-lime-300 dark:border-lime-500/30 text-xs text-slate-800 dark:text-zinc-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-lime-400 animate-pulse" />
                <span>
                  <strong className="text-emerald-800 dark:text-lime-300 font-bold">Split Active:</strong> {formatCurrency(tx.splitDetails.perPersonShare, currencySymbol)} / person across {tx.splitDetails.totalPeople} people
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSplit(tx);
                }}
                className="text-xs font-bold text-emerald-700 dark:text-lime-400 hover:underline flex items-center gap-1 cursor-pointer underline-offset-2"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Show QR</span>
              </button>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-zinc-900/80 p-3 rounded-2xl border border-slate-200 dark:border-white/5">
            {/* UPI ID & Platform */}
            {tx.upiDetails?.vpa && (
              <div className="flex items-center justify-between gap-2 p-1.5 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-white/5">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 block">UPI ID</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold truncate block">
                    {tx.upiDetails.vpa}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <UpiBrandBadge vpa={tx.upiDetails.vpa} size="xs" showText={true} />
                  <button
                    onClick={(e) => onCopy(tx.upiDetails!.vpa!, `vpa-${tx.id}`, e)}
                    className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                    title="Copy UPI ID"
                  >
                    {copiedKey === `vpa-${tx.id}` ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                        <Check className="w-3 h-3" /> Copied!
                      </span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* UTR Reference */}
            {tx.upiDetails?.refNumber && (
              <div className="flex items-center justify-between gap-2 p-1.5 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-white/5">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 block">UTR Reference</span>
                  <span className="font-mono text-slate-800 dark:text-zinc-200 font-semibold truncate block">
                    {tx.upiDetails.refNumber}
                  </span>
                </div>
                <button
                  onClick={(e) => onCopy(tx.upiDetails!.refNumber!, `utr-${tx.id}`, e)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-700 rounded-lg transition-colors shrink-0 cursor-pointer"
                  title="Copy UTR Ref"
                >
                  {copiedKey === `utr-${tx.id}` ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                      <Check className="w-3 h-3" /> Copied!
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}

            {/* Date & Time */}
            <div className="p-1.5 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 block">Timestamp</span>
              <span className="font-mono text-slate-800 dark:text-zinc-300 font-semibold">
                {tx.date} at {tx.time || '12:00'}
              </span>
            </div>

            {/* Notes */}
            {tx.notes && (
              <div className="p-1.5 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 block">Note</span>
                <span className="italic text-slate-800 dark:text-zinc-300 truncate block">
                  "{tx.notes}"
                </span>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500">ID: {tx.id}</span>

            {isDeleting ? (
              <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 px-2.5 py-1 rounded-xl">
                <span className="text-[11px] text-rose-700 dark:text-rose-300 font-bold">Delete this record?</span>
                <button
                  onClick={onConfirmDelete}
                  className="text-xs px-2 py-0.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-bold cursor-pointer"
                >
                  Yes
                </button>
                <button
                  onClick={onCancelDelete}
                  className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg cursor-pointer"
                >
                  No
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* ⚡ Split Bill Button inside expanded details row of debit/expense transactions */}
                {!isIncome && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSplit(tx);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-gradient-to-r dark:from-amber-500/15 dark:to-lime-500/15 hover:bg-amber-100 dark:hover:from-amber-500/25 dark:hover:to-lime-500/25 border border-amber-300 dark:border-amber-500/30 hover:border-amber-400 rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs"
                    title="Split this bill and generate UPI QR"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 fill-amber-500/30 dark:fill-amber-400/30" />
                    <span>⚡ Split Bill</span>
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-white/10 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/80 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
