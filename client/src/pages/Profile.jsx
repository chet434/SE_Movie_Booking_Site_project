import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import { Icon } from '../components/ui';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await updateProfile({ name, phone });
      updateUser(res.data.data);
      setMessage('Profile updated successfully.');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0" style={{ borderRadius: 'var(--cs-radius-card)' }}>
            <div className="card-header" style={{
              backgroundColor: 'var(--cs-surface-raised)',
              borderRadius: 'var(--cs-radius-card) var(--cs-radius-card) 0 0',
              borderBottom: '1px solid var(--cs-border)'
            }}>
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                style={{ width: '64px', height: '64px', backgroundColor: 'var(--cs-accent-soft)' }}
              >
                <Icon name="icon-user" size={28} color="var(--cs-accent)" />
              </div>
              <h3 className="fw-bold mb-0" style={{ color: 'var(--cs-text-primary)' }}>{user.name}</h3>
              <span
                className="badge rounded-pill"
                style={{ backgroundColor: 'var(--cs-accent)', color: 'var(--cs-text-on-accent)', marginTop: '8px' }}
              >
                {user.role}
              </span>
            </div>

            <div className="card-body p-4" style={{ backgroundColor: 'var(--cs-surface)' }}>
              {message && <div className="alert alert-success py-2">{message}</div>}
              {error && <div className="alert alert-danger py-2">{error}</div>}

              {!editing ? (
                <div>
                  <div className="d-flex align-items-center mb-3">
                    <Icon name="icon-user" className="me-3" size={18} style={{ color: 'var(--cs-warning)' }} />
                    <div>
                      <small className="text-muted">Full Name</small>
                      <p className="mb-0 fw-semibold" style={{ color: 'var(--cs-text-primary)' }}>{user.name}</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <Icon name="icon-mail" className="me-3" size={18} style={{ color: 'var(--cs-warning)' }} />
                    <div>
                      <small className="text-muted">Email</small>
                      <p className="mb-0 fw-semibold" style={{ color: 'var(--cs-text-primary)' }}>{user.email}</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <Icon name="icon-phone" className="me-3" size={18} style={{ color: 'var(--cs-warning)' }} />
                    <div>
                      <small className="text-muted">Mobile Number</small>
                      <p className="mb-0 fw-semibold" style={{ color: 'var(--cs-text-primary)' }}>{user.phone}</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <Icon name="icon-shield-check" className="me-3" size={18} style={{ color: 'var(--cs-warning)' }} />
                    <div>
                      <small className="text-muted">Role</small>
                      <p className="mb-0 fw-semibold text-capitalize" style={{ color: 'var(--cs-text-primary)' }}>{user.role}</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <Icon name="icon-calendar-event" className="me-3" size={18} style={{ color: 'var(--cs-warning)' }} />
                    <div>
                      <small className="text-muted">Member Since</small>
                      <p className="mb-0 fw-semibold" style={{ color: 'var(--cs-text-primary)' }}>{new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>

                  <button className="cs-button-primary w-100 fw-bold mt-3" onClick={() => setEditing(true)}>
                    Edit Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label" style={{ color: 'var(--cs-text-primary)' }}>Full Name</label>
                    <input type="text" className="form-control" value={name}
                      onChange={(e) => setName(e.target.value)} required minLength={2} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" style={{ color: 'var(--cs-text-primary)' }}>Mobile Number</label>
                    <input type="tel" className="form-control" value={phone}
                      onChange={(e) => setPhone(e.target.value)} required pattern="\d{10}" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" style={{ color: 'var(--cs-text-secondary)' }}>Email (cannot be changed)</label>
                    <input type="email" className="form-control" value={user.email} disabled />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="cs-button-primary flex-fill fw-bold" disabled={loading}>
                      {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                      Save
                    </button>
                    <button type="button" className="btn"
                      style={{
                        backgroundColor: 'var(--cs-surface-muted)',
                        color: 'var(--cs-text-primary)',
                        border: '1px solid var(--cs-border)'
                      }}
                      onClick={() => { setEditing(false); setName(user.name); setPhone(user.phone); }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
