import { Transaction } from '../types/finance';

/**
 * Parses raw CSV or tab-separated (Excel copied) text into structured Transaction records.
 */
export function parseCsvOrSpreadsheetText(rawText: string): {
  success: boolean;
  records: Transaction[];
  error?: string;
  totalParsed: number;
} {
  if (!rawText || !rawText.trim()) {
    return { success: false, records: [], totalParsed: 0, error: 'File or text input is empty.' };
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { success: false, records: [], totalParsed: 0, error: 'No data rows found in spreadsheet.' };
  }

  // Helper to split CSV row handling quotes and tab separators
  const parseRow = (line: string): string[] => {
    // If tab-separated (e.g., copied from Excel/Google Sheets)
    if (line.includes('\t') && !line.includes(',')) {
      return line.split('\t').map((col) => col.trim().replace(/^["']|["']$/g, ''));
    }

    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result.map((col) => col.replace(/^["']|["']$/g, ''));
  };

  const rows = lines.map(parseRow);
  const firstRow = rows[0].map((cell) => cell.toLowerCase());

  // Determine if first row is header
  let hasHeader = false;
  let titleIdx = -1;
  let amountIdx = -1;
  let typeIdx = -1;
  let categoryIdx = -1;
  let dateIdx = -1;
  let timeIdx = -1;
  let methodIdx = -1;
  let notesIdx = -1;

  for (let i = 0; i < firstRow.length; i++) {
    const col = firstRow[i];
    if (col.includes('title') || col.includes('description') || col.includes('name') || col.includes('item') || col.includes('transaction')) {
      titleIdx = i;
      hasHeader = true;
    } else if (col.includes('amount') || col.includes('sum') || col.includes('price') || col.includes('cost') || col.includes('val')) {
      amountIdx = i;
      hasHeader = true;
    } else if (col.includes('type') || col.includes('kind') || col.includes('flow')) {
      typeIdx = i;
      hasHeader = true;
    } else if (col.includes('category')) {
      categoryIdx = i;
      hasHeader = true;
    } else if (col.includes('date') || col.includes('day') || col.includes('time')) {
      if (col.includes('time') && !col.includes('date')) {
        timeIdx = i;
      } else {
        dateIdx = i;
      }
      hasHeader = true;
    } else if (col.includes('method') || col.includes('payment') || col.includes('account')) {
      methodIdx = i;
      hasHeader = true;
    } else if (col.includes('note') || col.includes('memo') || col.includes('remark') || col.includes('comment')) {
      notesIdx = i;
      hasHeader = true;
    }
  }

  // Fallback positional indices if header not clearly detected
  if (!hasHeader || amountIdx === -1) {
    // Check if 1st row contains numbers
    titleIdx = 0;
    amountIdx = 1;
    dateIdx = 2;
  }

  const dataRows = hasHeader ? rows.slice(1) : rows;
  const parsedRecords: Transaction[] = [];

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const defaultToday = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  for (let r = 0; r < dataRows.length; r++) {
    const row = dataRows[r];
    if (row.length === 0 || (row.length === 1 && !row[0])) continue;

    const rawTitle = titleIdx >= 0 && row[titleIdx] ? row[titleIdx] : `Transaction #${r + 1}`;
    const rawAmountStr = amountIdx >= 0 && row[amountIdx] ? row[amountIdx] : '';

    // Clean amount (remove currency symbols, commas, spaces)
    const cleanAmountStr = rawAmountStr.replace(/[₹$,\s]/g, '');
    let amount = parseFloat(cleanAmountStr);
    if (isNaN(amount)) continue; // skip non-numeric rows

    let type: 'income' | 'expense' = 'expense';
    if (amount < 0) {
      type = 'expense';
      amount = Math.abs(amount);
    }

    if (typeIdx >= 0 && row[typeIdx]) {
      const typeStr = row[typeIdx].toLowerCase();
      if (typeStr.includes('in') || typeStr.includes('credit') || typeStr.includes('gain') || typeStr.includes('salary')) {
        type = 'income';
      } else if (typeStr.includes('out') || typeStr.includes('debit') || typeStr.includes('expense') || typeStr.includes('spend')) {
        type = 'expense';
      }
    } else {
      // Infer from title/category keywords
      const titleLower = rawTitle.toLowerCase();
      if (
        titleLower.includes('salary') ||
        titleLower.includes('credit') ||
        titleLower.includes('refund') ||
        titleLower.includes('freelance') ||
        titleLower.includes('stipend') ||
        titleLower.includes('payout')
      ) {
        type = 'income';
      }
    }

    const rawCategory = categoryIdx >= 0 && row[categoryIdx] ? row[categoryIdx] : (type === 'income' ? 'Salary & Earnings' : 'General & Others');

    // Parse Date format
    let date = defaultToday;
    if (dateIdx >= 0 && row[dateIdx]) {
      const rawDateStr = row[dateIdx].trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawDateStr)) {
        date = rawDateStr;
      } else if (/^\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4}$/.test(rawDateStr)) {
        const parts = rawDateStr.split(/[\/\.-]/);
        // Assume DD/MM/YYYY
        if (parts.length === 3) {
          const p1 = parseInt(parts[0], 10);
          const p2 = parseInt(parts[1], 10);
          const p3 = parseInt(parts[2], 10);
          if (p1 > 12) {
            // DD/MM/YYYY
            date = `${p3}-${pad(p2)}-${pad(p1)}`;
          } else {
            // Standard MM/DD/YYYY or DD/MM/YYYY
            date = `${p3}-${pad(p2)}-${pad(p1)}`;
          }
        }
      }
    }

    const time = timeIdx >= 0 && row[timeIdx] ? row[timeIdx] : '12:00';
    const paymentMethod = methodIdx >= 0 && row[methodIdx] ? row[methodIdx] : 'UPI';
    const notes = notesIdx >= 0 && row[notesIdx] ? row[notesIdx] : '';

    parsedRecords.push({
      id: `tx-import-${Date.now()}-${r}-${Math.random().toString(36).substring(2, 6)}`,
      title: rawTitle,
      amount,
      type,
      category: rawCategory,
      date,
      time,
      paymentMethod,
      notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  if (parsedRecords.length === 0) {
    return {
      success: false,
      records: [],
      totalParsed: 0,
      error: 'Could not extract valid transaction records from the file. Ensure amount and title columns are present.',
    };
  }

  return {
    success: true,
    records: parsedRecords,
    totalParsed: parsedRecords.length,
  };
}
