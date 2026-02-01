import * as admin from 'firebase-admin';

const rooms = [
  { id: 'room-1', name: 'Standard Room 1', type: 'standard', maxGuests: 2, basePrice: 15000000, amenities: ['WiFi', 'AC', 'En-suite', 'Flat screen TV'], images: [], description: 'Comfortable standard room', bedroomCount: 1, bathroomCount: 1 },
  { id: 'room-2', name: 'Standard Room 2', type: 'standard', maxGuests: 2, basePrice: 15000000, amenities: ['WiFi', 'AC', 'En-suite', 'Flat screen TV'], images: [], description: 'Comfortable standard room', bedroomCount: 1, bathroomCount: 1 },
  { id: 'room-3', name: 'Standard Room 3', type: 'standard', maxGuests: 2, basePrice: 15000000, amenities: ['WiFi', 'AC', 'En-suite', 'Flat screen TV'], images: [], description: 'Comfortable standard room', bedroomCount: 1, bathroomCount: 1 },
  { id: 'room-4', name: 'Standard Room 4', type: 'standard', maxGuests: 2, basePrice: 15000000, amenities: ['WiFi', 'AC', 'En-suite', 'Flat screen TV'], images: [], description: 'Comfortable standard room', bedroomCount: 1, bathroomCount: 1 },
  { id: 'room-5', name: 'Standard Room 5', type: 'standard', maxGuests: 2, basePrice: 15000000, amenities: ['WiFi', 'AC', 'En-suite', 'Flat screen TV'], images: [], description: 'Comfortable standard room', bedroomCount: 1, bathroomCount: 1 },
  { id: 'room-6', name: 'Standard Room 6', type: 'standard', maxGuests: 2, basePrice: 15000000, amenities: ['WiFi', 'AC', 'En-suite', 'Flat screen TV'], images: [], description: 'Comfortable standard room', bedroomCount: 1, bathroomCount: 1 },
  { id: 'room-7', name: 'Standard Room 7', type: 'standard', maxGuests: 2, basePrice: 15000000, amenities: ['WiFi', 'AC', 'En-suite', 'Flat screen TV'], images: [], description: 'Comfortable standard room', bedroomCount: 1, bathroomCount: 1 },
  { id: 'room-8', name: 'Standard Room 8', type: 'standard', maxGuests: 2, basePrice: 15000000, amenities: ['WiFi', 'AC', 'En-suite', 'Flat screen TV'], images: [], description: 'Comfortable standard room', bedroomCount: 1, bathroomCount: 1 },
  { id: 'apartment-1', name: 'Luxury Apartment', type: 'apartment', maxGuests: 4, basePrice: 30000000, amenities: ['WiFi', 'AC', 'Kitchen', 'Living Room', 'Balcony'], images: [], description: 'Spacious luxury apartment', bedroomCount: 2, bathroomCount: 2 },
];

export async function initializeFirestoreSchema() {
  if (!admin.apps.length) admin.initializeApp();
  const db = admin.firestore();

  await db.collection('companies').doc('twiga-agm').set({
    id: 'twiga-agm',
    name: 'Twiga AGM',
    slug: 'twiga-agm',
    country: 'TZ',
    timezone: 'Africa/Dar_es_Salaam',
    currencies: ['TZS', 'USD'],
    contact: { email: 'bookings@twiga-agm.com', phone: '+255 XXX XXX XXX', whatsapp: '+255 XXX XXX XXX' },
    branding: { logo: 'https://twiga-agm.com/logo.png', favicon: 'https://twiga-agm.com/favicon.ico', primaryColor: '#2d5f2e', secondaryColor: '#f0f0f0' },
    socialLinks: { instagram: 'https://instagram.com/twiga-agm', facebook: 'https://facebook.com/twiga-agm', website: 'https://twiga-agm.com' },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const propertyRef = db.collection('companies').doc('twiga-agm').collection('properties').doc('twiga-residence');
  await propertyRef.set({
    id: 'twiga-residence',
    companyId: 'twiga-agm',
    name: 'Twiga Residence',
    slug: 'twiga-residence',
    type: 'boutique',
    location: { address: 'Plot X, Street Y', city: 'Dar es Salaam', country: 'TZ', coordinates: { lat: -6.8, lng: 39.3 } },
    settings: {
      payments: {
        flutterwave: {
          enabled: true,
          publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || '',
          methods: { mobileMoneyEnabled: true, cardEnabled: true, payOnArrivalEnabled: true, bankTransferEnabled: false },
          depositPercentage: 50,
          minimumDeposit: 50000,
          defaultCurrency: 'TZS',
        },
      },
      channels: {
        airbnb: { enabled: true, syncFrequency: 'every_15_min' },
        bookingCom: { enabled: true, syncFrequency: 'every_15_min' },
        direct: { enabled: true },
      },
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const roomsRef = propertyRef.collection('rooms');
  for (const room of rooms) {
    await roomsRef.doc(room.id).set(room);
  }
  console.log('Firestore schema initialized for Twiga AGM');
}
