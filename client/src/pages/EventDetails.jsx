import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconShare,
  IconThumbUp,
  IconSparkles,
  IconShieldCheck,
  IconTicket,
  IconInfoCircle,
  IconX,
  IconCheck,
  IconFlame,
  IconLanguage,
  IconHourglass
} from '@tabler/icons-react';
import { getMusicStudioEventById } from '../data/musicStudioEvents';
import '../styles/event-details.css';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const event = getMusicStudioEventById(eventId);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isInterested, setIsInterested] = useState(false);
  const [interestedCount, setInterestedCount] = useState(0);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!event) return;

    // Check localStorage for user's interested status
    const storedStatus = localStorage.getItem(`cinebook_event_interested_${event.id}`);
    const isUserInterested = storedStatus === 'true';
    setIsInterested(isUserInterested);
    setInterestedCount(event.interestedCount + (isUserInterested ? 1 : 0));
  }, [event]);

  if (!event) {
    return (
      <div className="cb-event-details-page d-flex flex-column align-items-center justify-content-center py-5">
        <h3 className="fw-bold mb-2">Event Not Found</h3>
        <p className="text-muted mb-4">We could not find the live event you were looking for.</p>
        <Link to="/" className="btn btn-danger px-4 py-2">
          Return to Home
        </Link>
      </div>
    );
  }

  // Gallery array
  const galleryImages = event.gallery && event.gallery.length > 0 ? event.gallery : [event.banner || event.poster];

  const handlePrevSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const toggleInterested = () => {
    if (isInterested) {
      setIsInterested(false);
      setInterestedCount((prev) => Math.max(0, prev - 1));
      localStorage.setItem(`cinebook_event_interested_${event.id}`, 'false');
    } else {
      setIsInterested(true);
      setInterestedCount((prev) => prev + 1);
      localStorage.setItem(`cinebook_event_interested_${event.id}`, 'true');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // fallback
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="cb-event-details-page">
      {/* ====================================================================
          Hero Section: Immersive Dark Atmosphere
          ==================================================================== */}
      <section className="cb-event-hero">
        <div className="cb-event-hero-container">
          {/* Breadcrumb Navigation */}
          <nav className="cb-event-breadcrumb" aria-label="breadcrumb">
            <Link to="/">Home</Link>
            <span>&rsaquo;</span>
            <Link to="/#music-studio">Live Events</Link>
            <span>&rsaquo;</span>
            <span>{event.title}</span>
          </nav>

          <div className="cb-event-hero-grid">
            {/* Left: 16:9 Banner Carousel */}
            <div className="cb-event-banner-box">
              <img
                src={galleryImages[currentSlide]}
                alt={`${event.title} banner`}
                className="cb-event-banner-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = event.poster || '/img/popcorn.jpg';
                }}
              />

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    className="cb-event-banner-nav prev"
                    onClick={handlePrevSlide}
                    aria-label="Previous slide"
                  >
                    <IconChevronLeft size={22} stroke={2.5} />
                  </button>
                  <button
                    type="button"
                    className="cb-event-banner-nav next"
                    onClick={handleNextSlide}
                    aria-label="Next slide"
                  >
                    <IconChevronRight size={22} stroke={2.5} />
                  </button>
                  <div className="cb-event-banner-dots">
                    {galleryImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`cb-event-banner-dot ${idx === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right: Event Info & Engagement */}
            <div className="cb-event-hero-info">
              {/* Category & Tags Row */}
              <div className="cb-event-tags-row">
                {event.tags && event.tags.map((tag, idx) => (
                  <span key={idx} className="cb-event-tag-pill">{tag}</span>
                ))}
              </div>

              {/* Title */}
              <h1 className="cb-event-hero-title">{event.title}</h1>

              {/* Quick Specs */}
              <div className="cb-event-hero-specs">
                <div className="cb-event-spec-row">
                  <IconCalendar size={18} stroke={2} />
                  <span>{event.dateFull}</span>
                </div>
                <div className="cb-event-spec-row">
                  <IconClock size={18} stroke={2} />
                  <span>{event.time} &bull; {event.duration}</span>
                </div>
                <div className="cb-event-spec-row">
                  <IconMapPin size={18} stroke={2} />
                  <span>{event.venue}</span>
                </div>
              </div>

              {/* Action Buttons: Interested + Share */}
              <div className="cb-event-hero-actions">
                <button
                  type="button"
                  className={`cb-event-interested-btn ${isInterested ? 'active' : ''}`}
                  onClick={toggleInterested}
                >
                  <IconThumbUp size={16} stroke={2} />
                  <span>{isInterested ? 'Interested' : "I'm Interested"}</span>
                  <span className="badge bg-dark bg-opacity-25 ms-1">{interestedCount}</span>
                </button>

                <button
                  type="button"
                  className="cb-event-share-btn"
                  onClick={handleShare}
                >
                  {copied ? <IconCheck size={16} stroke={2.2} color="#10B981" /> : <IconShare size={16} stroke={2} />}
                  <span>{copied ? 'Link Copied!' : 'Share'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          Body Content: 2-Column Grid (Main Details + Sticky Sidebar)
          ==================================================================== */}
      <div className="cb-event-body-container">
        {/* Main Content Column */}
        <div className="cb-event-main-col">
          {/* Highlights Card */}
          {event.highlights && event.highlights.length > 0 && (
            <div className="cb-event-card">
              <h2 className="cb-event-section-title">
                <IconSparkles size={20} color="#F84464" />
                Why You Should Attend
              </h2>
              <div className="cb-event-highlights-list">
                {event.highlights.map((item, idx) => (
                  <div key={idx} className="cb-event-highlight-item">
                    <IconFlame size={20} className="cb-event-highlight-icon" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About The Event */}
          <div className="cb-event-card">
            <h2 className="cb-event-section-title">About the Event</h2>
            {event.about && event.about.map((p, idx) => {
              if (idx > 1 && !showFullAbout) return null;
              return (
                <p key={idx} className="cb-event-about-text">
                  {p}
                </p>
              );
            })}
            {event.about && event.about.length > 2 && (
              <button
                type="button"
                className="cb-event-toggle-text-btn"
                onClick={() => setShowFullAbout(!showFullAbout)}
              >
                {showFullAbout ? 'Read Less' : 'Read More'}
              </button>
            )}
          </div>

          {/* Artist Lineup */}
          {event.artists && event.artists.length > 0 && (
            <div className="cb-event-card">
              <h2 className="cb-event-section-title">Artist Lineup</h2>
              <div className="cb-event-artists-grid">
                {event.artists.map((artist, idx) => (
                  <div key={idx} className="cb-event-artist-card">
                    <div className="cb-event-artist-avatar-wrap">
                      <img
                        src={artist.photo}
                        alt={artist.name}
                        className="cb-event-artist-img"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = event.poster;
                        }}
                      />
                    </div>
                    <h3 className="cb-event-artist-name">{artist.name}</h3>
                    <p className="cb-event-artist-role">{artist.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery Grid */}
          {galleryImages.length > 0 && (
            <div className="cb-event-card">
              <h2 className="cb-event-section-title">Event Gallery</h2>
              <div className="cb-event-gallery-grid">
                {galleryImages.slice(0, 4).map((imgUrl, idx) => {
                  const isLastVisible = idx === 3 && galleryImages.length > 4;
                  return (
                    <div
                      key={idx}
                      className="cb-event-gallery-item"
                      onClick={() => openLightbox(idx)}
                      role="button"
                      tabIndex={0}
                    >
                      <img
                        src={imgUrl}
                        alt={`${event.title} gallery ${idx + 1}`}
                        className="cb-event-gallery-thumb"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = event.poster;
                        }}
                      />
                      {isLastVisible && (
                        <div className="cb-event-gallery-overlay">
                          <span>+{galleryImages.length - 3}</span>
                          <span>See All</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          {event.terms && event.terms.length > 0 && (
            <div className="cb-event-card">
              <h2 className="cb-event-section-title">
                <IconInfoCircle size={20} color="#6B7280" />
                Terms & Conditions
              </h2>
              <ul className="cb-event-terms-list">
                {event.terms.map((term, idx) => (
                  <li key={idx}>{term}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Sticky Sidebar: Quick Metadata & Book Now CTA */}
        <div className="cb-event-sidebar-col">
          <div className="cb-event-booking-card">
            <div className="cb-event-booking-header">
              <div className="cb-event-price-label">Starting from</div>
              <div className="cb-event-price-value">
                ₹{event.startingPrice.toLocaleString('en-IN')}
                <span>onwards</span>
              </div>
              <span
                className={`cb-event-status-pill ${
                  event.availabilityStatus === 'Available' ? 'available' : 'filling'
                }`}
              >
                {event.availabilityStatus}
              </span>
            </div>

            <div className="cb-event-meta-rows">
              <div className="cb-event-meta-row">
                <IconCalendar size={18} />
                <div>
                  <strong>Date:</strong> {event.dateFull}
                </div>
              </div>
              <div className="cb-event-meta-row">
                <IconClock size={18} />
                <div>
                  <strong>Time:</strong> {event.time}
                </div>
              </div>
              <div className="cb-event-meta-row">
                <IconHourglass size={18} />
                <div>
                  <strong>Duration:</strong> {event.duration}
                </div>
              </div>
              <div className="cb-event-meta-row">
                <IconMapPin size={18} />
                <div>
                  <strong>Venue:</strong> {event.venue}
                </div>
              </div>
              <div className="cb-event-meta-row">
                <IconLanguage size={18} />
                <div>
                  <strong>Languages:</strong> {event.languages}
                </div>
              </div>
              <div className="cb-event-meta-row">
                <IconShieldCheck size={18} />
                <div>
                  <strong>Age Limit:</strong> {event.ageLimit}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="cb-event-book-btn"
              onClick={() => navigate(`/events/${event.id}/tickets`)}
            >
              <IconTicket size={20} />
              Book Now
            </button>

            <div className="cb-event-guarantee-note">
              <IconShieldCheck size={15} color="#10B981" />
              <span>Instant Confirmation &bull; 100% Genuine Tickets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="cb-event-lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <div className="cb-event-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="cb-event-lightbox-close"
              onClick={() => setLightboxOpen(false)}
            >
              <IconX size={28} />
            </button>
            <img
              src={galleryImages[lightboxIndex]}
              alt="Enlarged view"
              className="cb-event-lightbox-img"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
