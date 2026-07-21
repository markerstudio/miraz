import React from 'react'

/**
 * Landmark watermarks — single-weight line compositions in the spirit of the
 * design system's landmarks frieze, rendered faint behind the pages (the
 * brief asks for "شفافية ناعمة وبسيطة … خفيفة جدًا"). Placeholder sketches;
 * swap for the brand's real illustrations when supplied.
 */

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round' }

const MOTIFS = {
  // Mount Fuji, sun and drifting clouds, torii gate
  eastasia: (
    <svg viewBox="0 0 200 130" style={{ width: '100%' }}>
      <g {...S}>
        <circle cx="160" cy="24" r="9" />
        <path d="M10 112 C40 76 58 48 74 26 C78 20 86 20 90 26 C104 46 118 76 140 112" />
        <path d="M56 50 l6 6 7 -6 7 6 7 -6 7 6 7 -6" />
        <path d="M22 36 h26 M14 44 h17 M168 52 h18 M176 60 h13" />
        <path d="M140 112 V84 M182 112 V84 M132 84 C146 76 176 76 190 84 M136 94 H186 M161 84 V94" />
        <path d="M18 120 h58 M96 120 h86" opacity="0.6" />
      </g>
    </svg>
  ),
  // Olive wreath — two branches, leaves and olives
  levant: (
    <svg viewBox="0 0 200 130" style={{ width: '100%' }}>
      <g {...S}>
        <path d="M100 118 C64 112 40 92 31 58" />
        <path d="M78 113 C69 112 63 106 62 97 C71 99 77 105 78 113 Z" />
        <path d="M59 103 C51 100 46 93 46 85 C55 88 60 95 59 103 Z" />
        <path d="M44 88 C37 83 34 75 36 67 C44 72 47 80 44 88 Z" />
        <path d="M35 70 C29 64 27 55 30 48 C37 54 39 63 35 70 Z" />
        <circle cx="52" cy="94" r="3.4" />
        <circle cx="36" cy="60" r="3.4" />
        <path d="M100 118 C136 112 160 92 169 58" />
        <path d="M122 113 C131 112 137 106 138 97 C129 99 123 105 122 113 Z" />
        <path d="M141 103 C149 100 154 93 154 85 C145 88 140 95 141 103 Z" />
        <path d="M156 88 C163 83 166 75 164 67 C156 72 153 80 156 88 Z" />
        <path d="M165 70 C171 64 173 55 170 48 C163 54 161 63 165 70 Z" />
        <circle cx="148" cy="94" r="3.4" />
        <circle cx="164" cy="60" r="3.4" />
        <path d="M96 22 C98 18 102 18 104 22 C104 26 100 28 100 31 C100 28 96 26 96 22 Z" opacity="0.8" />
      </g>
    </svg>
  ),
  // Santorini — domed chapel, bell niche, stepped houses, windmill, sea
  greece: (
    <svg viewBox="0 0 200 130" style={{ width: '100%' }}>
      <g {...S}>
        <path d="M50 64 C50 46 82 46 82 64" />
        <path d="M66 46 V39 M62 42 H70" />
        <path d="M46 64 H86 V110 H46 Z" />
        <path d="M60 82 C60 75 72 75 72 82 V94 H60 Z" />
        <path d="M92 68 V56 C92 47 106 47 106 56 V68 Z M99 56 v7" />
        <path d="M112 110 V80 H138 V110 M120 80 V66 H152 V110 M128 92 h8 M142 76 h6" />
        <path d="M164 110 V90 C164 80 182 80 182 90 V110 M173 80 V70 M173 74 L186 62 M173 74 L160 62 M173 74 L188 80 M173 74 L158 82" />
        <path d="M16 120 C30 114 44 126 58 120 C72 114 86 126 100 120 C114 114 128 126 142 120 C156 114 170 126 184 120" />
      </g>
    </svg>
  ),
  // Golden Gate towers, cables and suspenders; Liberty's torch
  usa: (
    <svg viewBox="0 0 200 130" style={{ width: '100%' }}>
      <g {...S}>
        <path d="M28 112 V86 M21 86 H35 M28 86 C23 76 25 64 28 57 C31 64 33 76 28 86 M28 50 C25 46 28 39 28 39 C28 39 31 46 28 50" />
        <path d="M76 112 V54 M84 112 V54 M76 64 H84 M76 80 H84 M76 96 H84" />
        <path d="M140 112 V54 M148 112 V54 M140 64 H148 M140 80 H148 M140 96 H148" />
        <path d="M52 112 C60 82 68 60 80 54 M80 54 C98 74 126 74 144 54 M144 54 C156 60 164 82 172 112" />
        <path d="M92 67 V102 M102 71 V102 M112 72 V102 M122 71 V102 M132 67 V102" />
        <path d="M48 102 H178" />
      </g>
    </svg>
  ),
  // Colosseum's broken rim and arch tiers; the leaning tower
  italy: (
    <svg viewBox="0 0 200 130" style={{ width: '100%' }}>
      <g {...S}>
        <path d="M14 112 V80 C14 71 28 65 46 62 L46 53 C60 49 80 47 96 49 L96 58 C110 60 120 66 120 75 V112" />
        <path d="M24 112 V97 C24 91 32 91 32 97 V112 M42 112 V94 C42 88 50 88 50 94 V112 M60 112 V92 C60 86 68 86 68 92 V112 M78 112 V92 C78 86 86 86 86 92 V112 M98 112 V95 C98 89 106 89 106 95 V112" />
        <path d="M28 80 C28 75 35 75 35 80 M46 75 C46 70 53 70 53 75 M64 72 C64 67 71 67 71 72 M82 72 C82 67 89 67 89 72 M102 78 C102 73 109 73 109 78" />
        <g transform="rotate(-8 158 112)">
          <path d="M146 112 V42 H170 V112 M146 55 H170 M146 68 H170 M146 81 H170 M146 95 H170 M150 42 V33 H166 V42" />
          <path d="M151 48 v4 M158 48 v4 M165 48 v4 M151 61 v4 M158 61 v4 M165 61 v4 M151 74 v4 M158 74 v4 M165 74 v4" />
        </g>
        <path d="M12 120 h74 M120 120 h68" opacity="0.6" />
      </g>
    </svg>
  ),
  // Koutoubia minaret, horseshoe gate with merlons, a palm
  morocco: (
    <svg viewBox="0 0 200 130" style={{ width: '100%' }}>
      <g {...S}>
        <path d="M38 112 V32 H66 V112 M42 32 V24 H62 V32 M48 24 V16 H56 V24 M52 16 V9" />
        <circle cx="52" cy="7" r="1.8" />
        <path d="M45 46 C48 41 56 41 59 46 M45 60 C48 55 56 55 59 60 M45 74 C48 69 56 69 59 74 M42 88 H62 M42 98 H62" />
        <path d="M92 112 V72 C92 50 101 38 117 38 C133 38 142 50 142 72 V112" />
        <path d="M100 112 V76 C100 59 106 49 117 49 C128 49 134 59 134 76 V112" />
        <path d="M78 112 V101 h7 v6 h7 v-6 h7 M156 112 V101 h-7 v6 h-7 v-6 h-7" />
        <path d="M176 112 C174 96 174 84 178 72 M178 72 C170 66 163 66 157 70 M178 72 C173 61 167 57 160 58 M178 72 C180 61 186 55 193 57 M178 72 C186 65 192 67 196 74 M178 72 C184 74 188 80 189 87" />
        <path d="M70 120 h60 M148 120 h44" opacity="0.6" />
      </g>
    </svg>
  ),
}

/** A single landmark watermark, centred behind page content. */
export function Watermark({ id, opacity = 0.09, width = '86%' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', color: 'var(--charcoal)', opacity }}>
      <div style={{ width }}>{MOTIFS[id] || null}</div>
    </div>
  )
}

/** Abstract world map — meridian arcs, ports, a dashed looping flight path. */
export function WorldMapWatermark({ opacity = 0.06, plane = false }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', color: 'var(--charcoal)', opacity }}>
      <svg viewBox="0 0 200 120" style={{ width: '88%' }}>
        <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
          <ellipse cx="100" cy="60" rx="86" ry="48" />
          <ellipse cx="100" cy="60" rx="44" ry="48" />
          <path d="M14 60 H186 M22 34 C70 22 130 22 178 34 M22 86 C70 98 130 98 178 86" />
          <path
            d="M34 82 C52 62 84 54 104 62 C122 69 120 84 106 83 C94 82 94 68 110 60 C130 50 156 52 170 62"
            strokeDasharray="1 6"
            strokeWidth="1.6"
          />
        </g>
        <g fill="currentColor">
          <circle cx="52" cy="44" r="1.8" />
          <circle cx="98" cy="36" r="1.8" />
          <circle cx="142" cy="50" r="1.8" />
          <circle cx="74" cy="76" r="1.8" />
          <circle cx="128" cy="82" r="1.8" />
        </g>
        {plane && (
          <g transform="translate(172 60) rotate(22)" fill="currentColor">
            <path d="M0 0 L-11 3 L-8 0 L-11 -3 Z" />
            <path d="M-4 0 L-1 -4 L1 -4 L-2 0 L1 4 L-1 4 Z" />
          </g>
        )}
      </svg>
    </div>
  )
}

/** Minimal line icons for the grand rewards (cloche / note / camera). */
export function RewardIcon({ kind, size = 26, color = 'var(--brass-deep)' }) {
  const s = { fill: 'none', stroke: color, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (kind === 'cloche')
    return (
      <svg viewBox="0 0 32 32" width={size} height={size}>
        <g {...s}>
          <path d="M5 22 C5 14 11 10 16 10 C21 10 27 14 27 22 Z" />
          <path d="M16 10 V7 M14 7 H18 M3 25 H29" />
        </g>
      </svg>
    )
  if (kind === 'note')
    return (
      <svg viewBox="0 0 32 32" width={size} height={size}>
        <g {...s}>
          <path d="M12 24 V8 L25 5 V21" />
          <circle cx="9" cy="24" r="3.2" />
          <circle cx="22" cy="21" r="3.2" />
        </g>
      </svg>
    )
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      <g {...s}>
        <rect x="4" y="10" width="24" height="16" rx="2.5" />
        <path d="M11 10 L13 6 H19 L21 10" />
        <circle cx="16" cy="18" r="4.5" />
      </g>
    </svg>
  )
}
