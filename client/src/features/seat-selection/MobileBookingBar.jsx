import React from 'react';

const MobileBookingBar = ({ selectedSeats, total, onProceed, isSubmitting }) => {
  if (selectedSeats.length === 0) return null;

  return (
    <div
      className="d-lg-none position-fixed bottom-0 start-0 w-100 p-3 cb-glass"
      style={{
        zIndex: 1040,
        boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.6)',
        borderTop: '1px solid var(--cb-border-subtle)'
      }}
    >
      <div className="d-flex justify-content-between align-items-center max-w-sm mx-auto px-2">
        <div>
          <div className="small text-muted fw-bold mb-1" style={{ fontSize: '11px' }}>
            TOTAL ({selectedSeats.length} SEATS)
          </div>
          <div
            className="fw-bold fs-5 font-monospace"
            style={{ color: 'var(--cb-accent-yellow)' }}
          >
            ₹{total.toLocaleString('en-IN')}
          </div>
        </div>
        <button
          type="button"
          className="cb-btn-primary px-4 fw-bold"
          onClick={onProceed}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Reserving...' : 'Proceed'}
        </button>
      </div>
    </div>
  );
};

export default MobileBookingBar;
