import * as admin from 'firebase-admin';

// Initialize Firebase Admin with service account or default credentials
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'twiga-agm-964b9',
  });
}

const db = admin.firestore();

const rooms = [
  { id: 'room-1', name: 'Standard Room 1', type: 'standard', maxGuests: 2, basePrice: 15000000, amenities: ['WiFi', 'AC', 'En-suite', 'Flat screen TV'], images: [], description: 'Comfortable standard room', bedroomCount: 1, bathroomCount: 1 },
  { id: 'room-2', name: 'Standard Room 2', type: 'standard', maxGuests: 2, basePrice: 15000000, amenities: ['WiFi', 'AC', 'En-suite', 'Flat screen TV'], images: [], description: 'Comfortable standard room', bedroomCount: 1, bathroomCount: 1 },
  { id: 'room-3', name: 'Standard Room 3', type: 'standard', maxGuests: 2, basePrice: 15000000, amenities: ['WiFi', 'AC', 'En-suite', 'Flat screen TV'], images: [], description: 'Comfortable standard room', bedroomCount: 1, bathroomCount: 1 },
  { id: 'room-4', name: 'Standard Room 4', type: 'standard', maxGuests: 2, basePrice: 15000000, amenities: ['WiFi', 'AC', 'En-suite', 'Flat screen TV'], images: [], description: 'Comfortable standard room', bedroomCount: 1, bathroomCount: 1 },
  { id: 'room-5', name: 'Standard Room 5', type: 'standard', maxGuests: 2, basePrice: 15000000, amenities: ['WiFi', 'AC', 'En-suite', 'Flat screen TV'], images: [], description: 'Comfortable standard room', bedroomCount: 1, bathroomCount: 1 },
  { id: 'room-6', name: 'Standard Room 6', type: 'standard', maxGuests: 2, basePrice: 15000000, amenities: ['WiFi', 'AC', 'En-suite', 'Flat screen TV'], images: [], description: 'Comfortable standard room', bedroomCount: 1, bathroomCount: 1 },
  { id: 'room-7', name: 'Standard Room 7', type: 'standard', maxGuests: 2, basePrice: 15000000, amenities: ['WiFi', 'AC', 'En-suite', 'Flat screen TV'], images: [], description: 'Comfortable standard room', bedroomCount: 1, bathroomCount: 1 },
  { id: 'room-8', name: 'Standard Room 8', type: 'standard', maxGuests: 2, basePrice: 15000000, amenities: ['WiFi', 'AC', 'En-suite', 'Flat screen TV'], images: [], description: 'Comfortable standard room', bedroomCount: 1, bathroomCount: 1 },
  { id: 'apartment-1', name: '1-Bedroom Cozy Apartment', type: 'apartment', maxGuests: 2, basePrice: 20000000, amenities: ['WiFi', 'AC', 'Kitchen', 'Living Room', 'Balcony'], images: [], description: 'Cozy 1-bedroom apartment', bedroomCount: 1, bathroomCount: 2 },
];

async function seed() {
  console.log('🌱 Starting Firestore seed...');

  // Create company
  console.log('Creating company: twiga-agm');
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

  // Create property
  console.log('Creating property: twiga-residence');
  const propertyRef = db.collection('companies').doc('twiga-agm').collection('properties').doc('twiga-residence');
  await propertyRef.set({
    id: 'twiga-residence',
    companyId: 'twiga-agm',
    name: 'Twiga Residence',
    slug: 'twiga-residence',
    type: 'boutique',
    location: { address: 'Plot X, Street Y', city: 'Zanzibar', country: 'TZ', coordinates: { lat: -6.16, lng: 39.19 } },
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

  // Create rooms
  console.log('Creating rooms...');
  const roomsRef = propertyRef.collection('rooms');
  for (const room of rooms) {
    console.log(`  - ${room.name}`);
    await roomsRef.doc(room.id).set({
      ...room,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  console.log('✅ Firestore seed complete!');
  console.log(`   Created ${rooms.length} rooms (8 standard + 1 apartment)`);
  console.log('   Location: Zanzibar, Tanzania');
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
