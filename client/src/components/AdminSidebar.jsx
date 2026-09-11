import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaFilm, FaBuilding, FaTv, FaTicketAlt, FaUsers } from 'react-icons/fa';

const AdminSidebar = () => {
  const links = [
    { to: '/admin', icon: <FaTachometerAlt />, label: 'Dashboard', end: true },
    { to: '/admin/movies', icon: <FaFilm />, label: 'Movies' },
    { to: '/admin/theatres', icon: <FaBuilding />, label: 'Theatres' },
    { to: '/admin/shows', icon: <FaTv />, label: 'Shows' },
    { to: '/admin/bookings', icon: <FaTicketAlt />, label: 'Bookings' },
    { to: '/admin/users', icon: <FaUsers />, label: 'Users' }
  ];

  return (
    <div className="admin-sidebar">
      <h6 className="text-uppercase text-muted fw-bold mb-3 small px-3">Admin Panel</h6>
      <nav className="nav flex-column">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-2 px-3 py-2 ${isActive ? 'active' : ''}`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
