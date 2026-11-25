import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { getMovies } from '../services/api';
import MovieCard from '../components/MovieCard';
import PremieresSection from '../components/PremieresSection';
import MusicStudioSection from '../components/MusicStudioSection';
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlayerPlayFilled,
  IconSparkles
} from '@tabler/icons-react';

// 3 Real Carousel Banners requested by user
const CAROUSEL_SLIDES = [
  {
    id: 1,
    image: '/banners/banner_stream.avif',
    alt: 'The Social Reckoning cinebook Stream',
    link: '#stream'
  },
  {
    id: 2,
    image: '/banners/banner_diljit.avif',
    alt: 'RuPay Aura India Tour Diljit Dosanjh Kolkata',
    link: '#events'
  },
  {
    id: 3,
    image: '/banners/banner_heartofthebeast.png',
    alt: 'Brad Pitt Heart of the Beast cinebook Stream',
    link: '#stream'
  }
];

// Continuous track for seamless, zero-blink infinite sliding (3-slide cycle)
// Sequence: C, A, B, C, A, B, C
const TRACK_ITEMS = [
  { ...CAROUSEL_SLIDES[2], trackKey: 'c0', slideIndex: 2 }, // Heart of the Beast (slot 0)
  { ...CAROUSEL_SLIDES[0], trackKey: 'a1', slideIndex: 0 }, // The Social Reckoning (slot 1) - INITIAL
  { ...CAROUSEL_SLIDES[1], trackKey: 'b2', slideIndex: 1 }, // Diljit Dosanjh (slot 2)
  { ...CAROUSEL_SLIDES[2], trackKey: 'c3', slideIndex: 2 }, // Heart of the Beast (slot 3)
  { ...CAROUSEL_SLIDES[0], trackKey: 'a4', slideIndex: 0 }, // The Social Reckoning (slot 4) - WRAP TARGET
  { ...CAROUSEL_SLIDES[1], trackKey: 'b5', slideIndex: 1 }, // Diljit Dosanjh (slot 5)
  { ...CAROUSEL_SLIDES[2], trackKey: 'c6', slideIndex: 2 }  // Heart of the Beast (slot 6)
];

// Live events categories (Official BookMyShow Illustrated Cards)
const LIVE_EVENTS = [
  {
    title: 'Comedy Shows',
    image: '/events/comedy_shows.png',
    link: '#events'
  },
  {
    title: 'Amusement Park',
    image: '/events/amusement_parks.png',
    link: '#events'
  },
  {
    title: 'Theatre Shows',
    image: '/events/theatre_shows.png',
    link: '#events'
  },
  {
    title: 'Music Shows',
    image: '/events/music_shows.png',
    link: '#events'
  },
  {
    title: 'Workshops & More',
    image: '/events/workshops.png',
    link: '#events'
  }
];

const Home = () => {
  const [searchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDot, setActiveDot] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [movieOffset, setMovieOffset] = useState(0);

  const trackRef = useRef(null);
  const trackIndexRef = useRef(1); // Start at slot 1 (Stream banner)
  const isAnimatingRef = useRef(false);
  const autoSlideTimerRef = useRef(null);

  const querySearch = searchParams.get('search') || '';

  useEffect(() => {
    fetchMoviesList();
  }, [querySearch]);

  // Re-align hash anchor once movies load and layout stabilizes
  useEffect(() => {
    if (window.location.hash && !loading) {
      const targetId = window.location.hash.slice(1);
      const el = document.getElementById(targetId);
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    }
  }, [loading]);

  const fetchMoviesList = async () => {
    try {
      setLoading(true);
      const res = await getMovies(querySearch ? { search: querySearch } : {});
      if (res.data?.data && Array.isArray(res.data.data)) {
        setMovies(res.data.data);
      } else if (Array.isArray(res.data)) {
        setMovies(res.data);
      } else {
        setMovies([]);
      }
    } catch (err) {
      console.error('Failed to fetch movies from database:', err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to calculate exact pixel X coordinate for slot index
  // Each slot has width W (min(1240, window.innerWidth - 32)) and gap 16px
  const getSlotStep = () => {
    const w = typeof window !== 'undefined' ? Math.min(1240, window.innerWidth - 32) : 1240;
    return w + 16;
  };

  const getTrackX = (idx) => - (idx * getSlotStep());

  // Initialize track position on mount and update on resize
  useEffect(() => {
    if (trackRef.current) {
      gsap.set(trackRef.current, { x: getTrackX(trackIndexRef.current) });
    }
    const handleResize = () => {
      if (trackRef.current && !isAnimatingRef.current) {
        gsap.set(trackRef.current, { x: getTrackX(trackIndexRef.current) });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // GSAP Silky Smooth Slide Next (Continuous Track, Zero-Blink)
  const slideNext = useCallback(() => {
    if (isAnimatingRef.current || !trackRef.current) return;
    isAnimatingRef.current = true;

    const nextIndex = trackIndexRef.current + 1;
    const targetDot = ((nextIndex - 1) % 3 + 3) % 3;
    setActiveDot(targetDot);

    gsap.killTweensOf(trackRef.current);
    gsap.to(trackRef.current, {
      x: getTrackX(nextIndex),
      duration: 0.85,
      ease: 'power2.inOut',
      onComplete: () => {
        // If we reached slot 4 (The Social Reckoning), wrap seamlessly to slot 1 (The Social Reckoning)
        if (nextIndex >= 4) {
          trackIndexRef.current = 1;
          gsap.set(trackRef.current, { x: getTrackX(1) });
        } else {
          trackIndexRef.current = nextIndex;
        }
        isAnimatingRef.current = false;
      }
    });
  }, []);

  // GSAP Silky Smooth Slide Prev (Continuous Track, Zero-Blink)
  const slidePrev = useCallback(() => {
    if (isAnimatingRef.current || !trackRef.current) return;
    isAnimatingRef.current = true;

    const prevIndex = trackIndexRef.current - 1;
    const targetDot = ((prevIndex - 1) % 3 + 3) % 3;
    setActiveDot(targetDot);

    gsap.killTweensOf(trackRef.current);
    gsap.to(trackRef.current, {
      x: getTrackX(prevIndex),
      duration: 0.85,
      ease: 'power2.inOut',
      onComplete: () => {
        // If we reached slot 0 (Heart of the Beast), wrap seamlessly to slot 3 (Heart of the Beast)
        if (prevIndex <= 0) {
          trackIndexRef.current = 3;
          gsap.set(trackRef.current, { x: getTrackX(3) });
        } else {
          trackIndexRef.current = prevIndex;
        }
        isAnimatingRef.current = false;
      }
    });
  }, []);

  // GSAP Automatic Sliding (4-second interval, pauses on hover)
  useEffect(() => {
    if (isHovered) {
      if (autoSlideTimerRef.current) clearInterval(autoSlideTimerRef.current);
      return;
    }

    autoSlideTimerRef.current = setInterval(() => {
      slideNext();
    }, 4000);

    return () => {
      if (autoSlideTimerRef.current) clearInterval(autoSlideTimerRef.current);
    };
  }, [isHovered, slideNext]);

  // Dot click handler
  const handleDotClick = (dotIdx) => {
    if (isAnimatingRef.current) return;
    if (dotIdx === activeDot) return;

    let targetIndex;
    if (dotIdx === 0) {
      targetIndex = trackIndexRef.current === 3 ? 4 : 1;
    } else if (dotIdx === 1) {
      targetIndex = 2;
    } else {
      targetIndex = 3;
    }

    isAnimatingRef.current = true;
    setActiveDot(dotIdx);
    gsap.killTweensOf(trackRef.current);
    gsap.to(trackRef.current, {
      x: getTrackX(targetIndex),
      duration: 0.85,
      ease: 'power2.inOut',
      onComplete: () => {
        if (targetIndex >= 4) {
          trackIndexRef.current = 1;
          gsap.set(trackRef.current, { x: getTrackX(1) });
        } else if (targetIndex <= 0) {
          trackIndexRef.current = 3;
          gsap.set(trackRef.current, { x: getTrackX(3) });
        } else {
          trackIndexRef.current = targetIndex;
        }
        isAnimatingRef.current = false;
      }
    });
  };

  return (
    <div style={{ backgroundColor: '#F5F5F7', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* ====================================================================
          1. BookMyShow Signature Hero Banner Carousel with GSAP Auto-Sliding
          Continuous track layout: zero-blink, silky smooth GPU transitions
          ==================================================================== */}
      <div
        className="position-relative w-100 overflow-hidden"
        style={{
          backgroundColor: '#EBEBEB',
          userSelect: 'none',
          height: 'calc(min(1240px, calc(100vw - 32px)) * 300 / 1240 + 36px)',
          minHeight: '220px',
          maxHeight: '336px'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Continuous Horizontal Track (Centers active slot at viewport 50%) */}
        <div
          ref={trackRef}
          className="d-flex align-items-center position-absolute top-0"
          style={{
            height: '100%',
            left: 'calc(50% - (min(1240px, calc(100vw - 32px)) / 2))',
            willChange: 'transform'
          }}
        >
          {TRACK_ITEMS.map((item, idx) => (
            <div
              key={item.trackKey}
              className="flex-shrink-0 cursor-pointer shadow"
              style={{
                width: 'min(1240px, calc(100vw - 32px))',
                height: 'calc(min(1240px, calc(100vw - 32px)) * 300 / 1240)',
                marginRight: '16px',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#000000'
              }}
              onClick={() => {
                if (idx < trackIndexRef.current) slidePrev();
                else if (idx > trackIndexRef.current) slideNext();
              }}
            >
              <img
                src={item.image}
                alt={item.alt}
                className="w-100 h-100"
                style={{ objectFit: 'contain', display: 'block' }}
                loading="eager"
              />
            </div>
          ))}
        </div>

        {/* Left Navigation Arrow Button - Positioned at the far end (User attachment 1) */}
        <button
          type="button"
          className="btn position-absolute top-50 translate-middle-y d-flex align-items-center justify-content-center text-white border-0"
          style={{
            left: '20px',
            width: '44px',
            height: '56px',
            borderRadius: '8px',
            backgroundColor: 'rgba(34, 34, 34, 0.75)',
            zIndex: 30,
            cursor: 'pointer'
          }}
          onClick={slidePrev}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.08, backgroundColor: 'rgba(20, 20, 20, 0.9)', duration: 0.2 })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, backgroundColor: 'rgba(34, 34, 34, 0.75)', duration: 0.2 })}
          aria-label="Previous Slide"
        >
          <IconChevronLeft size={24} stroke={2.5} />
        </button>

        {/* Right Navigation Arrow Button - Positioned at the far end (User attachment 3) */}
        <button
          type="button"
          className="btn position-absolute top-50 translate-middle-y d-flex align-items-center justify-content-center text-white border-0"
          style={{
            right: '20px',
            width: '44px',
            height: '56px',
            borderRadius: '8px',
            backgroundColor: 'rgba(34, 34, 34, 0.75)',
            zIndex: 30,
            cursor: 'pointer'
          }}
          onClick={slideNext}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.08, backgroundColor: 'rgba(20, 20, 20, 0.9)', duration: 0.2 })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, backgroundColor: 'rgba(34, 34, 34, 0.75)', duration: 0.2 })}
          aria-label="Next Slide"
        >
          <IconChevronRight size={24} stroke={2.5} />
        </button>

        {/* Bottom Dots Indicator - 3 Banners */}
        <div
          className="position-absolute bottom-0 start-50 translate-middle-x mb-2 d-flex align-items-center gap-2"
          style={{ zIndex: 30, paddingBottom: '4px' }}
        >
          {CAROUSEL_SLIDES.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              className="p-0 border-0"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: dotIdx === activeDot ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)',
                transition: 'background-color 0.3s ease, transform 0.3s ease',
                transform: dotIdx === activeDot ? 'scale(1.25)' : 'scale(1)',
                cursor: 'pointer'
              }}
              onClick={() => handleDotClick(dotIdx)}
              aria-label={`Slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ====================================================================
          2. Recommended Movies Section (Screenshot 01)
          ==================================================================== */}
      <div className="bms-container mt-4">
        <section className="mb-5">
          <div className="bms-section-header">
            <h3 className="bms-section-title mb-0" style={{ fontSize: '24px', fontWeight: 700, color: '#222222' }}>
              Recommended Movies
            </h3>
            <Link
              to="/movies"
              className="bms-see-all text-decoration-none"
              style={{ color: '#C41230', fontSize: '14px', fontWeight: 500 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              See All &rsaquo;
            </Link>
          </div>

          <div className="position-relative">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '260px' }}>
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Loading movies...</span>
                </div>
              </div>
            ) : movies.length === 0 ? (
              <div className="text-center py-5 text-muted" style={{ minHeight: '200px' }}>
                <p className="mb-0 fs-6">No movies currently available in database.</p>
              </div>
            ) : (
              <>
                {/* BMS Left Scroll Chevron */}
                {movieOffset > 0 && (
                  <button
                    type="button"
                    className="btn position-absolute top-50 translate-middle-y rounded-circle d-none d-lg-flex align-items-center justify-content-center text-white border-0 shadow"
                    style={{
                      left: '-16px',
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'rgba(51, 51, 51, 0.85)',
                      zIndex: 10,
                      transform: 'translateY(-70%)'
                    }}
                    onClick={() => setMovieOffset(prev => Math.max(0, prev - 1))}
                    aria-label="Scroll left"
                  >
                    <IconChevronLeft size={22} stroke={2} />
                  </button>
                )}

                <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-4">
                  {movies.slice(movieOffset, movieOffset + 5).map((movie) => (
                    <div key={movie._id || movie.id} className="col">
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>

                {/* BMS Right Scroll Chevron (Over the 5th card edge) */}
                {movieOffset + 5 < movies.length && (
                  <button
                    type="button"
                    className="btn position-absolute top-50 translate-middle-y rounded-circle d-none d-lg-flex align-items-center justify-content-center text-white border-0 shadow"
                    style={{
                      right: '-16px',
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'rgba(51, 51, 51, 0.85)',
                      zIndex: 10,
                      transform: 'translateY(-70%)'
                    }}
                    onClick={() => setMovieOffset(prev => Math.min(prev + 1, movies.length - 5))}
                    aria-label="Scroll right"
                  >
                    <IconChevronRight size={22} stroke={2} />
                  </button>
                )}
              </>
            )}
          </div>
        </section>

        {/* ====================================================================
            3. CineBook Stream Banner Strip (Matching user target screenshot)
            ==================================================================== */}
        <section className="mb-5" id="stream">
          <div
            className="rounded-2 p-3 p-md-4 d-flex flex-column flex-md-row align-items-center justify-content-between text-white"
            style={{
              backgroundColor: '#1E2433',
              backgroundImage: 'linear-gradient(90deg, #1D2332 0%, #252D40 100%)',
              borderRadius: '8px',
              padding: '20px 28px'
            }}
          >
            <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: '46px', height: '46px', backgroundColor: '#DC2646' }}
              >
                <IconPlayerPlayFilled size={20} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <img
                    src="/logo_dark.png"
                    alt="cinebook"
                    style={{ height: '24px', width: 'auto', objectFit: 'contain' }}
                  />
                  <span
                    className="fw-bold text-uppercase text-white"
                    style={{ letterSpacing: '2.5px', fontSize: '12px', marginLeft: '6px', opacity: 0.95 }}
                  >
                    STREAM
                  </span>
                </div>
                <h4 className="fw-bold mb-0" style={{ color: '#F5A623', fontSize: '18px', letterSpacing: '-0.2px' }}>
                  Endless Entertainment Anytime. Anywhere!
                </h4>
              </div>
            </div>

            <button
              type="button"
              className="btn text-white fw-semibold d-inline-flex align-items-center gap-1 px-4 py-2 rounded-2 flex-shrink-0 border-0"
              style={{
                backgroundColor: '#DC2646',
                fontSize: '13px',
                borderRadius: '6px',
                transition: 'opacity 0.2s ease, transform 0.15s ease'
              }}
              onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.04, duration: 0.15 })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.15 })}
              onClick={() => alert('cinebook Stream: Enjoy blockbusters anytime, anywhere!')}
            >
              <span>Explore Stream</span>
              <IconSparkles size={16} style={{ opacity: 0.95 }} />
            </button>
          </div>
        </section>

        {/* ====================================================================
            4. The Best Of Live Events (BookMyShow Official Collection Cards)
            ==================================================================== */}
        <section className="mb-5" id="events">
          <div className="bms-section-header mb-3">
            <h3 className="bms-section-title mb-0" style={{ fontSize: '24px', fontWeight: 700, color: '#222222' }}>
              The Best Of Live Events
            </h3>
          </div>

          <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-5 g-3">
            {LIVE_EVENTS.map((item, idx) => (
              <div key={idx} className="col">
                <div
                  className="rounded-3 overflow-hidden cursor-pointer shadow-sm position-relative"
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: '10px',
                    transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.14)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-100 h-100"
                    style={{
                      objectFit: 'cover',
                      display: 'block',
                      borderRadius: '10px'
                    }}
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ====================================================================
          5. Full-Width Dark "Premieres" Band
          ==================================================================== */}
      <PremieresSection movies={movies} />

      {/* ====================================================================
          6. Light-Background "Your Music Studio" Carousel
          ==================================================================== */}
      <MusicStudioSection movies={movies} />
    </div>
  );
};

export default Home;
