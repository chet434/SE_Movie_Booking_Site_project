import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocationContext, isSupportedCity } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { getMovies } from '../services/api';
import CinebookLogo from './CinebookLogo';
import ServiceUnavailableModal from './ServiceUnavailableModal';
import {
  IconHeadset,
  IconReceipt2,
  IconMail,
  IconX,
  IconCheck,
  IconBrandFacebook,
  IconBrandX,
  IconBrandInstagram,
  IconBrandYoutube,
  IconBrandPinterest,
  IconBrandLinkedin
} from '@tabler/icons-react';
import '../styles/footer.css';

const TOP_CITIES = [
  'Mumbai',
  'Delhi-NCR',
  'Chennai',
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Ahmedabad',
  'Kolkata',
  'Kochi'
];

const GENRES = [
  'Drama',
  'Action',
  'Thriller',
  'Romantic',
  'Adventure',
  'Horror',
  'Comedy',
  'Fantasy',
  'Musical',
  'Sci-Fi'
];

const LANGUAGES = [
  'English',
  'Hindi',
  'Telugu',
  'Tamil',
  'Odia',
  'Kannada',
  'Bengali',
  'Japanese'
];

const SPORTS = [
  'Running',
  'Bowling',
  'Mixed Martial Arts',
  'Basketball',
  'Cricket',
  'Horse Race',
  'Sailing',
  'Chess',
  'Cycling',
  'E Sports'
];

const COUNTRIES = ['Indonesia', 'Singapore', 'Sri Lanka', 'West Indies'];

const HELP_LINKS = [
  'About Us',
  'Contact Us',
  'Current Opening',
  'Press Release',
  'Press Coverage',
  'FAQs',
  'Terms and Conditions',
  'Privacy Policy'
];

const EXCLUSIVES = [
  'Lollapalooza India',
  'BookAChange',
  'Corporate Vouchers',
  'Gift Cards',
  'List My Show',
  'Offers',
  'Stream',
  'Trailers'
];

const Footer = () => {
  const { selectedLocation, setSelectedLocation, setUnavailableCity } = useLocationContext();
  const { isAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const activeCity = selectedLocation || 'Bhubaneswar';
  const [activeMovies, setActiveMovies] = useState([]);

  // Modals state
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [partnerForm, setPartnerForm] = useState({ name: '', email: '', eventType: 'Concert' });

  const [supportModalOpen, setSupportModalOpen] = useState(false);

  const [newsletterModalOpen, setNewsletterModalOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [unavailableService, setUnavailableService] = useState(null);

  const handleCloseUnavailable = useCallback(() => {
    setUnavailableService(null);
  }, []);

  // Fetch active movies once for directory links
  useEffect(() => {
    let isMounted = true;
    const fetchActiveMovies = async () => {
      try {
        const res = await getMovies({ limit: 15 });
        if (isMounted && res.data?.success && Array.isArray(res.data.data)) {
          setActiveMovies(res.data.data);
        }
      } catch {
        // Gracefully silent fallback
      }
    };
    fetchActiveMovies();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleResendBooking = () => {
    if (isAuthenticated) {
      navigate('/my-bookings');
    } else {
      openAuthModal('login');
    }
  };

  const handleCityCinemaClick = (city) => {
    if (!isSupportedCity(city)) {
      setUnavailableCity(city);
      return;
    }
    setSelectedLocation(city);
    navigate(`/explore/movies/${city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  };

  const handlePartnerSubmit = (e) => {
    e.preventDefault();
    setPartnerSubmitted(true);
    setTimeout(() => {
      setPartnerSubmitted(false);
      setPartnerModalOpen(false);
      setPartnerForm({ name: '', email: '', eventType: 'Concert' });
    }, 2000);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    setNewsletterSubmitted(true);
    setTimeout(() => {
      setNewsletterSubmitted(false);
      setNewsletterModalOpen(false);
      setNewsletterEmail('');
    }, 2000);
  };

  // Movie titles to display
  const displayMovies =
    activeMovies.length > 0
      ? activeMovies
      : [
          { _id: '1', title: 'Ramayana' },
          { _id: '2', title: 'Avengers: Doomsday' },
          { _id: '3', title: 'Godzilla Minus Zero' },
          { _id: '4', title: 'Gunmaaster G9' },
          { _id: '5', title: 'Kankana' },
          { _id: '6', title: 'Dune: Part Two' },
          { _id: '7', title: 'Oppenheimer' },
          { _id: '8', title: 'Spider-Man: Across the Spider-Verse' }
        ];

  return (
    <footer className="cb-footer" role="contentinfo">
      {/* ====================================================================
          BAND 1: Partner Strip ("List your Show") (#313035 Background)
          ==================================================================== */}
      <section className="cb-footer-partner-strip" aria-label="Partner with us">
        <div className="cb-footer-partner-inner">
          <div className="cb-footer-partner-left">
            <div className="cb-footer-partner-icon" aria-hidden="true">
              {/* White outline circus tent / stage booth icon */}
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 21V10l8-7 8 7v11" />
                <path d="M12 3v18" />
                <path d="M9 10a3 3 0 0 1 6 0" />
                <path d="M4 21h16" />
                <path d="M8 21v-4a4 4 0 0 1 8 0v4" />
              </svg>
            </div>
            <div>
              <span className="cb-footer-partner-title">List your Show</span>
              <span className="text-white opacity-50 mx-2">&bull;</span>
              <span className="cb-footer-partner-copy">
                Got a show, event, activity or a great experience? Partner with us &amp; get listed on cinebook
              </span>
            </div>
          </div>

          <button
            type="button"
            className="cb-footer-partner-btn"
            onClick={() => setPartnerModalOpen(true)}
          >
            Contact today!
          </button>
        </div>
      </section>

      {/* ====================================================================
          BAND 2: 3-Column Customer Utility Strip (#404043 Background)
          ==================================================================== */}
      <section className="cb-footer-utility-strip" aria-label="Customer Support and Services">
        <div className="cb-footer-utility-inner">
          {/* 1. 24/7 Customer Care */}
          <button
            type="button"
            className="cb-footer-utility-item"
            onClick={() => setSupportModalOpen(true)}
            aria-label="Open 24/7 customer care information"
          >
            <IconHeadset size={44} stroke={1.2} className="cb-footer-utility-icon" />
            <span className="cb-footer-utility-label">24/7 CUSTOMER CARE</span>
          </button>

          {/* 2. Resend Booking Confirmation */}
          <button
            type="button"
            className="cb-footer-utility-item"
            onClick={handleResendBooking}
            aria-label="Resend booking confirmation"
          >
            <IconReceipt2 size={44} stroke={1.2} className="cb-footer-utility-icon" />
            <span className="cb-footer-utility-label">RESEND BOOKING CONFIRMATION</span>
          </button>

          {/* 3. Subscribe to the Newsletter */}
          <button
            type="button"
            className="cb-footer-utility-item"
            onClick={() => setNewsletterModalOpen(true)}
            aria-label="Subscribe to the CineBook newsletter"
          >
            <IconMail size={44} stroke={1.2} className="cb-footer-utility-icon" />
            <span className="cb-footer-utility-label">SUBSCRIBE TO THE NEWSLETTER</span>
          </button>
        </div>
      </section>

      {/* ====================================================================
          BAND 3: Categorized Directory Links (#333338 Background)
          ==================================================================== */}
      <section className="cb-footer-main" aria-label="CineBook Directory">
        <div className="cb-footer-main-inner">
          {/* 1. Movies Now Showing in City */}
          <div className="cb-footer-dir-group">
            <h6 className="cb-footer-dir-title">
              MOVIES NOW SHOWING IN {activeCity.toUpperCase()}
            </h6>
            <div className="cb-footer-links-wrap">
              {displayMovies.map((movie, idx) => (
                <React.Fragment key={movie._id || idx}>
                  <Link
                    to={movie._id ? `/movie-details/${movie._id}` : '/movies'}
                    className="cb-footer-link"
                  >
                    {movie.title}
                  </Link>
                  {idx < displayMovies.length - 1 && (
                    <span className="cb-footer-divider">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 2. Upcoming Movies Per Week */}
          <div className="cb-footer-dir-group">
            <h6 className="cb-footer-dir-title">UPCOMING MOVIES PER WEEK</h6>
            <div className="cb-footer-links-wrap">
              {['Upcoming Movies Today', 'Upcoming Movies Tomorrow', 'Upcoming Movies This Weekend'].map((item, idx) => (
                <React.Fragment key={idx}>
                  <Link to="/movies?status=coming-soon" className="cb-footer-link">
                    {item}
                  </Link>
                  {idx < 2 && <span className="cb-footer-divider">|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 3. Movies By Genre */}
          <div className="cb-footer-dir-group">
            <h6 className="cb-footer-dir-title">MOVIES BY GENRE</h6>
            <div className="cb-footer-links-wrap">
              {GENRES.map((genre, idx) => (
                <React.Fragment key={idx}>
                  <Link
                    to={`/movies?genre=${encodeURIComponent(genre)}`}
                    className="cb-footer-link"
                  >
                    {genre} Movies
                  </Link>
                  {idx < GENRES.length - 1 && <span className="cb-footer-divider">|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 4. Movies By Language */}
          <div className="cb-footer-dir-group">
            <h6 className="cb-footer-dir-title">MOVIES BY LANGUAGE</h6>
            <div className="cb-footer-links-wrap">
              {LANGUAGES.map((lang, idx) => (
                <React.Fragment key={idx}>
                  <Link
                    to={`/movies?language=${encodeURIComponent(lang)}`}
                    className="cb-footer-link"
                  >
                    Movies in {lang}
                  </Link>
                  {idx < LANGUAGES.length - 1 && <span className="cb-footer-divider">|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 5. Sports Events */}
          <div className="cb-footer-dir-group">
            <h6 className="cb-footer-dir-title">
              SPORTS EVENTS IN {activeCity.toUpperCase()}
            </h6>
            <div className="cb-footer-links-wrap">
              {SPORTS.map((sport, idx) => (
                <React.Fragment key={idx}>
                  <button
                    type="button"
                    onClick={() => setUnavailableService('Sports')}
                    className="cb-footer-link"
                  >
                    {sport}
                  </button>
                  {idx < SPORTS.length - 1 && <span className="cb-footer-divider">|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 6. Events In Top Cities */}
          <div className="cb-footer-dir-group">
            <h6 className="cb-footer-dir-title">EVENTS IN TOP CITIES</h6>
            <div className="cb-footer-links-wrap">
              {TOP_CITIES.map((city, idx) => (
                <React.Fragment key={idx}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isSupportedCity(city)) {
                        setUnavailableCity(city);
                      } else {
                        navigate('/#music-studio');
                      }
                    }}
                    className="cb-footer-link"
                  >
                    Events in {city}
                  </button>
                  {idx < TOP_CITIES.length - 1 && <span className="cb-footer-divider">|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 7. Cinemas In Top Cities */}
          <div className="cb-footer-dir-group">
            <h6 className="cb-footer-dir-title">CINEMAS IN TOP CITIES</h6>
            <div className="cb-footer-links-wrap">
              {TOP_CITIES.map((city, idx) => (
                <React.Fragment key={idx}>
                  <button
                    type="button"
                    onClick={() => handleCityCinemaClick(city)}
                    className="cb-footer-link"
                  >
                    Cinemas in {city}
                  </button>
                  {idx < TOP_CITIES.length - 1 && <span className="cb-footer-divider">|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 8. Plays In Top Cities */}
          <div className="cb-footer-dir-group">
            <h6 className="cb-footer-dir-title">PLAYS IN TOP CITIES</h6>
            <div className="cb-footer-links-wrap">
              {TOP_CITIES.map((city, idx) => (
                <React.Fragment key={idx}>
                  <button
                    type="button"
                    onClick={() => setUnavailableService('Plays')}
                    className="cb-footer-link"
                  >
                    Plays in {city}
                  </button>
                  {idx < TOP_CITIES.length - 1 && <span className="cb-footer-divider">|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 9. Activities In Top Cities */}
          <div className="cb-footer-dir-group">
            <h6 className="cb-footer-dir-title">ACTIVITIES IN TOP CITIES</h6>
            <div className="cb-footer-links-wrap">
              {TOP_CITIES.map((city, idx) => (
                <React.Fragment key={idx}>
                  <button
                    type="button"
                    onClick={() => setUnavailableService('Activities')}
                    className="cb-footer-link"
                  >
                    Activities in {city}
                  </button>
                  {idx < TOP_CITIES.length - 1 && <span className="cb-footer-divider">|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 10. Movies Now Showing */}
          <div className="cb-footer-dir-group">
            <h6 className="cb-footer-dir-title">MOVIES NOW SHOWING</h6>
            <div className="cb-footer-links-wrap">
              {displayMovies.map((movie, idx) => (
                <React.Fragment key={movie._id || idx}>
                  <Link
                    to={movie._id ? `/movie-details/${movie._id}` : '/movies'}
                    className="cb-footer-link"
                  >
                    {movie.title}
                  </Link>
                  {idx < displayMovies.length - 1 && (
                    <span className="cb-footer-divider">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 11. Countries */}
          <div className="cb-footer-dir-group">
            <h6 className="cb-footer-dir-title">COUNTRIES</h6>
            <div className="cb-footer-links-wrap">
              {COUNTRIES.map((country, idx) => (
                <React.Fragment key={idx}>
                  <span className="cb-footer-link">{country}</span>
                  {idx < COUNTRIES.length - 1 && <span className="cb-footer-divider">|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 12. Help */}
          <div className="cb-footer-dir-group">
            <h6 className="cb-footer-dir-title">HELP</h6>
            <div className="cb-footer-links-wrap">
              {HELP_LINKS.map((item, idx) => (
                <React.Fragment key={idx}>
                  <button
                    type="button"
                    onClick={() => setSupportModalOpen(true)}
                    className="cb-footer-link"
                  >
                    {item}
                  </button>
                  {idx < HELP_LINKS.length - 1 && <span className="cb-footer-divider">|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 13. CineBook Exclusives */}
          <div className="cb-footer-dir-group">
            <h6 className="cb-footer-dir-title">CINEBOOK EXCLUSIVES</h6>
            <div className="cb-footer-links-wrap">
              {EXCLUSIVES.map((item, idx) => (
                <React.Fragment key={idx}>
                  {item === 'List My Show' ? (
                    <button
                      type="button"
                      onClick={() => setPartnerModalOpen(true)}
                      className="cb-footer-link"
                    >
                      {item}
                    </button>
                  ) : item === 'Stream' ? (
                    <Link
                      to="/#premieres-section"
                      className="cb-footer-link"
                      onClick={(e) => {
                        if (window.location.pathname === '/') {
                          e.preventDefault();
                          const el = document.getElementById('premieres-section');
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                          navigate('/#premieres-section');
                        }
                      }}
                    >
                      {item}
                    </Link>
                  ) : (
                    <Link to="/movies" className="cb-footer-link">
                      {item}
                    </Link>
                  )}
                  {idx < EXCLUSIVES.length - 1 && <span className="cb-footer-divider">|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* ================================================================
              BANDS 4, 5 & 6: Centered Logo Divider, Social Icons & Legal
              ================================================================ */}
          {/* Centered Logo Divider with Side Rules */}
          <div className="cb-footer-logo-row">
            <div className="cb-footer-rule" />
            <div className="cb-footer-logo-wrap">
              <Link to="/" aria-label="cinebook home">
                <CinebookLogo darkBg height={36} />
              </Link>
            </div>
            <div className="cb-footer-rule" />
          </div>

          {/* Social Media Row */}
          <div className="cb-footer-social-row" aria-label="Social media channels">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cb-footer-social-btn"
              aria-label="CineBook on Facebook"
            >
              <IconBrandFacebook size={18} stroke={1.8} />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cb-footer-social-btn"
              aria-label="CineBook on X"
            >
              <IconBrandX size={17} stroke={1.8} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cb-footer-social-btn"
              aria-label="CineBook on Instagram"
            >
              <IconBrandInstagram size={18} stroke={1.8} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cb-footer-social-btn"
              aria-label="CineBook on YouTube"
            >
              <IconBrandYoutube size={18} stroke={1.8} />
            </a>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cb-footer-social-btn"
              aria-label="CineBook on Pinterest"
            >
              <IconBrandPinterest size={18} stroke={1.8} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cb-footer-social-btn"
              aria-label="CineBook on LinkedIn"
            >
              <IconBrandLinkedin size={18} stroke={1.8} />
            </a>
          </div>

          {/* Copyright & Legal Notice */}
          <div className="cb-footer-legal-wrap">
            <p className="cb-footer-copyright">
              Copyright 2026 &copy; CineBook Entertainment Pvt. Ltd. All Rights Reserved.
            </p>
            <p className="cb-footer-disclaimer">
              The content and images used on this site are copyright protected and copyrights vests with the respective owners. The usage of the content and images on this website is intended to promote the works and no endorsement of the artist shall be implied. Unauthorized use is prohibited and punishable by law.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          MODAL 1: Partner Inquiry Form ("List your Show")
          ==================================================================== */}
      {partnerModalOpen && (
        <div
          className="cb-footer-modal-overlay"
          onClick={() => setPartnerModalOpen(false)}
        >
          <div
            className="cb-footer-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cb-footer-modal-header">
              <h3 className="cb-footer-modal-title">Partner with CineBook</h3>
              <button
                type="button"
                className="cb-footer-modal-close"
                onClick={() => setPartnerModalOpen(false)}
                aria-label="Close modal"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="cb-footer-modal-body">
              {partnerSubmitted ? (
                <div className="text-center py-4">
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center bg-success text-white mb-3"
                    style={{ width: '56px', height: '56px' }}
                  >
                    <IconCheck size={32} stroke={2.5} />
                  </div>
                  <h4 className="fw-bold mb-2">Inquiry Submitted!</h4>
                  <p className="text-muted small mb-0">
                    Thank you for reaching out. Our partnerships team will connect with you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePartnerSubmit}>
                  <p className="text-muted small mb-3">
                    List your movie, concert, theatrical play, or experience on India&apos;s leading entertainment platform.
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Rahul Sharma"
                      required
                      value={partnerForm.name}
                      onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Business Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. rahul@eventcompany.com"
                      required
                      value={partnerForm.email}
                      onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-secondary">
                      Event / Experience Type
                    </label>
                    <select
                      className="form-select"
                      value={partnerForm.eventType}
                      onChange={(e) => setPartnerForm({ ...partnerForm, eventType: e.target.value })}
                    >
                      <option value="Concert">Live Concert / Music Show</option>
                      <option value="Movie">Theatrical Movie Release</option>
                      <option value="Play">Theatre / Play / Drama</option>
                      <option value="Comedy">Standup Comedy</option>
                      <option value="Workshop">Workshop / Activity</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="btn w-100 text-white fw-bold py-2"
                    style={{ backgroundColor: '#EC5E71' }}
                  >
                    Submit Partner Request
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: 24/7 Customer Care / Help & Support
          ==================================================================== */}
      {supportModalOpen && (
        <div
          className="cb-footer-modal-overlay"
          onClick={() => setSupportModalOpen(false)}
        >
          <div
            className="cb-footer-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cb-footer-modal-header">
              <h3 className="cb-footer-modal-title">24/7 Help &amp; Support</h3>
              <button
                type="button"
                className="cb-footer-modal-close"
                onClick={() => setSupportModalOpen(false)}
                aria-label="Close modal"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="cb-footer-modal-body">
              <div className="d-flex flex-column gap-3">
                <div className="p-3 bg-light rounded-3 border">
                  <div className="fw-bold text-dark mb-1">Toll-Free Customer Care</div>
                  <div className="text-danger fw-bold" style={{ fontSize: '18px' }}>
                    1800-123-CINE (2463)
                  </div>
                  <div className="small text-muted mt-1">Available 24 hours a day, 7 days a week</div>
                </div>

                <div className="p-3 bg-light rounded-3 border">
                  <div className="fw-bold text-dark mb-1">Email Support</div>
                  <div className="text-dark fw-semibold">support@cinebook.com</div>
                  <div className="small text-muted mt-1">Typical response within 2 hours</div>
                </div>

                <div className="p-3 bg-light rounded-3 border">
                  <div className="fw-bold text-dark mb-1">Quick Help Topics</div>
                  <ul className="list-unstyled mb-0 small text-muted d-flex flex-column gap-1 mt-2">
                    <li>&bull; Rescheduling or cancelling cinema tickets</li>
                    <li>&bull; Missing M-Ticket QR confirmation</li>
                    <li>&bull; Payment refunds &amp; UPI resolution</li>
                    <li>&bull; Event entry age verification &amp; ID rules</li>
                  </ul>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary w-100 py-2"
                  onClick={() => setSupportModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: Newsletter Subscribe
          ==================================================================== */}
      {newsletterModalOpen && (
        <div
          className="cb-footer-modal-overlay"
          onClick={() => setNewsletterModalOpen(false)}
        >
          <div
            className="cb-footer-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cb-footer-modal-header">
              <h3 className="cb-footer-modal-title">Subscribe to CineBook Newsletter</h3>
              <button
                type="button"
                className="cb-footer-modal-close"
                onClick={() => setNewsletterModalOpen(false)}
                aria-label="Close modal"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="cb-footer-modal-body">
              {newsletterSubmitted ? (
                <div className="text-center py-4">
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center bg-success text-white mb-3"
                    style={{ width: '56px', height: '56px' }}
                  >
                    <IconCheck size={32} stroke={2.5} />
                  </div>
                  <h4 className="fw-bold mb-2">You&apos;re Subscribed!</h4>
                  <p className="text-muted small mb-0">
                    Get ready for weekly movie premieres, concert passes, and early-bird ticket alerts.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit}>
                  <p className="text-muted small mb-3">
                    Be the first to hear about big movie releases, concert announcements, and exclusive festival discounts.
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="yourname@example.com"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn w-100 text-white fw-bold py-2"
                    style={{ backgroundColor: '#EC5E71' }}
                  >
                    Subscribe Now
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Service Currently Unavailable Modal (Sports / Plays / Activities) */}
      <ServiceUnavailableModal
        isOpen={Boolean(unavailableService)}
        serviceName={unavailableService}
        onClose={handleCloseUnavailable}
      />
    </footer>
  );
};

export default Footer;
