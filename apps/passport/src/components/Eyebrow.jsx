import React from 'react'

/**
 * Eyebrow — the brand's signature wide-tracked grotesk-caps label.
 * Optionally prefixed with a short leading rule.
 * Ported verbatim from the Miraz design system.
 */
export function Eyebrow({
  children,
  rule = false,
  color = 'accent', // 'accent' (brass) | 'primary' | 'muted' | 'ivory'
  as = 'span',
  style = {},
  ...rest
}) {
  const Tag = as
  const colors = {
    accent: 'var(--text-accent)',
    primary: 'var(--text-primary)',
    muted: 'var(--text-muted)',
    ivory: 'var(--text-on-ink)',
  }
  return (
    <Tag
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '14px',
        font: 'var(--text-eyebrow)',
        letterSpacing: 'var(--tracking-eyebrow)',
        textTransform: 'uppercase',
        color: colors[color],
        ...style,
      }}
      {...rest}
    >
      {rule && (
        <span
          aria-hidden="true"
          style={{ width: '32px', height: '1px', background: 'currentColor', opacity: 0.5, flex: '0 0 auto' }}
        />
      )}
      {children}
    </Tag>
  )
}
