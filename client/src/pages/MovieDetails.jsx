import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMovieById, getShowsByMovie, getLocations } from '../services/api';
import DateSelector from '../components/DateSelector';
import TheatreShows from '../components/TheatreShows';
import { isPremiereMovie } from '../utils/premiereHelper';
import {
  IconStar,
  IconShare,
  IconCheck,
  IconThumbUp,
  IconThumbDown,
  IconChevronRight,
  IconX,
  IconPlayerPlayFilled
} from '@tabler/icons-react';

const DEFAULT_CAST = [
  { name: 'Lead Cast', role: 'Main Cast', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' },
  { name: 'Supporting Cast', role: 'Featured', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' },
  { name: 'Ensemble Cast', role: 'Ensemble', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop' }
];

const DEFAULT_CREW = [
  { name: 'Director', role: 'Director', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop' },
  { name: 'Producer', role: 'Producer', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop' },
  { name: 'Music Composer', role: 'Music Director', photo: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=300&auto=format&fit=crop' }
];

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [theatreShows, setTheatreShows] = useState([]);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showFormatModal, setShowFormatModal] = useState(false);
  const showtimesRef = useRef(null);
  const userManuallySelected = useRef(false);
  const [now, setNow] = useState(() => Date.now());

  // 30-second live clock tick
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const generateNext7Days = () => {
    const nextDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      nextDays.push(`${year}-${month}-${day}`);
    }
    return nextDays;
  };

  useEffect(() => {
    // Generate next 7 days for the date selector ribbon in local date format
    const nextDays = generateNext7Days();
    setDates(nextDays);
    setSelectedDate((prev) => (prev ? prev : nextDays[0]));
  }, [now]);

  useEffect(() => {
    fetchMovie();
  }, [id]);

  useEffect(() => {
    if (selectedDate && (movie?._id || id)) {
      fetchShows();
    }
  }, [selectedDate, movie?._id, id]);

  const countUpcomingShows = (groups, checkTime) => {
    if (!Array.isArray(groups)) return 0;
    let count = 0;
    for (const g of groups) {
      for (const s of (g.shows || [])) {
        if (s.isBookable === false) continue;
        if (s.startsAt) {
          const t = new Date(s.startsAt).getTime();
          if (!isNaN(t) && t <= checkTime) continue;
        }
        count++;
      }
    }
    return count;
  };

  const fetchMovie = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getMovieById(id);
      setMovie(res.data?.data || null);
      if (!res.data?.data) {
        setErrorMsg('Movie details not found.');
      }
    } catch (error) {
      console.error('Failed to fetch movie details:', error.message);
      setErrorMsg(error.response?.data?.message || 'Unable to load movie details.');
      setMovie(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchShows = async () => {
    try {
      const targetId = movie?._id || id;
      const res = await getShowsByMovie(targetId, { date: selectedDate });
      const showsData = res.data?.data || [];
      setTheatreShows(showsData);

      // Auto-advance when Today's shows are all over and user hasn't manually selected today
      const allDays = dates.length ? dates : generateNext7Days();
      const todayDate = allDays[0];
      const tomorrowDate = allDays[1];

      if (selectedDate === todayDate && !userManuallySelected.current) {
        const upcomingCount = countUpcomingShows(showsData, Date.now());
        if (upcomingCount === 0 && tomorrowDate) {
          setSelectedDate(tomorrowDate);
        }
      }
    } catch (error) {
      console.error('Failed to fetch shows:', error);
      setTheatreShows([]);
    }
  };

  const handleDateSelect = (date) => {
    userManuallySelected.current = true;
    setSelectedDate(date);
  };

  const handleBookTicketsClick = () => {
    setShowFormatModal(true);
  };

  const scrollToShows = () => {
    setShowFormatModal(false);
    if (showtimesRef.current) {
      showtimesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <h4 className="fw-bold text-dark mb-2">Movie Not Found</h4>
        <p className="text-muted mb-4">{errorMsg || 'The requested movie could not be located or is no longer listed.'}</p>
        <Link to="/movies" className="btn btn-danger px-4 py-2 rounded-2">
          Browse All Movies
        </Link>
      </div>
    );
  }

  const genresList = movie.genres?.length
    ? movie.genres
    : (Array.isArray(movie.genre) ? movie.genre : (movie.genre ? [movie.genre] : ['Action', 'Drama']));
  const genreDisplay = genresList.join(', ');

  const languagesList = movie.languages?.length
    ? movie.languages
    : (movie.language ? [movie.language] : ['English', 'Hindi']);
  const languagesDisplay = languagesList.join(', ');

  const formatsList = movie.formats?.length ? movie.formats : ['2D', '3D'];
  const formatsDisplay = formatsList.join(', ');

  const durationDisplay = movie.duration || (movie.durationMinutes ? `${Math.floor(movie.durationMinutes / 60)}h ${movie.durationMinutes % 60}m` : '2h 30m');

  const numericRating = typeof movie.rating === 'number' && movie.rating > 0
    ? movie.rating
    : (typeof movie.avgRating === 'number' && movie.avgRating > 0 ? movie.avgRating : null);
  const ratingText = numericRating ? `${numericRating.toFixed(1)}/10` : (movie.likes || 'Top Rated');

  const votesText = movie.votes
    ? (String(movie.votes).toLowerCase().includes('vote') ? movie.votes : `${movie.votes} Votes`)
    : (movie.likes ? movie.likes : '');

  const posterSrc = movie.posterUrl || movie.poster || '/img/popcorn.jpg';
  const backdropSrc = movie.backdrop || movie.backdropUrl || posterSrc;

  const castList = Array.isArray(movie.cast) && movie.cast.length > 0 ? movie.cast : DEFAULT_CAST;
  const crewList = Array.isArray(movie.crew) && movie.crew.length > 0 ? movie.crew : DEFAULT_CREW;

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* 1. BMS Movie Hero Section with Backdrop Blur (Screenshots 15, 20) */}
      <div
        className="position-relative text-white overflow-hidden"
        style={{
          backgroundColor: '#1A1A24',
          minHeight: '440px',
          backgroundImage: `linear-gradient(to right, rgba(26, 26, 36, 0.96) 20%, rgba(26, 26, 36, 0.75) 60%, rgba(26, 26, 36, 0.96) 100%), url(${backdropSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="bms-container py-4 py-md-5">
          <div className="row g-4 align-items-center">
            {/* Left: Poster Frame (Screenshots 15) */}
            <div className="col-12 col-md-4 col-lg-3">
              <div
                className="position-relative shadow-lg rounded-3 overflow-hidden mx-auto"
                style={{ maxWidth: '260px', aspectRatio: '2 / 3' }}
              >
                <img
                  src={posterSrc}
                  alt={movie.title}
                  className="w-100 h-100"
                  style={{ objectFit: 'cover' }}
                />
                {/* "In cinemas" label */}
                <div
                  className="position-absolute bottom-0 start-0 w-100 text-center py-1 small fw-semibold text-white"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', fontSize: '12px' }}
                >
                  In cinemas
                </div>
                {/* Trailers badge */}
                <div
                  className="position-absolute top-50 start-50 translate-middle badge rounded-pill px-3 py-2 d-flex align-items-center gap-1 cursor-pointer"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    fontSize: '12px'
                  }}
                  onClick={() => alert('Viewing trailers')}
                >
                  <IconPlayerPlayFilled size={12} />
                  <span>Trailers (8)</span>
                </div>
              </div>
            </div>

            {/* Right: Movie Details Metadata */}
            <div className="col-12 col-md-8 col-lg-9 text-white">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h1 className="fw-bold mb-0 text-white" style={{ fontSize: '32px' }}>
                  {movie.title}
                </h1>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light d-flex align-items-center gap-1 rounded-2 px-3 py-1"
                  style={{ fontSize: '13px' }}
                  onClick={() => alert('Link copied to clipboard!')}
                >
                  <IconShare size={15} />
                  <span>Share</span>
                </button>
              </div>

              {/* Rating Bar Capsule (Screenshot 15) */}
              <div
                className="d-flex align-items-center justify-content-between rounded-3 p-3 my-3"
                style={{
                  backgroundColor: '#333338',
                  maxWidth: '480px'
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  <IconStar size={22} fill="var(--bms-brand-red)" color="var(--bms-brand-red)" />
                  <div>
                    <span className="fw-bold" style={{ fontSize: '18px' }}>
                      {ratingText}
                    </span>
                    {votesText && (
                      <span className="text-light ms-2 small" style={{ opacity: 0.8 }}>
                        ({votesText}) &rsaquo;
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-light rounded-2 px-3 py-1 fw-semibold"
                  style={{ fontSize: '13px' }}
                  onClick={() => alert('Rate movie dialog')}
                >
                  Rate now
                </button>
              </div>

              {/* Format & Language Badges (Screenshot 15) */}
              <div className="d-flex flex-wrap align-items-center gap-2 my-3">
                <span className="badge bg-light text-dark px-2 py-1 rounded-1" style={{ fontSize: '12px' }}>
                  {formatsDisplay}
                </span>
                <span className="badge bg-light text-dark px-2 py-1 rounded-1" style={{ fontSize: '12px' }}>
                  {languagesDisplay}
                </span>
              </div>

              {/* Meta: Duration, Genre, Certificate, Release Date */}
              <p className="text-light mb-4 small" style={{ opacity: 0.9, fontSize: '14px' }}>
                {durationDisplay} • {genreDisplay} • {movie.certificate || movie.certification || 'UA'} • {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '5 Nov, 2026'}
              </p>

              {/* Big Red BMS "Book tickets" CTA Button + Secondary Premiere Option */}
              <div className="d-flex flex-wrap align-items-center gap-3">
                <button
                  type="button"
                  className="btn text-white fw-semibold rounded-2 px-5 py-3 shadow"
                  style={{
                    backgroundColor: 'var(--bms-brand-red)',
                    fontSize: '16px',
                    minWidth: '220px'
                  }}
                  onClick={handleBookTicketsClick}
                >
                  Book tickets
                </button>

                {isPremiereMovie(movie) && (
                  <button
                    type="button"
                    className="btn fw-semibold rounded-2 px-4 py-3 d-inline-flex align-items-center gap-2 shadow"
                    style={{
                      backgroundColor: '#2B3148',
                      borderColor: '#3D4460',
                      color: '#FFFFFF',
                      fontSize: '15px'
                    }}
                    onClick={() => navigate(`/premiere/${movie._id || id}`)}
                  >
                    <IconPlayerPlayFilled size={14} color="#E53955" />
                    <span>Watch on Premiere (Rent / Buy)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Content Body (Screenshots 15, 16, 17, 18) */}
      <div className="bms-container mt-4">
        {/* About the movie */}
        <section className="mb-4 pb-3 border-bottom">
          <h4 className="fw-bold text-dark mb-3" style={{ fontSize: '18px' }}>
            About the movie
          </h4>
          <p className="text-secondary" style={{ lineHeight: 1.7, fontSize: '14px', maxWidth: '900px' }}>
            {movie.description}
          </p>
        </section>

        {/* Top offers for you (Warm cream/yellow background - Screenshots 15, 16) */}
        <section className="mb-4 pb-3 border-bottom">
          <h4 className="fw-bold text-dark mb-3" style={{ fontSize: '18px' }}>
            Top offers for you
          </h4>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="bms-offer-card d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '32px', height: '32px', backgroundColor: 'var(--bms-brand-red)', color: '#fff' }}
                >
                  <IconCheck size={18} stroke={3} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '14px' }}>
                    YES Private Debit Card Offer
                  </h6>
                  <small className="text-muted" style={{ fontSize: '12px' }}>
                    Tap to view details &amp; redeem
                  </small>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="bms-offer-card d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '32px', height: '32px', backgroundColor: 'var(--bms-brand-red)', color: '#fff' }}
                >
                  <IconCheck size={18} stroke={3} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '14px' }}>
                    Buy 1 get 1 movie ticket free + 50% off on non-card payments
                  </h6>
                  <small className="text-muted" style={{ fontSize: '12px' }}>
                    Tap to view details &amp; terms
                  </small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cast Section (Screenshots 16, 17) */}
        <section className="mb-4 pb-3 border-bottom">
          <h4 className="fw-bold text-dark mb-3" style={{ fontSize: '18px' }}>
            Cast
          </h4>
          <div className="d-flex gap-4 overflow-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {castList.map((actor, idx) => (
              <div key={idx} className="text-center flex-shrink-0" style={{ width: '110px' }}>
                <div
                  className="rounded-3 overflow-hidden mx-auto mb-2 shadow-sm"
                  style={{ width: '90px', height: '90px' }}
                >
                  <img src={actor.photo || actor.img || DEFAULT_CAST[0].photo} alt={actor.name} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                </div>
                <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '13px' }}>
                  {actor.name}
                </div>
                <div className="text-muted small text-truncate" style={{ fontSize: '11px' }}>
                  {actor.role}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Crew Section (Screenshot 17) */}
        <section className="mb-4 pb-3 border-bottom">
          <h4 className="fw-bold text-dark mb-3" style={{ fontSize: '18px' }}>
            Crew
          </h4>
          <div className="d-flex gap-4 overflow-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {crewList.map((crew, idx) => (
              <div key={idx} className="text-center flex-shrink-0" style={{ width: '110px' }}>
                <div
                  className="rounded-3 overflow-hidden mx-auto mb-2 shadow-sm"
                  style={{ width: '90px', height: '90px' }}
                >
                  <img src={crew.photo || crew.img || DEFAULT_CREW[0].photo} alt={crew.name} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                </div>
                <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '13px' }}>
                  {crew.name}
                </div>
                <div className="text-muted small text-truncate" style={{ fontSize: '11px' }}>
                  {crew.role}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Reviews Section (Screenshot 18) */}
        <section className="mb-5 pb-3 border-bottom">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="fw-bold text-dark mb-0" style={{ fontSize: '18px' }}>
              Top reviews
            </h4>
            <span className="text-danger fw-semibold small cursor-pointer">
              259.1K reviews &rsaquo;
            </span>
          </div>

          {/* Hashtag Filters (Screenshot 18) */}
          <div className="d-flex gap-2 flex-wrap mb-4">
            {['#SuperDirection 151068', '#GreatActing 136106', '#Blockbuster 135336', '#Wellmade 133431'].map((tag, i) => (
              <span
                key={i}
                className="badge bg-white text-danger border border-secondary border-opacity-25 rounded-pill px-3 py-2 fw-medium"
                style={{ fontSize: '12px' }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Review Cards Grid */}
          <div className="row g-3">
            {[
              {
                user: 'User',
                date: '18 Days ago',
                rating: '10/10',
                text: 'Outstanding visuals but you will forget visuals when you start watching Nitesh Tiwari masterclass! Brilliant emotions, brilliant writing, such an emotion...'
              },
              {
                user: 'MovieFanatic',
                date: '12 Days ago',
                rating: '10/10',
                text: 'Spectacular world building and soundtrack! Hans Zimmer and A.R. Rahman collaboration is goosebumps-inducing in IMAX 3D!'
              }
            ].map((rev, i) => (
              <div key={i} className="col-12 col-md-6">
                <div className="bg-white rounded-3 p-3 border shadow-sm h-100">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle bg-light d-flex align-items-center justify-content-center text-muted"
                        style={{ width: '32px', height: '32px' }}
                      >
                        👤
                      </div>
                      <div>
                        <div className="fw-semibold small text-dark">{rev.user}</div>
                        <div className="text-muted" style={{ fontSize: '10px' }}>Booked on cinebook</div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-1 text-danger fw-bold small">
                      <IconStar size={14} fill="var(--bms-brand-red)" />
                      <span>{rev.rating}</span>
                    </div>
                  </div>
                  <p className="text-secondary small mb-3" style={{ fontSize: '13px', lineHeight: 1.5 }}>
                    {rev.text}
                  </p>
                  <div className="d-flex align-items-center justify-content-between text-muted small pt-2 border-top" style={{ fontSize: '11px' }}>
                    <div className="d-flex align-items-center gap-3">
                      <span className="d-flex align-items-center gap-1 cursor-pointer">
                        <IconThumbUp size={14} /> 6.2K
                      </span>
                      <span className="d-flex align-items-center gap-1 cursor-pointer">
                        <IconThumbDown size={14} />
                      </span>
                    </div>
                    <span>{rev.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Showtimes & Screening Section (Screenshot 21) */}
        <section ref={showtimesRef} className="pt-2">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
            <div>
              <h3 className="fw-bold text-dark mb-0" style={{ fontSize: '22px' }}>
                {movie.title} - Showtimes &amp; Theatres
              </h3>
              <p className="text-muted small mb-0">Select your preferred date &amp; cinema</p>
            </div>
          </div>

          {/* Date Selector Ribbon */}
          <DateSelector
            dates={dates}
            selectedDate={selectedDate}
            onSelect={handleDateSelect}
          />

          {/* Theatre and Shows List */}
          <TheatreShows
            theatreShows={theatreShows}
            movieId={id}
            now={now}
            selectedDate={selectedDate}
            todayDate={dates[0]}
            onSelectTomorrow={() => {
              userManuallySelected.current = true;
              if (dates[1]) {
                setSelectedDate(dates[1]);
              }
            }}
          />
        </section>
      </div>

      {/* 4. Format & Language Selection Modal (Screenshot 20) */}
      {showFormatModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', zIndex: 1080 }}
          onClick={() => setShowFormatModal(false)}
        >
          <div
            className="bg-white rounded-3 shadow-lg overflow-hidden position-relative"
            style={{ width: '90%', maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
              <div>
                <small className="text-muted d-block" style={{ fontSize: '11px' }}>{movie.title}</small>
                <h6 className="fw-bold mb-0 text-dark">Select language and format</h6>
              </div>
              <button
                type="button"
                className="btn btn-sm border-0 p-1 text-muted"
                onClick={() => setShowFormatModal(false)}
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="p-3">
              <div className="bg-light p-2 rounded-2 mb-3 fw-bold small text-muted">
                HINDI
              </div>

              <div className="d-flex gap-2 mb-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold"
                  style={{ fontSize: '13px' }}
                  onClick={scrollToShows}
                >
                  3D
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold"
                  style={{ fontSize: '13px' }}
                  onClick={scrollToShows}
                >
                  2D
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger rounded-pill px-4 py-2 fw-semibold"
                  style={{ fontSize: '13px' }}
                  onClick={scrollToShows}
                >
                  Select all
                </button>
              </div>

              <button
                type="button"
                className="btn text-white w-100 fw-semibold rounded-2 py-2"
                style={{ backgroundColor: 'var(--bms-brand-red)' }}
                onClick={scrollToShows}
              >
                Show Theatres
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
