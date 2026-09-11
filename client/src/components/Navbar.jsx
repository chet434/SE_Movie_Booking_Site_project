import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaFilm, FaUser, FaSignOutAlt, FaTicketAlt, FaTachometerAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top" style={{ backgroundColor: 'var(--cs-canvas)', borderBottom: '1px solid var(--cs-border)', minHeight: '72px' }}>
      <div className="container-fluid px-md-4">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/" style={{ color: 'var(--cs-text-primary)' }}>
          <FaFilm size={24} style={{ color: 'var(--cs-action-primary)' }} />
          <span>FilmTIX</span>
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto fw-bold">
            <li className="nav-item">
              <Link className="nav-link" to="/" style={{ color: 'var(--cs-text-primary)' }}>Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/movies" style={{ color: 'var(--cs-text-primary)' }}>Movies</Link>
            </li>
          </ul>

          <ul className="navbar-nav align-items-center fw-bold">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin" style={{ color: 'var(--cs-warning)' }}>
                      <FaTachometerAlt className="me-1" />Admin
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link className="nav-link" to="/my-bookings" style={{ color: 'var(--cs-text-primary)' }}>
                    <FaTicketAlt className="me-1" />My Bookings
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" style={{ color: 'var(--cs-text-primary)' }}>
                    <FaUser className="me-1" />{user.name}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0" style={{ backgroundColor: 'var(--cs-surface)', borderRadius: '12px' }}>
                    <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                    <li><Link className="dropdown-item" to="/change-password">Change Password</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger fw-bold" onClick={handleLogout}>
                        <FaSignOutAlt className="me-1" />Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login" style={{ color: 'var(--cs-text-primary)' }}>Login</Link>
                </li>
                <li className="nav-item ms-lg-3">
                  <Link className="cs-button-primary" to="/register" style={{ minHeight: '36px', padding: '6px 16px' }}>Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
