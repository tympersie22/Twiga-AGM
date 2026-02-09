import { db } from './firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { MOCK_BOOKINGS, MOCK_ROOMS, MOCK_PAYMENTS } from '@twiga/shared';
import type { TwigaBooking, TwigaRoom, TwigaPayment } from '@twiga/shared/types';

const COMPANY_ID = 'twiga-agm';
const PROPERTY_ID = 'twiga-residence';

const isDemoMode = () => {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  return !projectId || projectId === 'demo-project' || projectId.startsWith('demo');
};

export async function fetchBookings(): Promise<TwigaBooking[]> {
  if (isDemoMode()) return MOCK_BOOKINGS;

  try {
    const bookingsRef = collection(db, 'companies', COMPANY_ID, 'properties', PROPERTY_ID, 'bookings');
    const snapshot = await getDocs(bookingsRef);
    if (snapshot.empty) return MOCK_BOOKINGS;
    return snapshot.docs.map((doc) => doc.data() as TwigaBooking);
  } catch {
    return MOCK_BOOKINGS;
  }
}

export async function fetchRooms(): Promise<TwigaRoom[]> {
  if (isDemoMode()) return MOCK_ROOMS;

  try {
    const roomsRef = collection(db, 'companies', COMPANY_ID, 'properties', PROPERTY_ID, 'rooms');
    const snapshot = await getDocs(roomsRef);

    if (snapshot.empty) {
      // Seed rooms to Firestore since admin is authenticated
      console.info('[Admin Seed] Writing rooms to Firestore...');
      for (const room of MOCK_ROOMS) {
        const roomRef = doc(db, 'companies', COMPANY_ID, 'properties', PROPERTY_ID, 'rooms', room.id);
        await setDoc(roomRef, room);
      }
      console.info(`[Admin Seed] ${MOCK_ROOMS.length} rooms written`);
      return MOCK_ROOMS;
    }

    return snapshot.docs.map((doc) => doc.data() as TwigaRoom);
  } catch {
    return MOCK_ROOMS;
  }
}

export async function fetchPayments(): Promise<TwigaPayment[]> {
  if (isDemoMode()) return MOCK_PAYMENTS;

  try {
    // Fetch all bookings, then iterate their payments subcollections
    const bookingsRef = collection(db, 'companies', COMPANY_ID, 'properties', PROPERTY_ID, 'bookings');
    const bookingsSnap = await getDocs(bookingsRef);

    if (bookingsSnap.empty) return MOCK_PAYMENTS;

    const allPayments: TwigaPayment[] = [];
    for (const bookingDoc of bookingsSnap.docs) {
      const paymentsRef = collection(
        db, 'companies', COMPANY_ID, 'properties', PROPERTY_ID,
        'bookings', bookingDoc.id, 'payments'
      );
      const paymentsSnap = await getDocs(paymentsRef);
      for (const payDoc of paymentsSnap.docs) {
        allPayments.push(payDoc.data() as TwigaPayment);
      }
    }

    return allPayments.length > 0 ? allPayments : MOCK_PAYMENTS;
  } catch {
    return MOCK_PAYMENTS;
  }
}
