import { FaMapMarkerAlt } from 'react-icons/fa';

const LocationSelector = ({ locations, selectedLocation, onSelect }) => {
  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">
        <FaMapMarkerAlt className="text-danger me-1" /> Select Location
      </label>
      <div className="d-flex flex-wrap gap-2">
        {locations.map(loc => (
          <button
            key={loc}
            className={`btn btn-sm ${selectedLocation === loc ? 'btn-warning' : 'btn-outline-secondary'}`}
            onClick={() => onSelect(loc === selectedLocation ? '' : loc)}
          >
            {loc}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LocationSelector;
