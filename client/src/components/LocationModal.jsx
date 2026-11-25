import LocationSelector from './LocationSelector';

/**
 * LocationModal adapter
 * Delegates directly to the upgraded BookMyShow LocationSelector component.
 */
const LocationModal = ({ isOpen, onClose }) => {
  return <LocationSelector isOpen={isOpen} onClose={onClose} />;
};

export default LocationModal;
