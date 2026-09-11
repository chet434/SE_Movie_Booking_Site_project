import { useState } from 'react';
import { changePassword } from '../services/api';
import { FaLock } from 'react-icons/fa';

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
          <div className="card shadow-lg border-0" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <FaLock size={36} className="text-warning mb-2" />
                <h3 className="fw-bold">Change Password</h3>
              </div>

              {message && <div className="alert alert-success py-2">{message}</div>}
              {error && <div className="alert alert-danger py-2">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Current Password</label>
                  <input type="password" className="form-control" name="currentPassword"
                    value={formData.currentPassword} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-control" name="newPassword"
                    value={formData.newPassword} onChange={handleChange} required minLength={6} />
                </div>
                <div className="mb-4">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" className="form-control" name="confirmNewPassword"
                    value={formData.confirmNewPassword} onChange={handleChange} required />
                </div>
                <button type="submit" className="btn btn-warning w-100 fw-bold py-2" disabled={loading}>
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
