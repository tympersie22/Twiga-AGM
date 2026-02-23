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

export async function PATCH(req: Request, context: { params: Promise<{ roomId: string }> }) {
  const auth = await requireAuthenticatedUser(req);
  if ('error' in auth) return auth.error;

  const service = getServiceClient();
  if (!service) {
    return NextResponse.json({ ok: false, error: 'Service role is not configured' }, { status: 500 });
  }
  const role = await getUserRole(service, auth.user.id);
  if (role !== 'admin' && role !== 'super_admin') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const { roomId } = await context.params;
  const body = (await req.json()) as { basePrice?: number };
  const basePrice = Number(body.basePrice ?? 0);
  if (!roomId || !Number.isFinite(basePrice) || basePrice <= 0) {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }

  const { error } = await service
    .from('rooms')
    .update({ base_price: basePrice, basePrice, updated_at: Date.now() })
    .eq('company_id', COMPANY_ID)
    .or(`property_id.eq.${PROPERTY_ID},property_slug.eq.${PROPERTY_ID}`)
    .eq('id', roomId);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const actor = await getActorWithProfile(service, auth.user);
  await logAdminAction(service, 'room.price.update', 'room', roomId, actor, { basePrice, role });
  return NextResponse.json({ ok: true });
}
