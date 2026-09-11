import { useState, useEffect } from 'react';
import { getAllShows, addShow, updateShow, deleteShow, getMovies, getTheatres } from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

const emptyShow = {
  movie: '', theatre: '', screenName: '', date: '', startTime: '',
  format: '2D', seatPrices: { regular: 150, premium: 250 }
};

const ManageShows = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyShow);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [showsRes, moviesRes, theatresRes] = await Promise.all([
        getAllShows(),
        getMovies({ status: 'now-showing' }),
        getTheatres({})
      ]);
      setShows(showsRes.data.data);
      setMovies(moviesRes.data.data);
      setTheatres(theatresRes.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const getScreensForTheatre = () => {
    const theatre = theatres.find(t => t._id === form.theatre);
    return theatre?.screens || [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await updateShow(editing, form);
      } else {
        await addShow(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyShow);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save show.');
    }
  };

  const handleEdit = (show) => {
    setForm({
      movie: show.movie?._id || '',
      theatre: show.theatre?._id || '',
      screenName: show.screenName || '',
      date: show.date?.split('T')[0] || '',
      startTime: show.startTime || '',
      format: show.format || '2D',
      seatPrices: show.seatPrices || { regular: 150, premium: 250 }
    });
    setEditing(show._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this show?')) return;
    try {
      await deleteShow(id);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete show.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Manage Shows</h3>
        <button className="btn btn-warning fw-bold"
          onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyShow); }}>
          {showForm ? <><FaTimes className="me-1" />Close</> : <><FaPlus className="me-1" />Add Show</>}
        </button>
      </div>

      {showForm && (
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">{editing ? 'Edit Show' : 'Add New Show'}</h5>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Movie</label>
                  <select className="form-select" value={form.movie}
                    onChange={(e) => setForm({ ...form, movie: e.target.value })} required>
                    <option value="">Select Movie</option>
                    {movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Theatre</label>
                  <select className="form-select" value={form.theatre}
                    onChange={(e) => setForm({ ...form, theatre: e.target.value, screenName: '' })} required>
                    <option value="">Select Theatre</option>
                    {theatres.map(t => <option key={t._id} value={t._id}>{t.name} — {t.location}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Screen</label>
                  <select className="form-select" value={form.screenName}
                    onChange={(e) => setForm({ ...form, screenName: e.target.value })} required>
                    <option value="">Select Screen</option>
                    {getScreensForTheatre().map(s => (
                      <option key={s.screenName} value={s.screenName}>{s.screenName}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })} required
                    min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Start Time</label>
                  <input type="text" className="form-control" placeholder="e.g. 10:00 AM" value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Format</label>
                  <select className="form-select" value={form.format}
                    onChange={(e) => setForm({ ...form, format: e.target.value })}>
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Regular Price (₹)</label>
                  <input type="number" className="form-control" value={form.seatPrices.regular}
                    onChange={(e) => setForm({ ...form, seatPrices: { ...form.seatPrices, regular: parseInt(e.target.value) || 0 } })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Premium Price (₹)</label>
                  <input type="number" className="form-control" value={form.seatPrices.premium}
                    onChange={(e) => setForm({ ...form, seatPrices: { ...form.seatPrices, premium: parseInt(e.target.value) || 0 } })} />
                </div>
              </div>
              <button type="submit" className="btn btn-warning fw-bold mt-3">
                {editing ? 'Update Show' : 'Add Show'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4"><div className="spinner-border text-warning"></div></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Movie</th>
                <th>Theatre</th>
                <th>Screen</th>
                <th>Date</th>
                <th>Time</th>
                <th>Format</th>
                <th>Booked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shows.map(show => (
                <tr key={show._id}>
                  <td className="fw-semibold">{show.movie?.title}</td>
                  <td>{show.theatre?.name}</td>
                  <td>{show.screenName}</td>
                  <td>{show.date && new Date(show.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td>{show.startTime}</td>
                  <td><span className="badge bg-secondary">{show.format}</span></td>
                  <td>{show.bookedSeats?.length || 0}/48</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEdit(show)}>
                      <FaEdit />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(show._id)}>
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

export default ManageShows;
