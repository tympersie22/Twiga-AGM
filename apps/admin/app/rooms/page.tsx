'use client';

import { useEffect, useState } from 'react';
import {
  BedDouble,
  Check,
  ChefHat,
  Edit2,
  Save,
  Sofa,
  Tv,
  Users,
  Wifi,
  Wind,
  X,
} from 'lucide-react';
import {
  fetchBookings,
  fetchRooms as fetchRoomsData,
  subscribeBookings,
  subscribeRooms,
  updateRoomBasePrice,
} from '@/lib/data';
import { useAuth } from '@/lib/AuthContext';
import { formatCurrency } from '@/lib/shared/utils/formatting';
import type { TwigaBooking, TwigaRoom } from '@/lib/shared/types';

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi,
  AC: Wind,
  'Flat screen TV': Tv,
  Kitchen: ChefHat,
  'Living Room': Sofa,
};

const typeStyles: Record<string, string> = {
  standard: 'bg-[#e8eff7] text-[#446995] border-[#cbd9ea]',
  deluxe: 'bg-[#efe9f7] text-[#6f4b9b] border-[#dacdee]',
  apartment: 'bg-[#e3f0e4] text-[#4d7a4d] border-[#c5ddc8]',
};

const roomStatusStyles: Record<string, string> = {
  available: 'bg-[#e6f2e5] text-[#4d7a4d]',
  occupied: 'bg-[#f9e8e6] text-[#aa5447]',
  reserved: 'bg-[#fff3df] text-[#9d6c1f]',
};

export default function RoomsPage() {
  const { role } = useAuth();
  const canEditPrices = role === 'admin' || role === 'super_admin';
  const [rooms, setRooms] = useState<TwigaRoom[]>([]);
  const [bookings, setBookings] = useState<TwigaBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<TwigaRoom | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editPrice, setEditPrice] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    let roomsReady = false;
    let bookingsReady = false;

    const completeLoadingIfReady = () => {
      if (roomsReady && bookingsReady) setLoading(false);
    };

    const bootstrap = async () => {
      const [roomsData, bookingsData] = await Promise.all([fetchRoomsData(), fetchBookings()]);
      setRooms(roomsData);
      setBookings(bookingsData);
    };

    void bootstrap();

    const unsubRooms = subscribeRooms((data) => {
      setRooms(data);
      roomsReady = true;
      completeLoadingIfReady();
    });
    const unsubBookings = subscribeBookings((data) => {
      setBookings(data);
      bookingsReady = true;
      completeLoadingIfReady();
    });

    return () => {
      unsubRooms();
      unsubBookings();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedRoom(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const getRoomStatus = (roomId: string) => {
    const now = Date.now();

    const activeBooking = bookings.find(
      (booking) =>
        booking.roomId === roomId &&
        (booking.status === 'confirmed' || booking.status === 'pay_on_arrival') &&
        booking.checkIn <= now &&
        booking.checkOut >= now
    );
    if (activeBooking) return 'occupied';

    const upcomingBooking = bookings.find(
      (booking) =>
        booking.roomId === roomId &&
        (booking.status === 'confirmed' || booking.status === 'pay_on_arrival') &&
        booking.checkIn > now
    );
    if (upcomingBooking) return 'reserved';

    return 'available';
  };

  const handleSavePrice = async () => {
    if (!canEditPrices) {
      setSaveError('Managers cannot edit room prices.');
      return;
    }
    if (!selectedRoom || !editPrice) return;

    const newPrice = parseInt(editPrice, 10) * 100;
    setSaveError('');
    setSavingPrice(true);
    setRooms((prev) => prev.map((room) => (room.id === selectedRoom.id ? { ...room, basePrice: newPrice } : room)));
    setSelectedRoom({ ...selectedRoom, basePrice: newPrice });
    const persisted = await updateRoomBasePrice(selectedRoom.id, newPrice);
    if (!persisted) {
      setSaveError('Could not persist this change to Firestore. Check your connection/permissions.');
    } else {
      setEditMode(false);
    }
    setSavingPrice(false);
  };

  const totalRooms = rooms.length;
  const available = rooms.filter((room) => getRoomStatus(room.id) === 'available').length;
  const occupied = rooms.filter((room) => getRoomStatus(room.id) === 'occupied').length;
  const reserved = rooms.filter((room) => getRoomStatus(room.id) === 'reserved').length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      <section className="bg-[#f8faf7] border border-[#dfe6dd] rounded-[24px] p-5 md:p-6">
        <h1 className="text-[34px] leading-none font-semibold text-[#1f2d23]">Room Operation</h1>
        <p className="text-sm text-[#849684] mt-1">Track availability and update room pricing</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="rounded-xl border border-[#d9e3d8] bg-white p-3">
            <p className="text-xs text-[#8da08e]">Total Rooms</p>
            <p className="text-3xl font-semibold text-[#2e3f31]">{totalRooms}</p>
          </div>
          <div className="rounded-xl border border-[#d9e3d8] bg-white p-3">
            <p className="text-xs text-[#8da08e]">Available</p>
            <p className="text-3xl font-semibold text-[#4d7a4d]">{available}</p>
          </div>
          <div className="rounded-xl border border-[#d9e3d8] bg-white p-3">
            <p className="text-xs text-[#8da08e]">Occupied</p>
            <p className="text-3xl font-semibold text-[#aa5447]">{occupied}</p>
          </div>
          <div className="rounded-xl border border-[#d9e3d8] bg-white p-3">
            <p className="text-xs text-[#8da08e]">Reserved</p>
            <p className="text-3xl font-semibold text-[#9d6c1f]">{reserved}</p>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="h-64 rounded-xl bg-[#eef3ec] animate-pulse" />
          ))}
        </section>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => {
            const status = getRoomStatus(room.id);
            const hasImage = room.images && room.images.length > 0;

            return (
              <button
                key={room.id}
                onClick={() => {
                  setSelectedRoom(room);
                  setEditPrice(String(room.basePrice / 100));
                  setEditMode(false);
                }}
                className="text-left rounded-2xl border border-[#dce5db] bg-white overflow-hidden hover:border-[#cbd9cc] transition-colors"
              >
                <div className="h-40 bg-[#eef3ec] relative overflow-hidden">
                  {hasImage ? (
                    <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center">
                      <BedDouble className="w-10 h-10 text-[#9fb09f]" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-lg border text-xs font-semibold ${typeStyles[room.type] || typeStyles.standard}`}>
                      {room.type}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${roomStatusStyles[status]}`}>
                      {status}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-[#2b3c2d]">{room.name}</h3>
                  <p className="text-sm text-[#7b8d7c] line-clamp-1 mt-1">{room.description}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="inline-flex items-center gap-1.5 text-sm text-[#5f715f]">
                      <Users className="w-4 h-4" />
                      {room.maxGuests} guests
                    </p>
                    <p className="text-[#2c3e2f] font-semibold">
                      {formatCurrency(room.basePrice, 'TZS')}
                      <span className="text-xs font-normal text-[#8ca08d]">/night</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {room.amenities.slice(0, 4).map((amenity) => (
                      <span key={amenity} className="px-2 py-1 rounded-md text-xs bg-[#f0f5ef] text-[#607260] border border-[#e0e8de]">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </section>
      )}

      {selectedRoom && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setSelectedRoom(null)}>
          <div className="w-full max-w-xl rounded-2xl border border-[#dce5db] bg-[#fbfdfb] shadow-[0_20px_40px_rgba(24,38,28,0.2)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-[#e2eae1] flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide uppercase text-[#92a292]">Room Details</p>
                <h3 className="text-2xl font-semibold text-[#263427] mt-1">{selectedRoom.name}</h3>
              </div>
              <button onClick={() => setSelectedRoom(null)} className="w-9 h-9 rounded-lg border border-[#d7e1d7] text-[#687868] hover:bg-[#f1f6f0]">
                <X className="w-4 h-4 mx-auto" />
              </button>
            </div>

            {selectedRoom.images && selectedRoom.images.length > 0 ? (
              <img src={selectedRoom.images[0]} alt={selectedRoom.name} className="h-48 w-full object-cover" />
            ) : null}

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-1 rounded-lg border text-xs font-semibold ${typeStyles[selectedRoom.type] || typeStyles.standard}`}>
                  {selectedRoom.type}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${roomStatusStyles[getRoomStatus(selectedRoom.id)]}`}>
                  {getRoomStatus(selectedRoom.id)}
                </span>
              </div>

              <p className="text-sm text-[#607260]">{selectedRoom.description}</p>

              <div className="rounded-xl border border-[#e3ebe2] bg-white p-4">
                <p className="text-xs text-[#93a294] uppercase font-semibold mb-2">Base Price (TZS)</p>
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="h-10 flex-1 rounded-xl border border-[#d8e1d7] px-3 text-sm text-[#2f4032] outline-none focus:border-[#b9cdb7]"
                    />
                    <button onClick={handleSavePrice} disabled={savingPrice} className="h-10 px-3 rounded-xl bg-[#6e8d70] text-white text-sm inline-flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed">
                      <Save className="w-4 h-4" />
                      {savingPrice ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-semibold text-[#2b3c2d]">{formatCurrency(selectedRoom.basePrice, 'TZS')}</p>
                    {canEditPrices ? (
                      <button onClick={() => setEditMode(true)} className="h-9 px-3 rounded-xl border border-[#d8e1d7] text-sm text-[#5f715f] inline-flex items-center gap-1.5 hover:bg-[#f1f6f0]">
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    ) : (
                      <span className="h-9 px-3 rounded-xl border border-[#e3ebe2] text-sm text-[#93a294] inline-flex items-center">
                        View only
                      </span>
                    )}
                  </div>
                )}
              </div>
              {saveError ? (
                <p className="text-sm text-[#aa5447]">{saveError}</p>
              ) : null}

              <div>
                <p className="text-xs text-[#93a294] uppercase font-semibold mb-2">Amenities</p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedRoom.amenities.map((amenity) => {
                    const AmenityIcon = amenityIcons[amenity] || Check;
                    return (
                      <div key={amenity} className="rounded-lg border border-[#e3ebe2] bg-white px-3 py-2 text-sm text-[#5f715f] inline-flex items-center gap-2">
                        <AmenityIcon className="w-4 h-4" />
                        {amenity}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
