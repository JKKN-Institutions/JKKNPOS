const DEFAULT_CURRENCY = 'INR'
const DEFAULT_LOCALE = 'en-IN'

export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(
  value: number,
  locale: string = DEFAULT_LOCALE
): string {
  return new Intl.NumberFormat(locale).format(value)
}

export function parseCurrency(value: string): number {
  // Remove currency symbols and formatting
  const cleaned = value.replace(/[^0-9.-]/g, '')
  return parseFloat(cleaned) || 0
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}

export function calculateDiscount(
  subtotal: number,
  discount: number,
  type: 'percentage' | 'fixed'
): number {
  if (type === 'percentage') {
    return (subtotal * discount) / 100
  }
  return Math.min(discount, subtotal)
}

export function calculateTax(amount: number, taxRate: number): number {
  return (amount * taxRate) / 100
}
