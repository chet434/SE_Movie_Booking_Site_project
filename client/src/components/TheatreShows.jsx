import { useNavigate } from 'react-router-dom';
import {
  IconInfoCircle,
  IconHeart,
  IconSearch,
  IconArmchair,
  IconDeviceTv
} from '@tabler/icons-react';

const formatAddress = (addr, location) => {
  if (typeof addr === 'string' && addr.trim()) return addr.trim();
  if (addr && typeof addr === 'object') {
    const parts = [addr.line1, addr.line2, addr.city, addr.pincode].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
  }
  if (typeof location === 'string' && location.trim()) return location.trim();
  return '';
};

const TheatreShows = ({ theatreShows, movieId }) => {
  const navigate = useNavigate();

  if (!theatreShows || theatreShows.length === 0) {
    return (
      <div className="bg-white rounded-3 p-5 text-center my-4 border shadow-sm" role="status">
        <IconDeviceTv size={42} stroke={1.5} className="text-muted mb-3" />
        <h5 className="fw-bold text-dark mb-1">No Screenings Available</h5>
        <p className="text-muted small mb-0">
          There are currently no scheduled showtimes for this date. Please pick another date above.
        </p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column">
      {/* 1. BMS Filter Toolbar (Screenshot 21) */}
      <div
        className="bg-white border-bottom py-3 px-3 mb-4 rounded-2 d-flex flex-wrap align-items-center justify-content-between gap-3 shadow-sm"
      >
        {/* Dropdown Filters */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          {['Hindi - 3D', 'Price Range', 'Special Formats', 'Other Filters', 'Preferred Time', 'Sort By'].map((filterName, i) => (
            <button
              key={i}
              type="button"
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 bg-white text-dark border rounded-2 px-3 py-1"
              style={{ fontSize: '12px', borderColor: '#DDD' }}
            >
              <span>{filterName}</span>
              <span style={{ fontSize: '10px', color: '#666' }}>▾</span>
            </button>
          ))}
          <button type="button" className="btn btn-sm btn-light border p-1 rounded-circle">
            <IconSearch size={14} className="text-muted" />
          </button>
        </div>

        {/* Status Indicators & Toggles */}
        <div className="d-flex align-items-center gap-3 ms-auto small" style={{ fontSize: '11px' }}>
          <div className="d-flex align-items-center gap-1">
            <span className="rounded-circle d-inline-block" style={{ width: '8px', height: '8px', backgroundColor: 'var(--bms-success)' }} />
            <span className="text-muted fw-bold">AVAILABLE</span>
          </div>
          <div className="d-flex align-items-center gap-1">
            <span className="rounded-circle d-inline-block" style={{ width: '8px', height: '8px', backgroundColor: 'var(--bms-warning)' }} />
            <span className="text-muted fw-bold">FAST FILLING</span>
          </div>
        </div>
      </div>

      {/* 2. Theatre Listings (Screenshot 21) */}
      <div className="d-flex flex-column gap-3">
        {theatreShows.map(({ theatre, shows }) => {
          const sampleShow = shows?.[0];
          const isCancellable = shows?.some(s => s.isCancellable === true)
            ? true
            : Boolean(
                sampleShow?.isCancellable ?? sampleShow?.theatre?.cancellationAllowed ?? theatre?.cancellationAllowed
              );

          return (
            <div
              key={theatre?._id || theatre?.id || Math.random()}
              className="bg-white rounded-2 p-3 p-md-4 border shadow-sm"
            >
              {/* Theatre Info Row */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-2 mb-3 pb-2 border-bottom">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="text-danger">🏢</span>
                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '15px' }}>
                      {theatre?.name || 'Cinema Theatre'}
                    </h5>
                    <IconInfoCircle size={15} className="text-muted cursor-pointer" />
                  </div>
                  <div className="d-flex align-items-center gap-3 small text-muted">
                    <span style={{ fontSize: '12px', color: '#777777' }}>
                      {formatAddress(theatre?.address, theatre?.location) || theatre?.location || 'Cinema Venue'}
                    </span>
                    {isCancellable ? (
                      <div className="d-flex align-items-center gap-1" title="Cancellation allowed up to 2 hours before showtime (20% fee applies)">
                        <span className="rounded-circle d-inline-block bg-success" style={{ width: '6px', height: '6px' }} />
                        <span className="text-success fw-medium" style={{ fontSize: '11px' }}>Cancellation Available</span>
                        <span className="text-muted" style={{ fontSize: '10px' }}> (20% fee applies)</span>
                      </div>
                    ) : (
                      <span className="badge bg-light text-muted border px-2 py-0" style={{ fontSize: '10px' }}>
                        Non-cancellable
                      </span>
                    )}
                  </div>
                </div>

              {/* Favourite Heart */}
              <button
                type="button"
                className="btn btn-sm border-0 bg-transparent p-1 text-muted ms-auto"
                aria-label="Add to favorites"
              >
                <IconHeart size={20} />
              </button>
            </div>

            {/* Showtime Chips Grid (Screenshot 21) */}
            <div className="d-flex flex-wrap gap-3">
              {shows.map((show) => {
                const isFastFilling = show.availableSeats !== undefined && show.availableSeats < 25;
                const isSoldOut = show.availableSeats !== undefined && show.availableSeats === 0;

                return (
                  <button
                    key={show._id || show.id}
                    type="button"
                    disabled={isSoldOut}
                    className="btn text-center p-2 rounded-2 position-relative d-flex flex-column align-items-center justify-content-center"
                    style={{
                      minWidth: '120px',
                      backgroundColor: isSoldOut ? '#F5F5F7' : '#FFFFFF',
                      border: isSoldOut
                        ? '1px solid #E0E0E0'
                        : isFastFilling
                        ? '1px solid var(--bms-warning)'
                        : '1px solid var(--bms-success)',
                      color: isSoldOut
                        ? '#999999'
                        : isFastFilling
                        ? '#D97706'
                        : 'var(--bms-success)',
                      cursor: isSoldOut ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSoldOut) {
                        e.currentTarget.style.backgroundColor = isFastFilling
                          ? 'var(--bms-warning-soft)'
                          : 'var(--bms-success-soft)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSoldOut) {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.transform = 'none';
                      }
                    }}
                    onClick={() => {
                      if (!isSoldOut) {
                        const targetMovieId = movieId || show.movie?._id || show.movie;
                        navigate(`/movies/${targetMovieId}/seat-layout/${show._id || show.id}`);
                      }
                    }}
                  >
                    {/* Time */}
                    <span className="fw-bold" style={{ fontSize: '14px' }}>
                      {show.startTime}
                    </span>
                    {/* Screen / Format Tag */}
                    <span
                      className="text-uppercase text-muted"
                      style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.04em' }}
                    >
                      {show.screenName || show.screen?.name || show.format || 'Screen 1'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};

export default TheatreShows;
