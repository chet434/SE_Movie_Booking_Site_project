import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStreamLibrary } from '../utils/premiereHelper';
import {
  IconBell,
  IconShoppingBag,
  IconHeart,
  IconDeviceTv,
  IconCreditCard,
  IconMessageCircle,
  IconSettings,
  IconGift,
  IconWorld,
  IconLock,
  IconChevronRight,
  IconUser,
  IconInfoCircle,
  IconX
} from '@tabler/icons-react';

const AccountDrawer = ({ isOpen, onClose }) => {
  const { isAuthenticated, user, logout, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [streamItems, setStreamItems] = useState([]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignOut = () => {
    logout();
    onClose();
    navigate('/');
  };

  const handleOpenAuth = () => {
    onClose();
    openAuthModal('login');
  };

  // 9 Menu items in exact required order
  const MENU_ITEMS = [
    {
      id: 1,
      title: 'Notifications',
      subtitle: null,
      icon: IconBell,
      requiresAuth: false,
      onClick: () => {
        alert('You have no new notifications.');
      }
    },
    {
      id: 2,
      title: 'Your Orders',
      subtitle: 'View all your bookings & purchases',
      icon: IconShoppingBag,
      requiresAuth: true,
      onClick: () => {
        if (isAuthenticated) {
          onClose();
          navigate('/my-bookings');
        } else {
          handleOpenAuth();
        }
      }
    },
    {
      id: 3,
      title: 'Your Wishlist',
      subtitle: null,
      icon: IconHeart,
      requiresAuth: false,
      onClick: () => {
        alert('Wishlist is empty.');
      }
    },
    {
      id: 4,
      title: 'Stream Library',
      subtitle: 'Rented & Purchased Movies',
      icon: IconDeviceTv,
      requiresAuth: true,
      onClick: () => {
        if (isAuthenticated) {
          setStreamItems(getStreamLibrary(user?._id));
          setShowStreamModal(true);
        } else {
          handleOpenAuth();
        }
      }
    },
    {
      id: 5,
      title: 'Play Credit Card',
      subtitle: 'View your Play Credit Card details and offers',
      icon: IconCreditCard,
      hasNewBadge: true,
      requiresAuth: false,
      onClick: () => {
        alert('Play Credit Card: Get 5% cashback on all cinebook movie tickets!');
      }
    },
    {
      id: 6,
      title: 'Help & Support',
      subtitle: 'View commonly asked queries and Chat',
      icon: IconMessageCircle,
      requiresAuth: false,
      onClick: () => {
        alert('Help & Support: How can we assist you today?');
      }
    },
    {
      id: 7,
      title: 'Accounts & Settings',
      subtitle: 'Location, Payments, Permissions & More',
      icon: IconSettings,
      requiresAuth: true,
      onClick: () => {
        if (isAuthenticated) {
          onClose();
          navigate('/profile');
        } else {
          handleOpenAuth();
        }
      }
    },
    {
      id: 8,
      title: 'Rewards',
      subtitle: 'View your rewards & unlock new ones',
      icon: IconGift,
      requiresAuth: false,
      onClick: () => {
        alert('Rewards: Explore your CinePoints and exclusive discount vouchers.');
      }
    },
    {
      id: 9,
      title: 'BookAChange',
      subtitle: null,
      icon: IconWorld,
      requiresAuth: false,
      onClick: () => {
        alert('BookAChange: Every small round-up goes towards empowering young artists.');
      }
    }
  ];

  // Conditional check for missing email (e.g. mobile OTP login or guest account)
  const isEmailMissing = isAuthenticated && (!user?.email || user?.email.endsWith('@cinebook.in') || user?.name === 'Guest' || user?.emailMissing);

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1060,
        backdropFilter: 'blur(2px)',
        transition: 'opacity 0.25s ease'
      }}
      onClick={onClose}
    >
      {/* Slide-Over Panel (Width: 360px, Max-W: 90vw, White bg) */}
      <div
        className="position-absolute top-0 end-0 h-100 bg-white d-flex flex-column"
        style={{
          width: '360px',
          maxWidth: '90vw',
          zIndex: 1061,
          boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.15)',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ====================================================================
            DRAWER HEADER
            ==================================================================== */}
        {isAuthenticated ? (
          /* State B: Logged In Header */
          <div
            className="d-flex align-items-center justify-content-between border-bottom"
            style={{ padding: '16px 20px', borderColor: '#EEEEEE' }}
          >
            <div>
              <h3
                className="mb-0 fw-bold"
                style={{ fontSize: '22px', color: '#222222', lineHeight: 1.2 }}
              >
                Hey!
              </h3>
              <button
                type="button"
                className="border-0 bg-transparent p-0 text-decoration-none d-flex align-items-center gap-1 mt-1"
                style={{
                  fontSize: '13px',
                  color: '#666666',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#C41230')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#666666')}
                onClick={() => {
                  onClose();
                  navigate('/profile');
                }}
              >
                <span>Edit Profile</span>
                <span style={{ fontSize: '11px' }}>&rsaquo;</span>
              </button>
            </div>

            {/* Circular User Profile Avatar (42px) */}
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '42px',
                height: '42px',
                backgroundColor: '#EAEAEA',
                border: '1px solid #D8D8D8',
                color: '#757575'
              }}
            >
              <IconUser size={26} stroke={1.8} />
            </div>
          </div>
        ) : (
          /* State A: Logged Out Header */
          <div
            className="d-flex align-items-center justify-content-between border-bottom"
            style={{ padding: '18px 20px', borderColor: '#EEEEEE' }}
          >
            <h3
              className="mb-0 fw-bold"
              style={{ fontSize: '22px', color: '#222222', lineHeight: 1.2 }}
            >
              Hey!
            </h3>
            <button
              type="button"
              className="border-0 bg-transparent p-1 text-muted"
              onClick={onClose}
              aria-label="Close drawer"
              style={{ cursor: 'pointer' }}
            >
              <IconX size={20} color="#888888" />
            </button>
          </div>
        )}

        {/* ====================================================================
            STATE B CONDITIONAL: Yellow Email Alert Banner
            (Displayed if email address is unlinked / missing)
            ==================================================================== */}
        {isAuthenticated && isEmailMissing && (
          <div
            className="d-flex align-items-center justify-content-between cursor-pointer"
            style={{
              backgroundColor: '#FFF1C2',
              padding: '12px 20px',
              borderBottom: '1px solid #FFE494',
              cursor: 'pointer'
            }}
            onClick={() => {
              onClose();
              navigate('/profile');
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <IconInfoCircle size={20} color="#8A6D3B" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#222222' }}>
                  Get tickets on Email!
                </div>
                <div style={{ fontSize: '12px', color: '#444444' }}>
                  Add your Email Address
                </div>
              </div>
            </div>
            <IconChevronRight size={18} color="#8A6D3B" />
          </div>
        )}

        {/* ====================================================================
            STATE A: Auth Promo Strip (Logged Out)
            ==================================================================== */}
        {!isAuthenticated && (
          <div
            className="d-flex align-items-center justify-content-between"
            style={{
              padding: '14px 20px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              borderBottom: '1px solid #EEEEEE'
            }}
          >
            {/* Left 40px Circular Dark-Navy Badge with colorful gift icon */}
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#1E2238'
              }}
            >
              {/* Colorful gift icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="10" width="18" height="11" rx="2" fill="#E02424" />
                <rect x="2" y="6" width="20" height="4" rx="1" fill="#FF5A1F" />
                <rect x="11" y="6" width="2" height="15" fill="#FACA15" />
                <path d="M12 6C12 6 10 2 6.5 2C4.5 2 3.5 3.5 4 5C4.5 6 12 6 12 6Z" fill="#FACA15" />
                <path d="M12 6C12 6 14 2 17.5 2C19.5 2 20.5 3.5 20 5C19.5 6 12 6 12 6Z" fill="#FACA15" />
              </svg>
            </div>

            {/* Center two-line slate-blue text */}
            <div className="flex-grow-1 mx-3" style={{ maxWidth: '170px' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#5C6B8A',
                  lineHeight: '1.3'
                }}
              >
                Unlock special offers &amp; great benefits
              </div>
            </div>

            {/* Right: Outlined red CTA button "Login / Register" */}
            <button
              type="button"
              onClick={handleOpenAuth}
              className="border flex-shrink-0 text-nowrap"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#C41230',
                color: '#C41230',
                fontSize: '12px',
                fontWeight: 600,
                padding: '7px 12px',
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgba(196, 18, 48, 0.1)',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease, color 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#C41230';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.color = '#C41230';
              }}
            >
              Login / Register
            </button>
          </div>
        )}

        {/* ====================================================================
            SCROLLABLE MENU LIST (9 rows in exact order)
            ==================================================================== */}
        <div className="flex-grow-1 overflow-auto" style={{ scrollbarWidth: 'thin' }}>
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            // A row is locked if user is logged out AND item requires auth
            const isLocked = !isAuthenticated && item.requiresAuth;

            return (
              <div
                key={item.id}
                onClick={item.onClick}
                className="d-flex align-items-center justify-content-between border-bottom cursor-pointer"
                style={{
                  padding: '14px 20px',
                  borderColor: '#F0F0F0',
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FAFAFA';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                {/* Left: Icon + Title + Subtitle */}
                <div className="d-flex align-items-start gap-3">
                  <div
                    className="mt-1 flex-shrink-0"
                    style={{ color: isLocked ? '#B0B0B0' : '#333333' }}
                  >
                    <Icon size={20} stroke={1.8} />
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: isLocked ? '#B0B0B0' : '#333333'
                        }}
                      >
                        {item.title}
                      </span>
                      {item.hasNewBadge && (
                        <span
                          className="badge rounded-1"
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '2px 4px',
                            backgroundColor: '#C41230',
                            color: '#FFFFFF',
                            letterSpacing: '0.5px'
                          }}
                        >
                          NEW
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: isLocked ? '#B0B0B0' : '#757575',
                          marginTop: '2px',
                          lineHeight: '1.3'
                        }}
                      >
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Chevron > if active, Padlock icon if locked */}
                <div className="flex-shrink-0 ms-2">
                  {isLocked ? (
                    <IconLock size={15} color="#B0B0B0" />
                  ) : (
                    <IconChevronRight size={16} color="#888888" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ====================================================================
            STATE B STICKY FOOTER: Sign Out Button (Logged In Only)
            ==================================================================== */}
        {isAuthenticated && (
          <div
            className="p-3 bg-white border-top flex-shrink-0"
            style={{
              borderColor: '#EEEEEE',
              boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.04)'
            }}
          >
            <button
              type="button"
              onClick={handleSignOut}
              className="w-100 border d-flex align-items-center justify-content-center"
              style={{
                height: '42px',
                backgroundColor: '#FFFFFF',
                borderColor: '#C41230',
                color: '#C41230',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FFF5F6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              Sign out
            </button>
          </div>
        )}
        {/* ====================================================================
            STREAM LIBRARY INNER VIEW (When clicked)
            ==================================================================== */}
        {showStreamModal && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 bg-white d-flex flex-column"
            style={{
              zIndex: 1065,
              animation: 'fadeIn 0.2s ease',
              fontFamily: "'Inter', -apple-system, sans-serif"
            }}
          >
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom" style={{ borderColor: '#EEEEEE' }}>
              <div className="d-flex align-items-center gap-2">
                <IconDeviceTv size={22} color="#E53955" />
                <h4 className="mb-0 fw-bold" style={{ fontSize: '18px', color: '#111111' }}>
                  Stream Library
                </h4>
              </div>
              <button
                type="button"
                className="border-0 bg-transparent p-1 text-muted"
                onClick={() => setShowStreamModal(false)}
                aria-label="Close Stream Library"
                style={{ cursor: 'pointer' }}
              >
                <IconX size={20} color="#888888" />
              </button>
            </div>

            {/* List */}
            <div className="flex-grow-1 overflow-auto p-3" style={{ scrollbarWidth: 'thin' }}>
              {streamItems.length === 0 ? (
                <div className="text-center py-5">
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: '60px', height: '60px', backgroundColor: '#F8F9FA' }}
                  >
                    <IconDeviceTv size={32} color="#A0AEC0" />
                  </div>
                  <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '15px' }}>
                    Your Stream Library is empty
                  </h6>
                  <p className="text-muted small mb-4" style={{ fontSize: '13px', lineHeight: 1.5 }}>
                    Rent or purchase movies from our Premiere lineup to stream anytime at home.
                  </p>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm px-4 py-2 rounded-2 fw-semibold"
                    style={{ backgroundColor: '#E53955', borderColor: '#E53955' }}
                    onClick={() => {
                      setShowStreamModal(false);
                      onClose();
                      navigate('/');
                    }}
                  >
                    Explore Premieres
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {streamItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="d-flex align-items-center justify-content-between p-2 rounded-3 border"
                      style={{ background: '#FAFAFA', borderColor: '#EEEEEE' }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={item.poster || '/img/popcorn.jpg'}
                          alt={item.title}
                          style={{
                            width: '46px',
                            height: '68px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/img/popcorn.jpg';
                          }}
                        />
                        <div>
                          <div
                            className="fw-bold text-dark"
                            style={{ fontSize: '13px', lineHeight: 1.25, maxWidth: '170px' }}
                          >
                            {item.title}
                          </div>
                          <div className="d-flex align-items-center gap-2 mt-1">
                            <span
                              className="badge"
                              style={{
                                backgroundColor: item.type === 'rent' ? '#E53955' : '#149D4F',
                                fontSize: '10px',
                                fontWeight: 600
                              }}
                            >
                              {item.type === 'rent' ? 'RENTED' : 'PURCHASED'}
                            </span>
                            {item.audioLanguage && (
                              <span className="small text-muted" style={{ fontSize: '11px' }}>
                                {item.audioLanguage}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm px-2 py-1 rounded-1 fw-semibold flex-shrink-0"
                        style={{ fontSize: '11px' }}
                        onClick={() => {
                          setShowStreamModal(false);
                          onClose();
                          navigate(`/premiere/${item.movieId || item.id}`);
                        }}
                      >
                        Watch Now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountDrawer;