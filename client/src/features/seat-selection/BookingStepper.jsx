import React from 'react';

const BookingStepper = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Select Seats' },
    { id: 2, label: 'Payment' },
    { id: 3, label: 'Ticket' }
  ];

  return (
    <div
      className="d-flex align-items-center mb-4 pb-3"
      style={{ borderBottom: '1px solid var(--cb-border-subtle)' }}
    >
      {steps.map((step, index) => {
        const isActive = currentStep >= step.id;
        const isCurrent = currentStep === step.id;
        return (
          <React.Fragment key={step.id}>
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#C41230' : '#E5E7EB',
                  color: isActive ? '#FFFFFF' : '#6B7280',
                  fontSize: '12px',
                  fontFamily: 'var(--cb-font-mono)',
                  boxShadow: isCurrent ? '0 0 12px rgba(196, 18, 48, 0.35)' : 'none',
                  transition: 'all 200ms ease'
                }}
              >
                {step.id}
              </div>
              <span
                className="fw-bold d-none d-sm-inline"
                style={{
                  color: isActive ? '#222222' : '#9CA3AF',
                  fontSize: '13px',
                  fontFamily: 'var(--cb-font-display)',
                  letterSpacing: '0.3px'
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
                  backgroundColor: currentStep > step.id ? '#C41230' : '#E5E7EB',
                  transition: 'background-color 200ms ease'
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default BookingStepper;
