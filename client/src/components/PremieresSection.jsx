import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlayerPlayFilled
} from '@tabler/icons-react';
import { getPremiereMovies } from '../utils/premiereHelper';
import '../styles/home-sections.css';

const PremieresSection = ({ movies = [] }) => {
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Derive premiere movies from existing database records
  const premiereMovies = React.useMemo(() => {
    return getPremiereMovies(movies);
  }, [movies]);

  const updateScrollButtons = () => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = trackRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollButtons, { passive: true });
    }
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      if (el) el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [premiereMovies]);

  const handleScroll = (direction) => {
    if (!trackRef.current) return;
    const containerWidth = trackRef.current.clientWidth;
    const scrollAmount = direction === 'left' ? -containerWidth * 0.75 : containerWidth * 0.75;
    trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (!premiereMovies.length) {
    return (
      <section className="cb-premieres-band" id="premieres-section" style={{ minHeight: '120px' }}>
        <div className="cb-premieres-inner">
          <div className="cb-premiere-brand-row">
            <div className="cb-premiere-icon-badge" aria-hidden="true">
              <IconPlayerPlayFilled size={20} />
            </div>
            <div>
              <h2 className="cb-premiere-brand-title">PREMIERE</h2>
              <p className="cb-premiere-brand-sub">Watch new movies at home, every Friday</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cb-premieres-band" id="premieres-section">
      <div className="cb-premieres-inner">
        {/* Top Brand Banner Row */}
        <div className="cb-premiere-brand-row">
          <div className="cb-premiere-icon-badge" aria-hidden="true">
            <IconPlayerPlayFilled size={20} />
          </div>
          <div>
            <h2 className="cb-premiere-brand-title">PREMIERE</h2>
            <p className="cb-premiere-brand-sub">Watch new movies at home, every Friday</p>
          </div>
        </div>

        {/* Section Heading */}
        <div className="cb-premiere-heading-wrap">
          <h3 className="cb-premiere-heading">Premieres</h3>
          <p className="cb-premiere-subheading">Brand new releases every Friday</p>
        </div>

        {/* 5-Card Horizontal Carousel */}
        <div className="cb-carousel-container">
          {canScrollLeft && (
            <button
              type="button"
              className="cb-carousel-nav-btn prev"
              onClick={() => handleScroll('left')}
              aria-label="Scroll premieres left"
            >
              <IconChevronLeft size={22} stroke={2.5} />
            </button>
          )}

          <div className="cb-carousel-track" ref={trackRef}>
            {premiereMovies.map((movie) => {
              const movieId = movie._id || movie.id;
              const posterSrc = movie.posterUrl || movie.poster || '/img/popcorn.jpg';
              const languageText =
                movie.languages?.[0] ||
                movie.language ||
                (Array.isArray(movie.languages) && movie.languages.length > 0 ? movie.languages[0] : 'English');

              return (
                <div
                  key={movieId || movie.slug || movie.title}
                  className="cb-carousel-card"
                  onClick={() => navigate(`/premiere/${movieId}`)}
                >
                  {/* Poster Wrapper */}
                  <div className="cb-premiere-poster-box">
                    <img
                      src={posterSrc}
                      alt={movie.title}
                      className="cb-premiere-poster-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/img/popcorn.jpg';
                      }}
                    />
                    {/* Flush Bottom-Left PREMIERE Ribbon */}
                    <span className="cb-premiere-ribbon">PREMIERE</span>
                  </div>

                  {/* Metadata Below Poster */}
                  <div className="cb-premiere-meta">
                    <h4 className="cb-premiere-title" title={movie.title}>
                      {movie.title}
                    </h4>
                    <p className="cb-premiere-lang">{languageText}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {canScrollRight && (
            <button
              type="button"
              className="cb-carousel-nav-btn next"
              onClick={() => handleScroll('right')}
              aria-label="Scroll premieres right"
            >
              <IconChevronRight size={22} stroke={2.5} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default PremieresSection;
