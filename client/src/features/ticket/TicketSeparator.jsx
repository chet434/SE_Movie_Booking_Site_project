import React from 'react';

const TicketSeparator = () => {
  return (
    <div className="position-relative w-100" style={{ height: '32px' }}>
      <div 
        className="position-absolute w-100" 
        style={{ 
          top: '16px',
          borderTop: '2px dashed #e0e0e0', 
          zIndex: 1 
        }} 
      />
      
      {/* Left notch */}
      <div 
        className="position-absolute rounded-circle" 
        style={{
          width: '32px',
          height: '32px',
          left: '-16px',
          top: '0',
          backgroundColor: 'var(--cs-canvas)',
          boxShadow: 'inset -3px 0 5px rgba(0,0,0,0.05)',
          zIndex: 2
        }}
      />
      
      {/* Right notch */}
      <div 
        className="position-absolute rounded-circle" 
        style={{
          width: '32px',
          height: '32px',
          right: '-16px',
          top: '0',
          backgroundColor: 'var(--cs-canvas)',
          boxShadow: 'inset 3px 0 5px rgba(0,0,0,0.05)',
          zIndex: 2
        }}
      />
    </div>
  );
};

export default TicketSeparator;
