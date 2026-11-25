import React from 'react';
import { IconMapPinFilled, IconCalendarFilled, IconClockFilled } from '@tabler/icons-react';

const MovieContext = ({ theatre, date, showtime, format }) => {
  return (
    <div className="d-flex flex-wrap align-items-center gap-3 text-muted small fw-bold mb-4">
      <div className="d-flex align-items-center gap-1">
        <IconMapPinFilled size={15} style={{ color: 'var(--cb-accent-yellow)' }} />
        <span className="text-white-50">{theatre}</span>
      </div>
      <div className="d-flex align-items-center gap-1">
        <IconCalendarFilled size={15} style={{ color: 'var(--cb-accent-yellow)' }} />
        <span className="text-white-50">
          {new Date(date).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
          })}
        </span>
      </div>
      <div className="d-flex align-items-center gap-1">
        <IconClockFilled size={15} style={{ color: 'var(--cb-accent-yellow)' }} />
        <span className="text-white-50">{showtime}</span>
      </div>
      {format && (
        <span className="cb-badge cb-badge-yellow" style={{ fontSize: '10px' }}>
          {format}
        </span>
      )}
    </div>
  );
};

export default MovieContext;
