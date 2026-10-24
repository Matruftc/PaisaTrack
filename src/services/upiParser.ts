import { ParsedUpiResult, TransactionType } from '../types/finance';
import { CATEGORY_KEYWORD_MAP } from '../constants/categories';

/**
 * Normalizes an amount string like "Rs. 1,450.50", "INR 500", "₹ 2,400", "500.00" into a float.
 */
export function cleanAmount(amountStr: string): number {
  if (!amountStr) return 0;
  const cleaned = amountStr
    .replace(/[₹RsINR,\s]/gi, '')
    .trim();
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : Math.round(val * 100) / 100;
}

/**
 * Predicts category based on merchant name, remarks, and raw text keywords.
 */
export function inferCategory(text: string, type: TransactionType): string {
  const lower = text.toLowerCase();
  
  if (type === 'income') {
    if (lower.includes('salary') || lower.includes('payroll') || lower.includes('wages') || lower.includes('stipend')) {
      return 'Salary & Earnings';
    }
    if (lower.includes('cashback') || lower.includes('refund') || lower.includes('reward')) {
      return 'Refund & Cashback';
    }
    if (lower.includes('dividend') || lower.includes('interest') || lower.includes('zerodha') || lower.includes('groww')) {
      return 'Investments & Savings';
    }
    if (lower.includes('freelance') || lower.includes('client') || lower.includes('invoice') || lower.includes('upwork')) {
      return 'Freelance & Business';
    }
    return 'Transfers & Family';
  }

  // Check each category's keyword list
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORD_MAP)) {
    for (const kw of keywords) {
      // Word boundary match or substring for distinct terms
      if (lower.includes(kw.toLowerCase())) {
        return category;
      }
    }
  }

  return 'General & Others';
}

/**
 * Extract date from text (formats: DD-MM-YYYY, DD/MM/YY, DD-MMM-YY, YYYY-MM-DD, etc.)
 */
export function extractDate(text: string): { date: string; time: string } {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  let dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  let timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  // Time matcher (e.g., "14:30", "02:45 PM", "12:15:30")
  const timeMatch = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?\s*(am|pm)?\b/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2];
    const modifier = timeMatch[3]?.toLowerCase();
    if (modifier === 'pm' && hours < 12) hours += 12;
    if (modifier === 'am' && hours === 12) hours = 0;
    timeStr = `${pad(hours)}:${minutes}`;
  }

  // Pattern: 14-Oct-26 or 14-October-2026
  const monthNames: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  };
  const namedMonthMatch = text.match(/\b(\d{1,2})[-/ ]([A-Za-z]{3,9})[-/ ](\d{2,4})\b/);
  if (namedMonthMatch) {
    const day = pad(parseInt(namedMonthMatch[1], 10));
    const mStr = namedMonthMatch[2].substring(0, 3).toLowerCase();
    const month = monthNames[mStr];
    let year = namedMonthMatch[3];
    if (year.length === 2) year = `20${year}`;
    if (month) {
      dateStr = `${year}-${month}-${day}`;
      return { date: dateStr, time: timeStr };
    }
  }

  // Pattern: DD-MM-YYYY or DD/MM/YYYY or DD-MM-YY
  const dmyMatch = text.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\b/);
  if (dmyMatch) {
    const day = pad(parseInt(dmyMatch[1], 10));
    const month = pad(parseInt(dmyMatch[2], 10));
    let year = dmyMatch[3];
    if (year.length === 2) year = `20${year}`;
    // Basic validity check: day <= 31, month <= 12
    if (parseInt(month, 10) <= 12 && parseInt(day, 10) <= 31) {
      dateStr = `${year}-${month}-${day}`;
      return { date: dateStr, time: timeStr };
    }
  }

  return { date: dateStr, time: timeStr };
}

/**
 * Extract UPI ID / VPA (e.g., user@okhdfcbank, merchant.pay@icici, 9876543210@paytm)
 */
export function extractVpa(text: string): string | undefined {
  const vpaMatch = text.match(/\b([a-zA-Z0-9.\-_]{2,40}@[a-zA-Z0-9]{2,20})\b/);
  return vpaMatch ? vpaMatch[1] : undefined;
}

/**
 * Extract UTR / UPI Reference number
 */
export function extractUtr(text: string): string | undefined {
  const utrMatch = text.match(/(?:ref\s*(?:no\.?|id)?|utr|rrn|txn\s*id)[\s:/-]*([0-9]{8,16})/i) 
    || text.match(/\bUPI\/([0-9]{8,16})\b/i);
  return utrMatch ? utrMatch[1] : undefined;
}

/**
 * Main parser that parses raw UPI text, SMS, UPI URI link, or intent string.
 */
export function parseUpiString(input: string): ParsedUpiResult | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // 1. UPI URI format: upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...
  if (trimmed.startsWith('upi://') || trimmed.includes('upi://pay')) {
    try {
      const urlString = trimmed.startsWith('upi://') ? trimmed : trimmed.substring(trimmed.indexOf('upi://'));
      const url = new URL(urlString);
      const params = url.searchParams;

      const pa = params.get('pa') || '';
      const pn = params.get('pn') ? decodeURIComponent(params.get('pn')!) : '';
      const am = params.get('am') || '0';
      const tn = params.get('tn') ? decodeURIComponent(params.get('tn')!) : '';
      const tr = params.get('tr') || params.get('tid') || '';

      const amount = cleanAmount(am);
      const title = pn || tn || (pa ? pa.split('@')[0] : 'UPI Payment');
      const category = inferCategory(`${pn} ${tn} ${pa}`, 'expense');
      const { date, time } = extractDate(trimmed);

      return {
        title: title.charAt(0).toUpperCase() + title.slice(1),
        amount,
        type: 'expense',
        category,
        date,
        time,
        paymentMethod: 'UPI',
        upiDetails: {
          vpa: pa || undefined,
          refNumber: tr || undefined,
          payeeName: pn || undefined,
          rawString: trimmed,
        },
        notes: tn ? `UPI Note: ${tn}` : undefined,
        confidence: 0.95,
        detectedFormat: 'upi_uri',
      };
    } catch {
      // Fallback to text parsing if URL parsing fails
    }
  }

  // 2. Bank / UPI SMS analysis
  const lower = trimmed.toLowerCase();
  const isCredit = 
    lower.includes('credited') || 
    lower.includes('received') || 
    lower.includes('deposited') || 
    lower.includes('added to your account') ||
    lower.includes('cashback') ||
    lower.includes('refund');

  const isDebit = 
    lower.includes('debited') || 
    lower.includes('paid') || 
    lower.includes('sent') || 
    lower.includes('spent') || 
    lower.includes('withdrawn') || 
    lower.includes('transferred to') ||
    lower.includes('txn of') ||
    lower.includes('purchase');

  const type: TransactionType = isCredit && !isDebit ? 'income' : 'expense';

  // Amount extraction: Look for patterns like "Rs. 450", "INR 1,200.50", "₹ 340", "by 500.00", "for Rs 200"
  let amount = 0;
  const amountPatterns = [
    /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:debited(?:\sby|\sfor)?|credited(?:\sby|\swith)?|paid|sent)\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:txn\s*of|amount\s*(?:is|of)?)\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /\b([\d,]+(?:\.\d{1,2})?)\s*(?:rs\.?|inr|₹)/i,
  ];

  for (const pat of amountPatterns) {
    const match = trimmed.match(pat);
    if (match && match[1]) {
      const parsed = cleanAmount(match[1]);
      if (parsed > 0) {
        amount = parsed;
        break;
      }
    }
  }

  // If amount still 0, check standalone number if string is short
  if (amount === 0) {
    const fallbackNum = trimmed.match(/\b\d+(?:\.\d{1,2})?\b/);
    if (fallbackNum) {
      amount = cleanAmount(fallbackNum[0]);
    }
  }

  // Merchant / Beneficiary / Sender extraction
  let partyName = '';
  
  // Patterns like: "to SWIGGY", "to STARBUCKS", "transfer to XYZ", "from Rahul Sharma"
  const partyPatterns = [
    /(?:to|towards|at)\s+([A-Za-z0-9\s&.'-]{2,35}?)(?=\s+(?:on|via|ref|upi|bal|a\/c|using|\.|\n|$))/i,
    /(?:from)\s+([A-Za-z0-9\s&.'-]{2,35}?)(?=\s+(?:on|via|ref|upi|bal|a\/c|\.|\n|$))/i,
    /info:\s*upi\/[0-9]+\/([A-Za-z0-9\s&.'-]+)/i,
    /vpa\s+([a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+)/i,
  ];

  for (const pat of partyPatterns) {
    const match = trimmed.match(pat);
    if (match && match[1]) {
      const candidate = match[1].trim();
      // filter out generic stop words
      if (!['upi', 'account', 'bank', 'transfer', 'your', 'rs', 'inr'].includes(candidate.toLowerCase())) {
        partyName = candidate;
        break;
      }
    }
  }

  // Extract VPA and UTR
  const vpa = extractVpa(trimmed);
  const utr = extractUtr(trimmed);
  const { date, time } = extractDate(trimmed);

  // If partyName is not found, derive from VPA handle or default
  if (!partyName && vpa) {
    const prefix = vpa.split('@')[0];
    partyName = prefix.replace(/[._]/g, ' ');
  }

  // Title formatting
  let title = partyName || (type === 'income' ? 'Received Payment' : 'UPI Payment');
  // Capitalize nicely
  title = title.replace(/\b\w/g, (char) => char.toUpperCase());

  // Category inference
  const category = inferCategory(`${partyName} ${trimmed}`, type);

  return {
    title,
    amount,
    type,
    category,
    date,
    time,
    paymentMethod: 'UPI',
    upiDetails: {
      vpa,
      refNumber: utr,
      payeeName: type === 'expense' ? partyName : undefined,
      payerName: type === 'income' ? partyName : undefined,
      rawString: trimmed,
    },
    notes: utr ? `UPI Ref: ${utr}` : undefined,
    confidence: amount > 0 ? 0.85 : 0.6,
    detectedFormat: type === 'income' ? 'sms_credit' : 'sms_debit',
  };
}
