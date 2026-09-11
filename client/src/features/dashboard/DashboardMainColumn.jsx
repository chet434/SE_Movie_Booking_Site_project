import React from 'react';
import { Link } from 'react-router-dom';
import { IconChevronLeft, IconChevronRight, IconPlay, IconTicket } from '@tabler/icons-react';

const HeroCarousel = () => {
  return (
    <div className="position-relative w-100 mb-5 overflow-hidden cs-panel" style={{ height: '238px', borderRadius: 'var(--cs-radius-card)' }}>
      <div 
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1600&h=430&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'transform 250ms ease, opacity 250ms ease'
        }}
        role="img"
        aria-label="Hero promotion: Blockbuster Movie Premiere"
      />
      <div 
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          background: 'linear-gradient(to right, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.4) 50%, transparent 100%)'
        }}
      />
      
      <div className="position-relative h-100 d-flex flex-column justify-content-center p-4 p-md-5 text-white" style={{ maxWidth: '60%' }}>
        <span className="badge bg-danger mb-2 align-self-start" style={{ letterSpacing: '1px' }}>PREMIERE</span>
        <h2 className="fw-bolder mb-2 text-white">The Great Adventure</h2>
        <p className="d-none d-md-block opacity-75 mb-4 max-w-sm">Experience the thrill of a lifetime in IMAX 3D. Book your tickets now for the opening weekend.</p>
        
        <div className="d-flex gap-3 mt-auto mt-md-0">
          <Link to="/" className="cs-button-primary border-0 bg-white text-dark d-flex align-items-center gap-2">
            <IconTicket size={18} /> Book Now
          </Link>
          <button className="btn btn-outline-light d-flex align-items-center gap-2 fw-bold" style={{ borderRadius: 'var(--cs-radius-control)' }}>
            <IconPlay size={18} /> Watch Trailer
          </button>
        </div>
      </div>

      <div className="position-absolute bottom-0 end-0 m-4 d-flex gap-2 d-none d-sm-flex">
        <button className="btn btn-dark rounded-circle p-2 opacity-75 hover-opacity-100 cs-focusable" aria-label="Previous slide">
          <IconChevronLeft size={20} />
        </button>
        <button className="btn btn-dark rounded-circle p-2 opacity-75 hover-opacity-100 cs-focusable" aria-label="Next slide">
          <IconChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

const GenreFilterRow = () => {
  const genres = ['All', 'Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance', 'Thriller', 'Animation'];
  
  return (
    <div className="d-flex gap-2 overflow-auto pb-3 mb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {genres.map((genre, index) => (
        <button 
          key={genre}
          className="btn fw-bold text-nowrap cs-focusable"
          style={{ 
            borderRadius: '20px', 
            padding: '8px 20px',
            backgroundColor: index === 0 ? 'var(--cs-accent)' : 'var(--cs-surface)',
            color: index === 0 ? 'var(--cs-text-on-accent)' : 'var(--cs-text-primary)',
            border: index === 0 ? '1px solid var(--cs-accent)' : '1px solid var(--cs-border)'
          }}
          aria-pressed={index === 0}
        >
          {genre}
        </button>
      ))}
    </div>
  );
};

const SectionHeader = ({ title, actionText, actionLink }) => (
  <div className="d-flex justify-content-between align-items-end mb-4 mt-2">
    <h4 className="fw-bolder mb-0">{title}</h4>
    {actionText && (
      <Link to={actionLink || "/"} className="text-decoration-none fw-bold small" style={{ color: 'var(--cs-accent)' }}>
        {actionText}
      </Link>
    )}
  </div>
);

const WeekendOfferBanner = () => (
  <div className="w-100 my-5 rounded overflow-hidden position-relative d-flex align-items-center cs-panel border-0" style={{ height: '148px', backgroundColor: 'var(--cs-success-soft)' }}>
    <div className="p-4 p-md-5 z-2">
      <h4 className="fw-bolder text-success mb-1">Weekend Bonanza!</h4>
      <p className="mb-3 text-dark opacity-75 small fw-semibold">Get 50% off on your second ticket using code WEEKEND50.</p>
      <button className="btn btn-success btn-sm fw-bold px-3 py-2 rounded-pill cs-focusable">
        Copy Code
      </button>
    </div>
    <div className="position-absolute end-0 top-0 h-100 w-50" style={{
      background: 'linear-gradient(to right, var(--cs-success-soft), transparent)',
      zIndex: 1
    }} />
    <div className="position-absolute end-0 top-0 h-100 w-50 opacity-50" style={{
      backgroundImage: 'url(https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=650&h=220&auto=format&fit=crop)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      zIndex: 0
    }} aria-hidden="true" />
  </div>
);

const UpcomingMovieShelf = () => {
  // Mock data for upcoming movies
  const upcomingMovies = [
    { id: 1, title: 'Quantum Drift', date: 'Oct 15', img: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop' },
    { id: 2, title: 'The Last Echo', date: 'Oct 22', img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop' },
    { id: 3, title: 'Neon Shadows', date: 'Nov 05', img: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400&h=600&fit=crop' },
    { id: 4, title: 'Lunar Horizon', date: 'Nov 12', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop' }
  ];

  return (
    <div className="mb-5">
      <SectionHeader title="Coming Soon" actionText="View all" />
      <div className="row g-3 g-md-4">
        {upcomingMovies.map(movie => (
          <div key={movie.id} className="col-6 col-md-3">
            <Link to={`/movies/${movie.id}`} className="text-decoration-none">
              <div className="movie-card position-relative mb-2" style={{ aspectRatio: '2/3' }}>
                <img src={movie.img} alt={movie.title} className="w-100 h-100 object-fit-cover" />
                <div className="position-absolute bottom-0 start-0 w-100 p-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                  <span className="badge bg-light text-dark fw-bold">{movie.date}</span>
                </div>
              </div>
              <h6 className="fw-bold mb-0 text-truncate text-dark">{movie.title}</h6>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Column Container
const DashboardMainColumn = ({ children }) => {
  return (
    <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0 }}>
      <HeroCarousel />
      <GenreFilterRow />
      {children}
      <WeekendOfferBanner />
      <UpcomingMovieShelf />
    </div>
  );
};

export { DashboardMainColumn, SectionHeader };
