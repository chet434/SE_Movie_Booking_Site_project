import '../styles/seats.css';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SEATS_PER_ROW = 8;
const REGULAR_ROWS = ['A', 'B', 'C'];

const SeatLayout = ({ bookedSeats, selectedSeats, onSeatClick, seatPrices }) => {
  const getSeatClass = (seatId) => {
    if (bookedSeats.includes(seatId)) return 'seat booked';
    if (selectedSeats.includes(seatId)) return 'seat selected';
    if (REGULAR_ROWS.includes(seatId.charAt(0))) return 'seat available regular';
    return 'seat available premium';
  };

  return (
    <div className="seat-layout-container">
      {/* Screen */}
      <div className="screen-container">
        <div className="screen">SCREEN</div>
      </div>

      {/* Seat Grid */}
      <div className="seat-grid">
        {ROWS.map((row, rowIndex) => (
          <div key={row}>
            {rowIndex === 3 && (
              <div className="seat-divider">
                <span className="divider-label">Premium — ₹{seatPrices?.premium || 250}</span>
              </div>
            )}
            {rowIndex === 0 && (
              <div className="seat-section-label">
                <span className="divider-label">Regular — ₹{seatPrices?.regular || 150}</span>
              </div>
            )}
            <div className="seat-row">
              <span className="row-label">{row}</span>
              {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
                const seatId = `${row}${i + 1}`;
                const isBooked = bookedSeats.includes(seatId);
                return (
                  <button
                    key={seatId}
                    className={getSeatClass(seatId)}
                    onClick={() => !isBooked && onSeatClick(seatId)}
                    disabled={isBooked}
                    title={seatId}
                  >
                    {i + 1}
                  </button>
                );
              })}
              <span className="row-label">{row}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="seat-legend">
        <div className="legend-item">
          <div className="legend-box available regular"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-box selected"></div>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="legend-box booked"></div>
          <span>Booked</span>
        </div>
        <div className="legend-item">
          <div className="legend-box available premium"></div>
          <span>Premium</span>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;
