// Central registry of Miraz brand assets (Vite resolves these to hashed URLs).
import markBrass from './miraz-mark-brass.svg'
import markOlive from './miraz-mark-olive.svg'
import markCharcoal from './miraz-mark-charcoal.svg'
import markGold from './miraz-mark-gold.svg'
import wordmarkBrass from './miraz-wordmark-brass.svg'
import frieze from './landmarks-frieze.svg'

// Mark by ink colour, matching the destination `ink` field.
export const MARK = {
  brass: markBrass,
  olive: markOlive,
  charcoal: markCharcoal,
  gold: markGold,
}

export const MARK_CHARCOAL = markCharcoal
export const MARK_GOLD = markGold
export const WORDMARK_BRASS = wordmarkBrass
export const FRIEZE = frieze
