// Miraz World — Flavor Passport. Content model straight from the brief:
// six countries, six circular stamp slots each (36 total), a story per
// country, a rewards ladder by total stamp count, grand rewards at 36,
// and the passport rules.

export const INK = {
  brass: 'var(--brass-deep)',
  olive: 'var(--olive)',
  charcoal: 'var(--charcoal)',
}

// Guilloché security-page background — pages stay light beige like a real
// passport. Rasterized once (lib/paper.js) instead of live CSS gradients:
// the same pattern painted on ~25 leaf faces was a mobile repaint hotspot.
import { paperStyle } from '../lib/paper.js'
export const PAGE_BG = paperStyle()

export const SLOTS_PER_COUNTRY = 6
export const SLOT_ROTS = [-4, 3, -2, 5, -3, 2]

// Countries in the brief's page order. `wm` picks the landmark watermark;
// `shape` picks the border-stamp silhouette (like real entry stamps).
export const COUNTRIES = [
  {
    id: 'eastasia',
    en: 'EAST ASIA',
    ar: 'شرق آسيا',
    ink: 'charcoal',
    wm: 'eastasia',
    shape: 'seal',
    story:
      'تجربة كاملة وتوازن دقيق بين الحواس الخمس. في ميراز، يُصنع الطعم بهدوء وانضباط، حيث تكون كل التفاصيل محسوبة، والنتيجة تجربة هادئة ونظيفة لا مثيل لها.',
  },
  {
    id: 'levant',
    en: 'THE LEVANT',
    ar: 'بلاد الشام',
    ink: 'olive',
    wm: 'levant',
    shape: 'circle',
    story:
      'ذاكرة تُصنع من الطعم قبل الكلمات. في ميراز، طعامنا يحمل روح البيت إلى مائدتنا، حيث كل طبق يحمل إحساسًا مألوفًا يعيد بناء لحظات من الدفء واللقاء كذكريات لا تُنسى. هنا الطعام ليس مجرد وصفة، بل وسيلة لصنع شعور جماعي يبقى حاضرًا حتى بعد انتهاء التجربة.',
  },
  {
    id: 'greece',
    en: 'GREECE',
    ar: 'اليونان',
    ink: 'brass',
    wm: 'greece',
    shape: 'oval',
    story:
      'هنا البحر هو نقطة البداية، والطعم امتداد طبيعي له. في ميراز، من قلب البحر تأتي الفكرة، ومنه تُبنى النكهة. نقدم لكم روح البحر، حيث تُحضَّر الأسماك والمأكولات البحرية بأسلوب يحافظ على نقاء المصدر وجودة المنتج.',
  },
  {
    id: 'usa',
    en: 'UNITED STATES',
    ar: 'الولايات المتحدة',
    ink: 'charcoal',
    wm: 'usa',
    shape: 'rect',
    story:
      'جرأة في الطعم وقوام يفرض حضوره. في ميراز، نقدم التجربة بأسلوب قوي لا يُنافس، وبنكهات تملأ الحواس من أول لقمة.',
  },
  {
    id: 'italy',
    en: 'ITALY',
    ar: 'إيطاليا',
    ink: 'olive',
    wm: 'italy',
    shape: 'hex',
    story:
      'حيث تتحول البساطة إلى معيار للفخامة، والطعم إلى لغة واضحة لا تحتاج إلى شرح. في ميراز، يُقدَّم الطعام بثقة هادئة؛ كل طبق يُبنى على فكرة أن الجودة لا تحتاج تعقيدًا، وأن الفخامة الحقيقية تكمن في البساطة، لتتحول أبسط المكونات إلى تجربة متكاملة الحضور.',
  },
  {
    id: 'morocco',
    en: 'MOROCCO',
    ar: 'المغرب',
    ink: 'brass',
    wm: 'morocco',
    shape: 'arch',
    story:
      'لغة كاملة من التوابل تُكتب بها النكهات. في ميراز، يمتزج الحلو بالمالح والحرارة بالدفء، لتتشكل تجربة عميقة تترك أثرها في الذاكرة قبل أن تنتهي.',
  },
]

export const TOTAL_STAMPS = COUNTRIES.length * SLOTS_PER_COUNTRY // 36

// Rewards ladder — unlocked by TOTAL stamps collected.
export const REWARD_TIERS = [
  { n: 3, en: 'WELCOME MOMENT', ar: 'مقبلات من اختيار الشيف' },
  { n: 6, en: 'SWEET EXPERIENCE', ar: 'حلوى بتقديم مميز' },
  { n: 9, en: "CHEF'S CHOICE", ar: 'طبق جانبي مميز من الشيف' },
  { n: 12, en: 'MUSIC NIGHT', ar: 'دعوة لحضور سهرة موسيقية داخل المطعم' },
  { n: 18, en: 'VIP MEAL', ar: 'وجبة خاصة من تقديم الشيف' },
  { n: 24, en: 'DOUBLE EXPERIENCE', ar: 'تجربة إفطار مميزة لشخصين (من اختيار الشيف)' },
  { n: 36, en: 'MIRAZ WORLD REWARDS', ar: 'جوائز عالم ميراز' },
]

// The three grand rewards on the Miraz World page.
export const GRAND_REWARDS = [
  { id: 'dinner', icon: 'cloche', ar: 'تجربة عشاء خاص ومميز لشخصين', en: 'PRIVATE DINNER FOR TWO' },
  { id: 'music', icon: 'note', ar: 'ليلة موسيقية رومانسية لشخصين', en: 'ROMANTIC MUSIC NIGHT' },
  { id: 'hall', icon: 'camera', ar: 'ظهور في «قاعة المسافرين» على إنستغرام', en: 'TRAVELLERS’ HALL FEATURE' },
]

export const RULES = [
  'يجب إحضار جواز السفر في كل زيارة.',
  'الجواز شخصي وغير قابل للمشاركة.',
  'صلاحيته ٦ أشهر من تاريخ الإصدار.',
  'ختم واحد لكل زيارة عند طلب وجبة رئيسية.',
  'المكافآت تُمنح عند اكتمال الأختام.',
  'لا يمكن استبدال المكافآت بقيمة نقدية.',
]

// Holder page sample data (issue today, expiry +6 months per the rules).
export const HOLDER = {
  fields: [
    ['Name / الاسم', 'ضيف ميراز'],
    ['Date of birth / تاريخ الميلاد', '— / — / —'],
    ['Phone / رقم الهاتف', '+970 — — — —'],
    ['Issued / تاريخ الإصدار', '19 · 07 · 2026'],
    ['Expires / تاريخ الانتهاء', '19 · 01 · 2027'],
  ],
  no: 'MW‑2026',
}
