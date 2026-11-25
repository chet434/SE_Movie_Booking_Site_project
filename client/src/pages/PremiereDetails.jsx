import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovieById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  isMovieUnlocked,
  saveToStreamLibrary
} from '../utils/premiereHelper';
import {
  IconPlayerPlayFilled,
  IconShare,
  IconCheck,
  IconX,
  IconDeviceTv,
  IconVolume,
  IconBadge4k,
  IconSparkles
} from '@tabler/icons-react';
import '../styles/premiere-details.css';

// Helper to extract clean initials from a full name
const getInitials = (name = '') => {
  if (!name) return 'CB';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Convert standard YouTube watch URLs to embed URLs
const getEmbedUrl = (url = '') => {
  if (!url) return '';
  if (url.includes('embed/')) return url;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&rel=0`;
  }
  return url;
};

const PremiereDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Modals & Popovers state
  const [showLanguagesModal, setShowLanguagesModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState('rent'); // 'rent' | 'buy'
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [unlockedItem, setUnlockedItem] = useState(null);

  // Fetch movie data from backend
  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await getMovieById(id);
        const movieData = res.data?.data || null;
        setMovie(movieData);

        if (movieData) {
          const defaultLang =
            movieData.languages?.[0] ||
            movieData.language ||
            'English';
          setSelectedLanguage(defaultLang);
        } else {
          setErrorMsg('Movie details not found.');
        }
      } catch (err) {
        console.error('Failed to load premiere movie details:', err);
        setErrorMsg(err.response?.data?.message || 'Unable to load movie details.');
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  // Sync unlocked stream status for logged-in user
  useEffect(() => {
    if (user && movie) {
      const unlocked = isMovieUnlocked(user._id, movie._id || movie.id);
      setUnlockedItem(unlocked);
    } else {
      setUnlockedItem(null);
    }

    const handleLibraryUpdate = () => {
      if (user && movie) {
        const unlocked = isMovieUnlocked(user._id, movie._id || movie.id);
        setUnlockedItem(unlocked);
      }
    };

    window.addEventListener('cinebook:stream-library-updated', handleLibraryUpdate);
    return () => {
      window.removeEventListener('cinebook:stream-library-updated', handleLibraryUpdate);
    };
  }, [user, movie]);

  // Handle Share link copy
  const handleShare = () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(window.location.href).catch(() => {});
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (e) {
      console.warn('Clipboard write fallback:', e);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Handle Rent or Buy CTA click
  const handleOpenCheckout = (plan) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setCheckoutPlan(plan);
    setShowCheckoutModal(true);
  };

  // Confirm payment & unlock streaming
  const handleConfirmPurchase = () => {
    if (!user || !movie) return;

    const streamItem = {
      id: movie._id || movie.id,
      movieId: movie._id || movie.id,
      title: movie.title,
      poster: movie.posterUrl || movie.poster || '/img/popcorn.jpg',
      backdrop: movie.backdrop || movie.backdropUrl || '',
      type: checkoutPlan,
      price: checkoutPlan === 'rent' ? 149 : 699,
      audioLanguage: selectedLanguage,
      purchasedAt: new Date().toISOString(),
      expiresAt:
        checkoutPlan === 'rent'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null
    };

    saveToStreamLibrary(user._id, streamItem);
    setUnlockedItem(streamItem);
    setShowCheckoutModal(false);
    setShowPlayerModal(true);
  };

  if (loading) {
    return (
      <div className="cb-premiere-page d-flex justify-content-center align-items-center" style={{ minHeight: '65vh' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading Premiere...</span>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="cb-premiere-page py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="container py-5">
          <h3 className="fw-bold text-dark mb-2">Movie Not Found</h3>
          <p className="text-muted mb-4">{errorMsg || 'The requested premiere could not be located.'}</p>
          <Link to="/" className="btn btn-danger px-4 py-2 rounded-2">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Safe Metadata Formatter
  const posterSrc = movie.posterUrl || movie.poster || '/img/popcorn.jpg';
  const backdropSrc = movie.backdrop || movie.backdropUrl || posterSrc;

  // Duration
  const durationDisplay =
    movie.duration ||
    (movie.durationMinutes ? `${Math.floor(movie.durationMinutes / 60)}h ${movie.durationMinutes % 60}m` : null);

  // Genres
  const genresList = movie.genres?.length
    ? movie.genres
    : (Array.isArray(movie.genre) ? movie.genre : (movie.genre ? [movie.genre] : []));
  const genreDisplay = genresList.join(', ');

  // Certificate
  const certificateDisplay = movie.certification || movie.certificate || 'UA';

  // Release date
  const releaseDateDisplay = movie.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  // Metadata Line 1 items (dot-separated)
  const metaLine1Parts = [durationDisplay, genreDisplay, certificateDisplay, releaseDateDisplay].filter(Boolean);

  // Languages list & audio count
  const allLanguages = movie.languages?.length
    ? movie.languages
    : (movie.language ? [movie.language] : ['English']);
  const primaryLanguage = allLanguages[0] || 'English';
  const audioCount = Math.max(1, allLanguages.length);

  return (
    <div className="cb-premiere-page">
      {/* ====================================================================
          1. FULL-WIDTH DARK HERO BANNER (#1A1A1A)
          ==================================================================== */}
      <section className="cb-premiere-hero">
        {/* Right Half Backdrop Layer */}
        <div className="cb-premiere-backdrop-layer">
          <img
            src={backdropSrc}
            alt={movie.title}
            className="cb-premiere-backdrop-img"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = posterSrc;
            }}
          />
        </div>

        {/* Multi-Stop Dark Gradient Fade Overlay */}
        <div className="cb-premiere-gradient-overlay" />

        {/* Centered Hero Container */}
        <div className="cb-premiere-hero-inner">
          {/* Top-Right Floating Share Button */}
          <button
            type="button"
            className={`cb-premiere-share-btn ${copied ? 'copied' : ''}`}
            onClick={handleShare}
            aria-label="Share movie link"
          >
            {copied ? (
              <>
                <IconCheck size={16} stroke={3} />
                <span>Link copied!</span>
              </>
            ) : (
              <>
                <IconShare size={16} />
                <span>Share</span>
              </>
            )}
          </button>

          {/* Two-Column Hero Content */}
          <div className="cb-premiere-hero-grid">
            {/* Left: Vertical Poster Card */}
            <div className="cb-premiere-poster-card">
              <img
                src={posterSrc}
                alt={movie.title}
                className="cb-premiere-poster-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/img/popcorn.jpg';
                }}
              />

              {/* Centered Translucent Dark Pill: Trailers */}
              <button
                type="button"
                className="cb-premiere-trailer-btn"
                onClick={() => setShowTrailerModal(true)}
              >
                <IconPlayerPlayFilled size={12} />
                <span>Trailers</span>
              </button>
            </div>

            {/* Right: Movie Details & Rent/Buy Controls */}
            <div className="cb-premiere-details-col">
              {/* Status Pills Row */}
              <div className="cb-premiere-pills-row">
                <div className="cb-premiere-status-pill">
                  <div className="cb-premiere-icon-circle">
                    <IconPlayerPlayFilled size={10} />
                  </div>
                  <span className="cb-premiere-pill-text">PREMIERE</span>
                </div>
                <div className="cb-premiere-subtle-pill">
                  Streaming Now
                </div>
              </div>

              {/* Title */}
              <h1 className="cb-premiere-title">{movie.title}</h1>

              {/* Metadata Line 1: Duration • Genre • Certificate • Release Date */}
              {metaLine1Parts.length > 0 && (
                <p className="cb-premiere-meta-line-1">
                  {metaLine1Parts.map((part, index) => (
                    <React.Fragment key={index}>
                      {part}
                      {index < metaLine1Parts.length - 1 && <span className="sep"> • </span>}
                    </React.Fragment>
                  ))}
                </p>
              )}

              {/* Metadata Line 2: 4K • Language • Audio & Subtitles */}
              <p className="cb-premiere-meta-line-2">
                4K • {primaryLanguage} • Languages:{' '}
                <span
                  className="cb-premiere-lang-trigger"
                  onClick={() => setShowLanguagesModal(true)}
                  role="button"
                  tabIndex={0}
                >
                  Audio({audioCount}), Subtitle(s)(1)
                </span>
              </p>

              {/* Primary CTA Buttons Row */}
              <div className="cb-premiere-actions-row">
                {unlockedItem ? (
                  <>
                    <button
                      type="button"
                      className="cb-premiere-btn-watch"
                      onClick={() => setShowPlayerModal(true)}
                    >
                      <IconPlayerPlayFilled size={18} />
                      <span>Watch Now</span>
                    </button>
                    <span className="cb-premiere-unlocked-badge">
                      <IconCheck size={16} stroke={2.5} />
                      {unlockedItem.type === 'rent' ? 'Rented — 48h access' : 'Purchased'}
                    </span>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="cb-premiere-btn-primary"
                      onClick={() => handleOpenCheckout('rent')}
                    >
                      Rent ₹149
                    </button>
                    <button
                      type="button"
                      className="cb-premiere-btn-primary"
                      onClick={() => handleOpenCheckout('buy')}
                    >
                      Buy ₹699
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. LIGHT CONTENT BODY: ABOUT, CAST & CREW
          ==================================================================== */}
      <section className="cb-premiere-body">
        <div className="cb-premiere-body-inner">
          <div className="cb-premiere-body-col">
            {/* About the movie */}
            <div className="mb-5">
              <h2 className="cb-premiere-section-heading">About the movie</h2>
              <p className="cb-premiere-description-text">{movie.description}</p>
            </div>

            {/* Cast Section */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="mb-5">
                <h3 className="cb-premiere-section-heading">Cast</h3>
                <div className="cb-premiere-people-row">
                  {movie.cast.map((actor, idx) => (
                    <div key={actor._id || idx} className="cb-premiere-person-card">
                      {/* Rounded-Square Image Frame (Initials Avatar) */}
                      <div className="cb-premiere-avatar-frame">
                        <span className="cb-premiere-avatar-initials">
                          {getInitials(actor.name)}
                        </span>
                      </div>
                      <h4 className="cb-premiere-person-name">{actor.name}</h4>
                      {actor.role && (
                        <p className="cb-premiere-person-role">as {actor.role}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Crew Section */}
            {movie.crew && movie.crew.length > 0 && (
              <div className="mb-4">
                <h3 className="cb-premiere-section-heading">Crew</h3>
                <div className="cb-premiere-people-row">
                  {movie.crew.map((member, idx) => (
                    <div key={member._id || idx} className="cb-premiere-person-card">
                      {/* Rounded-Square Image Frame (Initials Avatar) */}
                      <div className="cb-premiere-avatar-frame">
                        <span className="cb-premiere-avatar-initials">
                          {getInitials(member.name)}
                        </span>
                      </div>
                      <h4 className="cb-premiere-person-name">{member.name}</h4>
                      {member.role && (
                        <p className="cb-premiere-person-role">{member.role}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. INTERACTIVE MODALS
          ==================================================================== */}

      {/* Languages & Subtitles Modal */}
      {showLanguagesModal && (
        <div className="cb-premiere-modal-overlay" onClick={() => setShowLanguagesModal(false)}>
          <div className="cb-premiere-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cb-premiere-modal-header">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ fontSize: '18px' }}>
                <IconVolume size={20} color="#E53955" />
                Available Audio &amp; Subtitles
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowLanguagesModal(false)}
                aria-label="Close"
              />
            </div>
            <div className="cb-premiere-modal-body">
              <div className="mb-3">
                <div className="text-muted small fw-semibold text-uppercase mb-2">
                  Audio Streams ({audioCount})
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {allLanguages.map((lang, index) => (
                    <span
                      key={index}
                      className="badge bg-light text-dark border px-3 py-2 rounded-2 d-inline-flex align-items-center gap-1"
                      style={{ fontSize: '13px' }}
                    >
                      <IconCheck size={14} color="#149D4F" /> {lang} [Dolby Atmos 5.1]
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-muted small fw-semibold text-uppercase mb-2">
                  Subtitles (1)
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <span
                    className="badge bg-light text-dark border px-3 py-2 rounded-2 d-inline-flex align-items-center gap-1"
                    style={{ fontSize: '13px' }}
                  >
                    <IconCheck size={14} color="#149D4F" /> English [CC]
                  </span>
                </div>
              </div>
            </div>
            <div className="cb-premiere-modal-footer text-end">
              <button
                type="button"
                className="btn btn-secondary px-4 py-2 rounded-2"
                style={{ fontSize: '14px' }}
                onClick={() => setShowLanguagesModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rent / Buy Checkout Modal */}
      {showCheckoutModal && (
        <div className="cb-premiere-modal-overlay" onClick={() => setShowCheckoutModal(false)}>
          <div className="cb-premiere-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cb-premiere-modal-header">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ fontSize: '18px' }}>
                <IconDeviceTv size={20} color="#E53955" />
                Stream on CineBook Premiere
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowCheckoutModal(false)}
                aria-label="Close"
              />
            </div>

            <div className="cb-premiere-modal-body">
              {/* Movie Brief Card */}
              <div className="d-flex align-items-center gap-3 p-3 rounded-3 mb-3" style={{ background: '#F8F9FA', border: '1px solid #EEEEEE' }}>
                <img
                  src={posterSrc}
                  alt={movie.title}
                  style={{ width: '56px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                />
                <div>
                  <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '16px' }}>{movie.title}</h6>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-dark text-white rounded-1" style={{ fontSize: '10px' }}>4K UHD</span>
                    <span className="small text-muted">{primaryLanguage}</span>
                  </div>
                </div>
              </div>

              {/* Plan Picker */}
              <div className="mb-3">
                <label className="form-label fw-bold small text-dark mb-2">Select Streaming Option</label>
                <div className="d-flex flex-column gap-2">
                  <div
                    className="p-3 rounded-3 cursor-pointer d-flex align-items-center justify-content-between"
                    style={{
                      border: checkoutPlan === 'rent' ? '2px solid #E53955' : '1px solid #DDDDDD',
                      backgroundColor: checkoutPlan === 'rent' ? '#FFF5F6' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                    onClick={() => setCheckoutPlan('rent')}
                  >
                    <div>
                      <div className="fw-bold text-dark" style={{ fontSize: '15px' }}>Rent — ₹149</div>
                      <div className="small text-muted" style={{ fontSize: '12px' }}>
                        30 days to start watching, 48 hours to finish once started
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="plan"
                      checked={checkoutPlan === 'rent'}
                      onChange={() => setCheckoutPlan('rent')}
                      className="form-check-input"
                    />
                  </div>

                  <div
                    className="p-3 rounded-3 cursor-pointer d-flex align-items-center justify-content-between"
                    style={{
                      border: checkoutPlan === 'buy' ? '2px solid #E53955' : '1px solid #DDDDDD',
                      backgroundColor: checkoutPlan === 'buy' ? '#FFF5F6' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                    onClick={() => setCheckoutPlan('buy')}
                  >
                    <div>
                      <div className="fw-bold text-dark" style={{ fontSize: '15px' }}>Buy — ₹699</div>
                      <div className="small text-muted" style={{ fontSize: '12px' }}>
                        Watch anytime in your Stream Library. No expiration date.
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="plan"
                      checked={checkoutPlan === 'buy'}
                      onChange={() => setCheckoutPlan('buy')}
                      className="form-check-input"
                    />
                  </div>
                </div>
              </div>

              {/* Audio Language Selection */}
              <div>
                <label className="form-label fw-bold small text-dark mb-1">Preferred Audio Language</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  {allLanguages.map((lang, index) => (
                    <option key={index} value={lang}>{lang} (Dolby 5.1)</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="cb-premiere-modal-footer d-flex align-items-center justify-content-between">
              <div className="fw-bold text-dark" style={{ fontSize: '16px' }}>
                Total: ₹{checkoutPlan === 'rent' ? '149' : '699'}
              </div>
              <button
                type="button"
                className="cb-premiere-btn-primary"
                style={{ height: '42px', minWidth: '180px', fontSize: '14px' }}
                onClick={handleConfirmPurchase}
              >
                Confirm &amp; Pay ₹{checkoutPlan === 'rent' ? '149' : '699'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stream Video Player Modal (Unlocked "Watch Now") */}
      {showPlayerModal && (
        <div className="cb-premiere-modal-overlay" onClick={() => setShowPlayerModal(false)}>
          <div className="cb-premiere-video-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex align-items-center justify-content-between px-3 py-2 text-white" style={{ background: '#111111' }}>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-danger rounded-1" style={{ fontSize: '10px' }}>4K UHD STREAM</span>
                <span className="fw-semibold small">{movie.title}</span>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowPlayerModal(false)}
                aria-label="Close"
              />
            </div>

            <div className="cb-premiere-video-box">
              {movie.trailerUrl ? (
                <iframe
                  src={getEmbedUrl(movie.trailerUrl)}
                  title={movie.title}
                  className="cb-premiere-video-iframe"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white p-4">
                  <IconSparkles size={48} color="#E53955" className="mb-3" />
                  <h5 className="fw-bold">4K Stream Ready</h5>
                  <p className="text-secondary small mb-0 text-center" style={{ maxWidth: '420px' }}>
                    Your stream license is confirmed. Audio configured for {selectedLanguage || primaryLanguage}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trailer Modal */}
      {showTrailerModal && (
        <div className="cb-premiere-modal-overlay" onClick={() => setShowTrailerModal(false)}>
          <div className="cb-premiere-video-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex align-items-center justify-content-between px-3 py-2 text-white" style={{ background: '#111111' }}>
              <span className="fw-semibold small">Official Trailer — {movie.title}</span>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowTrailerModal(false)}
                aria-label="Close"
              />
            </div>

            <div className="cb-premiere-video-box">
              {movie.trailerUrl ? (
                <iframe
                  src={getEmbedUrl(movie.trailerUrl)}
                  title={movie.title}
                  className="cb-premiere-video-iframe"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white p-4">
                  <IconPlayerPlayFilled size={48} color="#E53955" className="mb-3" />
                  <h5 className="fw-bold">Official Trailer Coming Soon</h5>
                  <p className="text-secondary small mb-0">Check back shortly for the teaser release.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiereDetails;
