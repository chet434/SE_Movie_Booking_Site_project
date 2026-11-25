import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  IconChevronLeft,
  IconChevronRight,
  IconStack2
} from '@tabler/icons-react';
import { musicStudioEvents } from '../data/musicStudioEvents';
import '../styles/home-sections.css';

const MusicStudioSection = () => {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const navigate = useNavigate();

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
  }, []);

  const handleScroll = (direction) => {
    if (!trackRef.current) return;
    const containerWidth = trackRef.current.clientWidth;
    const scrollAmount = direction === 'left' ? -containerWidth * 0.75 : containerWidth * 0.75;
    trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="cb-music-studio-section" id="music-studio">
      <div className="cb-music-studio-inner">
        {/* Header Row */}
        <div className="cb-music-studio-header">
          <h3 className="cb-music-studio-title">Your Music Studio</h3>
          <Link to="/movies" className="cb-music-studio-see-all">
            <span>See All</span>
            <span aria-hidden="true">&rsaquo;</span>
          </Link>
        </div>

        {/* 5-Card Horizontal Carousel */}
        <div className="cb-carousel-container">
          {canScrollLeft && (
            <button
              type="button"
              className="cb-carousel-nav-btn prev"
              onClick={() => handleScroll('left')}
              aria-label="Scroll music events left"
            >
              <IconChevronLeft size={22} stroke={2.5} />
            </button>
          )}

          <div className="cb-carousel-track" ref={trackRef}>
            {musicStudioEvents.map((event) => {
              const showHtmlMultiBadge =
                event.venue === 'Multiple Venues' &&
                !event.poster.includes('etgq32rofi');

              return (
                <div
                  key={event.id}
                  className="cb-carousel-card"
                  onClick={() => navigate(`/events/${event.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  {/* Poster Wrapper */}
                  <div className="cb-music-poster-box">
                    <img
                      src={event.poster}
                      alt={event.title}
                      className="cb-music-poster-img"
                      loading="lazy"
                      style={
                        event.isLandscapeFallback
                          ? { objectFit: 'cover', objectPosition: 'center' }
                          : { objectFit: 'cover', objectPosition: 'center bottom' }
                      }
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = event.banner || '/img/popcorn.jpg';
                      }}
                    />

                    {/* Top-Left Multi-Venue Badge (rendered if not already baked into image) */}
                    {showHtmlMultiBadge && (
                      <div className="cb-music-multi-badge" title="Multiple venues available">
                        <IconStack2 size={15} stroke={2.2} />
                      </div>
                    )}

                    {/* Solid Black Bottom Date Strip (rendered when not baked-in) */}
                    {!event.hasBakedDateBar && (
                      <div className="cb-music-date-strip">
                        {event.dateLabel}
                      </div>
                    )}
                  </div>

                  {/* Metadata Below Poster */}
                  <div className="cb-music-meta">
                    <h4 className="cb-music-title" title={event.title}>
                      {event.title}
                    </h4>
                    <p className="cb-music-venue" title={event.venue}>
                      {event.venue}
                    </p>
                    <p className="cb-music-category">{event.category}</p>
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
              aria-label="Scroll music events right"
            >
              <IconChevronRight size={22} stroke={2.5} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default MusicStudioSection;
