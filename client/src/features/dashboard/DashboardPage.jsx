import React, { useState, useEffect } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardUtilityBar from './DashboardUtilityBar';
import { DashboardMainColumn, SectionHeader } from './DashboardMainColumn';
import DashboardRightRail from './DashboardRightRail';
import MovieCard from '../../components/MovieCard';
import { getMovies } from '../../services/api';

const DashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await getMovies();
      // Only show up to 5 movies in the grid to fit the 5-card layout requirement
      setMovies(res.data.data.slice(0, 10)); 
    } catch (err) {
      setError('Failed to fetch movies in your city.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: 'var(--cs-outer-canvas)' }}>
      {/* Sidebar Wrapper - Fixed Width Desktop */}
      <div className="d-none d-lg-block flex-shrink-0" style={{ width: '242px' }}>
        <DashboardSidebar isOpen={true} onClose={() => {}} />
      </div>

      {/* Mobile Sidebar */}
      <div className="d-lg-none">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area Wrapper */}
      <div className="flex-grow-1 d-flex justify-content-center p-3 p-md-4">
        <div 
          className="d-flex flex-column w-100" 
          style={{ 
            maxWidth: '1920px', 
            backgroundColor: 'var(--cs-canvas)',
            borderRadius: '24px',
            boxShadow: '0 0 40px rgba(0,0,0,0.5)',
            padding: '24px',
            overflow: 'hidden'
          }}
        >
          <DashboardUtilityBar onOpenSidebar={() => setSidebarOpen(true)} />
          
          <div className="d-flex gap-4 gap-xl-5 flex-grow-1 align-items-start">
            {/* Center Column */}
            <DashboardMainColumn>
              <SectionHeader title="Now Showing" actionText="View all" />
              
              {loading ? (
                <div className="row g-3 g-md-4 mb-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="col-6 col-md-4 col-lg-3 col-xl">
                      <div className="card border-0 placeholder-glow" style={{ aspectRatio: '2/3', borderRadius: 'var(--cs-radius-card)' }}>
                        <div className="placeholder w-100 h-100 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="cs-panel p-5 text-center mb-4">
                  <p className="text-muted mb-3">{error}</p>
                  <button onClick={fetchMovies} className="cs-button-secondary">Retry</button>
                </div>
              ) : movies.length === 0 ? (
                <div className="cs-panel p-5 text-center mb-4">
                  <p className="text-muted mb-0">No shows available in your city right now.</p>
                </div>
              ) : (
                <div className="row g-3 g-md-4 mb-4">
                  {/* At 1536px width, this fits 5 cards perfectly */}
                  {movies.map(movie => (
                    <div key={movie._id} className="col-6 col-md-4 col-lg-3 col-xl">
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>
              )}
            </DashboardMainColumn>
            
            {/* Right Rail */}
            <DashboardRightRail />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
