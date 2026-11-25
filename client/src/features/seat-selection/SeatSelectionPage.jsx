import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import {
  IconArrowLeft,
  IconWheelchair,
  IconPlus,
  IconMinus,
  IconEdit,
  IconX
} from '@tabler/icons-react';
import '../../styles/seat-selection.css';

const TIER_PRICES = {
  ROYAL: 650,
  CLUB: 520,
  EXECUTIVE: 500
};

// Layout mapping helper based on BookMyShow visual scheme
const isLayoutSold = (row, num) => {
  if (row === 'A') return num === 3 || num === 4 || (num >= 6 && num <= 22);
  if (row === 'B') return (num >= 6 && num <= 17);
  if (row === 'C') return (num >= 5 && num <= 17);
  if (row === 'D') return (num >= 1 && num <= 7) || (num >= 9 && num <= 14);
  if (row === 'E') return (num >= 1 && num <= 11) || (num >= 12 && num <= 15);
  if (row === 'F') return (num >= 7 && num <= 13);
  if (row === 'G') return (num >= 8 && num <= 16);
  if (row === 'H') return (num >= 8 && num <= 16);
  if (row === 'I') return num === 12 || num === 13;
  return false;
};

const isLayoutBestseller = (row, num) => {
  if (row === 'A') return num === 2;
  if (row === 'I') return (num >= 1 && num <= 6) || (num >= 14 && num <= 20);
  if (row === 'J') return num === 5 || num === 6 || num === 14 || num === 15;
  if (row === 'K') return num === 5 || num === 6 || (num >= 13 && num <= 15);
  if (row === 'O') return (num >= 4 && num <= 6) || (num >= 13 && num <= 15);
  return false;
};

const isLayoutCompanion = (row, num) => {
  return row === 'P' && (num === 13 || num === 20 || num === 21);
};

export default function SeatSelectionPage() {
  const { movieId, showId } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [targetSeatCount, setTargetSeatCount] = useState(4);
  const [showCountModal, setShowCountModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [theatreShows, setTheatreShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isHolding, setIsHolding] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // 30-second live clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Fetch show details, seats, and sibling showtimes
  useEffect(() => {
    let isMounted = true;

    const fetchLayout = async () => {
      setLoading(true);
      setError('');
      try {
        const [showRes, seatsRes] = await Promise.allSettled([
          API.get(`/shows/${showId}`),
          API.get(`/shows/${showId}/seats`)
        ]);

        let showData = null;
        if (showRes.status === 'fulfilled' && showRes.value?.data?.data) {
          showData = showRes.value.data.data;
          if (isMounted) {
            setShow(showData);
          }
        } else {
          if (isMounted) {
            setError('Show not found or screening is no longer active.');
            setLoading(false);
          }
          return;
        }

        // Process seats from API
        let apiSeats = [];
        if (seatsRes.status === 'fulfilled' && Array.isArray(seatsRes.value?.data?.data)) {
          apiSeats = seatsRes.value.data.data.map((s) => {
            const row = s.seat?.row || s.row || (s.label ? s.label.match(/^[A-Z]+/)?.[0] : '');
            const number = s.seat?.number || s.number || (s.label ? parseInt(s.label.match(/\d+/)?.[0], 10) : 0);
            return {
              _id: s._id,
              row,
              number,
              label: s.label || `${row}${String(number).padStart(2, '0')}`,
              price: s.price || 500,
              seatType: s.seatType || s.seat?.type || 'regular',
              status: s.status === 'available' ? 'available' : 'sold'
            };
          });
        }

        if (isMounted) {
          setSeats(apiSeats);
        }

        // Fetch sibling showtimes for this movie/theatre
        const effectiveMovieId = showData.movie?._id || movieId;
        if (effectiveMovieId) {
          try {
            const showsRes = await API.get(`/shows?movieId=${effectiveMovieId}`);
            if (showsRes.data?.data && Array.isArray(showsRes.data.data)) {
              // Find matching theatre group
              const currentTheatreId = showData.theatre?._id || showData.theatre?.id;
              const matchingGroup = showsRes.data.data.find(
                (g) => (g.theatre?._id || g.theatre?.id) === currentTheatreId
              ) || showsRes.data.data[0];

              if (matchingGroup?.shows && isMounted) {
                setTheatreShows(matchingGroup.shows);
              }
            }
          } catch {
            // Ignore showtime lookup failure
          }
        }
      } catch (err) {
        console.error('Failed to fetch layout:', err);
        if (isMounted) {
          setError('Unable to load show details. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLayout();

    return () => {
      isMounted = false;
    };
  }, [showId, movieId]);

  // Resolves seat representation: uses real DB seat when present, otherwise synthesizes consistent layout
  const getSeat = (rowLabel, num, tierPrice) => {
    const dbSeat = seats.find((s) => s.row === rowLabel && s.number === num);
    if (dbSeat) {
      const isBestseller = isLayoutBestseller(rowLabel, num);
      const isCompanion = isLayoutCompanion(rowLabel, num);
      return {
        ...dbSeat,
        isBestseller,
        isCompanion,
        price: dbSeat.price || tierPrice
      };
    }

    // Synthesized seat consistent with BookMyShow image
    const isSold = isLayoutSold(rowLabel, num);
    const isBestseller = isLayoutBestseller(rowLabel, num);
    const isCompanion = isLayoutCompanion(rowLabel, num);

    return {
      _id: `synth_${rowLabel}_${num}`,
      row: rowLabel,
      number: num,
      label: `${rowLabel}${String(num).padStart(2, '0')}`,
      status: isSold ? 'sold' : 'available',
      price: tierPrice,
      isBestseller,
      isCompanion
    };
  };

  const handleSeatClick = (seat) => {
    if (isCurrentShowExpired) return;
    if (seat.status === 'sold' || seat.status === 'booked' || seat.status === 'held') return;

    setError('');
    const isAlreadySelected = selectedSeats.some((s) => s._id === seat._id);

    if (isAlreadySelected) {
      setSelectedSeats(selectedSeats.filter((s) => s._id !== seat._id));
    } else {
      if (selectedSeats.length >= 10) {
        setError('You can select a maximum of 10 seats per transaction.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // Submit hold sequence and navigate to checkout
  const handleProceed = async () => {
    if (isCurrentShowExpired || !selectedSeats.length) return;
    setIsHolding(true);
    setError('');

    const subtotal = selectedSeats.reduce((sum, s) => sum + (s.price || 500), 0);
    const convenienceFee = 20;
    const totalAmount = subtotal + convenienceFee;

    // Check if seats can be locked through backend hold
    const realDbSeatIds = selectedSeats
      .filter((s) => !String(s._id).startsWith('synth_'))
      .map((s) => s._id);

    let bookingId = null;
    let bookingNumber = null;
    let holdData = null;

    if (realDbSeatIds.length === selectedSeats.length && realDbSeatIds.length > 0) {
      try {
        const res = await API.post('/bookings/hold', {
          showId: show._id,
          showSeatIds: realDbSeatIds
        });
        holdData = res.data?.data;
        if (holdData) {
          bookingId = holdData.bookingId || holdData._id;
          bookingNumber = holdData.bookingNumber || holdData.bookingId;
        }
      } catch (err) {
        setIsHolding(false);
        setError(err.response?.data?.message || err.response?.data?.error || 'Unable to hold selected seats. They may have already been reserved.');
        return;
      }
    } else {
      setIsHolding(false);
      setError('Selected seats are invalid or not found in database. Please refresh and try again.');
      return;
    }

    if (!bookingId) {
      setIsHolding(false);
      setError('Unable to reserve seats. Please try again.');
      return;
    }

    const isCancellable = Boolean(
      holdData?.isCancellable ??
      show?.isCancellable ??
      show?.theatre?.cancellationAllowed
    );
    const cancellationFeePercent = holdData?.cancellationFeePercent ?? show?.cancellationFeePercent ?? 20;
    const cancellationCutoffMinutes = holdData?.cancellationCutoffMinutes ?? show?.cancellationCutoffMinutes ?? 120;

    const bookingData = {
      _id: bookingId,
      bookingId,
      bookingNumber,
      showId: show._id,
      selectedSeats: selectedSeats.map((s) => s.label || `${s.row}${s.number}`),
      subtotal,
      convenienceFee,
      totalAmount,
      isCancellable,
      cancellationFeePercent,
      cancellationCutoffMinutes,
      seats: selectedSeats.map((s) => ({
        label: s.label || `${s.row}${s.number}`,
        price: s.price,
        type: s.isBestseller ? 'bestseller' : 'regular'
      }))
    };

    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    setIsHolding(false);

    // Navigate to payment/booking summary using real backend booking identifier
    navigate(`/booking-summary/${bookingNumber || bookingId}`, {
      state: {
        bookingId,
        bookingNumber,
        showId: show._id,
        isCancellable,
        cancellationFeePercent,
        cancellationCutoffMinutes
      }
    });
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(1.25, Number((prev + 0.1).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.75, Number((prev - 0.1).toFixed(2))));
  };

  if (loading) {
    return (
      <div className="seat-selection-container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-danger mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted fw-medium">Loading seat layout...</p>
      </div>
    );
  }

  if (error && !show) {
    return (
      <div className="seat-selection-container d-flex flex-column justify-content-center align-items-center py-5" style={{ minHeight: '80vh' }}>
        <div className="alert alert-danger mb-4 p-4 text-center rounded-3 shadow-sm" style={{ maxWidth: '480px' }}>
          <h5 className="fw-bold mb-2">Show Not Available</h5>
          <p className="mb-3 small text-secondary">{error}</p>
          <Link to="/movies" className="btn text-white px-4 py-2 fw-semibold" style={{ backgroundColor: 'var(--bms-brand-red)' }}>
            Explore All Movies
          </Link>
        </div>
      </div>
    );
  }

  // Format date nicely
  const showDate = show?.date ? new Date(show.date) : new Date();
  const dateFormatted = showDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const showStartTime = show?.startsAt ? new Date(show.startsAt).getTime() : null;
  const isCurrentShowExpired = Boolean(
    show?.isExpired ||
    (showStartTime && !isNaN(showStartTime) && showStartTime <= now)
  );

  const currentDateStr = show?.date ? new Date(show.date).toISOString().slice(0, 10) : '';

  // Filter sibling showtimes so passed shows are excluded
  const unexpiredSiblingShows = theatreShows.filter((s) => {
    if (s.isBookable === false) return false;
    if (s.startsAt) {
      const t = new Date(s.startsAt).getTime();
      if (!isNaN(t) && t <= now) return false;
    }
    return true;
  });

  const sameDateShows = unexpiredSiblingShows.filter((s) => {
    if (!currentDateStr || !s.date) return true;
    return new Date(s.date).toISOString().slice(0, 10) === currentDateStr;
  });

  const uniqueShows = [];
  const seenTimes = new Set();
  (sameDateShows.length > 0 ? sameDateShows : unexpiredSiblingShows).forEach((s) => {
    if (s.startTime && !seenTimes.has(s.startTime)) {
      seenTimes.add(s.startTime);
      uniqueShows.push({
        time: s.startTime,
        id: s._id,
        isCurrent: (s._id || s.id) === showId || s.startTime === show?.startTime
      });
    }
  });

  const availableShowtimes = uniqueShows.length > 0
    ? uniqueShows
    : (isCurrentShowExpired ? [] : [{ time: show?.startTime || '10:30 AM', id: show?._id, isCurrent: true }]);

  const subtotal = selectedSeats.reduce((sum, s) => sum + (s.price || 500), 0);
  const totalAmount = subtotal > 0 ? subtotal + 20 : 0;

  return (
    <div className="seat-selection-container min-vh-100 d-flex flex-column justify-content-between">
      {/* 1. TOP HEADER BAR */}
      <div className="top-nav-bar d-flex align-items-center justify-content-between px-3 px-md-4 shadow-sm">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-link p-0 text-dark border-0"
            aria-label="Go back"
          >
            <IconArrowLeft size={24} />
          </button>
          <div>
            <h5 className="mb-0 fs-6 fw-bold text-dark">
              {show?.movie?.title || 'Movie'} ({show?.screenName || show?.format || 'Screen 1'}) {show?.language ? `- ${show.language}` : ''}
            </h5>
            <small className="text-muted">
              {show?.theatre?.name || 'Cinema Venue'} | {dateFormatted} | {show?.startTime || ''}
            </small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-link p-0 text-muted border-0 d-none d-sm-inline-flex"
            title="Wheelchair accessible seating available in Row P"
            aria-label="Accessibility information"
          >
            <IconWheelchair size={22} />
          </button>
          <button
            type="button"
            onClick={() => setShowCountModal(true)}
            className="btn btn-outline-danger btn-sm rounded-pill fw-semibold px-3 py-1 text-danger border-danger d-flex align-items-center gap-1"
          >
            <IconEdit size={14} />
            <span>{selectedSeats.length > 0 ? `${selectedSeats.length} Selected` : `${targetSeatCount} Tickets`}</span>
          </button>
        </div>
      </div>

      {/* 2. SHOWTIMES ROW BAR */}
      <div className="times-row-bar d-flex align-items-center gap-2">
        {availableShowtimes.map((item, idx) => {
          const isActive = item.isCurrent;
          return (
            <button
              key={idx}
              type="button"
              className={`btn btn-sm ${
                isActive
                  ? 'btn-success bg-success border-success text-white fw-bold px-3'
                  : 'btn-outline-warning border-warning-subtle text-dark px-3'
              }`}
              style={{
                fontSize: '12px',
                borderRadius: '4px',
                transition: 'all 0.15s ease'
              }}
              onClick={() => {
                if (!isActive && item.id && !item.id.startsWith('s')) {
                  navigate(`/movies/${movieId || show?.movie?._id}/seat-layout/${item.id}`);
                }
              }}
            >
              {item.time}
            </button>
          );
        })}
      </div>

      {/* EXPIRED SHOW WARNING BANNER */}
      {isCurrentShowExpired && (
        <div className="alert alert-warning border border-warning-subtle shadow-sm mx-3 my-2 p-3 text-center rounded-3">
          <h6 className="fw-bold text-dark mb-1">Booking closed — this showtime has already started.</h6>
          <p className="text-muted small mb-3">
            Tickets cannot be booked once a show has started. Please select an upcoming screening.
          </p>
          <Link
            to={`/movies/${movieId || show?.movie?._id || ''}`}
            className="btn btn-danger btn-sm px-4 py-2 rounded-2 fw-semibold shadow-sm"
            style={{ backgroundColor: 'var(--cb-crimson)', borderColor: 'var(--cb-crimson)' }}
          >
            View Upcoming Showtimes
          </Link>
        </div>
      )}

      {/* ERROR ALERT */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show m-3 py-2 px-3 small" role="alert">
          {error}
          <button type="button" className="btn-close btn-sm p-2" onClick={() => setError('')} aria-label="Close"></button>
        </div>
      )}

      {/* 3. CENTER SEAT MAP */}
      <div className="flex-grow-1 overflow-auto seat-map-wrapper position-relative">
        <div
          className="seat-grid-zoom-area d-flex flex-column align-items-center"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* ================= TIER 1: ₹650 ROYAL ================= */}
          <div className="tier-header w-100">₹{TIER_PRICES.ROYAL} ROYAL</div>
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((rowLabel) => (
            <div key={rowLabel} className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <span className="row-label">{rowLabel}</span>

              {/* Left Block A-H (seats 1-12) */}
              <div className="d-flex gap-1">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => {
                  const seat = getSeat(rowLabel, num, TIER_PRICES.ROYAL);
                  const isSelected = selectedSeats.some((s) => s._id === seat._id);
                  const isSold = seat.status === 'sold';
                  const isBestseller = seat.isBestseller;

                  return (
                    <div
                      key={seat._id}
                      role="button"
                      tabIndex={isSold ? -1 : 0}
                      aria-label={`Seat ${rowLabel}${num}, ${isSold ? 'Sold' : isSelected ? 'Selected' : 'Available'}`}
                      className={`seat-box ${isSold ? 'sold' : 'available'} ${isBestseller ? 'bestseller' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSeatClick(seat)}
                    >
                      {String(num).padStart(2, '0')}
                    </div>
                  );
                })}
              </div>

              {/* Wide aisle gap */}
              <div style={{ width: '40px' }} className="flex-shrink-0"></div>

              {/* Right Block A-H (seats 13-22) */}
              <div className="d-flex gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 13).map((num) => {
                  const seat = getSeat(rowLabel, num, TIER_PRICES.ROYAL);
                  const isSelected = selectedSeats.some((s) => s._id === seat._id);
                  const isSold = seat.status === 'sold';
                  const isBestseller = seat.isBestseller;

                  return (
                    <div
                      key={seat._id}
                      role="button"
                      tabIndex={isSold ? -1 : 0}
                      aria-label={`Seat ${rowLabel}${num}, ${isSold ? 'Sold' : isSelected ? 'Selected' : 'Available'}`}
                      className={`seat-box ${isSold ? 'sold' : 'available'} ${isBestseller ? 'bestseller' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSeatClick(seat)}
                    >
                      {String(num).padStart(2, '0')}
                    </div>
                  );
                })}
              </div>

              <span className="row-label">{rowLabel}</span>
            </div>
          ))}

          {/* ================= TIER 2: ₹520 CLUB ================= */}
          <div className="tier-header w-100">₹{TIER_PRICES.CLUB} CLUB</div>
          {['I', 'J', 'K', 'L', 'M', 'N'].map((rowLabel) => (
            <div key={rowLabel} className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <span className="row-label">{rowLabel}</span>

              {/* Left Block I-N (seats 1-6) */}
              <div className="d-flex gap-1">
                {Array.from({ length: 6 }, (_, i) => i + 1).map((num) => {
                  const seat = getSeat(rowLabel, num, TIER_PRICES.CLUB);
                  const isSelected = selectedSeats.some((s) => s._id === seat._id);
                  const isSold = seat.status === 'sold';
                  const isBestseller = seat.isBestseller;

                  return (
                    <div
                      key={seat._id}
                      role="button"
                      tabIndex={isSold ? -1 : 0}
                      aria-label={`Seat ${rowLabel}${num}, ${isSold ? 'Sold' : isSelected ? 'Selected' : 'Available'}`}
                      className={`seat-box ${isSold ? 'sold' : 'available'} ${isBestseller ? 'bestseller' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSeatClick(seat)}
                    >
                      {String(num).padStart(2, '0')}
                    </div>
                  );
                })}
              </div>

              {/* Wide aisle gap */}
              <div style={{ width: '40px' }} className="flex-shrink-0"></div>

              {/* Right Block I-N (seats 12-21) */}
              <div className="d-flex gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 12).map((num) => {
                  const seat = getSeat(rowLabel, num, TIER_PRICES.CLUB);
                  const isSelected = selectedSeats.some((s) => s._id === seat._id);
                  const isSold = seat.status === 'sold';
                  const isBestseller = seat.isBestseller;

                  return (
                    <div
                      key={seat._id}
                      role="button"
                      tabIndex={isSold ? -1 : 0}
                      aria-label={`Seat ${rowLabel}${num}, ${isSold ? 'Sold' : isSelected ? 'Selected' : 'Available'}`}
                      className={`seat-box ${isSold ? 'sold' : 'available'} ${isBestseller ? 'bestseller' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSeatClick(seat)}
                    >
                      {String(num).padStart(2, '0')}
                    </div>
                  );
                })}
              </div>

              <span className="row-label">{rowLabel}</span>
            </div>
          ))}

          {/* ================= TIER 3: ₹500 EXECUTIVE ================= */}
          <div className="tier-header w-100">₹{TIER_PRICES.EXECUTIVE} EXECUTIVE</div>
          {['O', 'P'].map((rowLabel) => (
            <div key={rowLabel} className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <span className="row-label">{rowLabel}</span>

              {/* Left Block O-P (seats 1-6) */}
              <div className="d-flex gap-1">
                {Array.from({ length: 6 }, (_, i) => i + 1).map((num) => {
                  const seat = getSeat(rowLabel, num, TIER_PRICES.EXECUTIVE);
                  const isSelected = selectedSeats.some((s) => s._id === seat._id);
                  const isSold = seat.status === 'sold';
                  const isBestseller = seat.isBestseller;

                  return (
                    <div
                      key={seat._id}
                      role="button"
                      tabIndex={isSold ? -1 : 0}
                      aria-label={`Seat ${rowLabel}${num}, ${isSold ? 'Sold' : isSelected ? 'Selected' : 'Available'}`}
                      className={`seat-box ${isSold ? 'sold' : 'available'} ${isBestseller ? 'bestseller' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSeatClick(seat)}
                    >
                      {String(num).padStart(2, '0')}
                    </div>
                  );
                })}
              </div>

              {/* Wide aisle gap */}
              <div style={{ width: '40px' }} className="flex-shrink-0"></div>

              {/* Right Block O-P (seats 12-21) */}
              <div className="d-flex gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 12).map((num) => {
                  const seat = getSeat(rowLabel, num, TIER_PRICES.EXECUTIVE);
                  const isSelected = selectedSeats.some((s) => s._id === seat._id);
                  const isSold = seat.status === 'sold';
                  const isBestseller = seat.isBestseller;
                  const isHandicap = seat.isCompanion;

                  return (
                    <div
                      key={seat._id}
                      role="button"
                      tabIndex={isSold ? -1 : 0}
                      aria-label={`Seat ${rowLabel}${num}, ${isHandicap ? 'Wheelchair accessible' : ''} ${isSold ? 'Sold' : isSelected ? 'Selected' : 'Available'}`}
                      className={`seat-box ${isSold ? 'sold' : 'available'} ${isBestseller ? 'bestseller' : ''} ${isHandicap ? 'companion-access' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSeatClick(seat)}
                    >
                      {isHandicap ? '♿' : String(num).padStart(2, '0')}
                    </div>
                  );
                })}
              </div>

              <span className="row-label">{rowLabel}</span>
            </div>
          ))}

          {/* PERSPECTIVE SCREEN */}
          <div className="mt-5 text-center w-100">
            <div className="perspective-screen"></div>
            <p className="text-muted fs-7 mt-2 mb-0">All eyes this way please</p>
          </div>
        </div>

        {/* FLOATING ZOOM CONTROLS */}
        <div className="position-fixed" style={{ bottom: '90px', right: '24px', zIndex: 90 }}>
          <div className="bg-white border rounded shadow-sm d-flex flex-column overflow-hidden">
            <button
              type="button"
              className="btn btn-sm btn-link text-dark p-2 border-0 border-bottom text-decoration-none"
              onClick={handleZoomIn}
              title="Zoom In"
              aria-label="Zoom in on seat map"
            >
              <IconPlus size={18} />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-link text-dark p-2 border-0 text-decoration-none"
              onClick={handleZoomOut}
              title="Zoom Out"
              aria-label="Zoom out on seat map"
            >
              <IconMinus size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. FOOTER LEGEND AND TRANSACTION ACTION BAR */}
      <div className="bg-white border-top py-3 mt-auto shadow-sm sticky-bottom" style={{ zIndex: 100 }}>
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-center gap-4 align-items-center flex-wrap text-muted fs-8">
            <div className="d-flex align-items-center gap-2">
              <div className="seat-box available pointer-events-none" style={{ width: '16px', height: '16px' }}></div>
              <span>Available</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="seat-box sold pointer-events-none" style={{ width: '16px', height: '16px' }}></div>
              <span>Sold</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="seat-box bestseller pointer-events-none" style={{ width: '16px', height: '16px', fontSize: '8px' }}>
                02
              </div>
              <span>Bestseller</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="seat-box selected pointer-events-none" style={{ width: '16px', height: '16px' }}></div>
              <span>Selected</span>
            </div>
          </div>

          {/* Dynamic Payment / Lock Button */}
          {selectedSeats.length > 0 && (
            <div className="d-flex justify-content-center align-items-center flex-column mt-3">
              <div className="small text-muted mb-1">
                Selected: <span className="fw-bold text-dark">{selectedSeats.map((s) => s.label).join(', ')}</span> ({selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'})
              </div>
              <button
                type="button"
                disabled={isHolding || isCurrentShowExpired}
                onClick={handleProceed}
                className="btn text-white px-5 py-2 font-medium fw-semibold rounded-2 shadow-sm"
                style={{
                  backgroundColor: isCurrentShowExpired ? '#6c757d' : 'var(--cb-crimson)',
                  fontSize: '15px',
                  cursor: isCurrentShowExpired ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
              >
                {isHolding ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Holding seats...
                  </>
                ) : isCurrentShowExpired ? (
                  'Showtime Started — Booking Closed'
                ) : (
                  `Proceed to checkout (₹${totalAmount})`
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. "How many seats?" MODAL */}
      {showCountModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', zIndex: 1080 }}
          onClick={() => setShowCountModal(false)}
        >
          <div
            className="bg-white rounded-3 shadow-lg p-4 text-center position-relative"
            style={{ width: '90%', maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="btn position-absolute top-0 end-0 m-2 p-1 text-muted border-0"
              onClick={() => setShowCountModal(false)}
              aria-label="Close"
            >
              <IconX size={20} />
            </button>

            <h5 className="fw-bold mb-3 text-dark" style={{ fontSize: '18px' }}>
              How many seats?
            </h5>

            {/* Scooter / Vehicle Emoji Illustration */}
            <div className="my-3" style={{ fontSize: '48px' }}>
              🛵
            </div>

            {/* Numbers Row 1-10 */}
            <div className="d-flex justify-content-center gap-1 gap-sm-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = targetSeatCount === num;
                return (
                  <button
                    key={num}
                    type="button"
                    className="btn rounded-circle d-flex align-items-center justify-content-center fw-bold p-0"
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: isSelected ? 'var(--cb-crimson)' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#333333',
                      border: isSelected ? 'none' : '1px solid #DDD',
                      fontSize: '13px',
                      transition: 'all 0.15s ease'
                    }}
                    onClick={() => setTargetSeatCount(num)}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Price Tiers List */}
            <div className="row g-2 mb-4 pt-2 border-top">
              {[
                { name: 'ROYAL', price: `₹${TIER_PRICES.ROYAL}` },
                { name: 'CLUB', price: `₹${TIER_PRICES.CLUB}` },
                { name: 'EXECUTIVE', price: `₹${TIER_PRICES.EXECUTIVE}` }
              ].map((tier, idx) => (
                <div key={idx} className="col-4 text-center">
                  <div className="fw-semibold text-muted" style={{ fontSize: '11px' }}>
                    {tier.name}
                  </div>
                  <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>
                    {tier.price}
                  </div>
                  <div className="fw-bold" style={{ color: 'var(--cb-green)', fontSize: '10px' }}>
                    AVAILABLE
                  </div>
                </div>
              ))}
            </div>

            {/* Bestseller Notice */}
            <div className="alert alert-light border py-2 mb-4 small text-muted" style={{ fontSize: '12px' }}>
              Book the <span className="fw-bold" style={{ color: 'var(--cb-bestseller)' }}>Bestseller Seats</span> in this cinema at no extra cost!
            </div>

            {/* Red "Select Seats" Button */}
            <button
              type="button"
              className="btn text-white w-100 fw-bold py-2 rounded-2"
              style={{ backgroundColor: 'var(--cb-crimson)', fontSize: '15px' }}
              onClick={() => setShowCountModal(false)}
            >
              Select Seats
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
