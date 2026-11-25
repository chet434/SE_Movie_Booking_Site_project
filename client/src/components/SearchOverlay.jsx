import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  IconSearch,
  IconX,
  IconMovie,
  IconTent,
  IconCalendarEvent
} from '@tabler/icons-react';
import { getMovies } from '../services/api';
import { musicStudioEvents } from '../data/musicStudioEvents';
import '../styles/search-overlay.css';

const RECENT_SEARCHES_KEY = 'cinebook_recent_searches';

export default function SearchOverlay({ isOpen, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [cachedMovies, setCachedMovies] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All'); // 'All' | 'Movies' | 'Events'
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Lock document body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // 2. Load recent searches from localStorage & fetch base movies
  useEffect(() => {
    if (isOpen) {
      // Focus input immediately
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      // Load stored recent searches
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed);
          }
        }
      } catch (err) {
        console.warn('Failed to parse recent searches:', err);
      }

      // Fetch live movies from MongoDB for Recommended & Trending
      getMovies({ limit: 12 })
        .then((res) => {
          const movies = res.data?.data || [];
          if (Array.isArray(movies) && movies.length > 0) {
            setCachedMovies(movies);
            setRecommendedMovies(movies.slice(0, 6));
          }
        })
        .catch((err) => {
          console.warn('Failed to fetch initial movies for search overlay:', err);
        });
    } else {
      // Reset search query and state on close
      setQuery('');
      setSearchResults([]);
      setHighlightedIndex(-1);
      setSelectedCategory('All');
    }
  }, [isOpen]);

  // 3. Construct 10 real Trending Now items combining live events and live movies
  const trendingItems = useMemo(() => {
    const items = [];

    // Select featured events
    const diljit = musicStudioEvents.find((e) => e.id.includes('diljit')) || musicStudioEvents[1] || musicStudioEvents[0];
    const martin = musicStudioEvents.find((e) => e.id.includes('martin') || e.id.includes('garrix')) || musicStudioEvents[3] || musicStudioEvents[1];

    if (diljit) {
      items.push({
        id: diljit.id,
        title: `${diljit.title}, Kolkata`,
        type: 'event',
        poster: diljit.poster,
        subtitle: `${diljit.venue} • ${diljit.category}`,
        route: `/events/${diljit.id}`
      });
    }

    if (cachedMovies.length > 0) {
      const m0 = cachedMovies[0];
      items.push({
        id: m0._id,
        title: m0.title,
        type: 'movie',
        poster: m0.poster,
        subtitle: `${Array.isArray(m0.languages) ? m0.languages.join(', ') : (m0.language || 'Hindi')} • ${Array.isArray(m0.genres) ? m0.genres.join(', ') : (m0.genre || 'Action')}`,
        route: `/movie-details/${m0._id}`
      });
    }

    if (martin) {
      items.push({
        id: martin.id,
        title: martin.title,
        type: 'event',
        poster: martin.poster,
        subtitle: `${martin.venue} • ${martin.category}`,
        route: `/events/${martin.id}`
      });
    }

    // Append remaining movies up to 10 items
    cachedMovies.slice(1, 8).forEach((m) => {
      if (items.length < 10) {
        items.push({
          id: m._id,
          title: m.title,
          type: 'movie',
          poster: m.poster,
          subtitle: `${Array.isArray(m.languages) ? m.languages.join(', ') : (m.language || 'Hindi')} • ${Array.isArray(m.genres) ? m.genres.join(', ') : (m.genre || 'Action')}`,
          route: `/movie-details/${m._id}`
        });
      }
    });

    return items;
  }, [cachedMovies]);

  // 4. Live Debounced Search across both Movies & Events
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      setHighlightedIndex(-1);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Immediate fast local matching for instant zero-lag feedback
    const lower = trimmed.toLowerCase();
    const localEventMatches = musicStudioEvents.filter((e) => {
      const matchTitle = e.title?.toLowerCase().includes(lower);
      const matchVenue = e.venue?.toLowerCase().includes(lower);
      const matchCat = e.category?.toLowerCase().includes(lower);
      const matchGenre = e.genres?.toLowerCase().includes(lower);
      const matchArtists = e.artists?.some((a) => a.name?.toLowerCase().includes(lower));
      return matchTitle || matchVenue || matchCat || matchGenre || matchArtists;
    }).map((e) => ({
      id: e.id,
      title: e.title,
      type: 'event',
      poster: e.poster,
      subtitle: `${e.venue} • ${e.category}`,
      route: `/events/${e.id}`
    }));

    const localMovieMatches = cachedMovies.filter((m) => {
      const matchTitle = m.title?.toLowerCase().includes(lower);
      const matchGenre = Array.isArray(m.genres)
        ? m.genres.some((g) => g.toLowerCase().includes(lower))
        : (m.genre || '').toLowerCase().includes(lower);
      const matchLang = Array.isArray(m.languages)
        ? m.languages.some((l) => l.toLowerCase().includes(lower))
        : (m.language || '').toLowerCase().includes(lower);
      return matchTitle || matchGenre || matchLang;
    }).map((m) => ({
      id: m._id,
      title: m.title,
      type: 'movie',
      poster: m.poster,
      subtitle: `${Array.isArray(m.languages) ? m.languages.join(', ') : (m.language || 'Hindi')} • ${Array.isArray(m.genres) ? m.genres.join(', ') : (m.genre || 'Action')}`,
      route: `/movie-details/${m._id}`
    }));

    setSearchResults([...localEventMatches, ...localMovieMatches]);

    // Debounced API call to live MongoDB backend
    const timeout = setTimeout(async () => {
      try {
        const res = await getMovies({ search: trimmed, limit: 10 });
        const apiMovies = res.data?.data || [];
        const formattedApiMovies = apiMovies.map((m) => ({
          id: m._id,
          title: m.title,
          type: 'movie',
          poster: m.poster,
          subtitle: `${Array.isArray(m.languages) ? m.languages.join(', ') : (m.language || 'Hindi')} • ${Array.isArray(m.genres) ? m.genres.join(', ') : (m.genre || 'Action')}`,
          route: `/movie-details/${m._id}`
        }));

        // Merge deduplicated by id
        const seen = new Set();
        const merged = [];
        for (const item of [...localEventMatches, ...formattedApiMovies]) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            merged.push(item);
          }
        }
        setSearchResults(merged);
      } catch (err) {
        console.warn('Search API error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query, cachedMovies]);

  // 5. Category Filtering (All / Movies / Events)
  const filteredResults = useMemo(() => {
    if (selectedCategory === 'Movies') {
      return searchResults.filter((r) => r.type === 'movie');
    }
    if (selectedCategory === 'Events') {
      return searchResults.filter((r) => r.type === 'event');
    }
    return searchResults;
  }, [searchResults, selectedCategory]);

  // 6. Save item to Recent Searches
  const saveRecentSearch = (item) => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      const existing = stored ? JSON.parse(stored) : [];
      const deduplicated = existing.filter((it) => it.id !== item.id);
      const updated = [
        {
          id: item.id,
          title: item.title,
          type: item.type,
          route: item.route,
          poster: item.poster || '',
          subtitle: item.subtitle || ''
        },
        ...deduplicated
      ].slice(0, 5);

      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (err) {
      console.warn('Error saving recent search:', err);
    }
  };

  const clearRecentSearches = () => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
  };

  const handleSelectItem = (item) => {
    saveRecentSearch(item);
    onClose();
    navigate(item.route);
  };

  // 7. Keyboard Navigation (ArrowUp, ArrowDown, Enter, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (query.trim() && filteredResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1 >= filteredResults.length ? 0 : prev + 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev - 1 < 0 ? filteredResults.length - 1 : prev - 1));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredResults[highlightedIndex]) {
            handleSelectItem(filteredResults[highlightedIndex]);
          } else {
            onClose();
            navigate(`/movies?search=${encodeURIComponent(query.trim())}`);
          }
        }
      } else if (e.key === 'Enter' && query.trim()) {
        e.preventDefault();
        onClose();
        navigate(`/movies?search=${encodeURIComponent(query.trim())}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, query, filteredResults, highlightedIndex, onClose, navigate]);

  if (!isOpen) return null;

  const isSearching = query.trim().length > 0;

  return (
    <div
      className="cb-search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search CineBook"
    >
      {/* ─── Top White Header Bar ─────────────────────────────────────────── */}
      <div className="cb-search-header">
        <div className="cb-search-box">
          <input
            ref={inputRef}
            type="text"
            className="cb-search-input"
            placeholder="Search for movies, events, plays, sports..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlightedIndex(-1);
            }}
            aria-label="Search query"
          />
          {query.length > 0 && (
            <button
              type="button"
              className="cb-search-clear-btn"
              onClick={() => {
                setQuery('');
                setSearchResults([]);
                setHighlightedIndex(-1);
                inputRef.current?.focus();
              }}
              aria-label="Clear search input"
            >
              <IconX size={13} stroke={2.5} />
            </button>
          )}
        </div>

        {/* Top-Right Close Button */}
        <button
          type="button"
          className="cb-search-close-btn"
          onClick={onClose}
          aria-label="Close search overlay"
        >
          <IconX size={22} stroke={1.8} />
        </button>
      </div>

      {/* ─── Scrollable Light-Gray Body ───────────────────────────────────── */}
      <div className="cb-search-body">
        <div className="cb-search-content">
          {/* ================================================================
              VIEW A: Live Search Results (When User Types)
              ================================================================ */}
          {isSearching ? (
            <div>
              {/* Category Filter Pills */}
              <div className="cb-search-pills">
                {['All', 'Movies', 'Events'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`cb-search-pill ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setHighlightedIndex(-1);
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Results List */}
              {filteredResults.length > 0 ? (
                <div className="cb-search-card">
                  {filteredResults.map((item, idx) => {
                    const isHighlighted = idx === highlightedIndex;
                    return (
                      <div
                        key={`${item.type}-${item.id}`}
                        className={`cb-search-result-row ${isHighlighted ? 'active' : ''}`}
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                      >
                        <div className="d-flex align-items-center flex-grow-1 min-w-0">
                          {item.poster ? (
                            <img
                              src={item.poster}
                              alt={item.title}
                              className="cb-search-result-thumb"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="cb-search-result-thumb d-flex align-items-center justify-content-center text-muted">
                              {item.type === 'event' ? <IconTent size={20} /> : <IconMovie size={20} />}
                            </div>
                          )}
                          <div className="cb-search-result-info">
                            <h6 className="cb-search-result-title">{item.title}</h6>
                            <p className="cb-search-result-sub mb-0">{item.subtitle}</p>
                          </div>
                        </div>

                        <div className="cb-search-row-icon">
                          {item.type === 'event' ? (
                            <IconTent size={20} stroke={1.5} />
                          ) : (
                            <IconMovie size={20} stroke={1.5} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty Search State */
                <div className="cb-search-empty-card">
                  <p className="cb-search-empty-text">
                    No results found for &ldquo;{query}&rdquo;
                  </p>
                  <Link
                    to="/movies"
                    onClick={onClose}
                    className="cb-search-empty-btn"
                  >
                    Browse All Movies
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* ================================================================
               VIEW B: Default View (Recent Searches, Trending Now, Recommended)
               ================================================================ */
            <div>
              {/* ─── 1. Recent Searches (Render only if present) ─────────────── */}
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <div className="cb-search-section-header">
                    <h5 className="cb-search-section-title">Recent Searches</h5>
                    <button
                      type="button"
                      className="cb-search-clear-all"
                      onClick={clearRecentSearches}
                    >
                      Clear
                    </button>
                  </div>
                  <div className="cb-search-card">
                    {recentSearches.map((item) => (
                      <div
                        key={`recent-${item.id}`}
                        className="cb-search-row"
                        onClick={() => handleSelectItem(item)}
                      >
                        <span className="cb-search-row-title">{item.title}</span>
                        <span className="cb-search-row-icon">
                          {item.type === 'event' ? (
                            <IconTent size={20} stroke={1.5} />
                          ) : (
                            <IconMovie size={20} stroke={1.5} />
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── 2. Trending Now ────────────────────────────────────────── */}
              <div className="mb-4">
                <div className="cb-search-section-header">
                  <h5 className="cb-search-section-title">Trending Now</h5>
                </div>
                <div className="cb-search-card">
                  {trendingItems.map((item) => (
                    <div
                      key={`trending-${item.id}`}
                      className="cb-search-row"
                      onClick={() => handleSelectItem(item)}
                    >
                      <span className="cb-search-row-title">{item.title}</span>
                      <span className="cb-search-row-icon">
                        {item.type === 'event' ? (
                          <IconTent size={20} stroke={1.5} />
                        ) : (
                          <IconMovie size={20} stroke={1.5} />
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── 3. Recommended For You (3-Column Poster Grid) ─────────── */}
              {recommendedMovies.length > 0 && (
                <div>
                  <div className="cb-search-section-header">
                    <h5 className="cb-search-section-title">Recommended For You</h5>
                  </div>
                  <div className="cb-search-grid">
                    {recommendedMovies.map((movie) => (
                      <button
                        key={`rec-${movie._id}`}
                        type="button"
                        className="cb-search-poster-tile"
                        onClick={() =>
                          handleSelectItem({
                            id: movie._id,
                            title: movie.title,
                            type: 'movie',
                            poster: movie.poster,
                            subtitle: `${Array.isArray(movie.languages) ? movie.languages.join(', ') : (movie.language || 'Hindi')} • ${Array.isArray(movie.genres) ? movie.genres.join(', ') : (movie.genre || 'Action')}`,
                            route: `/movie-details/${movie._id}`
                          })
                        }
                      >
                        <div className="cb-search-poster-wrap">
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="cb-search-poster-img"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="cb-search-poster-title" title={movie.title}>
                          {movie.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
