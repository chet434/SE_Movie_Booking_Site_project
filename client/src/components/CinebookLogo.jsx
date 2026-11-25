import React from 'react';

const CinebookLogo = ({ height = 34, className = '', darkBg = false, variant = 'light' }) => {
  const isDark = darkBg || variant === 'dark';
  return (
    <div
      className={`d-inline-flex align-items-center select-none ${className}`}
      style={{ height: `${height}px`, userSelect: 'none', cursor: 'pointer' }}
    >
      <svg
        height={height}
        viewBox="0 0 152 42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: 'auto', height: `${height}px`, display: 'block' }}
      >
        {/* "cine" in bold white #FFFFFF on darkBg, or dark charcoal #2B2B2B on light surfaces */}
        <text
          x="2"
          y="29"
          fill={isDark ? '#FFFFFF' : '#2B2B2B'}
          fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontSize="26"
          fontWeight="800"
          letterSpacing="-0.5px"
        >
          cine
        </text>

        {/* Tilted Ticket Badge for "book" positioned with crisp breathing room */}
        <g transform="translate(106, 21) rotate(-10) translate(-39, -14)">
          {/* Crimson-red #C41230 ticket-stub badge with subtle perforated/scalloped edges */}
          <path
            d="M 5 0 L 73 0 C 75.2 0 77 1.8 77 4 L 77 10 A 4 4 0 0 0 77 18 L 77 24 C 77 26.2 75.2 28 73 28 L 5 28 C 2.8 28 1 26.2 1 24 L 1 18 A 4 4 0 0 0 1 10 L 1 4 C 1 1.8 2.8 0 5 0 Z"
            fill="#C41230"
          />
          {/* Subtle vertical dashed perforation lines on left and right */}
          <line x1="6" y1="3" x2="6" y2="25" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="72" y1="3" x2="72" y2="25" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 2" />

          {/* "book" bold white text */}
          <text
            x="39"
            y="20"
            fill="#FFFFFF"
            textAnchor="middle"
            fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontSize="16.5"
            fontWeight="800"
            letterSpacing="-0.3px"
          >
            book
          </text>
        </g>
      </svg>
    </div>
  );
};

export const CineBookLogo = CinebookLogo;
export default CinebookLogo;