/**
 * Card — a surface container backed by the design-system token.
 *
 * Props:
 *   padding - 'sm' | 'md' | 'lg' (default 'md')
 *   hover  - whether the card lifts on hover
 *   as      - tag to render ('section' | 'article' | 'div')
 */
const PADDING = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5'
};

const Card = ({
  padding = 'md',
  hover = false,
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}) => {
  const classes = ['cs-panel', PADDING[padding] || PADDING.md, hover ? 'card-hover' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
};

export default Card;