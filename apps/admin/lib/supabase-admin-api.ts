'use client';

import { supabase } from './supabase';

async function buildAuthHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function request<T>(url: string, method: 'PATCH', body: Record<string, unknown>): Promise<T | null> {
  try {
    const headers = await buildAuthHeaders();
    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const supabaseAdminApi = {
  updateRoomBasePrice(roomId: string, basePrice: number) {
    return request<{ ok: boolean }>(`/api/admin/rooms/${roomId}/price`, 'PATCH', { basePrice });
  },
  updateBookingStatus(bookingId: string, status: string, reason?: string) {
    return request<{ ok: boolean }>(`/api/admin/bookings/${bookingId}/status`, 'PATCH', { status, reason });
  },
  updatePaymentStatus(paymentId: string, bookingId: string, status: string, reason?: string) {
    return request<{ ok: boolean; bookingStatus?: string }>(`/api/admin/payments/${paymentId}/status`, 'PATCH', {
      bookingId,
      status,
      reason,
    });
  },
};
