import React from 'react';

// Using inline styles or classes depending on seat states
const SeatButton = ({ seat, state, onClick, price }) => {
  // state can be: 'available', 'premium', 'selected', 'booked'
  
  let backgroundColor = 'var(--cs-surface)';
  let color = 'var(--cs-text-primary)';
  let borderColor = 'var(--cs-border)';
  
  if (state === 'booked') {
    backgroundColor = 'var(--cs-surface-muted)';
    color = 'var(--cs-text-secondary)';
    borderColor = 'transparent';
  } else if (state === 'selected') {
    backgroundColor = 'var(--cs-accent)';
    color = 'var(--cs-text-on-accent)';
    borderColor = 'var(--cs-accent)';
  } else if (state === 'premium') {
    backgroundColor = 'var(--cs-accent-soft)';
    color = 'var(--cs-accent-active)';
    borderColor = 'var(--cs-accent)';
  } else {
    // available (regular)
    backgroundColor = 'var(--cs-surface)';
    color = 'var(--cs-text-primary)';
    borderColor = 'var(--cs-border)';
  }

  const isBooked = state === 'booked';
  const isSelected = state === 'selected';

  return (
    <button
      type="button"
      className="d-flex align-items-center justify-content-center fw-bold"
      onClick={() => !isBooked && onClick(seat)}
      disabled={isBooked}
      aria-pressed={isSelected}
      aria-disabled={isBooked}
      aria-label={`Seat ${seat}, ${state}, Price ${price} Rupees`}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px', // Using 8px radius from FilmTIX
        backgroundColor,
        color,
        border: `1px solid ${borderColor}`,
        cursor: isBooked ? 'not-allowed' : 'pointer',
        opacity: isBooked ? 0.5 : 1,
        transition: 'all 0.2s ease',
        fontSize: '0.85rem'
      }}
      title={`Seat ${seat} - ₹${price}`}
    >
      {seat.replace(/[A-Z]/, '')}
      <span className="visually-hidden">{seat} ({state})</span>
    </button>
  );
};

export default SeatButton;
