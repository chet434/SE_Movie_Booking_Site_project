import React, { useEffect } from 'react';
import { IconInfoCircle } from '@tabler/icons-react';
import '../styles/service-unavailable-modal.css';

const ServiceUnavailableModal = ({ isOpen, serviceName, onClose }) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !serviceName) return null;

  return (
    <div
      className="cb-svc-unavailable-overlay"
      onClick={onClose}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="cb-svc-unavailable-title"
    >
      <div
        className="cb-svc-unavailable-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cb-svc-unavailable-icon" aria-hidden="true">
          <IconInfoCircle size={38} stroke={1.8} />
        </div>

        <h4 id="cb-svc-unavailable-title" className="cb-svc-unavailable-title">
          Service Currently Unavailable
        </h4>

        <p className="cb-svc-unavailable-msg">
          {serviceName} services are not currently available. We&apos;re working on bringing{' '}
          {String(serviceName).toLowerCase()} to CineBook soon!
        </p>

        <button
          type="button"
          className="cb-svc-unavailable-btn"
          onClick={onClose}
          autoFocus
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default ServiceUnavailableModal;
