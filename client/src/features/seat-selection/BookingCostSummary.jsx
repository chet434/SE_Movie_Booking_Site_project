import React from 'react';

const BookingCostSummary = ({ selectedSeats, subtotal, fee, total, onProceed, isSubmitting, maxSeats }) => {
  return (
    <div className="cs-panel position-sticky" style={{ top: '96px' }}>
      <div className="p-4">
        <h5 className="fw-bold mb-4">Booking Summary</h5>
        
        {/* ARIA live region for screen readers */}
        <div aria-live="polite" className="visually-hidden">
          {selectedSeats.length} seats selected. Total amount is {total} Rupees.
        </div>

        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="text-muted small fw-bold">SELECTED SEATS</span>
            <span className="text-muted small">
              ({selectedSeats.length}/{maxSeats})
            </span>
          </div>
          <div className="fw-bold" style={{ color: 'var(--cs-text-primary)' }}>
            {selectedSeats.length > 0 ? selectedSeats.sort().join(', ') : 'No seats selected'}
          </div>
        </div>

        <hr style={{ borderColor: 'var(--cs-border)' }} />

        <div className="mb-4">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Tickets subtotal</span>
            <span className="fw-bold">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Convenience fee</span>
            <span className="fw-bold">₹{selectedSeats.length > 0 ? fee : 0}</span>
          </div>
        </div>

        <hr style={{ borderColor: 'var(--cs-border)' }} />

        <div className="d-flex justify-content-between mb-4 align-items-center">
          <span className="fw-bold" style={{ fontSize: '1.1rem' }}>Total Amount</span>
          <span className="fw-bold" style={{ fontSize: '1.25rem', color: 'var(--cs-action-primary)' }}>
            ₹{(selectedSeats.length > 0 ? total : 0).toLocaleString('en-IN')}
          </span>
        </div>

        <button 
          className="cs-button-primary w-100 fw-bold d-flex justify-content-center align-items-center gap-2" 
          onClick={onProceed}
          disabled={selectedSeats.length === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>Processing...</span>
            </>
          ) : (
            <span>Proceed to Payment</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default BookingCostSummary;
