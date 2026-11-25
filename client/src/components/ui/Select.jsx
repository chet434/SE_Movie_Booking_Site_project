/**
 * Select — dropdown surface.
 *
 * Props mirror <Input>: label, error, hint.
 */
const Select = ({ label, error, hint, className = '', id, children, ...rest }) => {
  const selectId = id || `cs-select-${Math.random().toString(36).slice(2, 8)}`;
  const hintId = `${selectId}-hint`;
  const errorId = `${selectId}-error`;

  const describedBy = [hint ? hintId : '', error ? errorId : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={['cs-input-group', className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={selectId} className="form-label fw-semibold small mb-1">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className="form-select"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy || undefined}
        {...rest}
      >
        {children}
      </select>
      {hint && !error && (
        <small id={hintId} className="text-muted mt-1 d-block">
          {hint}
        </small>
      )}
      {error && (
        <small id={errorId} className="text-danger mt-1 d-block fw-medium">
          {error}
        </small>
      )}
    </div>
  );
};

export default Select;