import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaFilm, FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="cs-panel">
            <div className="p-4 p-md-5">
              <div className="text-center mb-4">
                <FaFilm size={40} style={{ color: 'var(--cs-action-primary)' }} className="mb-2" />
                <h2 className="fw-bold">Welcome Back</h2>
                <p className="text-muted">Login to your account</p>
              </div>

              {error && <div className="alert alert-danger py-2">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold"><FaEnvelope className="me-2 text-muted" />Email</label>
                  <input type="email" className="form-control" value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="Enter your email" required />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold"><FaLock className="me-2 text-muted" />Password</label>
                  <input type="password" className="form-control" value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter your password" required />
                </div>

                <button type="submit" className="cs-button-primary w-100" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                  Login
                </button>
              </form>

              <p className="text-center mt-4 mb-0">
                Don't have an account? <Link to="/register" className="fw-bold text-decoration-none" style={{ color: 'var(--cs-action-primary)' }}>Register</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
