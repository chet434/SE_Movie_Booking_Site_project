import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovieById, getShowsByMovie, getLocations } from '../services/api';
import LocationSelector from '../components/LocationSelector';
import DateSelector from '../components/DateSelector';
import TheatreShows from '../components/TheatreShows';
import { FaStar, FaClock, FaCalendar, FaGlobe, FaPlay, FaArrowLeft } from 'react-icons/fa';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [locations, setLocationsList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [theatreShows, setTheatreShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showsLoading, setShowsLoading] = useState(false);
  const [dates, setDates] = useState([]);

  // Generate next 7 days
  useEffect(() => {
    const nextDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);
      nextDays.push(d.toISOString().split('T')[0]);
    }
    setDates(nextDays);
    setSelectedDate(nextDays[0]);
  }, []);

  useEffect(() => {
    fetchMovie();
    fetchLocations();
  }, [id]);

  useEffect(() => {
    if (selectedDate) {
      fetchShows();
    }
  }, [selectedLocation, selectedDate]);

  const fetchMovie = async () => {
    try {
      const res = await getMovieById(id);
      setMovie(res.data.data);
    } catch (error) {
      console.error('Failed to fetch movie');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await getLocations();
      setLocationsList(res.data.data);
    } catch (error) {
      console.error('Failed to fetch locations');
    }
  };

  const fetchShows = async () => {
    setShowsLoading(true);
    try {
      const params = { movieId: id, date: selectedDate };
      if (selectedLocation) params.location = selectedLocation;
      const res = await getShowsByMovie(params);
      setTheatreShows(res.data.data);
    } catch (error) {
      console.error('Failed to fetch shows');
    } finally {
      setShowsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container py-5 text-center">
        <h4 className="text-muted">Movie not found.</h4>
        <Link to="/" className="btn btn-warning mt-3">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="py-2">
      <Link to="/" className="text-decoration-none mb-4 d-inline-flex align-items-center gap-1 fw-bold" style={{ color: 'var(--cs-text-secondary)' }}>
        <FaArrowLeft /> Back to Movies
      </Link>
      
      <div className="row g-4 mb-5">
        <div className="col-12 col-md-4 col-lg-3" style={{ maxWidth: '280px' }}>
          <img src={movie.poster} alt={`Poster for ${movie.title}`}
            className="w-100"
            style={{ aspectRatio: '2/3', objectFit: 'cover', borderRadius: 'var(--cs-radius-card)' }}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster'; }} />
        </div>
        <div className="col-12 col-md-8 col-lg-9">
          <h1 className="fw-bold mb-3">{movie.title}</h1>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {movie.genre?.map(g => (
              <span key={g} className="badge rounded-pill" style={{ backgroundColor: 'var(--cs-surface-muted)', color: 'var(--cs-text-primary)' }}>{g}</span>
            ))}
          </div>
          <div className="d-flex flex-wrap gap-3 mb-4 text-muted fw-bold">
            <span className="d-flex align-items-center gap-1"><FaStar style={{ color: 'var(--cs-warning)' }} />{movie.rating?.toFixed(1)}/10</span>
            <span>·</span>
            <span className="d-flex align-items-center gap-1"><FaClock />{movie.duration}</span>
            <span>·</span>
            <span className="d-flex align-items-center gap-1"><FaGlobe />{movie.language}</span>
            <span>·</span>
            <span className="d-flex align-items-center gap-1"><FaCalendar />{new Date(movie.releaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <p className="mb-4" style={{ color: 'var(--cs-text-secondary)', lineHeight: '1.6', maxWidth: '800px' }}>{movie.description}</p>
          
          {movie.trailerUrl && (
            <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer"
              className="cs-button-secondary">
              <FaPlay /> Watch Trailer
            </a>
          )}
        </div>
      </div>

      {/* Shows Section */}
      <div>
        <h4 className="fw-bold mb-4">Select Showtime</h4>

        <LocationSelector
          locations={locations}
          selectedLocation={selectedLocation}
          onSelect={setSelectedLocation}
        />

        <DateSelector
          dates={dates}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
        />

        {showsLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-warning spinner-border-sm"></div>
            <span className="ms-2">Loading shows...</span>
          </div>
        ) : (
          <TheatreShows theatreShows={theatreShows} />
        )}
      </div>
    </div>
  );
};

export default MovieDetails;
