import { Link } from 'react-router-dom';
import { FaStar, FaClock } from 'react-icons/fa';

const MovieCard = ({ movie }) => {
  return (
    <div className="col-6 col-md-4 col-lg-3 mb-4">
      <div className="movie-card">
        <Link to={`/movies/${movie._id}`} style={{ textDecoration: 'none' }}>
          <img
            src={movie.poster}
            alt={`Poster for ${movie.title}`}
            className="w-100"
            style={{ aspectRatio: '2/3', objectFit: 'cover' }}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster'; }}
          />
        </Link>
        <div className="p-3">
          <h6 className="fw-bold mb-1 text-truncate" style={{ color: 'var(--cs-text-primary)' }}>{movie.title}</h6>
          <div className="text-muted small mb-3">
            {movie.genre?.[0]} · {movie.language}
            <br />
            {movie.duration} {movie.rating > 0 && `· ★ ${movie.rating.toFixed(1)}`}
          </div>
          
          {movie.status === 'now-showing' ? (
            <Link to={`/movies/${movie._id}`} className="cs-button-primary w-100 text-decoration-none">
              Book tickets
            </Link>
          ) : (
            <button className="cs-button-secondary w-100" disabled style={{ background: 'transparent' }}>
              Coming Soon
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
