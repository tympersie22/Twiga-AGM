import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

export interface FlutterwaveInitializePaymentPayload {
  tx_ref: string;
  amount: number;
  currency: 'TZS' | 'USD';
  payment_options: string;
  customer: { email: string; phonenumber: string; name: string };
  customizations: { title: string; description: string; logo: string };
  meta?: Record<string, unknown>;
  redirect_url: string;
}

export interface FlutterwaveInitializeResponse {
  status: string;
  message: string;
  data?: { link: string; payment_link: string };
}

export interface FlutterwaveVerifyResponse {
  status: string;
  message: string;
  data?: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    status: 'successful' | 'failed' | 'pending';
    amount: number;
    currency: string;
    customer: { id: number; email: string; phonenumber: string; name: string };
    payment_type: string;
    meta?: Record<string, unknown>;
    created_at: string;
  };
}

export class FlutterwaveAPI {
  private client: AxiosInstance;
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
    this.client = axios.create({
      baseURL: 'https://api.flutterwave.com/v3',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  async initializePayment(payload: FlutterwaveInitializePaymentPayload): Promise<FlutterwaveInitializeResponse> {
    try {
      const response = await this.client.post('/payments', payload);
      return response.data;
    } catch (error) {
      console.error('Flutterwave initialize error:', error);
      throw new Error('Failed to initialize payment');
    }
  }

  async verifyPayment(transactionId: string): Promise<FlutterwaveVerifyResponse> {
    try {
      const response = await this.client.get(`/transactions/${transactionId}/verify`);
      return response.data;
    } catch (error) {
      console.error('Flutterwave verify error:', error);
      throw new Error('Failed to verify payment');
    }
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    const hash = crypto.createHmac('sha256', this.secretKey).update(body).digest('hex');
    return hash === signature;
  }

  async refundPayment(transactionId: string, amount?: number): Promise<Record<string, unknown>> {
    try {
      const payload: Record<string, unknown> = amount != null ? { amount } : {};
      const response = await this.client.post(`/transactions/${transactionId}/refund`, payload);
      return response.data;
    } catch (error) {
      console.error('Flutterwave refund error:', error);
      throw new Error('Failed to refund payment');
    }
  }

  async checkTransactionStatus(txRef: string): Promise<FlutterwaveVerifyResponse> {
    try {
      const response = await this.client.get('/transactions', { params: { tx_ref: txRef } });
      if (response.data?.data?.length > 0) {
        return {
          status: response.data.status,
          message: response.data.message,
          data: response.data.data[0],
        };
      }
      throw new Error('Transaction not found');
    } catch (error) {
      console.error('Flutterwave check status error:', error);
      throw error;
    }
  }
}
