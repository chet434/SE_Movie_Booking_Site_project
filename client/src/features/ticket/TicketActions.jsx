import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconPrinter, IconCopy, IconCheck, IconHome } from '@tabler/icons-react';

const TicketActions = ({ bookingCode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="d-flex flex-column gap-3 mt-4 w-100 no-print" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div className="d-flex gap-3">
        <button 
          className="cs-button-secondary flex-fill d-flex align-items-center justify-content-center gap-2"
          onClick={() => window.print()}
          aria-label="Print ticket"
        >
          <IconPrinter size={20} />
          <span>Print ticket</span>
        </button>
        
        <button 
          className="btn flex-fill d-flex align-items-center justify-content-center gap-2"
          onClick={handleCopy}
          aria-label="Copy booking code"
          style={{ 
            backgroundColor: 'transparent',
            color: 'var(--cs-text-primary)',
            border: '1px solid transparent'
          }}
        >
          {copied ? <IconCheck size={20} className="text-success" /> : <IconCopy size={20} />}
          <span>{copied ? 'Copied!' : 'Copy code'}</span>
        </button>
      </div>

      <div className="d-flex justify-content-center mt-2">
        <Link 
          to="/my-bookings" 
          className="cs-button-secondary text-decoration-none px-4"
          aria-label="View all booking details"
        >
          View My Bookings
        </Link>
      </div>
    </div>
  );
};

export default TicketActions;
