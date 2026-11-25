import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getShowById, createBooking, holdSeats, confirmBooking, getShowSeats, getBookingById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  IconArrowLeft,
  IconDeviceMobile,
  IconCreditCard,
  IconBuildingBank,
  IconWallet,
  IconGift,
  IconClock,
  IconReceipt2,
  IconCheck,
  IconQrcode,
  IconEdit,
  IconChevronRight
} from '@tabler/icons-react';
import '../styles/booking.css';

const PAYMENT_TABS = [
  { id: 'UPI', label: 'Pay by any UPI App', icon: <IconDeviceMobile size={18} /> },
  { id: 'CARD', label: 'Debit/Credit Card', icon: <IconCreditCard size={18} /> },
  { id: 'WALLETS', label: 'Mobile Wallets', icon: <IconWallet size={18} /> },
  { id: 'GIFT', label: 'Gift Voucher', icon: <IconGift size={18} /> },
  { id: 'NETBANKING', label: 'Net Banking', icon: <IconBuildingBank size={18} /> },
  { id: 'PAYLATER', label: 'Pay Later', icon: <IconClock size={18} /> },
  { id: 'POINTS', label: 'Redeem Points', icon: <IconReceipt2 size={18} /> }
];

const mapPaymentMethod = (tabId) => {
  switch (tabId) {
    case 'UPI':
      return 'UPI';
    case 'CARD':
      return 'Credit/Debit Card';
    case 'NETBANKING':
      return 'Net Banking';
    case 'WALLETS':
      return 'Mobile Wallets';
    case 'GIFT':
      return 'Gift Voucher';
    case 'PAYLATER':
      return 'Pay Later';
    case 'POINTS':
      return 'Redeem Points';
    default:
      return tabId || 'UPI';
  }
};

const BookingSummary = () => {
  const navigate = useNavigate();
  const { bookingId: routeBookingId } = useParams();
  const { user } = useAuth();
  const [show, setShow] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [activeTab, setActiveTab] = useState('UPI');
  const [addCharity, setAddCharity] = useState(true);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBookingDetails = async () => {
      setLoading(true);
      setError('');
      try {
        let storedData = null;
        const stored = sessionStorage.getItem('bookingData');
        if (stored) {
          try {
            storedData = JSON.parse(stored);
          } catch (e) {
            console.warn('Failed parsing stored bookingData', e);
          }
        }

        let dbBooking = null;
        if (routeBookingId) {
          try {
            const res = await getBookingById(routeBookingId);
            dbBooking = res.data?.data || res.data;
          } catch (fetchErr) {
            console.warn('Pending booking fetch error:', fetchErr.message);
          }
        }

        if (dbBooking) {
          const loadedShow = dbBooking.show && typeof dbBooking.show === 'object' ? dbBooking.show : null;
          const showId = loadedShow?._id || dbBooking.show || storedData?.showId;

          setBookingData({
            _id: dbBooking._id,
            bookingId: dbBooking.bookingId || dbBooking.bookingNumber || routeBookingId,
            bookingNumber: dbBooking.bookingNumber || dbBooking.bookingId,
            showId,
            selectedSeats: dbBooking.seatNumbers?.length ? dbBooking.seatNumbers : (storedData?.selectedSeats || []),
            subtotal: dbBooking.subtotal || storedData?.subtotal || 0,
            convenienceFee: dbBooking.convenienceFee || storedData?.convenienceFee || 20,
            totalAmount: dbBooking.totalAmount || storedData?.totalAmount || 0
          });

          if (loadedShow) {
            setShow({
              ...loadedShow,
              movie: dbBooking.movie || loadedShow.movie || { title: dbBooking.snapshot?.movieTitle, poster: dbBooking.snapshot?.moviePoster, language: dbBooking.snapshot?.language },
              theatre: dbBooking.theatre || loadedShow.theatre || { name: dbBooking.snapshot?.theatreName, address: dbBooking.snapshot?.theatreAddress },
              screenName: dbBooking.screenName || dbBooking.snapshot?.screenName || loadedShow.screenName,
              startTime: dbBooking.snapshot?.startTime || loadedShow.startTime,
              date: dbBooking.snapshot?.startsAt || loadedShow.date
            });
            setLoading(false);
            return;
          }

          if (showId) {
            const showRes = await getShowById(showId);
            if (showRes.data?.data) {
              setShow(showRes.data.data);
              setLoading(false);
              return;
            }
          }
        }

        if (storedData?.showId) {
          setBookingData(storedData);
          const showRes = await getShowById(storedData.showId);
          if (showRes.data?.data) {
            setShow(showRes.data.data);
            setLoading(false);
            return;
          }
        }

        setError('Booking or show not found. Please select your seats again.');
        setLoading(false);
      } catch (err) {
        console.error('Error loading booking summary:', err);
        setError('Unable to load booking details. Please try again.');
        setLoading(false);
      }
    };

    loadBookingDetails();
  }, [routeBookingId]);

  const fetchShow = async (showId) => {
    try {
      const res = await getShowById(showId);
      setShow(res.data.data);
    } catch (err) {
      console.error('Backend show API unreachable:', err.message);
      setError('Unable to load screening details for this show.');
    } finally {
      setLoading(false);
    }
  };

  const getSeatPrice = (seatId) => {
    const row = seatId.charAt(0);
    if (row === 'R') return 399;
    if (row === 'A' || row === 'B') return 299;
    if (row >= 'C' && row <= 'H') return 199;
    return 149;
  };

  const calculateTicketPrice = () => {
    if (!bookingData?.selectedSeats) return 0;
    return bookingData.selectedSeats.reduce((acc, s) => acc + getSeatPrice(s), 0);
  };

  const handlePayment = async () => {
    setPaying(true);
    setError('');

    const charityFee = addCharity ? 2 : 0;
    const finalAmount = totalBase + charityFee;
    const selectedMethod = mapPaymentMethod(activeTab);

    try {
      let confirmedBooking = null;

      // 1. If we have a bookingId, attempt to confirm it
      const targetBookingId = bookingData._id || bookingData.bookingId || routeBookingId;
      if (targetBookingId) {
        try {
          const res = await confirmBooking({
            bookingId: targetBookingId,
            paymentMethod: selectedMethod,
            seatNumbers: bookingData.selectedSeats,
            showId: bookingData.showId,
            totalAmount: finalAmount
          });
          confirmedBooking = res.data?.data;
        } catch (confirmErr) {
          if (bookingData.showId && String(bookingData.showId).match(/^[0-9a-fA-F]{24}$/)) {
            const payload = {
              showId: bookingData.showId,
              seatNumbers: bookingData.selectedSeats,
              paymentMethod: selectedMethod,
              totalAmount: finalAmount
            };
            const res = await createBooking(payload);
            confirmedBooking = res.data?.data;
          } else {
            throw confirmErr;
          }
        }
      } else if (bookingData.showId) {
        const payload = {
          showId: bookingData.showId,
          seatNumbers: bookingData.selectedSeats,
          paymentMethod: selectedMethod,
          totalAmount: finalAmount
        };
        const res = await createBooking(payload);
        confirmedBooking = res.data?.data;
      }

      if (!confirmedBooking) {
        throw new Error('Unable to confirm booking. Please try again.');
      }

      sessionStorage.removeItem('bookingData');
      const targetId = confirmedBooking.bookingNumber || confirmedBooking.bookingId || confirmedBooking._id;
      navigate(`/ticket/${targetId}`);
    } catch (err) {
      console.error('Booking failed:', err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Payment processing failed. Please try again.';
      setError(errorMsg);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!show || !bookingData) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="alert alert-danger p-4 text-center rounded-3 shadow-sm mb-3" style={{ maxWidth: '480px' }}>
          <h5 className="fw-bold mb-2">Booking Not Located</h5>
          <p className="text-secondary small mb-3">{error || 'No active reservation or booking details found.'}</p>
          <Link to="/movies" className="btn text-white px-4 py-2 fw-semibold" style={{ backgroundColor: 'var(--bms-brand-red)' }}>
            Explore All Movies
          </Link>
        </div>
      </div>
    );
  }

  const convenienceFee = bookingData?.convenienceFee || 20;
  const totalBase = bookingData?.totalAmount || (calculateTicketPrice() + convenienceFee);
  const ticketPrice = totalBase - convenienceFee;
  const charityAmount = addCharity ? 2.00 : 0.00;
  const grandTotal = totalBase + charityAmount;

  const showDateFormatted = show?.date ? new Date(show.date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : 'Today';

  return (
    <div style={{ backgroundColor: 'var(--bms-bg-page)', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* 1. Header Bar with Back Link (Screenshot 24) */}
      <div className="bg-white border-bottom py-3 px-3 mb-4 shadow-sm">
        <div className="bms-container d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-sm p-0 border-0 text-dark"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <IconArrowLeft size={22} />
          </button>
          <div>
            <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '15px' }}>
              {show.movie?.title}
            </h6>
            <small className="text-muted" style={{ fontSize: '12px' }}>
              {show.theatre?.name} | {show.startTime}
            </small>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column BMS Payment Layout (Screenshot 24) */}
      <div className="bms-container">
        {error && (
          <div className="alert alert-danger py-2 mb-3 small d-flex justify-content-between align-items-center">
            <span>{error}</span>
            <button type="button" className="btn-close btn-sm" onClick={() => setError('')} />
          </div>
        )}

        <div className="row g-4">
          {/* Left Column: Payment Options (Screenshot 24) */}
          <div className="col-12 col-lg-7">
            <div className="bg-white rounded-3 border shadow-sm overflow-hidden">
              <div className="p-3 border-bottom bg-light">
                <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '16px' }}>
                  Payment options
                </h5>
              </div>

              <div className="row g-0">
                {/* Vertical Tabs List */}
                <div className="col-12 col-md-5 border-end">
                  {PAYMENT_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`bms-pay-tab ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span className="text-muted">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content Panel */}
                <div className="col-12 col-md-7 p-4">
                  <h6 className="fw-bold text-dark mb-3">
                    {PAYMENT_TABS.find((t) => t.id === activeTab)?.label}
                  </h6>

                  {activeTab === 'UPI' && (
                    <div>
                      <div
                        className="p-3 border rounded-2 d-flex align-items-center justify-content-between cursor-pointer mb-3"
                        style={{ backgroundColor: '#FAFAFA' }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <IconQrcode size={24} className="text-dark" />
                          <div>
                            <div className="fw-semibold small text-dark">Scan QR code</div>
                            <div className="text-muted" style={{ fontSize: '11px' }}>
                              You need to have a registered UPI ID
                            </div>
                          </div>
                        </div>
                        <IconChevronRight size={18} className="text-muted" />
                      </div>

                      <div className="mt-3">
                        <label className="form-label small text-muted">Or enter UPI ID / VPA</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="username@okhdfcbank"
                            defaultValue={user?.email ? `${user.email.split('@')[0]}@okaxis` : ''}
                          />
                          <button type="button" className="btn btn-outline-danger px-3">
                            Verify
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'CARD' && (
                    <div className="d-flex flex-column gap-3">
                      <div>
                        <label className="form-label small text-muted">Card Number</label>
                        <input type="text" className="form-control" placeholder="4111 2222 3333 4444" />
                      </div>
                      <div className="row g-2">
                        <div className="col-6">
                          <label className="form-label small text-muted">Expiry (MM/YY)</label>
                          <input type="text" className="form-control" placeholder="12/28" />
                        </div>
                        <div className="col-6">
                          <label className="form-label small text-muted">CVV</label>
                          <input type="password" maxLength={4} className="form-control" placeholder="123" />
                        </div>
                      </div>
                      <div>
                        <label className="form-label small text-muted">Cardholder Name</label>
                        <input type="text" className="form-control" defaultValue={user?.name || 'Cardholder'} />
                      </div>
                    </div>
                  )}

                  {activeTab !== 'UPI' && activeTab !== 'CARD' && (
                    <div className="text-center py-4 text-muted small">
                      Select your provider and proceed to authenticate via secure gateway.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (Screenshot 24) */}
          <div className="col-12 col-lg-5">
            <div className="bms-order-summary">
              {/* Movie & Venue Info */}
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h5 className="fw-bold mb-1 text-dark" style={{ fontSize: '17px' }}>
                    {show.movie?.title}
                  </h5>
                  <div className="small text-secondary mb-1">
                    {showDateFormatted} | {show.startTime}
                  </div>
                  <div className="small text-muted mb-1">{show.movie?.language}</div>
                  <div className="small fw-semibold text-dark mb-1">
                    {(show.screenName || show.screen?.name) ? `${show.screenName || show.screen?.name} • ` : ''}Seats: {bookingData.selectedSeats.join(', ')}
                  </div>
                  <div className="small text-muted">{show.theatre?.name}</div>
                </div>

                <div className="text-end">
                  <div className="fw-bold text-dark">{bookingData.selectedSeats.length}</div>
                  <span
                    className="badge px-2 py-1 text-uppercase fw-semibold"
                    style={{ backgroundColor: 'var(--bms-brand-red-soft)', color: 'var(--bms-brand-red)', fontSize: '10px' }}
                  >
                    M-Ticket
                  </span>
                </div>
              </div>

              {/* Cancellation Warning Box (Screenshot 24) */}
              <div className="bms-cancellation-notice">
                <div className="fw-bold mb-1">Cancellation Unavailable</div>
                <div>This venue does not support booking cancellation.</div>
              </div>

              {/* Cost Breakdown */}
              <div className="py-2 border-top border-bottom small">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Ticket(s) price</span>
                  <span className="fw-bold text-dark">₹{ticketPrice.toFixed(2)}</span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Convenience fees ▾</span>
                  <span className="fw-bold text-dark">₹{convenienceFee.toFixed(2)}</span>
                </div>

                {/* Charity Contribution Option (Screenshot 24) */}
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div>
                    <span className="text-secondary d-block">Give to Underprivileged Musicians</span>
                    <small className="text-muted" style={{ fontSize: '10px' }}>
                      (₹1 per ticket) <span className="text-danger cursor-pointer">VIEW T&amp;C</span>
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-danger p-0 fw-semibold text-decoration-none"
                    onClick={() => setAddCharity(!addCharity)}
                    style={{ fontSize: '12px' }}
                  >
                    {addCharity ? `Add ₹${charityAmount.toFixed(2)}` : 'Remove'}
                  </button>
                </div>
              </div>

              {/* Order Total Line */}
              <div className="d-flex justify-content-between py-2 fw-bold text-dark small border-bottom mb-3">
                <span>Order total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>

              {/* For Sending Booking Details Section (Screenshot 24) */}
              <div className="mb-3 p-2 bg-light rounded-2 small d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '12px' }}>
                    For Sending Booking Details
                  </div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>
                    +91-6370748341 | {user?.email || 'customer@gmail.com'}
                  </div>
                </div>
                <button type="button" className="btn btn-sm text-danger p-0 fw-semibold border-0" style={{ fontSize: '11px' }}>
                  Edit
                </button>
              </div>

              {/* Apply Offers (Screenshot 24) */}
              <div className="p-2 border rounded-2 mb-3 d-flex justify-content-between align-items-center cursor-pointer">
                <div className="d-flex align-items-center gap-2 small fw-semibold text-dark">
                  <span>🏷️</span>
                  <span>Apply Offers</span>
                </div>
                <IconChevronRight size={16} className="text-muted" />
              </div>

              {/* Consent Text */}
              <p className="text-muted" style={{ fontSize: '11px', lineHeight: 1.4 }}>
                By proceeding, I express my consent to complete this transaction.
              </p>

              {/* Total Payable & Pay Button (Screenshot 24) */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold text-dark">Amount Payable</span>
                <span className="fw-bold" style={{ fontSize: '20px', color: 'var(--bms-brand-red)' }}>
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                disabled={paying}
                onClick={handlePayment}
                className="btn text-white w-100 fw-bold py-3 rounded-2 shadow-sm"
                style={{ backgroundColor: 'var(--bms-brand-red)', fontSize: '15px' }}
              >
                {paying ? 'Processing Payment...' : `Pay ₹${grandTotal.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
