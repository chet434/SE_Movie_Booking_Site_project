import React from 'react';

const TicketSeparator = () => {
  return (
    <div className="cb-ticket-perforation position-relative w-100" style={{ height: '28px' }}>
      {/* Left circular notch cut out */}
      <div className="cb-ticket-notch-left" />
      {/* Dashed tear line */}
      <div className="cb-ticket-tear-line" />
      {/* Right circular notch cut out */}
      <div className="cb-ticket-notch-right" />
    </div>
  );
};

export default TicketSeparator;
