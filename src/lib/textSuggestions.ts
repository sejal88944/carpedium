export type TextCategory = 'couple' | 'men' | 'women' | 'kids' | 'general'

export type TextDesignStyle = {
  id: string
  name: string
  fontFamily: string
  fontWeight: string
  fontSize: number
  fill: string
  angle: number
  letterSpacing?: number
  prefix?: string
  suffix?: string
}

export type TextSuggestion = {
  id: string
  text: string
  label: string
  category: TextCategory
  design: TextDesignStyle
}

const DESIGN_STYLES: TextDesignStyle[] = [
  {
    id: 'bold-center',
    name: 'Bold Center',
    fontFamily: 'Impact',
    fontWeight: '800',
    fontSize: 34,
    fill: '#ffffff',
    angle: 0,
  },
  {
    id: 'emoji-fire',
    name: 'Fire Style',
    prefix: '🔥 ',
    suffix: ' 🔥',
    fontFamily: 'Arial Black',
    fontWeight: '800',
    fontSize: 30,
    fill: '#f97316',
    angle: 0,
  },
  {
    id: 'minimal-space',
    name: 'Minimal',
    fontFamily: 'Syne',
    fontWeight: '600',
    fontSize: 22,
    fill: '#f8fafc',
    angle: 0,
    letterSpacing: 180,
  },
  {
    id: 'premium-gold',
    name: 'Premium Gold',
    fontFamily: 'Georgia',
    fontWeight: '700',
    fontSize: 28,
    fill: '#d4a012',
    angle: 0,
  },
  {
    id: 'emoji-heart',
    name: 'Heart Style',
    prefix: '❤ ',
    suffix: ' ❤',
    fontFamily: 'Brush Script MT',
    fontWeight: '700',
    fontSize: 28,
    fill: '#fb7185',
    angle: 0,
  },
  {
    id: 'street-tilt',
    name: 'Street Tilt',
    fontFamily: 'Impact',
    fontWeight: '800',
    fontSize: 30,
    fill: '#38bdf8',
    angle: -8,
  },
]

const CATEGORY_KEYWORDS: Record<Exclude<TextCategory, 'general'>, string[]> = {
  couple: [
    'love',
    'couple',
    'her',
    'him',
    'wife',
    'husband',
    'boyfriend',
    'girlfriend',
    'partner',
    'valentine',
    'anniversary',
    'together',
    'soulmate',
    'bae',
    'heart',
    'romance',
    'forever',
    'mine',
    'ours',
  ],
  men: [
    'men',
    'man',
    'dad',
    'father',
    'papa',
    'brother',
    'bro',
    'king',
    'boss',
    'guy',
    'boys',
    'uncle',
    'grandpa',
    'husband',
  ],
  women: [
    'women',
    'woman',
    'mom',
    'mother',
    'mama',
    'sister',
    'sis',
    'queen',
    'girl',
    'girls',
    'lady',
    'aunt',
    'grandma',
    'wife',
    'diva',
  ],
  kids: [
    'kid',
    'kids',
    'child',
    'children',
    'baby',
    'son',
    'daughter',
    'little',
    'cute',
    'school',
    'junior',
    'tiny',
    'champ',
  ],
}

const CATEGORY_LABELS: Record<TextCategory, string> = {
  couple: 'Couple matching designs',
  men: 'Men / Dad designs',
  women: 'Women / Mom designs',
  kids: 'Kids designs',
  general: 'Trending text designs',
}

function normalizeInput(raw: string) {
  return raw.trim().replace(/\s+/g, ' ')
}

function scoreCategory(input: string, keywords: string[]) {
  const lower = input.toLowerCase()
  const words = lower.split(/\s+/)
  let score = 0
  for (const kw of keywords) {
    if (lower.includes(kw)) score += kw.length > 3 ? 2 : 1
    if (words.some((w) => w === kw || w.startsWith(kw))) score += 2
  }
  return score
}

export function detectTextCategory(input: string): TextCategory {
  const clean = normalizeInput(input)
  if (!clean) return 'general'

  const scores = {
    couple: scoreCategory(clean, CATEGORY_KEYWORDS.couple),
    men: scoreCategory(clean, CATEGORY_KEYWORDS.men),
    women: scoreCategory(clean, CATEGORY_KEYWORDS.women),
    kids: scoreCategory(clean, CATEGORY_KEYWORDS.kids),
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  if (!best || best[1] === 0) return 'general'
  return best[0] as TextCategory
}

function isLikelyName(word: string) {
  return /^[a-zA-Z]{2,15}$/.test(word) && !CATEGORY_KEYWORDS.couple.includes(word.toLowerCase())
}

function buildFromTemplates(
  templates: string[],
  category: TextCategory,
  input: string,
): TextSuggestion[] {
  const word = normalizeInput(input).toUpperCase()
  const texts = templates.map((tpl) => tpl.replace(/\{word\}/g, word || 'YOU'))

  return texts.slice(0, 6).map((text, i) => ({
    id: `${category}-${i}`,
    text,
    label: DESIGN_STYLES[i]?.name ?? 'Style',
    category,
    design: DESIGN_STYLES[i] ?? DESIGN_STYLES[0],
  }))
}

function coupleSuggestions(input: string): string[] {
  const parts = normalizeInput(input).split(/\s+/)
  const single = parts.length === 1 ? parts[0] : ''
  const upper = normalizeInput(input).toUpperCase()

  if (single && isLikelyName(single)) {
    const name = single.toUpperCase()
    return [
      `I LOVE ${name}`,
      `ONLY ${name}`,
      `${name} FOREVER`,
      `TEAM ${name}`,
      `ALL FOR ${name}`,
      `BORN TO LOVE ${name}`,
    ]
  }

  if (
    upper.includes('HER') ||
    upper.includes('HIM') ||
    upper.includes('LOVE') ||
    upper.includes('COUPLE')
  ) {
    return [
      'I ❤️ HER',
      'I ❤️ HIM',
      'HIS ONLY',
      'HER ONE',
      'BORN TO LOVE HER',
      'BOOKED BY HIM',
    ]
  }

  if (wordCount(upper) >= 2) {
    return [
      upper,
      `${upper} FOREVER`,
      `TEAM ${upper}`,
      `ONLY ${upper}`,
      `${upper} & ME`,
      `ALL FOR ${upper}`,
    ]
  }

  return [
    `I LOVE ${upper || 'YOU'}`,
    'HIS ONLY',
    'HER ONE',
    `ADDICTED TO ${upper || 'YOU'}`,
    "I'M HIS",
    "I'M HER",
  ]
}

function menSuggestions(input: string): string[] {
  const upper = normalizeInput(input).toUpperCase()
  const core = upper || 'KING'

  return [
    `${core} MODE`,
    `KING ${core}`,
    `THE ${core} LIFE`,
    `${core} SQUAD`,
    `BORN TO ${core}`,
    `${core} LEGEND`,
  ]
}

function womenSuggestions(input: string): string[] {
  const upper = normalizeInput(input).toUpperCase()
  const core = upper || 'QUEEN'

  return [
    `${core} QUEEN`,
    `BOSS ${core}`,
    `${core} VIBES`,
    `QUEEN OF ${core}`,
    `${core} ENERGY`,
    `SLAY ${core}`,
  ]
}

function kidsSuggestions(input: string): string[] {
  const upper = normalizeInput(input).toUpperCase()
  const core = upper || 'STAR'

  return [
    `LITTLE ${core}`,
    `SUPER ${core}`,
    `${core} STAR`,
    `MINI ${core}`,
    `${core} ROCKS`,
    `CUTEST ${core}`,
  ]
}

function generalSuggestions(input: string): string[] {
  const upper = normalizeInput(input).toUpperCase()
  const core = upper || 'CUSTOM'

  return [
    core,
    `${core} CLUB`,
    `TEAM ${core}`,
    `${core} VIBES`,
    `ONLY ${core}`,
    `${core} FOREVER`,
  ]
}

function wordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length
}

export function generateTextSuggestions(input: string): TextSuggestion[] {
  const clean = normalizeInput(input)
  if (!clean) return []

  const category = detectTextCategory(clean)

  let templates: string[]
  switch (category) {
    case 'couple':
      templates = coupleSuggestions(clean)
      break
    case 'men':
      templates = menSuggestions(clean)
      break
    case 'women':
      templates = womenSuggestions(clean)
      break
    case 'kids':
      templates = kidsSuggestions(clean)
      break
    default:
      templates = generalSuggestions(clean)
  }

  return buildFromTemplates(templates, category, clean)
}

export function sortThemesByCategory<T extends { id: string }>(
  themes: readonly T[],
  category: TextCategory,
): T[] {
  if (category === 'general') return [...themes]
  const priority = themes.filter((t) => t.id === category)
  const rest = themes.filter((t) => t.id !== category)
  return [...priority, ...rest]
}

export function getCategoryLabel(category: TextCategory) {
  return CATEGORY_LABELS[category]
}
