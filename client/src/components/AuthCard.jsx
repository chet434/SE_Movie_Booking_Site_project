import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CinebookLogo from './CinebookLogo';
import { IconEye, IconEyeOff, IconX, IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import '../styles/auth.css';

// SVG for Multicolor Google "G" Icon
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

// SVG for Solid Black Apple Logo
const AppleIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="#000000" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.87-.96.04-2.13.64-2.77 1.39-.57.65-.99 1.72-.94 2.76 1.07.08 2.08-.53 2.7-1.28"/>
  </svg>
);

const AuthCard = ({
  initialMode = 'login', // 'login' | 'register'
  onClose = null,
  isModal = false
}) => {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'mobile'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');

  // Notifications and statuses
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, closeAuthModal } = useAuth();
  const navigate = useNavigate();

  const handleClose = () => {
    if (onClose) onClose();
    else closeAuthModal();
  };

  const handleSocialClick = (provider) => {
    setError('');
    setNotice(`${provider} sign-in is coming soon. Please continue with Email & Password.`);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleForgotPassword = () => {
    setError('');
    setNotice('Password reset instructions will be sent to your email once the mail service is active.');
    setTimeout(() => setNotice(''), 4000);
  };

  const handleMobileSubmit = (e) => {
    e.preventDefault();
    setError('');
    setNotice(`Mobile OTP ${mode === 'login' ? 'login' : 'registration'} is coming soon. Please sign in with Email & Password.`);
    setTimeout(() => setNotice(''), 4500);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          setError('Please enter both email address and password.');
          setLoading(false);
          return;
        }

        await login(email.trim(), password);
        handleClose();
        navigate('/');
      } else {
        // Register validation
        if (!name.trim() || name.trim().length < 2) {
          setError('Full name must be at least 2 characters long.');
          setLoading(false);
          return;
        }
        if (!email.trim()) {
          setError('Email address is required.');
          setLoading(false);
          return;
        }
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length !== 10) {
          setError('Please enter a valid 10-digit mobile number.');
          setLoading(false);
          return;
        }
        if (!password || password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }

        await register({
          name: name.trim(),
          email: email.trim(),
          phone: cleanPhone,
          password,
          confirmPassword
        });

        handleClose();
        navigate('/');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Authentication failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cb-auth-card">
      {/* Optional Close Button for Modals */}
      {isModal && (
        <button
          type="button"
          onClick={handleClose}
          className="position-absolute border-0 bg-transparent p-1"
          style={{ top: '16px', right: '16px', cursor: 'pointer', color: '#777777' }}
          aria-label="Close"
        >
          <IconX size={20} />
        </button>
      )}

      {/* Brand Logo */}
      <div className="d-flex justify-content-center">
        <CinebookLogo height={32} />
      </div>

      {/* Headings */}
      <h2 className="cb-auth-heading">
        {mode === 'login' ? 'Get Started' : 'Create an Account'}
      </h2>
      <p className="cb-auth-subheading">
        {mode === 'login'
          ? 'Login or register to continue'
          : 'Sign up to start booking movies'}
      </p>

      {/* Social Login Buttons */}
      <div className="d-flex flex-column gap-2 mb-3">
        <button
          type="button"
          className="cb-social-btn"
          onClick={() => handleSocialClick('Google')}
        >
          <GoogleIcon />
          <span>{mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}</span>
        </button>

        <button
          type="button"
          className="cb-social-btn"
          onClick={() => handleSocialClick('Apple')}
        >
          <AppleIcon />
          <span>{mode === 'login' ? 'Continue with Apple' : 'Sign up with Apple'}</span>
        </button>
      </div>

      {/* OR Divider */}
      <div className="cb-auth-divider">
        <span>OR</span>
      </div>

      {/* Interactive Tab Switcher */}
      <div className="cb-auth-tabs">
        <button
          type="button"
          className={`cb-auth-tab ${activeTab === 'email' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('email');
            setError('');
            setNotice('');
          }}
        >
          Email &amp; Password
        </button>
        <button
          type="button"
          className={`cb-auth-tab ${activeTab === 'mobile' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('mobile');
            setError('');
            setNotice('');
          }}
        >
          Mobile &amp; OTP
        </button>
      </div>

      {/* Error & Notice Feedback */}
      {error && (
        <div
          className="alert py-2 px-3 mb-3 d-flex align-items-center gap-2 small"
          style={{
            backgroundColor: '#FFF0F2',
            border: '1px solid #FFD0D6',
            color: '#C41230',
            borderRadius: '6px'
          }}
        >
          <IconAlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div
          className="alert py-2 px-3 mb-3 d-flex align-items-center gap-2 small"
          style={{
            backgroundColor: '#F0F7FF',
            border: '1px solid #C8E1FF',
            color: '#0052CC',
            borderRadius: '6px'
          }}
        >
          <IconInfoCircle size={18} className="flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* TAB 1: Email & Password (LIVE) */}
      {activeTab === 'email' && (
        <form onSubmit={handleEmailSubmit}>
          {mode === 'register' && (
            <div className="cb-form-group">
              <label className="cb-form-label">Full Name</label>
              <input
                type="text"
                className="cb-form-input"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </div>
          )}

          <div className="cb-form-group">
            <label className="cb-form-label">Email Address</label>
            <input
              type="email"
              className="cb-form-input"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="cb-form-group">
              <label className="cb-form-label">Mobile Number</label>
              <div className="cb-phone-group">
                <span className="cb-phone-prefix">🇮🇳 +91 ▾</span>
                <input
                  type="tel"
                  className="cb-phone-input"
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  required
                />
              </div>
            </div>
          )}

          <div className="cb-form-group">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <label className="cb-form-label mb-0">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  className="btn btn-link p-0 cb-auth-link"
                  style={{ fontSize: '12px' }}
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="cb-password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                className="cb-form-input"
                placeholder={mode === 'login' ? 'Enter password' : 'Create a password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="cb-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="cb-form-group">
              <label className="cb-form-label">Confirm Password</label>
              <div className="cb-password-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="cb-form-input"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="cb-password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="cb-auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            ) : mode === 'login' ? (
              'Continue'
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      )}

      {/* TAB 2: Mobile & OTP (Honest Fallback) */}
      {activeTab === 'mobile' && (
        <form onSubmit={handleMobileSubmit}>
          {mode === 'register' && (
            <div className="cb-form-group">
              <label className="cb-form-label">Full Name</label>
              <input
                type="text"
                className="cb-form-input"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="cb-form-group">
            <label className="cb-form-label">Mobile Number</label>
            <div className="cb-phone-group">
              <span className="cb-phone-prefix">🇮🇳 +91 ▾</span>
              <input
                type="tel"
                className="cb-phone-input"
                placeholder="Enter mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
              />
            </div>
          </div>

          <div className="cb-form-group">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <label className="cb-form-label mb-0">One-Time Password (OTP)</label>
              <button
                type="button"
                className="btn btn-link p-0 cb-auth-link"
                style={{ fontSize: '12px' }}
                onClick={() => {
                  setNotice('OTP service is integrating. Please use Email & Password.');
                  setTimeout(() => setNotice(''), 3500);
                }}
              >
                {mode === 'login' ? 'Resend OTP' : 'Send OTP'}
              </button>
            </div>
            <input
              type="text"
              className="cb-form-input"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            className="cb-auth-submit-btn"
          >
            {mode === 'login' ? 'Continue with OTP' : 'Register with OTP'}
          </button>
        </form>
      )}

      {/* Footer Legal Text */}
      <p className="cb-legal-text">
        By continuing, you agree to our{' '}
        <span className="cb-auth-link">Terms &amp; Conditions</span> and{' '}
        <span className="cb-auth-link">Privacy Policy</span>.
      </p>

      {/* Bottom Switcher */}
      <div className="cb-auth-footer-toggle">
        {mode === 'login' ? (
          <span>
            New to cinebook?{' '}
            <button
              type="button"
              className="btn btn-link p-0 cb-auth-link fw-semibold"
              onClick={() => {
                setMode('register');
                setError('');
                setNotice('');
              }}
            >
              Create an Account
            </button>
          </span>
        ) : (
          <span>
            Already have an account?{' '}
            <button
              type="button"
              className="btn btn-link p-0 cb-auth-link fw-semibold"
              onClick={() => {
                setMode('login');
                setError('');
                setNotice('');
              }}
            >
              Log In
            </button>
          </span>
        )}
      </div>
    </div>
  );
};

export default AuthCard;
