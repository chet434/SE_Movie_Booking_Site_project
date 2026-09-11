import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBookingById } from '../../services/api';
import BookingTicket from './BookingTicket';
import TicketActions from './TicketActions';
import { IconAlertTriangle, IconFileSearch, IconLock } from '@tabler/icons-react';

const TicketPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, confirmed, past, failed, unauthorized, missing

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await getBookingById(id);
      const bookingData = res.data.data;
      setBooking(bookingData);
      
      if (bookingData.bookingStatus === 'failed') {
        setStatus('failed');
      } else if (new Date(bookingData.show?.date) < new Date()) {
        setStatus('past');
      } else {
        setStatus('confirmed');
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setStatus('unauthorized');
      } else {
        setStatus('missing');
      }
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
            {/* Skeleton loader for ticket */}
            <div className="cs-panel overflow-hidden mx-auto" style={{ width: '100%', maxWidth: '400px', height: '600px', backgroundColor: 'var(--cs-surface-muted)' }}>
              <div className="placeholder-glow w-100 h-100 d-flex flex-column">
                <div className="placeholder w-100" style={{ height: '140px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                <div className="p-4 flex-grow-1">
                  <div className="placeholder w-75 mb-4 rounded" style={{ height: '24px' }}></div>
                  <div className="row g-3">
                    <div className="col-12"><div className="placeholder w-100 rounded" style={{ height: '40px' }}></div></div>
                    <div className="col-6"><div className="placeholder w-100 rounded" style={{ height: '40px' }}></div></div>
                    <div className="col-6"><div className="placeholder w-100 rounded" style={{ height: '40px' }}></div></div>
                    <div className="col-6"><div className="placeholder w-100 rounded" style={{ height: '40px' }}></div></div>
                    <div className="col-6"><div className="placeholder w-100 rounded" style={{ height: '40px' }}></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'failed':
        return (
          <div className="container py-5 text-center d-flex flex-column align-items-center">
            <IconAlertTriangle size={64} className="text-danger mb-3" />
            <h3 className="fw-bold">Payment Failed</h3>
            <p className="text-muted max-w-md mx-auto mb-4">
              We couldn't process your payment. No valid ticket was generated.
            </p>
            <Link to="/" className="cs-button-primary text-decoration-none">Try Again</Link>
          </div>
        );

      case 'unauthorized':
        return (
          <div className="container py-5 text-center d-flex flex-column align-items-center">
            <IconLock size={64} className="text-warning mb-3" />
            <h3 className="fw-bold">Access Denied</h3>
            <p className="text-muted max-w-md mx-auto mb-4">
              You don't have permission to view this ticket.
            </p>
            <Link to="/my-bookings" className="cs-button-primary text-decoration-none">View My Bookings</Link>
          </div>
        );

      case 'missing':
        return (
          <div className="container py-5 text-center d-flex flex-column align-items-center">
            <IconFileSearch size={64} className="text-muted mb-3" />
            <h3 className="fw-bold">Booking Not Found</h3>
            <p className="text-muted max-w-md mx-auto mb-4">
              The ticket you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/my-bookings" className="cs-button-primary text-decoration-none">My Bookings</Link>
          </div>
        );

      case 'confirmed':
      case 'past':
      default:
        return (
          <div className="container py-5">
            <div className="d-flex flex-column align-items-center">
              
              {status === 'confirmed' && (
                <div className="text-center mb-4 booking-success-animation no-print">
                  <div className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle mb-3" style={{ width: '80px', height: '80px' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h3 className="fw-bold text-success">Booking Confirmed!</h3>
                </div>
              )}
              
              {status === 'past' && (
                <div className="text-center mb-4 no-print">
                  <span className="badge bg-secondary mb-2">Past Show</span>
                  <h4 className="fw-bold text-muted">Ticket Details</h4>
                </div>
              )}

              <BookingTicket booking={booking} printable={true} />
              
              <TicketActions bookingCode={booking.bookingId || booking._id} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: 'var(--cs-canvas)' }}>
      {renderContent()}
    </div>
  );
};

export default TicketPage;
