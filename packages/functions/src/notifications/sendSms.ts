import * as functions from 'firebase-functions';

interface SmsPayload {
  to: string;
  body: string;
}

async function sendWithTwilio(payload: SmsPayload) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER || '+15005550006';

  if (!accountSid || !authToken) {
    functions.logger.warn('Twilio credentials not set, skipping SMS');
    return { success: false, reason: 'no_credentials' };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const params = new URLSearchParams();
  params.append('To', payload.to);
  params.append('From', fromNumber);
  params.append('Body', payload.body);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      functions.logger.error('Twilio error:', error);
      return { success: false, reason: error };
    }

    const data = await response.json();
    return { success: true, sid: data.sid };
  } catch (error) {
    functions.logger.error('SMS send error:', error);
    return { success: false, reason: String(error) };
  }
}

export async function sendBookingConfirmationSms(data: {
  guestPhone: string;
  guestName: string;
  bookingId: string;
  checkIn: number;
  totalNights: number;
}) {
  const checkInDate = new Date(data.checkIn).toLocaleDateString('en-TZ', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const message = `Hi ${data.guestName}! Your booking at Twiga Residence is confirmed. Ref: ${data.bookingId}. Check-in: ${checkInDate} (${data.totalNights} nights). Questions? WhatsApp us. - Twiga Residence`;

  return sendWithTwilio({ to: data.guestPhone, body: message });
}

export async function sendBookingCancellationSms(data: {
  guestPhone: string;
  guestName: string;
  bookingId: string;
}) {
  const message = `Hi ${data.guestName}, your booking ${data.bookingId} at Twiga Residence has been cancelled. Contact us if you need help. - Twiga Residence`;

  return sendWithTwilio({ to: data.guestPhone, body: message });
}

export async function sendPaymentReminderSms(data: {
  guestPhone: string;
  guestName: string;
  bookingId: string;
  amount: number;
}) {
  const formattedAmount = new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(data.amount / 100);

  const message = `Hi ${data.guestName}, reminder: your deposit of ${formattedAmount} for booking ${data.bookingId} is pending. Complete payment to confirm your stay. - Twiga Residence`;

  return sendWithTwilio({ to: data.guestPhone, body: message });
}
