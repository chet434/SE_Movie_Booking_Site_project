import React from 'react';
import TicketDetailGrid from './TicketDetailGrid';
import TicketSeparator from './TicketSeparator';
import BookingBarcode from './BookingBarcode';
import { IconCheck, IconTicket } from '@tabler/icons-react';

const formatText = (val, fallback = '') => {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val.name || val.title || val.line1 || fallback;
  }
  return String(val);
};

const BookingTicket = ({ booking, printable = false }) => {
  if (!booking) return null;

  const movieTitle = formatText(booking.movie?.title || booking.snapshot?.movieTitle || booking.show?.movie?.title, 'Movie');
  const poster = booking.movie?.poster || booking.snapshot?.moviePoster || booking.snapshot?.posterUrl || booking.show?.movie?.poster;
  const language = formatText(booking.movie?.language || booking.snapshot?.language || booking.show?.language, 'Hindi');
  const format = formatText(booking.show?.format || booking.snapshot?.format, '2D');
  const theatreName = formatText(booking.theatre?.name || booking.snapshot?.theatreName || booking.show?.theatre?.name, 'CineBook Cinema');
  const code = booking.bookingNumber || booking.bookingId || booking._id;

  return (
    <div
      className={`bg-white rounded-3 shadow border overflow-hidden mx-auto ${printable ? 'printable-ticket' : ''}`}
      style={{
        maxWidth: '480px',
        width: '100%'
      }}
      id={printable ? 'printable-ticket' : undefined}
    >
      {/* Header Strip with BMS Red Accent */}
      <div
        className="p-3 text-white d-flex align-items-center justify-content-between"
        style={{ backgroundColor: 'var(--bms-brand-red)' }}
      >
        <div className="d-flex align-items-center gap-2">
          <IconTicket size={22} />
          <span className="fw-bold" style={{ fontSize: '16px', letterSpacing: '0.5px' }}>
            cinebook M-Ticket
          </span>
        </div>
        {booking.status === 'cancelled' || booking.bookingStatus === 'cancelled' ? (
          <span className="badge bg-secondary text-white fw-bold" style={{ fontSize: '11px' }}>
            CANCELLED
          </span>
        ) : (
          <span className="badge bg-white text-danger fw-bold" style={{ fontSize: '11px' }}>
            CONFIRMED
          </span>
        )}
      </div>

      {/* Cancellation Banner */}
      {(booking.status === 'cancelled' || booking.bookingStatus === 'cancelled') && (
        <div className="p-3 bg-danger-subtle border-bottom text-danger">
          <div className="fw-bold mb-0.5" style={{ fontSize: '13px' }}>
            Ticket Cancelled &bull; 80% Refund Processed
          </div>
          <div className="small" style={{ fontSize: '11px' }}>
            Paid: ₹{Number(booking.totalAmount || 0).toFixed(2)} &bull; 20% Fee: ₹{Number(booking.cancellationFee ?? (booking.totalAmount ? booking.totalAmount * 0.2 : 0)).toFixed(2)} &bull; Refunded: <strong>₹{Number(booking.refundAmount ?? (booking.totalAmount ? booking.totalAmount * 0.8 : 0)).toFixed(2)}</strong>
          </div>
        </div>
      )}

      {/* Movie Details Banner */}
      <div className="p-4 border-bottom d-flex gap-3 align-items-center">
        {poster && (
          <img
            src={poster}
            alt={movieTitle}
            className="rounded-2 flex-shrink-0 shadow-sm"
            style={{ width: '64px', height: '96px', objectFit: 'cover' }}
          />
        )}
        <div>
          <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '18px' }}>
            {movieTitle}
          </h5>
          <p className="text-muted small mb-1">
            {language} • {format}
          </p>
          <div className="small fw-semibold text-danger">
            {theatreName}
          </div>
        </div>
      </div>

      {/* Ticket Info Grid */}
      <div className="p-4 bg-light">
        <TicketDetailGrid booking={booking} />
      </div>

      <TicketSeparator />

      {/* Barcode & Booking Reference */}
      <div className="p-4 text-center bg-white">
        <BookingBarcode bookingCode={code} bookingId={code} />
        <small className="text-muted mt-2 d-block" style={{ fontSize: '11px' }}>
          Scan barcode or show this M-Ticket at the cinema entrance.
        </small>
      </div>
    </div>
  );
};

export default BookingTicket;
