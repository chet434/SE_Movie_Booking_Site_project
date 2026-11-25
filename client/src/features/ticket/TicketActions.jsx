import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconPrinter, IconCopy, IconCheck, IconShare, IconTicket, IconMovie } from '@tabler/icons-react';

const TicketActions = ({ bookingCode }) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const rawCode = (bookingCode || '').toUpperCase();
  const displayCode = rawCode.startsWith('CB-') || rawCode.startsWith('BMS')
    ? rawCode
    : (rawCode.length <= 10 && rawCode.length > 0 ? rawCode : `CB-${rawCode.slice(-8)}`);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My CineBook Movie Ticket',
          text: `Check out my CineBook booking pass (${displayCode})!`,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div className="d-flex flex-column gap-3 mt-4 w-100 no-print" style={{ maxWidth: '460px', margin: '0 auto' }}>
      {/* Primary Action Buttons */}
      <div className="d-flex gap-2">
        <button
          type="button"
          className="cb-btn-primary flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5"
          onClick={() => window.print()}
          aria-label="Print digital ticket"
          style={{ fontSize: '14px' }}
        >
          <IconPrinter size={18} />
          <span>Print Ticket</span>
        </button>

        <button
          type="button"
          className="cb-btn-secondary flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5"
          onClick={handleCopy}
          aria-label="Copy booking reference code"
          style={{ fontSize: '14px' }}
        >
          {copied ? <IconCheck size={18} style={{ color: '#4ADE80' }} /> : <IconCopy size={18} />}
          <span>{copied ? 'Copied Code' : 'Copy Code'}</span>
        </button>

        <button
          type="button"
          className="cb-btn-secondary d-flex align-items-center justify-content-center p-2.5"
          onClick={handleShare}
          aria-label="Share ticket link"
          title="Share ticket"
          style={{ width: '44px', height: '44px', flexShrink: 0, color: 'var(--cb-text-primary)' }}
        >
          {shared ? <IconCheck size={18} style={{ color: '#4ADE80' }} /> : <IconShare size={18} />}
        </button>
      </div>

      {/* Secondary Navigation Links */}
      <div className="d-flex justify-content-center align-items-center gap-3 mt-2">
        <Link
          to="/my-bookings"
          className="text-decoration-none small fw-bold d-flex align-items-center gap-1.5"
          style={{ color: 'var(--cb-text-muted)', transition: 'color 150ms ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cb-accent-yellow)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--cb-text-muted)')}
        >
          <IconTicket size={16} style={{ color: 'var(--cb-accent-yellow)' }} />
          <span>View All My Bookings</span>
        </Link>

        <span className="text-muted opacity-50">•</span>

        <Link
          to="/"
          className="text-decoration-none small fw-bold d-flex align-items-center gap-1.5"
          style={{ color: 'var(--cb-text-muted)', transition: 'color 150ms ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cb-accent-yellow)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--cb-text-muted)')}
        >
          <IconMovie size={16} style={{ color: 'var(--cb-accent-yellow)' }} />
          <span>Explore More Movies</span>
        </Link>
      </div>
    </div>
  );
};

export default TicketActions;
