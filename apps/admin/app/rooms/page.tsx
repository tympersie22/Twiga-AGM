'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedRoom(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
            const hasImage = room.images && room.images.length > 0;
            return (
              <motion.div
                key={room.id}
                className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  setSelectedRoom(room);
                  setEditPrice(String(room.basePrice / 100));
                  setEditMode(false);
                }}
              >
                {/* Room image or fallback */}
                <div className="h-40 relative overflow-hidden">
                  {hasImage ? (
                    <img
                      src={room.images[0]}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <BedDouble className="w-12 h-12 text-gray-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-800/80 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-md ${roomStatusStyles[status]}`}>
                      {status}
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium border backdrop-blur-md ${typeStyles[room.type] || typeStyles.standard}`}>
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
                    <p className="text-accent font-bold">{formatCurrency(room.basePrice, 'TZS')}<span className="text-gray-400 text-xs font-normal">/night</span></p>
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

      {/* macOS-style Room Detail Modal */}
      <AnimatePresence>
        {selectedRoom && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop blur */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRoom(null)}
            />

            {/* Modal */}
            <motion.div
              className="relative bg-gray-800/95 backdrop-blur-xl rounded-2xl border border-gray-600/50 max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl shadow-black/50"
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Room image header */}
              {selectedRoom.images && selectedRoom.images.length > 0 ? (
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={selectedRoom.images[0]}
                    alt={selectedRoom.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-800/95 via-gray-800/30 to-transparent" />
                  <div className="absolute bottom-4 left-6 right-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white">{selectedRoom.name}</h3>
                        <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium border backdrop-blur-md ${typeStyles[selectedRoom.type]}`}>
                          {selectedRoom.type}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-md ${roomStatusStyles[getRoomStatus(selectedRoom.id)]}`}>
                        {getRoomStatus(selectedRoom.id)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
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
              )}

              {/* Scrollable content */}
              <div className="overflow-y-auto max-h-[calc(85vh-13rem)] p-6 space-y-5">
                <motion.div
                  className="bg-gray-700/20 rounded-xl p-4 border border-gray-700/40"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Room Details</h4>
                  <p className="text-gray-300 text-sm mb-3">{selectedRoom.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Max Guests</p>
                      <p className="text-white font-medium">{selectedRoom.maxGuests}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Bedrooms</p>
                      <p className="text-white font-medium">{selectedRoom.bedroomCount || 1}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Bathrooms</p>
                      <p className="text-white font-medium">{selectedRoom.bathroomCount || 1}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Type</p>
                      <p className="text-white font-medium capitalize">{selectedRoom.type}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-gray-700/20 rounded-xl p-4 border border-gray-700/40"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Pricing</h4>
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="text-accent hover:text-accent/80 transition text-sm flex items-center space-x-1"
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
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-accent"
                        />
                      </div>
                      <button
                        onClick={handleSavePrice}
                        className="bg-accent/20 hover:bg-accent/30 text-accent px-4 py-2 rounded-lg transition mt-5"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <p className="text-accent text-2xl font-bold">
                      {formatCurrency(selectedRoom.basePrice, 'TZS')}
                      <span className="text-gray-400 text-sm font-normal ml-1">/night</span>
                    </p>
                  )}
                </motion.div>

                <motion.div
                  className="bg-gray-700/20 rounded-xl p-4 border border-gray-700/40"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Amenities</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRoom.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-accent" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
