import { useState } from 'react';
import { changePassword } from '../services/api';
import { Icon } from '../components/ui';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '', newPassword: '', confirmNewPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await changePassword(formData);
      setMessage(res.data.message);
      setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="card shadow-lg border-0" style={{ borderRadius: 'var(--cs-radius-card)' }}>
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <Icon name="icon-lock" size={36} className="mb-2" style={{ color: 'var(--cs-warning)' }} />
                <h3 className="fw-bold" style={{ color: 'var(--cs-text-primary)' }}>Change Password</h3>
              </div>

              {message && <div className="alert alert-success py-2">{message}</div>}
              {error && <div className="alert alert-danger py-2">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label" style={{ color: 'var(--cs-text-primary)' }}>Current Password</label>
                  <input type="password" className="form-control" name="currentPassword"
                    value={formData.currentPassword} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ color: 'var(--cs-text-primary)' }}>New Password</label>
                  <input type="password" className="form-control" name="newPassword"
                    value={formData.newPassword} onChange={handleChange} required minLength={6} />
                </div>
                <div className="mb-4">
                  <label className="form-label" style={{ color: 'var(--cs-text-primary)' }}>Confirm New Password</label>
                  <input type="password" className="form-control" name="confirmNewPassword"
                    value={formData.confirmNewPassword} onChange={handleChange} required />
                </div>
                <button type="submit" className="cs-button-primary w-100 fw-bold py-2" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
