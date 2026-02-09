import * as functions from 'firebase-functions';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

async function sendWithSendGrid(payload: EmailPayload) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    functions.logger.warn('SENDGRID_API_KEY not set, skipping email');
    return { success: false, reason: 'no_api_key' };
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: payload.to }] }],
      from: { email: 'bookings@twiga-agm.com', name: 'Twiga Residence' },
      subject: payload.subject,
      content: [{ type: 'text/html', value: payload.html }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    functions.logger.error('SendGrid error:', error);
    return { success: false, reason: error };
  }

  return { success: true };
}

export async function sendBookingConfirmationEmail(data: {
  guestName: string;
  guestEmail: string;
  bookingId: string;
  roomName: string;
  checkIn: number;
  checkOut: number;
  totalNights: number;
  totalPrice: number;
  depositAmount: number;
}) {
  const checkInDate = new Date(data.checkIn).toLocaleDateString('en-TZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const checkOutDate = new Date(data.checkOut).toLocaleDateString('en-TZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTotal = new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(data.totalPrice / 100);
  const formattedDeposit = new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(data.depositAmount / 100);

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;margin-top:20px;">
        <div style="background:#2d5f2e;padding:30px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">Twiga Residence</h1>
          <p style="color:#a7d5a8;margin:5px 0 0;">Booking Confirmation</p>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#333;margin:0 0 10px;">Hello ${data.guestName},</h2>
          <p style="color:#666;line-height:1.6;">Your booking has been confirmed! Here are your details:</p>

          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#666;">Booking Reference</td><td style="padding:8px 0;text-align:right;font-weight:bold;color:#2d5f2e;font-family:monospace;font-size:18px;">${data.bookingId}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Room</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#333;">${data.roomName}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Check-in</td><td style="padding:8px 0;text-align:right;color:#333;">${checkInDate}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Check-out</td><td style="padding:8px 0;text-align:right;color:#333;">${checkOutDate}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Nights</td><td style="padding:8px 0;text-align:right;color:#333;">${data.totalNights}</td></tr>
              <tr style="border-top:1px solid #e5e7eb;"><td style="padding:12px 0;font-weight:600;color:#333;">Total</td><td style="padding:12px 0;text-align:right;font-weight:bold;color:#2d5f2e;font-size:18px;">${formattedTotal}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Deposit Paid</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#333;">${formattedDeposit}</td></tr>
            </table>
          </div>

          <p style="color:#666;line-height:1.6;">If you have any questions, feel free to reach out via WhatsApp or email.</p>

          <div style="text-align:center;margin:30px 0;">
            <a href="https://wa.me/255XXXXXXXXX" style="display:inline-block;background:#2d5f2e;color:#fff;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:600;">Chat on WhatsApp</a>
          </div>

          <p style="color:#999;font-size:12px;text-align:center;margin-top:30px;">
            Twiga Residence, Zanzibar, Tanzania<br>
            bookings@twiga-agm.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendWithSendGrid({
    to: data.guestEmail,
    subject: `Booking Confirmed - ${data.bookingId} | Twiga Residence`,
    html,
  });
}

export async function sendBookingCancellationEmail(data: {
  guestName: string;
  guestEmail: string;
  bookingId: string;
  reason?: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;margin-top:20px;">
        <div style="background:#dc2626;padding:30px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">Twiga Residence</h1>
          <p style="color:#fca5a5;margin:5px 0 0;">Booking Cancellation</p>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#333;margin:0 0 10px;">Hello ${data.guestName},</h2>
          <p style="color:#666;line-height:1.6;">Your booking <strong>${data.bookingId}</strong> has been cancelled.</p>
          ${data.reason ? `<p style="color:#666;line-height:1.6;">Reason: ${data.reason}</p>` : ''}
          <p style="color:#666;line-height:1.6;">If this was a mistake or you have any questions, please contact us.</p>
          <div style="text-align:center;margin:30px 0;">
            <a href="mailto:bookings@twiga-agm.com" style="display:inline-block;background:#2d5f2e;color:#fff;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:600;">Contact Us</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendWithSendGrid({
    to: data.guestEmail,
    subject: `Booking Cancelled - ${data.bookingId} | Twiga Residence`,
    html,
  });
}
