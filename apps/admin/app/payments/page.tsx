'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, CreditCard, Smartphone, Wallet, Eye, X, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime, formatPhoneNumber } from '@twiga/shared/utils/formatting';
import { fetchPayments, fetchBookings } from '@/lib/data';
import type { TwigaPayment, TwigaBooking } from '@twiga/shared/types';

const statusStyles: Record<string, string> = {
  confirmed: 'bg-green-500/20 text-green-400',
  initiated: 'bg-yellow-500/20 text-yellow-400',
  processing: 'bg-blue-500/20 text-blue-400',
  failed: 'bg-red-500/20 text-red-400',
  refunded: 'bg-purple-500/20 text-purple-400',
};

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmed',
  initiated: 'Initiated',
  processing: 'Processing',
  failed: 'Failed',
  refunded: 'Refunded',
};

const methodLabels: Record<string, string> = {
  mobile_money: 'Mobile Money',
  card: 'Card',
  pay_on_arrival: 'Pay on Arrival',
  bank_transfer: 'Bank Transfer',
};

const methodIcons: Record<string, React.ElementType> = {
  mobile_money: Smartphone,
  card: CreditCard,
  pay_on_arrival: Wallet,
  bank_transfer: DollarSign,
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<TwigaPayment[]>([]);
  const [bookings, setBookings] = useState<TwigaBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<TwigaPayment | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [paymentData, bookingData] = await Promise.all([
          fetchPayments(),
          fetchBookings(),
        ]);
        setPayments(paymentData);
        setBookings(bookingData);
      } catch {
        // handled — will show empty state
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredPayments = payments.filter((p) => {
    const booking = bookings.find((b) => b.id === p.bookingId);
    const matchesSearch =
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.flutterwaveRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking?.guestName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments
    .filter((p) => p.status === 'confirmed')
    .reduce((acc, p) => acc + p.amount, 0);
  const pendingAmount = payments
    .filter((p) => p.status === 'initiated' || p.status === 'processing')
    .reduce((acc, p) => acc + p.amount, 0);
  const refundedAmount = payments
    .filter((p) => p.status === 'refunded')
    .reduce((acc, p) => acc + p.amount, 0);

  const getGuestName = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    return booking?.guestName || 'Unknown';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-1">Payment Hub</h1>
        <p className="text-gray-400">Track and manage all payments</p>
      </motion.div>

      {/* Revenue stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Total Collected</p>
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(totalRevenue, 'TZS')}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Pending</p>
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-yellow-400">{formatCurrency(pendingAmount, 'TZS')}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Refunded</p>
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400">{formatCurrency(refundedAmount, 'TZS')}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Total Transactions</p>
            <CreditCard className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{payments.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by payment ID, booking ID, guest, or ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-8 py-3 text-white appearance-none cursor-pointer focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="initiated">Initiated</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Payments table */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No payments found</p>
            <p className="text-sm">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50 border-b border-gray-700">
                <tr>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Payment ID</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Guest</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Method</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Amount</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400">Date</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-400"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const MethodIcon = methodIcons[payment.method] || CreditCard;
                  return (
                    <tr key={payment.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition">
                      <td className="py-4 px-4 font-mono text-green-400 text-xs">{payment.id}</td>
                      <td className="py-4 px-4">
                        <p className="text-white font-medium">{getGuestName(payment.bookingId)}</p>
                        <p className="text-gray-400 text-xs">{payment.bookingId}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <MethodIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">{methodLabels[payment.method]}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-white">{formatCurrency(payment.amount, payment.currency)}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[payment.status]}`}>
                          {statusLabels[payment.status]}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-300 text-xs">{formatDate(payment.createdAt)}</td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="text-gray-400 hover:text-green-400 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPayment(null)}>
          <motion.div
            className="bg-gray-800 rounded-xl border border-gray-700 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-white">Payment Details</h3>
                <p className="text-sm font-mono text-green-400">{selectedPayment.id}</p>
              </div>
              <button onClick={() => setSelectedPayment(null)} className="text-gray-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusStyles[selectedPayment.status]}`}>
                  {statusLabels[selectedPayment.status]}
                </span>
                <span className="text-green-400 text-2xl font-bold">
                  {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                </span>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Payment Info</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Method</p>
                    <p className="text-white font-medium">{methodLabels[selectedPayment.method]}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Currency</p>
                    <p className="text-white font-medium">{selectedPayment.currency}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Booking</p>
                    <p className="text-white font-medium font-mono text-xs">{selectedPayment.bookingId}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Guest</p>
                    <p className="text-white font-medium">{getGuestName(selectedPayment.bookingId)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Flutterwave</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Reference</p>
                    <p className="text-white font-medium font-mono text-xs">{selectedPayment.flutterwaveRef || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Webhook</p>
                    <p className="text-white font-medium">{selectedPayment.webhookReceived ? 'Received' : 'Pending'}</p>
                  </div>
                  {selectedPayment.mobileProvider && (
                    <div>
                      <p className="text-gray-400">Provider</p>
                      <p className="text-white font-medium uppercase">{selectedPayment.mobileProvider}</p>
                    </div>
                  )}
                  {selectedPayment.phoneNumber && (
                    <div>
                      <p className="text-gray-400">Phone</p>
                      <p className="text-white font-medium">{formatPhoneNumber(selectedPayment.phoneNumber)}</p>
                    </div>
                  )}
                  {selectedPayment.metadata?.last4 && (
                    <div>
                      <p className="text-gray-400">Card</p>
                      <p className="text-white font-medium">**** {selectedPayment.metadata.last4}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-400">STK Attempts</p>
                    <p className="text-white font-medium">{selectedPayment.stkPushAttempts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white">{formatDateTime(selectedPayment.createdAt)}</span>
                  </div>
                  {selectedPayment.confirmedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Confirmed</span>
                      <span className="text-green-400">{formatDateTime(selectedPayment.confirmedAt)}</span>
                    </div>
                  )}
                  {selectedPayment.webhookAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Webhook</span>
                      <span className="text-white">{formatDateTime(selectedPayment.webhookAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedPayment.failureReason && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-red-400 mb-1">Failure Reason</h4>
                  <p className="text-gray-300 text-sm">{selectedPayment.failureReason}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
