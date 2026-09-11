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
    <div>
      {/* Movie Banner */}
      <div className="bg-dark text-white py-4"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="container">
          <Link to="/" className="text-warning text-decoration-none mb-3 d-inline-block">
            <FaArrowLeft className="me-1" /> Back to Movies
          </Link>
          <div className="row g-4">
            <div className="col-md-3">
              <img src={movie.poster} alt={movie.title}
                className="img-fluid rounded shadow"
                style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster'; }} />
            </div>
            <div className="col-md-9">
              <h2 className="fw-bold">{movie.title}</h2>
              <div className="d-flex flex-wrap gap-2 mb-2">
                {movie.genre?.map(g => (
                  <span key={g} className="badge bg-secondary">{g}</span>
                ))}
              </div>
              <div className="d-flex flex-wrap gap-3 mb-3 text-muted">
                <span><FaStar className="text-warning me-1" />{movie.rating?.toFixed(1)}/10</span>
                <span><FaClock className="me-1" />{movie.duration}</span>
                <span><FaGlobe className="me-1" />{movie.language}</span>
                <span><FaCalendar className="me-1" />{new Date(movie.releaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <p className="mb-3" style={{ color: '#ccc' }}>{movie.description}</p>
              {movie.trailerUrl && (
                <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer"
                  className="btn btn-outline-light btn-sm">
                  <FaPlay className="me-1" /> Watch Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shows Section */}
      <div className="container py-4">
        <h4 className="fw-bold mb-3">Book Tickets</h4>

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
