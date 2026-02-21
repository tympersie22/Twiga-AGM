import { db, isFirebaseConfigured } from './firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { MOCK_ROOMS } from '@twiga/shared';
import type { TwigaRoom } from '@twiga/shared/types';

const isDemoMode = () => {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  return !isFirebaseConfigured || !projectId || projectId === 'demo-project' || projectId.startsWith('demo');
};

const COMPANY_ID = 'twiga-agm';

async function seedRoomsIfEmpty(propertySlug: string): Promise<TwigaRoom[]> {
  if (!db) return MOCK_ROOMS;

  const roomsRef = collection(db, 'companies', COMPANY_ID, 'properties', propertySlug, 'rooms');
  const snapshot = await getDocs(roomsRef);

  if (!snapshot.empty) {
    return snapshot.docs.map((d) => d.data() as TwigaRoom);
  }

  console.info('[Seed] Writing rooms to Firestore...');

  const propRef = doc(db, 'companies', COMPANY_ID, 'properties', propertySlug);
  const propSnap = await getDoc(propRef);
  if (!propSnap.exists()) {
    await setDoc(propRef, {
      id: propertySlug,
      companyId: COMPANY_ID,
      name: 'Twiga Residence',
      slug: propertySlug,
      type: 'boutique',
      location: { address: 'Zanzibar', city: 'Zanzibar', country: 'Tanzania' },
      description:
        'Twiga Residence is a premium boutique property offering 8 beautifully appointed standard rooms and 1 cozy apartment with a kitchen and private balcony.',
      shortDescription: '8 standard rooms and 1 cozy apartment with kitchen and private balcony.',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  for (const room of MOCK_ROOMS) {
    const roomRef = doc(db, 'companies', COMPANY_ID, 'properties', propertySlug, 'rooms', room.id);
    await setDoc(roomRef, room);
  }

  console.info(`[Seed] ${MOCK_ROOMS.length} rooms written to Firestore`);
  return MOCK_ROOMS;
}

export async function fetchRooms(propertySlug = 'twiga-residence'): Promise<TwigaRoom[]> {
  if (isDemoMode()) return MOCK_ROOMS;

  try {
    return await seedRoomsIfEmpty(propertySlug);
  } catch (err) {
    console.warn('[fetchRooms] Firestore unavailable, using MOCK_ROOMS', err);
    return MOCK_ROOMS;
  }
}

export async function fetchRoom(propertySlug: string, roomId: string): Promise<TwigaRoom | null> {
  if (isDemoMode() || !db) {
    return MOCK_ROOMS.find((r) => r.id === roomId) || null;
  }

  try {
    const roomRef = doc(db, 'companies', COMPANY_ID, 'properties', propertySlug, 'rooms', roomId);
    const snapshot = await getDoc(roomRef);
    if (!snapshot.exists()) return MOCK_ROOMS.find((r) => r.id === roomId) || null;
    return snapshot.data() as TwigaRoom;
  } catch {
    return MOCK_ROOMS.find((r) => r.id === roomId) || null;
  }
}

export interface PropertySummary {
  id: string;
  name: string;
  slug: string;
  type: string;
  location: {
    address: string;
    city: string;
    country: string;
  };
  description?: string;
  shortDescription?: string;
  totalRooms: number;
  priceFrom: number;
}

const MOCK_PROPERTY: PropertySummary = {
  id: 'twiga-residence',
  name: 'Twiga Residence',
  slug: 'twiga-residence',
  type: 'boutique',
  location: {
    address: 'Zanzibar',
    city: 'Zanzibar',
    country: 'Tanzania',
  },
  description:
    'Twiga Residence is a premium boutique property offering 8 beautifully appointed standard rooms and 1 cozy apartment with a kitchen and private balcony. Located in the heart of Zanzibar, it provides modern amenities, exceptional comfort, and a warm Zanzibari welcome.',
  shortDescription: '8 standard rooms and 1 cozy apartment with kitchen and private balcony.',
  totalRooms: 9,
  priceFrom: 150000,
};

export async function fetchProperties(): Promise<PropertySummary[]> {
  if (isDemoMode() || !db) return [MOCK_PROPERTY];

  try {
    const propsRef = collection(db, 'companies', COMPANY_ID, 'properties');
    const snapshot = await getDocs(propsRef);
    if (snapshot.empty) return [MOCK_PROPERTY];

    const properties: PropertySummary[] = [];
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const roomsRef = collection(db, 'companies', COMPANY_ID, 'properties', docSnap.id, 'rooms');
      const roomsSnap = await getDocs(roomsRef);
      const rooms = roomsSnap.docs.map((r) => r.data() as TwigaRoom);
      const minPrice = rooms.length > 0 ? Math.min(...rooms.map((r) => r.basePrice)) : 0;

      properties.push({
        id: docSnap.id,
        name: data.name || docSnap.id,
        slug: data.slug || docSnap.id,
        type: data.type || 'boutique',
        location: data.location || { address: '', city: 'Zanzibar', country: 'Tanzania' },
        description: data.description || MOCK_PROPERTY.description,
        shortDescription: data.shortDescription || MOCK_PROPERTY.shortDescription,
        totalRooms: rooms.length,
        priceFrom: minPrice,
      });
    }
    return properties.length > 0 ? properties : [MOCK_PROPERTY];
  } catch {
    return [MOCK_PROPERTY];
  }
}

export async function fetchProperty(slug: string): Promise<PropertySummary | null> {
  const properties = await fetchProperties();
  return properties.find((p) => p.slug === slug) || null;
}
