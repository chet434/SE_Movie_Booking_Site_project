import React from 'react';

const BookingStepper = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Select Seats' },
    { id: 2, label: 'Payment' },
    { id: 3, label: 'Ticket' }
  ];

  return (
    <div className="d-flex align-items-center mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--cs-border)' }}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="d-flex align-items-center gap-2">
            <div 
              className="d-flex align-items-center justify-content-center fw-bold" 
              style={{
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                backgroundColor: currentStep >= step.id ? 'var(--cs-action-primary)' : 'var(--cs-surface-muted)',
                color: currentStep >= step.id ? 'var(--cs-surface)' : 'var(--cs-text-secondary)',
                fontSize: '0.8rem'
              }}
            >
              {step.id}
            </div>
            <span 
              className="fw-bold d-none d-sm-inline" 
              style={{ 
                color: currentStep >= step.id ? 'var(--cs-text-primary)' : 'var(--cs-text-secondary)',
                fontSize: '0.9rem'
              }}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div 
              className="mx-2 mx-sm-3" 
              style={{ 
                height: '2px', 
                flexGrow: 1, 
                backgroundColor: currentStep > step.id ? 'var(--cs-action-primary)' : 'var(--cs-border)',
                opacity: 0.5
              }} 
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BookingStepper;
