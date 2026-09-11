import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getShowById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeatLayout from '../components/SeatLayout';
import { FaArrowLeft, FaChair, FaRupeeSign } from 'react-icons/fa';

const REGULAR_ROWS = ['A', 'B', 'C'];

const SeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShow();
  }, [showId]);

  const fetchShow = async () => {
    try {
      const res = await getShowById(showId);
      setShow(res.data.data);
    } catch (err) {
      setError('Failed to load show details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      if (selectedSeats.length >= 6) {
        setError('Maximum 6 seats can be booked at a time.');
        setTimeout(() => setError(''), 3000);
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const calculateTotal = () => {
    if (!show) return 0;
    let total = 0;
    selectedSeats.forEach(seat => {
      const row = seat.charAt(0);
      if (REGULAR_ROWS.includes(row)) {
        total += show.seatPrices.regular;
      } else {
        total += show.seatPrices.premium;
      }
    });
    return total;
  };

  const handleProceed = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat.');
      return;
    }
    // Store selection in sessionStorage and navigate to booking summary
    sessionStorage.setItem('bookingData', JSON.stringify({
      showId,
      selectedSeats,
      totalAmount: calculateTotal() + 20, // +convenience fee
      convenienceFee: 20
    }));
    navigate('/payment');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-warning"></div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="container py-5 text-center">
        <h5 className="text-muted">Show not found.</h5>
        <Link to="/" className="btn btn-warning mt-3">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="d-flex align-items-center mb-4">
        <Link to={`/movies/${show.movie._id}`} className="text-decoration-none me-3 fw-bold" style={{ color: 'var(--cs-text-secondary)' }}>
          <FaArrowLeft className="me-1" /> Back
        </Link>
        <h2 className="fw-bold mb-0 flex-grow-1">{show.movie.title}</h2>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="cs-panel p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-bold mb-1">Select Seats</h4>
                <div className="text-muted small fw-bold">
                  {show.theatre.name} • {show.screenName} • {show.format} • {new Date(show.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {show.startTime}
                </div>
              </div>
            </div>
            
            {error && <div className="alert alert-danger py-2">{error}</div>}

            <SeatLayout
              bookedSeats={show.bookedSeats}
              selectedSeats={selectedSeats}
              onSeatClick={handleSeatClick}
              seatPrices={show.seatPrices}
            />
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="cs-panel p-4 position-sticky" style={{ top: '96px' }}>
            <h5 className="fw-bold mb-4">Booking Summary</h5>
            
            <div className="mb-4">
              <div className="text-muted small fw-bold mb-1">SELECTED SEATS</div>
              <div className="d-flex align-items-center gap-2">
                <FaChair style={{ color: 'var(--cs-text-secondary)' }} />
                <span className="fw-bold" style={{ color: 'var(--cs-text-primary)' }}>
                  {selectedSeats.length > 0 ? selectedSeats.sort().join(', ') : 'No seats selected'}
                </span>
                <span className="ms-auto text-muted small">
                  ({selectedSeats.length}/6)
                </span>
              </div>
            </div>

            <hr style={{ borderColor: 'var(--cs-border)' }} />

            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tickets subtotal</span>
                <span className="fw-bold">₹{calculateTotal().toLocaleString('en-IN')}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Convenience fee</span>
                <span className="fw-bold">₹20</span>
              </div>
            </div>

            <hr style={{ borderColor: 'var(--cs-border)' }} />

            <div className="d-flex justify-content-between mb-4 align-items-center">
              <span className="fw-bold" style={{ fontSize: '1.1rem' }}>Total Amount</span>
              <span className="fw-bold" style={{ fontSize: '1.25rem', color: 'var(--cs-action-primary)' }}>
                ₹{(calculateTotal() + (selectedSeats.length > 0 ? 20 : 0)).toLocaleString('en-IN')}
              </span>
            </div>

            <button 
              className="cs-button-primary w-100 fw-bold" 
              onClick={handleProceed}
              disabled={selectedSeats.length === 0}
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
