const BookingCostSummary = ({ selectedSeats, subtotal, fee, total, onProceed, isSubmitting, maxSeats }) => {
  return (
    <div
      className="bg-white rounded-3 position-sticky p-4 border shadow-sm"
      style={{ top: '80px' }}
    >
      <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
        <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '16px' }}>
          Booking Summary
        </h5>
        <span
          className="badge px-2 py-1 text-uppercase fw-semibold"
          style={{ backgroundColor: 'var(--bms-brand-red-soft)', color: 'var(--bms-brand-red)', fontSize: '10px' }}
        >
          M-TICKET
        </span>
      </div>

      {/* Selected Seats Chips */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-muted small fw-semibold" style={{ fontSize: '12px' }}>
            SELECTED SEATS
          </span>
          <span className="text-muted small" style={{ fontSize: '11px' }}>
            {selectedSeats.length} / {maxSeats} seats
          </span>
        </div>

        {selectedSeats.length > 0 ? (
          <div className="d-flex flex-wrap gap-2">
            {selectedSeats.sort().map((seat) => (
              <span
                key={seat}
                className="badge rounded-1 fw-bold border"
                style={{
                  backgroundColor: 'var(--bms-success-soft)',
                  color: 'var(--bms-selected)',
                  borderColor: 'var(--bms-success)',
                  padding: '6px 10px',
                  fontSize: '12px'
                }}
              >
                {seat}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-muted small fst-italic">
            Please tap on seats in the layout to select.
          </div>
        )}
      </div>

      <hr className="my-3" style={{ borderColor: '#EEEEEE' }} />

      {/* Price Breakdown (Screenshot 24) */}
      <div className="mb-3 small">
        <div className="d-flex justify-content-between mb-2">
          <span className="text-secondary">Ticket(s) price</span>
          <span className="fw-bold text-dark">
            ₹{subtotal.toLocaleString('en-IN')}.00
          </span>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span className="text-secondary">Convenience fees</span>
          <span className="fw-bold text-dark">
            ₹{selectedSeats.length > 0 ? fee : 0}.00
          </span>
        </div>
      </div>

      <hr className="my-3" style={{ borderColor: '#EEEEEE' }} />

      {/* Amount Payable */}
      <div className="d-flex justify-content-between mb-4 align-items-center">
        <div>
          <span className="fw-bold text-dark d-block" style={{ fontSize: '15px' }}>
            Amount Payable
          </span>
          <span className="text-muted" style={{ fontSize: '11px' }}>
            Inclusive of all taxes
          </span>
        </div>
        <div className="text-end">
          <span className="fw-bold text-danger" style={{ fontSize: '20px', color: 'var(--bms-brand-red)' }}>
            ₹{total.toLocaleString('en-IN')}.00
          </span>
        </div>
      </div>

      {/* BMS Red CTA Button */}
      <button
        type="button"
        disabled={selectedSeats.length === 0 || isSubmitting}
        onClick={onProceed}
        className="btn text-white w-100 fw-bold py-2 rounded-2 shadow-sm"
        style={{
          backgroundColor: selectedSeats.length === 0 ? '#CCCCCC' : 'var(--bms-brand-red)',
          cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer',
          fontSize: '15px'
        }}
      >
        {isSubmitting ? 'Processing...' : 'Proceed to Pay'}
      </button>
    </div>
  );
};

export default BookingCostSummary;
