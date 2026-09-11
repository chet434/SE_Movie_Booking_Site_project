import { useState, useEffect } from 'react';
import { getAdminStats } from '../../services/api';
import { FaFilm, FaBuilding, FaTv, FaTicketAlt, FaUsers, FaRupeeSign } from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getAdminStats();
      setStats(res.data.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-warning"></div>
      </div>
    );
  }

  const cards = [
    { label: 'Total Movies', value: stats?.totalMovies || 0, icon: <FaFilm />, color: '#e91e63' },
    { label: 'Total Theatres', value: stats?.totalTheatres || 0, icon: <FaBuilding />, color: '#9c27b0' },
    { label: 'Total Shows', value: stats?.totalShows || 0, icon: <FaTv />, color: '#3f51b5' },
    { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: <FaTicketAlt />, color: '#009688' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: <FaUsers />, color: '#ff9800' },
    { label: "Today's Revenue", value: `₹${(stats?.todayRevenue || 0).toLocaleString('en-IN')}`, icon: <FaRupeeSign />, color: '#4caf50' }
  ];

  return (
    <div>
      <h3 className="fw-bold mb-4">Dashboard</h3>
      <div className="row g-3">
        {cards.map((card, i) => (
          <div key={i} className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', borderLeft: `4px solid ${card.color}` }}>
              <div className="card-body d-flex align-items-center gap-3 p-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '48px', height: '48px', backgroundColor: `${card.color}20`, color: card.color }}>
                  {card.icon}
                </div>
                <div>
                  <small className="text-muted">{card.label}</small>
                  <h4 className="fw-bold mb-0">{card.value}</h4>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
