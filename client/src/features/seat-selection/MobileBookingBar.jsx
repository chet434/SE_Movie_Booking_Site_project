import React from 'react';

const MobileBookingBar = ({ selectedSeats, total, onProceed, isSubmitting }) => {
  if (selectedSeats.length === 0) return null;

  return (
    <div className="d-lg-none position-fixed bottom-0 start-0 w-100 p-3" style={{ backgroundColor: 'var(--cs-surface)', borderTop: '1px solid var(--cs-border)', zIndex: 1000, boxShadow: '0 -4px 12px rgba(0,0,0,0.2)' }}>
      <div className="d-flex justify-content-between align-items-center max-w-sm mx-auto">
        <div>
          <div className="small text-muted fw-bold mb-1">Total ({selectedSeats.length} seats)</div>
          <div className="fw-bold fs-5" style={{ color: 'var(--cs-action-primary)' }}>₹{total.toLocaleString('en-IN')}</div>
        </div>
        <button 
          className="cs-button-primary px-4 fw-bold" 
          onClick={onProceed}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Proceed'}
        </button>
      </div>
    </div>
  );
};

export default MobileBookingBar;
