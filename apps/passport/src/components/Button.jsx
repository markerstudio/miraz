import React from 'react'

/**
 * Miraz button. Quiet luxury: crisp edges, wide-tracked grotesk caps,
 * slow considered transitions. No bounce, no heavy shadow.
 * Ported verbatim from the Miraz design system.
 */
export function Button({
  variant = 'primary', // 'primary' | 'secondary' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  as = 'button',
  disabled = false,
  children,
  style = {},
  ...rest
}) {
  const Tag = as
  const sizes = {
    sm: { padding: '9px 20px', fontSize: '11px' },
    md: { padding: '13px 30px', fontSize: '12px' },
    lg: { padding: '17px 44px', fontSize: '13px' },
  }
  const base = {
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    letterSpacing: 'var(--tracking-label)',
    textTransform: 'uppercase',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    textDecoration: 'none',
    lineHeight: 1,
    transition:
      'background var(--transition), color var(--transition), border-color var(--transition)',
    opacity: disabled ? 0.45 : 1,
    ...sizes[size],
  }
  const variants = {
    primary: {
      background: 'var(--accent)',
      color: 'var(--ivory)',
      borderColor: 'var(--accent)',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--charcoal)',
      borderColor: 'var(--line-strong)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--accent)',
      borderColor: 'transparent',
      padding: sizes[size].padding.split(' ')[0] + ' 0',
    },
  }
  const [hover, setHover] = React.useState(false)
  const hoverStyle =
    !disabled && hover
      ? {
          primary: { background: 'var(--accent-hover)', borderColor: 'var(--accent-hover)' },
          secondary: { borderColor: 'var(--charcoal)', background: 'rgba(44,42,40,0.04)' },
          ghost: { color: 'var(--accent-hover)' },
        }[variant]
      : {}

  return (
    <Tag
      disabled={as === 'button' ? disabled : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...variants[variant], ...hoverStyle, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
