import React from 'react';

const SeatLegend = () => {
  const legendItems = [
    { label: 'Available', color: 'var(--cs-surface)', border: 'var(--cs-border)', textColor: 'var(--cs-text-primary)' },
    { label: 'Selected', color: 'var(--cs-accent)', border: 'var(--cs-accent)', textColor: 'var(--cs-text-on-accent)' },
    { label: 'Premium', color: 'var(--cs-accent-soft)', border: 'var(--cs-accent)', textColor: 'var(--cs-accent-active)' },
    { label: 'Booked', color: 'var(--cs-surface-muted)', border: 'transparent', textColor: 'var(--cs-text-secondary)', opacity: 0.5 }
  ];

  return (
    <div className="d-flex flex-wrap justify-content-center gap-4 mt-4 mb-2 p-3 cs-panel" role="region" aria-label="Seat Map Legend">
      {legendItems.map(item => (
        <div key={item.label} className="d-flex align-items-center gap-2">
          <div 
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              backgroundColor: item.color,
              border: `1px solid ${item.border}`,
              opacity: item.opacity || 1
            }}
            aria-hidden="true"
          />
          <span className="small fw-bold text-muted">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default SeatLegend;
