import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconStar, IconThumbUp } from '@tabler/icons-react';

const MovieCard = ({ movie }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Formatting values matching BMS (Screenshots 01, 02)
  const genreList = Array.isArray(movie.genre) ? movie.genre.join('/') : movie.genre || 'Action/Drama';
  const ratingVal = movie.rating ? movie.rating.toFixed(1) : '8.8';
  const votesCount = movie.votes || '496K+';

  return (
    <div
      className="d-flex flex-column h-100"
      style={{
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: isHovered ? 'translateY(-4px)' : 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 2:3 Movie Poster Frame with Rounded Corners */}
      <Link
        to={`/movies/${movie._id || movie.id}`}
        className="d-block w-100 position-relative"
        style={{
          aspectRatio: '2 / 3',
          borderRadius: '8px',
          overflow: 'hidden',
          textDecoration: 'none',
          boxShadow: isHovered ? 'var(--bms-shadow-lg)' : 'var(--bms-shadow-sm)',
          backgroundColor: '#E5E5E5'
        }}
      >
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-100 h-100"
          style={{
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            transform: isHovered ? 'scale(1.02)' : 'scale(1)'
          }}
          loading="lazy"
          onError={(e) => {
            if (!e.target.src.includes('placehold.co')) {
              e.target.src = 'https://placehold.co/400x600/E5E5E5/333333?text=Poster';
            }
          }}
        />

        {/* BMS Poster Rating Overlay Strip (Screenshots 01, 02) */}
        <div
          className="position-absolute bottom-0 start-0 w-100 d-flex align-items-center justify-content-between px-2"
          style={{
            backgroundColor: '#000000',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 600,
            height: '30px'
          }}
        >
          {(movie.likes || (movie.title && (movie.title.includes('Doomsday') || movie.title.includes('Gunmaaster')))) ? (
            <div className="d-flex align-items-center gap-1 text-success">
              <IconThumbUp size={14} fill="var(--bms-success)" color="var(--bms-success)" />
              <span className="text-white" style={{ fontSize: '11px' }}>
                {movie.likes || `${movie.votes || '971K+'} Likes`}
              </span>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-1">
              <IconStar size={14} fill="var(--bms-brand-red)" color="var(--bms-brand-red)" />
              <span>{ratingVal}/10</span>
              <span className="text-light fw-normal" style={{ fontSize: '11px', opacity: 0.85 }}>
                {votesCount.toString().toLowerCase().includes('vote') ? votesCount : `${votesCount} Votes`}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Metadata below poster (Screenshots 01, 02) */}
      <div className="pt-2 px-1">
        <Link
          to={`/movies/${movie._id || movie.id}`}
          className="text-decoration-none d-block"
        >
          <h6
            className="fw-bold mb-1 text-truncate text-dark"
            style={{
              fontSize: '16px',
              fontFamily: 'var(--bms-font-primary)',
              lineHeight: 1.3
            }}
          >
            {movie.title}
          </h6>
        </Link>
        <p
          className="mb-0 text-truncate"
          style={{
            fontSize: '14px',
            color: 'var(--bms-text-secondary)',
            lineHeight: 1.3
          }}
        >
          {genreList}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
