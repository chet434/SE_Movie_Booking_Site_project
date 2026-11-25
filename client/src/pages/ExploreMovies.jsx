import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLocationContext } from '../context/LocationContext';
import { getMovies } from '../services/api';
import {
  IconChevronDown,
  IconChevronUp,
  IconStarFilled,
  IconThumbUpFilled,
  IconFilter,
  IconX,
  IconMovie,
  IconBuildingStore,
  IconAlertCircle,
  IconRefresh
} from '@tabler/icons-react';
import '../styles/explore-movies.css';

const ExploreMovies = () => {
  const { selectedLocation } = useLocationContext();
  const { city } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeCity = city
    ? city.charAt(0).toUpperCase() + city.slice(1).toLowerCase()
    : (selectedLocation || 'Bhubaneswar');

  const searchQuery = searchParams.get('search') || '';

  // Database Movies state (Strictly from backend API — zero mock fallbacks)
  const [dbMovies, setDbMovies] = useState([]);
  const [dbAvailableFilters, setDbAvailableFilters] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Multi-select filter states
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState([]);

  // Accordion open/collapse states
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(true); // expanded by default
  const [isGenresOpen, setIsGenresOpen] = useState(false);       // collapsed by default
  const [isFormatsOpen, setIsFormatsOpen] = useState(false);     // collapsed by default

  // Mobile filters drawer state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Scroll to top on page mount or city change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeCity]);

  // Synchronize URL search params (genre, language, status) on mount or URL change
  useEffect(() => {
    const genreParam = searchParams.get('genre');
    if (genreParam) {
      setSelectedGenres([genreParam]);
      setIsGenresOpen(true);
    }
    const langParam = searchParams.get('language');
    if (langParam) {
      setSelectedLanguages([langParam]);
      setIsLanguagesOpen(true);
    }
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [searchParams]);

  // Fetch movies exclusively from database API
  const fetchMoviesFromDatabase = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (activeCity && activeCity !== 'All') {
        params.location = activeCity;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (statusFilter) {
        params.status = statusFilter;
      }

      const res = await getMovies(params);

      let fetched = [];
      if (res.data?.success && Array.isArray(res.data.data)) {
        fetched = res.data.data;
      } else if (Array.isArray(res.data)) {
        fetched = res.data;
      }

      setDbMovies(fetched);
      if (res.data?.meta?.availableFilters) {
        setDbAvailableFilters(res.data.meta.availableFilters);
      }
    } catch (err) {
      console.error('Failed to load movies from database:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to connect to the database. Please check your network connection and retry.'
      );
      setDbMovies([]); // Strict adherence: never inject dummy movies on error!
    } finally {
      setLoading(false);
    }
  }, [activeCity, searchQuery, statusFilter]);

  useEffect(() => {
    fetchMoviesFromDatabase();
  }, [fetchMoviesFromDatabase]);

  // Dynamically derive available filter values from backend or database records
  const availableLanguages = useMemo(() => {
    if (dbAvailableFilters?.languages?.length) {
      return dbAvailableFilters.languages;
    }
    const set = new Set();
    dbMovies.forEach((m) => {
      const langs = m.languages?.length
        ? m.languages
        : (m.language ? [m.language] : []);
      langs.forEach((l) => set.add(l));
    });
    const list = Array.from(set).sort();
    return list.length ? list : ['Hindi', 'English', 'Telugu', 'Tamil', 'Odia', 'Kannada', 'Malayalam', 'Japanese'];
  }, [dbMovies, dbAvailableFilters]);

  const availableGenres = useMemo(() => {
    if (dbAvailableFilters?.genres?.length) {
      return dbAvailableFilters.genres;
    }
    const set = new Set();
    dbMovies.forEach((m) => {
      const genres = m.genres?.length
        ? m.genres
        : (m.genre?.length ? m.genre : []);
      genres.forEach((g) => set.add(g));
    });
    const list = Array.from(set).sort();
    return list.length
      ? list
      : ['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Romantic', 'Sci-Fi', 'Thriller'];
  }, [dbMovies, dbAvailableFilters]);

  const availableFormats = useMemo(() => {
    if (dbAvailableFilters?.formats?.length) {
      return dbAvailableFilters.formats;
    }
    const set = new Set();
    dbMovies.forEach((m) => {
      const formats = m.formats?.length ? m.formats : ['2D'];
      formats.forEach((f) => set.add(f));
    });
    const list = Array.from(set).sort();
    return list.length ? list : ['2D', '3D', 'IMAX', 'IMAX_3D', '4DX'];
  }, [dbMovies, dbAvailableFilters]);

  // Toggle filter helpers
  const toggleLanguage = (lang) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const toggleFormat = (format) => {
    setSelectedFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );
  };

  const clearAllFilters = () => {
    setSelectedLanguages([]);
    setSelectedGenres([]);
    setSelectedFormats([]);
  };
  
  // Real-time multi-select filtering on the database movies
  // (OR logic within each category, AND logic across categories)
  const filteredMovies = useMemo(() => {
    return dbMovies.filter((movie) => {
      // Language filter (OR within languages)
      if (selectedLanguages.length > 0) {
        const movieLangs = movie.languages?.length
          ? movie.languages
          : (movie.language ? [movie.language] : []);
        const match = movieLangs.some((l) => selectedLanguages.includes(l));
        if (!match) return false;
      }

      // Genre filter (OR within genres)
      if (selectedGenres.length > 0) {
        const movieGenres = movie.genres?.length
          ? movie.genres
          : (movie.genre?.length ? movie.genre : []);
        const match = movieGenres.some((g) => selectedGenres.includes(g));
        if (!match) return false;
      }

      // Format filter (OR within formats)
      if (selectedFormats.length > 0) {
        const movieFormats = movie.formats?.length ? movie.formats : ['2D'];
        const match = movieFormats.some((f) => selectedFormats.includes(f));
        if (!match) return false;
      }

      return true;
    });
  }, [dbMovies, selectedLanguages, selectedGenres, selectedFormats]);

  const activeFiltersCount =
    selectedLanguages.length + selectedGenres.length + selectedFormats.length;

  return (
    <div
      style={{
        backgroundColor: '#F5F5F5',
        minHeight: '100vh',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* ====================================================================
          Top Promotional Banner (CineBook Stream / Featured Showcase)
          ==================================================================== */}
      <div className="mx-auto px-3 px-md-4 pt-4 pt-md-5 pb-4" style={{ maxWidth: '1240px' }}>
        <div
          className="rounded-4 overflow-hidden position-relative shadow-sm"
          style={{
            backgroundColor: '#1E2433',
            backgroundImage:
              'linear-gradient(90deg, #121620 0%, #1A2130 50%, #222B3D 100%)',
            height: '240px',
            maxHeight: '260px'
          }}
        >
          <div className="d-flex h-100 align-items-center justify-content-between px-4 px-md-5">
            {/* Left Column Tagline & CTA */}
            <div style={{ maxWidth: '520px', zIndex: 2 }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span
                  className="badge px-2.5 py-1 text-uppercase fw-bold"
                  style={{
                    backgroundColor: '#C41230',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    letterSpacing: '1px',
                    borderRadius: '4px'
                  }}
                >
                  cinebook stream
                </span>
                <span className="text-white-50 small fw-medium">Premiere of the Week</span>
              </div>
              <h2
                className="text-white fw-bold mb-2"
                style={{
                  fontSize: 'clamp(20px, 3.5vw, 28px)',
                  letterSpacing: '-0.5px',
                  lineHeight: '1.2'
                }}
              >
                The exposé that shook the world!
              </h2>
              <p
                className="text-white-50 mb-3 small d-none d-sm-block"
                style={{ fontSize: '13px', lineHeight: '1.4' }}
              >
                Watch Aaron Sorkin&apos;s latest high-stakes thriller starring Mikey Madison, Jeremy Allen White &amp; Jeremy Strong.
              </p>
              <div className="d-flex align-items-center gap-3">
                <button
                  type="button"
                  className="btn text-white fw-semibold border-0 d-inline-flex align-items-center gap-2"
                  style={{
                    backgroundColor: '#C41230',
                    fontSize: '13px',
                    padding: '9px 20px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 6px rgba(196, 18, 48, 0.3)',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#A80E28')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#C41230')}
                  onClick={() => {
                    const firstMovie = dbMovies[0];
                    if (firstMovie) navigate(`/movies/${firstMovie._id}`);
                  }}
                >
                  Buy/Rent Now
                </button>
                <span className="text-white-50" style={{ fontSize: '12px' }}>
                  Starting at ₹149
                </span>
              </div>
            </div>

            {/* Right Column Artwork Showcase */}
            <div
              className="d-none d-md-flex align-items-center justify-content-end h-100 position-relative"
              style={{ width: '48%', pointerEvents: 'none' }}
            >
              <img
                src="/banners/banner_stream.avif"
                alt="Stream Showcase Banner"
                style={{
                  height: '100%',
                  width: '100%',
                  objectFit: 'cover',
                  maskImage: 'linear-gradient(to right, transparent 0%, black 25%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%)'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          Main Content Container (Two Columns: Left Filters + Right Movies)
          ==================================================================== */}
      <div className="mx-auto px-3 px-md-4 pb-5" style={{ maxWidth: '1240px' }}>
        {/* Mobile Filter Toggle Button (< lg) */}
        <div className="d-lg-none mb-3 d-flex align-items-center justify-content-between">
          <button
            type="button"
            className="btn btn-white bg-white border d-inline-flex align-items-center gap-2 px-3 py-2 rounded-2 shadow-sm text-dark"
            onClick={() => setIsMobileFiltersOpen(true)}
            style={{ fontSize: '13px', fontWeight: 500 }}
          >
            <IconFilter size={16} color="#C41230" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span
                className="badge rounded-pill text-white ms-1"
                style={{ backgroundColor: '#C41230', fontSize: '10px' }}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              className="btn btn-link text-decoration-none p-0 text-muted small"
              onClick={clearAllFilters}
            >
              Clear All ({activeFiltersCount})
            </button>
          )}
        </div>

        <div className="row g-4">
          {/* ================================================================
              Left Column (Sidebar Filters, Fixed Width: 280px on desktop)
              ================================================================ */}
          <div className="col-lg-auto d-none d-lg-block" style={{ width: '280px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3 className="mb-0 fw-bold" style={{ fontSize: '24px', color: '#333333' }}>
                Filters
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none"
                  style={{ fontSize: '12px', color: '#666666' }}
                  onClick={clearAllFilters}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#C41230')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#666666')}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Accordion 1: Languages (Expanded by default) */}
            <div
              className="bg-white rounded-2 border mb-3 overflow-hidden shadow-sm"
              style={{ borderColor: '#EEEEEE' }}
            >
              <div
                className="d-flex align-items-center justify-content-between px-3 py-3 cursor-pointer user-select-none"
                style={{ cursor: 'pointer' }}
                onClick={() => setIsLanguagesOpen((prev) => !prev)}
              >
                <div className="d-flex align-items-center gap-2">
                  {isLanguagesOpen ? (
                    <IconChevronUp size={16} color="#C41230" stroke={2.5} />
                  ) : (
                    <IconChevronDown size={16} color="#333333" stroke={2.5} />
                  )}
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: isLanguagesOpen ? '#C41230' : '#333333'
                    }}
                  >
                    Languages
                  </span>
                </div>
                {selectedLanguages.length > 0 && (
                  <button
                    type="button"
                    className="border-0 bg-transparent p-0"
                    style={{ fontSize: '12px', color: '#666666', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLanguages([]);
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#C41230')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#666666')}
                  >
                    Clear
                  </button>
                )}
              </div>

              {isLanguagesOpen && (
                <div className="px-3 pb-3 pt-1 border-top" style={{ borderColor: '#F2F2F2' }}>
                  <div className="d-flex flex-wrap gap-2 pt-2">
                    {availableLanguages.map((lang) => {
                      const isSelected = selectedLanguages.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => toggleLanguage(lang)}
                          className="border text-nowrap user-select-none"
                          style={{
                            padding: '6px 12px',
                            borderRadius: '3px',
                            fontSize: '13px',
                            fontWeight: isSelected ? 500 : 400,
                            backgroundColor: isSelected ? '#C41230' : '#FFFFFF',
                            borderColor: isSelected ? '#C41230' : '#E2E2E2',
                            color: isSelected ? '#FFFFFF' : '#C41230',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 2: Genres (Collapsed by default) */}
            <div
              className="bg-white rounded-2 border mb-3 overflow-hidden shadow-sm"
              style={{ borderColor: '#EEEEEE' }}
            >
              <div
                className="d-flex align-items-center justify-content-between px-3 py-3 cursor-pointer user-select-none"
                style={{ cursor: 'pointer' }}
                onClick={() => setIsGenresOpen((prev) => !prev)}
              >
                <div className="d-flex align-items-center gap-2">
                  {isGenresOpen ? (
                    <IconChevronUp size={16} color="#C41230" stroke={2.5} />
                  ) : (
                    <IconChevronDown size={16} color="#333333" stroke={2.5} />
                  )}
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: isGenresOpen ? '#C41230' : '#333333'
                    }}
                  >
                    Genres
                  </span>
                </div>
                {selectedGenres.length > 0 && (
                  <button
                    type="button"
                    className="border-0 bg-transparent p-0"
                    style={{ fontSize: '12px', color: '#666666', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGenres([]);
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#C41230')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#666666')}
                  >
                    Clear
                  </button>
                )}
              </div>

              {isGenresOpen && (
                <div className="px-3 pb-3 pt-1 border-top" style={{ borderColor: '#F2F2F2' }}>
                  <div className="d-flex flex-wrap gap-2 pt-2">
                    {availableGenres.map((genre) => {
                      const isSelected = selectedGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => toggleGenre(genre)}
                          className="border text-nowrap user-select-none"
                          style={{
                            padding: '6px 12px',
                            borderRadius: '3px',
                            fontSize: '13px',
                            fontWeight: isSelected ? 500 : 400,
                            backgroundColor: isSelected ? '#C41230' : '#FFFFFF',
                            borderColor: isSelected ? '#C41230' : '#E2E2E2',
                            color: isSelected ? '#FFFFFF' : '#C41230',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 3: Format (Collapsed by default) */}
            <div
              className="bg-white rounded-2 border mb-4 overflow-hidden shadow-sm"
              style={{ borderColor: '#EEEEEE' }}
            >
              <div
                className="d-flex align-items-center justify-content-between px-3 py-3 cursor-pointer user-select-none"
                style={{ cursor: 'pointer' }}
                onClick={() => setIsFormatsOpen((prev) => !prev)}
              >
                <div className="d-flex align-items-center gap-2">
                  {isFormatsOpen ? (
                    <IconChevronUp size={16} color="#C41230" stroke={2.5} />
                  ) : (
                    <IconChevronDown size={16} color="#333333" stroke={2.5} />
                  )}
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: isFormatsOpen ? '#C41230' : '#333333'
                    }}
                  >
                    Format
                  </span>
                </div>
                {selectedFormats.length > 0 && (
                  <button
                    type="button"
                    className="border-0 bg-transparent p-0"
                    style={{ fontSize: '12px', color: '#666666', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFormats([]);
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#C41230')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#666666')}
                  >
                    Clear
                  </button>
                )}
              </div>

              {isFormatsOpen && (
                <div className="px-3 pb-3 pt-1 border-top" style={{ borderColor: '#F2F2F2' }}>
                  <div className="d-flex flex-wrap gap-2 pt-2">
                    {availableFormats.map((fmt) => {
                      const isSelected = selectedFormats.includes(fmt);
                      return (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => toggleFormat(fmt)}
                          className="border text-nowrap user-select-none"
                          style={{
                            padding: '6px 12px',
                            borderRadius: '3px',
                            fontSize: '13px',
                            fontWeight: isSelected ? 500 : 400,
                            backgroundColor: isSelected ? '#C41230' : '#FFFFFF',
                            borderColor: isSelected ? '#C41230' : '#E2E2E2',
                            color: isSelected ? '#FFFFFF' : '#C41230',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {fmt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Sidebar Action Button */}
            <button
              type="button"
              className="w-100 py-2.5 bg-white border d-flex align-items-center justify-content-center gap-2"
              style={{
                borderColor: '#C41230',
                color: '#C41230',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FFF5F6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
              onClick={() => alert(`Showing cinemas in ${activeCity}`)}
            >
              <IconBuildingStore size={18} />
              <span>Browse by Cinemas</span>
            </button>
          </div>

          {/* ================================================================
              Right Column (Movies Catalog, flex-1)
              ================================================================ */}
          <div className="col-lg flex-grow-1 min-w-0">
            {/* Header Title */}
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h1
                className="fw-bold mb-0"
                style={{ fontSize: '24px', color: '#333333', letterSpacing: '-0.3px' }}
              >
                Movies In {activeCity}
              </h1>
              {!loading && (
                <span className="text-muted small">
                  {filteredMovies.length} {filteredMovies.length === 1 ? 'Movie' : 'Movies'}
                </span>
              )}
            </div>

            {/* Quick-Filter Language Pills Row (100% Synced with Sidebar) */}
            <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
              {availableLanguages.map((lang) => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className="border text-nowrap user-select-none"
                    style={{
                      padding: '5px 16px',
                      borderRadius: '9999px', // Fully rounded pills
                      fontSize: '12px',
                      fontWeight: isSelected ? 500 : 400,
                      backgroundColor: isSelected ? '#C41230' : '#FFFFFF',
                      borderColor: isSelected ? '#C41230' : '#E0E0E0',
                      color: isSelected ? '#FFFFFF' : '#C41230',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>

            {/* "Coming Soon" Banner Card */}
            <div
              className="bg-white rounded-3 px-4 py-3 mb-4 d-flex align-items-center justify-content-between shadow-sm position-relative overflow-hidden"
              style={{
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                border: '1px solid #EEEEEE'
              }}
            >
              {/* Subtle background geometric watermark */}
              <div
                className="position-absolute end-0 top-50 translate-middle-y me-4 opacity-25"
                style={{ pointerEvents: 'none', color: '#E0E0E0' }}
              >
                <IconMovie size={64} />
              </div>

              <div className="fw-bold" style={{ fontSize: '18px', color: '#222222', zIndex: 1 }}>
                Coming Soon
              </div>

              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none fw-medium d-inline-flex align-items-center gap-1"
                style={{
                  fontSize: '14px',
                  color: statusFilter === 'coming-soon' ? '#A80E28' : '#C41230',
                  fontWeight: statusFilter === 'coming-soon' ? 700 : 500,
                  zIndex: 1,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                onClick={() => {
                  setStatusFilter((prev) => (prev === 'coming-soon' ? '' : 'coming-soon'));
                }}
              >
                <span>{statusFilter === 'coming-soon' ? 'Show All Movies' : 'Explore Upcoming Movies'}</span>
                <span style={{ fontSize: '16px', lineHeight: 1 }}>›</span>
              </button>
            </div>

            {/* ============================================================
                MAIN VIEW: Loading State | Error State | Empty States | Grid
                ============================================================ */}
            {loading ? (
              /* Loading State: 4-Column Responsive Grid of Skeleton Cards */
              <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-4 g-4">
                {[...Array(8)].map((_, idx) => (
                  <div key={idx} className="col">
                    <div className="d-flex flex-column h-100">
                      <div
                        className="rounded-3 bg-secondary bg-opacity-25 w-100 placeholder-glow"
                        style={{
                          aspectRatio: '2/3',
                          animation: 'pulse 1.5s infinite ease-in-out',
                          backgroundColor: '#E5E7EB'
                        }}
                      />
                      <div className="pt-2 px-1">
                        <div
                          className="bg-secondary bg-opacity-25 rounded mb-1"
                          style={{ height: '16px', width: '80%', backgroundColor: '#E5E7EB' }}
                        />
                        <div
                          className="bg-secondary bg-opacity-25 rounded mb-1"
                          style={{ height: '12px', width: '40%', backgroundColor: '#E5E7EB' }}
                        />
                        <div
                          className="bg-secondary bg-opacity-25 rounded"
                          style={{ height: '12px', width: '60%', backgroundColor: '#E5E7EB' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              /* Error State: Clear Error Banner with Retry button (NEVER inject mock movies) */
              <div
                className="bg-white rounded-3 p-5 text-center shadow-sm"
                style={{
                  border: '1px solid #FFD0D6',
                  marginTop: '10px'
                }}
              >
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: '#FFF0F2',
                    color: '#C41230'
                  }}
                >
                  <IconAlertCircle size={32} />
                </div>
                <h4 className="fw-bold mb-2" style={{ color: '#222222', fontSize: '18px' }}>
                  Failed to Load Movies
                </h4>
                <p className="text-muted small mb-4" style={{ maxWidth: '420px', margin: '0 auto' }}>
                  {error}
                </p>
                <button
                  type="button"
                  className="btn text-white fw-medium border-0 px-4 py-2 d-inline-flex align-items-center gap-2"
                  style={{
                    backgroundColor: '#C41230',
                    fontSize: '13px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={fetchMoviesFromDatabase}
                >
                  <IconRefresh size={16} />
                  <span>Retry</span>
                </button>
              </div>
            ) : dbMovies.length === 0 ? (
              /* Database Empty State: 0 movies in DB for this city/location */
              <div
                className="bg-white rounded-3 p-5 text-center shadow-sm"
                style={{
                  border: '1px solid #EEEEEE',
                  marginTop: '10px'
                }}
              >
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: '#F7F7F7',
                    color: '#888888'
                  }}
                >
                  <IconMovie size={32} />
                </div>
                <h4 className="fw-bold mb-2" style={{ color: '#222222', fontSize: '18px' }}>
                  No movies are currently available.
                </h4>
                <p className="text-muted small mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
                  There are currently no active movies or shows listed in {activeCity}. Please check back soon or try selecting another city.
                </p>
                <button
                  type="button"
                  className="btn text-white fw-medium border-0 px-4 py-2"
                  style={{
                    backgroundColor: '#C41230',
                    fontSize: '13px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate('/movies')}
                >
                  Browse All Locations
                </button>
              </div>
            ) : filteredMovies.length === 0 ? (
              /* Filtered Empty State: DB has movies, but none match active filters */
              <div
                className="bg-white rounded-3 p-5 text-center shadow-sm"
                style={{
                  border: '1px solid #EEEEEE',
                  marginTop: '10px'
                }}
              >
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: '#FFF5F6',
                    color: '#C41230'
                  }}
                >
                  <IconFilter size={32} />
                </div>
                <h4 className="fw-bold mb-2" style={{ color: '#222222', fontSize: '18px' }}>
                  No movies match your selected filters
                </h4>
                <p className="text-muted small mb-4" style={{ maxWidth: '420px', margin: '0 auto' }}>
                  None of the movies available in {activeCity} match your selected criteria. Try removing some filters or clear all filters to see everything.
                </p>
                <button
                  type="button"
                  className="btn text-white fw-medium border-0 px-4 py-2"
                  style={{
                    backgroundColor: '#C41230',
                    fontSize: '13px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* 4-Column Responsive Movie Grid */
              <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-4 g-4">
                {filteredMovies.map((movie) => {
                  const movieId = movie._id || movie.id;
                  const posterSrc = movie.posterUrl || movie.poster || '/img/popcorn.jpg';
                  const langs = movie.languages?.length
                    ? movie.languages.join(', ')
                    : (movie.language || '');
                  const hasLikes = !!movie.likes;
                  const hasRating = typeof movie.rating === 'number' && movie.rating > 0;

                  return (
                    <div key={movieId || movie.title} className="col">
                      <div
                        className="cb-movie-card"
                        onClick={() => navigate(`/movie-details/${movieId}`)}
                      >
                        {/* Poster Container (Aspect 2/3, rounded-3, overflow hidden, shadow-sm) */}
                        <div className="cb-poster-wrapper">
                          <img
                            src={posterSrc}
                            alt={movie.title}
                            className="cb-poster-img"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop';
                            }}
                          />

                          {/* Re-release Badge */}
                          {movie.isReRelease && (
                            <span
                              className="position-absolute top-0 end-0 m-2 badge"
                              style={{
                                backgroundColor: '#FFD700',
                                color: '#111111',
                                fontSize: '10px',
                                fontWeight: 700,
                                letterSpacing: '0.5px',
                                borderRadius: '3px',
                                padding: '3px 6px'
                              }}
                            >
                              RE-RELEASE
                            </span>
                          )}

                          {/* Bottom Stats Bar (Solid #000000 bg, height 32px, px-2.5, white 13px) */}
                          {(hasLikes || hasRating) && (
                            <div className="cb-stats-bar">
                              {hasLikes ? (
                                <div className="d-flex align-items-center gap-1.5 text-nowrap">
                                  <IconThumbUpFilled size={15} color="#2ECC71" />
                                  <span className="fw-bold text-white">{movie.likes}</span>
                                </div>
                              ) : (
                                <div className="d-flex align-items-center gap-1 text-nowrap">
                                  <IconStarFilled size={14} color="#E53955" />
                                  <span className="fw-bold text-white">{movie.rating}/10</span>
                                  {movie.votes && (
                                    <span style={{ color: '#CCCCCC', fontSize: '12px', marginLeft: '3px' }}>
                                      {movie.votes}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Metadata below poster */}
                        <div className="pt-2 px-1">
                          <h4 className="cb-movie-title" title={movie.title}>
                            {movie.title}
                          </h4>

                          {movie.certification && (
                            <div className="cb-movie-cert">
                              {movie.certification}
                            </div>
                          )}

                          {langs && (
                            <div className="cb-movie-langs" title={langs}>
                              {langs}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================================
          Mobile Filters Off-Canvas / Drawer
          ==================================================================== */}
      {isMobileFiltersOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}
          onClick={() => setIsMobileFiltersOpen(false)}
        >
          <div
            className="position-absolute bottom-0 start-0 w-100 bg-white rounded-top-4 p-4 d-flex flex-column"
            style={{ maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <h5 className="mb-0 fw-bold">Filters ({activeFiltersCount})</h5>
              <button
                type="button"
                className="btn btn-sm p-1 border-0"
                onClick={() => setIsMobileFiltersOpen(false)}
              >
                <IconX size={20} />
              </button>
            </div>

            {/* Mobile Languages */}
            <div className="mb-4">
              <div className="fw-bold small text-muted mb-2">LANGUAGES</div>
              <div className="d-flex flex-wrap gap-2">
                {availableLanguages.map((lang) => {
                  const isSelected = selectedLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className="border text-nowrap"
                      style={{
                        padding: '6px 14px',
                        borderRadius: '4px',
                        fontSize: '13px',
                        backgroundColor: isSelected ? '#C41230' : '#FFFFFF',
                        borderColor: isSelected ? '#C41230' : '#E2E2E2',
                        color: isSelected ? '#FFFFFF' : '#C41230'
                      }}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Genres */}
            <div className="mb-4">
              <div className="fw-bold small text-muted mb-2">GENRES</div>
              <div className="d-flex flex-wrap gap-2">
                {availableGenres.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className="border text-nowrap"
                      style={{
                        padding: '6px 14px',
                        borderRadius: '4px',
                        fontSize: '13px',
                        backgroundColor: isSelected ? '#C41230' : '#FFFFFF',
                        borderColor: isSelected ? '#C41230' : '#E2E2E2',
                        color: isSelected ? '#FFFFFF' : '#C41230'
                      }}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Formats */}
            <div className="mb-4">
              <div className="fw-bold small text-muted mb-2">FORMAT</div>
              <div className="d-flex flex-wrap gap-2">
                {availableFormats.map((fmt) => {
                  const isSelected = selectedFormats.includes(fmt);
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => toggleFormat(fmt)}
                      className="border text-nowrap"
                      style={{
                        padding: '6px 14px',
                        borderRadius: '4px',
                        fontSize: '13px',
                        backgroundColor: isSelected ? '#C41230' : '#FFFFFF',
                        borderColor: isSelected ? '#C41230' : '#E2E2E2',
                        color: isSelected ? '#FFFFFF' : '#C41230'
                      }}
                    >
                      {fmt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="d-flex gap-2 pt-2 border-top mt-auto">
              <button
                type="button"
                className="btn btn-outline-secondary flex-grow-1"
                onClick={clearAllFilters}
              >
                Clear All
              </button>
              <button
                type="button"
                className="btn text-white flex-grow-1"
                style={{ backgroundColor: '#C41230' }}
                onClick={() => setIsMobileFiltersOpen(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreMovies;
