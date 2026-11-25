import * as Tabler from '@tabler/icons-react';

/**
 * Icon — unified icon surface for the CineBook design system.
 *
 * All icons route through this component so that the icon library is a
 * single swap point. The design system forbids emoji-as-icon; every icon
 * here is a Tabler glyph.
 *
 * Props:
 *   name  - kebab-case Tabler icon name, e.g. "icon-ticket", "icon-search"
 *   size  - pixel size (default 20). Also accepts a number string.
 *   stroke - stroke width (default 1.5)
 *   color - CSS color value or var() token (defaults to currentColor)
 */
const toPascalCase = (str) => {
  if (!str) return '';
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

const Icon = ({ name, size = 20, stroke = 1.5, color = 'currentColor', ...rest }) => {
  if (!name) return null;

  // Convert kebab-case (e.g. "icon-ticket") or use direct PascalCase (e.g. "IconTicket")
  const component = Tabler[name] || Tabler[toPascalCase(name)];
  if (!component) {
    if (import.meta.env.DEV) {
      console.warn(`[Icon] Unknown icon name: "${name}" (lookup tried "${toPascalCase(name)}")`);
    }
    return null;
  }

  const Glyph = component;
  return (
    <Glyph
      size={size}
      stroke={stroke}
      color={color}
      {...rest}
    />
  );
};

export default Icon;