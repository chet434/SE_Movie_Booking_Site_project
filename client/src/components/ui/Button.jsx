import { forwardRef } from 'react';
import Icon from './Icon';

/**
 * Button — shared button surface backed by the design-system token classes.
 *
 * Variants:
 *   primary   - Main CTA. Uses --cs-action-primary (black in light, white in dark).
 *   secondary - Secondary action. Uses --cs-accent (light purple).
 *   auth      - Brand purple (#635BFF) for auth pages.
 *   danger    - Destructive red.
 *   ghost     - Transparent, text-only.
 *
 * All variants are 44px minimum touch targets and respect prefers-reduced-motion.
 */
const VARIANT_CLASSES = {
  primary: 'cs-button-primary',
  secondary: 'cs-button-secondary',
  auth: 'auth-btn-primary',
  danger: '',
  ghost: ''
};

const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      leftIcon,
      rightIcon,
      iconOnly = false,
      loading = false,
      loadingLabel = 'Loading...',
      disabled,
      className = '',
      children,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const sizeClasses = {
      sm: 'py-1.5 px-3 text-sm',
      md: '',
      lg: 'py-3 px-6 text-base'
    };

    const base =
      'inline-flex items-center justify-center gap-2 text-center cursor-pointer disabled:cursor-not-allowed';

    const ghostDanger =
      variant === 'danger'
        ? 'bg-transparent border border-solid'
        : '';
    const ghostDangerStyles =
      variant === 'danger'
        ? {
            borderColor: 'var(--cs-danger)',
            color: 'var(--cs-danger)'
          }
        : {};
    const ghostStyles =
      variant === 'ghost'
        ? {
            backgroundColor: 'transparent',
            color: 'var(--cs-text-primary)'
          }
        : {};

    const classes = [
      base,
      VARIANT_CLASSES[variant] || '',
      sizeClasses[size] || '',
      iconOnly ? 'aspect-square p-2' : '',
      className
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        className={classes}
        style={{ ...ghostDangerStyles, ...ghostStyles }}
        {...rest}
      >
        {loading ? (
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
        ) : (
          <>
            {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
            {iconOnly ? (
              <span className="visually-hidden">{children}</span>
            ) : (
              children
            )}
            {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
          </>
        )}
        {loading && <span className="visually-hidden">{loadingLabel}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

/**
 * IconButton — a square icon-only button variant.
 */
export const IconButton = forwardRef(
  ({ icon, 'aria-label': ariaLabel, ...rest }, ref) => (
    <Button ref={ref} iconOnly aria-label={ariaLabel} {...rest}>
      {icon}
    </Button>
  )
);
IconButton.displayName = 'IconButton';

export default Button;