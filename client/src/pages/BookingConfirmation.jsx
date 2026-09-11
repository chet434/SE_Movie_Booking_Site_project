import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBookingById } from '../services/api';
import { FaCheckCircle, FaFilm, FaPrint, FaHome } from 'react-icons/fa';
import '../styles/booking.css';

const BookingConfirmation = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await getBookingById(id);
      setBooking(res.data.data);
    } catch (error) {
      console.error('Failed to fetch booking');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-warning"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h5 className="text-muted">Booking not found.</h5>
        <Link to="/" className="btn btn-warning mt-3">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          {/* Success Header */}
          <div className="text-center mb-4 booking-success-animation">
            <FaCheckCircle size={64} className="text-success mb-3" />
            <h3 className="fw-bold text-success">Booking Confirmed!</h3>
            <p className="text-muted">Your tickets have been booked successfully</p>
          </div>

          {/* Ticket Card */}
          <div className="ticket-card" id="printable-ticket">
            <div className="ticket-header">
              <FaFilm className="me-2" />
              <span className="fw-bold">{booking.movie?.title}</span>
            </div>

            <div className="ticket-body">
              <div className="ticket-row">
                <div>
                  <small className="text-muted">Booking ID</small>
                  <p className="fw-bold mb-0">{booking.bookingId}</p>
                </div>
                <div className="text-end">
                  <small className="text-muted">Transaction ID</small>
                  <p className="fw-bold mb-0">{booking.transactionId}</p>
                </div>
              </div>

              <hr className="ticket-divider" />

              <div className="ticket-row">
                <div>
                  <small className="text-muted">Theatre</small>
                  <p className="fw-semibold mb-0">{booking.theatre?.name}</p>
                  <small className="text-muted">{booking.theatre?.location}</small>
                </div>
                <div className="text-end">
                  <small className="text-muted">Screen</small>
                  <p className="fw-semibold mb-0">{booking.screenName}</p>
                </div>
              </div>

              <div className="ticket-row mt-3">
                <div>
                  <small className="text-muted">Date</small>
                  <p className="fw-semibold mb-0">
                    {booking.show?.date && new Date(booking.show.date).toLocaleDateString('en-IN', {
                      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-end">
                  <small className="text-muted">Time</small>
                  <p className="fw-semibold mb-0">{booking.show?.startTime}</p>
                </div>
              </div>

              <hr className="ticket-divider" />

              <div className="ticket-row">
                <div>
                  <small className="text-muted">Seats</small>
                  <p className="fw-bold mb-0 text-primary">{booking.seatNumbers?.join(', ')}</p>
                </div>
                <div className="text-end">
                  <small className="text-muted">Tickets</small>
                  <p className="fw-bold mb-0">{booking.seatNumbers?.length}</p>
                </div>
              </div>

              <div className="ticket-row mt-3">
                <div>
                  <small className="text-muted">Payment</small>
                  <p className="fw-semibold mb-0">{booking.paymentMethod}</p>
                </div>
                <div className="text-end">
                  <small className="text-muted">Amount Paid</small>
                  <p className="fw-bold mb-0 text-success fs-5">₹{booking.totalAmount?.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="text-center mt-3">
                <span className={`badge ${booking.bookingStatus === 'confirmed' ? 'bg-success' : 'bg-danger'} fs-6`}>
                  {booking.bookingStatus?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="d-flex gap-2 mt-4 no-print">
            <button className="btn btn-outline-dark flex-fill"
              onClick={() => window.print()}>
              <FaPrint className="me-1" /> Print Ticket
            </button>
            <Link to="/" className="btn btn-warning flex-fill">
              <FaHome className="me-1" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
