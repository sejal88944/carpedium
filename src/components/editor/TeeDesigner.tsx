'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import { Canvas, FabricImage, FabricObject, IText, Line, Rect } from 'fabric'
import { COMPANY, TEE_COLORS, type TeeColorId } from '@/data/brand'
import { useCart } from '@/store/useCart'
import { useAdminStore } from '@/store/useAdminStore'
import { buildWhatsAppOrderUrl } from '@/lib/whatsappOrder'
import { PdfWhatsAppHint } from '@/components/order/PdfWhatsAppHint'
import { DETAILS_FILLED_PDF_HINT } from '@/data/orderHints'
import {
  compressArtworkForCartStorage,
  downloadDataUrl,
  exportArtworkFromFabric,
  stashPrintArtworkForCartItem,
} from '@/lib/designArtworkExport'
import { generateDesignPdfBundle } from '@/lib/designPdf'
import { openPrintDialogForRasterDesign } from '@/lib/printDesignSheet'
import {
  downloadStoredInvoicePdf,
  stashDesignExport,
} from '@/lib/designExportStore'
import { AddToCartSuccessModal } from '@/components/editor/AddToCartSuccessModal'
import { AddToCartLoadingOverlay } from '@/components/editor/AddToCartLoadingOverlay'
import { DesignMobileActionBar } from '@/components/editor/DesignMobileActionBar'
import { artworkExportMultiplier, isMobileClient } from '@/lib/isMobileClient'
import { useDebouncedCanvasFit } from '@/lib/useDebouncedCanvasFit'
import { tintTeeMockup } from '@/lib/teeMockup'
import { getPrintAreaForSide, getTeeBounds, getTeeLayout } from '@/lib/teeShape'
import {
  detectTextCategory,
  generateTextSuggestions,
  getCategoryLabel,
  sortThemesByCategory,
} from '@/lib/textSuggestions'

const W = 560
const H = 700
const TEE_LAYOUT = getTeeLayout(W, H)
const TEE_BOUNDS = getTeeBounds(TEE_LAYOUT)

function teeZone(side: 'front' | 'back') {
  const print = getPrintAreaForSide(TEE_LAYOUT, side)
  return {
    print,
    center: { x: print.left + print.width / 2, y: print.top + print.height / 2 },
    bounds: TEE_BOUNDS,
  }
}

const BASE_PRICE = 299
const PRINT_CHARGE = 150

const FONTS = [
  // Display / bold
  'Bebas Neue',
  'Anton',
  'Oswald',
  'Impact',
  'Bowlby One',
  'Russo One',
  'Fjalla One',
  'Black Ops One',
  'Bangers',
  // Serif / elegant
  'Playfair Display',
  'Abril Fatface',
  'Rozha One',
  'Georgia',
  'Times New Roman',
  // Script / handwriting
  'Pacifico',
  'Lobster',
  'Caveat',
  'Dancing Script',
  'Shrikhand',
  'Yatra One',
  // Streetwear / graffiti
  'Permanent Marker',
  'Creepster',
  'Faster One',
  'Special Elite',
  // Futuristic / gaming
  'Orbitron',
  'Audiowide',
  'Bungee',
  'Monoton',
  'Righteous',
  'Press Start 2P',
  // Marathi / Devanagari friendly
  'Mukta',
  'Baloo 2',
  'Tiro Devanagari Marathi',
  // Brand defaults
  'Syne',
  'Inter',
  'Arial',
]
const WEIGHTS = ['400', '600', '700', '800']
const TEXT_COLOR_PRESETS = [
  '#ffffff',
  '#0f172a',
  '#d4a012',
  '#ef4444',
  '#f97316',
  '#22c55e',
  '#38bdf8',
  '#2563eb',
  '#a855f7',
  '#ec4899',
  '#facc15',
  '#14b8a6',
]

const IMAGE_DESIGN_THEMES = [
  {
    id: 'men',
    name: 'Men Streetwear',
    emoji: '⚡',
    bg: ['#020617', '#1d4ed8'],
    accent: '#38bdf8',
    fontFamily: 'Impact',
    fontSize: 78,
    fontWeight: '900',
    angle: -6,
    letterSpacing: 2,
  },
  {
    id: 'women',
    name: 'Women Aesthetic',
    emoji: '✦',
    bg: ['#831843', '#f9a8d4'],
    accent: '#ffffff',
    fontFamily: 'Georgia',
    fontSize: 72,
    fontWeight: '700',
    angle: 0,
    letterSpacing: 0,
  },
  {
    id: 'kids',
    name: 'Kids Fun',
    emoji: '😊',
    bg: ['#facc15', '#38bdf8'],
    accent: '#7c3aed',
    fontFamily: 'Comic Sans MS',
    fontSize: 70,
    fontWeight: '800',
    angle: 5,
    letterSpacing: 0,
  },
  {
    id: 'couple',
    name: 'Couple Love',
    emoji: '❤',
    bg: ['#7f1d1d', '#fb7185'],
    accent: '#fff7ed',
    fontFamily: 'Brush Script MT',
    fontSize: 78,
    fontWeight: '700',
    angle: 0,
    letterSpacing: 0,
  },
] as const

type Props = {
  initialColorId?: TeeColorId
}

/** Custom Design Studio: only these 4 tee colours (Black, White, Navy, Grey). */
const DESIGNER_TEE_COLORS = TEE_COLORS.slice(0, 4)

type UserObject = FabricObject & { meta?: string; printSide?: 'front' | 'back' }

function setMeta(obj: FabricObject, meta: string) {
  ;(obj as UserObject).meta = meta
}

function isHelper(obj: FabricObject) {
  return Boolean((obj as UserObject).meta?.startsWith('__'))
}

function isUserObject(obj: FabricObject) {
  return !isHelper(obj)
}

function isDarkColor(hex: string) {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return lum < 0.45
}

function fabricBlendForColor(hex: string): GlobalCompositeOperation {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

  if (lum < 0.38) return 'screen'
  if (lum > 0.72) return 'multiply'
  return 'source-over'
}

/** Re-apply logo blend when tee colour changes (initial blend is only set at upload time). */
function syncPrintImagesToTeeColor(canvas: Canvas, teeHex: string) {
  const blend = fabricBlendForColor(teeHex)
  const opacity = isDarkColor(teeHex) ? 0.92 : 0.96
  canvas.getObjects().forEach((o) => {
    if ((o as UserObject).meta !== 'print' && (o as UserObject).meta !== 'print-underbase') return
    if (!(o instanceof FabricImage)) return
    o.set({ globalCompositeOperation: blend, opacity })
    o.dirty = true
  })
}

function syncDesignsForSide(canvas: Canvas, activeSide: 'front' | 'back') {
  canvas.getObjects().forEach((o) => {
    if (isHelper(o)) return
    const ps = (o as UserObject).printSide
    o.visible = !ps || ps === activeSide
  })
  canvas.requestRenderAll()
}

async function drawTee(canvas: Canvas, hex: string, side: 'front' | 'back') {
  const url = await tintTeeMockup(hex, side)
  const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' })

  // Strip ALL old tee mockups + grid helpers before adding the recoloured tee.
  // (Earlier we only stripped objects with meta starting with '__'; race conditions
  // during rapid colour clicks could leave stale tees stacked above the new one.)
  const stale = canvas.getObjects().filter((o) => {
    const meta = (o as UserObject).meta
    return meta === '__tee' || meta === '__grid'
  })
  stale.forEach((o) => canvas.remove(o))

  const scale = TEE_LAYOUT.width / (img.width ?? 256)
  img.set({
    scaleX: scale,
    scaleY: scale,
    left: TEE_LAYOUT.left,
    top: TEE_LAYOUT.top,
    selectable: false,
    evented: false,
  })
  setMeta(img, '__tee')
  canvas.add(img)
  canvas.sendObjectToBack(img)
  canvas.requestRenderAll()

  drawGrid(canvas, false)
}

const TEXT_EMOJIS = [
  '❤️',
  '🔥',
  '✨',
  '⭐',
  '★',
  '😊',
  '😎',
  '👑',
  '💯',
  '🎉',
  '💪',
  '💕',
  '⚡',
  '🌟',
  '✌️',
  '🙌',
] as const

function formatTeeText(value: string) {
  if (/\p{Extended_Pictographic}/u.test(value)) return value
  return value.toUpperCase()
}

function drawGrid(canvas: Canvas, visible: boolean, side: 'front' | 'back') {
  const existing = canvas.getObjects().filter((o) => (o as UserObject).meta === '__grid')
  if (visible && existing.length) return
  existing.forEach((o) => canvas.remove(o))
  if (!visible) {
    canvas.requestRenderAll()
    return
  }

  const { print, center } = teeZone(side)
  const lines: Line[] = []
  for (let x = print.left; x <= print.left + print.width; x += 20) {
    lines.push(new Line([x, print.top, x, print.top + print.height], { stroke: 'rgba(14,165,233,0.16)' }))
  }
  for (let y = print.top; y <= print.top + print.height; y += 20) {
    lines.push(new Line([print.left, y, print.left + print.width, y], { stroke: 'rgba(14,165,233,0.16)' }))
  }
  lines.push(new Line([center.x, print.top, center.x, print.top + print.height], { stroke: 'rgba(14,165,233,0.45)' }))
  lines.push(new Line([print.left, center.y, print.left + print.width, center.y], { stroke: 'rgba(14,165,233,0.45)' }))
  lines.forEach((line) => {
    setMeta(line, '__grid')
    line.set({ selectable: false, evented: false, excludeFromExport: true })
    canvas.add(line)
  })
  canvas.requestRenderAll()
}

function constrainToTeeArea(obj: FabricObject, side: 'front' | 'back') {
  const { center, bounds } = teeZone(side)
  const halfW = obj.getScaledWidth() / 2
  const halfH = obj.getScaledHeight() / 2
  const minX = bounds.left + Math.min(halfW, bounds.width / 2)
  const maxX = bounds.left + bounds.width - Math.min(halfW, bounds.width / 2)
  const minY = bounds.top + Math.min(halfH, bounds.height / 2)
  const maxY = bounds.top + bounds.height - Math.min(halfH, bounds.height / 2)
  const currentLeft = Number(obj.left ?? center.x)
  const currentTop = Number(obj.top ?? center.y)

  const snapX = Math.abs(currentLeft - center.x) < 8 ? center.x : currentLeft
  const snapY = Math.abs(currentTop - center.y) < 8 ? center.y : currentTop

  obj.set({
    left: Math.min(maxX, Math.max(minX, snapX)),
    top: Math.min(maxY, Math.max(minY, snapY)),
  })
}

const SUPPORTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif']

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('file_read_failed'))
    reader.onload = () => resolve(String(reader.result || ''))
    reader.readAsDataURL(file)
  })
}

async function resizeImageForEditor(file: File, maxSize = 1400): Promise<string> {
  const type = file.type || ''
  if (type && !SUPPORTED_TYPES.includes(type) && !type.startsWith('image/')) {
    throw new Error('unsupported_format')
  }

  const dataUrl = await readFileAsDataURL(file)

  // SVG / GIF / unknown -> skip canvas resize, return original data URL
  if (type === 'image/svg+xml' || type === 'image/gif' || !type) {
    return dataUrl
  }

  return new Promise((resolve) => {
    const img = new Image()
    if (!dataUrl.startsWith('data:')) img.crossOrigin = 'anonymous'
    img.onerror = () => {
      // Fallback: return original data URL if decode fails
      resolve(dataUrl)
    }
    img.onload = () => {
      try {
        const iw = img.naturalWidth || img.width
        const ih = img.naturalHeight || img.height
        if (!iw || !ih) return resolve(dataUrl)
        const ratio = Math.min(maxSize / iw, maxSize / ih, 1)
        const w = Math.max(1, Math.round(iw * ratio))
        const h = Math.max(1, Math.round(ih * ratio))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(dataUrl)
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL(type === 'image/png' || type === 'image/webp' ? 'image/png' : 'image/jpeg', 0.92))
      } catch {
        resolve(dataUrl)
      }
    }
    img.src = dataUrl
  })
}

function generateImageFromText(
  text: string,
  theme: (typeof IMAGE_DESIGN_THEMES)[number],
): string {
  const canvas = document.createElement('canvas')
  canvas.width = 900
  canvas.height = 900
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  const clean = text.trim().toUpperCase() || 'CUSTOM'
  const gradient = ctx.createLinearGradient(0, 0, 900, 900)
  gradient.addColorStop(0, theme.bg[0])
  gradient.addColorStop(1, theme.bg[1])
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 900, 900)

  ctx.globalAlpha = 0.18
  for (let i = 0; i < 9; i++) {
    ctx.beginPath()
    ctx.arc(120 + i * 95, 140 + ((i * 67) % 620), 70 + (i % 3) * 20, 0, Math.PI * 2)
    ctx.fillStyle = i % 2 ? '#ffffff' : theme.accent
    ctx.fill()
  }
  ctx.globalAlpha = 1

  ctx.strokeStyle = 'rgba(255,255,255,0.45)'
  ctx.lineWidth = 6
  ctx.strokeRect(95, 95, 710, 710)

  ctx.fillStyle = theme.accent
  ctx.font = 'bold 96px Arial Black, Impact, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(theme.emoji, 450, 235)

  ctx.save()
  ctx.translate(450, 455)
  ctx.rotate((theme.angle * Math.PI) / 180)
  ctx.fillStyle = '#ffffff'
  ctx.font = `${theme.fontWeight} ${theme.fontSize}px ${theme.fontFamily}, Arial Black, Impact, sans-serif`
  ctx.letterSpacing = `${theme.letterSpacing}px`
  const words = clean.split(/\s+/)
  if (words.length > 1) {
    ctx.fillText(words.slice(0, Math.ceil(words.length / 2)).join(' '), 0, -42)
    ctx.fillText(words.slice(Math.ceil(words.length / 2)).join(' '), 0, 42)
  } else {
    ctx.fillText(clean.slice(0, 12), 0, 0)
  }
  ctx.restore()

  return canvas.toDataURL('image/png')
}

async function placeImage(
  canvas: Canvas,
  url: string,
  teeHex: string,
  side: 'front' | 'back',
) {
  const { print, center } = teeZone(side)
  const isDataUrl = url.startsWith('data:')
  const img = await FabricImage.fromURL(url, isDataUrl ? {} : { crossOrigin: 'anonymous' })
  const iw = img.width ?? 1
  const ih = img.height ?? 1
  const scale = Math.min((print.width * 0.82) / iw, (print.height * 0.82) / ih, 1.5)

  img.scale(scale)
  img.set({
    left: center.x,
    top: center.y,
    originX: 'center',
    originY: 'center',
    globalCompositeOperation: fabricBlendForColor(teeHex),
    opacity: isDarkColor(teeHex) ? 0.92 : 0.96,
    objectCaching: true,
    noScaleCache: true,
    cornerColor: '#0ea5e9',
    borderColor: '#0ea5e9',
    cornerStyle: 'circle',
  })
  setMeta(img, 'print')
  ;(img as UserObject).printSide = side
  img.clipPath = undefined
  canvas.add(img)
  canvas.setActiveObject(img)
}

function removeSampleLabel(canvas: Canvas) {
  canvas.getObjects().forEach((o) => {
    if ((o as UserObject).meta === 'label') canvas.remove(o)
  })
}

function removeUploadedPrint(canvas: Canvas) {
  canvas.getObjects().forEach((o) => {
    const meta = (o as UserObject).meta
    if (meta === 'print' || meta === 'print-underbase') canvas.remove(o)
  })
}

function removeUserText(canvas: Canvas) {
  canvas.getObjects().forEach((o) => {
    if ((o as UserObject).meta === 'user-text') canvas.remove(o)
  })
}

function getEditableText(canvas: Canvas): IText | null {
  const active = canvas.getActiveObject()
  if (active instanceof IText && isUserObject(active)) return active

  const textObjects = canvas
    .getObjects()
    .filter((o) => o instanceof IText && (o as UserObject).meta === 'user-text') as IText[]

  return textObjects.at(-1) ?? null
}

export function TeeDesigner({ initialColorId = 'black' }: Props) {
  const { add } = useCart()
  const addUpload = useAdminStore((s) => s.addUpload)
  const upsertCustomer = useAdminStore((s) => s.upsertCustomer)
  const ref = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const textInputRef = useRef<HTMLInputElement>(null)
  const gridNoticeRef = useRef<HTMLDivElement>(null)
  const fabricRef = useRef<Canvas | null>(null)
  const sideRef = useRef<'front' | 'back'>('front')
  const [side, setSide] = useState<'front' | 'back'>('front')
  sideRef.current = side
  const safeInitial: TeeColorId = DESIGNER_TEE_COLORS.some((c) => c.id === initialColorId)
    ? initialColorId
    : (DESIGNER_TEE_COLORS[0]?.id as TeeColorId)
  const [colorId, setColorId] = useState<TeeColorId>(safeInitial)
  const [text, setText] = useState('')
  const [font, setFont] = useState(FONTS[0])
  const [fontWeight, setFontWeight] = useState('700')
  const [textColor, setTextColor] = useState('#ffffff')
  const [fontSize, setFontSize] = useState(28)
  const [rotation, setRotation] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [fileName, setFileName] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [cartBusy, setCartBusy] = useState(false)
  const [addCartModal, setAddCartModal] = useState<{
    cartItemId: string
    orderId: string
    invoiceFileName: string
  } | null>(null)
  const [lastExportCartItemId, setLastExportCartItemId] = useState<string | null>(null)
  const [cartLoadingMsg, setCartLoadingMsg] = useState('')
  const canvasWrapRef = useRef<HTMLDivElement>(null)

  // One-time fetch + persist of customer contact details so returning users
  // don't have to re-type their name / phone / email each time.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem('aasha-customer')
      if (raw) {
        const data = JSON.parse(raw) as {
          name?: string
          phone?: string
          email?: string
          address?: string
        }
        if (data.name) setCustomerName(data.name)
        if (data.phone) setCustomerPhone(data.phone)
        if (data.email) setCustomerEmail(data.email)
        if (data.address) setCustomerAddress(data.address)
      }
    } catch {
      /* ignore */
    }
  }, [])

  function persistCustomer() {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(
        'aasha-customer',
        JSON.stringify({
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          address: customerAddress,
        }),
      )
    } catch {
      /* ignore */
    }
  }

  const color =
    DESIGNER_TEE_COLORS.find((c) => c.id === colorId) ?? DESIGNER_TEE_COLORS[0] ?? TEE_COLORS[0]
  const total = (BASE_PRICE + PRINT_CHARGE) * quantity
  const textCategory = detectTextCategory(text)
  const textSuggestions = generateTextSuggestions(text)
  const sortedImageThemes = sortThemesByCategory(IMAGE_DESIGN_THEMES, textCategory)

  const syncPreview = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.requestRenderAll()
    setPreviewUrl(canvas.toDataURL({ format: 'png', multiplier: 1 }))
  }, [])

  const showGridNotice = useCallback((show: boolean) => {
    gridNoticeRef.current?.classList.toggle('opacity-0', !show)
  }, [])

  const initCanvas = useCallback(() => {
    if (!ref.current || fabricRef.current) return
    const canvas = new Canvas(ref.current, {
      width: W,
      height: H,
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
    })
    fabricRef.current = canvas

    canvas.on('object:moving', (event) => {
      const target = event.target
      if (!target || !isUserObject(target)) return
      constrainToTeeArea(target, sideRef.current)
      drawGrid(canvas, true, sideRef.current)
      showGridNotice(true)
    })
    canvas.on('object:scaling', (event) => {
      const target = event.target
      if (!target || !isUserObject(target)) return
      constrainToTeeArea(target, sideRef.current)
      drawGrid(canvas, true, sideRef.current)
      showGridNotice(true)
    })
    canvas.on('object:rotating', () => {
      drawGrid(canvas, true, sideRef.current)
      showGridNotice(true)
    })
    canvas.on('object:modified', () => {
      drawGrid(canvas, false, sideRef.current)
      showGridNotice(false)
      syncPreview()
    })
    canvas.on('selection:cleared', () => {
      drawGrid(canvas, false, sideRef.current)
      showGridNotice(false)
      syncPreview()
    })
    canvas.on('object:added', syncPreview)
    canvas.on('object:removed', syncPreview)
  }, [showGridNotice, syncPreview])

  useEffect(() => {
    initCanvas()
    return () => {
      fabricRef.current?.dispose()
      fabricRef.current = null
    }
  }, [initCanvas])

  useDebouncedCanvasFit(canvasWrapRef, fabricRef, [side, colorId])

  useEffect(() => {
    let cancelled = false
    const targetHex = color.hex
    const activeSide = side
    const run = async () => {
      const canvas = fabricRef.current
      if (!canvas) return
      await drawTee(canvas, targetHex, activeSide)
      if (cancelled) return
      syncPrintImagesToTeeColor(canvas, targetHex)
      syncDesignsForSide(canvas, activeSide)
      canvas.renderAll()
      syncPreview()
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [color.hex, side, syncPreview])

  async function handleFile(file?: File) {
    const canvas = fabricRef.current
    if (!file || !canvas) return
    setUploadError('')
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File too large — max 15MB. Please compress and try again.')
      return
    }
    if (file.type && !file.type.startsWith('image/')) {
      setUploadError('Please upload an image file (PNG, JPG, WEBP or SVG).')
      return
    }
    try {
      setFileName(file.name)
      removeSampleLabel(canvas)
      removeUploadedPrint(canvas)
      const url = await resizeImageForEditor(file)
      await placeImage(canvas, url, color.hex, side)
      syncPreview()
    } catch (err) {
      console.error('upload failed', err)
      setUploadError('Could not load image. Try a different PNG or JPG file.')
      setFileName('')
    }
  }

  async function onUpload(e: ChangeEvent<HTMLInputElement>) {
    await handleFile(e.target.files?.[0])
  }

  async function applyGeneratedImage(theme: (typeof IMAGE_DESIGN_THEMES)[number]) {
    const canvas = fabricRef.current
    if (!canvas || !text.trim()) return
    removeSampleLabel(canvas)
    removeUploadedPrint(canvas)
    const relatedText =
      textSuggestions.find((s) => s.category === theme.id)?.text ??
      textSuggestions[0]?.text ??
      text
    const generated = generateImageFromText(relatedText, theme)
    setFileName(`${theme.name} generated design`)
    await placeImage(canvas, generated, color.hex, side)
    syncPreview()
  }

  function addTextDesign(
    content: string,
    opts: {
      fontFamily: string
      fontWeight: string
      fontSize: number
      fill: string
      angle: number
      letterSpacing?: number
      prefix?: string
      suffix?: string
    },
    replaceExisting = false,
  ) {
    const canvas = fabricRef.current
    const clean = content.trim()
    if (!canvas || !clean) return
    removeSampleLabel(canvas)
    if (replaceExisting) removeUserText(canvas)
    const { center } = teeZone(side)
    const finalText = `${opts.prefix ?? ''}${formatTeeText(clean)}${opts.suffix ?? ''}`
    const t = new IText(finalText, {
      left: center.x,
      top: center.y,
      originX: 'center',
      originY: 'center',
      fontFamily: opts.fontFamily,
      fill: opts.fill,
      fontSize: opts.fontSize,
      fontWeight: opts.fontWeight,
      angle: opts.angle,
      textAlign: 'center',
      charSpacing: opts.letterSpacing ?? 0,
      cornerColor: '#0ea5e9',
      borderColor: '#0ea5e9',
      cornerStyle: 'circle',
    })
    setMeta(t, 'user-text')
    ;(t as UserObject).printSide = side
    t.clipPath = undefined
    canvas.add(t)
    canvas.setActiveObject(t)
    syncPreview()
  }

  function insertEmoji(emoji: string) {
    setText((prev) => {
      const el = textInputRef.current
      if (!el) return prev + emoji
      const start = el.selectionStart ?? prev.length
      const end = el.selectionEnd ?? prev.length
      const next = prev.slice(0, start) + emoji + prev.slice(end)
      requestAnimationFrame(() => {
        el.focus()
        const pos = start + emoji.length
        el.setSelectionRange(pos, pos)
      })
      return next
    })
  }

  function addText() {
    addTextDesign(
      text,
      {
        fontFamily: font,
        fontWeight,
        fontSize,
        fill: textColor,
        angle: rotation,
      },
      false,
    )
  }

  function updateSelectedText(
    props: Partial<{
      fontFamily: string
      fontWeight: string
      fontSize: number
      fill: string
      charSpacing: number
    }>,
  ) {
    const canvas = fabricRef.current
    if (!canvas) return
    const target = getEditableText(canvas)
    if (!target) return
    target.set(props)
    canvas.setActiveObject(target)
    canvas.requestRenderAll()
    syncPreview()
  }

  function updateActive(props: Partial<{ scale: number; angle: number; left: number; top: number }>) {
    const canvas = fabricRef.current
    const active = canvas?.getActiveObject()
    if (!canvas || !active || !isUserObject(active)) return
    if (props.scale) active.scale(props.scale)
    if (props.angle !== undefined) active.rotate(props.angle)
    if (props.left !== undefined) active.set('left', props.left)
    if (props.top !== undefined) active.set('top', props.top)
    constrainToTeeArea(active, side)
    canvas.requestRenderAll()
    syncPreview()
  }

  function removeUpload() {
    const canvas = fabricRef.current
    if (!canvas) return
    removeUploadedPrint(canvas)
    setFileName('')
    syncPreview()
  }

  const isMobile = isMobileClient()

  function schedulePdfAndAdmin(opts: {
    cartItemId: string
    orderId: string
    pdfMeta: Parameters<typeof generateDesignPdfBundle>[0]
    printArtwork: string
    printCrop: string
    hires: string
    thumb: string
    item: {
      title: string
      size: string
      qty: number
      price: number
      color: string
    }
    artworkExport: Awaited<ReturnType<typeof exportArtworkFromFabric>> | null
    designerNotes?: string
    printTab: Window | null
  }) {
    const {
      cartItemId,
      orderId,
      pdfMeta,
      printArtwork,
      printCrop,
      hires,
      item,
      artworkExport,
      designerNotes,
      printTab,
    } = opts

    window.setTimeout(() => {
      try {
        const bundle = generateDesignPdfBundle(pdfMeta)
        stashDesignExport(cartItemId, {
          orderId: bundle.orderId,
          invoiceFileName: bundle.invoiceFileName,
          printOnlyFileName: bundle.printOnlyFileName,
          invoicePdfDataUrl: bundle.invoicePdfDataUrl,
          printOnlyPdfDataUrl: bundle.printOnlyPdfDataUrl,
          printArtworkDataUrl: printArtwork,
          mockupDataUrl: hires?.startsWith('data:') ? hires : undefined,
          meta: { ...pdfMeta, orderId: bundle.orderId },
          savedAt: new Date().toISOString(),
        })
        setAddCartModal((prev) =>
          prev?.cartItemId === cartItemId
            ? { ...prev, invoiceFileName: bundle.invoiceFileName }
            : prev,
        )
      } catch (err) {
        console.error('pdf generate failed', err)
      }

      if (!isMobile && printCrop.startsWith('data:image/')) {
        try {
          const printed = openPrintDialogForRasterDesign(printCrop, printTab)
          if (!printed && printTab) printTab.close()
        } catch {
          /* ignore */
        }
      } else if (printTab) {
        try {
          printTab.close()
        } catch {
          /* ignore */
        }
      }

      if (hires?.startsWith('data:')) {
        try {
          addUpload({
            type: 'image',
            label: fileName || `Custom design · ${color.name}`,
            url: hires,
            status: 'pending',
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            customerEmail: customerEmail.trim() || undefined,
            pdfFileName: `carpe-diem-invoice-${orderId}.pdf`,
            printArtworkUrl:
              artworkExport?.transparentPng?.startsWith('data:')
                ? artworkExport.transparentPng
                : printArtwork || undefined,
            mockupPreviewUrl: hires,
            designJson: artworkExport ? JSON.stringify(artworkExport.designJson) : undefined,
            orderId,
            printType: 'Custom print',
            color: color.name,
            size: item.size,
            quantity: item.qty,
            price: item.price,
            notes: designerNotes,
          })
        } catch (err) {
          console.error('admin upload failed', err)
        }
      }
    }, isMobile ? 400 : 120)
  }

  async function handleMobileDownloadPdf() {
    const exportId = addCartModal?.cartItemId || lastExportCartItemId
    if (!exportId) {
      alert('Add to cart first — PDF download button active hoil.')
      return
    }
    await downloadStoredInvoicePdf(exportId)
  }

  async function handleAddToCart() {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please enter your name and phone number so we can confirm your order.')
      return
    }
    if (!customerAddress.trim()) {
      alert('Please enter your full delivery address — required for shipping and the order PDF.')
      return
    }

    setCartBusy(true)
    setCartLoadingMsg('Preparing your design…')

    let printTab: Window | null = null
    if (!isMobile) {
      try {
        printTab = window.open('', '_blank', 'noopener,noreferrer,width=920,height=1200')
      } catch {
        printTab = null
      }
    }

    try {
    persistCustomer()

    try {
      upsertCustomer({
        name: customerName.trim(),
        email: customerEmail.trim(),
        phone: customerPhone.trim(),
        address: customerAddress.trim() || undefined,
      })
    } catch {
      /* ignore */
    }

    const canvas = fabricRef.current
    const activeSide = sideRef.current

    // Put typed text / emoji on canvas before export so PDF page 2 matches the design.
    if (canvas && text.trim()) {
      const hasTextOnSide = canvas
        .getObjects()
        .some(
          (o) =>
            (o as UserObject).meta === 'user-text' &&
            (!(o as UserObject).printSide || (o as UserObject).printSide === activeSide),
        )
      if (!hasTextOnSide) {
        addTextDesign(
          text,
          {
            fontFamily: font,
            fontWeight,
            fontSize,
            fill: textColor,
            angle: rotation,
          },
          false,
        )
      }
    }

    const thumb = exportThumbnail()
    const hires = exportPreview()
    const { print } = teeZone(activeSide)
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`
    const orderDate = new Date().toISOString()

    setCartLoadingMsg('Exporting artwork…')

    let artworkExport: Awaited<ReturnType<typeof exportArtworkFromFabric>> = null
    if (canvas) {
      try {
        artworkExport = await exportArtworkFromFabric(canvas, {
          printRegion: print,
          activeSide,
          teeColorHex: color.hex,
          canvasWidth: W,
          canvasHeight: H,
          multiplier: artworkExportMultiplier(),
        })
        canvas.requestRenderAll()
      } catch (e) {
        console.warn('artwork export failed', e)
      }
    }

    const printArtwork =
      artworkExport?.printSheetPng?.startsWith('data:')
        ? artworkExport.printSheetPng
        : artworkExport?.flatPrintPng?.startsWith('data:')
          ? artworkExport.flatPrintPng
          : artworkExport?.transparentPng?.startsWith('data:')
            ? artworkExport.transparentPng
            : ''
    const printCrop = printArtwork
    const unitPrice = BASE_PRICE + PRINT_CHARGE
    const cartItemId = `custom-${Date.now()}`
    const item = {
      id: cartItemId,
      slug: cartItemId,
      title: `Custom ${color.name} Tee${text ? ` · “${text}”` : ''}`,
      price: unitPrice,
      qty: quantity,
      size: 'M',
      color: color.name,
      previewImage: thumb && thumb.startsWith('data:') ? thumb : undefined,
      printAspectRatio: artworkExport?.aspectRatio ?? print.width / print.height,
      printArtworkWidthPx: artworkExport?.widthPx,
      printArtworkHeightPx: artworkExport?.heightPx,
      printWidthMm: artworkExport?.printWidthMm,
      printHeightMm: artworkExport?.printHeightMm,
    }

    let printArtworkForCart: string | undefined
    if (printArtwork.startsWith('data:')) {
      stashPrintArtworkForCartItem(cartItemId, printArtwork)
      try {
        printArtworkForCart = await compressArtworkForCartStorage(printArtwork, 1400)
      } catch {
        printArtworkForCart = printArtwork
      }
    }

    if (!printArtwork.startsWith('data:')) {
      alert(
        'Please add your design on the T-shirt first — upload a logo, add text, or place an emoji — then Add to cart.',
      )
      if (printTab) {
        try {
          printTab.close()
        } catch {
          /* ignore */
        }
      }
      return
    }

    setCartLoadingMsg('Adding to cart…')

    const pdfMeta = {
      title: item.title,
      color: item.color,
      size: item.size,
      quantity: item.qty,
      price: item.price,
      notes: text ? `Text: ${text}` : undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      customerAddress: customerAddress.trim() || undefined,
      printType: 'Custom print (DTG / transfer ready)',
      orderId,
      orderDate,
      artworkDataUrl: printArtwork,
      printWidthMm: artworkExport?.printWidthMm,
      printHeightMm: artworkExport?.printHeightMm,
      artworkWidthPx: artworkExport?.widthPx,
      artworkHeightPx: artworkExport?.heightPx,
      printAspectRatio: artworkExport?.aspectRatio ?? print.width / print.height,
      designText: text.trim() || undefined,
      mockupPreviewUrl:
        hires?.startsWith('data:') ? hires : thumb?.startsWith('data:') ? thumb : undefined,
    }

    try {
      add({
        ...item,
        orderId,
        printArtwork: printArtworkForCart,
      })
    } catch {
      try {
        add({ ...item, orderId, previewImage: undefined, printArtwork: printArtworkForCart })
      } catch {
        add({ ...item, orderId, previewImage: undefined, printArtwork: undefined })
      }
    }

    setLastExportCartItemId(cartItemId)

    await new Promise<void>((r) => {
      requestAnimationFrame(() => requestAnimationFrame(() => r()))
    })

    setAddCartModal({
      cartItemId,
      orderId,
      invoiceFileName: `carpe-diem-invoice-${orderId}.pdf`,
    })

    const designerNotes = [
      text.trim() ? `Text: ${text.trim()}` : '',
      customerAddress.trim() ? `Address: ${customerAddress.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n') || undefined

    schedulePdfAndAdmin({
      cartItemId,
      orderId,
      pdfMeta,
      printArtwork,
      printCrop,
      hires,
      thumb,
      item,
      artworkExport,
      designerNotes,
      printTab,
    })
    } catch (err) {
      console.error('add to cart failed', err)
      alert('Could not add to cart. Please try again — keep your design and tap Add to Cart once more.')
      if (printTab) {
        try {
          printTab.close()
        } catch {
          /* ignore */
        }
      }
    } finally {
      setCartBusy(false)
      setCartLoadingMsg('')
    }
  }

  /** High-res PNG for download / admin upload. */
  function exportPreview() {
    const mult = isMobileClient() ? 1 : 2
    return fabricRef.current?.toDataURL({ format: 'png', multiplier: mult }) ?? ''
  }

  /**
   * Small JPEG thumbnail safe for localStorage persistence in the cart.
   * Renders the transparent fabric canvas onto a white-backed off-screen canvas first
   * so JPEG (which has no alpha) shows the actual design instead of black.
   */
  function exportThumbnail() {
    const fabric = fabricRef.current
    if (typeof document === 'undefined' || !fabric) return ''
    try {
      const sourceEl = fabric.lowerCanvasEl as HTMLCanvasElement | undefined
      if (!sourceEl) return ''
      const targetW = 220
      const targetH = Math.round((H / W) * targetW)
      const off = document.createElement('canvas')
      off.width = targetW
      off.height = targetH
      const ctx = off.getContext('2d')
      if (!ctx) return ''
      // White paper background under transparent tee.
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, targetW, targetH)
      ctx.drawImage(sourceEl, 0, 0, sourceEl.width, sourceEl.height, 0, 0, targetW, targetH)
      return off.toDataURL('image/jpeg', 0.75)
    } catch {
      return ''
    }
  }

  const detailsFilled =
    !!customerName.trim() && !!customerPhone.trim() && !!customerAddress.trim()

  const whatsappOrderUrl = useMemo(() => {
    const unitPrice = BASE_PRICE + PRINT_CHARGE
    return buildWhatsAppOrderUrl(
      [
        {
          title: `Custom ${color.name} Tee${text ? ` · “${text}”` : ''}`,
          qty: quantity,
          price: unitPrice,
          size: 'M',
          color: color.name,
          previewImage: detailsFilled ? 'custom' : undefined,
        },
      ],
      {
        pdfFileName: addCartModal?.invoiceFileName,
        customer: detailsFilled
          ? {
              name: customerName.trim(),
              phone: customerPhone.trim(),
              email: customerEmail.trim() || undefined,
              address: customerAddress.trim(),
            }
          : undefined,
        pricing: {
          subtotal: unitPrice * quantity,
          total: total,
        },
      },
    )
  }, [
    color.name,
    text,
    quantity,
    total,
    detailsFilled,
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    addCartModal?.invoiceFileName,
  ])

  return (
    <>
    <div className="grid w-full max-w-full grid-cols-1 gap-6 pb-36 sm:gap-8 lg:gap-10 lg:pb-8 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="min-h-0 w-full max-w-full overflow-hidden rounded-[1.5rem] border border-black/5 bg-gradient-to-br from-slate-50 via-white to-slate-200 p-3 shadow-2xl dark:border-white/10 dark:from-zinc-950 dark:via-void-2 dark:to-slate-900 sm:rounded-[2.25rem] sm:p-6 md:p-8 lg:min-h-[520px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
              Live Preview Area
            </p>
            <h2 className="mt-1 font-display text-xl font-bold sm:text-2xl">T-shirt mockup preview</h2>
          </div>
          <div className="rounded-full bg-white p-1 shadow-sm dark:bg-white/10">
            {(['front', 'back'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className={`rounded-full px-5 py-2 text-sm font-bold capitalize transition ${
                  side === s ? 'bg-brand text-white shadow-glow' : 'text-slate-500 dark:text-zinc-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        {side === 'back' ? (
          <p className="mb-4 text-center text-xs text-slate-500 dark:text-zinc-400">
            Back view — design goes on the upper back (tee is mirrored from front mockup).
          </p>
        ) : null}

        <div
          ref={canvasWrapRef}
          className="group relative mx-auto flex w-full min-h-[min(72vw,380px)] max-w-full items-start justify-center overflow-hidden rounded-[1.25rem] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.96),rgba(226,232,240,0.8))] p-2 transition sm:min-h-[420px] sm:max-w-3xl sm:rounded-[2rem] sm:p-4 dark:bg-[radial-gradient(circle_at_center,rgba(39,39,42,0.8),rgba(9,9,11,0.96))]"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div
            ref={gridNoticeRef}
            className="pointer-events-none absolute left-1/2 top-6 z-20 -translate-x-1/2 rounded-full bg-sky-500 px-4 py-1.5 text-xs font-bold text-white opacity-0 shadow-glow transition-opacity"
          >
            Grid helper active · snap alignment enabled
          </div>
          <canvas ref={ref} className="relative z-10 mx-auto block max-w-full drop-shadow-2xl" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_220px]">
          <p className="rounded-2xl bg-white/70 p-4 text-sm text-slate-600 shadow-sm dark:bg-white/5 dark:text-zinc-400">
            Upload केलेला photo/logo chest area मध्ये auto-center होतो. Drag, resize, rotate करा.
            Boundary restriction आणि snap alignment print area मध्ये मदत करतात.
          </p>
          {previewUrl ? (
            <div className="rounded-2xl bg-white/80 p-3 shadow-sm dark:bg-white/5">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                HD Preview
              </p>
              {/* Data URL preview is generated locally from Fabric canvas, so next/image is not useful here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Customized T-shirt preview" className="mx-auto h-36 object-contain" />
            </div>
          ) : null}
        </div>
      </section>

      <aside className="xl:sticky xl:top-28 xl:self-start">
        <div className="rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5 md:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
              Custom Design Studio
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold">Create your premium tee</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
              Upload logo, add text, resize, rotate and preview instantly.
            </p>
          </div>

          <div className="mt-8 space-y-7">
            <section>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                T-Shirt Color Selector
              </h3>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {DESIGNER_TEE_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    title={c.name}
                    aria-pressed={colorId === c.id}
                    onClick={() => setColorId(c.id)}
                    className={`h-11 w-11 rounded-full border-2 transition ${
                      colorId === c.id
                        ? 'scale-110 border-2 border-brand shadow-[0_0_0_1px_rgba(0,0,0,0.55),0_0_0_6px_rgba(14,165,233,0.22)]'
                        : 'border-black/65 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] hover:scale-105 hover:border-black dark:border-white/55 dark:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.3)] dark:hover:border-white'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">Selected: {color.name}</p>
            </section>

            <section>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                Upload Logo
              </h3>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e: DragEvent<HTMLDivElement>) => {
                  e.preventDefault()
                  void handleFile(e.dataTransfer.files?.[0])
                }}
                className="mt-4 rounded-3xl border-2 border-dashed border-sky-300/70 bg-sky-50/70 p-6 text-center transition hover:border-brand dark:bg-sky-950/20"
              >
                <p className="text-3xl">⬆</p>
                <p className="mt-2 font-semibold">Drop your logo here or browse files</p>
                <p className="mt-1 text-xs text-slate-500">PNG / JPG / SVG supported</p>
                <input ref={fileRef} type="file" accept="image/*,.svg" onChange={onUpload} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-bold text-brand shadow-sm dark:bg-white/10"
                >
                  Browse Files
                </button>
              </div>
              {fileName ? (
                <div className="mt-3 flex items-center justify-between rounded-2xl bg-black/5 px-4 py-3 text-sm dark:bg-white/10">
                  <span className="truncate">{fileName}</span>
                  <button type="button" onClick={removeUpload} className="font-bold text-red-500">
                    Remove
                  </button>
                </div>
              ) : null}
              {uploadError ? (
                <div className="mt-3 rounded-2xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-500/30 dark:bg-red-950/30">
                  {uploadError}
                </div>
              ) : null}
            </section>

            <section>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                Add Custom Text
              </h3>
              <input
                ref={textInputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add Custom Text"
                className="mt-4 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none ring-brand/30 focus:ring-4 dark:border-white/10 dark:bg-void-3"
              />
              <p className="mt-2 text-xs text-slate-500">Emoji टॅप करा किंवा टाइप करा</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {TEXT_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    title={`Add ${emoji}`}
                    onClick={() => insertEmoji(emoji)}
                    className="flex h-9 min-w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-lg transition hover:scale-110 hover:border-brand hover:bg-sky-50 dark:border-white/10 dark:bg-void-3 dark:hover:bg-sky-950/40"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {text.trim() ? (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Suggested text designs
                  </p>
                  <p className="mt-1 text-[11px] text-brand">
                    {getCategoryLabel(textCategory)} — based on “{text.trim()}”
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {textSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => {
                          setText(suggestion.text)
                          addTextDesign(suggestion.text, suggestion.design, true)
                        }}
                        className="group overflow-hidden rounded-2xl border border-black/10 bg-slate-950 p-3 text-left transition hover:-translate-y-0.5 hover:border-brand hover:shadow-glow dark:border-white/10"
                      >
                        <div className="flex min-h-20 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-black px-2">
                          <span
                            className="text-center leading-tight"
                            style={{
                              color: suggestion.design.fill,
                              fontFamily: suggestion.design.fontFamily,
                              fontWeight: suggestion.design.fontWeight,
                              fontSize: Math.min(suggestion.design.fontSize, 22),
                              letterSpacing: suggestion.design.letterSpacing
                                ? '0.12em'
                                : undefined,
                              transform: `rotate(${suggestion.design.angle}deg)`,
                            }}
                          >
                            {suggestion.design.prefix ?? ''}
                            {suggestion.text}
                            {suggestion.design.suffix ?? ''}
                          </span>
                        </div>
                        <span className="mt-2 block text-xs font-bold text-white">
                          {suggestion.label}
                        </span>
                        <span className="text-[10px] text-slate-400">Tap to apply on T-shirt</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {text.trim() ? (
                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Text वरून image generate करा
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {getCategoryLabel(textCategory)} themes shown first
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {sortedImageThemes.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => void applyGeneratedImage(theme)}
                        className="overflow-hidden rounded-2xl border border-black/10 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-glow dark:border-white/10"
                      >
                        <div
                          className="flex min-h-24 flex-col items-center justify-center px-3 text-center text-white"
                          style={{
                            background: `linear-gradient(135deg, ${theme.bg[0]}, ${theme.bg[1]})`,
                          }}
                        >
                          <span className="text-2xl">{theme.emoji}</span>
                          <span className="mt-1 font-display text-lg font-black leading-tight">
                            {(
                              textSuggestions.find((s) => s.category === theme.id)?.text ??
                              textSuggestions[0]?.text ??
                              text
                            ).toUpperCase()}
                          </span>
                        </div>
                        <div className="bg-white p-3 dark:bg-void-3">
                          <p className="text-xs font-bold">{theme.name}</p>
                          <p className="text-[10px] text-slate-500">Generate image & apply</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <select
                  value={font}
                  onChange={(e) => {
                    const next = e.target.value
                    setFont(next)
                    const apply = () => updateSelectedText({ fontFamily: next })
                    if (typeof document !== 'undefined' && 'fonts' in document) {
                      document.fonts.load(`24px "${next}"`).then(apply).catch(apply)
                    } else {
                      apply()
                    }
                  }}
                  style={{ fontFamily: `"${font}", sans-serif` }}
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-void-3"
                >
                  {FONTS.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: `"${f}", sans-serif` }}>
                      {f}
                    </option>
                  ))}
                </select>
                <select
                  value={fontWeight}
                  onChange={(e) => {
                    setFontWeight(e.target.value)
                    updateSelectedText({ fontWeight: e.target.value })
                  }}
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-void-3"
                >
                  {WEIGHTS.map((w) => (
                    <option key={w} value={w}>
                      Weight {w}
                    </option>
                  ))}
                </select>
              </div>
              <label className="mt-4 block text-xs font-semibold text-slate-500">
                Font size: {fontSize}px
              </label>
              <input
                type="range"
                min={16}
                max={54}
                value={fontSize}
                onChange={(e) => {
                  const next = Number(e.target.value)
                  setFontSize(next)
                  updateSelectedText({ fontSize: next })
                }}
                className="w-full"
              />
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Font color presets
                </p>
                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {TEXT_COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      title={c}
                      onClick={() => {
                        setTextColor(c)
                        updateSelectedText({ fill: c })
                      }}
                      className={`h-9 rounded-full border-2 transition hover:scale-105 ${
                        textColor === c ? 'border-brand shadow-[0_0_0_4px_rgba(14,165,233,0.16)]' : 'border-white'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-[1fr_72px] gap-3">
                <label className="flex items-center rounded-2xl border border-black/10 px-4 py-3 text-sm dark:border-white/10">
                  <input type="checkbox" className="mr-2" /> Curve text
                </label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value)
                    updateSelectedText({ fill: e.target.value })
                  }}
                  className="h-full min-h-12 w-full cursor-pointer rounded-2xl"
                  title="Text color"
                />
              </div>
              <button
                type="button"
                onClick={addText}
                className="mt-4 w-full rounded-full bg-brand py-3 text-sm font-bold text-white transition hover:scale-[1.01]"
              >
                Add Text to T-shirt
              </button>
            </section>

            <section>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                Print Settings
              </h3>
              <label className="mt-4 block text-xs font-semibold text-slate-500">
                Rotation: {rotation}°
              </label>
              <input
                type="range"
                min={-45}
                max={45}
                value={rotation}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setRotation(val)
                  updateActive({ angle: val })
                }}
                className="w-full"
              />
            </section>

            <section className="rounded-3xl bg-slate-950 p-5 text-white">
              <h3 className="font-display text-xl font-bold">Live Price</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <div className="flex justify-between"><span>Base price</span><span>₹{BASE_PRICE}</span></div>
                <div className="flex justify-between"><span>Printing charge</span><span>₹{PRINT_CHARGE}</span></div>
                <div className="flex items-center justify-between">
                  <span>Quantity</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-8 w-8 rounded-full bg-white/10">−</button>
                    <span className="w-8 text-center font-bold text-white">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(quantity + 1)} className="h-8 w-8 rounded-full bg-white/10">+</button>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-between border-t border-white/10 pt-4 font-display text-2xl font-bold">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                Your details
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Naav, phone ani <strong className="font-semibold text-slate-600">delivery patta</strong>{' '}
                — order confirm ani ship sathi lagto.
              </p>
              <div className="mt-3 space-y-2">
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  onBlur={persistCustomer}
                  placeholder="Full name *"
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none ring-brand/30 focus:ring-4 dark:border-white/10 dark:bg-void-3"
                />
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  onBlur={persistCustomer}
                  type="tel"
                  inputMode="tel"
                  placeholder="Phone number *"
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none ring-brand/30 focus:ring-4 dark:border-white/10 dark:bg-void-3"
                />
                <input
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  onBlur={persistCustomer}
                  type="email"
                  placeholder="Email (optional)"
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none ring-brand/30 focus:ring-4 dark:border-white/10 dark:bg-void-3"
                />
                <textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  onBlur={persistCustomer}
                  placeholder="Full delivery address *"
                  rows={3}
                  required
                  className="w-full resize-y rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none ring-brand/30 focus:ring-4 dark:border-white/10 dark:bg-void-3"
                />
              </div>
              {detailsFilled ? (
                <PdfWhatsAppHint
                  variant="details"
                  message={DETAILS_FILLED_PDF_HINT}
                  className="mt-4"
                />
              ) : null}
            </section>

            <section className="space-y-3">
              <button
                type="button"
                disabled={cartBusy}
                onClick={() => void handleAddToCart()}
                className="hidden w-full rounded-full bg-gradient-to-r from-sky-500 to-blue-700 py-4 text-sm font-bold text-white shadow-glow transition hover:scale-[1.01] disabled:opacity-60 lg:block"
              >
                {cartBusy ? 'Saving design & PDF…' : 'Add to Cart'}
              </button>
              <a
                href={exportPreview()}
                download="carpe-diem-design.png"
                className="block w-full rounded-full border border-brand py-4 text-center text-sm font-bold text-brand transition hover:bg-brand hover:text-white"
              >
                Download HD Preview
              </a>
              <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-full bg-[#25D366] py-4 text-center text-sm font-bold text-white transition hover:scale-[1.01]"
              >
                Order on WhatsApp
              </a>
              {detailsFilled ? (
                <p className="text-center text-[11px] font-medium leading-relaxed text-amber-700 dark:text-amber-300">
                  WhatsApp वर order करताना Chrome मधील PDF 📎 attach करा
                </p>
              ) : null}
            </section>
          </div>
        </div>
      </aside>
    </div>

    {cartBusy ? <AddToCartLoadingOverlay message={cartLoadingMsg || undefined} /> : null}

    <DesignMobileActionBar
      cartBusy={cartBusy}
      hasSavedExport={!!(addCartModal?.cartItemId || lastExportCartItemId)}
      onAddToCart={() => void handleAddToCart()}
      onDownloadPdf={() => void handleMobileDownloadPdf()}
      whatsappHref={whatsappOrderUrl}
    />

    {addCartModal ? (
      <AddToCartSuccessModal
        cartItemId={addCartModal.cartItemId}
        orderId={addCartModal.orderId}
        invoiceFileName={addCartModal.invoiceFileName}
        onClose={() => setAddCartModal(null)}
      />
    ) : null}
    </>
  )
}
