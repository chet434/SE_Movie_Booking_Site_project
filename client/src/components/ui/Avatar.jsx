/**
 * Avatar — circular user avatar with initials fallback.
 *
 * Props:
 *   src     - image URL (optional)
 *   name    - used to derive initials when src is missing/failed
 *   size    - 'sm' | 'md' | 'lg' (default 'md')
 */
const SIZES = {
  sm: { px: 32, font: '0.75rem' },
  md: { px: 48, font: '0.95rem' },
  lg: { px: 64, font: '1.1rem' }
};

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const Avatar = ({ src, name = '', size = 'md', className = '', ...rest }) => {
  const { px, font } = SIZES[size] || SIZES.md;
  const initials = getInitials(name);

  return (
    <div
      className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${className}`}
      style={{
        width: `${px}px`,
        height: `${px}px`,
        fontSize: font,
        flexShrink: 0,
        backgroundColor: 'var(--cs-accent)',
        color: 'var(--cs-text-on-accent)',
        overflow: 'hidden'
      }}
      {...rest}
    >
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <span style={{ display: src ? 'none' : 'flex' }}>{initials}</span>
    </div>
  );
};

export default Avatar;