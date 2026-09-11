import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaFilm, FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <FaFilm size={40} className="text-warning mb-2" />
                <h2 className="fw-bold">Create Account</h2>
                <p className="text-muted">Join MovieBook today</p>
              </div>

              {error && <div className="alert alert-danger py-2">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label"><FaUser className="me-1" />Full Name</label>
                  <input type="text" className="form-control" name="name" value={formData.name}
                    onChange={handleChange} placeholder="Enter your full name" required minLength={2} />
                </div>

                <div className="mb-3">
                  <label className="form-label"><FaEnvelope className="me-1" />Email</label>
                  <input type="email" className="form-control" name="email" value={formData.email}
                    onChange={handleChange} placeholder="Enter your email" required />
                </div>

                <div className="mb-3">
                  <label className="form-label"><FaPhone className="me-1" />Mobile Number</label>
                  <input type="tel" className="form-control" name="phone" value={formData.phone}
                    onChange={handleChange} placeholder="10-digit mobile number" required pattern="\d{10}" />
                </div>

                <div className="mb-3">
                  <label className="form-label"><FaLock className="me-1" />Password</label>
                  <input type="password" className="form-control" name="password" value={formData.password}
                    onChange={handleChange} placeholder="Minimum 6 characters" required minLength={6} />
                </div>

                <div className="mb-4">
                  <label className="form-label"><FaLock className="me-1" />Confirm Password</label>
                  <input type="password" className="form-control" name="confirmPassword" value={formData.confirmPassword}
                    onChange={handleChange} placeholder="Re-enter password" required />
                </div>

                <button type="submit" className="btn btn-warning w-100 fw-bold py-2" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                  Register
                </button>
              </form>

              <p className="text-center mt-3 mb-0">
                Already have an account? <Link to="/login" className="text-warning fw-bold">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
