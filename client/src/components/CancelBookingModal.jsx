import React, { useState, useEffect } from 'react';
import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';
import { cancelBooking } from '../services/api';

const CANCEL_REASONS = [
  'Change of plans',
  'Booked wrong showtime or seats',
  'Found better seats / timing',
  'Personal emergency',
  'Other'
];

const CancelBookingModal = ({ isOpen, onClose, booking, onCancellationSuccess }) => {
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    // Reset state when opened
    setReason(CANCEL_REASONS[0]);
    setCustomReason('');
    setError('');

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, loading, onClose, booking?._id]);

  if (!isOpen || !booking) return null;

  const movieTitle = booking.movie?.title || booking.snapshot?.movieTitle || booking.show?.movie?.title || 'Movie';
  const theatreName = booking.theatre?.name || booking.snapshot?.theatreName || booking.show?.theatre?.name || 'Cinema Theatre';
  const showTime = booking.snapshot?.startTime || booking.show?.startTime || '';
  const rawDate = booking.snapshot?.startsAt || booking.show?.startsAt || booking.show?.date;
  const showDateFormatted = rawDate ? new Date(rawDate).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }) : '';

  const seats = (booking.seatNumbers && booking.seatNumbers.length > 0)
    ? booking.seatNumbers.join(', ')
    : (booking.bookingSeats && booking.bookingSeats.length > 0)
    ? booking.bookingSeats.map(s => s.seatLabel || s.label).join(', ')
    : (booking.seats && booking.seats.length > 0)
    ? (typeof booking.seats[0] === 'string' ? booking.seats.join(', ') : booking.seats.map(s => s.label).join(', '))
    : 'Confirmed Seats';

  const totalAmount = Number(booking.totalAmount || booking.subtotal || 0);
  const cancellationSummary = booking.cancellationSummary || {};
  const feePercent = cancellationSummary.feePercent ?? booking.cancellationFeePercent ?? 20;
  const cancellationFee = Number(cancellationSummary.cancellationFee ?? (totalAmount * (feePercent / 100)).toFixed(2));
  const refundAmount = Number(cancellationSummary.refundAmount ?? (totalAmount - cancellationFee).toFixed(2));

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError('');
      const finalReason = reason === 'Other' && customReason.trim() ? customReason.trim() : reason;
      const bookingId = booking._id || booking.id || booking.bookingNumber || booking.bookingId;
      const res = await cancelBooking(bookingId, { reason: finalReason });
      const resData = res.data?.data || res.data;
      const updatedDoc = resData?.booking || resData;

      if (onCancellationSuccess) {
        onCancellationSuccess({
          ...booking,
          ...updatedDoc,
          ...(resData?.refundSummary || {}),
          status: 'cancelled',
          bookingStatus: 'cancelled',
          cancellationFee,
          refundAmount
        });
      }
      onClose();
    } catch (err) {
      console.error('Cancellation error:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to cancel booking. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-booking-modal-title"
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 1055,
        backdropFilter: 'blur(3px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="bg-white rounded-3 shadow-lg w-100 overflow-hidden"
        style={{ maxWidth: '480px' }}
      >
        {/* Modal Header */}
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span className="p-1.5 rounded-circle bg-danger-subtle text-danger d-inline-flex">
              <IconAlertTriangle size={18} />
            </span>
            <h5 id="cancel-booking-modal-title" className="fw-bold mb-0 text-dark" style={{ fontSize: '16px' }}>
              Cancel Ticket &amp; Refund
            </h5>
          </div>
          <button
            type="button"
            className="btn-close"
            disabled={loading}
            onClick={onClose}
            aria-label="Close"
          />
        </div>

        {/* Modal Body */}
        <div className="p-3 p-md-4">
          {/* Ticket Snapshot */}
          <div className="p-2.5 rounded-2 bg-light border mb-3">
            <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '14px' }}>
              {movieTitle}
            </h6>
            <div className="text-muted small" style={{ fontSize: '12px' }}>
              <div>{theatreName}</div>
              <div>{showDateFormatted ? `${showDateFormatted} | ` : ''}{showTime} • Seats: <strong>{seats}</strong></div>
            </div>
          </div>

          {/* Refund Breakdown Card */}
          <div className="p-3 rounded-2 border mb-3" style={{ backgroundColor: '#FAFAFA' }}>
            <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: '13px' }}>
              <span className="text-secondary">Total Amount Paid</span>
              <span className="fw-semibold text-dark">₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: '13px' }}>
              <span className="text-danger">Cancellation Fee ({feePercent}%)</span>
              <span className="fw-semibold text-danger">- ₹{cancellationFee.toFixed(2)}</span>
            </div>
            <hr className="my-2" />
            <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '14px' }}>
              <span className="fw-bold text-success">Refundable Amount (80%)</span>
              <span className="fw-bold text-success fs-5">₹{refundAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-dark mb-1">
              Reason for cancellation <span className="text-muted fw-normal">(optional)</span>
            </label>
            <select
              className="form-select form-select-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
            >
              {CANCEL_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {reason === 'Other' && (
              <input
                type="text"
                className="form-control form-control-sm mt-2"
                placeholder="Please specify reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                maxLength={100}
                disabled={loading}
              />
            )}
          </div>

          {/* Policy Information Box */}
          <div
            className="rounded-2 p-2.5 mb-3 d-flex gap-2"
            style={{
              backgroundColor: '#EFF8FF',
              border: '1px solid #B2DDFF',
              color: '#175CD3',
              fontSize: '11px',
              lineHeight: 1.5
            }}
          >
            <IconInfoCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <strong>Cancellation Policy:</strong> A 20% cancellation fee is deducted. The remaining 80% refund (<strong>₹{refundAmount.toFixed(2)}</strong>) will be credited to your original payment method in 5–7 business days. Your seats will be released immediately.
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger py-2 px-3 small mb-0" role="alert">
              {error}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="d-flex justify-content-end gap-2 p-3 bg-light border-top">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary px-3 py-1.5 fw-medium rounded-2"
            disabled={loading}
            onClick={onClose}
          >
            Keep Ticket
          </button>
          <button
            type="button"
            className="btn btn-sm btn-danger px-3 py-1.5 fw-semibold rounded-2 d-flex align-items-center gap-1.5"
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Confirm Cancellation</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;
