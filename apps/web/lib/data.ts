import { db, isFirebaseConfigured } from './firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { MOCK_ROOMS } from '@/lib/shared';
import type { TwigaRoom } from '@/lib/shared/types';
import { isSupabaseConfigured, supabase } from './supabase';

const isDemoMode = () => {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const firebaseUnavailable =
    !isFirebaseConfigured || !projectId || projectId === 'demo-project' || projectId.startsWith('demo');
  return firebaseUnavailable && !isSupabaseConfigured;
};

const COMPANY_ID = 'twiga-agm';

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

async function fetchRoomsFromSupabase(propertySlug: string): Promise<TwigaRoom[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .or(`property_slug.eq.${propertySlug},property_id.eq.${propertySlug}`);

  if (error || !data || data.length === 0) return null;
  return data.map((row) => normalizeRoom(row as Record<string, unknown>));
}

export async function fetchRooms(propertySlug = 'twiga-residence'): Promise<TwigaRoom[]> {
  if (isDemoMode()) return MOCK_ROOMS;

  try {
    const supabaseRooms = await fetchRoomsFromSupabase(propertySlug);
    if (supabaseRooms && supabaseRooms.length > 0) return supabaseRooms;
  } catch {
    // Continue to Firestore fallback.
  }

  try {
    return await seedRoomsIfEmpty(propertySlug);
  } catch (err) {
    console.warn('[fetchRooms] Firestore unavailable, using MOCK_ROOMS', err);
    return MOCK_ROOMS;
  }
}

export async function fetchRoom(propertySlug: string, roomId: string): Promise<TwigaRoom | null> {
  if (isDemoMode()) {
    return MOCK_ROOMS.find((r) => r.id === roomId) || null;
  }

  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('company_id', COMPANY_ID)
        .or(`property_slug.eq.${propertySlug},property_id.eq.${propertySlug}`)
        .eq('id', roomId)
        .maybeSingle();

      if (!error && data) return normalizeRoom(data as Record<string, unknown>);
    }
  } catch {
    // Continue to Firestore fallback.
  }

  if (!db) {
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

const normalizeProperty = (
  row: Record<string, unknown>,
  fallbackRooms: TwigaRoom[] = []
): PropertySummary => {
  const location = (row.location as PropertySummary['location']) || {
    address: '',
    city: 'Zanzibar',
    country: 'Tanzania',
  };
  const priceFrom =
    Number(row.priceFrom ?? row.price_from ?? 0) ||
    (fallbackRooms.length > 0 ? Math.min(...fallbackRooms.map((room) => room.basePrice)) : 0);

  return {
    id: String(row.id || ''),
    name: String(row.name || row.id || 'Property'),
    slug: String(row.slug || row.id || ''),
    type: String(row.type || 'boutique'),
    location,
    description: String(row.description || MOCK_PROPERTY.description),
    shortDescription: String(row.shortDescription || row.short_description || MOCK_PROPERTY.shortDescription),
    totalRooms: Number(row.totalRooms ?? row.total_rooms ?? fallbackRooms.length),
    priceFrom,
  };
};

export async function fetchProperties(): Promise<PropertySummary[]> {
  if (isDemoMode()) return [MOCK_PROPERTY];

  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('company_id', COMPANY_ID);

      if (!error && data && data.length > 0) {
        const rows = data as Record<string, unknown>[];
        const properties = await Promise.all(
          rows.map(async (row) => {
            const slug = String(row.slug || row.id || '');
            const rooms = await fetchRoomsFromSupabase(slug);
            return normalizeProperty(row, rooms || []);
          })
        );
        return properties;
      }
    }
  } catch {
    // Continue to Firestore fallback.
  }

  if (!db) return [MOCK_PROPERTY];

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
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('company_id', COMPANY_ID)
        .eq('slug', slug)
        .maybeSingle();

      if (!error && data) {
        const rooms = await fetchRoomsFromSupabase(slug);
        return normalizeProperty(data as Record<string, unknown>, rooms || []);
      }
    } catch {
      // Continue to generic fallback.
    }
  }

  const properties = await fetchProperties();
  return properties.find((p) => p.slug === slug) || null;
}
