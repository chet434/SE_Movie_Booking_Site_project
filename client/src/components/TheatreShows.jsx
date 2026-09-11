import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaChair } from 'react-icons/fa';

const TheatreShows = ({ theatreShows }) => {
  const navigate = useNavigate();

  if (!theatreShows || theatreShows.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        <p>No shows available for the selected filters.</p>
      </div>
    );
  }

  return (
    <div>
      {theatreShows.map(({ theatre, shows }) => (
        <div key={theatre._id} className="cs-panel mb-4">
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h3 className="fw-bold mb-1" style={{ fontSize: '18px' }}>{theatre.name}</h3>
                <small className="text-muted d-flex align-items-center gap-1">
                  <FaMapMarkerAlt />{theatre.address}, {theatre.location}
                </small>
              </div>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {shows.map(show => (
                <button
                  key={show._id}
                  className="btn"
                  style={{ 
                    borderRadius: 'var(--cs-radius-control)', 
                    border: '1px solid var(--cs-border)',
                    minHeight: '44px',
                    minWidth: '100px',
                    color: 'var(--cs-text-primary)'
                  }}
                  onClick={() => navigate(`/seat-selection/${show._id}`)}
                >
                  <div className="fw-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>{show.startTime}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)' }}>{show.format} • {show.screenName}</div>
                  <div style={{ fontSize: '0.7rem' }} className="text-muted mt-1">
                    <FaChair size={10} className="me-1" />{show.availableSeats}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TheatreShows;
