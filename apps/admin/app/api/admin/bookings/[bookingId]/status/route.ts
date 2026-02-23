import { NextResponse } from 'next/server';
import {
  COMPANY_ID,
  PROPERTY_ID,
  getActorWithProfile,
  getServiceClient,
  getUserRole,
  logAdminAction,
  requireAuthenticatedUser,
} from '../../../_lib';
import type { BookingStatus } from '@/lib/shared/types';

export async function PATCH(req: Request, context: { params: Promise<{ bookingId: string }> }) {
  const auth = await requireAuthenticatedUser(req);
  if ('error' in auth) return auth.error;

  const service = getServiceClient();
  if (!service) {
    return NextResponse.json({ ok: false, error: 'Service role is not configured' }, { status: 500 });
  }
  const role = await getUserRole(service, auth.user.id);

  const { bookingId } = await context.params;
  const body = (await req.json()) as { status?: BookingStatus; reason?: string };
  const status = body.status;
  const reason = body.reason;
  if (!bookingId || !status) {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }
  if (status === 'cancelled' && role !== 'admin' && role !== 'super_admin') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const now = Date.now();
  const updateData: Record<string, unknown> = { status, updated_at: now, updatedAt: now };
  if (status === 'cancelled') {
    updateData.cancelled_at = now;
    updateData.cancelledAt = now;
    updateData.cancel_reason = reason || 'Cancelled by admin';
    updateData.cancelReason = reason || 'Cancelled by admin';
  }
  if (status === 'completed') {
    updateData.check_in_completed = true;
    updateData.checkInCompleted = true;
    updateData.check_in_completed_at = now;
    updateData.checkInCompletedAt = now;
  }

  const { error } = await service
    .from('bookings')
    .update(updateData)
    .eq('company_id', COMPANY_ID)
    .or(`property_id.eq.${PROPERTY_ID},property_slug.eq.${PROPERTY_ID}`)
    .eq('id', bookingId);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const actor = await getActorWithProfile(service, auth.user);
  await logAdminAction(service, 'booking.status.update', 'booking', bookingId, actor, {
    status,
    reason: reason || null,
    role,
  });
  return NextResponse.json({ ok: true });
}
