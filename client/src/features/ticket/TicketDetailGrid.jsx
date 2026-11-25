import React from 'react';
import { IconMapPin, IconCalendar, IconClock, IconArmchair, IconDeviceTv } from '@tabler/icons-react';

const formatAddress = (addr, location, fallback = 'Bhubaneswar') => {
  if (typeof addr === 'string' && addr.trim()) return addr.trim();
  if (addr && typeof addr === 'object') {
    const parts = [addr.line1, addr.line2, addr.city, addr.pincode].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
  }
  if (typeof location === 'string' && location.trim()) return location.trim();
  return fallback;
};

const formatText = (val, fallback = '') => {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val.name || val.title || val.line1 || fallback;
  }
  return String(val);
};

const TicketDetailGrid = ({ booking }) => {
  const theatreName = formatText(booking.theatre?.name || booking.snapshot?.theatreName || booking.show?.theatre?.name, 'CineBook Cinema');
  const theatreAddress = formatAddress(
    booking.theatre?.address || booking.snapshot?.theatreAddress,
    booking.theatre?.location || booking.snapshot?.cityName,
    'Bhubaneswar'
  );

  const rawDate = booking.show?.date || booking.show?.startsAt || booking.snapshot?.startsAt;
  const showDate = rawDate
    ? new Date(rawDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'Today';

  const startTime = formatText(booking.show?.startTime || booking.snapshot?.startTime, '07:30 PM');
  const screenName = formatText(booking.screenName || booking.show?.screenName || booking.snapshot?.screenName, 'Audi 01');
  const format = formatText(booking.show?.format || booking.snapshot?.format, '2D');

  const seatList = (booking.seatNumbers && booking.seatNumbers.length > 0)
    ? booking.seatNumbers
    : (booking.bookingSeats && booking.bookingSeats.length > 0)
    ? booking.bookingSeats.map(s => s.seatLabel || s.label)
    : (booking.seats && booking.seats.length > 0)
    ? booking.seats.map(s => typeof s === 'string' ? s : (s.label || s.seatNumber))
    : [];

  const totalPaid = booking.totalAmount || booking.subtotal || 0;

  return (
    <div className="py-2">
      {/* Cinema Theatre Name & Location */}
      <div className="mb-3">
        <div className="d-flex align-items-center gap-1 text-muted small fw-bold mb-0.5">
          <IconMapPin size={13} style={{ color: '#C41230' }} />
          <span style={{ fontSize: '11px', letterSpacing: '1px' }}>CINEMA VENUE</span>
        </div>
        <div className="fw-bold text-dark fs-5" style={{ fontFamily: 'var(--cb-font-display)' }}>
          {theatreName}
        </div>
        <div className="text-muted small">
          {theatreAddress}
        </div>
      </div>

      {/* Grid of Key Metadata */}
      <div className="row g-3">
        {/* Date */}
        <div className="col-6">
          <div className="d-flex align-items-center gap-1 text-muted small fw-bold mb-0.5">
            <IconCalendar size={13} style={{ color: '#C41230' }} />
            <span style={{ fontSize: '10px', letterSpacing: '0.8px' }}>SHOW DATE</span>
          </div>
          <div className="fw-bold text-dark small">
            {showDate}
          </div>
        </div>

        {/* Showtime */}
        <div className="col-6">
          <div className="d-flex align-items-center gap-1 text-muted small fw-bold mb-0.5">
            <IconClock size={13} style={{ color: '#C41230' }} />
            <span style={{ fontSize: '10px', letterSpacing: '0.8px' }}>START TIME</span>
          </div>
          <div className="fw-bold text-dark small font-monospace">
            {startTime}
          </div>
        </div>

        {/* Screen / Auditorium */}
        <div className="col-6">
          <div className="d-flex align-items-center gap-1 text-muted small fw-bold mb-0.5">
            <IconDeviceTv size={13} style={{ color: '#C41230' }} />
            <span style={{ fontSize: '10px', letterSpacing: '0.8px' }}>AUDITORIUM</span>
          </div>
          <div className="fw-bold text-dark small">
            {screenName}
          </div>
        </div>

        {/* Cinema Format */}
        <div className="col-6">
          <div className="d-flex align-items-center gap-1 text-muted small fw-bold mb-0.5">
            <span style={{ fontSize: '10px', letterSpacing: '0.8px' }}>FORMAT</span>
          </div>
          <div className="d-flex align-items-center">
            <span
              className="badge"
              style={{
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: '1px solid #D1D5DB',
                fontSize: '10px',
                padding: '3px 8px',
                fontWeight: 600
              }}
            >
              {format}
            </span>
          </div>
        </div>

        {/* Seats Reserved */}
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between text-muted small fw-bold mb-1">
            <div className="d-flex align-items-center gap-1">
              <IconArmchair size={13} style={{ color: '#C41230' }} />
              <span style={{ fontSize: '10px', letterSpacing: '0.8px' }}>
                RESERVED SEATS ({seatList.length})
              </span>
            </div>
            <span className="text-muted small">All seats confirmed</span>
          </div>
          <div className="d-flex flex-wrap gap-1.5">
            {seatList.map((seat) => (
              <span
                key={seat}
                className="px-2.5 py-1 rounded-2 font-monospace fw-bold"
                style={{
                  backgroundColor: '#FFF1F2',
                  color: '#C41230',
                  border: '1px solid #FECDD3',
                  fontSize: '12px'
                }}
              >
                {seat}
              </span>
            ))}
          </div>
        </div>

        {/* Total Fare */}
        <div className="col-12 pt-2" style={{ borderTop: '1px solid #E5E7EB' }}>
          <div className="d-flex align-items-center justify-content-between">
            <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>
              Total Amount Paid
            </span>
            <span
              className="fw-bold fs-5 font-monospace"
              style={{ color: '#C41230' }}
            >
              ₹{Number(totalPaid).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailGrid;
