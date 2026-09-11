import React from 'react';

const ScreenMarker = () => {
  return (
    <div className="d-flex flex-column align-items-center mb-5" aria-hidden="true">
      <div 
        style={{
          width: '80%',
          maxWidth: '400px',
          height: '16px',
          borderTopLeftRadius: '50% 100%',
          borderTopRightRadius: '50% 100%',
          backgroundColor: 'var(--cs-accent-soft)',
          borderTop: '2px solid var(--cs-accent)'
        }}
      />
      <span className="text-muted small fw-bold mt-2" style={{ letterSpacing: '2px' }}>SCREEN THIS WAY</span>
    </div>
  );
};

export default ScreenMarker;
