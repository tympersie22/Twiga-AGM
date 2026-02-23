import { NextResponse } from 'next/server';
import { createClient, type User } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const COMPANY_ID = 'twiga-agm';
export const PROPERTY_ID = 'twiga-residence';
export type AdminRole = 'admin' | 'manager' | 'super_admin';

export function getServiceClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getAnonClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function requireAuthenticatedUser(req: Request): Promise<{ user: User } | { error: NextResponse }> {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return { error: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) };
  }

  const anon = getAnonClient();
  if (!anon) {
    return { error: NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 }) };
  }

  const { data, error } = await anon.auth.getUser(token);
  if (error || !data.user) {
    return { error: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) };
  }

  return { user: data.user };
}

export function getActor(user: User) {
  return {
    uid: user.id,
    email: user.email || null,
    displayName: ((user.user_metadata?.full_name as string | undefined) || user.email || 'Admin') as string,
  };
}

export async function getActorWithProfile(
  service: ReturnType<typeof getServiceClient>,
  user: User,
): Promise<ReturnType<typeof getActor>> {
  const fallback = getActor(user);
  if (!service) return fallback;

  const { data } = await service.from('admin_profiles').select('full_name').eq('user_id', user.id).maybeSingle();
  const profileName = typeof data?.full_name === 'string' ? data.full_name.trim() : '';

  return {
    ...fallback,
    displayName: profileName || fallback.displayName,
  };
}

export async function getUserRole(service: ReturnType<typeof getServiceClient>, userId: string): Promise<AdminRole> {
  if (!service) return 'manager';
  const { data } = await service.from('admin_profiles').select('role').eq('user_id', userId).maybeSingle();
  const role = data?.role;
  if (role === 'admin' || role === 'super_admin') return role;
  return 'manager';
}

export async function logAdminAction(
  service: ReturnType<typeof getServiceClient>,
  action: string,
  entityType: 'booking' | 'payment' | 'room',
  entityId: string,
  actor: ReturnType<typeof getActor>,
  metadata?: Record<string, unknown>
) {
  if (!service) return;
  await service.from('admin_logs').insert({
    company_id: COMPANY_ID,
    property_id: PROPERTY_ID,
    action,
    entity_type: entityType,
    entity_id: entityId,
    actor,
    metadata: metadata || {},
    created_at: Date.now(),
  });
}
