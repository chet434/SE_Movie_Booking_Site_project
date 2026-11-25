import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  IconArrowLeft,
  IconCheck,
  IconTicket,
  IconCalendar,
  IconMapPin,
  IconClock,
  IconShieldCheck,
  IconCreditCard,
  IconDeviceMobile,
  IconBuildingBank,
  IconQrcode
} from '@tabler/icons-react';
import { getMusicStudioEventById } from '../data/musicStudioEvents';
import { useAuth } from '../context/AuthContext';
import { createEventBooking } from '../services/api';
import { purgeStorageKeys } from '../utils/userStorage';
import CinebookLogo from '../components/CinebookLogo';
import '../styles/event-tickets.css';

const EventTicketSelection = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const event = getMusicStudioEventById(eventId);

  const [step, setStep] = useState(1); // 1: Select Tickets, 2: Review & Pay, 3: Confirmation Pass
  const [selectedTiers, setSelectedTiers] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Attendee Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '9876543210');

  if (!event) {
    return (
      <div className="cb-tickets-page d-flex flex-column align-items-center justify-content-center py-5">
        <h3 className="fw-bold mb-2">Event Not Found</h3>
        <p className="text-muted mb-4">We could not load ticket details for this event.</p>
        <Link to="/" className="btn btn-danger px-4 py-2">
          Return to Home
        </Link>
      </div>
    );
  }

  // Calculate ticket counts and totals
  const totalQuantity = Object.values(selectedTiers).reduce((sum, qty) => sum + qty, 0);

  const subtotal = Object.entries(selectedTiers).reduce((sum, [tierId, qty]) => {
    const tier = event.ticketTiers.find((t) => t.id === tierId);
    return sum + (tier ? tier.price * qty : 0);
  }, 0);

  const convenienceFee = Math.round(subtotal * 0.08); // 8% convenience fee incl. GST
  const grandTotal = subtotal + convenienceFee;

  const handleAddTier = (tierId) => {
    if (totalQuantity >= 10) return;
    setSelectedTiers((prev) => ({
      ...prev,
      [tierId]: (prev[tierId] || 0) + 1
    }));
  };

  const handleIncrement = (tierId) => {
    if (totalQuantity >= 10) return;
    setSelectedTiers((prev) => ({
      ...prev,
      [tierId]: (prev[tierId] || 0) + 1
    }));
  };

  const handleDecrement = (tierId) => {
    setSelectedTiers((prev) => {
      const current = prev[tierId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[tierId];
        return next;
      }
      return {
        ...prev,
        [tierId]: current - 1
      };
    });
  };

  const handleProceedToPayment = () => {
    if (totalQuantity === 0) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleCompletePayment = async () => {
    setIsProcessing(true);

    try {
      // Purge any legacy localStorage event booking keys to prevent cross-account leaks
      purgeStorageKeys(
        'cinebook_event_bookings',
        'cinebook_event_bookings_all',
        `cinebook_event_bookings_${user?._id || 'guest'}`,
        `cinebook_event_bookings_undefined`,
        `cinebook_event_bookings_null`
      );

      const tiersBreakdown = Object.entries(selectedTiers)
        .filter(([_, qty]) => qty > 0)
        .map(([tierId, qty]) => {
          const tier = event.ticketTiers.find((t) => t.id === tierId);
          return {
            tierId,
            name:     tier?.name || tierId,
            price:    tier?.price || 0,
            quantity: qty
          };
        });

      const payload = {
        eventId:       event.id,
        eventTitle:    event.title,
        poster:        event.poster || '',
        venue:         event.venue,
        dateFull:      event.dateFull,
        time:          event.time,
        items:         tiersBreakdown,
        totalPasses:   totalQuantity,
        subtotal,
        bookingFee:    convenienceFee,
        totalAmount:   grandTotal,
        paymentMethod: paymentMethod.toUpperCase(),
        attendee: {
          name:  name  || 'Valued Guest',
          email: email || 'guest@cinebook.com',
          phone: phone || '+91 9876543210'
        }
      };

      const res = await createEventBooking(payload);
      const savedBooking = res.data?.data;

      // Map DB response to the shape the confirmation UI expects
      const confirmedData = {
        bookingRef:    savedBooking.passCode,
        eventId:       savedBooking.eventId,
        eventTitle:    savedBooking.eventTitle,
        dateFull:      savedBooking.dateFull,
        time:          savedBooking.time,
        venue:         savedBooking.venue,
        poster:        savedBooking.poster,
        // Map items → selectedTiers for UI compatibility
        selectedTiers: (savedBooking.items || []).map((it) => ({
          name:     it.name,
          quantity: it.quantity,
          price:    it.price,
          total:    it.price * it.quantity
        })),
        totalTickets:   savedBooking.totalPasses,
        subtotal:       savedBooking.subtotal,
        convenienceFee: savedBooking.bookingFee,
        grandTotal:     savedBooking.totalAmount,
        attendee:       savedBooking.attendee || {},
        paymentMethod:  savedBooking.paymentMethod,
        bookedAt:       savedBooking.createdAt
      };

      setConfirmedBooking(confirmedData);
      setIsProcessing(false);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (err) {
      console.error('Event booking failed:', err);
      alert(err?.response?.data?.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="cb-tickets-page">
      {/* ====================================================================
          Focused Top Bar
          ==================================================================== */}
      <header className="cb-tickets-topbar">
        <div className="cb-tickets-topbar-inner">
          {step === 1 ? (
            <button
              type="button"
              className="cb-tickets-back-btn"
              onClick={() => navigate(`/events/${event.id}`)}
            >
              <IconArrowLeft size={18} stroke={2.5} />
              <span>Back</span>
            </button>
          ) : step === 2 ? (
            <button
              type="button"
              className="cb-tickets-back-btn"
              onClick={() => setStep(1)}
            >
              <IconArrowLeft size={18} stroke={2.5} />
              <span>Change Tickets</span>
            </button>
          ) : (
            <Link to="/" className="cb-tickets-back-btn">
              <IconArrowLeft size={18} stroke={2.5} />
              <span>Home</span>
            </Link>
          )}

          <Link to="/" className="text-decoration-none">
            <CinebookLogo height={28} />
          </Link>

          {/* 2-Step Progress Indicator */}
          <div className="cb-tickets-step-pills">
            <div
              className={`cb-tickets-step-pill ${
                step === 1 ? 'active' : step > 1 ? 'completed' : ''
              }`}
            >
              <span className="cb-tickets-step-num">
                {step > 1 ? <IconCheck size={14} stroke={3} /> : '1'}
              </span>
              <span>Ticket</span>
            </div>
            <div className="cb-tickets-step-divider" />
            <div
              className={`cb-tickets-step-pill ${
                step === 2 ? 'active' : step === 3 ? 'completed' : ''
              }`}
            >
              <span className="cb-tickets-step-num">
                {step === 3 ? <IconCheck size={14} stroke={3} /> : '2'}
              </span>
              <span>Payment</span>
            </div>
          </div>
        </div>
      </header>

      {/* ====================================================================
          Main Container
          ==================================================================== */}
      <main className="cb-tickets-container">
        {/* Mini Event Header Banner */}
        <div className="cb-tickets-event-banner">
          <img
            src={event.poster}
            alt={event.title}
            className="cb-tickets-thumb"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = event.banner || '/img/popcorn.jpg';
            }}
          />
          <div className="cb-tickets-event-info">
            <h2 className="cb-tickets-event-title">{event.title}</h2>
            <div className="cb-tickets-event-meta">
              <div className="d-flex align-items-center gap-1">
                <IconCalendar size={14} />
                <span>{event.dateFull} &bull; {event.time}</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <IconMapPin size={14} />
                <span>{event.venue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------
            STEP 1: Tier Selection
            ------------------------------------------------------------------ */}
        {step === 1 && (
          <div>
            <div className="cb-tickets-section-heading">
              <h1 className="cb-tickets-section-title">Select Tickets</h1>
              <p className="cb-tickets-section-subtitle">
                Maximum 10 tickets per transaction &bull; {10 - totalQuantity} remaining
              </p>
            </div>

            <div className="cb-tickets-tiers-list">
              {event.ticketTiers.map((tier) => {
                const qty = selectedTiers[tier.id] || 0;
                return (
                  <div
                    key={tier.id}
                    className={`cb-tier-card ${qty > 0 ? 'selected' : ''}`}
                  >
                    <div className="cb-tier-info">
                      <h3 className="cb-tier-name">{tier.name}</h3>
                      <p className="cb-tier-desc">{tier.description}</p>
                      <div className="cb-tier-price">
                        ₹{tier.price.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="cb-tier-actions">
                      {qty === 0 ? (
                        <button
                          type="button"
                          className="cb-tier-add-btn"
                          onClick={() => handleAddTier(tier.id)}
                          disabled={totalQuantity >= 10}
                        >
                          Add
                        </button>
                      ) : (
                        <div className="cb-tier-stepper">
                          <button
                            type="button"
                            className="cb-stepper-btn"
                            onClick={() => handleDecrement(tier.id)}
                            aria-label={`Decrease ${tier.name}`}
                          >
                            &minus;
                          </button>
                          <span className="cb-stepper-val">{qty}</span>
                          <button
                            type="button"
                            className="cb-stepper-btn"
                            onClick={() => handleIncrement(tier.id)}
                            disabled={totalQuantity >= 10}
                            aria-label={`Increase ${tier.name}`}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky Bottom Summary Bar */}
            {totalQuantity > 0 && (
              <div className="cb-tickets-bottom-bar">
                <div className="cb-tickets-bottom-inner">
                  <div>
                    <p className="cb-bottom-total-label">Subtotal</p>
                    <p className="cb-bottom-total-val">
                      ₹{subtotal.toLocaleString('en-IN')}
                      <span className="cb-bottom-tickets-count">
                        ({totalQuantity} {totalQuantity === 1 ? 'ticket' : 'tickets'})
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="cb-tickets-proceed-btn"
                    onClick={handleProceedToPayment}
                  >
                    Proceed
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------
            STEP 2: Review & Proceed to Pay
            ------------------------------------------------------------------ */}
        {step === 2 && (
          <div>
            {/* Order Summary Card */}
            <div className="cb-checkout-card">
              <h2 className="cb-checkout-card-title">
                <IconTicket size={20} color="#F84464" />
                Order Summary
              </h2>

              {Object.entries(selectedTiers)
                .filter(([_, qty]) => qty > 0)
                .map(([tierId, qty]) => {
                  const tier = event.ticketTiers.find((t) => t.id === tierId);
                  if (!tier) return null;
                  return (
                    <div key={tierId} className="cb-order-item-row">
                      <div>
                        <strong>{tier.name}</strong> &times; {qty}
                      </div>
                      <div>₹{(tier.price * qty).toLocaleString('en-IN')}</div>
                    </div>
                  );
                })}

              <div className="cb-order-divider" />

              <div className="cb-order-item-row">
                <span className="text-muted">Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="cb-order-item-row">
                <span className="text-muted">Convenience Fee & Taxes (8%)</span>
                <span>₹{convenienceFee.toLocaleString('en-IN')}</span>
              </div>

              <div className="cb-order-divider" />

              <div className="cb-order-total-row">
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Contact / Attendee Details */}
            <div className="cb-checkout-card">
              <h2 className="cb-checkout-card-title">Attendee Details</h2>
              <div className="cb-input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="cb-input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
              <div className="cb-input-group mb-0">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="cb-checkout-card">
              <h2 className="cb-checkout-card-title">Select Payment Mode</h2>
              <div className="cb-payment-options">
                <label
                  className={`cb-payment-option ${paymentMethod === 'upi' ? 'active' : ''}`}
                >
                  <input
                    type="radio"
                    name="paymentMode"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                  />
                  <IconDeviceMobile size={20} color="#F84464" />
                  <span className="cb-payment-label">
                    UPI (Google Pay, PhonePe, Paytm, BHIM)
                  </span>
                </label>

                <label
                  className={`cb-payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
                >
                  <input
                    type="radio"
                    name="paymentMode"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <IconCreditCard size={20} color="#3B82F6" />
                  <span className="cb-payment-label">
                    Credit / Debit Card (Visa, MasterCard, RuPay)
                  </span>
                </label>

                <label
                  className={`cb-payment-option ${paymentMethod === 'netbanking' ? 'active' : ''}`}
                >
                  <input
                    type="radio"
                    name="paymentMode"
                    value="netbanking"
                    checked={paymentMethod === 'netbanking'}
                    onChange={() => setPaymentMethod('netbanking')}
                  />
                  <IconBuildingBank size={20} color="#10B981" />
                  <span className="cb-payment-label">
                    Net Banking (All Indian Banks)
                  </span>
                </label>
              </div>
            </div>

            {/* Pay Now CTA */}
            <button
              type="button"
              className="cb-pay-now-btn"
              onClick={handleCompletePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <IconShieldCheck size={20} />
                  <span>Pay ₹{grandTotal.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------------
            STEP 3: Confirmed M-Ticket Pass
            ------------------------------------------------------------------ */}
        {step === 3 && confirmedBooking && (
          <div className="cb-confirmation-card">
            {/* Dark Pass Header */}
            <div className="cb-pass-header">
              <span className="cb-pass-badge">Booking Confirmed</span>
              <div className="cb-pass-ref">
                PASS ID: {confirmedBooking.bookingRef}
              </div>
              <h1 className="cb-pass-title">{confirmedBooking.eventTitle}</h1>
            </div>

            {/* Pass Body */}
            <div className="cb-pass-body">
              {/* QR Code Graphic */}
              <div className="cb-qr-section">
                <div className="cb-qr-box">
                  <IconQrcode size={100} stroke={1.5} color="#1F2937" />
                </div>
                <div className="cb-qr-hint">
                  Scan at the venue entry gate
                </div>
              </div>

              {/* Event & Pass Metadata */}
              <div className="cb-pass-specs-grid">
                <div className="cb-pass-spec-item">
                  <div className="cb-pass-spec-label">Date & Time</div>
                  <div className="cb-pass-spec-val">
                    {confirmedBooking.dateFull} &bull; {confirmedBooking.time}
                  </div>
                </div>
                <div className="cb-pass-spec-item">
                  <div className="cb-pass-spec-label">Venue</div>
                  <div className="cb-pass-spec-val">{confirmedBooking.venue}</div>
                </div>
                <div className="cb-pass-spec-item">
                  <div className="cb-pass-spec-label">Passes ({confirmedBooking.totalTickets})</div>
                  <div className="cb-pass-spec-val">
                    {confirmedBooking.selectedTiers.map((t) => `${t.name} (x${t.quantity})`).join(', ')}
                  </div>
                </div>
                <div className="cb-pass-spec-item">
                  <div className="cb-pass-spec-label">Amount Paid</div>
                  <div className="cb-pass-spec-val text-success">
                    ₹{confirmedBooking.grandTotal.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="alert alert-light border small text-muted mb-0">
                A confirmation SMS & email have been dispatched with this M-Ticket pass. Please bring a valid government photo ID matching {confirmedBooking.attendee.name}.
              </div>

              {/* Navigation Action Buttons */}
              <div className="cb-pass-actions">
                <button
                  type="button"
                  className="cb-pass-btn-primary"
                  onClick={() => navigate('/my-bookings')}
                >
                  View in My Bookings
                </button>
                <button
                  type="button"
                  className="cb-pass-btn-secondary"
                  onClick={() => navigate('/')}
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EventTicketSelection;
