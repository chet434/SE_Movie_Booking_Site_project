import { useState, useEffect } from 'react';
import { getMovies, getLocations } from '../services/api';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import { FaFilm } from 'react-icons/fa';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [locations, setLocationsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ genre: '', language: '', location: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMovies();
    }, 300); // debounce search
    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  const fetchLocations = async () => {
    try {
      const res = await getLocations();
      setLocationsList(res.data.data);
    } catch (error) {
      console.error('Failed to fetch locations');
    }
  };

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (filters.genre) params.genre = filters.genre;
      if (filters.language) params.language = filters.language;

      const res = await getMovies(params);
      setMovies(res.data.data);
    } catch (error) {
      console.error('Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="fw-bold mb-2">Movies</h1>
        <p className="text-muted mb-4">Find movies, select seats, and book tickets</p>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </div>
          <div className="col-12 col-md-6">
            <FilterPanel filters={filters} setFilters={setFilters} locations={locations} />
          </div>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-secondary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-5">
            <FaFilm size={48} className="text-muted mb-3" />
            <h5 className="text-muted">
              {searchQuery || filters.genre || filters.language
                ? 'No movies match these filters. Try another date or clear filters.'
                : 'No movies available.'}
            </h5>
          </div>
        ) : (
          <>
            <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
              {searchQuery ? `Results for "${searchQuery}"` : 'Now Showing'}
              <span className="badge rounded-pill" style={{ backgroundColor: 'var(--cs-surface-muted)', color: 'var(--cs-text-primary)' }}>{movies.length}</span>
            </h4>
            <div className="row">
              {movies.map(movie => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
