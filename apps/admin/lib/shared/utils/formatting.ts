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

export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return phone;
  const start = cleaned.slice(0, 3);
  const end = cleaned.slice(-2);
  const middle = 'X'.repeat(cleaned.length - 5);
  return `+${start}${middle}${end}`;
}

export function formatDate(timestamp: number, locale: string = 'en-TZ'): string {
  return new Date(timestamp).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-TZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateNights(checkIn: number, checkOut: number): number {
  const days = Math.floor((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  return Math.max(days, 1);
}
