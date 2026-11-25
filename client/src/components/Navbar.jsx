import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import {
  IconSearch,
  IconMenu2,
  IconUser
} from '@tabler/icons-react';
import LocationModal from './LocationModal';
import AccountDrawer from './AccountDrawer';
import CinebookLogo from './CinebookLogo';
import SearchOverlay from './SearchOverlay';
import '../styles/navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, openAuthModal } = useAuth();
  const { selectedLocation } = useLocationContext();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'Guest';

  return (
    <>
      <header
        className="sticky-top w-100 bg-white"
        style={{
          zIndex: 1040,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}
      >
        {/* ====================================================================
            Top Row: Exact 64px Height, White Bg, Cinebook Logo, Search, Location,
            Auth Controls (State A: Sign in + Hamburger | State B: Avatar + Hi, Name)
            ==================================================================== */}
        <div className="bg-white border-bottom" style={{ borderColor: '#EEEEEE' }}>
          <div
            className="d-flex align-items-center justify-content-between mx-auto px-3"
            style={{ maxWidth: '1240px', height: '64px' }}
          >
            {/* Left Group: Cinebook Brand Logo + Search Bar (~540px) */}
            <div className="d-flex align-items-center gap-4 flex-grow-1 me-3">
              <Link
                to="/"
                className="d-flex align-items-center text-decoration-none flex-shrink-0"
                style={{ userSelect: 'none' }}
                aria-label="cinebook Home"
              >
                <CinebookLogo height={34} />
              </Link>

              {/* Search Bar (width ~540px, height 36px, border 1px solid #E2E2E2, radius 4px) */}
              <div
                role="search"
                onClick={() => setIsSearchOverlayOpen(true)}
                className="d-none d-md-flex align-items-center position-relative flex-grow-1 cursor-pointer"
                style={{ maxWidth: '540px' }}
              >
                <IconSearch
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    color: '#666666',
                    pointerEvents: 'none'
                  }}
                />
                <input
                  type="text"
                  readOnly
                  className="form-control rounded-1 w-100"
                  placeholder="Search for Movies, Events, Plays, Sports and Activities"
                  value={searchQuery}
                  onClick={() => setIsSearchOverlayOpen(true)}
                  onFocus={() => setIsSearchOverlayOpen(true)}
                  style={{
                    height: '36px',
                    paddingLeft: '38px',
                    paddingRight: '14px',
                    fontSize: '14px',
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E2E2',
                    color: '#222222',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            {/* Right Group: Location Selector & Auth-Dependent Controls */}
            <div className="d-flex align-items-center gap-3 flex-shrink-0">
              {/* Mobile Search Button */}
              <button
                type="button"
                className="btn btn-sm d-flex d-md-none align-items-center p-1 text-dark border-0 bg-transparent"
                onClick={() => setIsSearchOverlayOpen(true)}
                aria-label="Open search overlay"
                style={{ cursor: 'pointer' }}
              >
                <IconSearch size={20} color="#222222" />
              </button>

              {/* Location Selector Button */}
              <button
                type="button"
                className="btn btn-sm d-flex align-items-center gap-1 border-0 bg-transparent text-dark p-0"
                onClick={() => setIsLocationModalOpen(true)}
                style={{ fontSize: '14px', fontWeight: 400, color: '#222222', cursor: 'pointer' }}
                aria-label={`Selected City: ${selectedLocation || 'Bhubaneswar'}`}
              >
                <span>{selectedLocation || 'Bhubaneswar'}</span>
                <span style={{ fontSize: '10px', color: '#666666', marginLeft: '3px' }}>▾</span>
              </button>

              {/* Dynamic Auth State Controls */}
              {isAuthenticated ? (
                /* ============================================================
                   STATE B: After Sign In (Logged In)
                   Remove Sign In button & Hamburger.
                   Show single user trigger: 32px circular avatar + Hi, {name}
                   ============================================================ */
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="btn btn-sm border-0 bg-transparent p-0 d-flex align-items-center gap-2"
                  style={{ cursor: 'pointer', outline: 'none' }}
                  aria-label="Account Menu"
                >
                  {/* Circular Avatar (32px, subtle #E0E0E0 ring, #BDBDBD silhouette) */}
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#F5F5F5',
                      border: '1px solid #E0E0E0',
                      color: '#BDBDBD'
                    }}
                  >
                    <IconUser size={18} stroke={1.8} />
                  </div>
                  {/* Greeting */}
                  <span
                    className="d-none d-sm-inline"
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#222222'
                    }}
                  >
                    Hi, {displayName}
                  </span>
                </button>
              ) : (
                /* ============================================================
                   STATE A: Before Sign In (Logged Out)
                   Solid crimson button 'Sign in' (h: 28px, bg: #C41230, text: 12px)
                   + Hamburger icon (3 thin lines, #333333)
                   ============================================================ */
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="btn btn-sm text-white border-0 d-inline-flex align-items-center justify-content-center"
                    style={{
                      height: '28px',
                      padding: '0 16px',
                      backgroundColor: '#C41230',
                      fontSize: '12px',
                      fontWeight: 500,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#A80E28')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#C41230')}
                  >
                    Sign in
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm border-0 bg-transparent p-0 d-flex align-items-center justify-content-center"
                    onClick={() => setIsDrawerOpen(true)}
                    aria-label="Open menu drawer"
                    style={{ cursor: 'pointer', marginLeft: '6px' }}
                  >
                    <IconMenu2 size={24} stroke={1.8} color="#333333" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ====================================================================
            Bottom Row: Sub-Navbar Categories (#F5F5F5 Light Gray, Height: 42px)
            ==================================================================== */}
        <div style={{ backgroundColor: '#F5F5F5', borderBottom: '1px solid #EAEAEA' }}>
          <div
            className="d-flex align-items-center justify-content-between mx-auto px-3 overflow-auto"
            style={{
              maxWidth: '1240px',
              height: '42px',
              scrollbarWidth: 'none'
            }}
          >
            {/* Left Category Links */}
            <div className="d-flex align-items-center gap-4 flex-nowrap" style={{ columnGap: '28px', height: '100%' }}>
              {[
                { name: 'Movies', link: '/movies' },
                { name: 'Stream', link: '/#premieres-section' },
                { name: 'Events', link: '/#music-studio' },
                { name: 'Plays', link: '/#plays' },
                { name: 'Sports', link: '/#sports' },
                { name: 'Activities', link: '/#activities' }
              ].map((cat, i) => {
                const isMovieActive = cat.name === 'Movies' && (location.pathname === '/movies' || location.pathname.startsWith('/explore/movies'));
                const isEventActive = cat.name === 'Events' && location.pathname.startsWith('/events');
                const isStreamActive = cat.name === 'Stream' && (location.pathname.startsWith('/premiere') || location.hash === '#premieres-section');
                const isActive = isMovieActive || isEventActive || isStreamActive;
                return (
                  <Link
                    key={i}
                    to={cat.link}
                    onClick={(e) => {
                      if (cat.name === 'Movies') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else if (cat.name === 'Stream') {
                        e.preventDefault();
                        if (location.pathname === '/') {
                          const el = document.getElementById('premieres-section');
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                          if (location.hash !== '#premieres-section') {
                            navigate('/#premieres-section');
                          }
                        } else {
                          navigate('/#premieres-section');
                        }
                      } else if (cat.name === 'Events' && location.pathname === '/') {
                        const el = document.getElementById('music-studio');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="text-decoration-none position-relative d-flex align-items-center h-100"
                    style={{
                      color: isActive ? '#111111' : '#333333',
                      fontSize: '14px',
                      fontWeight: isActive ? 600 : 400,
                      borderBottom: isActive ? '2px solid #C41230' : '2px solid transparent',
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#C41230')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = isActive ? '#111111' : '#333333')}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </div>

            {/* Right Utility Links */}
            <div className="d-none d-lg-flex align-items-center gap-4 flex-nowrap" style={{ columnGap: '24px' }}>
              {[
                'ListYourShow',
                'Corporates',
                'Offers',
                'Gift Cards'
              ].map((util, i) => (
                <span
                  key={i}
                  className="cursor-pointer"
                  style={{
                    color: '#444444',
                    fontSize: '12px',
                    fontWeight: 400,
                    cursor: 'pointer',
                    transition: 'color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#C41230')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#444444')}
                  onClick={() => alert(`${util} section`)}
                >
                  {util}
                </span>
              ))}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="badge text-decoration-none fw-semibold"
                  style={{
                    backgroundColor: '#C41230',
                    color: '#FFFFFF',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Right-Hand Slide-Over Account Drawer */}
      <AccountDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Location Selector Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {/* Full-Screen Interactive Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOverlayOpen}
        onClose={() => setIsSearchOverlayOpen(false)}
      />
    </>
  );
};

export default Navbar;
