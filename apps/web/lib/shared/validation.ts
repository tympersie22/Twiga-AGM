export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validateTanzanianPhone(phone: string): boolean {
  const regex = /^\+255\d{9}$/;
  return regex.test(phone);
}

export function validateBookingDates(
  checkIn: number,
  checkOut: number
): { valid: boolean; error?: string } {
  const now = Date.now();
  const minCheckIn = now + 24 * 60 * 60 * 1000;
  if (checkIn < minCheckIn) {
    return { valid: false, error: 'Check-in must be at least 24 hours from now' };
  }
  if (checkOut <= checkIn) {
    return { valid: false, error: 'Check-out must be after check-in' };
  }
  const maxStay = 90 * 24 * 60 * 60 * 1000;
  if (checkOut - checkIn > maxStay) {
    return { valid: false, error: 'Maximum stay is 90 days' };
  }
  return { valid: true };
}
