import { useState, useEffect } from 'react';
import { getTheatres, addTheatre, updateTheatre, deleteTheatre } from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';

const emptyTheatre = { name: '', location: '', address: '', screens: [{ screenName: 'Screen 1', totalSeats: 48, rows: 6, seatsPerRow: 8 }] };

const ManageTheatres = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyTheatre);
  const [error, setError] = useState('');

  useEffect(() => { fetchTheatres(); }, []);

  const fetchTheatres = async () => {
    try {
      const res = await getTheatres({});
      setTheatres(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await updateTheatre(editing, form);
      } else {
        await addTheatre(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyTheatre);
      fetchTheatres();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save theatre.');
    }
  };

  const handleEdit = (theatre) => {
    setForm(theatre);
    setEditing(theatre._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this theatre?')) return;
    try {
      await deleteTheatre(id);
      fetchTheatres();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete theatre.');
    }
  };

  const addScreen = () => {
    const num = form.screens.length + 1;
    setForm({
      ...form,
      screens: [...form.screens, { screenName: `Screen ${num}`, totalSeats: 48, rows: 6, seatsPerRow: 8 }]
    });
  };

  const removeScreen = (index) => {
    setForm({
      ...form,
      screens: form.screens.filter((_, i) => i !== index)
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Manage Theatres</h3>
        <button className="btn btn-warning fw-bold"
          onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyTheatre); }}>
          {showForm ? <><FaTimes className="me-1" />Close</> : <><FaPlus className="me-1" />Add Theatre</>}
        </button>
      </div>

      {showForm && (
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">{editing ? 'Edit Theatre' : 'Add New Theatre'}</h5>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Location/City</label>
                  <input type="text" className="form-control" value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Address</label>
                  <input type="text" className="form-control" value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                </div>
              </div>

              <div className="mt-3">
                <label className="form-label fw-semibold">Screens</label>
                {form.screens.map((screen, i) => (
                  <div key={i} className="d-flex align-items-center gap-2 mb-2">
                    <input type="text" className="form-control form-control-sm" value={screen.screenName}
                      onChange={(e) => {
                        const screens = [...form.screens];
                        screens[i] = { ...screens[i], screenName: e.target.value };
                        setForm({ ...form, screens });
                      }} style={{ maxWidth: '200px' }} />
                    <small className="text-muted">{screen.rows}×{screen.seatsPerRow} = {screen.totalSeats} seats</small>
                    {form.screens.length > 1 && (
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeScreen(i)}>
                        <FaTimes />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addScreen}>
                  <FaPlus className="me-1" /> Add Screen
                </button>
              </div>

              <button type="submit" className="btn btn-warning fw-bold mt-3">
                {editing ? 'Update Theatre' : 'Add Theatre'}
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
                <th>Name</th>
                <th>Location</th>
                <th>Address</th>
                <th>Screens</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {theatres.map(theatre => (
                <tr key={theatre._id}>
                  <td className="fw-semibold">{theatre.name}</td>
                  <td><FaMapMarkerAlt className="text-danger me-1" size={12} />{theatre.location}</td>
                  <td><small>{theatre.address}</small></td>
                  <td>{theatre.screens?.length || 0}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEdit(theatre)}>
                      <FaEdit />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(theatre._id)}>
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

export default ManageTheatres;
