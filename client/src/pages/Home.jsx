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
      {/* Hero Banner */}
      <div className="bg-dark text-white py-5 mb-4"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
        }}>
        <div className="container text-center">
          <h1 className="fw-bold display-5 mb-2">
            <FaFilm className="text-warning me-2" />
            Book Your Movie Tickets
          </h1>
          <p className="text-muted mb-4">Find movies, select seats, and book in minutes</p>
          <div className="row justify-content-center">
            <div className="col-md-6">
              <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <FilterPanel filters={filters} setFilters={setFilters} locations={locations} />

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-5">
            <FaFilm size={48} className="text-muted mb-3" />
            <h5 className="text-muted">
              {searchQuery || filters.genre || filters.language
                ? 'No movies found for the selected filters.'
                : 'No movies available.'}
            </h5>
          </div>
        ) : (
          <>
            <h4 className="fw-bold mb-3">
              {searchQuery ? `Results for "${searchQuery}"` : 'Now Showing'}
              <span className="badge bg-warning text-dark ms-2">{movies.length}</span>
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
