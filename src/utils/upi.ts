/**
 * UPI Protocol and deep link utilities for NPCI-compliant payments
 */

export interface UpiPayParams {
  pa: string; // Payee VPA / UPI ID
  pn: string; // Payee Name
  am: number; // Amount in INR
  tn?: string; // Transaction note
  cu?: string; // Currency, defaults to INR
}

/**
 * Builds an NPCI-compliant UPI deep link URL
 * Format: upi://pay?pa={upiId}&pn={name}&am={amount}&cu=INR&tn={note}
 */
export function buildUpiPayUrl({
  pa,
  pn,
  am,
  tn = 'Bill Split via PaisaTrack',
  cu = 'INR',
}: UpiPayParams): string {
  const params = new URLSearchParams({
    pa: pa.trim(),
    pn: pn.trim(),
    am: am.toFixed(2),
    cu,
    tn,
  });
  return `upi://pay?${params.toString()}`;
}

/**
 * Validates whether a string has a basic valid UPI VPA format (user@bank)
 */
export function isValidUpiId(vpa: string): boolean {
  if (!vpa || typeof vpa !== 'string') return false;
  const regex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return regex.test(vpa.trim());
}
