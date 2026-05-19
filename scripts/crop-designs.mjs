import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const SRC =
  'C:/Users/DELL/.cursor/projects/e-software-tshirt-printing/assets/c__Users_DELL_AppData_Roaming_Cursor_User_workspaceStorage_f6d7c9aabcecf69d0be5446945695cc7_images_ChatGPT_Image_May_19__2026__04_39_03_PM-63037f3b-9bcd-4eba-8f7a-77d53db5ead2.png'

const OUT_ROOT = path.resolve('public/designs')

const COLS = 5
const SRC_W = 1024

// Each cell width
const CELL_W = Math.floor(SRC_W / COLS) // ~204

// Hand-tuned vertical bounds so the small "Women Design X" / "Couple Design X"
// caption text under each tee does NOT bleed into the cropped product image.
const ROW_BOUNDS = [
  { top: 8, height: 280 }, // Row 1 — Women designs
  { top: 355, height: 240 }, // Row 2 — Couple designs (skips past row-1 captions, ends before row-2 label)
]

// Horizontal inset to drop the seam between cells (and any tiny bleed from neighbor)
const INSET_X = 10

const SIZE = 800 // final square size

async function run() {
  await mkdir(path.join(OUT_ROOT, 'women'), { recursive: true })
  await mkdir(path.join(OUT_ROOT, 'couple'), { recursive: true })

  for (let row = 0; row < ROW_BOUNDS.length; row++) {
    const { top, height } = ROW_BOUNDS[row]
    for (let col = 0; col < COLS; col++) {
      const left = col * CELL_W + INSET_X
      const width = CELL_W - INSET_X * 2

      const folder = row === 0 ? 'women' : 'couple'
      const file = `${folder}-${col + 1}.png`
      const outPath = path.join(OUT_ROOT, folder, file)

      await sharp(SRC)
        .extract({ left, top, width, height })
        .resize({
          width: SIZE,
          height: SIZE,
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .png({ quality: 92, compressionLevel: 9 })
        .toFile(outPath)

      console.log(`✓ ${path.relative(process.cwd(), outPath)}`)
    }
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
