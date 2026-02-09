'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BedDouble, Users, Wifi, Wind, Tv, ChefHat, Sofa, Check, Edit2, X } from 'lucide-react';
import { fetchRooms as fetchRoomsData } from '@/lib/data';
import { MOCK_BOOKINGS } from '@twiga/shared';
import { formatCurrency } from '@twiga/shared/utils/formatting';
import type { TwigaRoom } from '@twiga/shared/types';

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi,
  AC: Wind,
  'Flat screen TV': Tv,
  Kitchen: ChefHat,
  'Living Room': Sofa,
};

const typeStyles: Record<string, string> = {
  standard: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  deluxe: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  apartment: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<TwigaRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<TwigaRoom | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editPrice, setEditPrice] = useState('');

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await fetchRoomsData();
        setRooms(data);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    loadRooms();
  }, []);

  const getRoomStatus = (roomId: string) => {
    const now = Date.now();
    const activeBooking = MOCK_BOOKINGS.find(
      (b) =>
        b.roomId === roomId &&
        (b.status === 'confirmed' || b.status === 'pay_on_arrival') &&
        b.checkIn <= now &&
        b.checkOut >= now
    );
    if (activeBooking) return 'occupied';

    const upcomingBooking = MOCK_BOOKINGS.find(
      (b) =>
        b.roomId === roomId &&
        (b.status === 'confirmed' || b.status === 'pay_on_arrival') &&
        b.checkIn > now
    );
    if (upcomingBooking) return 'reserved';
    return 'available';
  };

  const roomStatusStyles: Record<string, string> = {
    available: 'bg-green-500/20 text-green-400',
    occupied: 'bg-red-500/20 text-red-400',
    reserved: 'bg-yellow-500/20 text-yellow-400',
  };

  const handleSavePrice = () => {
    if (selectedRoom && editPrice) {
      const newPrice = parseInt(editPrice, 10) * 100;
      setRooms((prev) =>
        prev.map((r) => (r.id === selectedRoom.id ? { ...r, basePrice: newPrice } : r))
      );
      setSelectedRoom({ ...selectedRoom, basePrice: newPrice });
      setEditMode(false);
    }
  };

  const totalRooms = rooms.length;
  const available = rooms.filter((r) => getRoomStatus(r.id) === 'available').length;
  const occupied = rooms.filter((r) => getRoomStatus(r.id) === 'occupied').length;
  const reserved = rooms.filter((r) => getRoomStatus(r.id) === 'reserved').length;

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-1">Rooms</h1>
        <p className="text-gray-400">Manage rooms and availability</p>
      </motion.div>

      {/* Room stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-white">{totalRooms}</p>
          <p className="text-sm text-gray-400">Total Rooms</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{available}</p>
          <p className="text-sm text-gray-400">Available</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{occupied}</p>
          <p className="text-sm text-gray-400">Occupied</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-yellow-400">{reserved}</p>
          <p className="text-sm text-gray-400">Reserved</p>
        </div>
      </div>

      {/* Rooms grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room, i) => {
            const status = getRoomStatus(room.id);
            return (
              <motion.div
                key={room.id}
                className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  setSelectedRoom(room);
                  setEditPrice(String(room.basePrice / 100));
                  setEditMode(false);
                }}
              >
                <div className="h-36 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center relative">
                  <BedDouble className="w-12 h-12 text-gray-500" />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roomStatusStyles[status]}`}>
                      {status}
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${typeStyles[room.type] || typeStyles.standard}`}>
                      {room.type}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold text-lg mb-1">{room.name}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-1">{room.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-gray-400 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{room.maxGuests} guests</span>
                    </div>
                    <p className="text-green-400 font-bold">{formatCurrency(room.basePrice, 'TZS')}<span className="text-gray-400 text-xs font-normal">/night</span></p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {room.amenities.slice(0, 4).map((amenity) => (
                      <span key={amenity} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Room Detail Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedRoom(null)}>
          <motion.div
            className="bg-gray-800 rounded-xl border border-gray-700 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedRoom.name}</h3>
                <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium border ${typeStyles[selectedRoom.type]}`}>
                  {selectedRoom.type}
                </span>
              </div>
              <button onClick={() => setSelectedRoom(null)} className="text-gray-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${roomStatusStyles[getRoomStatus(selectedRoom.id)]}`}>
                  {getRoomStatus(selectedRoom.id)}
                </span>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Room Details</h4>
                <p className="text-gray-300 text-sm">{selectedRoom.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Max Guests</p>
                    <p className="text-white font-medium">{selectedRoom.maxGuests}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Bedrooms</p>
                    <p className="text-white font-medium">{selectedRoom.bedroomCount || 1}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Bathrooms</p>
                    <p className="text-white font-medium">{selectedRoom.bathroomCount || 1}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Type</p>
                    <p className="text-white font-medium capitalize">{selectedRoom.type}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Pricing</h4>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="text-green-400 hover:text-green-300 transition text-sm flex items-center space-x-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{editMode ? 'Cancel' : 'Edit'}</span>
                  </button>
                </div>
                {editMode ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1 block">Price per night (TZS, in cents)</label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <button
                      onClick={handleSavePrice}
                      className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition mt-5"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <p className="text-green-400 text-2xl font-bold">
                    {formatCurrency(selectedRoom.basePrice, 'TZS')}
                    <span className="text-gray-400 text-sm font-normal ml-1">/night</span>
                  </p>
                )}
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Amenities</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedRoom.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
