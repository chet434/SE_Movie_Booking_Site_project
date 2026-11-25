import React from 'react';

const BookingBarcode = ({ bookingCode, bookingId }) => {
  // Format reference as authentic CineBook pass code
  const rawCode = (bookingCode || bookingId || 'CB-000000').toUpperCase();
  const displayCode = rawCode.startsWith('CB-') || rawCode.startsWith('BMS')
    ? rawCode
    : (rawCode.length <= 10 ? rawCode : `CB-${rawCode.slice(-8)}`);
  const cleanCode = displayCode;

  // Generate a consistent pseudo-random pattern based on bookingCode string
  const generateMockBars = () => {
    let seed = 0;
    for (let i = 0; i < cleanCode.length; i++) {
      seed += cleanCode.charCodeAt(i);
    }

    const bars = [];
    let currentSeed = seed;

    for (let i = 0; i < 48; i++) {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      const width = 1 + (currentSeed % 3);
      const margin = (currentSeed % 2) + 1;

      bars.push(
        <div
          key={i}
          style={{
            width: `${width}px`,
            height: '44px',
            backgroundColor: '#0F1117',
            marginRight: `${margin}px`
          }}
        />
      );
    }

    return bars;
  };

  return (
    <div className="w-100">
      {/* High-Contrast Scannable Barcode & QR Box */}
      <div
        className="cb-barcode-wrap d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 w-100"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '14px 18px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* QR Code SVG */}
        <div
          className="d-flex flex-column align-items-center justify-content-center p-1 bg-white"
          style={{ width: '74px', height: '74px', flexShrink: 0 }}
        >
          <svg viewBox="0 0 24 24" width="66" height="66" fill="#0F1117">
            {/* Corner position markers */}
            <path d="M2 2h7v7H2V2zm2 2v3h3V4H4zm11-2h7v7h-7V2zm2 2v3h3V4h-3zM2 15h7v7H2v-7zm2 2v3h3v-3H4z" />
            <path d="M5 5h1v1H5V5zm14 0h1v1h-1V5zM5 18h1v1H5v-1z" />
            {/* Dynamic data dots */}
            <path d="M11 2h2v4h-2zm0 6h2v2h-2zm2 2h2v2h-2zm-2 2h2v2h-2zm4-2h2v2h-2zm2 2h2v2h-2zm-6 4h2v2h-2zm4 0h2v2h-2zm2 2h2v2h-2zm-4 2h2v2h-2zm-6-2h2v4h-2zm12-4h2v6h-2z" />
          </svg>
        </div>

        {/* Linear Barcode */}
        <div className="d-flex flex-column align-items-center align-items-sm-end flex-grow-1 min-w-0">
          <div
            className="d-flex justify-content-center justify-content-sm-end w-100 overflow-hidden"
            role="img"
            aria-label={`Barcode for booking code ${displayCode}`}
          >
            {generateMockBars()}
          </div>
          <div
            className="fw-bold mt-1.5 font-monospace text-dark text-center text-sm-end"
            style={{
              letterSpacing: '2px',
              fontSize: '12px'
            }}
          >
            {displayCode}
          </div>
          <span className="small text-muted text-uppercase text-center text-sm-end" style={{ fontSize: '9px', letterSpacing: '0.8px' }}>
            SCAN AT AUDITORIUM TURNSTILE
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookingBarcode;
