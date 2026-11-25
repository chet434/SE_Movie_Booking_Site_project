import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  IconTicket,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconChevronRight,
  IconQrcode,
  IconX,
  IconMusic
} from '@tabler/icons-react';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState({ upcoming: [], past: [] });
  const [eventBookings, setEventBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [selectedEventPass, setSelectedEventPass] = useState(null);

  useEffect(() => {
    fetchBookings();
    loadEventBookings();
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getMyBookings();
      const data = res.data?.data || { upcoming: [], past: [] };
      setBookings({
        upcoming: Array.isArray(data.upcoming) ? data.upcoming : [],
        past: Array.isArray(data.past) ? data.past : []
      });
    } catch (error) {
      console.error('Failed to load user orders:', error);
      setBookings({ upcoming: [], past: [] });
    } finally {
      setLoading(false);
    }
  };

  const loadEventBookings = () => {
    try {
      const userKey = `cinebook_event_bookings_${user?._id || 'guest'}`;
      const userEvents = JSON.parse(localStorage.getItem(userKey) || '[]');
      const globalEvents = JSON.parse(localStorage.getItem('cinebook_event_bookings_all') || '[]');
      
      const map = new Map();
      [...userEvents, ...globalEvents].forEach((b) => {
        if (b && (b.bookingRef || b.id)) {
          map.set(b.bookingRef || b.id, b);
        }
      });
      setEventBookings(Array.from(map.values()));
    } catch (err) {
      console.error('Failed to load local event bookings:', err);
      setEventBookings([]);
    }
  };

  const currentBookings = activeTab === 'upcoming' ? bookings.upcoming : bookings.past;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading bookings...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bms-bg-page)', minHeight: '85vh', paddingBottom: '60px' }}>
      <div className="bms-container py-4">
        {/* Header Title */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="fw-bold text-dark mb-1" style={{ fontSize: '24px' }}>
              Your Orders
            </h1>
            <p className="text-muted small mb-0">View your active and past movie bookings and live event passes</p>
          </div>
        </div>

        {/* BMS Navigation Tabs */}
        <div className="d-flex gap-2 mb-4 border-bottom pb-2">
          <button
            type="button"
            className="btn btn-sm fw-bold px-4 py-2 rounded-2"
            onClick={() => setActiveTab('upcoming')}
            style={{
              backgroundColor: activeTab === 'upcoming' ? 'var(--bms-brand-red)' : '#FFFFFF',
              color: activeTab === 'upcoming' ? '#FFFFFF' : '#333333',
              border: activeTab === 'upcoming' ? 'none' : '1px solid #DDD',
              fontSize: '13px'
            }}
          >
            Upcoming ({bookings.upcoming.length})
          </button>
          <button
            type="button"
            className="btn btn-sm fw-bold px-4 py-2 rounded-2"
            onClick={() => setActiveTab('past')}
            style={{
              backgroundColor: activeTab === 'past' ? 'var(--bms-brand-red)' : '#FFFFFF',
              color: activeTab === 'past' ? '#FFFFFF' : '#333333',
              border: activeTab === 'past' ? 'none' : '1px solid #DDD',
              fontSize: '13px'
            }}
          >
            Past ({bookings.past.length})
          </button>
          <button
            type="button"
            className="btn btn-sm fw-bold px-4 py-2 rounded-2 d-flex align-items-center gap-1"
            onClick={() => setActiveTab('events')}
            style={{
              backgroundColor: activeTab === 'events' ? 'var(--bms-brand-red)' : '#FFFFFF',
              color: activeTab === 'events' ? '#FFFFFF' : '#333333',
              border: activeTab === 'events' ? 'none' : '1px solid #DDD',
              fontSize: '13px'
            }}
          >
            <IconMusic size={15} />
            <span>Live Events ({eventBookings.length})</span>
          </button>
        </div>

        {/* Tab 1 & 2: Movie Bookings List */}
        {activeTab !== 'events' ? (
          currentBookings.length === 0 ? (
            <div className="bg-white rounded-3 text-center py-5 px-3 border shadow-sm">
              <IconTicket size={48} className="text-muted mb-3" />
              <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '18px' }}>No Bookings Found</h2>
              <p className="text-muted small mb-4">You have not booked any tickets in this category yet.</p>
              <Link
                to="/"
                className="btn text-white fw-semibold px-4 py-2 rounded-2"
                style={{ backgroundColor: 'var(--bms-brand-red)', fontSize: '14px' }}
              >
                Explore Movies
              </Link>
            </div>
          ) : (
            <div className="row g-3">
              {currentBookings.map((b) => {
                const bookingId = b.bookingNumber || b.bookingId || b._id;
                const movieTitle = typeof b.movie === 'object' ? (b.movie?.title || b.snapshot?.movieTitle || b.show?.movie?.title || 'Movie') : (b.snapshot?.movieTitle || b.show?.movie?.title || 'Movie');
                const poster = typeof b.movie === 'object' ? (b.movie?.poster || b.snapshot?.moviePoster || b.snapshot?.posterUrl || b.show?.movie?.poster) : (b.snapshot?.moviePoster || b.snapshot?.posterUrl || b.show?.movie?.poster);
                const theatreName = typeof b.theatre === 'object' ? (b.theatre?.name || b.snapshot?.theatreName || b.show?.theatre?.name || 'CineBook Cinema') : (b.snapshot?.theatreName || b.show?.theatre?.name || 'CineBook Cinema');
                const showTime = typeof b.show === 'object' ? (b.show?.startTime || b.snapshot?.startTime || '07:30 PM') : (b.snapshot?.startTime || '07:30 PM');
                const rawDate = b.snapshot?.startsAt || (typeof b.show === 'object' ? (b.show?.startsAt || b.show?.date) : null);
                const showDateFormatted = rawDate ? new Date(rawDate).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                }) : '';
                const seats = (b.seatNumbers && b.seatNumbers.length > 0)
                  ? b.seatNumbers.join(', ')
                  : (b.bookingSeats && b.bookingSeats.length > 0)
                  ? b.bookingSeats.map(s => s.seatLabel || s.label).join(', ')
                  : (b.seats && b.seats.length > 0)
                  ? (typeof b.seats[0] === 'string' ? b.seats.join(', ') : b.seats.map(s => s.label).join(', '))
                  : 'Confirmed';
                const totalPaid = b.totalAmount || b.subtotal || 0;

                return (
                  <div key={bookingId || b._id} className="col-12 col-md-6">
                    <div className="bg-white rounded-3 p-3 border shadow-sm h-100 d-flex flex-column justify-content-between">
                      <div className="d-flex gap-3 align-items-center mb-3">
                        {poster && (
                          <img
                            src={poster}
                            alt={movieTitle}
                            className="rounded-2 flex-shrink-0"
                            style={{ width: '56px', height: '84px', objectFit: 'cover' }}
                          />
                        )}
                        <div>
                          <div className="badge bg-success mb-1" style={{ fontSize: '10px' }}>
                            M-TICKET CONFIRMED
                          </div>
                          <h3 className="fw-bold mb-1 text-dark" style={{ fontSize: '16px' }}>
                            {movieTitle}
                          </h3>
                          <div className="small text-muted mb-1 d-flex align-items-center gap-1">
                            <IconMapPin size={13} className="text-danger" />
                            <span>{theatreName}</span>
                          </div>
                          <div className="small text-muted d-flex align-items-center gap-1">
                            <IconClock size={13} />
                            <span>{showDateFormatted ? `${showDateFormatted} | ` : ''}{showTime} | Seats: <strong className="text-dark">{seats}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                        <div>
                          <span className="small text-muted d-block" style={{ fontSize: '11px' }}>Total Paid</span>
                          <span className="fw-bold text-dark">₹{totalPaid}</span>
                        </div>
                        <Link
                          to={`/ticket/${bookingId}`}
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 fw-semibold rounded-2"
                          style={{ fontSize: '12px' }}
                        >
                          <span>View Ticket</span>
                          <IconChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Tab 3: Live Events Bookings */
          eventBookings.length === 0 ? (
            <div className="bg-white rounded-3 text-center py-5 px-3 border shadow-sm">
              <IconMusic size={48} className="text-muted mb-3" />
              <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '18px' }}>No Live Event Passes Found</h2>
              <p className="text-muted small mb-4">
                Explore curated concerts and live gigs in Your Music Studio!
              </p>
              <Link
                to="/#music-studio"
                className="btn text-white fw-semibold px-4 py-2 rounded-2"
                style={{ backgroundColor: 'var(--bms-brand-red)', fontSize: '14px' }}
              >
                Explore Music Studio
              </Link>
            </div>
          ) : (
            <div className="row g-3">
              {eventBookings.map((b) => (
                <div key={b.bookingRef || b.id} className="col-12 col-md-6">
                  <div className="bg-white rounded-3 p-3 border shadow-sm h-100 d-flex flex-column justify-content-between">
                    <div className="d-flex gap-3 align-items-start mb-3">
                      <img
                        src={b.poster || b.banner}
                        alt={b.eventTitle}
                        className="rounded-2 flex-shrink-0"
                        style={{ width: '64px', height: '88px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/img/popcorn.jpg';
                        }}
                      />
                      <div className="flex-grow-1 min-w-0">
                        <div className="badge bg-success mb-1" style={{ fontSize: '10px' }}>
                          LIVE EVENT PASS &bull; {b.bookingRef}
                        </div>
                        <h3 className="fw-bold mb-1 text-dark text-truncate" style={{ fontSize: '16px' }}>
                          {b.eventTitle}
                        </h3>
                        <div className="small text-muted mb-1 d-flex align-items-center gap-1">
                          <IconMapPin size={13} className="text-danger flex-shrink-0" />
                          <span className="text-truncate">{b.venue}</span>
                        </div>
                        <div className="small text-muted d-flex align-items-center gap-1 mb-1">
                          <IconCalendar size={13} className="flex-shrink-0" />
                          <span>{b.dateFull} &bull; {b.time}</span>
                        </div>
                        <div className="small text-secondary">
                          {b.totalTickets} {b.totalTickets === 1 ? 'Pass' : 'Passes'}:{' '}
                          {b.selectedTiers?.map((t) => `${t.name} (x${t.quantity})`).join(', ')}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                      <div>
                        <span className="small text-muted d-block" style={{ fontSize: '11px' }}>Total Amount</span>
                        <span className="fw-bold text-dark">₹{b.grandTotal?.toLocaleString('en-IN')}</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 fw-semibold rounded-2"
                        style={{ fontSize: '12px' }}
                        onClick={() => setSelectedEventPass(b)}
                      >
                        <IconQrcode size={15} />
                        <span>View M-Ticket</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* M-Ticket Pass Modal */}
      {selectedEventPass && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 1060 }}
          onClick={() => setSelectedEventPass(null)}
        >
          <div
            className="bg-white rounded-4 overflow-hidden shadow-lg"
            style={{ maxWidth: '440px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="p-4 text-white text-center position-relative"
              style={{ background: 'linear-gradient(135deg, #1A1D29 0%, #11131A 100%)' }}
            >
              <button
                type="button"
                className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                onClick={() => setSelectedEventPass(null)}
                aria-label="Close"
              />
              <span className="badge bg-success rounded-pill mb-2 px-3 py-1" style={{ fontSize: '11px' }}>
                M-TICKET PASS &bull; CONFIRMED
              </span>
              <div className="small text-white-50">REF: {selectedEventPass.bookingRef}</div>
              <h2 className="fw-bold mb-0 text-white mt-1" style={{ fontSize: '20px' }}>
                {selectedEventPass.eventTitle}
              </h2>
            </div>

            {/* Body */}
            <div className="p-4">
              <div className="d-flex flex-column align-items-center border-bottom pb-3 mb-3">
                <div
                  className="p-2 border rounded-3 bg-white mb-2 d-flex align-items-center justify-content-center"
                  style={{ width: '120px', height: '120px' }}
                >
                  <IconQrcode size={96} color="#1F2937" />
                </div>
                <div className="small text-muted text-center">Scan at the venue entrance gate</div>
              </div>

              <div className="d-flex flex-column gap-2 small text-dark mb-3">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Date &amp; Time</span>
                  <strong>{selectedEventPass.dateFull} &bull; {selectedEventPass.time}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Venue</span>
                  <strong className="text-end" style={{ maxWidth: '220px' }}>{selectedEventPass.venue}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Attendee</span>
                  <strong>{selectedEventPass.attendee?.name || user?.name || 'Guest'}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Total Paid</span>
                  <strong className="text-success">₹{selectedEventPass.grandTotal?.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div className="p-2 rounded bg-light border text-muted small text-center mb-3" style={{ fontSize: '11px' }}>
                Valid photo ID required at the gate &bull; Non-transferable
              </div>

              <button
                type="button"
                className="btn w-100 text-white fw-bold py-2 rounded-2"
                style={{ backgroundColor: '#F84464' }}
                onClick={() => setSelectedEventPass(null)}
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
