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
