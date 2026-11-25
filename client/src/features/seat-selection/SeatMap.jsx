import React from 'react';
import SeatButton from './SeatButton';
import ScreenMarker from './ScreenMarker';
import SeatLegend from './SeatLegend';

const RECLINER_ROWS = ['R'];
const SOFA_ROWS = ['A', 'B'];
const DIAMOND_ROWS = ['C', 'D', 'E', 'F', 'G', 'H'];
const GOLD_ROWS = ['I', 'J', 'K', 'L', 'M'];

const ALL_ROWS = [
  { name: 'R', tier: '₹399 RECLINER', price: 399, count: 10 },
  { name: 'A', tier: '₹299 SOFA SLIDER', price: 299, count: 12 },
  { name: 'B', tier: '', price: 299, count: 12 },
  { name: 'C', tier: '₹199 DIAMOND', price: 199, count: 14 },
  { name: 'D', tier: '', price: 199, count: 14 },
  { name: 'E', tier: '', price: 199, count: 14 },
  { name: 'F', tier: '', price: 199, count: 14 },
  { name: 'G', tier: '', price: 199, count: 14 },
  { name: 'H', tier: '', price: 199, count: 14 },
  { name: 'I', tier: '₹149 GOLD', price: 149, count: 14 },
  { name: 'J', tier: '', price: 149, count: 14 },
  { name: 'K', tier: '', price: 149, count: 14 }
];

const SeatMap = ({ bookedSeatIds = [], selectedSeatIds = [], onToggleSeat, seatPrices }) => {
  const getSeatState = (seatId) => {
    if (bookedSeatIds.includes(seatId)) return 'booked';
    if (selectedSeatIds.includes(seatId)) return 'selected';
    return 'available';
  };

  const getSeatPrice = (seatId) => {
    const row = seatId.charAt(0);
    if (RECLINER_ROWS.includes(row)) return 399;
    if (SOFA_ROWS.includes(row)) return 299;
    if (DIAMOND_ROWS.includes(row)) return 199;
    return 149;
  };

  return (
    <div className="w-100 py-3 d-flex flex-column align-items-center bg-white rounded-3 p-3 p-md-4 border shadow-sm">
      <div className="overflow-auto w-100 d-flex flex-column align-items-center" style={{ minWidth: '320px' }}>
        {ALL_ROWS.map((rowObj) => (
          <React.Fragment key={rowObj.name}>
            {/* BMS Tier Header Line (Screenshot 23) */}
            {rowObj.tier && (
              <div
                className="w-100 text-center my-3 py-1 border-bottom"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#777777',
                  letterSpacing: '1px'
                }}
              >
                {rowObj.tier}
              </div>
            )}

            {/* Row with Seats */}
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="fw-bold text-muted small" style={{ width: '20px', textAlign: 'right' }}>
                {rowObj.name}
              </span>

              <div className="d-flex gap-1 gap-sm-2">
                {Array.from({ length: rowObj.count }, (_, i) => {
                  const seatNumber = (i + 1).toString().padStart(2, '0');
                  const seatId = `${rowObj.name}${seatNumber}`;
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

              <span className="fw-bold text-muted small" style={{ width: '20px' }}>
                {rowObj.name}
              </span>
            </div>
          </React.Fragment>
        ))}

        {/* BMS Curved Screen Marker at the bottom */}
        <ScreenMarker />
      </div>

      <SeatLegend />
    </div>
  );
};

export default SeatMap;
