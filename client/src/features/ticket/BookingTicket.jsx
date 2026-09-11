import React from 'react';
import TicketDetailGrid from './TicketDetailGrid';
import TicketSeparator from './TicketSeparator';
import BookingBarcode from './BookingBarcode';

const BookingTicket = ({ booking, printable = false }) => {
  if (!booking) return null;

  return (
    <div 
      className={`cs-panel overflow-hidden mx-auto ${printable ? 'printable-ticket' : ''}`}
      style={{ 
        maxWidth: '500px', 
        backgroundColor: 'white', // Ticket is usually white for printability and contrast
        color: '#1a1a1a', 
        fontFamily: "'Manrope', sans-serif" 
      }}
      id={printable ? "printable-ticket" : undefined}
    >
      {/* Ticket Header & Poster */}
      <div className="position-relative">
        <div 
          style={{ 
            height: '140px', 
            background: 'linear-gradient(to right, var(--cs-surface-muted), var(--cs-surface))',
            position: 'relative'
          }}
        >
          {booking.movie?.poster && (
            <div 
              className="position-absolute top-0 start-0 w-100 h-100" 
              style={{
                backgroundImage: `url(${booking.movie.poster})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.15
              }}
            />
          )}
        </div>
        
        <div className="position-absolute bottom-0 start-0 w-100 p-4 pb-3" style={{ background: 'linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))' }}>
          <h3 className="fw-bold mb-0 text-dark" style={{ textShadow: '0 2px 10px rgba(255,255,255,0.8)' }}>
            {booking.movie?.title}
          </h3>
        </div>
      </div>

      <div className="px-4 py-2">
        <TicketDetailGrid booking={booking} />
      </div>

      <TicketSeparator />

      <div className="px-4 py-4 d-flex flex-column align-items-center bg-light">
        <BookingBarcode bookingCode={booking.bookingId || booking._id} />
        
        <div className="mt-3 text-center">
          <span className={`badge ${booking.bookingStatus === 'confirmed' ? 'bg-success' : 'bg-danger'} fs-6`}>
            {booking.bookingStatus?.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookingTicket;
