/**
 * Input — text/password/number/textarea surface.
 *
 * Props:
 *   label      - rendered <label> above the control
 *   error      - inline error message (also drives aria-invalid)
 *   hint       - helper text below the control
 *   leftIcon   - Tabler icon name rendered inside the input on the left
 *   rightIcon  - Tabler icon name rendered inside the input on the right
 *   type       - input type
 *   size       - 'sm' | 'md' (default 'md')
 */
import Icon from './Icon';

const Input = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  type = 'text',
  size = 'md',
  className = '',
  id,
  ...rest
}) => {
  const inputId = id || `cs-input-${Math.random().toString(36).slice(2, 8)}`;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  const describedBy = [hint ? hintId : '', error ? errorId : '']
    .filter(Boolean)
    .join(' ');

  const height = size === 'sm' ? '36px' : '44px';

  const wrapperClasses = ['cs-input-group', className].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={inputId} className="form-label fw-semibold small mb-1">
          {label}
        </label>
      )}
      <div className="position-relative">
        {leftIcon && (
          <span className="cs-input-icon" aria-hidden="true">
            <Icon name={leftIcon} size={18} color="var(--cs-text-disabled)" />
          </span>
        )}
        <input
          id={inputId}
          type={type}
          className={`form-control ${leftIcon ? 'ps-5' : ''} ${rightIcon ? 'pe-5' : ''}`}
          style={{ minHeight: height }}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy || undefined}
          {...rest}
        />
        {rightIcon && (
          <span className="cs-input-action" aria-hidden="true">
            <Icon name={rightIcon} size={18} color="var(--cs-text-disabled)" />
          </span>
        )}
      </div>
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

export default Input;