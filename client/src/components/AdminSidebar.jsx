import { NavLink } from 'react-router-dom';
import { Icon } from './ui';

const AdminSidebar = () => {
  const links = [
    { to: '/admin', iconName: 'icon-layout-dashboard', label: 'Dashboard', end: true },
    { to: '/admin/movies', iconName: 'icon-film', label: 'Movies' },
    { to: '/admin/theatres', iconName: 'icon-building', label: 'Theatres' },
    { to: '/admin/shows', iconName: 'icon-tv', label: 'Shows' },
    { to: '/admin/bookings', iconName: 'icon-ticket', label: 'Bookings' },
    { to: '/admin/users', iconName: 'icon-users', label: 'Users' }
  ];

  return (
    <div className="admin-sidebar">
      <h6 className="text-uppercase text-muted fw-bold mb-3 small px-3" style={{ color: 'var(--cs-text-secondary)' }}>Admin Panel</h6>
      <nav className="nav flex-column">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-2 px-3 py-2 ${isActive ? 'active' : ''}`
            }
            style={{ color: 'var(--cs-text-secondary)' }}
          >
            <Icon name={link.iconName} size={18} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
