import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthCard from './AuthCard';

const AuthModal = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal } = useAuth();

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center px-3 py-2"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 1070,
        backdropFilter: 'blur(3px)',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        // Close if clicking outside the card
        if (e.target === e.currentTarget) {
          closeAuthModal();
        }
      }}
    >
      <div
        className="my-auto w-100 d-flex justify-content-center"
        style={{
          animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <AuthCard
          initialMode={authModalMode || 'login'}
          onClose={closeAuthModal}
          isModal={true}
        />
      </div>
    </div>
  );
};

export default AuthModal;