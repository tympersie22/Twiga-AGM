export enum PaymentErrorCode {
  TIMEOUT = 'TIMEOUT',
  NETWORK = 'NETWORK',
  STK_NOT_RECEIVED = 'STK_NOT_RECEIVED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_CARD = 'INVALID_CARD',
  CARD_DECLINED = 'CARD_DECLINED',
  WEBHOOK_FAILED = 'WEBHOOK_FAILED',
  DUPLICATE = 'DUPLICATE',
  TRY_LATER = 'TRY_LATER',
  UNKNOWN = 'UNKNOWN',
}

export const PAYMENT_ERROR_MESSAGES: Record<PaymentErrorCode, string> = {
  [PaymentErrorCode.TIMEOUT]: 'Payment took too long. Please try again.',
  [PaymentErrorCode.NETWORK]: 'Connection interrupted. Your payment may still process.',
  [PaymentErrorCode.STK_NOT_RECEIVED]: "Payment prompt didn't arrive. Retry with mobile money.",
  [PaymentErrorCode.INSUFFICIENT_FUNDS]: 'Not enough money in your account.',
  [PaymentErrorCode.INVALID_CARD]: 'Card details are incorrect.',
  [PaymentErrorCode.CARD_DECLINED]: 'Your bank declined this transaction.',
  [PaymentErrorCode.WEBHOOK_FAILED]: "We couldn't confirm your payment. Contact support.",
  [PaymentErrorCode.DUPLICATE]: 'This payment was already processed.',
  [PaymentErrorCode.TRY_LATER]: 'Our payment system is temporarily unavailable.',
  [PaymentErrorCode.UNKNOWN]: 'An unexpected error occurred. Please contact support.',
};

export class TwigaError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'TwigaError';
  }
}

export class PaymentError extends TwigaError {
  constructor(code: PaymentErrorCode, message?: string, details?: Record<string, unknown>) {
    super(code, message || PAYMENT_ERROR_MESSAGES[code], details);
    this.name = 'PaymentError';
  }
}

export class ValidationError extends TwigaError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}
