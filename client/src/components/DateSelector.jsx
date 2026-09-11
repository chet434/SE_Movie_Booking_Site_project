const DateSelector = ({ dates, selectedDate, onSelect }) => {
  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.getTime() === today.getTime()) return 'Today';
    if (d.getTime() === tomorrow.getTime()) return 'Tomorrow';

    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getDayName = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { weekday: 'short' });
  };

  return (
    <div className="d-flex gap-2 overflow-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
      {dates.map(date => {
        const isSelected = selectedDate === date;
        return (
          <button
            key={date}
            className="btn flex-shrink-0 text-center"
            onClick={() => onSelect(date)}
            style={{ 
              minWidth: '80px', 
              borderRadius: '10px',
              backgroundColor: isSelected ? 'var(--cs-accent)' : 'var(--cs-surface)',
              color: isSelected ? 'var(--cs-text-on-accent)' : 'var(--cs-text-primary)',
              border: `1px solid ${isSelected ? 'var(--cs-accent)' : 'var(--cs-border)'}`,
              transition: 'var(--cs-transition-fast)'
            }}
          >
            <div className="small" style={{ opacity: isSelected ? 1 : 0.7 }}>{getDayName(date)}</div>
            <div className="fw-bold">{formatDate(date)}</div>
          </button>
        );
      })}
    </div>
  );
};

export default DateSelector;
