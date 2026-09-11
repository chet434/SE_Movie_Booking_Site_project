import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings } from '../services/api';
import { FaTicketAlt, FaCalendar, FaChair, FaFilm, FaPrint } from 'react-icons/fa';

const MyBookings = () => {
  const [bookings, setBookings] = useState({ upcoming: [], past: [] });
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await getMyBookings();
      setBookings(res.data.data);
    } catch (error) {
      console.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const currentBookings = activeTab === 'upcoming' ? bookings.upcoming : bookings.past;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-warning"></div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4 d-flex align-items-center gap-2"><FaTicketAlt style={{ color: 'var(--cs-action-primary)' }} />My Bookings</h3>

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button className={`nav-link fw-bold ${activeTab === 'upcoming' ? 'active' : ''}`}
            style={{ 
              backgroundColor: activeTab === 'upcoming' ? 'var(--cs-action-primary)' : 'var(--cs-surface)',
              color: activeTab === 'upcoming' ? 'var(--cs-text-on-accent)' : 'var(--cs-text-primary)',
              borderRadius: 'var(--cs-radius-control)',
              border: activeTab === 'upcoming' ? 'none' : '1px solid var(--cs-border)'
            }}
            onClick={() => setActiveTab('upcoming')}>
            Upcoming ({bookings.upcoming.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link fw-bold ${activeTab === 'past' ? 'active' : ''}`}
            style={{ 
              backgroundColor: activeTab === 'past' ? 'var(--cs-action-primary)' : 'var(--cs-surface)',
              color: activeTab === 'past' ? 'var(--cs-text-on-accent)' : 'var(--cs-text-primary)',
              borderRadius: 'var(--cs-radius-control)',
              border: activeTab === 'past' ? 'none' : '1px solid var(--cs-border)'
            }}
            onClick={() => setActiveTab('past')}>
            Past ({bookings.past.length})
          </button>
        </li>
      </ul>

      {currentBookings.length === 0 ? (
        <div className="text-center py-5">
          <FaFilm size={48} className="text-muted mb-3" />
          <h5 className="text-muted">No {activeTab} bookings found.</h5>
          {activeTab === 'upcoming' && (
            <Link to="/" className="cs-button-primary mt-3 d-inline-block text-decoration-none">Browse Movies</Link>
          )}
        </div>
      ) : (
        <div className="row g-3">
          {currentBookings.map(booking => (
            <div key={booking._id} className="col-md-6">
              <div className="cs-panel h-100">
                <div className="p-3">
                  <div className="d-flex gap-3">
                    <img src={booking.movie?.poster} alt={booking.movie?.title}
                      className="rounded" style={{ width: '60px', height: '90px', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/60x90?text=Poster'; }} />
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="fw-bold mb-1">{booking.movie?.title}</h6>
                        <span className={`badge ${booking.bookingStatus === 'confirmed' ? 'bg-success' : 'bg-danger'}`}>
                          {booking.bookingStatus}
                        </span>
                      </div>
                      <p className="text-muted small mb-0">
                        {booking.theatre?.name} • {booking.screenName}
                      </p>
                      <p className="text-muted small mb-0">
                        <FaCalendar size={10} className="me-1" />
                        {booking.show?.date && new Date(booking.show.date).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })} • {booking.show?.startTime}
                      </p>
                      <p className="text-muted small mb-0">
                        <FaChair size={10} className="me-1" />
                        {booking.seatNumbers?.join(', ')}
                      </p>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <span className="fw-bold" style={{ color: 'var(--cs-action-primary)' }}>₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
                        <Link to={`/booking-confirmation/${booking._id}`}
                          className="cs-button-secondary py-1 px-3 text-decoration-none" style={{ fontSize: '0.8rem', minHeight: '32px' }}>
                          View Ticket
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
