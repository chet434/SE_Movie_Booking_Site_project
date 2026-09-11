import { useState, useEffect } from 'react';
import { getMovies, addMovie, updateMovie, deleteMovie } from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Adventure'];

const emptyMovie = {
  title: '', poster: '', description: '', genre: [], language: 'Hindi',
  duration: '', rating: 0, releaseDate: '', trailerUrl: '', status: 'now-showing'
};

const ManageMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyMovie);
  const [error, setError] = useState('');

  useEffect(() => { fetchMovies(); }, []);

  const fetchMovies = async () => {
    try {
      const res = await getMovies({ status: '' });
      // Fetch all including inactive
      const allRes = await getMovies({});
      setMovies(allRes.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await updateMovie(editing, form);
      } else {
        await addMovie(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyMovie);
      fetchMovies();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save movie.');
    }
  };

  const handleEdit = (movie) => {
    setForm({
      ...movie,
      releaseDate: movie.releaseDate?.split('T')[0] || ''
    });
    setEditing(movie._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Mark this movie as inactive?')) return;
    try {
      await deleteMovie(id);
      fetchMovies();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete movie.');
    }
  };

  const toggleGenre = (g) => {
    setForm(prev => ({
      ...prev,
      genre: prev.genre.includes(g) ? prev.genre.filter(x => x !== g) : [...prev.genre, g]
    }));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Manage Movies</h3>
        <button className="btn btn-warning fw-bold"
          onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyMovie); }}>
          {showForm ? <><FaTimes className="me-1" />Close</> : <><FaPlus className="me-1" />Add Movie</>}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">{editing ? 'Edit Movie' : 'Add New Movie'}</h5>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Title</label>
                  <input type="text" className="form-control" value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Poster URL</label>
                  <input type="url" className="form-control" value={form.poster}
                    onChange={(e) => setForm({ ...form, poster: e.target.value })} required />
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="2" value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                </div>
                <div className="col-12">
                  <label className="form-label">Genre</label>
                  <div className="d-flex flex-wrap gap-2">
                    {GENRES.map(g => (
                      <button type="button" key={g}
                        className={`btn btn-sm ${form.genre.includes(g) ? 'btn-warning' : 'btn-outline-secondary'}`}
                        onClick={() => toggleGenre(g)}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Language</label>
                  <select className="form-select" value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}>
                    {['Hindi', 'English', 'Telugu', 'Tamil', 'Kannada', 'Malayalam'].map(l => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Duration</label>
                  <input type="text" className="form-control" placeholder="2h 30m" value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Rating (0-10)</label>
                  <input type="number" className="form-control" min="0" max="10" step="0.1"
                    value={form.rating} onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Release Date</label>
                  <input type="date" className="form-control" value={form.releaseDate}
                    onChange={(e) => setForm({ ...form, releaseDate: e.target.value })} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Trailer URL</label>
                  <input type="url" className="form-control" value={form.trailerUrl}
                    onChange={(e) => setForm({ ...form, trailerUrl: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="now-showing">Now Showing</option>
                    <option value="coming-soon">Coming Soon</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-warning fw-bold mt-3">
                {editing ? 'Update Movie' : 'Add Movie'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-4"><div className="spinner-border text-warning"></div></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Poster</th>
                <th>Title</th>
                <th>Genre</th>
                <th>Language</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map(movie => (
                <tr key={movie._id}>
                  <td>
                    <img src={movie.poster} alt={movie.title} className="rounded"
                      style={{ width: '40px', height: '60px', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/40x60'; }} />
                  </td>
                  <td className="fw-semibold">{movie.title}</td>
                  <td><small>{movie.genre?.join(', ')}</small></td>
                  <td>{movie.language}</td>
                  <td>{movie.rating?.toFixed(1)}</td>
                  <td>
                    <span className={`badge ${movie.status === 'now-showing' ? 'bg-success' : movie.status === 'coming-soon' ? 'bg-info' : 'bg-secondary'}`}>
                      {movie.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEdit(movie)}>
                      <FaEdit />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(movie._id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageMovies;
