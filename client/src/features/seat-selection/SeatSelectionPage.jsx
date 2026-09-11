import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getShowById } from '../../services/api';
import { IconArrowLeft } from '@tabler/icons-react';

import BookingStepper from './BookingStepper';
import MovieContext from './MovieContext';
import SeatMap from './SeatMap';
import BookingCostSummary from './BookingCostSummary';
import MobileBookingBar from './MobileBookingBar';

const MAX_SEATS = 6;
const CONVENIENCE_FEE = 20;
const REGULAR_ROWS = ['A', 'B', 'C'];

const SeatSelectionPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchShowData();
  }, [showId]);

  const fetchShowData = async () => {
    try {
      const res = await getShowById(showId);
      setShow(res.data.data);
    } catch (err) {
      setError('Failed to load show details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSeat = (seatId) => {
    setError('');
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      if (selectedSeats.length >= MAX_SEATS) {
        setError(`You can only select up to ${MAX_SEATS} seats per booking.`);
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const getSeatPrice = (seatId) => {
    if (!show) return 0;
    const row = seatId.charAt(0);
    return REGULAR_ROWS.includes(row) ? (show.seatPrices?.regular || 150) : (show.seatPrices?.premium || 250);
  };

  const calculateSubtotal = () => {
    return selectedSeats.reduce((total, seatId) => total + getSeatPrice(seatId), 0);
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;
    
    setIsSubmitting(true);
    
    // Create booking data object and save to session storage for the payment page
    const subtotal = calculateSubtotal();
    const totalAmount = subtotal + CONVENIENCE_FEE;
    
    const bookingData = {
      showId: show._id,
      selectedSeats,
      totalAmount,
      convenienceFee: CONVENIENCE_FEE
    };
    
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    
    // Simulate a brief delay before navigation
    setTimeout(() => {
      navigate('/payment');
    }, 500);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="container py-5 text-center">
        <h5 className="text-muted">Show not found.</h5>
        <Link to="/" className="cs-button-primary mt-3 d-inline-block text-decoration-none">Back to Home</Link>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const total = subtotal > 0 ? subtotal + CONVENIENCE_FEE : 0;

  return (
    <div className="py-2 mb-5 pb-5 mb-lg-0 pb-lg-0">
      <div className="d-flex align-items-center mb-4">
        <Link to={`/movies/${show.movie._id}`} className="text-decoration-none me-3 fw-bold d-flex align-items-center gap-1" style={{ color: 'var(--cs-text-secondary)' }}>
          <IconArrowLeft size={20} /> <span className="d-none d-sm-inline">Back</span>
        </Link>
        <h2 className="fw-bold mb-0 flex-grow-1">{show.movie.title}</h2>
      </div>

      <BookingStepper currentStep={1} />

      <div className="row g-4 position-relative">
        <div className="col-12 col-lg-8">
          <div className="cs-panel p-4 mb-4">
            <h4 className="fw-bold mb-3">Select Seats</h4>
            
            <MovieContext 
              theatre={show.theatre.name}
              date={show.date}
              showtime={show.startTime}
              format={show.format}
            />
            
            {error && (
              <div className="alert alert-danger py-2 mb-4 d-flex align-items-center" role="alert">
                {error}
              </div>
            )}

            <SeatMap 
              bookedSeatIds={show.bookedSeats || []}
              selectedSeatIds={selectedSeats}
              onToggleSeat={handleToggleSeat}
              seatPrices={show.seatPrices}
            />
          </div>
        </div>

        <div className="col-12 col-lg-4 d-none d-lg-block">
          <BookingCostSummary 
            selectedSeats={selectedSeats}
            subtotal={subtotal}
            fee={CONVENIENCE_FEE}
            total={total}
            onProceed={handleProceed}
            isSubmitting={isSubmitting}
            maxSeats={MAX_SEATS}
          />
        </div>
      </div>

      <MobileBookingBar 
        selectedSeats={selectedSeats}
        total={total}
        onProceed={handleProceed}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default SeatSelectionPage;
