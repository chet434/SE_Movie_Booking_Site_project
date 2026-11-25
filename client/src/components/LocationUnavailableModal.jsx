import React, { useEffect } from 'react';
import { IconMapPinOff } from '@tabler/icons-react';
import { useLocationContext } from '../context/LocationContext';
import '../styles/location-modal.css';

const LocationUnavailableModal = ({ onContinue }) => {
  const { unavailableCity, clearUnavailableCity } = useLocationContext();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && unavailableCity) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [unavailableCity]);

  if (!unavailableCity) return null;

  const handleDismiss = () => {
    clearUnavailableCity();
    if (onContinue) onContinue();
    // Dispatch event so any open city picker modal closes cleanly as well
    window.dispatchEvent(new CustomEvent('close-city-modal'));
  };

  return (
    <div
      className="cb-loc-unavailable-overlay"
      onClick={handleDismiss}
      role="alertdialog"
      aria-modal="true"
      aria-label="Services Not Available"
    >
      <div
        className="cb-loc-unavailable-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cb-loc-unavailable-icon" aria-hidden="true">
          <IconMapPinOff size={36} stroke={1.8} />
        </div>

        <h4 className="cb-loc-unavailable-title">Services Not Available</h4>

        <p className="cb-loc-unavailable-msg">
          Currently, CineBook services are only available in Bhubaneswar. Services in{' '}
          <strong style={{ color: '#222222' }}>{unavailableCity}</strong> are not available right now.
        </p>

        <button
          type="button"
          className="cb-loc-unavailable-btn"
          onClick={handleDismiss}
          autoFocus
        >
          Continue with Bhubaneswar
        </button>
      </div>
    </div>
  );
};

export default LocationUnavailableModal;
