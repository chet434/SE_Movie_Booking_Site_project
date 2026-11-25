import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBookingById } from '../../services/api';
import BookingTicket from './BookingTicket';
import TicketActions from './TicketActions';
import BookingStepper from '../seat-selection/BookingStepper';
import { IconAlertTriangle, IconFileSearch, IconLock, IconCheck, IconConfetti } from '@tabler/icons-react';

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
      const bookingData = res.data?.data || res.data;
      if (!bookingData) {
        throw new Error('No booking data returned');
      }
      setBooking(bookingData);

      if (bookingData.bookingStatus === 'failed' || bookingData.status === 'failed') {
        setStatus('failed');
      } else if (new Date(bookingData.show?.date || bookingData.snapshot?.startsAt) < new Date() && bookingData.status !== 'confirmed') {
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
          <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '60vh' }}>
            <div className="spinner-border text-danger" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading ticket...</span>
            </div>
            <p className="mt-3 text-muted small">Retrieving digital cinema pass...</p>
          </div>
        );

      case 'failed':
        return (
          <div className="container py-5 text-center d-flex flex-column align-items-center">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: '72px',
                height: '72px',
                backgroundColor: '#FEE2E2',
                color: '#DC2626'
              }}
            >
              <IconAlertTriangle size={36} />
            </div>
            <h3 className="fw-bold mb-2" style={{ color: '#222222', fontFamily: 'var(--cb-font-display)' }}>
              Payment Unsuccessful
            </h3>
            <p className="max-w-md mx-auto mb-4 small" style={{ color: '#555555' }}>
              We couldn't confirm your transaction. No seats have been reserved or billed.
            </p>
            <Link
              to="/"
              className="btn text-white text-decoration-none px-4 py-2.5"
              style={{ backgroundColor: '#C41230', borderRadius: '4px', fontWeight: 600 }}
            >
              Explore Available Shows
            </Link>
          </div>
        );

      case 'unauthorized':
        return (
          <div className="container py-5 text-center d-flex flex-column align-items-center">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: '72px',
                height: '72px',
                backgroundColor: '#FEF3C7',
                color: '#D97706'
              }}
            >
              <IconLock size={36} />
            </div>
            <h3 className="fw-bold mb-2" style={{ color: '#222222', fontFamily: 'var(--cb-font-display)' }}>
              Pass Protected
            </h3>
            <p className="max-w-md mx-auto mb-4 small" style={{ color: '#555555' }}>
              Please sign into the account associated with this booking to view your ticket.
            </p>
            <Link
              to="/my-bookings"
              className="btn text-white text-decoration-none px-4 py-2.5"
              style={{ backgroundColor: '#C41230', borderRadius: '4px', fontWeight: 600 }}
            >
              View My Bookings
            </Link>
          </div>
        );

      case 'missing':
        return (
          <div className="container py-5 text-center d-flex flex-column align-items-center">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: '72px',
                height: '72px',
                backgroundColor: '#E5E7EB',
                color: '#4B5563'
              }}
            >
              <IconFileSearch size={36} />
            </div>
            <h3 className="fw-bold mb-2" style={{ color: '#222222', fontFamily: 'var(--cb-font-display)' }}>
              Booking Not Located
            </h3>
            <p className="max-w-md mx-auto mb-4 small" style={{ color: '#555555' }}>
              The booking reference provided does not match our current records.
            </p>
            <Link
              to="/my-bookings"
              className="btn text-white text-decoration-none px-4 py-2.5"
              style={{ backgroundColor: '#C41230', borderRadius: '4px', fontWeight: 600 }}
            >
              View My Bookings
            </Link>
          </div>
        );

      case 'confirmed':
      case 'past':
      default:
        return (
          <div className="container-fluid px-3 px-md-4 py-4" style={{ maxWidth: '1240px' }}>
            {/* Stepper (Step 3: Confirmed Ticket) */}
            <div className="no-print">
              <BookingStepper currentStep={3} />
            </div>

            <div className="d-flex flex-column align-items-center mt-3">
              {status === 'confirmed' && (
                <div className="text-center mb-4 booking-success-animation no-print">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow"
                    style={{
                      width: '64px',
                      height: '64px',
                      backgroundColor: '#DCFCE7',
                      color: '#16A34A',
                      border: '1px solid #86EFAC',
                      boxShadow: '0 0 24px rgba(34, 197, 94, 0.15)'
                    }}
                  >
                    <IconCheck size={32} stroke={3} />
                  </div>
                  <h3
                    className="fw-bold mb-1"
                    style={{ color: '#222222', fontFamily: 'var(--cb-font-display)', fontSize: '24px' }}
                  >
                    Booking Confirmed!
                  </h3>
                  <p className="small mb-0" style={{ color: '#555555' }}>
                    Your digital cinema pass is ready. Please present this at the turnstile.
                  </p>
                </div>
              )}

              {status === 'past' && (
                <div className="text-center mb-4 no-print">
                  <span className="badge bg-secondary mb-2">Past Show</span>
                  <h4 className="fw-bold mb-1" style={{ color: '#222222' }}>Archived Cinema Ticket</h4>
                </div>
              )}

              {/* The Collectible Cinema Ticket */}
              <BookingTicket booking={booking} printable={true} />

              {/* Action Buttons: Print, Copy Code, Share */}
              <TicketActions bookingCode={booking.bookingId || booking.bookingNumber || booking._id} />
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className="min-vh-100 pb-5"
      style={{
        backgroundColor: '#F5F5F7',
        color: '#222222'
      }}
    >
      {renderContent()}
    </div>
  );
};

export default TicketPage;
