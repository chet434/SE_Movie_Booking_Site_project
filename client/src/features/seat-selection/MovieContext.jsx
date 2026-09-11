import React from 'react';
import { IconMapPinFilled, IconCalendarFilled, IconClockFilled } from '@tabler/icons-react';

const MovieContext = ({ theatre, date, showtime, format }) => {
  return (
    <div className="d-flex flex-wrap gap-3 text-muted small fw-bold mb-4">
      <div className="d-flex align-items-center gap-1">
        <IconMapPinFilled size={16} />
        <span>{theatre}</span>
      </div>
      <div className="d-flex align-items-center gap-1">
        <IconCalendarFilled size={16} />
        <span>
          {new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      </div>
      <div className="d-flex align-items-center gap-1">
        <IconClockFilled size={16} />
        <span>{showtime}</span>
      </div>
      {format && (
        <div className="d-flex align-items-center gap-1 px-2" style={{ backgroundColor: 'var(--cs-surface-muted)', borderRadius: '4px' }}>
          <span>{format}</span>
        </div>
      )}
    </div>
  );
};

export default MovieContext;
