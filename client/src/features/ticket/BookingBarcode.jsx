import React from 'react';

const BookingBarcode = ({ bookingCode }) => {
  // A simple visual mock of a barcode using CSS since we don't have a barcode library installed
  // In a real app, this would use react-barcode or similar
  
  const generateMockBars = () => {
    // Generate a consistent pseudo-random pattern based on the bookingCode string
    let seed = 0;
    for (let i = 0; i < bookingCode.length; i++) {
      seed += bookingCode.charCodeAt(i);
    }
    
    const bars = [];
    let currentSeed = seed;
    
    // Generate ~40 bars
    for (let i = 0; i < 40; i++) {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      const width = 1 + (currentSeed % 4); // Width between 1px and 4px
      const margin = (currentSeed % 3); // Margin between 0px and 2px
      
      bars.push(
        <div 
          key={i} 
          style={{ 
            width: `${width}px`, 
            height: '60px', 
            backgroundColor: '#000',
            marginRight: `${margin}px`
          }} 
        />
      );
    }
    
    return bars;
  };

  return (
    <div className="d-flex flex-column align-items-center w-100">
      <div 
        className="d-flex justify-content-center w-100 mb-2 overflow-hidden px-2"
        role="img"
        aria-label={`Barcode for booking code ${bookingCode}`}
      >
        {generateMockBars()}
      </div>
      <div 
        className="fw-bold text-dark text-center" 
        style={{ letterSpacing: '3px', fontSize: '0.9rem', fontFamily: 'monospace' }}
      >
        {bookingCode.toUpperCase()}
      </div>
    </div>
  );
};

export default BookingBarcode;
