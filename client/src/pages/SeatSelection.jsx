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
    <div>
      {/* Header */}
      <div className="bg-dark text-white py-3">
        <div className="container">
          <Link to={`/movies/${show.movie._id}`} className="text-warning text-decoration-none">
            <FaArrowLeft className="me-1" /> Back
          </Link>
          <div className="d-flex justify-content-between align-items-center mt-2">
            <div>
              <h5 className="fw-bold mb-0">{show.movie.title}</h5>
              <small className="text-muted">
                {show.theatre.name} • {show.screenName} • {show.format} •{' '}
                {new Date(show.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} •{' '}
                {show.startTime}
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {error && <div className="alert alert-danger py-2 text-center">{error}</div>}

        {/* Seat Layout */}
        <SeatLayout
          bookedSeats={show.bookedSeats}
          selectedSeats={selectedSeats}
          onSeatClick={handleSeatClick}
          seatPrices={show.seatPrices}
        />

        {/* Selection Summary */}
        {selectedSeats.length > 0 && (
          <div className="fixed-bottom bg-white shadow-lg border-top py-3">
            <div className="container d-flex justify-content-between align-items-center">
              <div>
                <div className="d-flex align-items-center gap-2">
                  <FaChair className="text-primary" />
                  <span className="fw-semibold">{selectedSeats.sort().join(', ')}</span>
                </div>
                <div className="d-flex align-items-center gap-1 text-success fw-bold">
                  <FaRupeeSign size={14} />
                  <span>{calculateTotal().toLocaleString('en-IN')} + ₹20 fee</span>
                </div>
              </div>
              <button className="btn btn-warning fw-bold px-4 py-2" onClick={handleProceed}>
                Proceed to Pay ₹{(calculateTotal() + 20).toLocaleString('en-IN')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatSelection;
