import { useState, useEffect } from 'react';
import { getAdminStats } from '../../services/api';
import { Icon } from '../../components/ui';

const STATUS_COLORS = {
  primary: 'var(--cs-action-primary)',
  secondary: 'var(--cs-accent)',
  success: 'var(--cs-success)',
  warning: 'var(--cs-warning)',
  danger: 'var(--cs-danger)'
};

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
    { label: 'Total Movies', value: stats?.totalMovies || 0, iconName: 'icon-film', color: STATUS_COLORS.danger },
    { label: 'Total Theatres', value: stats?.totalTheatres || 0, iconName: 'icon-building', color: STATUS_COLORS.warning },
    { label: 'Total Shows', value: stats?.totalShows || 0, iconName: 'icon-tv', color: STATUS_COLORS.info },
    { label: 'Total Bookings', value: stats?.totalBookings || 0, iconName: 'icon-ticket', color: STATUS_COLORS.success },
    { label: 'Total Users', value: stats?.totalUsers || 0, iconName: 'icon-users', color: STATUS_COLORS.primary },
    { label: "Today's Revenue", value: `₹${(stats?.todayRevenue || 0).toLocaleString('en-IN')}`, iconName: 'icon-currency-rupee', color: STATUS_COLORS.secondary }
  ];

  return (
    <div>
      <h3 className="fw-bold mb-4" style={{ color: 'var(--cs-text-primary)' }}>Dashboard</h3>
      <div className="row g-3">
        {cards.map((card, i) => (
          <div key={i} className="col-md-6 col-lg-4">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: 'var(--cs-radius-card)',
                borderLeft: `4px solid ${card.color}`,
                backgroundColor: 'var(--cs-surface)'
              }}
            >
              <div className="card-body d-flex align-items-center gap-3 p-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: `${card.color}20`
                  }}
                >
                  <Icon name={card.iconName} size={24} color={card.color} />
                </div>
                <div>
                  <small className="text-muted">{card.label}</small>
                  <h4 className="fw-bold mb-0" style={{ color: 'var(--cs-text-primary)' }}>{card.value}</h4>
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