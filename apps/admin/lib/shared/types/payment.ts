export type PaymentStatus =
  | 'initiated'
  | 'processing'
  | 'confirmed'
  | 'failed'
  | 'refunded';

export type PaymentMethod =
  | 'mobile_money'
  | 'card'
  | 'pay_on_arrival'
  | 'bank_transfer';

export type MobileProvider = 'mtn' | 'vodafone' | 'airtel' | 'tigo' | null;

export interface TwigaPayment {
  id: string;
  bookingId: string;
  propertyId: string;
  amount: number;
  currency: 'TZS' | 'USD';
  method: PaymentMethod;
  flutterwaveRef: string;
  idempotencyKey: string;
  status: PaymentStatus;
  mobileProvider?: MobileProvider;
  phoneNumber?: string;
  stkPushAttempts: number;
  webhookReceived: boolean;
  webhookAt?: number;
  createdAt: number;
  confirmedAt?: number;
  failureReason?: string;
  metadata: {
    last4?: string;
    stkPromptSent?: boolean;
    pollingAttempts?: number;
    lastPollingTime?: number;
  };
}

export interface FlutterwaveWebhookEvent {
  event: 'charge.completed' | 'charge.failed';
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    status: 'successful' | 'failed' | 'pending';
    amount: number;
    currency: string;
    customer: {
      email: string;
      phonenumber: string;
      name: string;
    };
    meta?: {
      propertyId?: string;
      bookingId?: string;
      roomId?: string;
    };
  };
}
