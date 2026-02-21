'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { TwigaRoom } from '@/lib/shared/types';
import { formatCurrency } from '@/lib/shared/formatting';
import { Users, Check } from 'lucide-react';

interface RoomCardProps {
  room: TwigaRoom;
}

export default function RoomCard({ room }: RoomCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group">
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {room.images?.[0] ? (
          <Image
            src={room.images[0]}
            alt={room.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
          {room.type}
        </span>
        <h3 className="text-xl font-bold text-gray-900 mt-2 mb-2">{room.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{room.description}</p>
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {room.amenities.slice(0, 3).map((amenity, i) => (
              <span key={i} className="flex items-center text-xs text-gray-600">
                <Check className="w-3 h-3 text-green-600 mr-1" />
                {amenity}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">Up to {room.maxGuests} guests</span>
          </div>
        </div>
        <div className="mb-4">
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(room.basePrice, 'TZS')}</div>
          <p className="text-xs text-gray-600">per night</p>
        </div>
        <Link
          href={`/booking?roomId=${room.id}`}
          className="block w-full bg-green-700 text-white py-2 rounded-lg font-semibold text-center hover:bg-green-800 transition"
        >
          Check Availability
        </Link>
      </div>
    </div>
  );
}
