/**
 * Badge — small status label / tag.
 *
 * color: 'surface' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'muted'
 */
const COLOR_MAP = {
  surface: { bg: 'var(--cs-surface)', fg: 'var(--cs-text-primary)' },
  accent: { bg: 'var(--cs-accent-soft)', fg: 'var(--cs-accent-active)' },
  success: { bg: 'var(--cs-success-soft)', fg: 'var(--cs-success)' },
  warning: { bg: 'var(--cs-warning-soft)', fg: 'var(--cs-warning)' },
  danger: { bg: 'var(--cs-danger-soft)', fg: 'var(--cs-danger)' },
  info: { bg: 'var(--cs-info)', fg: '#FFFFFF' },
  muted: { bg: 'var(--cs-surface-muted)', fg: 'var(--cs-text-primary)' }
};

const Badge = ({ color = 'muted', className = '', children, ...rest }) => {
  const palette = COLOR_MAP[color] || COLOR_MAP.muted;
  return (
    <span
      className={`badge rounded-pill fw-semibold ${className}`}
      style={{
        backgroundColor: palette.bg,
        color: palette.fg,
        border: '1px solid transparent'
      }}
      {...rest}
    >
      {children}
    </span>
  );
};

export default Badge;