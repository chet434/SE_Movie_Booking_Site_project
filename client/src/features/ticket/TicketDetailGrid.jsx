import React from 'react';

const TicketDetailGrid = ({ booking }) => {
  return (
    <div className="py-3">
      <div className="row g-3 mb-3">
        <div className="col-12">
          <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Theatre</small>
          <div className="fw-bold fs-5 text-dark">{booking.theatre?.name}</div>
          <div className="text-secondary small">{booking.theatre?.location}</div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-6">
          <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Date</small>
          <div className="fw-bold text-dark">
            {booking.show?.date && new Date(booking.show.date).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </div>
        </div>
        <div className="col-6">
          <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Time</small>
          <div className="fw-bold text-dark">{booking.show?.startTime}</div>
        </div>
        
        <div className="col-6">
          <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Screen</small>
          <div className="fw-bold text-dark">{booking.screenName}</div>
        </div>
        <div className="col-6">
          <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Format</small>
          <div className="fw-bold text-dark">{booking.show?.format || '2D'}</div>
        </div>

        <div className="col-6">
          <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Seats ({booking.seatNumbers?.length})</small>
          <div className="fw-bold text-dark" style={{ color: 'var(--cs-action-primary)' }}>
            {booking.seatNumbers?.join(', ')}
          </div>
        </div>
        <div className="col-6">
          <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Total Paid</small>
          <div className="fw-bold text-success fs-5">₹{booking.totalAmount?.toLocaleString('en-IN')}</div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailGrid;
