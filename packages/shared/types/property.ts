export type RoomType = 'standard' | 'deluxe' | 'apartment';

export interface TwigaRoom {
  id: string;
  name: string;
  type: RoomType;
  maxGuests: number;
  basePrice: number;
  amenities: string[];
  images: string[];
  description: string;
  features?: string[];
  bedroomCount?: number;
  bathroomCount?: number;
}

export interface TwigaProperty {
  id: string;
  companyId: string;
  name: string;
  slug: string;
  type: 'boutique' | 'apartment' | 'villa';
  location: {
    address: string;
    city: string;
    country: 'TZ';
    coordinates: { lat: number; lng: number };
    mapEmbed?: string;
  };
  rooms: TwigaRoom[];
  settings: {
    payments: {
      flutterwave: {
        enabled: boolean;
        publicKey: string;
        methods: {
          mobileMoneyEnabled: boolean;
          cardEnabled: boolean;
          payOnArrivalEnabled: boolean;
          bankTransferEnabled: boolean;
        };
        depositPercentage: number;
        minimumDeposit: number;
        defaultCurrency: 'TZS' | 'USD';
      };
    };
    channels: {
      airbnb: { enabled: boolean; listingId?: string; iCalUrl?: string; syncFrequency: string };
      bookingCom: { enabled: boolean; propertyId?: string; iCalUrl?: string; syncFrequency: string };
      direct: { enabled: boolean };
    };
  };
  createdAt: number;
  updatedAt: number;
}

export interface TwigaCompany {
  id: string;
  name: string;
  slug: string;
  country: 'TZ';
  timezone: string;
  currencies: string[];
  contact: { email: string; phone: string; whatsapp: string };
  branding: { logo: string; favicon: string; primaryColor: string; secondaryColor: string };
  socialLinks: { instagram?: string; facebook?: string; website?: string };
}
