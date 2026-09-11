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
    <div className="d-flex gap-2 overflow-auto pb-2 mb-3" style={{ scrollbarWidth: 'thin' }}>
      {dates.map(date => (
        <button
          key={date}
          className={`btn flex-shrink-0 text-center ${selectedDate === date ? 'btn-warning' : 'btn-outline-secondary'}`}
          onClick={() => onSelect(date)}
          style={{ minWidth: '80px', borderRadius: '12px' }}
        >
          <div className="small">{getDayName(date)}</div>
          <div className="fw-bold">{formatDate(date)}</div>
        </button>
      ))}
    </div>
  );
};

export default DateSelector;
