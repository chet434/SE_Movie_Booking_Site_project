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
        <div key={theatre._id} className="card border-0 shadow-sm mb-3" style={{ borderRadius: '12px' }}>
          <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 className="fw-bold mb-0">{theatre.name}</h6>
                <small className="text-muted">
                  <FaMapMarkerAlt className="me-1" />{theatre.address}, {theatre.location}
                </small>
              </div>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {shows.map(show => (
                <button
                  key={show._id}
                  className="btn btn-outline-success btn-sm position-relative"
                  style={{ borderRadius: '8px', minWidth: '100px' }}
                  onClick={() => navigate(`/seat-selection/${show._id}`)}
                >
                  <div className="fw-bold">{show.startTime}</div>
                  <div style={{ fontSize: '0.7rem' }}>{show.format} • {show.screenName}</div>
                  <div style={{ fontSize: '0.65rem' }} className="text-muted">
                    <FaChair size={10} className="me-1" />{show.availableSeats} seats
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
