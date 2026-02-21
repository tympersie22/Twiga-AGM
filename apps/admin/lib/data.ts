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
import { MOCK_BOOKINGS, MOCK_ROOMS, MOCK_PAYMENTS } from '@twiga/shared';
import type { TwigaBooking, TwigaRoom, TwigaPayment } from '@twiga/shared/types';
import type { BookingStatus, PaymentStatus } from '@twiga/shared/types';
import { auth } from './firebase';

const COMPANY_ID = 'twiga-agm';
const PROPERTY_ID = 'twiga-residence';

const sortByCreatedDesc = <T extends { createdAt?: number }>(items: T[]) =>
  items.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

const isDemoMode = () => {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  return !isFirebaseConfigured || !projectId || projectId === 'demo-project' || projectId.startsWith('demo');
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

async function seedRoomsIfEmpty(): Promise<void> {
  if (!db) return;

  for (const room of MOCK_ROOMS) {
    const roomRef = doc(db, 'companies', COMPANY_ID, 'properties', PROPERTY_ID, 'rooms', room.id);
    await setDoc(roomRef, room);
  }
}

export async function fetchBookings(): Promise<TwigaBooking[]> {
  if (isDemoMode() || !db) return sortByCreatedDesc(MOCK_BOOKINGS);

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
  if (isDemoMode() || !db) return MOCK_ROOMS;

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
  if (isDemoMode() || !db) return sortByCreatedDesc(MOCK_PAYMENTS);

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
  if (isDemoMode() || !db) return [];

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
  if (isDemoMode() || !db) {
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
  if (isDemoMode() || !db) {
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
  if (isDemoMode() || !db) {
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
  if (isDemoMode() || !db) {
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
  if (isDemoMode() || !db) return true;

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
  if (isDemoMode() || !db) return;

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
  if (isDemoMode() || !db) return true;

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
  if (isDemoMode() || !db) {
    const demoBookingStatus =
      status === 'confirmed'
        ? 'confirmed'
        : status === 'refunded' || status === 'failed'
        ? 'cancelled'
        : 'pending_payment';
    return { ok: true, bookingStatus: demoBookingStatus };
  }

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
