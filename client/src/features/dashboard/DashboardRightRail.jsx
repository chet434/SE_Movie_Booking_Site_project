import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  IconTicket, 
  IconCup, 
  IconGift, 
  IconCreditCard, 
  IconDeviceGamepad2,
  IconMapPin
} from '@tabler/icons-react';

const NextBookingCard = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="cs-panel p-4 mb-4 text-center">
        <IconTicket size={32} className="text-muted mb-2" />
        <h6 className="fw-bold mb-2">Manage Bookings</h6>
        <p className="small text-muted mb-3">Log in to view your upcoming bookings and tickets.</p>
        <Link to="/login" className="cs-button-primary w-100 fw-bold rounded-pill">Log In</Link>
      </div>
    );
  }

  return (
    <div className="cs-panel p-4 mb-4 position-relative overflow-hidden">
      <div className="position-absolute top-0 end-0 p-3 opacity-25 text-muted">
        <IconTicket size={80} />
      </div>
      <div className="position-relative z-1">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="fw-bold mb-0">Up Next</h6>
          <span className="badge bg-danger">TODAY</span>
        </div>
        
        <h5 className="fw-bolder mb-1">Dune: Part Two</h5>
        <div className="text-muted small fw-semibold mb-3">
          IMAX 2D • Inox, Mumbai
        </div>
        
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="bg-light rounded p-2 text-center" style={{ minWidth: '60px' }}>
            <div className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>TIME</div>
            <div className="fw-bold">19:30</div>
          </div>
          <div className="bg-light rounded p-2 text-center" style={{ minWidth: '60px' }}>
            <div className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>SEATS</div>
            <div className="fw-bold">F1, F2</div>
          </div>
        </div>

        <Link to="/my-bookings" className="cs-button-primary w-100 fw-bold">
          View Ticket
        </Link>
      </div>
    </div>
  );
};

const QuickActionsGrid = () => {
  const actions = [
    { icon: IconCup, label: 'F&B', color: '#e3a03d' },
    { icon: IconGift, label: 'Gifts', color: '#ef6c7a' },
    { icon: IconCreditCard, label: 'Offers', color: '#54b98a' },
    { icon: IconDeviceGamepad2, label: 'Play', color: '#67b7e8' }
  ];

  return (
    <div className="cs-panel p-4 mb-4">
      <h6 className="fw-bold mb-3">Explore</h6>
      <div className="row g-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div key={index} className="col-6">
              <button 
                className="btn w-100 d-flex flex-column align-items-center justify-content-center p-3 cs-focusable border-0"
                style={{ backgroundColor: 'var(--cs-surface-muted)', borderRadius: 'var(--cs-radius-control)' }}
              >
                <Icon size={24} color={action.color} className="mb-2" />
                <span className="small fw-semibold text-muted">{action.label}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PopularTheatresCard = () => {
  const theatres = [
    { id: 1, name: 'PVR ICON: Andheri', distance: '2.4 km', img: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=160&h=160&fit=crop' },
    { id: 2, name: 'INOX: Neoteric', distance: '4.1 km', img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=160&h=160&fit=crop' },
    { id: 3, name: 'Cinepolis: Kurla', distance: '5.8 km', img: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=160&h=160&fit=crop' }
  ];

  return (
    <div className="cs-panel p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0">Popular Theatres</h6>
        <IconMapPin size={18} className="text-muted" />
      </div>
      
      <div className="d-flex flex-column gap-3">
        {theatres.map(theatre => (
          <Link key={theatre.id} to="/" className="text-decoration-none d-flex align-items-center gap-3 p-2 rounded hover-bg-light cs-focusable">
            <img 
              src={theatre.img} 
              alt={theatre.name} 
              className="rounded object-fit-cover"
              style={{ width: '48px', height: '48px', aspectRatio: '1/1' }}
            />
            <div className="flex-grow-1 min-w-0">
              <h6 className="fw-bold mb-0 text-truncate text-dark" style={{ fontSize: '0.9rem' }}>{theatre.name}</h6>
              <span className="small text-muted fw-semibold">{theatre.distance}</span>
            </div>
          </Link>
        ))}
      </div>
      
      <button className="btn btn-link text-decoration-none fw-bold w-100 mt-3 p-0" style={{ color: 'var(--cs-accent)' }}>
        View all theatres
      </button>
    </div>
  );
};

const DashboardRightRail = () => {
  return (
    <div className="d-none d-xl-flex flex-column" style={{ width: '358px', minWidth: '358px' }}>
      <NextBookingCard />
      <QuickActionsGrid />
      <PopularTheatresCard />
    </div>
  );
};

export default DashboardRightRail;
