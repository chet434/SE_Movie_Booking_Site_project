import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  IconSearch, 
  IconMapPin, 
  IconBell, 
  IconUser,
  IconMenu2
} from '@tabler/icons-react';

const GlobalSearch = () => (
  <div className="position-relative d-none d-md-block" style={{ width: '320px' }}>
    <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
      <IconSearch size={18} stroke={2} />
    </div>
    <input 
      type="text" 
      className="form-control cs-focusable border-0 shadow-none ps-5 fw-semibold" 
      placeholder="Search movies, theatres..."
      style={{ 
        backgroundColor: 'var(--cs-surface)', 
        borderRadius: '24px',
        height: '44px'
      }}
      aria-label="Global search"
    />
  </div>
);

const LocationMenu = () => (
  <button 
    className="btn d-flex align-items-center gap-2 cs-focusable border-0 fw-bold"
    style={{ backgroundColor: 'transparent', color: 'var(--cs-text-primary)' }}
    aria-label="Select location"
  >
    <IconMapPin size={20} stroke={2} style={{ color: 'var(--cs-accent)' }} />
    <span className="d-none d-sm-inline">Mumbai</span>
  </button>
);

const NotificationButton = () => (
  <button 
    className="btn btn-icon rounded-circle d-flex align-items-center justify-content-center cs-focusable position-relative"
    style={{ 
      width: '44px', height: '44px', 
      backgroundColor: 'var(--cs-surface)', 
      color: 'var(--cs-text-primary)' 
    }}
    aria-label="Notifications"
  >
    <IconBell size={20} stroke={2} />
    <span className="position-absolute top-0 end-0 translate-middle p-1 bg-danger border border-light rounded-circle" style={{ marginTop: '10px', marginRight: '4px' }}>
      <span className="visually-hidden">New alerts</span>
    </span>
  </button>
);

const ProfileMenu = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <Link to="/login" className="cs-button-primary rounded-pill px-4 ms-2">
        Log In
      </Link>
    );
  }
  
  return (
    <Link 
      to="/profile"
      className="btn p-0 border-0 rounded-circle overflow-hidden ms-2 cs-focusable"
      style={{ width: '44px', height: '44px', backgroundColor: 'var(--cs-accent)' }}
      aria-label="User profile"
    >
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="w-100 h-100 object-fit-cover" />
      ) : (
        <div className="w-100 h-100 d-flex align-items-center justify-content-center fw-bold text-dark">
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}
    </Link>
  );
};

const DashboardUtilityBar = ({ onOpenSidebar }) => {
  return (
    <header className="d-flex align-items-center justify-content-between mb-4 pb-2">
      <div className="d-flex align-items-center gap-3">
        <button 
          className="btn d-lg-none p-2 border-0 cs-focusable"
          onClick={onOpenSidebar}
          aria-label="Open menu"
        >
          <IconMenu2 size={24} />
        </button>
        <GlobalSearch />
      </div>
      
      <div className="d-flex align-items-center gap-2 gap-sm-3">
        <LocationMenu />
        <NotificationButton />
        <ProfileMenu />
      </div>
    </header>
  );
};

export default DashboardUtilityBar;
