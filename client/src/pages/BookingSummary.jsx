import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getShowById, createBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaCreditCard, FaMobileAlt, FaUniversity, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import '../styles/booking.css';

const REGULAR_ROWS = ['A', 'B', 'C'];

const PAYMENT_METHODS = [
  { value: 'UPI', label: 'UPI', icon: <FaMobileAlt /> },
  { value: 'Credit/Debit Card', label: 'Credit/Debit Card', icon: <FaCreditCard /> },
  { value: 'Net Banking', label: 'Net Banking', icon: <FaUniversity /> },
  { value: 'Cash at Counter', label: 'Cash at Counter', icon: <FaMoneyBillWave /> }
];

const BookingSummary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [show, setShow] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('bookingData');
    if (!stored) {
      navigate('/');
      return;
    }
    const data = JSON.parse(stored);
    setBookingData(data);
    fetchShow(data.showId);
  }, []);

  const fetchShow = async (showId) => {
    try {
      const res = await getShowById(showId);
      setShow(res.data.data);
    } catch (err) {
      setError('Failed to load show details.');
    } finally {
      setLoading(false);
    }
  };

  const getSeatPrice = (seatId) => {
    if (!show) return 0;
    const row = seatId.charAt(0);
    return REGULAR_ROWS.includes(row) ? show.seatPrices.regular : show.seatPrices.premium;
  };

  const getSeatType = (seatId) => {
    const row = seatId.charAt(0);
    return REGULAR_ROWS.includes(row) ? 'Regular' : 'Premium';
  };

  const handlePayment = async (simulateFailure = false) => {
    if (!paymentMethod) {
      setError('Please select a payment method.');
      return;
    }
    setPaying(true);
    setError('');

    try {
      const res = await createBooking({
        showId: bookingData.showId,
        seatNumbers: bookingData.selectedSeats,
        paymentMethod,
        simulateFailure
      });

      sessionStorage.removeItem('bookingData');
      navigate(`/booking-confirmation/${res.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-warning"></div>
      </div>
    );
  }

  if (!show || !bookingData) return null;

  return (
    <div className="container py-4">
      <Link to={`/seat-selection/${bookingData.showId}`} className="text-warning text-decoration-none mb-3 d-inline-block">
        <FaArrowLeft className="me-1" /> Back to Seats
      </Link>

      <div className="row g-4">
        {/* Booking Details */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Booking Summary</h5>

              <div className="d-flex gap-3 mb-3">
                <img src={show.movie.poster} alt={show.movie.title}
                  className="rounded" style={{ width: '80px', height: '120px', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/80x120?text=Poster'; }} />
                <div>
                  <h6 className="fw-bold mb-1">{show.movie.title}</h6>
                  <p className="text-muted mb-0 small">{show.theatre.name}</p>
                  <p className="text-muted mb-0 small">{show.screenName} • {show.format}</p>
                  <p className="text-muted mb-0 small">
                    {new Date(show.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} • {show.startTime}
                  </p>
                </div>
              </div>

              <hr />

              {/* Seat Breakdown */}
              <h6 className="fw-semibold mb-2">Selected Seats</h6>
              {bookingData.selectedSeats.sort().map(seat => (
                <div key={seat} className="d-flex justify-content-between small mb-1">
                  <span>{seat} — {getSeatType(seat)}</span>
                  <span>₹{getSeatPrice(seat)}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between small">
                <span>Convenience Fee</span>
                <span>₹{bookingData.convenienceFee}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total Amount</span>
                <span className="text-success">₹{bookingData.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="card border-0 shadow-sm mt-3" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">Customer Details</h6>
              <div className="row g-2">
                <div className="col-md-4">
                  <small className="text-muted">Name</small>
                  <p className="fw-semibold mb-0">{user?.name}</p>
                </div>
                <div className="col-md-4">
                  <small className="text-muted">Email</small>
                  <p className="fw-semibold mb-0">{user?.email}</p>
                </div>
                <div className="col-md-4">
                  <small className="text-muted">Phone</small>
                  <p className="fw-semibold mb-0">{user?.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Payment Method</h5>

              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              <div className="d-flex flex-column gap-2 mb-4">
                {PAYMENT_METHODS.map(method => (
                  <button
                    key={method.value}
                    className={`btn d-flex align-items-center gap-2 text-start ${paymentMethod === method.value ? 'btn-warning' : 'btn-outline-secondary'}`}
                    onClick={() => setPaymentMethod(method.value)}
                    style={{ borderRadius: '10px' }}
                  >
                    {method.icon}
                    <span>{method.label}</span>
                    {paymentMethod === method.value && <FaCheckCircle className="ms-auto text-dark" />}
                  </button>
                ))}
              </div>

              <button
                className="btn btn-success w-100 fw-bold py-2 mb-2"
                onClick={() => handlePayment(false)}
                disabled={paying || !paymentMethod}
                style={{ borderRadius: '10px' }}
              >
                {paying ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                Pay ₹{bookingData.totalAmount.toLocaleString('en-IN')}
              </button>

              <button
                className="btn btn-outline-danger w-100 btn-sm"
                onClick={() => handlePayment(true)}
                disabled={paying}
                style={{ borderRadius: '10px' }}
              >
                Simulate Payment Failure
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
