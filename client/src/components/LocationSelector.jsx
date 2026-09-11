import { FaMapMarkerAlt } from 'react-icons/fa';

const LocationSelector = ({ locations, selectedLocation, onSelect }) => {
  return (
    <div className="mb-4">
      <label className="form-label fw-bold d-flex align-items-center mb-3">
        <FaMapMarkerAlt className="me-2" style={{ color: 'var(--cs-accent-active)' }} /> Select Location
      </label>
      <div className="d-flex flex-wrap gap-2">
        {locations.map(loc => {
          const isSelected = selectedLocation === loc;
          return (
            <button
              key={loc}
              className="btn btn-sm"
              onClick={() => onSelect(loc === selectedLocation ? '' : loc)}
              style={{
                borderRadius: '10px',
                padding: '6px 14px',
                fontWeight: '600',
                backgroundColor: isSelected ? 'var(--cs-accent-soft)' : 'var(--cs-surface)',
                color: isSelected ? 'var(--cs-accent-active)' : 'var(--cs-text-secondary)',
                border: `1px solid ${isSelected ? 'var(--cs-accent)' : 'var(--cs-border)'}`,
                transition: 'var(--cs-transition-fast)'
              }}
            >
              {loc}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LocationSelector;
