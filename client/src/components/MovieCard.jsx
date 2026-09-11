import { Link } from 'react-router-dom';
import { FaStar, FaClock } from 'react-icons/fa';

const MovieCard = ({ movie }) => {
  return (
    <div className="col-6 col-md-4 col-lg-3 mb-4">
      <div className="card h-100 border-0 shadow-sm movie-card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div className="position-relative">
          <img
            src={movie.poster}
            alt={movie.title}
            className="card-img-top"
            style={{ height: '320px', objectFit: 'cover' }}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster'; }}
          />
          {movie.rating > 0 && (
            <span className="badge bg-dark position-absolute top-0 end-0 m-2 d-flex align-items-center gap-1"
              style={{ fontSize: '0.85rem' }}>
              <FaStar className="text-warning" /> {movie.rating.toFixed(1)}
            </span>
          )}
          {movie.status === 'coming-soon' && (
            <span className="badge bg-info position-absolute top-0 start-0 m-2">Coming Soon</span>
          )}
        </div>
        <div className="card-body p-3">
          <h6 className="card-title fw-bold mb-1 text-truncate">{movie.title}</h6>
          <p className="text-muted small mb-1">
            {movie.genre?.join(' • ')}
          </p>
          <div className="d-flex justify-content-between align-items-center text-muted small mb-2">
            <span>{movie.language}</span>
            <span className="d-flex align-items-center gap-1">
              <FaClock size={12} /> {movie.duration}
            </span>
          </div>
          {movie.status === 'now-showing' ? (
            <Link to={`/movies/${movie._id}`} className="btn btn-warning btn-sm w-100 fw-bold">
              Book Now
            </Link>
          ) : (
            <button className="btn btn-outline-secondary btn-sm w-100" disabled>
              Coming Soon
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
