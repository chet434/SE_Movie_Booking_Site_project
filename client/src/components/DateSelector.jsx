const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const parts = String(dateStr).split('T')[0].split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
  }
  return new Date(dateStr);
};

const DateSelector = ({ dates, selectedDate, onSelect }) => {
  const getDayNumber = (date) => {
    const d = parseLocalDate(date);
    return d.getDate();
  };

  const getDayLabel = (date) => {
    const d = parseLocalDate(date);
    return d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase();
  };

  const getMonthName = (date) => {
    const d = parseLocalDate(date);
    return d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();
  };

  return (
    <div
      className="d-flex gap-2 overflow-auto py-2"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      role="tablist"
      aria-label="Select show date"
    >
      {dates.map((date) => {
        const isSelected = selectedDate === date;
        return (
          <button
            key={date}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(date)}
            className="btn flex-shrink-0 d-flex flex-column align-items-center justify-content-center p-2 rounded-2"
            style={{
              minWidth: '56px',
              height: '68px',
              backgroundColor: isSelected ? 'var(--bms-brand-red)' : '#FFFFFF',
              color: isSelected ? '#FFFFFF' : 'var(--bms-text-primary)',
              border: isSelected ? 'none' : '1px solid var(--bms-border-medium)',
              boxShadow: isSelected ? '0 4px 10px rgba(220, 53, 88, 0.3)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {/* Day name (e.g. TUE) */}
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                opacity: isSelected ? 0.9 : 0.6
              }}
            >
              {getDayLabel(date)}
            </span>

            {/* Date number (e.g. 24) */}
            <span
              style={{
                fontFamily: 'var(--bms-font-primary)',
                fontSize: '18px',
                fontWeight: 700,
                lineHeight: 1.1,
                margin: '2px 0'
              }}
            >
              {getDayNumber(date)}
            </span>

            {/* Month (e.g. NOV) */}
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                opacity: isSelected ? 0.9 : 0.6
              }}
            >
              {getMonthName(date)}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default DateSelector;
