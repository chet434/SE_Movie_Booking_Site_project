import React from 'react';
import SeatButton from './SeatButton';
import ScreenMarker from './ScreenMarker';
import SeatLegend from './SeatLegend';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SEATS_PER_ROW = 8;
const REGULAR_ROWS = ['A', 'B', 'C'];

const SeatMap = ({ bookedSeatIds, selectedSeatIds, onToggleSeat, seatPrices }) => {
  const getSeatState = (seatId) => {
    if (bookedSeatIds.includes(seatId)) return 'booked';
    if (selectedSeatIds.includes(seatId)) return 'selected';
    if (REGULAR_ROWS.includes(seatId.charAt(0))) return 'available';
    return 'premium';
  };

  const getSeatPrice = (seatId) => {
    if (REGULAR_ROWS.includes(seatId.charAt(0))) return seatPrices?.regular || 150;
    return seatPrices?.premium || 250;
  };

  return (
    <div className="w-100 py-4 d-flex flex-column align-items-center">
      <ScreenMarker />
      
      <div 
        className="d-flex flex-column gap-3 mb-4" 
        role="group" 
        aria-label="Seat Map"
      >
        {ROWS.map((row, rowIndex) => (
          <React.Fragment key={row}>
            {rowIndex === 3 && (
              <div className="d-flex align-items-center my-2 opacity-75">
                <hr className="flex-grow-1 m-0" style={{ borderColor: 'var(--cs-border)' }} />
                <span className="mx-3 small fw-bold text-muted" style={{ letterSpacing: '1px' }}>
                  PREMIUM - ₹{seatPrices?.premium || 250}
                </span>
                <hr className="flex-grow-1 m-0" style={{ borderColor: 'var(--cs-border)' }} />
              </div>
            )}
            {rowIndex === 0 && (
              <div className="d-flex align-items-center mb-3 opacity-75">
                <hr className="flex-grow-1 m-0" style={{ borderColor: 'var(--cs-border)' }} />
                <span className="mx-3 small fw-bold text-muted" style={{ letterSpacing: '1px' }}>
                  REGULAR - ₹{seatPrices?.regular || 150}
                </span>
                <hr className="flex-grow-1 m-0" style={{ borderColor: 'var(--cs-border)' }} />
              </div>
            )}
            
            <div className="d-flex align-items-center gap-2 gap-sm-3">
              <span className="fw-bold text-muted" style={{ width: '20px', textAlign: 'right' }}>{row}</span>
              <div className="d-flex gap-2">
                {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
                  const seatId = `${row}${i + 1}`;
                  return (
                    <SeatButton
                      key={seatId}
                      seat={seatId}
                      state={getSeatState(seatId)}
                      price={getSeatPrice(seatId)}
                      onClick={onToggleSeat}
                    />
                  );
                })}
              </div>
              <span className="fw-bold text-muted" style={{ width: '20px' }}>{row}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      <SeatLegend />
    </div>
  );
};

export default SeatMap;
