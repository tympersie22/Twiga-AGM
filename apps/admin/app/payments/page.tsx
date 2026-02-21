'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  DollarSign,
  Eye,
  Filter,
  Search,
  Smartphone,
  Wallet,
  X,
} from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime, formatPhoneNumber } from '@/lib/shared/utils/formatting';
import {
  fetchPayments,
  fetchBookings,
  subscribeBookings,
  subscribePayments,
  updatePaymentStatus,
  updatePaymentStatusesBulk,
} from '@/lib/data';
import type { BookingStatus, PaymentStatus, TwigaPayment, TwigaBooking } from '@/lib/shared/types';

const statusStyles: Record<string, string> = {
  confirmed: 'bg-[#e6f2e5] text-[#4d7a4d]',
  initiated: 'bg-[#fff3df] text-[#9d6c1f]',
  processing: 'bg-[#e6effa] text-[#3d6494]',
  failed: 'bg-[#f9e8e6] text-[#aa5447]',
  refunded: 'bg-[#efe9f7] text-[#6f4b9b]',
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
  const [actionLoading, setActionLoading] = useState<PaymentStatus | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState<PaymentStatus | null>(null);
  const [bulkError, setBulkError] = useState('');

  useEffect(() => {
    let paymentsReady = false;
    let bookingsReady = false;

    const completeLoadingIfReady = () => {
      if (paymentsReady && bookingsReady) setLoading(false);
    };

    const bootstrap = async () => {
      const [paymentData, bookingData] = await Promise.all([fetchPayments(), fetchBookings()]);
      setPayments(paymentData);
      setBookings(bookingData);
    };

    void bootstrap();

    const unsubPayments = subscribePayments((data) => {
      setPayments(data);
      paymentsReady = true;
      completeLoadingIfReady();
    });
    const unsubBookings = subscribeBookings((data) => {
      setBookings(data);
      bookingsReady = true;
      completeLoadingIfReady();
    });

    return () => {
      unsubPayments();
      unsubBookings();
    };
  }, []);

  useEffect(() => {
    setActionLoading(null);
    setActionError('');
    setActionReason('');
  }, [selectedPayment?.id]);

  useEffect(() => {
    setSelectedPaymentIds((prev) => prev.filter((id) => payments.some((payment) => payment.id === id)));
  }, [payments]);

  const filteredPayments = payments.filter((payment) => {
    const booking = bookings.find((b) => b.id === payment.bookingId);
    const needle = searchQuery.toLowerCase();
    const matchesSearch =
      payment.id.toLowerCase().includes(needle) ||
      payment.bookingId.toLowerCase().includes(needle) ||
      payment.flutterwaveRef.toLowerCase().includes(needle) ||
      (booking?.guestName || '').toLowerCase().includes(needle);
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments.filter((p) => p.status === 'confirmed').reduce((acc, p) => acc + p.amount, 0);
  const pendingAmount = payments.filter((p) => p.status === 'initiated' || p.status === 'processing').reduce((acc, p) => acc + p.amount, 0);
  const refundedAmount = payments.filter((p) => p.status === 'refunded').reduce((acc, p) => acc + p.amount, 0);

  const getBooking = (bookingId: string) => bookings.find((b) => b.id === bookingId);

  const applyLocalPaymentUpdate = (
    paymentId: string,
    status: PaymentStatus,
    bookingId: string,
    bookingStatus?: BookingStatus,
    reason?: string
  ) => {
    const now = Date.now();
    setPayments((prev) =>
      prev.map((payment) =>
        payment.id === paymentId
          ? {
              ...payment,
              status,
              confirmedAt: status === 'confirmed' ? now : payment.confirmedAt,
              failureReason: status === 'failed' || status === 'refunded' ? reason || payment.failureReason : payment.failureReason,
            }
          : payment
      )
    );
    setSelectedPayment((prev) =>
      prev
        ? {
            ...prev,
            status,
            confirmedAt: status === 'confirmed' ? now : prev.confirmedAt,
            failureReason: status === 'failed' || status === 'refunded' ? reason || prev.failureReason : prev.failureReason,
          }
        : prev
    );

    if (bookingStatus) {
      setBookings((prev) =>
        prev.map((booking) => {
          if (booking.id !== bookingId) return booking;
          const next = { ...booking, status: bookingStatus, updatedAt: now };
          if (bookingStatus === 'cancelled') {
            next.cancelledAt = now;
            next.cancelReason = reason || `Payment ${status}`;
          }
          return next;
        })
      );
    }
  };

  const handlePaymentAction = async (status: PaymentStatus) => {
    if (!selectedPayment) return;
    if ((status === 'failed' || status === 'refunded') && !actionReason.trim()) {
      setActionError('Please provide a reason for this action.');
      return;
    }

    setActionError('');
    setActionLoading(status);
    const reason = actionReason.trim() || undefined;

    const result = await updatePaymentStatus({
      paymentId: selectedPayment.id,
      bookingId: selectedPayment.bookingId,
      status,
      reason,
    });

    if (!result.ok) {
      setActionError('Could not update payment. Check your permissions/connection and try again.');
      setActionLoading(null);
      return;
    }

    applyLocalPaymentUpdate(selectedPayment.id, status, selectedPayment.bookingId, result.bookingStatus, reason);
    setActionLoading(null);
  };

  const handleBulkPaymentAction = async (status: PaymentStatus) => {
    if (selectedPaymentIds.length === 0) return;
    if ((status === 'failed' || status === 'refunded') && !actionReason.trim()) {
      setBulkError('Please provide a reason for bulk fail/refund.');
      return;
    }

    const reason = actionReason.trim() || undefined;
    const selectedPayments = payments
      .filter((payment) => selectedPaymentIds.includes(payment.id))
      .map((payment) => ({ paymentId: payment.id, bookingId: payment.bookingId }));

    setBulkError('');
    setBulkLoading(status);
    const ok = await updatePaymentStatusesBulk(selectedPayments, status, reason);

    if (!ok) {
      setBulkError('Some payments could not be updated. Please retry.');
      setBulkLoading(null);
      return;
    }

    selectedPayments.forEach((payment) => {
      const bookingStatus: BookingStatus | undefined =
        status === 'confirmed'
          ? 'confirmed'
          : status === 'failed' || status === 'refunded'
          ? 'cancelled'
          : 'pending_payment';
      applyLocalPaymentUpdate(payment.paymentId, status, payment.bookingId, bookingStatus, reason);
    });
    setSelectedPaymentIds([]);
    setBulkLoading(null);
  };

  const togglePaymentSelection = (paymentId: string) => {
    setSelectedPaymentIds((prev) =>
      prev.includes(paymentId) ? prev.filter((id) => id !== paymentId) : [...prev, paymentId]
    );
  };

  const allFilteredSelected =
    filteredPayments.length > 0 && filteredPayments.every((payment) => selectedPaymentIds.includes(payment.id));

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      <section className="bg-[#f8faf7] border border-[#dfe6dd] rounded-[24px] p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-[34px] leading-none font-semibold text-[#1f2d23]">Payments</h1>
            <p className="text-sm text-[#849684] mt-1">Monitor collection, pending transactions, and refunds</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative min-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#91a192]" />
              <input
                type="text"
                placeholder="Search payment ID, booking, guest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 rounded-xl bg-white border border-[#d8e1d7] pl-9 pr-3 text-sm text-[#2f4032] outline-none focus:border-[#b9cdb7]"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#91a192]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 min-w-[190px] rounded-xl bg-white border border-[#d8e1d7] pl-9 pr-8 text-sm text-[#2f4032] outline-none focus:border-[#b9cdb7] appearance-none"
              >
                <option value="all">All statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="initiated">Initiated</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-5">
          <div className="rounded-xl border border-[#d9e3d8] bg-white p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-[#8da08e]">Collected</p>
              <CheckCircle className="w-4 h-4 text-[#4d7a4d]" />
            </div>
            <p className="text-2xl font-semibold text-[#2c3d2f]">{formatCurrency(totalRevenue, 'TZS')}</p>
          </div>
          <div className="rounded-xl border border-[#d9e3d8] bg-white p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-[#8da08e]">Pending</p>
              <AlertCircle className="w-4 h-4 text-[#9d6c1f]" />
            </div>
            <p className="text-2xl font-semibold text-[#2c3d2f]">{formatCurrency(pendingAmount, 'TZS')}</p>
          </div>
          <div className="rounded-xl border border-[#d9e3d8] bg-white p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-[#8da08e]">Refunded</p>
              <Wallet className="w-4 h-4 text-[#6f4b9b]" />
            </div>
            <p className="text-2xl font-semibold text-[#2c3d2f]">{formatCurrency(refundedAmount, 'TZS')}</p>
          </div>
          <div className="rounded-xl border border-[#d9e3d8] bg-white p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-[#8da08e]">Transactions</p>
              <CreditCard className="w-4 h-4 text-[#3d6494]" />
            </div>
            <p className="text-2xl font-semibold text-[#2c3d2f]">{payments.length}</p>
          </div>
        </div>
      </section>

      <section className="bg-white border border-[#dce5db] rounded-2xl overflow-hidden">
        {selectedPaymentIds.length > 0 ? (
          <div className="p-3 border-b border-[#e3ebe2] bg-[#f7fbf6]">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-[#446346]">{selectedPaymentIds.length} selected</p>
              <button
                onClick={() => handleBulkPaymentAction('confirmed')}
                disabled={bulkLoading !== null}
                className="h-8 px-3 rounded-lg border border-[#c9ddca] bg-[#eaf4ea] text-[#3f6e40] text-xs font-semibold disabled:opacity-60"
              >
                {bulkLoading === 'confirmed' ? 'Updating...' : 'Bulk Confirm'}
              </button>
              <button
                onClick={() => handleBulkPaymentAction('processing')}
                disabled={bulkLoading !== null}
                className="h-8 px-3 rounded-lg border border-[#cad8e8] bg-[#e9f0f8] text-[#3b5f8e] text-xs font-semibold disabled:opacity-60"
              >
                {bulkLoading === 'processing' ? 'Updating...' : 'Bulk Processing'}
              </button>
              <button
                onClick={() => handleBulkPaymentAction('failed')}
                disabled={bulkLoading !== null}
                className="h-8 px-3 rounded-lg border border-[#ebd0cc] bg-[#f9ece9] text-[#9d4f44] text-xs font-semibold disabled:opacity-60"
              >
                {bulkLoading === 'failed' ? 'Updating...' : 'Bulk Fail'}
              </button>
              <button
                onClick={() => handleBulkPaymentAction('refunded')}
                disabled={bulkLoading !== null}
                className="h-8 px-3 rounded-lg border border-[#dccfef] bg-[#f2edf9] text-[#6d4c96] text-xs font-semibold disabled:opacity-60"
              >
                {bulkLoading === 'refunded' ? 'Updating...' : 'Bulk Refund'}
              </button>
              <button
                onClick={() => setSelectedPaymentIds([])}
                className="h-8 px-3 rounded-lg border border-[#d8e1d7] bg-white text-[#5f715f] text-xs font-semibold"
              >
                Clear
              </button>
            </div>
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Reason for bulk fail/refund"
              className="mt-2 w-full min-h-[64px] rounded-lg border border-[#d8e1d7] px-3 py-2 text-sm text-[#2f4032] outline-none focus:border-[#b9cdb7]"
            />
            {bulkError ? <p className="mt-1 text-sm text-[#aa5447]">{bulkError}</p> : null}
          </div>
        ) : null}

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="h-12 rounded-lg bg-[#f1f5ef] animate-pulse" />
            ))}
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-10 text-center text-[#6c7f6d]">No payments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f5f8f4] border-b border-[#e3ebe2]">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPaymentIds(filteredPayments.map((payment) => payment.id));
                        } else {
                          setSelectedPaymentIds([]);
                        }
                      }}
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">Payment</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">Guest</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">Method</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#899a8a]">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const booking = getBooking(payment.bookingId);
                  const MethodIcon = methodIcons[payment.method] || CreditCard;

                  return (
                    <tr key={payment.id} className="border-b border-[#edf2ec] hover:bg-[#f8fbf7]">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedPaymentIds.includes(payment.id)}
                          onChange={() => togglePaymentSelection(payment.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#2f4032]">#{payment.id}</p>
                        <p className="text-xs text-[#8da08e]">{payment.flutterwaveRef}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-[#2f4032]">{booking?.guestName || 'Unknown'}</p>
                        <p className="text-xs text-[#8da08e]">{payment.bookingId}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="inline-flex items-center gap-2 text-[#617262]">
                          <MethodIcon className="w-4 h-4" />
                          {methodLabels[payment.method] || payment.method}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#2f4032]">{formatCurrency(payment.amount, payment.currency)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[payment.status]}`}>
                          {statusLabels[payment.status]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#617262]">{formatDate(payment.createdAt)}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[#d7e1d7] text-[#5f715f] hover:bg-[#f0f5ef]"
                          title="View payment details"
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
      </section>

      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setSelectedPayment(null)}>
          <div className="w-full max-w-xl rounded-2xl border border-[#dce5db] bg-[#fbfdfb] shadow-[0_20px_40px_rgba(24,38,28,0.2)]" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-[#e2eae1] flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide uppercase text-[#92a292]">Payment Details</p>
                <h3 className="text-2xl font-semibold text-[#263427] mt-1">#{selectedPayment.id}</h3>
              </div>
              <button onClick={() => setSelectedPayment(null)} className="w-9 h-9 rounded-lg border border-[#d7e1d7] text-[#687868] hover:bg-[#f1f6f0]">
                <X className="w-4 h-4 mx-auto" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[selectedPayment.status]}`}>
                  {statusLabels[selectedPayment.status]}
                </span>
                <p className="text-2xl font-semibold text-[#2b3c2d]">{formatCurrency(selectedPayment.amount, selectedPayment.currency)}</p>
              </div>

              <div className="rounded-xl border border-[#e3ebe2] bg-white p-4 space-y-2 text-sm text-[#5f715f]">
                <p><span className="text-[#8ea08f]">Booking:</span> {selectedPayment.bookingId}</p>
                <p><span className="text-[#8ea08f]">Method:</span> {methodLabels[selectedPayment.method]}</p>
                <p><span className="text-[#8ea08f]">Flutterwave Ref:</span> {selectedPayment.flutterwaveRef}</p>
                <p><span className="text-[#8ea08f]">Created:</span> {formatDateTime(selectedPayment.createdAt)}</p>
                <p><span className="text-[#8ea08f]">Confirmed:</span> {selectedPayment.confirmedAt ? formatDateTime(selectedPayment.confirmedAt) : 'N/A'}</p>
              </div>

              {(() => {
                const booking = getBooking(selectedPayment.bookingId);
                if (!booking) return null;

                return (
                  <div className="rounded-xl border border-[#e3ebe2] bg-white p-4 space-y-2">
                    <p className="text-xs text-[#93a294] uppercase font-semibold">Guest</p>
                    <p className="text-lg font-semibold text-[#2b3c2d]">{booking.guestName}</p>
                    <p className="text-sm text-[#647765]">{booking.guestEmail}</p>
                    <p className="text-sm text-[#647765]">{formatPhoneNumber(booking.guestPhone)}</p>
                  </div>
                );
              })()}

              <div className="rounded-xl border border-[#e3ebe2] bg-white p-4 space-y-3">
                <p className="text-xs text-[#93a294] uppercase font-semibold">Admin Actions</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handlePaymentAction('confirmed')}
                    disabled={actionLoading !== null}
                    className="h-10 rounded-xl border border-[#c9ddca] bg-[#eaf4ea] text-[#3f6e40] text-sm font-semibold disabled:opacity-60"
                  >
                    {actionLoading === 'confirmed' ? 'Updating...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => handlePaymentAction('processing')}
                    disabled={actionLoading !== null}
                    className="h-10 rounded-xl border border-[#cad8e8] bg-[#e9f0f8] text-[#3b5f8e] text-sm font-semibold disabled:opacity-60"
                  >
                    {actionLoading === 'processing' ? 'Updating...' : 'Processing'}
                  </button>
                  <button
                    onClick={() => handlePaymentAction('failed')}
                    disabled={actionLoading !== null}
                    className="h-10 rounded-xl border border-[#ebd0cc] bg-[#f9ece9] text-[#9d4f44] text-sm font-semibold disabled:opacity-60"
                  >
                    {actionLoading === 'failed' ? 'Updating...' : 'Fail'}
                  </button>
                  <button
                    onClick={() => handlePaymentAction('refunded')}
                    disabled={actionLoading !== null}
                    className="h-10 rounded-xl border border-[#dccfef] bg-[#f2edf9] text-[#6d4c96] text-sm font-semibold disabled:opacity-60"
                  >
                    {actionLoading === 'refunded' ? 'Updating...' : 'Refund'}
                  </button>
                </div>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Reason required for fail/refund"
                  className="w-full min-h-[76px] rounded-xl border border-[#d8e1d7] px-3 py-2 text-sm text-[#2f4032] outline-none focus:border-[#b9cdb7]"
                />
                {actionError ? <p className="text-sm text-[#aa5447]">{actionError}</p> : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
