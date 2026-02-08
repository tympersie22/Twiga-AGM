import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { MOCK_ROOMS } from '@twiga/shared';
import type { TwigaRoom } from '@twiga/shared/types';

const isDemoMode = () => {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  return !projectId || projectId === 'demo-project' || projectId.startsWith('demo');
};

export async function fetchRooms(): Promise<TwigaRoom[]> {
  if (isDemoMode()) return MOCK_ROOMS;

  try {
    const roomsRef = collection(db, 'companies', 'twiga-agm', 'properties', 'twiga-residence', 'rooms');
    const snapshot = await getDocs(roomsRef);
    if (snapshot.empty) return MOCK_ROOMS;
    return snapshot.docs.map((doc) => doc.data() as TwigaRoom);
  } catch {
    return MOCK_ROOMS;
  }
}
