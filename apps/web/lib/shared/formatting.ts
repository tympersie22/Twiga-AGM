export function formatCurrency(amount: number, currency: string = 'TZS'): string {
  if (currency === 'TZS') {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount / 100);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
}

export function formatDate(timestamp: number, locale: string = 'en-TZ'): string {
  return new Date(timestamp).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function calculateNights(checkIn: number, checkOut: number): number {
  const days = Math.floor((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  return Math.max(days, 1);
}
