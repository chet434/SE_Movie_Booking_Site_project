import { Icon } from './ui';

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Adventure'];
const LANGUAGES = ['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam'];

const FilterPanel = ({ filters, setFilters, locations }) => {
  const hasFilters = filters.genre || filters.language || filters.location;

  const locationNames = Array.isArray(locations)
    ? locations.map((loc) => (typeof loc === 'string' ? loc : loc.name))
    : [];

  const clearFilters = () => {
    setFilters({ genre: '', language: '', location: '' });
  };

  return (
    <div className="cs-panel mb-4">
      <div className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0 d-flex align-items-center" style={{ color: 'var(--cs-text-primary)' }}><Icon name="icon-filter" className="me-2" size={18} style={{ color: 'var(--cs-accent)' }} />Filters</h6>
          {hasFilters && (
            <button className="btn btn-sm d-flex align-items-center gap-1" onClick={clearFilters} style={{ background: 'transparent', color: 'var(--cs-text-primary)' }}>
              <Icon name="icon-x" size={12} /> Clear
            </button>
          )}
        </div>
        <div className="row g-2">
          <div className="col-md-4">
            <select className="form-select form-select-sm" value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}>
              <option value="">All Locations</option>
              {locationNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <select className="form-select form-select-sm" value={filters.genre}
              onChange={(e) => setFilters({ ...filters, genre: e.target.value })}>
              <option value="">All Genres</option>
              {GENRES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <select className="form-select form-select-sm" value={filters.language}
              onChange={(e) => setFilters({ ...filters, language: e.target.value })}>
              <option value="">All Languages</option>
              {LANGUAGES.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;