import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
  IconHome, 
  IconTicket, 
  IconMovie, 
  IconBuildingStore, 
  IconSettings,
  IconLogout,
  IconX
} from '@tabler/icons-react';

const BrandLockup = () => (
  <div className="d-flex align-items-center mb-5 mt-2">
    <div className="fw-bolder fs-4">
      <span className="text-white">Film</span>
      <span style={{ color: 'var(--cs-accent)' }}>TIX</span>
    </div>
  </div>
);

const SidebarNav = () => {
  const { user } = useAuth();
  
  const navItems = [
    { label: 'Home', path: '/', icon: IconHome },
    { label: 'My Bookings', path: '/my-bookings', icon: IconTicket, auth: true },
    { label: 'Profile', path: '/profile', icon: IconSettings, auth: true }
  ];

  if (user?.role === 'admin') {
    navItems.push({ label: 'Admin Panel', path: '/admin', icon: IconBuildingStore, auth: true });
  }

  return (
    <nav className="d-flex flex-column gap-2 flex-grow-1" aria-label="Sidebar navigation">
      {navItems.map(item => {
        if (item.auth && !user) return null;
        
        const Icon = item.icon;
        return (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => 
              `d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none fw-semibold cs-focusable ${
                isActive ? 'active-nav-item' : 'text-muted hover-nav-item'
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'var(--cs-accent)' : 'transparent',
              color: isActive ? 'var(--cs-text-on-accent)' : 'inherit',
              transition: 'all 180ms ease'
            })}
          >
            <Icon size={20} stroke={2} />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
};

const SidebarPromo = () => (
  <div className="mt-auto mb-4 rounded overflow-hidden position-relative" style={{ height: '160px', backgroundColor: 'var(--cs-surface-muted)' }}>
    <div className="position-absolute w-100 h-100" style={{
      background: 'linear-gradient(45deg, var(--cs-outer-canvas), var(--cs-action-primary))',
      opacity: 0.8
    }} />
    <div className="position-relative p-3 d-flex flex-column justify-content-end h-100 text-white">
      <div className="small fw-bolder mb-1">PRO Membership</div>
      <div className="small opacity-75 mb-2" style={{ fontSize: '0.75rem' }}>Get 20% off on premium seats</div>
      <button className="btn btn-sm btn-light fw-bold" style={{ fontSize: '0.75rem' }}>Upgrade Now</button>
    </div>
  </div>
);

const LogoutButton = () => {
  const { user, logout } = useAuth();
  
  if (!user) return null;
  
  return (
    <button 
      onClick={logout}
      className="d-flex align-items-center gap-3 px-3 py-2 rounded text-muted fw-semibold border-0 cs-focusable w-100 text-start"
      style={{ backgroundColor: 'transparent', transition: 'all 180ms ease' }}
    >
      <IconLogout size={20} stroke={2} />
      Log out
    </button>
  );
};

const DashboardSidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none z-3"
          onClick={onClose}
          style={{ transition: 'opacity 180ms ease' }}
        />
      )}
      
      {/* Sidebar Container */}
      <aside 
        className={`dashboard-sidebar d-flex flex-column p-4 position-fixed top-0 bottom-0 z-3 ${isOpen ? 'open' : ''}`}
        style={{
          width: '242px',
          backgroundColor: 'var(--cs-outer-canvas)',
          color: 'var(--cs-text-primary)',
          left: 0,
          transition: 'transform 180ms ease, opacity 180ms ease',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        <button 
          className="d-lg-none position-absolute top-0 end-0 m-3 btn btn-link text-white p-0 cs-focusable"
          onClick={onClose}
          aria-label="Close menu"
        >
          <IconX size={24} />
        </button>
        
        <BrandLockup />
        <SidebarNav />
        <SidebarPromo />
        <LogoutButton />
      </aside>
    </>
  );
};

export default DashboardSidebar;
