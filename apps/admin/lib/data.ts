import { db, isFirebaseConfigured } from './firebase';
import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { MOCK_BOOKINGS, MOCK_ROOMS, MOCK_PAYMENTS } from '@/lib/shared';
import type { TwigaBooking, TwigaRoom, TwigaPayment } from '@/lib/shared/types';
import type { BookingStatus, PaymentStatus } from '@/lib/shared/types';
import { auth } from './firebase';
import { isSupabaseConfigured, supabase } from './supabase';
import { supabaseAdminApi } from './supabase-admin-api';

const COMPANY_ID = 'twiga-agm';
const PROPERTY_ID = 'twiga-residence';

const sortByCreatedDesc = <T extends { createdAt?: number }>(items: T[]) =>
  items.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

const isDemoMode = () => {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const firebaseUnavailable =
    !isFirebaseConfigured || !projectId || projectId === 'demo-project' || projectId.startsWith('demo');
  return firebaseUnavailable && !isSupabaseConfigured;
};

export interface AdminLogEntry {
  id: string;
  action: string;
  entityType: 'booking' | 'payment' | 'room' | string;
  entityId: string;
  propertyId?: string;
  actor?: {
    uid?: string | null;
    email?: string | null;
    displayName?: string | null;
  };
  metadata?: Record<string, unknown>;
  createdAt: number;
}

const normalizeRoom = (row: Record<string, unknown>): TwigaRoom => ({
  id: String(row.id || ''),
  name: String(row.name || 'Room'),
  type: (row.type as TwigaRoom['type']) || 'standard',
  maxGuests: Number(row.maxGuests ?? row.max_guests ?? 2),
  basePrice: Number(row.basePrice ?? row.base_price ?? 0),
  amenities: Array.isArray(row.amenities) ? (row.amenities as string[]) : [],
  images: Array.isArray(row.images) ? (row.images as string[]) : [],
  description: String(row.description || ''),
  bedroomCount: Number(row.bedroomCount ?? row.bedroom_count ?? 1),
  bathroomCount: Number(row.bathroomCount ?? row.bathroom_count ?? 1),
});

const normalizeBooking = (row: Record<string, unknown>): TwigaBooking => ({
  id: String(row.id || ''),
  propertyId: String(row.propertyId ?? row.property_id ?? PROPERTY_ID),
  guestName: String(row.guestName ?? row.guest_name ?? ''),
  guestEmail: String(row.guestEmail ?? row.guest_email ?? ''),
  guestPhone: String(row.guestPhone ?? row.guest_phone ?? ''),
  roomId: String(row.roomId ?? row.room_id ?? ''),
  checkIn: Number(row.checkIn ?? row.check_in ?? 0),
  checkOut: Number(row.checkOut ?? row.check_out ?? 0),
  pickupTime: row.pickupTime ? String(row.pickupTime) : undefined,
  numberOfGuests: Number(row.numberOfGuests ?? row.number_of_guests ?? 1),
  totalNights: Number(row.totalNights ?? row.total_nights ?? 1),
  roomPrice: Number(row.roomPrice ?? row.room_price ?? 0),
  totalPrice: Number(row.totalPrice ?? row.total_price ?? 0),
  paymentId: String(row.paymentId ?? row.payment_id ?? ''),
  source: (row.source as TwigaBooking['source']) || 'direct',
  status: (row.status as BookingStatus) || 'pending_payment',
  notes: row.notes ? String(row.notes) : undefined,
  specialRequests: row.specialRequests ? String(row.specialRequests) : undefined,
  createdAt: Number(row.createdAt ?? row.created_at ?? Date.now()),
  updatedAt: Number(row.updatedAt ?? row.updated_at ?? Date.now()),
  cancelledAt: row.cancelledAt ? Number(row.cancelledAt) : undefined,
  cancelReason: row.cancelReason ? String(row.cancelReason) : undefined,
  checkInCompleted: row.checkInCompleted as boolean | undefined,
  checkInCompletedAt: row.checkInCompletedAt ? Number(row.checkInCompletedAt) : undefined,
});

const normalizePayment = (row: Record<string, unknown>): TwigaPayment => ({
  id: String(row.id || ''),
  bookingId: String(row.bookingId ?? row.booking_id ?? ''),
  propertyId: String(row.propertyId ?? row.property_id ?? PROPERTY_ID),
  amount: Number(row.amount ?? 0),
  currency: (row.currency as TwigaPayment['currency']) || 'TZS',
  method: (row.method as TwigaPayment['method']) || 'mobile_money',
  flutterwaveRef: String(row.flutterwaveRef ?? row.flutterwave_ref ?? ''),
  idempotencyKey: String(row.idempotencyKey ?? row.idempotency_key ?? ''),
  status: (row.status as PaymentStatus) || 'initiated',
  mobileProvider: (row.mobileProvider as TwigaPayment['mobileProvider']) || null,
  phoneNumber: row.phoneNumber ? String(row.phoneNumber) : undefined,
  stkPushAttempts: Number(row.stkPushAttempts ?? row.stk_push_attempts ?? 0),
  webhookReceived: Boolean(row.webhookReceived ?? row.webhook_received ?? false),
  webhookAt: row.webhookAt ? Number(row.webhookAt) : undefined,
  createdAt: Number(row.createdAt ?? row.created_at ?? Date.now()),
  confirmedAt: row.confirmedAt ? Number(row.confirmedAt) : undefined,
  failureReason: row.failureReason ? String(row.failureReason) : undefined,
  metadata: (row.metadata as TwigaPayment['metadata']) || {},
});

async function fetchSupabaseRows(table: string) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.from(table).select('*').eq('company_id', COMPANY_ID);
  if (error || !data) return null;
  return (data as Record<string, unknown>[]).filter((row) => {
    const propertyId = String(row.property_id || row.propertyId || row.property_slug || row.propertySlug || '');
    return propertyId ? propertyId === PROPERTY_ID : true;
  });
}

async function seedRoomsIfEmpty(): Promise<void> {
  if (!db) return;

  for (const room of MOCK_ROOMS) {
    const roomRef = doc(db, 'companies', COMPANY_ID, 'properties', PROPERTY_ID, 'rooms', room.id);
    await setDoc(roomRef, room);
  }
}

export async function fetchBookings(): Promise<TwigaBooking[]> {
  if (isDemoMode()) return sortByCreatedDesc(MOCK_BOOKINGS);

  try {
    const rows = await fetchSupabaseRows('bookings');
    if (rows && rows.length > 0) return sortByCreatedDesc(rows.map(normalizeBooking));
  } catch {
    // Continue to Firestore fallback.
  }

  if (!db) return sortByCreatedDesc(MOCK_BOOKINGS);

  try {
    const bookingsRef = collection(db, 'companies', COMPANY_ID, 'properties', PROPERTY_ID, 'bookings');
    const snapshot = await getDocs(bookingsRef);
    if (snapshot.empty) return sortByCreatedDesc(MOCK_BOOKINGS);
    return sortByCreatedDesc(snapshot.docs.map((docSnap) => docSnap.data() as TwigaBooking));
  } catch {
    return sortByCreatedDesc(MOCK_BOOKINGS);
  }
}

export async function fetchRooms(): Promise<TwigaRoom[]> {
  if (isDemoMode()) return MOCK_ROOMS;

  try {
    const rows = await fetchSupabaseRows('rooms');
    if (rows && rows.length > 0) return rows.map(normalizeRoom);
  } catch {
    // Continue to Firestore fallback.
  }

  if (!db) return MOCK_ROOMS;

  try {
    const roomsRef = collection(db, 'companies', COMPANY_ID, 'properties', PROPERTY_ID, 'rooms');
    const snapshot = await getDocs(roomsRef);

    if (snapshot.empty) {
      await seedRoomsIfEmpty();
      return MOCK_ROOMS;
    }

    return snapshot.docs.map((docSnap) => docSnap.data() as TwigaRoom);
  } catch {
    return MOCK_ROOMS;
  }
}

export async function fetchPayments(): Promise<TwigaPayment[]> {
  if (isDemoMode()) return sortByCreatedDesc(MOCK_PAYMENTS);

  try {
    const rows = await fetchSupabaseRows('payments');
    if (rows && rows.length > 0) return sortByCreatedDesc(rows.map(normalizePayment));
  } catch {
    // Continue to Firestore fallback.
  }

  if (!db) return sortByCreatedDesc(MOCK_PAYMENTS);

  try {
    const paymentsQuery = query(collectionGroup(db, 'payments'), where('propertyId', '==', PROPERTY_ID));
    const snapshot = await getDocs(paymentsQuery);

    if (snapshot.empty) return sortByCreatedDesc(MOCK_PAYMENTS);
    return sortByCreatedDesc(snapshot.docs.map((docSnap) => docSnap.data() as TwigaPayment));
  } catch {
    return sortByCreatedDesc(MOCK_PAYMENTS);
  }
}

export async function fetchAdminLogs(): Promise<AdminLogEntry[]> {
  if (isDemoMode()) return [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .eq('company_id', COMPANY_ID)
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((row) => ({
          id: String(row.id || ''),
          action: String(row.action || ''),
          entityType: String(row.entity_type || row.entityType || ''),
          entityId: String(row.entity_id || row.entityId || ''),
          propertyId: String(row.property_id || row.propertyId || ''),
          actor: (row.actor as AdminLogEntry['actor']) || undefined,
          metadata: (row.metadata as Record<string, unknown>) || {},
          createdAt: Number(row.created_at || row.createdAt || Date.now()),
        }));
      }
    } catch {
      // Continue to Firestore fallback.
    }
  }

  if (!db) return [];

  try {
    const logsRef = collection(db, 'companies', COMPANY_ID, 'adminLogs');
    const snapshot = await getDocs(logsRef);
    if (snapshot.empty) return [];
    return sortByCreatedDesc(
      snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<AdminLogEntry, 'id'>) }))
    );
  } catch {
    return [];
  }
}

export function subscribeBookings(
  onData: (bookings: TwigaBooking[]) => void,
  onError?: (err: unknown) => void
): () => void {
  if (isDemoMode()) {
    onData(sortByCreatedDesc(MOCK_BOOKINGS));
    return () => {};
  }

  if (isSupabaseConfigured && !db) {
    let active = true;
    const run = async () => {
      try {
        const bookings = await fetchBookings();
        if (active) onData(bookings);
      } catch (err) {
        onData(sortByCreatedDesc(MOCK_BOOKINGS));
        onError?.(err);
      }
    };
    void run();
    const interval = setInterval(() => void run(), 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }

  if (!db) {
    onData(sortByCreatedDesc(MOCK_BOOKINGS));
    return () => {};
  }

  const bookingsRef = collection(db, 'companies', COMPANY_ID, 'properties', PROPERTY_ID, 'bookings');
  return onSnapshot(
    bookingsRef,
    (snapshot) => {
      if (snapshot.empty) {
        onData(sortByCreatedDesc(MOCK_BOOKINGS));
        return;
      }
      onData(sortByCreatedDesc(snapshot.docs.map((docSnap) => docSnap.data() as TwigaBooking)));
    },
    (err) => {
      onData(sortByCreatedDesc(MOCK_BOOKINGS));
      onError?.(err);
    }
  );
}

export function subscribeRooms(
  onData: (rooms: TwigaRoom[]) => void,
  onError?: (err: unknown) => void
): () => void {
  if (isDemoMode()) {
    onData(MOCK_ROOMS);
    return () => {};
  }

  if (isSupabaseConfigured && !db) {
    let active = true;
    const run = async () => {
      try {
        const rooms = await fetchRooms();
        if (active) onData(rooms);
      } catch (err) {
        onData(MOCK_ROOMS);
        onError?.(err);
      }
    };
    void run();
    const interval = setInterval(() => void run(), 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }

  if (!db) {
    onData(MOCK_ROOMS);
    return () => {};
  }

  let seedTriggered = false;
  const roomsRef = collection(db, 'companies', COMPANY_ID, 'properties', PROPERTY_ID, 'rooms');

  return onSnapshot(
    roomsRef,
    async (snapshot) => {
      if (snapshot.empty) {
        if (!seedTriggered) {
          seedTriggered = true;
          try {
            await seedRoomsIfEmpty();
          } catch {
            // Ignore seeding errors and keep demo fallback for UI continuity.
          }
        }
        onData(MOCK_ROOMS);
        return;
      }
      onData(snapshot.docs.map((docSnap) => docSnap.data() as TwigaRoom));
    },
    (err) => {
      onData(MOCK_ROOMS);
      onError?.(err);
    }
  );
}

export function subscribePayments(
  onData: (payments: TwigaPayment[]) => void,
  onError?: (err: unknown) => void
): () => void {
  if (isDemoMode()) {
    onData(sortByCreatedDesc(MOCK_PAYMENTS));
    return () => {};
  }

  if (isSupabaseConfigured && !db) {
    let active = true;
    const run = async () => {
      try {
        const payments = await fetchPayments();
        if (active) onData(payments);
      } catch (err) {
        onData(sortByCreatedDesc(MOCK_PAYMENTS));
        onError?.(err);
      }
    };
    void run();
    const interval = setInterval(() => void run(), 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }

  if (!db) {
    onData(sortByCreatedDesc(MOCK_PAYMENTS));
    return () => {};
  }

  const paymentsQuery = query(collectionGroup(db, 'payments'), where('propertyId', '==', PROPERTY_ID));
  return onSnapshot(
    paymentsQuery,
    (snapshot) => {
      if (snapshot.empty) {
        onData(sortByCreatedDesc(MOCK_PAYMENTS));
        return;
      }
      onData(sortByCreatedDesc(snapshot.docs.map((docSnap) => docSnap.data() as TwigaPayment)));
    },
    (err) => {
      onData(sortByCreatedDesc(MOCK_PAYMENTS));
      onError?.(err);
    }
  );
}

export function subscribeAdminLogs(
  onData: (logs: AdminLogEntry[]) => void,
  onError?: (err: unknown) => void
): () => void {
  if (isDemoMode()) {
    onData([]);
    return () => {};
  }

  if (isSupabaseConfigured && !db) {
    let active = true;
    const run = async () => {
      try {
        const logs = await fetchAdminLogs();
        if (active) onData(logs);
      } catch (err) {
        onData([]);
        onError?.(err);
      }
    };
    void run();
    const interval = setInterval(() => void run(), 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }

  if (!db) {
    onData([]);
    return () => {};
  }

  const logsRef = collection(db, 'companies', COMPANY_ID, 'adminLogs');
  return onSnapshot(
    logsRef,
    (snapshot) => {
      if (snapshot.empty) {
        onData([]);
        return;
      }
      const logs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<AdminLogEntry, 'id'>),
      }));
      onData(sortByCreatedDesc(logs));
    },
    (err) => {
      onData([]);
      onError?.(err);
    }
  );
}

export async function updateRoomBasePrice(roomId: string, basePrice: number): Promise<boolean> {
  if (isDemoMode()) return true;

  if (isSupabaseConfigured && supabase) {
    const response = await supabaseAdminApi.updateRoomBasePrice(roomId, basePrice);
    if (response?.ok) return true;
    return false;
  }

  if (!db) return true;

  try {
    const roomRef = doc(db, 'companies', COMPANY_ID, 'properties', PROPERTY_ID, 'rooms', roomId);
    await updateDoc(roomRef, { basePrice });
    await logAdminAction('room.price.update', 'room', roomId, { basePrice });
    return true;
  } catch {
    return false;
  }
}

async function logAdminAction(
  action: string,
  entityType: 'booking' | 'payment' | 'room',
  entityId: string,
  metadata?: Record<string, unknown>
) {
  if (isDemoMode()) return;

  const actor = auth?.currentUser
    ? {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email || null,
        displayName: auth.currentUser.displayName || null,
      }
    : {
        uid: 'demo-admin',
        email: 'demo@twiga.local',
        displayName: 'Demo Admin',
      };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('admin_logs').insert({
      company_id: COMPANY_ID,
      property_id: PROPERTY_ID,
      action,
      entity_type: entityType,
      entity_id: entityId,
      actor,
      metadata: metadata || {},
      created_at: Date.now(),
    });
    if (!error) return;
  }

  if (!db) return;

  await addDoc(collection(db, 'companies', COMPANY_ID, 'adminLogs'), {
    action,
    entityType,
    entityId,
    propertyId: PROPERTY_ID,
    actor,
    metadata: metadata || {},
    createdAt: Date.now(),
  });
}

type BookingStatusUpdateInput = {
  bookingId: string;
  status: BookingStatus;
  reason?: string;
};

export async function updateBookingStatus({ bookingId, status, reason }: BookingStatusUpdateInput): Promise<boolean> {
  if (isDemoMode()) return true;

  if (isSupabaseConfigured && supabase) {
    const response = await supabaseAdminApi.updateBookingStatus(bookingId, status, reason);
    if (response?.ok) return true;
    return false;
  }

  if (!db) return true;

  try {
    const bookingRef = doc(db, 'companies', COMPANY_ID, 'properties', PROPERTY_ID, 'bookings', bookingId);
    const now = Date.now();
    const updateData: Record<string, unknown> = { status, updatedAt: now };

    if (status === 'cancelled') {
      updateData.cancelledAt = now;
      updateData.cancelReason = reason || 'Cancelled by admin';
    }
    if (status === 'completed') {
      updateData.checkInCompleted = true;
      updateData.checkInCompletedAt = now;
    }

    await updateDoc(bookingRef, updateData);
    await logAdminAction('booking.status.update', 'booking', bookingId, { status, reason: reason || null });
    return true;
  } catch {
    return false;
  }
}

type PaymentStatusUpdateInput = {
  paymentId: string;
  bookingId: string;
  status: PaymentStatus;
  reason?: string;
};

export async function updatePaymentStatus({
  paymentId,
  bookingId,
  status,
  reason,
}: PaymentStatusUpdateInput): Promise<{ ok: boolean; bookingStatus?: BookingStatus }> {
  if (isDemoMode()) {
    const demoBookingStatus =
      status === 'confirmed'
        ? 'confirmed'
        : status === 'refunded' || status === 'failed'
        ? 'cancelled'
        : 'pending_payment';
    return { ok: true, bookingStatus: demoBookingStatus };
  }

  if (isSupabaseConfigured && supabase) {
    const response = await supabaseAdminApi.updatePaymentStatus(paymentId, bookingId, status, reason);
    if (response?.ok) {
      return { ok: true, bookingStatus: response.bookingStatus as BookingStatus | undefined };
    }
    return { ok: false };
  }

  if (!db) return { ok: false };

  try {
    const now = Date.now();
    const paymentRef = doc(
      db,
      'companies',
      COMPANY_ID,
      'properties',
      PROPERTY_ID,
      'bookings',
      bookingId,
      'payments',
      paymentId
    );

    const paymentUpdate: Record<string, unknown> = { status, updatedAt: now };
    if (status === 'confirmed') {
      paymentUpdate.confirmedAt = now;
      paymentUpdate.webhookReceived = true;
      paymentUpdate.webhookAt = now;
    }
    if (status === 'failed' || status === 'refunded') {
      paymentUpdate.failureReason = reason || `Marked as ${status} by admin`;
    }

    await updateDoc(paymentRef, paymentUpdate);

    const bookingRef = doc(db, 'companies', COMPANY_ID, 'properties', PROPERTY_ID, 'bookings', bookingId);
    let bookingStatus: BookingStatus | undefined;

    if (status === 'confirmed') {
      bookingStatus = 'confirmed';
      await updateDoc(bookingRef, { status: bookingStatus, updatedAt: now });
    } else if (status === 'failed') {
      bookingStatus = 'cancelled';
      await updateDoc(bookingRef, {
        status: bookingStatus,
        cancelReason: reason || 'Payment failed',
        cancelledAt: now,
        updatedAt: now,
      });
    } else if (status === 'refunded') {
      bookingStatus = 'cancelled';
      await updateDoc(bookingRef, {
        status: bookingStatus,
        cancelReason: reason || 'Payment refunded by admin',
        cancelledAt: now,
        updatedAt: now,
      });
    } else if (status === 'processing' || status === 'initiated') {
      bookingStatus = 'pending_payment';
      await updateDoc(bookingRef, { status: bookingStatus, updatedAt: now });
    }

    await logAdminAction('payment.status.update', 'payment', paymentId, {
      bookingId,
      paymentStatus: status,
      bookingStatus: bookingStatus || null,
      reason: reason || null,
    });

    return { ok: true, bookingStatus };
  } catch {
    return { ok: false };
  }
}

export async function updateBookingStatusesBulk(
  bookingIds: string[],
  status: BookingStatus,
  reason?: string
): Promise<boolean> {
  if (bookingIds.length === 0) return true;
  const results = await Promise.all(bookingIds.map((bookingId) => updateBookingStatus({ bookingId, status, reason })));
  return results.every(Boolean);
}

export async function updatePaymentStatusesBulk(
  payments: { paymentId: string; bookingId: string }[],
  status: PaymentStatus,
  reason?: string
): Promise<boolean> {
  if (payments.length === 0) return true;
  const results = await Promise.all(
    payments.map(({ paymentId, bookingId }) => updatePaymentStatus({ paymentId, bookingId, status, reason }))
  );
  return results.every((result) => result.ok);
}
